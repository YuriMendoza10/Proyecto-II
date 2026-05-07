# D:\TALLER 2\optiacademic\backend\generar_horarios_completos_semestre.py
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models.db_models import HorarioGenerado, CursoDB, Aula, Matricula

db = SessionLocal()

print("="*60)
print("📅 GENERANDO HORARIOS PARA SEMESTRE 1 COMPLETO")
print("="*60)

# 1. Obtener cursos del semestre 1
cursos = db.query(CursoDB).filter(CursoDB.semestre == 1).all()
print(f"📚 Cursos en Semestre 1: {len(cursos)}")

if len(cursos) == 0:
    print("❌ No hay cursos para el semestre 1")
    exit()

# 2. Aulas disponibles
aulas = db.query(Aula).all()

# 3. Limpiar matrículas y horarios existentes
print("🗑️ Limpiando datos existentes...")
db.query(Matricula).delete()
db.query(HorarioGenerado).delete()
db.commit()

# 4. Franjas horarias (7 franjas diferentes)
franjas = [
    ('Lunes', '07:30 - 09:00'),
    ('Lunes', '09:10 - 10:40'),
    ('Martes', '07:30 - 09:00'),
    ('Martes', '09:10 - 10:40'),
    ('Miércoles', '07:30 - 09:00'),
    ('Miércoles', '09:10 - 10:40'),
    ('Jueves', '07:30 - 09:00'),
]

# 5. Crear un horario para cada curso
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
    print(f"   ✅ {curso.codigo} - {curso.nombre[:40]} → {franja_completa}")

db.commit()

# 6. Verificar
horarios_creados = db.query(HorarioGenerado).count()
print(f"\n📊 Horarios creados: {horarios_creados}")

db.close()
print("\n✅ Horarios generados. Ahora puedes matricular los 7 cursos desde el frontend.")