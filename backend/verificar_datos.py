# D:\TALLER 2\optiacademic\backend\verificar_datos.py
from database import SessionLocal
from models.db_models import CursoDB, Docente, Aula, Usuario

db = SessionLocal()

print("="*50)
print("📊 VERIFICANDO DATOS EN BASE DE DATOS")
print("="*50)

cursos = db.query(CursoDB).count()
docentes = db.query(Docente).count()
aulas = db.query(Aula).count()
usuarios = db.query(Usuario).count()

print(f"\n📚 Cursos: {cursos}")
print(f"👨‍🏫 Docentes: {docentes}")
print(f"🏫 Aulas: {aulas}")
print(f"👤 Usuarios: {usuarios}")

if cursos > 0:
    print("\n✅ Datos cargados correctamente")
else:
    print("\n❌ No hay datos. Ejecuta: python seed_sistemas.py")

db.close()