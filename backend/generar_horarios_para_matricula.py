# D:\TALLER 2\optiacademic\backend\generar_horarios_para_matricula.py
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models.db_models import HorarioGenerado, CursoDB, Docente, Aula, Matricula

db = SessionLocal()

print("="*60)
print("📅 GENERANDO HORARIOS PARA MATRÍCULA")
print("="*60)

# 1. Obtener todos los cursos
cursos = db.query(CursoDB).all()
print(f"📚 Cursos a procesar: {len(cursos)}")

# 2. Obtener aulas y docentes
aulas = db.query(Aula).all()
docentes = db.query(Docente).all()

if len(aulas) == 0:
    print("❌ No hay aulas. Creando aulas básicas...")
    from models.db_models import Aula
    aulas_base = [
        Aula(codigo="A101", nombre="Aula 101", capacidad=40, tipo="teoria", activa=True),
        Aula(codigo="A102", nombre="Aula 102", capacidad=35, tipo="teoria", activa=True),
        Aula(codigo="LAB101", nombre="Laboratorio 1", capacidad=30, tipo="laboratorio", activa=True),
        Aula(codigo="LAB102", nombre="Laboratorio 2", capacidad=30, tipo="laboratorio", activa=True),
    ]
    for a in aulas_base:
        db.add(a)
    db.commit()
    aulas = db.query(Aula).all()
    print(f"   ✅ Creadas {len(aulas)} aulas")

# 3. Primero eliminar matrículas (para poder eliminar horarios)
print("\n🗑️ Eliminando matrículas...")
matriculas_eliminadas = db.query(Matricula).delete()
db.commit()
print(f"   ✅ Eliminadas {matriculas_eliminadas} matrículas")

# 4. Luego eliminar horarios existentes
print("🗑️ Eliminando horarios...")
horarios_eliminados = db.query(HorarioGenerado).delete()
db.commit()
print(f"   ✅ Eliminados {horarios_eliminados} horarios")

# 5. Franjas horarias disponibles
franjas_por_dia = {
    'Lunes': ['07:30 - 09:00', '09:10 - 10:40', '10:50 - 12:20', '12:30 - 14:00', '14:10 - 15:40'],
    'Martes': ['07:30 - 09:00', '09:10 - 10:40', '10:50 - 12:20', '12:30 - 14:00', '14:10 - 15:40'],
    'Miércoles': ['07:30 - 09:00', '09:10 - 10:40', '10:50 - 12:20', '12:30 - 14:00', '14:10 - 15:40'],
    'Jueves': ['07:30 - 09:00', '09:10 - 10:40', '10:50 - 12:20', '12:30 - 14:00', '14:10 - 15:40'],
    'Viernes': ['07:30 - 09:00', '09:10 - 10:40', '10:50 - 12:20', '12:30 - 14:00', '14:10 - 15:40'],
}

# 6. Crear horarios para cada curso
print("\n📅 Creando nuevos horarios...")
horarios_creados = 0
franjas_usadas = set()

for idx, curso in enumerate(cursos):
    # Seleccionar día y hora
    dias_lista = list(franjas_por_dia.keys())
    dia_idx = idx % len(dias_lista)
    dia = dias_lista[dia_idx]
    
    horas = franjas_por_dia[dia]
    hora_idx = (idx // len(dias_lista)) % len(horas)
    hora = horas[hora_idx]
    
    franja = f"{dia} {hora}"
    
    # Asegurar franja única
    contador = 0
    while franja in franjas_usadas and contador < 10:
        hora_idx = (hora_idx + 1) % len(horas)
        hora = horas[hora_idx]
        franja = f"{dia} {hora}"
        contador += 1
    
    # Asignar aula según tipo de curso
    if curso.tipo == 'laboratorio':
        aula = next((a for a in aulas if a.tipo == 'laboratorio'), aulas[0] if aulas else None)
    else:
        aula = next((a for a in aulas if a.tipo == 'teoria'), aulas[0] if aulas else None)
    
    horario = HorarioGenerado(
        periodo="2025-1",
        curso_id=curso.id,
        docente_id=curso.docente_id,
        aula_id=aula.id if aula else 1,
        franja=franja,
        seccion="A",
        cupo_maximo=curso.max_estudiantes,
        cupo_disponible=curso.max_estudiantes
    )
    db.add(horario)
    franjas_usadas.add(franja)
    horarios_creados += 1
    
    print(f"   ✅ {curso.codigo} - {curso.nombre[:35]}")
    print(f"      → {franja} | Aula: {aula.codigo if aula else 'N/A'}")

db.commit()
print(f"\n📊 Horarios creados: {horarios_creados}")

# 7. Verificar conflictos
print("\n🔍 Verificando conflictos...")
horarios_check = {}
conflictos = 0

for h in db.query(HorarioGenerado).all():
    key = f"{h.franja}_{h.docente_id}"
    if key in horarios_check:
        conflictos += 1
        print(f"   ⚠️ Conflicto: Curso {h.curso_id} y {horarios_check[key]} en {h.franja}")
    else:
        horarios_check[key] = h.curso_id

print(f"\n✅ Conflictos encontrados: {conflictos}")

db.close()
print("\n✅ Proceso completado. Ahora puedes matricularte desde el frontend.")