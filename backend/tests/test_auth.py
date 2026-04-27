# D:\TALLER 2\optiacademic\backend\tests\test_auth.py
import pytest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from auth import authenticate_user, get_password_hash, verify_password, create_access_token
from datetime import timedelta

class TestAutenticacion:
    """Pruebas TDD para el sistema de autenticación"""
    
    def test_login_estudiante_exitoso(self, db_session):
        """TC-AUTH-01: Estudiante debe poder iniciar sesión con credenciales correctas"""
        user = authenticate_user(db_session, "estudiante1@uni.edu", "est123")
        assert user is not None
        assert user.email == "estudiante1@uni.edu"
        assert user.rol == "estudiante"
    
    def test_login_admin_exitoso(self, db_session):
        """TC-AUTH-02: Admin debe poder iniciar sesión con credenciales correctas"""
        user = authenticate_user(db_session, "admin@uni.edu", "admin123")
        assert user is not None
        assert user.email == "admin@uni.edu"
        assert user.rol == "admin"
    
    def test_login_contrasena_incorrecta(self, db_session):
        """TC-AUTH-05: Debe fallar con contraseña incorrecta"""
        user = authenticate_user(db_session, "estudiante1@uni.edu", "wrongpassword")
        assert user is None
    
    def test_verificar_password(self):
        """TC-AUTH-07: Verificación de contraseña debe funcionar"""
        password = "miPassword123"
        hashed = get_password_hash(password)
        assert verify_password(password, hashed) is True
        assert verify_password("wrong", hashed) is False
    
    def test_crear_token_jwt(self):
        """TC-AUTH-08: Creación de token JWT debe ser exitosa"""
        token = create_access_token(
            data={"sub": "test@uni.edu", "rol": "estudiante"},
            expires_delta=timedelta(minutes=30)
        )
        assert token is not None
        assert isinstance(token, str)
        assert len(token) > 20