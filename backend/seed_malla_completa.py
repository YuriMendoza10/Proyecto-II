# seed_malla_completa.py
import json
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, engine, Base
from models.db_models import Facultad, Programa, Docente, Aula, CursoDB, Usuario
from auth import get_password_hash

def drop_all_tables():
    """Eliminar todas las tablas existentes"""
    print("🗑️  Eliminando tablas existentes...")
    Base.metadata.drop_all(bind=engine)
    print("✅ Tablas eliminadas")

def create_all_tables():
    """Crear todas las tablas"""
    print("📦 Creando tablas...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tablas creadas")

def seed_facultades(db):
    """Poblar facultad de Ingeniería"""
    print("🏛️  Poblando facultades...")
    
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
    """Poblar docentes con disponibilidad de Lunes a Viernes"""
    print("👨‍🏫 Poblando docentes...")
    
    docentes = [
        Docente(
            codigo="DOC001", nombre="Juan Carlos", apellido="Pérez Ramírez",
            email="jperez@uni.edu", 
            disponibilidad=json.dumps([
                "Lunes 07:00-09:00", "Lunes 09:00-11:00", "Lunes 11:00-13:00",
                "Miércoles 07:00-09:00", "Miércoles 09:00-11:00", "Miércoles 11:00-13:00",
                "Viernes 07:00-09:00", "Viernes 09:00-11:00"
            ]),
            max_horas_semanales=20, activo=True
        ),
        Docente(
            codigo="DOC002", nombre="María Elena", apellido="González Torres",
            email="mgonzalez@uni.edu",
            disponibilidad=json.dumps([
                "Lunes 13:00-15:00", "Lunes 15:00-17:00",
                "Martes 07:00-09:00", "Martes 09:00-11:00", "Martes 11:00-13:00",
                "Jueves 07:00-09:00", "Jueves 09:00-11:00"
            ]),
            max_horas_semanales=20, activo=True
        ),
        Docente(
            codigo="DOC003", nombre="Carlos Alberto", apellido="Rodríguez López",
            email="crodriguez@uni.edu",
            disponibilidad=json.dumps([
                "Martes 13:00-15:00", "Martes 15:00-17:00",
                "Miércoles 13:00-15:00", "Miércoles 15:00-17:00",
                "Jueves 13:00-15:00", "Jueves 15:00-17:00",
                "Viernes 11:00-13:00"
            ]),
            max_horas_semanales=20, activo=True
        ),
        Docente(
            codigo="DOC004", nombre="Ana María", apellido="Martínez Sánchez",
            email="amartinez@uni.edu",
            disponibilidad=json.dumps([
                "Lunes 07:00-09:00", "Lunes 09:00-11:00",
                "Martes 07:00-09:00", "Martes 09:00-11:00",
                "Miércoles 07:00-09:00", "Miércoles 09:00-11:00",
                "Jueves 07:00-09:00"
            ]),
            max_horas_semanales=20, activo=True
        ),
        Docente(
            codigo="DOC005", nombre="Luis Fernando", apellido="Sánchez Mendoza",
            email="lsanchez@uni.edu",
            disponibilidad=json.dumps([
                "Lunes 11:00-13:00", "Lunes 13:00-15:00",
                "Martes 11:00-13:00", "Martes 13:00-15:00",
                "Miércoles 11:00-13:00",
                "Jueves 11:00-13:00", "Jueves 13:00-15:00"
            ]),
            max_horas_semanales=20, activo=True
        ),
        Docente(
            codigo="DOC006", nombre="Patricia Elena", apellido="López Fernández",
            email="plopez@uni.edu",
            disponibilidad=json.dumps([
                "Lunes 15:00-17:00", "Lunes 17:00-19:00",
                "Martes 15:00-17:00",
                "Miércoles 15:00-17:00", "Miércoles 17:00-19:00",
                "Jueves 15:00-17:00",
                "Viernes 13:00-15:00"
            ]),
            max_horas_semanales=20, activo=True
        ),
        Docente(
            codigo="DOC007", nombre="Ricardo Javier", apellido="Torres Medina",
            email="rtorres@uni.edu",
            disponibilidad=json.dumps([
                "Viernes 07:00-09:00", "Viernes 09:00-11:00", "Viernes 11:00-13:00",
                "Viernes 13:00-15:00", "Viernes 15:00-17:00"
            ]),
            max_horas_semanales=20, activo=True
        ),
        Docente(
            codigo="DOC008", nombre="Carmen Rosa", apellido="Flores Castro",
            email="cflores@uni.edu",
            disponibilidad=json.dumps([
                "Lunes 07:00-09:00", "Martes 07:00-09:00", "Miércoles 07:00-09:00",
                "Jueves 07:00-09:00", "Viernes 07:00-09:00"
            ]),
            max_horas_semanales=20, activo=True
        ),
    ]
    
    for d in docentes:
        db.add(d)
    db.commit()
    print(f"✅ {len(docentes)} docentes creados")
    return db.query(Docente).all()

def seed_aulas(db):
    """Poblar aulas (teoría, laboratorio, taller)"""
    print("🏫 Poblando aulas...")
    
    aulas = [
        # Aulas de teoría
        Aula(codigo="A101", nombre="Aula 101 - Edificio A", capacidad=45, tipo="teoria", edificio="A", piso=1, recursos=json.dumps(["proyector", "pizarra", "computadora"]), activa=True),
        Aula(codigo="A102", nombre="Aula 102 - Edificio A", capacidad=40, tipo="teoria", edificio="A", piso=1, recursos=json.dumps(["proyector", "pizarra"]), activa=True),
        Aula(codigo="A103", nombre="Aula 103 - Edificio A", capacidad=50, tipo="teoria", edificio="A", piso=1, recursos=json.dumps(["proyector", "pizarra", "TV"]), activa=True),
        Aula(codigo="B201", nombre="Aula 201 - Edificio B", capacidad=35, tipo="teoria", edificio="B", piso=2, recursos=json.dumps(["proyector", "pizarra"]), activa=True),
        Aula(codigo="B202", nombre="Aula 202 - Edificio B", capacidad=35, tipo="teoria", edificio="B", piso=2, recursos=json.dumps(["proyector", "pizarra"]), activa=True),
        
        # Laboratorios
        Aula(codigo="LAB101", nombre="Laboratorio de Cómputo 1", capacidad=30, tipo="laboratorio", edificio="Laboratorios", piso=1, recursos=json.dumps(["computadoras", "proyector", "internet", "software"]), activa=True),
        Aula(codigo="LAB102", nombre="Laboratorio de Cómputo 2", capacidad=30, tipo="laboratorio", edificio="Laboratorios", piso=1, recursos=json.dumps(["computadoras", "proyector", "internet"]), activa=True),
        Aula(codigo="LAB103", nombre="Laboratorio de Redes", capacidad=25, tipo="laboratorio", edificio="Laboratorios", piso=2, recursos=json.dumps(["computadoras", "router", "switch", "internet"]), activa=True),
        Aula(codigo="LAB104", nombre="Laboratorio de Electrónica", capacidad=25, tipo="laboratorio", edificio="Laboratorios", piso=2, recursos=json.dumps(["osciloscopios", "multímetros", "protoboards"]), activa=True),
        
        # Talleres
        Aula(codigo="TALLER1", nombre="Taller de Innovación", capacidad=30, tipo="taller", edificio="Innovación", piso=1, recursos=json.dumps(["mesas", "pizarra", "proyector", "herramientas"]), activa=True),
        Aula(codigo="TALLER2", nombre="Taller de Diseño", capacidad=25, tipo="taller", edificio="Innovación", piso=1, recursos=json.dumps(["computadoras", "software diseño", "impresora"]), activa=True),
    ]
    
    for a in aulas:
        db.add(a)
    db.commit()
    print(f"✅ {len(aulas)} aulas creadas")
    return db.query(Aula).all()

def seed_cursos_malla_completa(db, programa, docentes):
    """Poblar cursos con horas de teoría, laboratorio y práctica - Ciclos 1, 2 y 3"""
    print("📖 Poblando cursos - Malla Completa (Ciclos 1, 2 y 3)...")
    
    cursos = []
    
    # ============================================================
    # CICLO 1 - Total créditos: 24
    # ============================================================
    
    # Comprensión y Producción de Textos 1 (Teoría)
    cursos.append(CursoDB(
        codigo="SIS101", nombre="Comprensión y Producción de Textos 1",
        creditos=3, semestre=1, programa_id=programa.id, docente_id=docentes[7].id,
        max_estudiantes=40, tipo="teoria", horas_semanales=3,
        horas_teoria=3, horas_laboratorio=0, horas_practica=0
    ))
    
    # Laboratorio de Liderazgo e Innovación (Taller)
    cursos.append(CursoDB(
        codigo="SIS102", nombre="Laboratorio de Liderazgo e Innovación",
        creditos=3, semestre=1, programa_id=programa.id, docente_id=docentes[6].id,
        max_estudiantes=35, tipo="taller", horas_semanales=4,
        horas_teoria=1, horas_laboratorio=0, horas_practica=3
    ))
    
    # Estrategias y Herramientas Digitales (Laboratorio)
    cursos.append(CursoDB(
        codigo="SIS103", nombre="Estrategias y Herramientas Digitales para el Aprendizaje",
        creditos=4, semestre=1, programa_id=programa.id, docente_id=docentes[0].id,
        max_estudiantes=35, tipo="laboratorio", horas_semanales=5,
        horas_teoria=2, horas_laboratorio=3, horas_practica=0
    ))
    
    # Matemática Básica (Teoría)
    cursos.append(CursoDB(
        codigo="SIS104", nombre="Matemática Básica",
        creditos=4, semestre=1, programa_id=programa.id, docente_id=docentes[1].id,
        max_estudiantes=45, tipo="teoria", horas_semanales=5,
        horas_teoria=5, horas_laboratorio=0, horas_practica=0
    ))
    
    # Matemática Discreta 1 (Teoría)
    cursos.append(CursoDB(
        codigo="SIS105", nombre="Matemática Discreta 1",
        creditos=4, semestre=1, programa_id=programa.id, docente_id=docentes[2].id,
        max_estudiantes=40, tipo="teoria", horas_semanales=5,
        horas_teoria=5, horas_laboratorio=0, horas_practica=0
    ))
    
    # Técnicas de Programación (Laboratorio)
    cursos.append(CursoDB(
        codigo="SIS106", nombre="Técnicas de Programación",
        creditos=3, semestre=1, programa_id=programa.id, docente_id=docentes[0].id,
        max_estudiantes=30, tipo="laboratorio", horas_semanales=5,
        horas_teoria=2, horas_laboratorio=3, horas_practica=0
    ))
    
    # Introducción a la Ingeniería de Sistemas (Teoría)
    cursos.append(CursoDB(
        codigo="SIS107", nombre="Introducción a la Ingeniería de Sistemas e Informática",
        creditos=3, semestre=1, programa_id=programa.id, docente_id=docentes[5].id,
        max_estudiantes=40, tipo="teoria", horas_semanales=3,
        horas_teoria=3, horas_laboratorio=0, horas_practica=0
    ))
    
    # ============================================================
    # CICLO 2 - Total créditos: 24
    # ============================================================
    
    # Comprensión y Producción de Textos 2 (Teoría)
    cursos.append(CursoDB(
        codigo="SIS201", nombre="Comprensión y Producción de Textos 2",
        creditos=4, semestre=2, programa_id=programa.id, docente_id=docentes[7].id,
        max_estudiantes=40, tipo="teoria", horas_semanales=4,
        horas_teoria=4, horas_laboratorio=0, horas_practica=0
    ))
    
    # Electivo General 1 (Teoría)
    cursos.append(CursoDB(
        codigo="SIS202", nombre="Electivo General 1",
        creditos=3, semestre=2, programa_id=programa.id, docente_id=docentes[6].id,
        max_estudiantes=35, tipo="teoria", horas_semanales=3,
        horas_teoria=3, horas_laboratorio=0, horas_practica=0
    ))
    
    # Álgebra Lineal y Geometría Analítica (Teoría)
    cursos.append(CursoDB(
        codigo="SIS203", nombre="Álgebra Lineal y Geometría Analítica",
        creditos=4, semestre=2, programa_id=programa.id, docente_id=docentes[1].id,
        max_estudiantes=40, tipo="teoria", horas_semanales=5,
        horas_teoria=5, horas_laboratorio=0, horas_practica=0
    ))
    
    # Modelado de Negocios (Teoría/Práctica)
    cursos.append(CursoDB(
        codigo="SIS204", nombre="Modelado de Negocios",
        creditos=3, semestre=2, programa_id=programa.id, docente_id=docentes[5].id,
        max_estudiantes=35, tipo="teoria", horas_semanales=4,
        horas_teoria=2, horas_laboratorio=0, horas_practica=2
    ))
    
    # Matemática Superior (Teoría)
    cursos.append(CursoDB(
        codigo="SIS205", nombre="Matemática Superior",
        creditos=4, semestre=2, programa_id=programa.id, docente_id=docentes[2].id,
        max_estudiantes=40, tipo="teoria", horas_semanales=5,
        horas_teoria=5, horas_laboratorio=0, horas_practica=0
    ))
    
    # Matemática Discreta 2 (Teoría)
    cursos.append(CursoDB(
        codigo="SIS206", nombre="Matemática Discreta 2",
        creditos=4, semestre=2, programa_id=programa.id, docente_id=docentes[2].id,
        max_estudiantes=35, tipo="teoria", horas_semanales=5,
        horas_teoria=5, horas_laboratorio=0, horas_practica=0
    ))
    
    # Programación Orientada a Objetos (Laboratorio)
    cursos.append(CursoDB(
        codigo="SIS207", nombre="Programación Orientada a Objetos",
        creditos=2, semestre=2, programa_id=programa.id, docente_id=docentes[0].id,
        max_estudiantes=30, tipo="laboratorio", horas_semanales=4,
        horas_teoria=2, horas_laboratorio=2, horas_practica=0
    ))
    
    # ============================================================
    # CICLO 3 - Total créditos: 24
    # ============================================================
    
    # Estadística y Probabilidades (Teoría/Práctica)
    cursos.append(CursoDB(
        codigo="SIS301", nombre="Estadística y Probabilidades",
        creditos=4, semestre=3, programa_id=programa.id, docente_id=docentes[3].id,
        max_estudiantes=40, tipo="teoria", horas_semanales=5,
        horas_teoria=3, horas_laboratorio=0, horas_practica=2
    ))
    
    # Electivo General 2 (Teoría)
    cursos.append(CursoDB(
        codigo="SIS302", nombre="Electivo General 2",
        creditos=3, semestre=3, programa_id=programa.id, docente_id=docentes[6].id,
        max_estudiantes=35, tipo="teoria", horas_semanales=3,
        horas_teoria=3, horas_laboratorio=0, horas_practica=0
    ))
    
    # Laboratorio de Liderazgo e Innovación Intermedio (Taller)
    cursos.append(CursoDB(
        codigo="SIS303", nombre="Laboratorio de Liderazgo e Innovación Intermedio",
        creditos=2, semestre=3, programa_id=programa.id, docente_id=docentes[6].id,
        max_estudiantes=30, tipo="taller", horas_semanales=3,
        horas_teoria=1, horas_laboratorio=0, horas_practica=2
    ))
    
    # Cálculo Diferencial (Teoría)
    cursos.append(CursoDB(
        codigo="SIS304", nombre="Cálculo Diferencial",
        creditos=4, semestre=3, programa_id=programa.id, docente_id=docentes[1].id,
        max_estudiantes=40, tipo="teoria", horas_semanales=5,
        horas_teoria=5, horas_laboratorio=0, horas_practica=0
    ))
    
    # Física 1 (Teoría + Laboratorio)
    cursos.append(CursoDB(
        codigo="SIS305", nombre="Física 1",
        creditos=4, semestre=3, programa_id=programa.id, docente_id=docentes[3].id,
        max_estudiantes=40, tipo="laboratorio", horas_semanales=6,
        horas_teoria=3, horas_laboratorio=3, horas_practica=0
    ))
    
    # Base de Datos 1 (Laboratorio)
    cursos.append(CursoDB(
        codigo="SIS306", nombre="Base de Datos 1",
        creditos=3, semestre=3, programa_id=programa.id, docente_id=docentes[4].id,
        max_estudiantes=30, tipo="laboratorio", horas_semanales=5,
        horas_teoria=2, horas_laboratorio=3, horas_practica=0
    ))
    
    # Diseño Web (Laboratorio/Práctica)
    cursos.append(CursoDB(
        codigo="SIS307", nombre="Diseño Web",
        creditos=2, semestre=3, programa_id=programa.id, docente_id=docentes[4].id,
        max_estudiantes=30, tipo="laboratorio", horas_semanales=4,
        horas_teoria=1, horas_laboratorio=2, horas_practica=1
    ))
    
    # Estructura de Datos (Teoría + Práctica)
    cursos.append(CursoDB(
        codigo="SIS308", nombre="Estructura de Datos",
        creditos=3, semestre=3, programa_id=programa.id, docente_id=docentes[0].id,
        max_estudiantes=30, tipo="teoria", horas_semanales=5,
        horas_teoria=3, horas_laboratorio=0, horas_practica=2
    ))
    
    for c in cursos:
        db.add(c)
    db.commit()
    print(f"✅ {len(cursos)} cursos creados")
    return db.query(CursoDB).all()

def seed_usuarios(db):
    """Poblar usuarios de prueba"""
    print("👤 Poblando usuarios...")
    
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
    """Mostrar resumen de la malla curricular"""
    print("\n" + "="*80)
    print("📊 MALLA CURRICULAR COMPLETA - INGENIERÍA DE SISTEMAS")
    print("="*80)
    
    ciclos = {}
    for curso in cursos:
        if curso.semestre not in ciclos:
            ciclos[curso.semestre] = []
        ciclos[curso.semestre].append(curso)
    
    for ciclo in sorted(ciclos.keys()):
        creditos_ciclo = sum(c.creditos for c in ciclos[ciclo])
        horas_teoria = sum(getattr(c, 'horas_teoria', c.horas_semanales) for c in ciclos[ciclo])
        horas_lab = sum(getattr(c, 'horas_laboratorio', 0) for c in ciclos[ciclo])
        horas_prac = sum(getattr(c, 'horas_practica', 0) for c in ciclos[ciclo])
        
        print(f"\n{'='*80}")
        print(f"📍 CICLO {ciclo} - Total créditos: {creditos_ciclo}")
        print(f"   📚 Horas teoría: {horas_teoria} | 💻 Horas laboratorio: {horas_lab} | ✍️ Horas práctica: {horas_prac}")
        print("-"*80)
        
        for curso in ciclos[ciclo]:
            docente = next((d for d in docentes if d.id == curso.docente_id), None)
            print(f"\n  • {curso.codigo} - {curso.nombre}")
            print(f"    Créditos: {curso.creditos} | Tipo: {curso.tipo}")
            print(f"    Horas: Teoría {getattr(curso, 'horas_teoria', curso.horas_semanales)}h | ", end="")
            print(f"Laboratorio {getattr(curso, 'horas_laboratorio', 0)}h | ", end="")
            print(f"Práctica {getattr(curso, 'horas_practica', 0)}h")
            print(f"    Docente: {docente.nombre} {docente.apellido if docente else 'N/A'}")
    
    print("\n" + "="*80)
    print("✅ SEEDING COMPLETADO EXITOSAMENTE")
    print("="*80)
    
    total_creditos = sum(c.creditos for c in cursos)
    total_horas_teoria = sum(getattr(c, 'horas_teoria', c.horas_semanales) for c in cursos)
    total_horas_lab = sum(getattr(c, 'horas_laboratorio', 0) for c in cursos)
    total_horas_prac = sum(getattr(c, 'horas_practica', 0) for c in cursos)
    
    print(f"\n📈 RESUMEN GENERAL:")
    print(f"   • Programa: {programa.nombre}")
    print(f"   • Total Cursos: {len(cursos)}")
    print(f"   • Ciclos: 1, 2 y 3")
    print(f"   • Créditos totales: {total_creditos}")
    print(f"   • Total horas teoría: {total_horas_teoria}h")
    print(f"   • Total horas laboratorio: {total_horas_lab}h")
    print(f"   • Total horas práctica: {total_horas_prac}h")
    print(f"   • Docentes: {len(docentes)}")
    print(f"   • Aulas: {len(aulas)}")
    
    print("\n🔐 CREDENCIALES DE ACCESO:")
    print("   • Admin: admin@uni.edu / admin123")
    print("   • Coordinador: coord.sistemas@uni.edu / coord123")
    print("   • Estudiante: estudiante1@uni.edu / est123")
    print("   • Docente: docente1@uni.edu / doc123")
    print("\n" + "="*80 + "\n")

def main():
    print("\n" + "="*80)
    print("🚀 MALLA CURRICULAR COMPLETA - INGENIERÍA DE SISTEMAS")
    print("📚 Ciclos 1, 2 y 3 | Lunes a Viernes")
    print("="*80 + "\n")
    
    respuesta = input("¿Deseas limpiar todas las tablas y cargar la nueva malla? (s/n): ")
    
    db = SessionLocal()
    
    try:
        if respuesta.lower() == 's':
            drop_all_tables()
            create_all_tables()
        else:
            create_all_tables()
        
        # Poblar datos
        facultades = seed_facultades(db)
        programas = seed_programas(db, facultades)
        docentes = seed_docentes(db)
        aulas = seed_aulas(db)
        cursos = seed_cursos_malla_completa(db, programas[0], docentes)
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