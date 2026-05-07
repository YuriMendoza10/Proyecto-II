# D:\TALLER 2\optiacademic\backend\generar_horarios_rapido.py
import sys
import os
import requests
import json

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models.db_models import CursoDB, Docente, Aula

print("="*60)
print("🚀 GENERANDO HORARIOS DESDE CONSOLA")
print("="*60)

db = SessionLocal()

# 1. Obtener datos
cursos = db.query(CursoDB).all()
docentes = db.query(Docente).all()
aulas = db.query(Aula).all()

if not cursos:
    print("❌ No hay cursos en la base de datos")
    db.close()
    exit()

print(f"📚 Cursos: {len(cursos)}")
print(f"👨‍🏫 Docentes: {len(docentes)}")
print(f"🏫 Aulas: {len(aulas)}")

# 2. Preparar payload para el endpoint /generar
payload = {
    "cursos": [
        {
            "id": c.codigo,
            "nombre": c.nombre,
            "docente_id": next((d.codigo for d in docentes if d.id == c.docente_id), "DOC001"),
            "max_estudiantes": c.max_estudiantes,
            "tipo": c.tipo,
            "semestre": c.semestre
        }
        for c in cursos[:20]  # Primeros 20 cursos
    ],
    "aulas": [
        {"id": a.codigo, "capacidad": a.capacidad, "tipo": a.tipo, "recursos": []}
        for a in aulas[:10]
    ],
    "docentes": [
        {"id": d.codigo, "nombre": f"{d.nombre} {d.apellido}", "disponibilidad": []}
        for d in docentes[:10]
    ]
}

print("\n⚙️ Enviando a CSP...")

# 3. Llamar al endpoint (necesitas estar logueado)
# Primero obtener token
login_data = {"username": "admin@uni.edu", "password": "admin123"}
login_res = requests.post("http://localhost:8000/api/v1/login", data=login_data)
token = login_res.json().get("access_token")

if not token:
    print("❌ Error de autenticación")
    db.close()
    exit()

headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

# Generar horario
response = requests.post(
    "http://localhost:8000/api/v1/generar",
    json=payload,
    headers=headers
)

if response.status_code == 200:
    resultado = response.json()
    print(f"\n✅ Horario generado: {len(resultado['horario_generado'])} asignaciones")
else:
    print(f"❌ Error: {response.status_code} - {response.text}")

db.close()