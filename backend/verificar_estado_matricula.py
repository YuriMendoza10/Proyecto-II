# D:\TALLER 2\optiacademic\backend\verificar_estado_matricula.py
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models.db_models import HorarioGenerado, CursoDB, Usuario

db = SessionLocal()

print("="*60)
print("🔍 VERIFICANDO ESTADO PARA MATRÍCULA")
print("="*60)

# 1. Verificar horarios
horarios = db.query(HorarioGenerado).all()
print(f"\n📅 Horarios generados: {len(horarios)}")

if len(horarios) == 0:
    print("   ❌ No hay horarios. Primero genera horarios.")
else:
    for h in horarios[:5]:
        curso = db.query(CursoDB).filter(CursoDB.id == h.curso_id).first()
        print(f"   ✅ {curso.codigo if curso else '?'} - {h.franja} | Cupos: {h.cupo_disponible}")

# 2. Verificar estudiante
estudiante = db.query(Usuario).filter(Usuario.email == "estudiante1@uni.edu").first()
if estudiante:
    print(f"\n👤 Estudiante: {estudiante.email}")
    print(f"   ID: {estudiante.id}")
    print(f"   Rol: {estudiante.rol}")
    print(f"   Activo: {estudiante.activo}")
else:
    print("\n❌ Estudiante no encontrado")

db.close()