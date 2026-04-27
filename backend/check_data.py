# D:\TALLER 2\optiacademic\backend\check_data.py
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models.db_models import CursoDB, Docente, Aula, HorarioGenerado

db = SessionLocal()

print("="*50)
print("VERIFICANDO DATOS EN BASE DE DATOS")
print("="*50)

# Cursos
cursos = db.query(CursoDB).all()
print(f"\n📚 Cursos ({len(cursos)}):")
for c in cursos[:10]:  # Mostrar primeros 10
    print(f"  - {c.codigo}: {c.nombre} (Semestre {c.semestre}, Docente ID: {c.docente_id})")

# Docentes
docentes = db.query(Docente).all()
print(f"\n👨‍🏫 Docentes ({len(docentes)}):")
for d in docentes:
    print(f"  - {d.codigo}: {d.nombre} {d.apellido}")

# Aulas
aulas = db.query(Aula).all()
print(f"\n🏫 Aulas ({len(aulas)}):")
for a in aulas:
    print(f"  - {a.codigo}: {a.nombre} (Cap: {a.capacidad}, Tipo: {a.tipo})")

# Horarios generados
horarios = db.query(HorarioGenerado).all()
print(f"\n📅 Horarios generados ({len(horarios)}):")
for h in horarios[:5]:
    print(f"  - Curso ID: {h.curso_id}, Franja: {h.franja}, Cupos: {h.cupo_disponible}/{h.cupo_maximo}")

db.close()