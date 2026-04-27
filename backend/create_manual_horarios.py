# D:\TALLER 2\optiacademic\backend\create_manual_horarios.py
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models.db_models import CursoDB, HorarioGenerado

db = SessionLocal()

# Obtener todos los cursos
cursos = db.query(CursoDB).all()

# Franjas disponibles (ampliadas para mejor distribución)
franjas = [
    'Lunes 07:00-09:00', 'Lunes 09:00-11:00', 'Lunes 11:00-13:00', 'Lunes 13:00-15:00',
    'Martes 07:00-09:00', 'Martes 09:00-11:00', 'Martes 11:00-13:00', 'Martes 13:00-15:00',
    'Miércoles 07:00-09:00', 'Miércoles 09:00-11:00', 'Miércoles 11:00-13:00', 'Miércoles 13:00-15:00',
    'Jueves 07:00-09:00', 'Jueves 09:00-11:00', 'Jueves 11:00-13:00', 'Jueves 13:00-15:00',
    'Viernes 07:00-09:00', 'Viernes 09:00-11:00', 'Viernes 11:00-13:00', 'Viernes 13:00-15:00',
]

print("="*50)
print("CREANDO HORARIOS MANUALMENTE")
print("="*50)

# Limpiar horarios existentes
horarios_antiguos = db.query(HorarioGenerado).delete()
print(f"🗑️  Eliminados {horarios_antiguos} horarios antiguos")

# Crear horarios para cada curso
creados = 0
for i, curso in enumerate(cursos):
    franja = franjas[i % len(franjas)]
    aula_id = 1 + (i % 8)  # Asignar aula 1-8
    
    horario = HorarioGenerado(
        periodo="2025-1",
        curso_id=curso.id,
        docente_id=curso.docente_id,
        aula_id=aula_id,
        franja=franja,
        seccion="A",
        cupo_maximo=curso.max_estudiantes,
        cupo_disponible=curso.max_estudiantes
    )
    db.add(horario)
    creados += 1
    
    if creados <= 10:
        print(f"✅ {curso.codigo} - {franja} (Aula {aula_id})")

db.commit()
print(f"\n✅ Creados {creados} horarios manualmente")

# Verificar
horarios_final = db.query(HorarioGenerado).count()
print(f"📊 Total horarios en BD: {horarios_final}")

db.close()