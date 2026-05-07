# D:\TALLER 2\optiacademic\backend\matricular_cursos_variados.py
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models.db_models import Matricula, HorarioGenerado, Usuario, CursoDB

db = SessionLocal()

# 1. Buscar estudiante
estudiante = db.query(Usuario).filter(Usuario.email == "estudiante1@uni.edu").first()
if not estudiante:
    print("❌ Estudiante no encontrado")
    exit()

print(f"👤 Estudiante: {estudiante.email} (ID: {estudiante.id})")

# 2. Eliminar todas las matrículas existentes
db.query(Matricula).filter(Matricula.estudiante_id == estudiante.id).delete()
print("🗑️ Matrículas anteriores eliminadas")

# 3. Obtener horarios de DIFERENTES cursos (sin repetir curso_id)
horarios_todos = db.query(HorarioGenerado).all()

# Agrupar horarios por curso (solo 1 por curso)
horarios_unicos = {}
for h in horarios_todos:
    if h.curso_id not in horarios_unicos:
        horarios_unicos[h.curso_id] = h

# Convertir a lista y tomar primeros 5
horarios_para_matricular = list(horarios_unicos.values())[:5]

print(f"\n📋 Cursos a matricular ({len(horarios_para_matricular)} cursos diferentes):")

for h in horarios_para_matricular:
    curso = db.query(CursoDB).filter(CursoDB.id == h.curso_id).first()
    matricula = Matricula(
        estudiante_id=estudiante.id,
        horario_id=h.id,
        periodo="2025-1",
        estado="activa"
    )
    db.add(matricula)
    print(f"   ✅ {curso.codigo} - {curso.nombre[:40]} - {h.franja}")

db.commit()

# 4. Verificar
matriculas = db.query(Matricula).filter(Matricula.estudiante_id == estudiante.id).all()
print(f"\n📊 Verificación: {len(matriculas)} matrículas activas")

# Mostrar cursos matriculados (sin repetir)
cursos_ids = set()
for m in matriculas:
    h = db.query(HorarioGenerado).filter(HorarioGenerado.id == m.horario_id).first()
    if h and h.curso_id not in cursos_ids:
        cursos_ids.add(h.curso_id)
        curso = db.query(CursoDB).filter(CursoDB.id == h.curso_id).first()
        print(f"   - {curso.codigo} - {curso.nombre}")

db.close()
print("\n✅ Proceso completado. Reinicia el backend y recarga la página.")