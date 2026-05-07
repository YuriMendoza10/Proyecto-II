# D:\TALLER 2\optiacademic\backend\diagnostico_backend.py
import sys
import os
import requests
import json
from datetime import datetime

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models.db_models import Usuario, CursoDB, Docente, Aula, HorarioGenerado, Matricula
from sqlalchemy import text

print("="*70)
print("🔍 DIAGNÓSTICO COMPLETO DEL BACKEND")
print(f"📅 Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print("="*70)

# ========== 1. VERIFICAR BASE DE DATOS ==========
print("\n📊 1. BASE DE DATOS")
print("-"*50)

db = SessionLocal()

try:
    # Probar conexión
    result = db.execute(text("SELECT 1"))
    print("   ✅ Conexión a MySQL: OK")
    
    # Contar registros
    print(f"\n   📈 REGISTROS EN TABLAS:")
    print(f"      Usuarios:      {db.query(Usuario).count()}")
    print(f"      Cursos:        {db.query(CursoDB).count()}")
    print(f"      Docentes:      {db.query(Docente).count()}")
    print(f"      Aulas:         {db.query(Aula).count()}")
    print(f"      Horarios:      {db.query(HorarioGenerado).count()}")
    print(f"      Matrículas:    {db.query(Matricula).count()}")
    
except Exception as e:
    print(f"   ❌ Error conexión BD: {e}")

# ========== 2. VERIFICAR ENDPOINTS ==========
print("\n🌐 2. ENDPOINTS DE LA API")
print("-"*50)

# Obtener token de admin
try:
    login_res = requests.post(
        "http://localhost:8000/api/v1/login",
        data={"username": "admin@uni.edu", "password": "admin123"}
    )
    if login_res.status_code == 200:
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("   ✅ Login admin: OK")
    else:
        token = None
        headers = {}
        print(f"   ❌ Login admin: {login_res.status_code}")
except Exception as e:
    token = None
    headers = {}
    print(f"   ❌ Error login: {e}")

# Probar endpoints
endpoints = [
    ("GET", "/health", None),
    ("GET", "/api/v1/cursos", None),
    ("GET", "/api/v1/docentes", None),
    ("GET", "/api/v1/aulas", None),
    ("GET", "/api/v1/mi-horario", headers),
    ("GET", "/api/v1/horarios-disponibles", headers),
]

for method, endpoint, custom_headers in endpoints:
    try:
        if method == "GET":
            res = requests.get(f"http://localhost:8000{endpoint}", headers=custom_headers or {})
        print(f"   {method} {endpoint}: {res.status_code}")
    except Exception as e:
        print(f"   ❌ {endpoint}: {e}")

# ========== 3. VERIFICAR CONFLICTOS DE HORARIO ==========
print("\n⚠️ 3. CONFLICTOS DE HORARIO")
print("-"*50)

horarios = db.query(HorarioGenerado).all()
conflictos = []
horarios_dict = {}

for h in horarios:
    key = f"{h.franja}_{h.docente_id}"
    if key in horarios_dict:
        conflictos.append(key)
    else:
        horarios_dict[key] = True

print(f"   Total horarios: {len(horarios)}")
print(f"   Conflictos: {len(conflictos)}")

# ========== 4. VERIFICAR MATRÍCULAS ==========
print("\n📋 4. MATRÍCULAS")
print("-"*50)

matriculas = db.query(Matricula).all()
if matriculas:
    print(f"   Total matrículas: {len(matriculas)}")
    for m in matriculas[:5]:
        horario = db.query(HorarioGenerado).filter(HorarioGenerado.id == m.horario_id).first()
        curso = db.query(CursoDB).filter(CursoDB.id == horario.curso_id).first() if horario else None
        print(f"      ID:{m.id} | Est:{m.estudiante_id} | Curso:{curso.codigo if curso else '?'}")
else:
    print("   ⚠️ No hay matrículas registradas")

db.close()

print("\n" + "="*70)
print("✅ DIAGNÓSTICO COMPLETADO")
print("="*70)