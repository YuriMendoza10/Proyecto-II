from database import get_db
from models.db_models import CursoDB, Aula, Docente
from csp_engine_profesional import CSPEngineProfesional

db = next(get_db())

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
aulas_data = [
    {'id': a.id, 'codigo': a.codigo, 'nombre': a.nombre, 'capacidad': a.capacidad or 30, 'tipo': a.tipo or 'teoria'}
    for a in aulas_db
]
docentes_data = [
    {'id': d.id, 'codigo': d.codigo, 'nombre': f'{d.nombre} {d.apellido}'}
    for d in docentes_db
]

print(f'Cursos semestre {semestre}: {len(cursos_data)}')
print(f'Aulas activas: {len(aulas_data)}')
print(f'Docentes activos: {len(docentes_data)}')

engine = CSPEngineProfesional()
resultado = engine.generar_multiples_horarios(
    cursos=cursos_data,
    aulas=aulas_data,
    docentes=docentes_data,
    semestre=semestre,
    num_soluciones=1
)

if resultado['soluciones']:
    sol = resultado['soluciones'][0]
    stats = sol['estadisticas']
    print(f"Asignados: {stats['total_asignados']}")
    if sol['horario_generado']:
        item = sol['horario_generado'][0]
        print("Sample item:")
        for k, v in item.items():
            print(f"  {k}: {repr(v)}")
else:
    print('No se generaron soluciones')
