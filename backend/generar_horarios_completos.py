# D:\TALLER 2\optiacademic\backend\generar_horarios_completos.py
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models.db_models import HorarioGenerado, CursoDB, Docente, Aula
import random

db = SessionLocal()

print("="*60)
print("📅 GENERANDO HORARIOS COMPLETOS")
print("="*60)

# 1. Obtener todos los cursos
cursos = db.query(CursoDB).all()
print(f"📚 Cursos encontrados: {len(cursos)}")

if len(cursos) == 0:
    print("❌ No hay cursos. Ejecuta seed primero.")
    db.close()
    exit()

# 2. Obtener docentes y aulas
docentes = db.query(Docente).all()
aulas = db.query(Aula).all()

print(f"👨‍🏫 Docentes: {len(docentes)}")
print(f"🏫 Aulas: {len(aulas)}")

# 3. Limpiar horarios existentes
horarios_eliminados = db.query(HorarioGenerado).delete()
print(f"🗑️ Horarios eliminados: {horarios_eliminados}")

# 4. Franjas horarias disponibles
franjas = [
    # Mañanas
    'Lunes 07:30 - 09:00', 'Lunes 09:10 - 10:40', 'Lunes 10:50 - 12:20',
    'Martes 07:30 - 09:00', 'Martes 09:10 - 10:40', 'Martes 10:50 - 12:20',
    'Miércoles 07:30 - 09:00', 'Miércoles 09:10 - 10:40', 'Miércoles 10:50 - 12:20',
    'Jueves 07:30 - 09:00', 'Jueves 09:10 - 10:40', 'Jueves 10:50 - 12:20',
    'Viernes 07:30 - 09:00', 'Viernes 09:10 - 10:40', 'Viernes 10:50 - 12:20',
    # Tardes
    'Lunes 12:30 - 14:00', 'Lunes 14:10 - 15:40', 'Lunes 15:50 - 17:20',
    'Martes 12:30 - 14:00', 'Martes 14:10 - 15:40', 'Martes 15:50 - 17:20',
    'Miércoles 12:30 - 14:00', 'Miércoles 14:10 - 15:40', 'Miércoles 15:50 - 17:20',
    'Jueves 12:30 - 14:00', 'Jueves 14:10 - 15:40', 'Jueves 15:50 - 17:20',
    'Viernes 12:30 - 14:00', 'Viernes 14:10 - 15:40', 'Viernes 15:50 - 17:20',
]

# 5. Crear horarios para cada curso (un horario por curso, en diferentes días)
horarios_creados = 0
cursos_usados = 0

# Usar diferentes estrategias para distribuir los cursos
for i, curso in enumerate(cursos):
    # Seleccionar franja (distinta para cada curso)
    franja_idx = i % len(franjas)
    franja = franjas[franja_idx]
    
    # Seleccionar aula (rotativa)
    aula = aulas[i % len(aulas)] if aulas else None
    
    # Seleccionar docente (usar el asignado al curso o uno aleatorio)
    docente = db.query(Docente).filter(Docente.id == curso.docente_id).first()
    if not docente and docentes:
        docente = docentes[i % len(docentes)]
    
    horario = HorarioGenerado(
        periodo="2025-1",
        curso_id=curso.id,
        docente_id=docente.id if docente else None,
        aula_id=aula.id if aula else None,
        franja=franja,
        seccion=chr(65 + (i % 5)),  # A, B, C, D, E
        cupo_maximo=curso.max_estudiantes,
        cupo_disponible=curso.max_estudiantes
    )
    db.add(horario)
    horarios_creados += 1
    cursos_usados += 1
    print(f"   ✅ {curso.codigo} - {curso.nombre[:30]} - {franja}")

db.commit()
print(f"\n📊 Horarios creados: {horarios_creados}")
print(f"📚 Cursos con horario: {cursos_usados}")

# 6. Verificar
horarios_final = db.query(HorarioGenerado).all()
print(f"\n✅ Total horarios en BD: {len(horarios_final)}")

db.close()
print("\n✅ Proceso completado. Ahora ejecuta: python matricular_cursos_variados.py")