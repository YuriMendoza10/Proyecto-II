# D:\TALLER 2\optiacademic\backend\tests\test_api.py
import pytest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

class TestAPI:
    """Pruebas TDD para los endpoints de la API"""
    
    def test_login_endpoint_exitoso(self):
        """TC-API-01: Login debe retornar token con credenciales correctas"""
        response = client.post(
            "/api/v1/login",
            data={"username": "estudiante1@uni.edu", "password": "est123"}
        )
        
        assert response.status_code == 200
        assert "access_token" in response.json()
        assert response.json()["token_type"] == "bearer"
    
    def test_login_endpoint_fallido(self):
        """TC-API-02: Login debe fallar con credenciales incorrectas"""
        response = client.post(
            "/api/v1/login",
            data={"username": "estudiante1@uni.edu", "password": "wrong"}
        )
        
        assert response.status_code == 401
    
    def test_health_endpoint(self):
        """TC-API-05: Health check debe funcionar sin autenticación"""
        response = client.get("/health")
        
        assert response.status_code == 200
        assert response.json()["status"] == "ok"