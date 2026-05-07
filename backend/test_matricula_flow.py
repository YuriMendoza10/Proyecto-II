"""Test de integracion: simula flujo guardar-solucion -> matricular"""
import sys
sys.path.insert(0, '.')

from database import get_db
from models.db_models import CursoDB, Aula, Docente, HorarioGenerado, Matricula, Usuario
from csp_engine_profesional import CSPEngineProfesional
from main import guardar_solucion_horario, GuardarSolucionRequest

db = next(get_db())

# 1. Obtener un usuario estudiante
estudiante = db.query(Usuario).filter(Usuario.rol == 'estudiante').first()
if not estudiante:
    print("ERROR: No hay estudiantes en la BD")
    sys.exit(1)
print(f"OK Estudiante: {estudiante.email} (id={estudiante.id})")

# 2. Generar solucion CSP para semestre 1
semestre = 1
cursos_db = db.query(CursoDB).filter(CursoDB.semestre == semestre).all()
aulas_db = db.query(Aula).filter(Aula.activa == True).all()
docentes_db = db.query(Docente).filter(Docente.activo == True).all()

cursos_data = [
    {'id': c.id, 'codigo': c.codigo, 'nombre': c.nombre, 'creditos': c.creditos,
     'semestre': c.semestre, 'tipo': c.tipo or 'teoria', 'horas_semanales': c.horas_semanales or 4,
     'max_estudiantes': c.max_estudiantes or 30, 'docente_id': c.docente_id, 'programa_id': c.programa_id}
    for c in cursos_db
]
aulas_data = [{'id': a.id, 'codigo': a.codigo, 'nombre': a.nombre, 'capacidad': a.capacidad or 30, 'tipo': a.tipo or 'teoria'} for a in aulas_db]
docentes_data = [{'id': d.id, 'codigo': d.codigo, 'nombre': f'{d.nombre} {d.apellido}'} for d in docentes_db]

engine = CSPEngineProfesional()
resultado = engine.generar_multiples_horarios(
    cursos=cursos_data, aulas=aulas_data, docentes=docentes_data,
    semestre=semestre, num_soluciones=1
)

if not resultado['soluciones']:
    print("ERROR: No se generaron soluciones")
    sys.exit(1)

sol = resultado['soluciones'][0]
asignados = sol['estadisticas']['total_asignados']
print(f"OK Solucion generada: {asignados} cursos asignados")
print(f"   Items a guardar: {len(sol['horario_generado'])}")
print(f"   Sample item: {sol['horario_generado'][0]}")

# 3. Llamar al endpoint guardar-solucion-horario
request_data = GuardarSolucionRequest(semestre=semestre, horario_generado=sol['horario_generado'])
print("\n--- Llamando a guardar_solucion_horario ---")
try:
    respuesta = guardar_solucion_horario(
        data=request_data,
        current_user=estudiante,
        db=db
    )
    print(f"OK Respuesta: {respuesta}")
    print(f"   IDs creados: {respuesta['horario_ids']}")
    if respuesta.get('advertencias'):
        print(f"   WARN advertencias: {respuesta['advertencias']}")
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
