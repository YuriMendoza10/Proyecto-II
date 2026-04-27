# corregir_contraseñas.py
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models.db_models import Usuario
from auth import get_password_hash, verify_password

db = SessionLocal()

print("="*50)
print("CORRIGIENDO CONTRASEÑAS")
print("="*50)

# Lista de usuarios con sus contraseñas correctas
usuarios_corregir = [
    {"email": "estudiante1@uni.edu", "password": "est123"},
    {"email": "estudiante2@uni.edu", "password": "est123"},
    {"email": "estudiante3@uni.edu", "password": "est123"},
    {"email": "admin@uni.edu", "password": "admin123"},
    {"email": "coord.sistemas@uni.edu", "password": "coord123"},
    {"email": "docente1@uni.edu", "password": "doc123"},
]

for item in usuarios_corregir:
    usuario = db.query(Usuario).filter(Usuario.email == item["email"]).first()
    if usuario:
        # Actualizar contraseña
        usuario.hashed_password = get_password_hash(item["password"])
        print(f"✅ Actualizada contraseña para: {item['email']} -> {item['password']}")
        
        # Verificar que funciona
        if verify_password(item["password"], usuario.hashed_password):
            print(f"   ✓ Verificación exitosa")
        else:
            print(f"   ✗ Error en verificación")
    else:
        print(f"❌ Usuario no encontrado: {item['email']}")

db.commit()
db.close()

print("\n✅ Script completado")