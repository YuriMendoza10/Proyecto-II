# D:\TALLER 2\optiacademic\backend\diagnosticar_matricula.py
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models.db_models import Matricula, HorarioGenerado, CursoDB, Usuario

db = SessionLocal()

print("="*60)
print("🔍 DIAGNÓSTICO DE MATRÍCULA")
print("="*60)

# 1. Buscar estudiante
estudiante = db.query(Usuario).filter(Usuario.email == "estudiante1@uni.edu").first()
if not estudiante:
    print("❌ Estudiante no encontrado")
    exit()

print(f"👤 Estudiante: {estudiante.email} (ID: {estudiante.id})")

# 2. Obtener matrículas
matriculas = db.query(Matricula).filter(Matricula.estudiante_id == estudiante.id).all()
print(f"\n📋 Matrículas encontradas: {len(matriculas)}")

print("\n📅 DETALLE DE CADA MATRÍCULA:")
print("-" * 60)

for m in matriculas:
    horario = db.query(HorarioGenerado).filter(HorarioGenerado.id == m.horario_id).first()
    if horario:
        curso = db.query(CursoDB).filter(CursoDB.id == horario.curso_id).first()
        print(f"\n   Matrícula ID: {m.id}")
        print(f"   Curso: {curso.codigo} - {curso.nombre}")
        print(f"   Franja: {horario.franja}")
        print(f"   Día: {horario.franja.split(' ')[0] if horario.franja else 'N/A'}")
        print(f"   Hora: {' '.join(horario.franja.split(' ')[1:]) if horario.franja else 'N/A'}")
    else:
        print(f"   ⚠️ Matrícula {m.id} sin horario asociado")

# 3. Verificar si hay cursos repetidos en el mismo horario
print("\n" + "="*60)
print("🔍 VERIFICANDO CONFLICTOS DE HORARIO")
print("="*60)

horarios_ocupados = {}
for m in matriculas:
    horario = db.query(HorarioGenerado).filter(HorarioGenerado.id == m.horario_id).first()
    if horario and horario.franja:
        curso = db.query(CursoDB).filter(CursoDB.id == horario.curso_id).first()
        if horario.franja in horarios_ocupados:
            print(f"⚠️ CONFLICTO: {curso.codigo} y {horarios_ocupados[horario.franja]} comparten el mismo horario: {horario.franja}")
        else:
            horarios_ocupados[horario.franja] = curso.codigo

print(f"\n✅ Horarios únicos: {len(horarios_ocupados)} de {len(matriculas)} matrículas")

db.close()