# seed_sistemas.py (versión corregida con limpieza)
import json
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, engine, Base
from models.db_models import Facultad, Programa, Docente, Aula, CursoDB, Usuario, HorarioGenerado, Matricula
from auth import get_password_hash

def drop_all_tables():
    """Eliminar todas las tablas existentes"""
    print("🗑️  Eliminando tablas existentes...")
    Base.metadata.drop_all(bind=engine)
    print("✅ Tablas eliminadas")

def create_tables():
    """Crear todas las tablas"""
    print("📦 Creando tablas...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tablas creadas")

def clear_all_data(db):
    """Limpiar datos existentes (alternativa a drop tables)"""
    print("🧹 Limpiando datos existentes...")
    db.query(Matricula).delete()
    db.query(HorarioGenerado).delete()
    db.query(CursoDB).delete()
    db.query(Programa).delete()
    db.query(Facultad).delete()
    db.query(Docente).delete()
    db.query(Aula).delete()
    db.query(Usuario).delete()
    db.commit()
    print("✅ Datos limpiados")

def seed_facultades(db):
    """Poblar facultad de Ingeniería"""
    print("🏛️  Poblando facultades...")
    
    # Verificar si ya existe
    existing = db.query(Facultad).filter(Facultad.codigo == "FI").first()
    if existing:
        print("   Facultad ya existe, omitiendo...")
        return db.query(Facultad).all()
    
    facultades = [
        Facultad(codigo="FI", nombre="Facultad de Ingeniería", activo=True),
    ]
    
    for f in facultades:
        db.add(f)
    db.commit()
    print(f"✅ {len(facultades)} facultad creada")
    return db.query(Facultad).all()

def seed_programas(db, facultades):
    """Poblar programa de Ingeniería de Sistemas"""
    print("📚 Poblando programa...")
    
    # Verificar si ya existe
    existing = db.query(Programa).filter(Programa.codigo == "ING-SIST").first()
    if existing:
        print("   Programa ya existe, omitiendo...")
        return db.query(Programa).all()
    
    programas = [
        Programa(
            codigo="ING-SIST", 
            nombre="Ingeniería de Sistemas e Informática", 
            facultad_id=facultades[0].id, 
            activo=True
        ),
    ]
    
    for p in programas:
        db.add(p)
    db.commit()
    print(f"✅ {len(programas)} programa creado")
    return db.query(Programa).all()

def seed_docentes(db):
    """Poblar docentes"""
    print("👨‍🏫 Poblando docentes...")
    
    # Verificar si ya existen
    existing_count = db.query(Docente).count()
    if existing_count > 0:
        print(f"   Ya existen {existing_count} docentes, omitiendo...")
        return db.query(Docente).all()
    
    docentes = [
        Docente(
            codigo="DOC001", nombre="Juan Carlos", apellido="Pérez Ramírez",
            email="jperez@uni.edu", 
            disponibilidad=json.dumps(["Lunes 07:00-09:00", "Lunes 09:00-11:00", "Miércoles 07:00-09:00"]),
            max_horas_semanales=20, activo=True
        ),
        Docente(
            codigo="DOC002", nombre="María Elena", apellido="González Torres",
            email="mgonzalez@uni.edu",
            disponibilidad=json.dumps(["Martes 07:00-09:00", "Martes 09:00-11:00", "Jueves 07:00-09:00"]),
            max_horas_semanales=20, activo=True
        ),
        Docente(
            codigo="DOC003", nombre="Carlos Alberto", apellido="Rodríguez López",
            email="crodriguez@uni.edu",
            disponibilidad=json.dumps(["Lunes 11:00-13:00", "Miércoles 11:00-13:00", "Viernes 09:00-11:00"]),
            max_horas_semanales=20, activo=True
        ),
        Docente(
            codigo="DOC004", nombre="Ana María", apellido="Martínez Sánchez",
            email="amartinez@uni.edu",
            disponibilidad=json.dumps(["Martes 11:00-13:00", "Jueves 11:00-13:00", "Viernes 07:00-09:00"]),
            max_horas_semanales=20, activo=True
        ),
        Docente(
            codigo="DOC005", nombre="Luis Fernando", apellido="Sánchez Mendoza",
            email="lsanchez@uni.edu",
            disponibilidad=json.dumps(["Miércoles 13:00-15:00", "Jueves 13:00-15:00", "Viernes 11:00-13:00"]),
            max_horas_semanales=20, activo=True
        ),
        Docente(
            codigo="DOC006", nombre="Patricia Elena", apellido="López Fernández",
            email="plopez@uni.edu",
            disponibilidad=json.dumps(["Lunes 15:00-17:00", "Martes 15:00-17:00", "Miércoles 15:00-17:00"]),
            max_horas_semanales=20, activo=True
        ),
        Docente(
            codigo="DOC007", nombre="Ricardo Javier", apellido="Torres Medina",
            email="rtorres@uni.edu",
            disponibilidad=json.dumps(["Lunes 07:00-09:00", "Miércoles 09:00-11:00", "Viernes 13:00-15:00"]),
            max_horas_semanales=20, activo=True
        ),
    ]
    
    for d in docentes:
        db.add(d)
    db.commit()
    print(f"✅ {len(docentes)} docentes creados")
    return db.query(Docente).all()

def seed_aulas(db):
    """Poblar aulas"""
    print("🏫 Poblando aulas...")
    
    # Verificar si ya existen
    existing_count = db.query(Aula).count()
    if existing_count > 0:
        print(f"   Ya existen {existing_count} aulas, omitiendo...")
        return db.query(Aula).all()
    
    aulas = [
        Aula(codigo="A101", nombre="Aula 101 - Edificio A", capacidad=40, tipo="teoria", edificio="A", piso=1, recursos=json.dumps(["proyector", "pizarra", "computadora"]), activa=True),
        Aula(codigo="A102", nombre="Aula 102 - Edificio A", capacidad=40, tipo="teoria", edificio="A", piso=1, recursos=json.dumps(["proyector", "pizarra"]), activa=True),
        Aula(codigo="A103", nombre="Aula 103 - Edificio A", capacidad=45, tipo="teoria", edificio="A", piso=1, recursos=json.dumps(["proyector", "pizarra", "TV"]), activa=True),
        Aula(codigo="B201", nombre="Aula 201 - Edificio B", capacidad=35, tipo="teoria", edificio="B", piso=2, recursos=json.dumps(["proyector", "pizarra"]), activa=True),
        Aula(codigo="B202", nombre="Aula 202 - Edificio B", capacidad=35, tipo="teoria", edificio="B", piso=2, recursos=json.dumps(["proyector", "pizarra"]), activa=True),
        Aula(codigo="LAB101", nombre="Laboratorio de Computo 1", capacidad=30, tipo="laboratorio", edificio="Laboratorios", piso=1, recursos=json.dumps(["computadoras", "proyector", "internet", "software especializado"]), activa=True),
        Aula(codigo="LAB102", nombre="Laboratorio de Computo 2", capacidad=30, tipo="laboratorio", edificio="Laboratorios", piso=1, recursos=json.dumps(["computadoras", "proyector", "internet"]), activa=True),
        Aula(codigo="LAB103", nombre="Laboratorio de Redes", capacidad=25, tipo="laboratorio", edificio="Laboratorios", piso=2, recursos=json.dumps(["computadoras", "router", "switch", "internet"]), activa=True),
    ]
    
    for a in aulas:
        db.add(a)
    db.commit()
    print(f"✅ {len(aulas)} aulas creadas")
    return db.query(Aula).all()

def seed_cursos_sistemas(db, programa, docentes):
    """Poblar cursos de Ingeniería de Sistemas - Ciclos 1, 2 y 3"""
    print("📖 Poblando cursos de Ingeniería de Sistemas (Ciclos 1, 2 y 3)...")
    
    # Verificar si ya existen
    existing_count = db.query(CursoDB).count()
    if existing_count > 0:
        print(f"   Ya existen {existing_count} cursos, omitiendo...")
        return db.query(CursoDB).all()
    
    cursos = [
        # ========== CICLO 1 ==========
        CursoDB(
            codigo="SIS101", nombre="Introducción a la Ingeniería de Sistemas", 
            creditos=3, semestre=1, programa_id=programa.id, docente_id=docentes[0].id,
            max_estudiantes=40, tipo="teoria", horas_semanales=3
        ),
        CursoDB(
            codigo="SIS102", nombre="Matemática Básica", 
            creditos=4, semestre=1, programa_id=programa.id, docente_id=docentes[1].id,
            max_estudiantes=40, tipo="teoria", horas_semanales=5
        ),
        CursoDB(
            codigo="SIS103", nombre="Comunicación y Redacción", 
            creditos=3, semestre=1, programa_id=programa.id, docente_id=docentes[6].id,
            max_estudiantes=40, tipo="teoria", horas_semanales=3
        ),
        CursoDB(
            codigo="SIS104", nombre="Introducción a la Programación", 
            creditos=4, semestre=1, programa_id=programa.id, docente_id=docentes[0].id,
            max_estudiantes=35, tipo="teoria", horas_semanales=5
        ),
        CursoDB(
            codigo="SIS105", nombre="Metodología del Estudio Universitario", 
            creditos=2, semestre=1, programa_id=programa.id, docente_id=docentes[6].id,
            max_estudiantes=40, tipo="teoria", horas_semanales=2
        ),
        
        # ========== CICLO 2 ==========
        CursoDB(
            codigo="SIS201", nombre="Cálculo Diferencial", 
            creditos=4, semestre=2, programa_id=programa.id, docente_id=docentes[1].id,
            max_estudiantes=40, tipo="teoria", horas_semanales=5
        ),
        CursoDB(
            codigo="SIS202", nombre="Álgebra Lineal", 
            creditos=3, semestre=2, programa_id=programa.id, docente_id=docentes[2].id,
            max_estudiantes=40, tipo="teoria", horas_semanales=4
        ),
        CursoDB(
            codigo="SIS203", nombre="Programación Estructurada", 
            creditos=4, semestre=2, programa_id=programa.id, docente_id=docentes[0].id,
            max_estudiantes=35, tipo="laboratorio", horas_semanales=5
        ),
        CursoDB(
            codigo="SIS204", nombre="Física General", 
            creditos=4, semestre=2, programa_id=programa.id, docente_id=docentes[3].id,
            max_estudiantes=40, tipo="teoria", horas_semanales=5
        ),
        CursoDB(
            codigo="SIS205", nombre="Metodología de la Investigación", 
            creditos=3, semestre=2, programa_id=programa.id, docente_id=docentes[4].id,
            max_estudiantes=40, tipo="teoria", horas_semanales=3
        ),
        CursoDB(
            codigo="SIS206", nombre="Inglés Técnico I", 
            creditos=2, semestre=2, programa_id=programa.id, docente_id=docentes[5].id,
            max_estudiantes=40, tipo="teoria", horas_semanales=2
        ),
        
        # ========== CICLO 3 ==========
        CursoDB(
            codigo="SIS301", nombre="Cálculo Integral", 
            creditos=4, semestre=3, programa_id=programa.id, docente_id=docentes[1].id,
            max_estudiantes=40, tipo="teoria", horas_semanales=5
        ),
        CursoDB(
            codigo="SIS302", nombre="Matemática Discreta", 
            creditos=3, semestre=3, programa_id=programa.id, docente_id=docentes[2].id,
            max_estudiantes=35, tipo="teoria", horas_semanales=4
        ),
        CursoDB(
            codigo="SIS303", nombre="Programación Orientada a Objetos", 
            creditos=4, semestre=3, programa_id=programa.id, docente_id=docentes[0].id,
            max_estudiantes=35, tipo="laboratorio", horas_semanales=5
        ),
        CursoDB(
            codigo="SIS304", nombre="Estructura de Datos", 
            creditos=4, semestre=3, programa_id=programa.id, docente_id=docentes[2].id,
            max_estudiantes=35, tipo="teoria", horas_semanales=5
        ),
        CursoDB(
            codigo="SIS305", nombre="Estadística y Probabilidades", 
            creditos=3, semestre=3, programa_id=programa.id, docente_id=docentes[3].id,
            max_estudiantes=40, tipo="teoria", horas_semanales=4
        ),
        CursoDB(
            codigo="SIS306", nombre="Inglés Técnico II", 
            creditos=2, semestre=3, programa_id=programa.id, docente_id=docentes[5].id,
            max_estudiantes=40, tipo="teoria", horas_semanales=2
        ),
        CursoDB(
            codigo="SIS307", nombre="Sistemas Digitales", 
            creditos=3, semestre=3, programa_id=programa.id, docente_id=docentes[3].id,
            max_estudiantes=35, tipo="laboratorio", horas_semanales=4
        ),
    ]
    
    for c in cursos:
        db.add(c)
    db.commit()
    print(f"✅ {len(cursos)} cursos creados (Ciclos 1, 2 y 3)")
    return db.query(CursoDB).all()

def seed_usuarios(db):
    """Poblar usuarios de prueba"""
    print("👤 Poblando usuarios...")
    
    # Verificar si ya existen
    existing_count = db.query(Usuario).count()
    if existing_count > 0:
        print(f"   Ya existen {existing_count} usuarios, omitiendo...")
        return
    
    usuarios = [
        Usuario(email="admin@uni.edu", hashed_password=get_password_hash("admin123"), nombre="Admin", apellido="Sistema", rol="admin", activo=True),
        Usuario(email="coord.sistemas@uni.edu", hashed_password=get_password_hash("coord123"), nombre="Coordinador", apellido="Sistemas", rol="coordinador", activo=True),
        Usuario(email="estudiante1@uni.edu", hashed_password=get_password_hash("est123"), nombre="Carlos", apellido="Alvarez", rol="estudiante", activo=True),
        Usuario(email="estudiante2@uni.edu", hashed_password=get_password_hash("est123"), nombre="María", apellido="Fernández", rol="estudiante", activo=True),
        Usuario(email="estudiante3@uni.edu", hashed_password=get_password_hash("est123"), nombre="José", apellido="Ramírez", rol="estudiante", activo=True),
        Usuario(email="docente1@uni.edu", hashed_password=get_password_hash("doc123"), nombre="Juan Carlos", apellido="Pérez", rol="docente", activo=True),
    ]
    
    for u in usuarios:
        db.add(u)
    db.commit()
    print(f"✅ {len(usuarios)} usuarios creados")

def mostrar_resumen(programa, cursos, docentes, aulas):
    """Mostrar resumen de datos cargados"""
    print("\n" + "="*60)
    print("📊 MALLA CURRICULAR - INGENIERÍA DE SISTEMAS")
    print("="*60)
    
    if not cursos:
        print("\n⚠️  No se cargaron cursos nuevos (ya existían)")
        return
    
    ciclos = {}
    for curso in cursos:
        if curso.semestre not in ciclos:
            ciclos[curso.semestre] = []
        ciclos[curso.semestre].append(curso)
    
    for ciclo in sorted(ciclos.keys()):
        print(f"\n📍 CICLO {ciclo}")
        print("-"*40)
        for curso in ciclos[ciclo]:
            docente = next((d for d in docentes if d.id == curso.docente_id), None)
            print(f"  • {curso.codigo} - {curso.nombre}")
            print(f"    Créditos: {curso.creditos} | Horas: {curso.horas_semanales} | Docente: {docente.nombre if docente else 'N/A'}")
    
    print("\n" + "="*60)
    print("✅ SEEDING COMPLETADO EXITOSAMENTE")
    print("="*60)
    print(f"\n📈 RESUMEN GENERAL:")
    print(f"   • Facultad: Ingeniería")
    print(f"   • Programa: {programa.nombre}")
    print(f"   • Total Cursos: {len(cursos)}")
    print(f"   • Ciclos: 1, 2 y 3")
    print(f"   • Créditos totales: {sum(c.creditos for c in cursos)}")
    print(f"   • Docentes: {len(docentes)}")
    print(f"   • Aulas: {len(aulas)}")
    
    print("\n🔐 CREDENCIALES DE ACCESO:")
    print("   • Admin: admin@uni.edu / admin123")
    print("   • Coordinador Sistemas: coord.sistemas@uni.edu / coord123")
    print("   • Estudiante: estudiante1@uni.edu / est123")
    print("   • Docente: docente1@uni.edu / doc123")
    print("\n" + "="*60 + "\n")

def main():
    print("\n" + "="*60)
    print("🚀 INICIANDO SEEDING - INGENIERÍA DE SISTEMAS")
    print("📚 Malla Curricular - Ciclos 1, 2 y 3")
    print("="*60 + "\n")
    
    # Preguntar si quiere limpiar todo
    respuesta = input("¿Deseas limpiar todas las tablas antes de insertar? (s/n): ")
    
    db = SessionLocal()
    
    try:
        if respuesta.lower() == 's':
            drop_all_tables()
            create_tables()
        else:
            # Solo crear tablas si no existen
            create_tables()
        
        # Poblar datos
        facultades = seed_facultades(db)
        programas = seed_programas(db, facultades)
        docentes = seed_docentes(db)
        aulas = seed_aulas(db)
        cursos = seed_cursos_sistemas(db, programas[0], docentes)
        seed_usuarios(db)
        
        # Mostrar resumen
        mostrar_resumen(programas[0], cursos, docentes, aulas)
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()