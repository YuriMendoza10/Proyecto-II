# ver_usuarios_bd.py
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models.db_models import Usuario
from auth import verify_password

db = SessionLocal()

print("="*50)
print("USUARIOS EN BASE DE DATOS")
print("="*50)

usuarios = db.query(Usuario).all()
for u in usuarios:
    print(f"\n📧 {u.email}")
    print(f"   ID: {u.id}")
    print(f"   Nombre: {u.nombre} {u.apellido}")
    print(f"   Rol: {u.rol}")
    print(f"   Activo: {u.activo}")

db.close()