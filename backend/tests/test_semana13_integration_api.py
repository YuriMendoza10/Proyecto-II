from fastapi import HTTPException, status
from fastapi.testclient import TestClient

from app.api.v1.endpoints import auth as auth_endpoint
from app.main import app
from app.services.auth_service import AuthService


def test_docs_endpoint_responds_200():
    client = TestClient(app)

    response = client.get("/docs")

    assert response.status_code == 200


def test_root_endpoint_responds_without_database():
    client = TestClient(app)

    response = client.get("/")

    assert response.status_code == 200
    assert response.json()["status"] == "running"


def test_invalid_login_returns_controlled_error(monkeypatch):
    def fake_get_db():
        yield object()

    def fake_authenticate_user(self, email, password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales invalidas",
        )

    app.dependency_overrides[auth_endpoint.get_db] = fake_get_db
    monkeypatch.setattr(AuthService, "authenticate_user", fake_authenticate_user)

    try:
        client = TestClient(app)
        response = client.post(
            "/api/v1/auth/login",
            data={"username": "no-existe@example.com", "password": "incorrecta"},
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 401
    assert response.json()["detail"] == "Credenciales invalidas"


def test_protected_route_without_token_is_blocked():
    client = TestClient(app)

    response = client.get("/api/v1/users")

    assert response.status_code in (401, 403)


def test_environmental_summary_without_token_does_not_return_500():
    client = TestClient(app)

    response = client.get("/api/v1/environmental-impact/summary")

    assert response.status_code in (401, 403)


def test_student_academic_history_page_without_token_does_not_return_500():
    client = TestClient(app)

    response = client.get("/api/v1/student-academic-history/page")

    assert response.status_code in (401, 403)
