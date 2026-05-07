# D:\TALLER 2\optiacademic\backend\ver_datos.py
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models.db_models import Matricula, HorarioGenerado, CursoDB

db = SessionLocal()

print("="*60)
print("VERIFICANDO DATOS DE MATRÍCULA")
print("="*60)

# 1. Ver horarios generados
horarios = db.query(HorarioGenerado).all()
print(f"\n📅 Horarios generados: {len(horarios)}")
for h in horarios[:5]:
    print(f"   ID: {h.id} | Curso ID: {h.curso_id} | Franja: {h.franja}")

# 2. Ver matrículas
matriculas = db.query(Matricula).all()
print(f"\n📋 Matrículas registradas: {len(matriculas)}")
for m in matriculas:
    print(f"   ID: {m.id} | Estudiante: {m.estudiante_id} | Horario ID: {m.horario_id} | Estado: {m.estado}")

# 3. Verificar relación entre matrículas y horarios
for m in matriculas:
    horario = db.query(HorarioGenerado).filter(HorarioGenerado.id == m.horario_id).first()
    if horario:
        curso = db.query(CursoDB).filter(CursoDB.id == horario.curso_id).first()
        print(f"   ✅ Matrícula {m.id} -> Horario {m.horario_id} -> Curso: {curso.codigo if curso else 'N/A'}")
    else:
        print(f"   ❌ Matrícula {m.id} -> Horario {m.horario_id} NO ENCONTRADO")

db.close()