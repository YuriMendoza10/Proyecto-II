import os
import sys

import pytest
from fastapi.testclient import TestClient


BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

os.environ["DEBUG"] = "false"

from app.main import app  # noqa: E402


@pytest.fixture
def client():
    """Cliente de pruebas para la app FastAPI actual."""
    return TestClient(app)


@pytest.fixture
def auth_token():
    """Token opcional para pruebas que usan credenciales demo por entorno."""
    email = os.getenv("TEST_ADMIN_EMAIL")
    password = os.getenv("TEST_ADMIN_PASSWORD")
    if not email or not password:
        pytest.skip("Requiere TEST_ADMIN_EMAIL y TEST_ADMIN_PASSWORD.")

    with TestClient(app) as test_client:
        response = test_client.post(
            "/api/v1/auth/login",
            data={"username": email, "password": password},
        )
    if response.status_code != 200:
        pytest.skip("No se pudo obtener token con credenciales TEST_ADMIN_*.")
    return response.json()["access_token"]
