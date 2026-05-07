# D:\TALLER 2\optiacademic\backend\diagnostico_completo.py
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models.db_models import HorarioGenerado, Matricula, Usuario, CursoDB

db = SessionLocal()

print("="*60)
print("🔍 DIAGNÓSTICO COMPLETO")
print("="*60)

# 1. Horarios generados
horarios = db.query(HorarioGenerado).all()
print(f"\n📅 Horarios generados: {len(horarios)}")
for h in horarios[:5]:
    curso = db.query(CursoDB).filter(CursoDB.id == h.curso_id).first()
    print(f"   ID: {h.id} | Curso: {curso.codigo if curso else 'N/A'} | Franja: {h.franja}")

# 2. Usuarios
usuarios = db.query(Usuario).all()
print(f"\n👤 Usuarios: {len(usuarios)}")
for u in usuarios:
    print(f"   ID: {u.id} | {u.email} | Rol: {u.rol}")

# 3. Matrículas
matriculas = db.query(Matricula).all()
print(f"\n📋 Matrículas: {len(matriculas)}")
for m in matriculas:
    usuario = db.query(Usuario).filter(Usuario.id == m.estudiante_id).first()
    horario = db.query(HorarioGenerado).filter(HorarioGenerado.id == m.horario_id).first()
    print(f"   Estudiante: {usuario.email if usuario else 'N/A'} | Horario ID: {m.horario_id} | Estado: {m.estado}")

# 4. Estudiante específico
estudiante = db.query(Usuario).filter(Usuario.email == "estudiante1@uni.edu").first()
if estudiante:
    print(f"\n🎓 Estudiante: {estudiante.email} (ID: {estudiante.id})")
    matriculas_est = db.query(Matricula).filter(Matricula.estudiante_id == estudiante.id).all()
    print(f"   Matrículas: {len(matriculas_est)}")
    for m in matriculas_est:
        horario = db.query(HorarioGenerado).filter(HorarioGenerado.id == m.horario_id).first()
        print(f"   - Matrícula {m.id}: Horario {m.horario_id} - {horario.franja if horario else 'N/A'}")

db.close()