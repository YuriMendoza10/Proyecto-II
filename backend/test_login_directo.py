# test_login_directo.py
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from auth import authenticate_user

db = SessionLocal()

# Probar diferentes credenciales
pruebas = [
    ("estudiante1@uni.edu", "est123"),
    ("estudiante1@uni.edu", "123456"),
    ("admin@uni.edu", "admin123"),
]

for email, password in pruebas:
    user = authenticate_user(db, email, password)
    if user:
        print(f"✅ {email} -> Login exitoso")
    else:
        print(f"❌ {email} -> Login fallido (contraseña: {password})")


db.close()