# D:\TALLER 2\optiacademic\backend\fix_estudiantes.py
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models.db_models import Usuario
from auth import get_password_hash

db = SessionLocal()

print("="*50)
print("VERIFICANDO USUARIOS EN LA BASE DE DATOS")
print("="*50)

# Ver todos los usuarios existentes
usuarios = db.query(Usuario).all()
print(f"\n📋 Usuarios encontrados: {len(usuarios)}")
for u in usuarios:
    print(f"   - {u.email} | Rol: {u.rol} | Nombre: {u.nombre}")

# Crear estudiantes si no existen
estudiantes_necesarios = [
    {"email": "estudiante1@uni.edu", "password": "est123", "nombre": "Carlos", "apellido": "Alvarez"},
    {"email": "estudiante2@uni.edu", "password": "est123", "nombre": "María", "apellido": "Fernández"},
    {"email": "estudiante3@uni.edu", "password": "est123", "nombre": "José", "apellido": "Ramírez"},
]

print("\n" + "="*50)
print("CREANDO ESTUDIANTES FALTANTES")
print("="*50)

creados = 0
for est in estudiantes_necesarios:
    existe = db.query(Usuario).filter(Usuario.email == est["email"]).first()
    if not existe:
        nuevo = Usuario(
            email=est["email"],
            hashed_password=get_password_hash(est["password"]),
            nombre=est["nombre"],
            apellido=est["apellido"],
            rol="estudiante",
            activo=True
        )
        db.add(nuevo)
        creados += 1
        print(f"✅ Creado: {est['email']} / {est['password']}")
    else:
        print(f"⚠️ Ya existe: {est['email']}")

db.commit()

print(f"\n📊 Resumen: {creados} estudiantes creados")

# Verificar nuevamente
print("\n" + "="*50)
print("USUARIOS ACTUALIZADOS")
print("="*50)
usuarios = db.query(Usuario).all()
for u in usuarios:
    print(f"   - {u.email} | Rol: {u.rol} | Nombre: {u.nombre}")

db.close()

print("\n✅ Script completado")
print("\n🔐 Credenciales de prueba:")
print("   Estudiante 1: estudiante1@uni.edu / est123")
print("   Estudiante 2: estudiante2@uni.edu / est123")
print("   Estudiante 3: estudiante3@uni.edu / est123")
print("   Admin: admin@uni.edu / admin123")