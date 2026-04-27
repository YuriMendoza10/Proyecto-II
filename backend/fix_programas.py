# fix_programas.py
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models.db_models import Programa

db = SessionLocal()

# Eliminar programas que no sean Ingeniería de Sistemas
programas_eliminar = db.query(Programa).filter(
    Programa.codigo != "ING-SIST"
).all()

for p in programas_eliminar:
    print(f"🗑️ Eliminando programa: {p.codigo} - {p.nombre}")
    db.delete(p)

db.commit()
print("✅ Solo queda Ingeniería de Sistemas")

db.close()