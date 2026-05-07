# D:\TALLER 2\optiacademic\backend\crear_matriculas_estudiante.py
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models.db_models import Matricula, HorarioGenerado, Usuario, CursoDB

db = SessionLocal()

print("="*60)
print("CREANDO MATRÍCULAS PARA ESTUDIANTE")
print("="*60)

# 1. Encontrar al estudiante
estudiante = db.query(Usuario).filter(Usuario.email == "estudiante1@uni.edu").first()
if not estudiante:
    print("❌ Estudiante no encontrado")
    db.close()
    exit()

print(f"👤 Estudiante: {estudiante.email} (ID: {estudiante.id}) - {estudiante.nombre} {estudiante.apellido}")

# 2. Obtener horarios disponibles
horarios = db.query(HorarioGenerado).all()
print(f"\n📅 Horarios disponibles: {len(horarios)}")

if not horarios:
    print("❌ No hay horarios generados. Genera un horario primero desde el Dashboard.")
    db.close()
    exit()

# 3. Eliminar matrículas existentes del estudiante
db.query(Matricula).filter(Matricula.estudiante_id == estudiante.id).delete()
print(f"🗑️ Eliminadas matrículas anteriores")

# 4. Seleccionar algunos horarios para matricular (los primeros 5)
horarios_a_matricular = horarios[:5]
print(f"\n📋 Matriculando en {len(horarios_a_matricular)} cursos:")

for h in horarios_a_matricular:
    curso = db.query(CursoDB).filter(CursoDB.id == h.curso_id).first()
    
    matricula = Matricula(
        estudiante_id=estudiante.id,
        horario_id=h.id,
        periodo="2025-1",
        estado="activa"
    )
    db.add(matricula)
    print(f"   ✅ {curso.codigo if curso else 'Curso'} - {curso.nombre if curso else 'N/A'} | Horario: {h.franja}")

db.commit()
print(f"\n✅ Creadas {len(horarios_a_matricular)} matrículas para {estudiante.email}")

# 5. Verificar
matriculas = db.query(Matricula).filter(Matricula.estudiante_id == estudiante.id).all()
print(f"\n📋 Verificación: {len(matriculas)} matrículas activas")

for m in matriculas:
    h = db.query(HorarioGenerado).filter(HorarioGenerado.id == m.horario_id).first()
    curso = db.query(CursoDB).filter(CursoDB.id == h.curso_id).first() if h else None
    print(f"   - Matrícula {m.id}: {curso.codigo if curso else 'N/A'} - {h.franja if h else 'N/A'}")

db.close()