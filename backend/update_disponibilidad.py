# D:\TALLER 2\optiacademic\backend\update_disponibilidad.py
import sys
import os
import json
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models.db_models import Docente

db = SessionLocal()

# Actualizar disponibilidad de docentes
disponibilidades = {
    'DOC001': ['Lunes 07:00-09:00', 'Lunes 09:00-11:00', 'Lunes 11:00-13:00', 
               'Miércoles 07:00-09:00', 'Miércoles 09:00-11:00', 'Viernes 07:00-09:00'],
    'DOC002': ['Martes 07:00-09:00', 'Martes 09:00-11:00', 'Martes 11:00-13:00',
               'Jueves 07:00-09:00', 'Jueves 09:00-11:00', 'Viernes 09:00-11:00'],
    'DOC003': ['Lunes 13:00-15:00', 'Lunes 15:00-17:00', 'Miércoles 13:00-15:00',
               'Miércoles 15:00-17:00', 'Viernes 11:00-13:00'],
    'DOC004': ['Martes 13:00-15:00', 'Martes 15:00-17:00', 'Jueves 13:00-15:00',
               'Jueves 15:00-17:00', 'Viernes 13:00-15:00'],
    'DOC005': ['Miércoles 09:00-11:00', 'Miércoles 11:00-13:00', 'Jueves 09:00-11:00',
               'Jueves 11:00-13:00', 'Viernes 15:00-17:00'],
    'DOC006': ['Lunes 17:00-19:00', 'Martes 17:00-19:00', 'Miércoles 17:00-19:00',
               'Jueves 17:00-19:00', 'Viernes 17:00-19:00'],
    'DOC007': ['Lunes 07:00-09:00', 'Lunes 09:00-11:00', 'Miércoles 07:00-09:00',
               'Miércoles 09:00-11:00', 'Viernes 07:00-09:00', 'Viernes 09:00-11:00'],
}

print("="*50)
print("ACTUALIZANDO DISPONIBILIDAD DE DOCENTES")
print("="*50)

for codigo, disponibilidad in disponibilidades.items():
    docente = db.query(Docente).filter(Docente.codigo == codigo).first()
    if docente:
        docente.disponibilidad = json.dumps(disponibilidad)
        print(f"✅ {codigo}: {docente.nombre} {docente.apellido} - {len(disponibilidad)} franjas")
    else:
        print(f"⚠️ Docente {codigo} no encontrado")

db.commit()
db.close()

print("\n✅ Disponibilidades actualizadas correctamente")