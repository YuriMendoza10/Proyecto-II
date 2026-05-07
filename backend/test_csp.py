# D:\TALLER 2\optiacademic\backend\test_csp.py
from csp_engine_profesional import CSPEngineProfesional

print("Importación exitosa")

engine = CSPEngineProfesional()
print("Motor creado correctamente")

# Prueba simple
cursos = [{"id": "TEST01", "nombre": "Test", "docente_id": "DOC001", "tipo": "teoria", "semestre": 1, "creditos": 4}]
aulas = [{"id": "A101", "capacidad": 40, "tipo": "teoria"}]
docentes = [{"id": "DOC001", "nombre": "Docente Test"}]

resultado = engine.generar_multiples_horarios(cursos, aulas, docentes, semestre=1, num_soluciones=2)
print(f"Resultado: {len(resultado)} soluciones")