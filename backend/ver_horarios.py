# D:\TALLER 2\optiacademic\backend\ver_horarios.py
from database import SessionLocal
from models.db_models import HorarioGenerado

db = SessionLocal()
horarios = db.query(HorarioGenerado).all()
print(f"Horarios en BD: {len(horarios)}")
db.close()