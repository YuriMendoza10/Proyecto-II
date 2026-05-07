# D:\TALLER 2\optiacademic\backend\generar_horarios_todos_cursos.py
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models.db_models import HorarioGenerado, CursoDB, Aula, Matricula

db = SessionLocal()

print("="*60)
print("📅 GENERANDO HORARIOS PARA TODOS LOS CURSOS (SEMESTRES 1, 2, 3)")
print("="*60)

# 1. Obtener TODOS los cursos
cursos = db.query(CursoDB).all()
print(f"📚 Total cursos en BD: {len(cursos)}")

# Mostrar distribución por semestre
cursos_por_semestre = {}
for c in cursos:
    if c.semestre not in cursos_por_semestre:
        cursos_por_semestre[c.semestre] = []
    cursos_por_semestre[c.semestre].append(c)

for sem, lista in sorted(cursos_por_semestre.items()):
    print(f"   Semestre {sem}: {len(lista)} cursos")

# 2. Aulas disponibles
aulas = db.query(Aula).all()
print(f"🏫 Aulas disponibles: {len(aulas)}")

# 3. Limpiar datos existentes
print("\n🗑️ Limpiando datos existentes...")
db.query(Matricula).delete()
db.query(HorarioGenerado).delete()
db.commit()

# 4. Franjas horarias (suficientes para todos)
franjas = [
    ('Lunes', '07:30 - 09:00'), ('Lunes', '09:10 - 10:40'), ('Lunes', '10:50 - 12:20'),
    ('Lunes', '12:30 - 14:00'), ('Lunes', '14:10 - 15:40'), ('Lunes', '15:50 - 17:20'),
    ('Martes', '07:30 - 09:00'), ('Martes', '09:10 - 10:40'), ('Martes', '10:50 - 12:20'),
    ('Martes', '12:30 - 14:00'), ('Martes', '14:10 - 15:40'), ('Martes', '15:50 - 17:20'),
    ('Miércoles', '07:30 - 09:00'), ('Miércoles', '09:10 - 10:40'), ('Miércoles', '10:50 - 12:20'),
    ('Miércoles', '12:30 - 14:00'), ('Miércoles', '14:10 - 15:40'), ('Miércoles', '15:50 - 17:20'),
    ('Jueves', '07:30 - 09:00'), ('Jueves', '09:10 - 10:40'), ('Jueves', '10:50 - 12:20'),
    ('Jueves', '12:30 - 14:00'), ('Jueves', '14:10 - 15:40'), ('Jueves', '15:50 - 17:20'),
]

# 5. Crear UN horario por curso (todos en horarios diferentes)
horarios_creados = 0
for i, curso in enumerate(cursos):
    dia, hora = franjas[i % len(franjas)]
    franja_completa = f"{dia} {hora}"
    
    # Seleccionar aula según tipo
    if curso.tipo == 'laboratorio':
        aula = next((a for a in aulas if a.tipo == 'laboratorio'), aulas[0] if aulas else None)
    else:
        aula = next((a for a in aulas if a.tipo == 'teoria'), aulas[0] if aulas else None)
    
    horario = HorarioGenerado(
        periodo="2025-1",
        curso_id=curso.id,
        docente_id=curso.docente_id,
        aula_id=aula.id if aula else None,
        franja=franja_completa,
        seccion="A",
        cupo_maximo=curso.max_estudiantes,
        cupo_disponible=curso.max_estudiantes
    )
    db.add(horario)
    horarios_creados += 1
    print(f"   ✅ {curso.codigo} - {curso.nombre[:35]} → {franja_completa}")

db.commit()
print(f"\n📊 Horarios creados: {horarios_creados}")

db.close()
print("\n✅ TODOS los cursos tienen horario. Ahora puedes matricular desde el frontend!")