# D:\TALLER 2\optiacademic\backend\limpiar_conflictos.py
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models.db_models import HorarioGenerado, Matricula

db = SessionLocal()

print("="*60)
print("🧹 LIMPIANDO HORARIOS CONFLICTIVOS")
print("="*60)

# 1. Ver cuántos horarios hay
horarios = db.query(HorarioGenerado).all()
print(f"\n📅 Horarios actuales: {len(horarios)}")

# 2. Eliminar matrículas (para poder eliminar horarios)
matriculas = db.query(Matricula).delete()
print(f"🗑️ Matrículas eliminadas: {matriculas}")

# 3. Eliminar todos los horarios
horarios_eliminados = db.query(HorarioGenerado).delete()
print(f"🗑️ Horarios eliminados: {horarios_eliminados}")

db.commit()
print("\n✅ Datos limpiados. Ahora genera nuevos horarios desde el Dashboard.")

db.close()