# D:\TALLER 2\optiacademic\backend\tests\test_auth_advanced.py
import pytest
from jose import jwt
from auth import create_access_token, SECRET_KEY, ALGORITHM

class TestAuthAdvanced:
    """Pruebas avanzadas de autenticación"""
    
    def test_token_contains_correct_data(self):
        """TC-AUTH-09: Token JWT contiene los datos correctos"""
        token = create_access_token(data={"sub": "test@uni.edu", "rol": "estudiante"})
        # Usar la misma clave secreta que en auth.py
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        assert payload["sub"] == "test@uni.edu"
        assert payload["rol"] == "estudiante"
    
    def test_token_expiration(self):
        """TC-AUTH-10: Token tiene tiempo de expiración"""
        from datetime import timedelta
        token = create_access_token(
            data={"sub": "test@uni.edu"},
            expires_delta=timedelta(minutes=1)
        )
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        assert "exp" in payload