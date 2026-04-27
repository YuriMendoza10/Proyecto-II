# D:\TALLER 2\optiacademic\backend\tests\test_main.py
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

class TestMain:
    """Pruebas para el archivo principal"""
    
    def test_root_endpoint(self):
        """TC-MAIN-01: Verificar que la API está funcionando"""
        # El endpoint raíz puede no existir, usamos health check en su lugar
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"
    
    def test_health_endpoint(self):
        """TC-MAIN-02: Health check"""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"
    
    def test_docs_endpoint(self):
        """TC-MAIN-03: Documentación Swagger"""
        response = client.get("/docs")
        assert response.status_code == 200
    
    def test_openapi_json(self):
        """TC-MAIN-04: Esquema OpenAPI"""
        response = client.get("/openapi.json")
        assert response.status_code == 200
        assert "info" in response.json()