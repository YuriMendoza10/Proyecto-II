# D:\TALLER 2\optiacademic\backend\tests\conftest.py
import sys
import os

# Agregar el directorio backend al path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from fastapi.testclient import TestClient
from database import SessionLocal
from main import app

@pytest.fixture
def db_session():
    """Fixture para la sesión de base de datos"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture
def client():
    """Fixture para el cliente de pruebas de FastAPI"""
    return TestClient(app)

@pytest.fixture
def auth_token(client):
    """Fixture para obtener token de autenticación"""
    response = client.post(
        "/api/v1/login",
        data={"username": "admin@uni.edu", "password": "admin123"}
    )
    return response.json()["access_token"]