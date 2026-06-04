from fastapi.testclient import TestClient

import app.core.rate_limit as rate_limit_module
from app.core.app import create_app
from app.database.session import get_db


class DummyDb:
    class _Query:
        def filter(self, *_args, **_kwargs):
            return self

        def first(self):
            return None

    def get(self, *_args, **_kwargs):
        return None

    def query(self, *_args, **_kwargs):
        return self._Query()


def override_get_db():
    yield DummyDb()


def test_auth_me_requires_token() -> None:
    client = TestClient(create_app())
    client.app.dependency_overrides[get_db] = override_get_db

    response = client.get("/api/v1/auth/me")

    assert response.status_code == 401


def test_auth_login_includes_cors_headers() -> None:
    client = TestClient(create_app())
    client.app.dependency_overrides[get_db] = override_get_db
    original_get_redis_client = rate_limit_module.get_redis_client
    rate_limit_module.get_redis_client = lambda: None

    try:
        response = client.post(
            "/api/v1/auth/login",
            headers={"Origin": "http://localhost:3000"},
            json={"email": "test@example.com", "password": "password123"},
        )
    finally:
        rate_limit_module.get_redis_client = original_get_redis_client

    assert response.status_code == 401
    assert response.headers.get("access-control-allow-origin") == "http://localhost:3000"
