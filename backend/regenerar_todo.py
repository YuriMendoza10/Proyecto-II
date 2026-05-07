# D:\TALLER 2\optiacademic\backend\regenerar_todo.py
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models.db_models import CursoDB, Docente, Aula, HorarioGenerado, Matricula, Usuario
from csp_engine import CSPEngine
import random

db = SessionLocal()

print("="*60)
print("🔄 REGENERANDO HORARIOS Y MATRÍCULAS")
print("="*60)

# 1. Limpiar todo
print("\n🗑️ Limpiando datos existentes...")
db.query(Matricula).delete()
db.query(HorarioGenerado).delete()
db.commit()
print("   ✅ Datos limpiados")

# 2. Obtener datos
cursos = db.query(CursoDB).all()
aulas = db.query(Aula).all()
docentes = db.query(Docente).all()

print(f"\n📚 Cursos: {len(cursos)}")
print(f"👨‍🏫 Docentes: {len(docentes)}")
print(f"🏫 Aulas: {len(aulas)}")

if len(cursos) == 0:
    print("❌ No hay cursos. Ejecuta seed primero.")
    db.close()
    exit()

# 3. Preparar datos para CSP
cursos_data = []
for c in cursos:
    docente_codigo = next((d.codigo for d in docentes if d.id == c.docente_id), "DOC001")
    cursos_data.append({
        "id": c.codigo,
        "nombre": c.nombre,
        "docente_id": docente_codigo,
        "max_estudiantes": c.max_estudiantes,
        "tipo": c.tipo,
        "semestre": c.semestre,
        "horas_teoria": c.horas_semanales,
        "horas_laboratorio": 0,
        "horas_practica": 0,
        "minutos_por_hora": 90
    })

aulas_data = [{"id": a.codigo, "capacidad": a.capacidad, "tipo": a.tipo, "recursos": []} for a in aulas]
docentes_data = [{"id": d.codigo, "nombre": f"{d.nombre} {d.apellido}", "disponibilidad": []} for d in docentes]

# 4. Ejecutar CSP
print("\n⚙️ Generando horarios con CSP...")
engine = CSPEngine()
resultado = engine.resolver(cursos_data, aulas_data, docentes_data)

print(f"   ✅ Generados {len(resultado['horario_generado'])} horarios")
print(f"   ✅ Sin conflictos: {resultado['estadisticas'].get('es_valido', 'N/A')}")

if resultado['estadisticas'].get('conflictos', []):
    print(f"   ⚠️ Conflictos detectados: {len(resultado['estadisticas']['conflictos'])}")
    for conf in resultado['estadisticas']['conflictos'][:3]:
        print(f"      - {conf}")

# 5. Guardar horarios
print("\n💾 Guardando horarios en BD...")
periodo = "2025-1"
guardados = 0

for h in resultado['horario_generado']:
    curso = db.query(CursoDB).filter(CursoDB.codigo == h['curso_id']).first()
    docente = db.query(Docente).filter(Docente.codigo == h['docente_id']).first()
    aula = db.query(Aula).filter(Aula.codigo == h['aula_id']).first()
    
    if curso:
        horario = HorarioGenerado(
            periodo=periodo,
            curso_id=curso.id,
            docente_id=docente.id if docente else None,
            aula_id=aula.id if aula else None,
            franja=h['franja'],
            seccion='A',
            cupo_maximo=curso.max_estudiantes,
            cupo_disponible=curso.max_estudiantes
        )
        db.add(horario)
        guardados += 1

db.commit()
print(f"   ✅ Guardados {guardados} horarios")

# 6. Matricular al estudiante
estudiante = db.query(Usuario).filter(Usuario.email == "estudiante1@uni.edu").first()
if estudiante:
    print(f"\n👤 Matriculando a {estudiante.email}...")
    
    # Obtener horarios únicos por curso
    horarios_para_matricular = []
    cursos_vistos = set()
    
    for h in db.query(HorarioGenerado).all():
        if h.curso_id not in cursos_vistos:
            cursos_vistos.add(h.curso_id)
            horarios_para_matricular.append(h)
            if len(horarios_para_matricular) >= 5:
                break
    
    for h in horarios_para_matricular:
        matricula = Matricula(
            estudiante_id=estudiante.id,
            horario_id=h.id,
            periodo=periodo,
            estado="activa"
        )
        db.add(matricula)
        curso = db.query(CursoDB).filter(CursoDB.id == h.curso_id).first()
        print(f"   ✅ {curso.codigo} - {curso.nombre[:35]} → {h.franja}")
    
    db.commit()
    print(f"\n✅ Matriculado en {len(horarios_para_matricular)} cursos")
else:
    print("❌ Estudiante no encontrado")

# 7. Verificación final
horarios_final = db.query(HorarioGenerado).count()
matriculas_final = db.query(Matricula).count()
print(f"\n📊 Verificación final:")
print(f"   Horarios en BD: {horarios_final}")
print(f"   Matrículas en BD: {matriculas_final}")

db.close()
print("\n✅ Proceso completado. Reinicia el backend y recarga la página.")