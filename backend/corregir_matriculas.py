# D:\TALLER 2\optiacademic\backend\corregir_matriculas.py
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models.db_models import Matricula, HorarioGenerado, Usuario

db = SessionLocal()

print("="*60)
print("CORRIGIENDO MATRÍCULAS")
print("="*60)

# 1. Ver todas las matrículas existentes
matriculas = db.query(Matricula).all()
print(f"\n📋 Matrículas existentes: {len(matriculas)}")
for m in matriculas:
    print(f"   ID: {m.id} | Estudiante ID: {m.estudiante_id} | Horario ID: {m.horario_id}")

# 2. Encontrar al estudiante Carlos Alvarez
estudiante = db.query(Usuario).filter(Usuario.email == "estudiante1@uni.edu").first()
print(f"\n👤 Estudiante encontrado: {estudiante.email} (ID: {estudiante.id})")

# 3. Si hay matrículas con estudiante_id = 0 o null, actualizarlas
if matriculas:
    for m in matriculas:
        if m.estudiante_id != estudiante.id:
            print(f"   🔄 Actualizando matrícula {m.id}: estudiante_id {m.estudiante_id} -> {estudiante.id}")
            m.estudiante_id = estudiante.id
    
    db.commit()
    print(f"\n✅ Matrículas actualizadas para el estudiante {estudiante.email}")

# 4. Verificar que ahora tiene matrículas
matriculas_estudiante = db.query(Matricula).filter(Matricula.estudiante_id == estudiante.id).all()
print(f"\n📋 Matrículas del estudiante {estudiante.email}: {len(matriculas_estudiante)}")
for m in matriculas_estudiante:
    horario = db.query(HorarioGenerado).filter(HorarioGenerado.id == m.horario_id).first()
    print(f"   - Matrícula {m.id} -> Horario {m.horario_id} -> Franja: {horario.franja if horario else 'N/A'}")

db.close()