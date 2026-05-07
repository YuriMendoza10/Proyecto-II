# D:\TALLER 2\optiacademic\backend\verificar_reset.py
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models.db_models import Usuario
from auth import verify_password

db = SessionLocal()

# Buscar al estudiante
estudiante = db.query(Usuario).filter(Usuario.email == "estudiante1@uni.edu").first()

if estudiante:
    print(f"✅ Usuario encontrado: {estudiante.email}")
    print(f"   Rol: {estudiante.rol}")
    print(f"   Activo: {estudiante.activo}")
    
    # Verificar si la contraseña es la original
    if verify_password("est123", estudiante.hashed_password):
        print("   Contraseña actual: est123 (original)")
    elif verify_password("nueva123", estudiante.hashed_password):
        print("   Contraseña actual: nueva123")
    else:
        print("   Contraseña actual: DESCONOCIDA - ha cambiado pero no coincide con las esperadas")
else:
    print("❌ Usuario no encontrado")

db.close()