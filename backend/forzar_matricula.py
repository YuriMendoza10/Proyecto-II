# D:\TALLER 2\optiacademic\backend\forzar_matricula.py
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models.db_models import HorarioGenerado, Matricula, Usuario, CursoDB, Docente, Aula
import random

db = SessionLocal()

print("="*60)
print("🚀 FORZANDO CREACIÓN DE HORARIOS Y MATRÍCULAS")
print("="*60)

# 1. Verificar si hay cursos
cursos = db.query(CursoDB).all()
if not cursos:
    print("❌ No hay cursos. Ejecuta primero: python seed_sistemas.py")
    db.close()
    exit()

print(f"📚 Cursos disponibles: {len(cursos)}")

# 2. Verificar/crear horarios
horarios = db.query(HorarioGenerado).all()
if len(horarios) == 0:
    print("\n📅 Creando horarios de prueba...")
    
    # Obtener docentes y aulas
    docentes = db.query(Docente).all()
    aulas = db.query(Aula).all()
    
    franjas = [
        'Lunes 07:30 - 09:00', 'Lunes 09:10 - 10:40', 'Lunes 10:50 - 12:20',
        'Martes 07:30 - 09:00', 'Martes 09:10 - 10:40', 'Martes 10:50 - 12:20',
        'Miércoles 07:30 - 09:00', 'Miércoles 09:10 - 10:40', 'Miércoles 10:50 - 12:20',
        'Jueves 07:30 - 09:00', 'Jueves 09:10 - 10:40', 'Jueves 10:50 - 12:20',
        'Viernes 07:30 - 09:00', 'Viernes 09:10 - 10:40', 'Viernes 10:50 - 12:20',
    ]
    
    for i, curso in enumerate(cursos[:10]):  # Primeros 10 cursos
        horario = HorarioGenerado(
            periodo="2025-1",
            curso_id=curso.id,
            docente_id=curso.docente_id,
            aula_id=aulas[i % len(aulas)].id if aulas else 1,
            franja=franjas[i % len(franjas)],
            seccion="A",
            cupo_maximo=curso.max_estudiantes,
            cupo_disponible=curso.max_estudiantes
        )
        db.add(horario)
    
    db.commit()
    print(f"   ✅ Creados {len(cursos[:10])} horarios")
else:
    print(f"\n📅 Horarios existentes: {len(horarios)}")

# 3. Buscar estudiante
estudiante = db.query(Usuario).filter(Usuario.email == "estudiante1@uni.edu").first()
if not estudiante:
    print("❌ Estudiante no encontrado")
    db.close()
    exit()

print(f"\n👤 Estudiante: {estudiante.email} (ID: {estudiante.id})")

# 4. Eliminar matrículas anteriores del estudiante
db.query(Matricula).filter(Matricula.estudiante_id == estudiante.id).delete()
print("   🗑️ Matrículas anteriores eliminadas")

# 5. Crear nuevas matrículas
horarios_para_matricular = db.query(HorarioGenerado).limit(5).all()
print(f"\n📋 Matriculando en {len(horarios_para_matricular)} cursos:")

for h in horarios_para_matricular:
    curso = db.query(CursoDB).filter(CursoDB.id == h.curso_id).first()
    matricula = Matricula(
        estudiante_id=estudiante.id,
        horario_id=h.id,
        periodo="2025-1",
        estado="activa"
    )
    db.add(matricula)
    print(f"   ✅ {curso.codigo if curso else 'N/A'} - {h.franja}")

db.commit()

# 6. Verificar
matriculas_final = db.query(Matricula).filter(Matricula.estudiante_id == estudiante.id).all()
print(f"\n📊 Verificación: {len(matriculas_final)} matrículas activas")

for m in matriculas_final:
    h = db.query(HorarioGenerado).filter(HorarioGenerado.id == m.horario_id).first()
    curso = db.query(CursoDB).filter(CursoDB.id == h.curso_id).first() if h else None
    print(f"   - Matrícula {m.id}: {curso.codigo if curso else 'N/A'} - {h.franja if h else 'N/A'}")

db.close()
print("\n✅ Proceso completado. Reinicia el backend y prueba 'Mi Horario'")