from fastapi.testclient import TestClient

from app.core.app import create_app
from app.database.session import get_db


class DummyDb:
    def get(self, *_args, **_kwargs):
        return None


def override_get_db():
    yield DummyDb()


def test_auth_me_requires_token() -> None:
    client = TestClient(create_app())
    client.app.dependency_overrides[get_db] = override_get_db

    response = client.get("/api/v1/auth/me")

    assert response.status_code == 401
