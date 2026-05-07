# D:\TALLER 2\optiacademic\backend\verificar_conflictos.py
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models.db_models import HorarioGenerado, CursoDB

db = SessionLocal()

print("="*60)
print("🔍 VERIFICANDO HORARIOS GENERADOS")
print("="*60)

horarios = db.query(HorarioGenerado).all()
print(f"\n📅 Total horarios: {len(horarios)}")

# Verificar conflictos
conflictos = []
horarios_dict = {}

for h in horarios:
    curso = db.query(CursoDB).filter(CursoDB.id == h.curso_id).first()
    key = f"{h.franja}"
    
    if key in horarios_dict:
        conflictos.append({
            'horario': key,
            'curso1': horarios_dict[key],
            'curso2': curso.codigo if curso else 'N/A'
        })
    else:
        horarios_dict[key] = curso.codigo if curso else 'N/A'

if conflictos:
    print(f"\n⚠️ Conflictos encontrados: {len(conflictos)}")
    for c in conflictos:
        print(f"   - {c['horario']}: {c['curso1']} y {c['curso2']}")
else:
    print("\n✅ No hay conflictos de horario")

# Mostrar distribución por día
distribucion = {}
for h in horarios:
    dia = h.franja.split(' ')[0] if h.franja else 'N/A'
    distribucion[dia] = distribucion.get(dia, 0) + 1

print("\n📊 Distribución por día:")
for dia, count in sorted(distribucion.items()):
    print(f"   {dia}: {count} cursos")

db.close()