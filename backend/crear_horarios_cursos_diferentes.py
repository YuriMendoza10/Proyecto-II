# D:\TALLER 2\optiacademic\backend\crear_horarios_cursos_diferentes.py
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models.db_models import HorarioGenerado, CursoDB, Aula, Matricula

db = SessionLocal()

print("="*60)
print("📅 CREANDO HORARIOS PARA CURSOS DIFERENTES")
print("="*60)

# 1. Limpiar
db.query(Matricula).delete()
db.query(HorarioGenerado).delete()
db.commit()
print("🗑️ Datos limpiados")

# 2. Obtener cursos y aulas
cursos = db.query(CursoDB).all()
aulas = db.query(Aula).all()

print(f"📚 Cursos disponibles: {len(cursos)}")
print(f"🏫 Aulas disponibles: {len(aulas)}")

if len(cursos) == 0:
    print("❌ No hay cursos")
    db.close()
    exit()

# 3. Franjas horarias
dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
horas = ['07:30 - 09:00', '09:10 - 10:40', '10:50 - 12:20', '12:30 - 14:00', '14:10 - 15:40']

# 4. Crear UN horario por curso (para evitar duplicados)
horarios_creados = 0
for i, curso in enumerate(cursos):
    dia = dias[i % len(dias)]
    hora_idx = (i // len(dias)) % len(horas)
    hora = horas[hora_idx]
    franja = f"{dia} {hora}"
    
    aula = aulas[i % len(aulas)] if aulas else None
    
    horario = HorarioGenerado(
        periodo="2025-1",
        curso_id=curso.id,
        docente_id=curso.docente_id,
        aula_id=aula.id if aula else 1,
        franja=franja,
        seccion="A",
        cupo_maximo=curso.max_estudiantes,
        cupo_disponible=curso.max_estudiantes
    )
    db.add(horario)
    horarios_creados += 1
    print(f"   ✅ {curso.codigo} - {curso.nombre[:30]} → {franja}")

db.commit()
print(f"\n📊 Horarios creados: {horarios_creados} (uno por curso)")

db.close()
print("\n✅ Ejecuta de nuevo la matrícula desde el frontend")