# test_login.py
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from auth import authenticate_user

db = SessionLocal()

# Probar login con estudiante
email = "estudiante1@uni.edu"
password = "est123"

user = authenticate_user(db, email, password)

if user:
    print(f"✅ Login exitoso para {email}")
    print(f"   ID: {user.id}")
    print(f"   Nombre: {user.nombre} {user.apellido}")
    print(f"   Rol: {user.rol}")
else:
    print(f"❌ Login fallido para {email}")
    print("   Verifica que el usuario existe y la contraseña es correcta")

db.close()