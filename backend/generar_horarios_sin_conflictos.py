# D:\TALLER 2\optiacademic\backend\generar_horarios_sin_conflictos.py
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models.db_models import HorarioGenerado, CursoDB, Docente, Aula
import random

db = SessionLocal()

print("="*60)
print("📅 GENERANDO HORARIOS SIN CONFLICTOS")
print("="*60)

# 1. Obtener cursos
cursos = db.query(CursoDB).all()
docentes = db.query(Docente).all()
aulas = db.query(Aula).all()

if not cursos:
    print("❌ No hay cursos")
    exit()

print(f"📚 Cursos: {len(cursos)}")
print(f"👨‍🏫 Docentes: {len(docentes)}")
print(f"🏫 Aulas: {len(aulas)}")

# 2. Limpiar horarios existentes
db.query(HorarioGenerado).delete()
db.commit()
print("🗑️ Horarios anteriores eliminados")

# 3. Franjas disponibles (distribuidas en la semana)
franjas = [
    # Lunes
    ('Lunes', '07:30 - 09:00'), ('Lunes', '09:10 - 10:40'), ('Lunes', '10:50 - 12:20'),
    ('Lunes', '12:30 - 14:00'), ('Lunes', '14:10 - 15:40'), ('Lunes', '15:50 - 17:20'),
    # Martes
    ('Martes', '07:30 - 09:00'), ('Martes', '09:10 - 10:40'), ('Martes', '10:50 - 12:20'),
    ('Martes', '12:30 - 14:00'), ('Martes', '14:10 - 15:40'), ('Martes', '15:50 - 17:20'),
    # Miércoles
    ('Miércoles', '07:30 - 09:00'), ('Miércoles', '09:10 - 10:40'), ('Miércoles', '10:50 - 12:20'),
    ('Miércoles', '12:30 - 14:00'), ('Miércoles', '14:10 - 15:40'), ('Miércoles', '15:50 - 17:20'),
    # Jueves
    ('Jueves', '07:30 - 09:00'), ('Jueves', '09:10 - 10:40'), ('Jueves', '10:50 - 12:20'),
    ('Jueves', '12:30 - 14:00'), ('Jueves', '14:10 - 15:40'), ('Jueves', '15:50 - 17:20'),
    # Viernes
    ('Viernes', '07:30 - 09:00'), ('Viernes', '09:10 - 10:40'), ('Viernes', '10:50 - 12:20'),
    ('Viernes', '12:30 - 14:00'), ('Viernes', '14:10 - 15:40'), ('Viernes', '15:50 - 17:20'),
]

# 4. Control de uso para evitar conflictos
uso_docente = {}  # docente_id_dia_hora
uso_aula = {}     # aula_id_dia_hora

horarios_creados = 0
franja_idx = 0

for curso in cursos:
    # Seleccionar franja (distinta para cada curso)
    dia, hora = franjas[franja_idx % len(franjas)]
    franja_completa = f"{dia} {hora}"
    
    # Buscar docente adecuado
    docente = db.query(Docente).filter(Docente.id == curso.docente_id).first()
    if not docente and docentes:
        docente = docentes[0]
    
    # Buscar aula adecuada
    aula = db.query(Aula).filter(Aula.tipo == curso.tipo).first()
    if not aula and aulas:
        aula = aulas[0]
    
    # Verificar conflictos
    key_docente = f"{docente.id}_{dia}_{hora}" if docente else None
    key_aula = f"{aula.id}_{dia}_{hora}" if aula else None
    
    if key_docente and uso_docente.get(key_docente):
        # Conflicto de docente, buscar otra franja
        for offset in range(1, len(franjas)):
            nuevo_dia, nuevo_hora = franjas[(franja_idx + offset) % len(franjas)]
            nueva_key = f"{docente.id}_{nuevo_dia}_{nuevo_hora}"
            if not uso_docente.get(nueva_key):
                dia, hora = nuevo_dia, nuevo_hora
                franja_completa = f"{dia} {hora}"
                key_docente = nueva_key
                break
    
    if key_aula and uso_aula.get(key_aula):
        # Conflicto de aula, buscar otra franja
        for offset in range(1, len(franjas)):
            nuevo_dia, nuevo_hora = franjas[(franja_idx + offset) % len(franjas)]
            nueva_key = f"{aula.id}_{nuevo_dia}_{nuevo_hora}"
            if not uso_aula.get(nueva_key):
                dia, hora = nuevo_dia, nuevo_hora
                franja_completa = f"{dia} {hora}"
                key_aula = nueva_key
                break
    
    # Crear horario
    horario = HorarioGenerado(
        periodo="2025-1",
        curso_id=curso.id,
        docente_id=docente.id if docente else None,
        aula_id=aula.id if aula else None,
        franja=franja_completa,
        seccion="A",
        cupo_maximo=curso.max_estudiantes,
        cupo_disponible=curso.max_estudiantes
    )
    db.add(horario)
    horarios_creados += 1
    
    # Registrar uso
    if key_docente:
        uso_docente[key_docente] = True
    if key_aula:
        uso_aula[key_aula] = True
    
    print(f"   ✅ {curso.codigo} - {curso.nombre[:30]} -> {franja_completa}")
    
    franja_idx += 1

db.commit()
print(f"\n📊 Horarios creados: {horarios_creados}")

# 5. Verificar conflictos finales
print("\n🔍 Verificando conflictos finales...")
horarios_check = {}
conflictos = 0

for h in db.query(HorarioGenerado).all():
    key = f"{h.franja}_{h.docente_id}"
    if key in horarios_check:
        conflictos += 1
        print(f"   ⚠️ Conflicto en {h.franja}")
    else:
        horarios_check[key] = h.id

print(f"\n✅ Conflictos encontrados: {conflictos}")

db.close()
print("\n✅ Proceso completado")