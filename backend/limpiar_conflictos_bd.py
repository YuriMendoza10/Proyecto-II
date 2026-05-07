# D:\TALLER 2\optiacademic\backend\limpiar_conflictos_bd.py
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models.db_models import Matricula, HorarioGenerado, CursoDB

db = SessionLocal()

print("="*60)
print("🧹 LIMPIANDO CONFLICTOS EN BASE DE DATOS")
print("="*60)

conflictos = []
horarios_dict = {}

horarios = db.query(HorarioGenerado).all()
print(f"📅 Horarios analizados: {len(horarios)}")

for h in horarios:
    key = f"{h.franja}_{h.aula_id}"
    if key in horarios_dict:
        conflictos.append({
            'horario_id': h.id,
            'curso_id': h.curso_id,
            'franja': h.franja,
            'aula_id': h.aula_id,
            'conflicto_con': horarios_dict[key]
        })
    else:
        horarios_dict[key] = h.id

print(f"\n⚠️ Conflictos encontrados: {len(conflictos)}")

if conflictos:
    print("\n📋 Lista de conflictos:")
    for c in conflictos:
        curso = db.query(CursoDB).filter(CursoDB.id == c['curso_id']).first()
        print(f"   - Curso {curso.codigo if curso else '?'} en {c['franja']} (Aula {c['aula_id']})")

    respuesta = input("\n¿Deseas eliminar los horarios conflictivos? (s/n): ")
    if respuesta.lower() == 's':
        for c in conflictos:
            db.query(Matricula).filter(Matricula.horario_id == c['horario_id']).delete()
            horario = db.query(HorarioGenerado).filter(HorarioGenerado.id == c['horario_id']).first()
            if horario:
                db.delete(horario)
                print(f"   🗑️ Eliminado horario conflictivo ID: {c['horario_id']}")
        db.commit()
        print("\n✅ Horarios conflictivos eliminados")
        
        horarios_restantes = db.query(HorarioGenerado).count()
        print(f"\n📊 Horarios restantes en BD: {horarios_restantes}")
    else:
        print("\n⚠️ No se eliminaron los conflictos")
else:
    print("\n✅ No se encontraron conflictos en la base de datos")

db.close()