# D:\TALLER 2\optiacademic\backend\actualizar_cursos.py
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models.db_models import CursoDB, Programa, Docente, HorarioGenerado, Matricula

db = SessionLocal()

print("="*60)
print("🔄 ACTUALIZANDO CURSOS - NUEVA MALLA")
print("="*60)

# 1. Primero eliminar matrículas (para liberar horarios)
print("\n1. Eliminando matrículas...")
matriculas_eliminadas = db.query(Matricula).delete()
print(f"   ✅ Eliminadas {matriculas_eliminadas} matrículas")

# 2. Eliminar horarios generados
print("\n2. Eliminando horarios generados...")
horarios_eliminados = db.query(HorarioGenerado).delete()
print(f"   ✅ Eliminados {horarios_eliminados} horarios")

# 3. Ahora sí eliminar cursos
print("\n3. Eliminando cursos existentes...")
cursos_eliminados = db.query(CursoDB).delete()
print(f"   ✅ Eliminados {cursos_eliminados} cursos")

# 4. Obtener programa y docente de referencia
programa = db.query(Programa).first()
docente = db.query(Docente).first()

if not programa or not docente:
    print("❌ No hay programa o docente en la BD")
    exit()

print(f"\n📚 Programa de referencia: {programa.nombre}")
print(f"👨‍🏫 Docente de referencia: {docente.nombre} {docente.apellido}")

# ========== NUEVA MALLA CURRICULAR ==========
cursos_nuevos = [
    # ========== SEMESTRE 1 (23 créditos) ==========
    {"codigo": "CPT101", "nombre": "Comprensión y Producción de Textos 1", "creditos": 3, "semestre": 1, "tipo": "teoria", "horas_semanales": 3},
    {"codigo": "LLI101", "nombre": "Laboratorio de Liderazgo e Innovación", "creditos": 3, "semestre": 1, "tipo": "taller", "horas_semanales": 4},
    {"codigo": "EHD101", "nombre": "Estrategias y Herramientas Digitales para el Aprendizaje", "creditos": 4, "semestre": 1, "tipo": "laboratorio", "horas_semanales": 5},
    {"codigo": "MAT101", "nombre": "Matemática Básica", "creditos": 4, "semestre": 1, "tipo": "teoria", "horas_semanales": 5},
    {"codigo": "MDC101", "nombre": "Matemática Discreta 1", "creditos": 4, "semestre": 1, "tipo": "teoria", "horas_semanales": 5},
    {"codigo": "TPR101", "nombre": "Técnicas de Programación", "creditos": 2, "semestre": 1, "tipo": "laboratorio", "horas_semanales": 4},
    {"codigo": "ISI101", "nombre": "Introducción a la Ingeniería de Sistemas e Informática", "creditos": 3, "semestre": 1, "tipo": "teoria", "horas_semanales": 3},

    # ========== SEMESTRE 2 (24 créditos) ==========
    {"codigo": "CPT201", "nombre": "Comprensión y Producción de Textos 2", "creditos": 4, "semestre": 2, "tipo": "teoria", "horas_semanales": 4},
    {"codigo": "ELG201", "nombre": "Electivo General 1", "creditos": 3, "semestre": 2, "tipo": "teoria", "horas_semanales": 3},
    {"codigo": "ALG201", "nombre": "Álgebra Lineal y Geometría Analítica", "creditos": 4, "semestre": 2, "tipo": "teoria", "horas_semanales": 5},
    {"codigo": "MDN201", "nombre": "Modelado de Negocios", "creditos": 3, "semestre": 2, "tipo": "teoria", "horas_semanales": 3},
    {"codigo": "MAS201", "nombre": "Matemática Superior", "creditos": 4, "semestre": 2, "tipo": "teoria", "horas_semanales": 5},
    {"codigo": "MDC201", "nombre": "Matemática Discreta 2", "creditos": 4, "semestre": 2, "tipo": "teoria", "horas_semanales": 5},
    {"codigo": "POO201", "nombre": "Programación Orientada a Objetos", "creditos": 2, "semestre": 2, "tipo": "laboratorio", "horas_semanales": 4},

    # ========== SEMESTRE 3 (24 créditos) ==========
    {"codigo": "EST301", "nombre": "Estadística y Probabilidades", "creditos": 4, "semestre": 3, "tipo": "teoria", "horas_semanales": 4},
    {"codigo": "ELG301", "nombre": "Electivo General 2", "creditos": 3, "semestre": 3, "tipo": "teoria", "horas_semanales": 3},
    {"codigo": "LLI301", "nombre": "Laboratorio de Liderazgo e Innovación Intermedio", "creditos": 2, "semestre": 3, "tipo": "taller", "horas_semanales": 3},
    {"codigo": "CAL301", "nombre": "Cálculo Diferencial", "creditos": 4, "semestre": 3, "tipo": "teoria", "horas_semanales": 5},
    {"codigo": "FIS301", "nombre": "Física 1", "creditos": 4, "semestre": 3, "tipo": "laboratorio", "horas_semanales": 5},
    {"codigo": "BDD301", "nombre": "Base de Datos 1", "creditos": 3, "semestre": 3, "tipo": "laboratorio", "horas_semanales": 4},
    {"codigo": "DWB301", "nombre": "Diseño Web", "creditos": 2, "semestre": 3, "tipo": "laboratorio", "horas_semanales": 3},
    {"codigo": "EDD301", "nombre": "Estructura de Datos", "creditos": 2, "semestre": 3, "tipo": "teoria", "horas_semanales": 3},
]

print("\n📖 Creando nuevos cursos...")
for c in cursos_nuevos:
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
    print(f"   ✅ {c['codigo']} - {c['nombre']} ({c['creditos']} créditos)")

db.commit()

# Verificar
total_cursos = db.query(CursoDB).count()
print(f"\n📊 Total cursos en BD: {total_cursos}")

db.close()
print("\n✅ Actualización completada")