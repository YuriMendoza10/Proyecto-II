# verificar_matricula_detalle.py
from database import SessionLocal
from models.db_models import Matricula, HorarioGenerado, CursoDB, Usuario

db = SessionLocal()

print("="*60)
print("VERIFICANDO MATRÍCULAS DETALLADAMENTE")
print("="*60)

# Buscar al estudiante Carlos Alvarez
estudiante = db.query(Usuario).filter(Usuario.nombre == "Carlos").first()
if estudiante:
    print(f"\n👤 Estudiante: {estudiante.nombre} {estudiante.apellido} (ID: {estudiante.id})")
    
    # Buscar matrículas
    matriculas = db.query(Matricula).filter(Matricula.estudiante_id == estudiante.id).all()
    print(f"📋 Matrículas encontradas: {len(matriculas)}")
    
    for m in matriculas:
        print(f"\n   Matrícula ID: {m.id}")
        print(f"   Horario ID: {m.horario_id}")
        print(f"   Periodo: {m.periodo}")
        print(f"   Estado: {m.estado}")
        
        # Buscar horario
        h = db.query(HorarioGenerado).filter(HorarioGenerado.id == m.horario_id).first()
        if h:
            print(f"   ✅ Horario encontrado: {h.franja}")
            curso = db.query(CursoDB).filter(CursoDB.id == h.curso_id).first()
            if curso:
                print(f"   ✅ Curso: {curso.codigo} - {curso.nombre}")
            else:
                print(f"   ❌ Curso no encontrado para ID: {h.curso_id}")
        else:
            print(f"   ❌ Horario NO encontrado para ID: {m.horario_id}")
else:
    print("❌ Estudiante Carlos Alvarez no encontrado")

db.close()