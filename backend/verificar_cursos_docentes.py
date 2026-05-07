# D:\TALLER 2\optiacademic\backend\verificar_cursos_docentes.py
from database import SessionLocal
from models.db_models import CursoDB, Docente

db = SessionLocal()

print("📚 Verificando asignación docente por curso:")
cursos = db.query(CursoDB).all()
for c in cursos[:10]:
    docente = db.query(Docente).filter(Docente.id == c.docente_id).first()
    print(f"   {c.codigo} → Docente: {docente.codigo if docente else 'N/A'} ({docente.nombre if docente else 'N/A'})")

db.close()