from types import SimpleNamespace
from uuid import uuid4

import app.auth.services as auth_services
import app.core.rate_limit as rate_limit_module
from app.core.rate_limit import enforce_rate_limit
from fastapi import HTTPException
from redis.exceptions import ConnectionError as RedisConnectionError


class FakeResponse:
    def __init__(self) -> None:
        self.cookies: dict[str, str] = {}
        self.deleted: list[str] = []

    def set_cookie(self, key, value, **_kwargs):
        self.cookies[key] = value

    def delete_cookie(self, key, **_kwargs):
        self.deleted.append(key)


class FakeQuery:
    def __init__(self, session):
        self.session = session

    def filter(self, *_args, **_kwargs):
        return self

    def first(self):
        return self.session.query_result


class FakeSession:
    def __init__(self):
        self.added = None
        self.committed = False
        self.query_result = None
        self.user_result = None

    def add(self, item):
        self.added = item

    def commit(self):
        self.committed = True

    def refresh(self, _item):
        return None

    def query(self, *_args, **_kwargs):
        return FakeQuery(self)

    def get(self, *_args, **_kwargs):
        return self.user_result


def test_issue_auth_response_sets_refresh_cookie() -> None:
    session = FakeSession()
    response = FakeResponse()
    user = SimpleNamespace(id=uuid4())

    payload = auth_services.issue_auth_response(session, user, None, response)

    assert "access_token" in payload
    assert auth_services.REFRESH_COOKIE_NAME in response.cookies
    assert session.added is not None
    assert session.committed is True


def test_refresh_auth_session_rotates_refresh_cookie(monkeypatch) -> None:
    session = FakeSession()
    response = FakeResponse()
    user = SimpleNamespace(id=uuid4())
    session.user_result = user
    session.query_result = SimpleNamespace(
        user_id=user.id,
        revoked_at=None,
        expires_at=auth_services.datetime.now(auth_services.UTC) + auth_services.timedelta(days=1),
    )
    request = SimpleNamespace(
        cookies={auth_services.REFRESH_COOKIE_NAME: "refresh-token"},
        client=SimpleNamespace(host="127.0.0.1"),
        headers={"user-agent": "pytest"},
    )

    monkeypatch.setattr(auth_services, "_get_refresh_session", lambda *_args, **_kwargs: session.query_result)

    refreshed_user, access_token = auth_services.refresh_auth_session(session, request, response)

    assert refreshed_user is user
    assert isinstance(access_token, str)
    assert auth_services.REFRESH_COOKIE_NAME in response.cookies
    assert session.committed is True


def test_revoke_refresh_session_clears_cookie() -> None:
    session = FakeSession()
    response = FakeResponse()
    request = SimpleNamespace(
        cookies={auth_services.REFRESH_COOKIE_NAME: "refresh-token"},
        client=SimpleNamespace(host="127.0.0.1"),
        headers={"user-agent": "pytest"},
    )

    auth_services.revoke_refresh_session(session, request, response)

    assert auth_services.REFRESH_COOKIE_NAME in response.deleted


def test_confirm_password_reset_token_updates_user_password(monkeypatch) -> None:
    session = FakeSession()
    user = SimpleNamespace(id=uuid4(), hashed_password="old")
    session.user_result = user
    session.query_result = SimpleNamespace(
        user_id=user.id,
        consumed_at=None,
        expires_at=auth_services.datetime.now(auth_services.UTC) + auth_services.timedelta(minutes=5),
    )

    monkeypatch.setattr(auth_services, "hash_token", lambda token: token)

    def fake_query(*_args, **_kwargs):
        return FakeQuery(session)

    session.query = fake_query  # type: ignore[assignment]

    auth_services.confirm_password_reset_token(
        session,
        SimpleNamespace(token="token", new_password="newpassword123"),
    )

    assert user.hashed_password != "old"
    assert session.query_result.consumed_at is not None


def test_enforce_rate_limit_blocks_after_limit() -> None:
    scope = "login"
    identifier = f"{uuid4()}:tester@example.com"

    original_get_redis_client = rate_limit_module.get_redis_client
    rate_limit_module.get_redis_client = lambda: None
    try:
        enforce_rate_limit(scope, identifier, limit=2, window_seconds=60)
        enforce_rate_limit(scope, identifier, limit=2, window_seconds=60)

        enforce_rate_limit(scope, identifier, limit=2, window_seconds=60)
        raise AssertionError("Expected a rate limit error")
    except HTTPException as exc:
        assert exc.status_code == 429
    finally:
        rate_limit_module.get_redis_client = original_get_redis_client


def test_enforce_rate_limit_falls_back_when_redis_unavailable() -> None:
    scope = "login"
    identifier = f"{uuid4()}:fallback@example.com"

    class BrokenRedis:
        def incr(self, *_args, **_kwargs):
            raise RedisConnectionError("redis down")

    original_get_redis_client = rate_limit_module.get_redis_client
    rate_limit_module.get_redis_client = lambda: BrokenRedis()
    try:
        enforce_rate_limit(scope, identifier, limit=2, window_seconds=60)
    finally:
        rate_limit_module.get_redis_client = original_get_redis_client
