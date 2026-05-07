# D:\TALLER 2\optiacademic\backend\ver_cursos_disponibles.py
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models.db_models import CursoDB

db = SessionLocal()

print("="*60)
print("📚 CURSOS DISPONIBLES EN BASE DE DATOS")
print("="*60)

cursos = db.query(CursoDB).all()

if not cursos:
    print("❌ No hay cursos en la base de datos")
    print("   Ejecuta: python seed_sistemas.py")
else:
    print(f"\nTotal: {len(cursos)} cursos\n")
    
    # Agrupar por semestre
    cursos_por_semestre = {}
    for c in cursos:
        if c.semestre not in cursos_por_semestre:
            cursos_por_semestre[c.semestre] = []
        cursos_por_semestre[c.semestre].append(c)
    
    for semestre in sorted(cursos_por_semestre.keys()):
        print(f"\n📍 SEMESTRE {semestre}:")
        print("-" * 50)
        for c in cursos_por_semestre[semestre]:
            print(f"   {c.codigo} - {c.nombre}")
            print(f"      Créditos: {c.creditos} | Horas: {c.horas_semanales}h | Tipo: {c.tipo}")

db.close()