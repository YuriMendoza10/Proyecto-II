# D:\TALLER 2\optiacademic\backend\agregar_cursos_faltantes.py
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models.db_models import CursoDB, Programa, Docente

db = SessionLocal()

print("="*60)
print("📚 AGREGANDO CURSOS FALTANTES - SEMESTRE 1")
print("="*60)

# Obtener programa y docente de referencia
programa = db.query(Programa).first()
docente = db.query(Docente).first()

if not programa or not docente:
    print("❌ No hay programa o docente en la BD")
    exit()

# Cursos que faltan según tu malla
cursos_faltantes = [
    {
        "codigo": "CPT101",
        "nombre": "Comprensión y Producción de Textos 1",
        "creditos": 3,
        "semestre": 1,
        "tipo": "teoria",
        "horas_semanales": 3
    },
    {
        "codigo": "LLI101",
        "nombre": "Laboratorio de Liderazgo e Innovación",
        "creditos": 3,
        "semestre": 1,
        "tipo": "taller",
        "horas_semanales": 4
    },
    {
        "codigo": "EHD101",
        "nombre": "Estrategias y Herramientas Digitales para el Aprendizaje",
        "creditos": 4,
        "semestre": 1,
        "tipo": "laboratorio",
        "horas_semanales": 5
    },
    {
        "codigo": "MDC101",
        "nombre": "Matemática Discreta 1",
        "creditos": 4,
        "semestre": 1,
        "tipo": "teoria",
        "horas_semanales": 5
    },
    {
        "codigo": "TPR101",
        "nombre": "Técnicas de Programación",
        "creditos": 2,
        "semestre": 1,
        "tipo": "laboratorio",
        "horas_semanales": 4
    }
]

# Verificar cuáles ya existen
cursos_existentes = [c.codigo for c in db.query(CursoDB).filter(CursoDB.semestre == 1).all()]
print(f"\n📋 Cursos existentes en semestre 1: {cursos_existentes}")

creados = 0
for c in cursos_faltantes:
    if c["codigo"] not in cursos_existentes:
        curso = CursoDB(
            codigo=c["codigo"],
            nombre=c["nombre"],
            creditos=c["creditos"],
            semestre=c["semestre"],
            programa_id=programa.id,
            docente_id=docente.id,
            max_estudiantes=40,
            tipo=c["tipo"],
            horas_semanales=c["horas_semanales"]
        )
        db.add(curso)
        creados += 1
        print(f"   ✅ Creado: {c['codigo']} - {c['nombre']}")
    else:
        print(f"   ⚠️ Ya existe: {c['codigo']}")

db.commit()

# Verificar total
total_cursos_semestre1 = db.query(CursoDB).filter(CursoDB.semestre == 1).count()
print(f"\n📊 Total cursos en semestre 1: {total_cursos_semestre1}")

db.close()
print("\n✅ Proceso completado. Ahora ejecuta: python generar_horarios_completos_semestre.py")