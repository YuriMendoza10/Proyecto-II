# seed_data.py
import json
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
    """Poblar facultades"""
    print("🏛️  Poblando facultades...")
    facultades = [
        {"codigo": "FING", "nombre": "Facultad de Ingeniería", "activo": True},
        {"codigo": "FCYT", "nombre": "Facultad de Ciencias y Tecnología", "activo": True},
        {"codigo": "FCE", "nombre": "Facultad de Ciencias Económicas", "activo": True},
        {"codigo": "FDER", "nombre": "Facultad de Derecho", "activo": True},
        {"codigo": "FMED", "nombre": "Facultad de Medicina", "activo": True},
    ]
    
    for data in facultades:
        facultad = Facultad(**data)
        db.add(facultad)
    
    db.commit()
    print(f"✅ {len(facultades)} facultades creadas")
    return db.query(Facultad).all()

def seed_programas(db, facultades):
    """Poblar programas académicos"""
    print("📚 Poblando programas...")
    programas = [
        {"codigo": "ING-SIST", "nombre": "Ingeniería de Sistemas", "facultad_id": facultades[0].id},
        {"codigo": "ING-CIVIL", "nombre": "Ingeniería Civil", "facultad_id": facultades[0].id},
        {"codigo": "ING-IND", "nombre": "Ingeniería Industrial", "facultad_id": facultades[0].id},
        {"codigo": "ING-ELECT", "nombre": "Ingeniería Electrónica", "facultad_id": facultades[0].id},
        {"codigo": "CS-COMP", "nombre": "Ciencias de la Computación", "facultad_id": facultades[1].id},
        {"codigo": "MATEM", "nombre": "Matemáticas", "facultad_id": facultades[1].id},
        {"codigo": "ADMIN", "nombre": "Administración de Empresas", "facultad_id": facultades[2].id},
        {"codigo": "CONTAB", "nombre": "Contaduría Pública", "facultad_id": facultades[2].id},
        {"codigo": "DERECHO", "nombre": "Derecho", "facultad_id": facultades[3].id},
        {"codigo": "MEDIC", "nombre": "Medicina", "facultad_id": facultades[4].id},
    ]
    
    for data in programas:
        programa = Programa(**data)
        db.add(programa)
    
    db.commit()
    print(f"✅ {len(programas)} programas creados")
    return db.query(Programa).all()

def seed_docentes(db):
    """Poblar docentes"""
    print("👨‍🏫 Poblando docentes...")
    docentes = [
        {
            "codigo": "DOC001", 
            "nombre": "Juan", 
            "apellido": "Pérez", 
            "email": "juan.perez@uni.edu",
            "disponibilidad": json.dumps(["Lunes 07:00-09:00", "Martes 09:00-11:00", "Miércoles 07:00-09:00"]),
            "max_horas_semanales": 20,
            "activo": True
        },
        {
            "codigo": "DOC002", 
            "nombre": "María", 
            "apellido": "González", 
            "email": "maria.gonzalez@uni.edu",
            "disponibilidad": json.dumps(["Martes 11:00-13:00", "Jueves 09:00-11:00", "Viernes 07:00-09:00"]),
            "max_horas_semanales": 16,
            "activo": True
        },
        {
            "codigo": "DOC003", 
            "nombre": "Carlos", 
            "apellido": "Rodríguez", 
            "email": "carlos.rodriguez@uni.edu",
            "disponibilidad": json.dumps(["Lunes 13:00-15:00", "Miércoles 15:00-17:00", "Jueves 13:00-15:00"]),
            "max_horas_semanales": 20,
            "activo": True
        },
        {
            "codigo": "DOC004", 
            "nombre": "Ana", 
            "apellido": "Martínez", 
            "email": "ana.martinez@uni.edu",
            "disponibilidad": json.dumps(["Lunes 09:00-11:00", "Martes 07:00-09:00", "Viernes 09:00-11:00"]),
            "max_horas_semanales": 18,
            "activo": True
        },
        {
            "codigo": "DOC005", 
            "nombre": "Luis", 
            "apellido": "Sánchez", 
            "email": "luis.sanchez@uni.edu",
            "disponibilidad": json.dumps(["Miércoles 09:00-11:00", "Jueves 11:00-13:00", "Viernes 13:00-15:00"]),
            "max_horas_semanales": 20,
            "activo": True
        },
        {
            "codigo": "DOC006", 
            "nombre": "Patricia", 
            "apellido": "López", 
            "email": "patricia.lopez@uni.edu",
            "disponibilidad": json.dumps(["Lunes 15:00-17:00", "Martes 15:00-17:00", "Miércoles 13:00-15:00"]),
            "max_horas_semanales": 16,
            "activo": True
        },
    ]
    
    for data in docentes:
        docente = Docente(**data)
        db.add(docente)
    
    db.commit()
    print(f"✅ {len(docentes)} docentes creados")
    return db.query(Docente).all()

def seed_aulas(db):
    """Poblar aulas"""
    print("🏫 Poblando aulas...")
    aulas = [
        {"codigo": "A101", "nombre": "Aula 101", "capacidad": 40, "tipo": "teoria", "edificio": "Central", "piso": 1, "recursos": json.dumps(["proyector", "pizarra"]), "activa": True},
        {"codigo": "A102", "nombre": "Aula 102", "capacidad": 35, "tipo": "teoria", "edificio": "Central", "piso": 1, "recursos": json.dumps(["proyector", "pizarra", "computador"]), "activa": True},
        {"codigo": "A103", "nombre": "Aula 103", "capacidad": 50, "tipo": "teoria", "edificio": "Central", "piso": 1, "recursos": json.dumps(["proyector", "pizarra"]), "activa": True},
        {"codigo": "LAB101", "nombre": "Laboratorio Sistemas", "capacidad": 30, "tipo": "laboratorio", "edificio": "Tecnológico", "piso": 2, "recursos": json.dumps(["computadores", "proyector", "internet"]), "activa": True},
        {"codigo": "LAB102", "nombre": "Laboratorio Electrónica", "capacidad": 25, "tipo": "laboratorio", "edificio": "Tecnológico", "piso": 2, "recursos": json.dumps(["osciloscopios", "multímetros", "protoboards"]), "activa": True},
        {"codigo": "TAL1", "nombre": "Taller de Diseño", "capacidad": 30, "tipo": "taller", "edificio": "Innovación", "piso": 1, "recursos": json.dumps(["mesas", "herramientas", "computadores"]), "activa": True},
        {"codigo": "A201", "nombre": "Aula 201", "capacidad": 45, "tipo": "teoria", "edificio": "Central", "piso": 2, "recursos": json.dumps(["proyector", "pizarra", "aire acondicionado"]), "activa": True},
        {"codigo": "A202", "nombre": "Aula 202", "capacidad": 40, "tipo": "teoria", "edificio": "Central", "piso": 2, "recursos": json.dumps(["proyector", "pizarra"]), "activa": True},
        {"codigo": "AUD1", "nombre": "Auditorio Principal", "capacidad": 200, "tipo": "auditorio", "edificio": "Cultural", "piso": 1, "recursos": json.dumps(["proyector", "sonido", "escenario"]), "activa": True},
    ]
    
    for data in aulas:
        aula = Aula(**data)
        db.add(aula)
    
    db.commit()
    print(f"✅ {len(aulas)} aulas creadas")
    return db.query(Aula).all()

def seed_cursos(db, programas, docentes):
    """Poblar cursos"""
    print("📖 Poblando cursos...")
    cursos = [
        # Ingeniería de Sistemas (Semestre 1-2)
        {"codigo": "SIS101", "nombre": "Programación I", "creditos": 4, "semestre": 1, "programa_id": programas[0].id, 
         "docente_id": docentes[0].id, "max_estudiantes": 35, "tipo": "teoria", "horas_semanales": 4},
        {"codigo": "SIS102", "nombre": "Matemáticas I", "creditos": 4, "semestre": 1, "programa_id": programas[0].id,
         "docente_id": docentes[1].id, "max_estudiantes": 40, "tipo": "teoria", "horas_semanales": 5},
        {"codigo": "SIS103", "nombre": "Algoritmos", "creditos": 3, "semestre": 2, "programa_id": programas[0].id,
         "docente_id": docentes[0].id, "max_estudiantes": 35, "tipo": "teoria", "horas_semanales": 4},
        {"codigo": "SIS104", "nombre": "Base de Datos", "creditos": 4, "semestre": 3, "programa_id": programas[0].id,
         "docente_id": docentes[2].id, "max_estudiantes": 35, "tipo": "teoria", "horas_semanales": 4},
        
        # Ingeniería Civil (Semestre 1-2)
        {"codigo": "CIV101", "nombre": "Cálculo I", "creditos": 4, "semestre": 1, "programa_id": programas[1].id,
         "docente_id": docentes[1].id, "max_estudiantes": 40, "tipo": "teoria", "horas_semanales": 5},
        {"codigo": "CIV102", "nombre": "Física I", "creditos": 4, "semestre": 2, "programa_id": programas[1].id,
         "docente_id": docentes[3].id, "max_estudiantes": 35, "tipo": "laboratorio", "horas_semanales": 5},
        
        # Ciencias de la Computación
        {"codigo": "CC101", "nombre": "Estructuras de Datos", "creditos": 4, "semestre": 2, "programa_id": programas[4].id,
         "docente_id": docentes[2].id, "max_estudiantes": 30, "tipo": "teoria", "horas_semanales": 4},
        {"codigo": "CC102", "nombre": "Sistemas Operativos", "creditos": 4, "semestre": 3, "programa_id": programas[4].id,
         "docente_id": docentes[4].id, "max_estudiantes": 30, "tipo": "teoria", "horas_semanales": 4},
        
        # Administración
        {"codigo": "ADM101", "nombre": "Administración General", "creditos": 3, "semestre": 1, "programa_id": programas[6].id,
         "docente_id": docentes[5].id, "max_estudiantes": 45, "tipo": "teoria", "horas_semanales": 3},
        {"codigo": "ADM102", "nombre": "Contabilidad", "creditos": 3, "semestre": 2, "programa_id": programas[6].id,
         "docente_id": docentes[5].id, "max_estudiantes": 40, "tipo": "teoria", "horas_semanales": 4},
        
        # Matemáticas
        {"codigo": "MAT101", "nombre": "Álgebra Lineal", "creditos": 4, "semestre": 2, "programa_id": programas[5].id,
         "docente_id": docentes[1].id, "max_estudiantes": 35, "tipo": "teoria", "horas_semanales": 5},
        {"codigo": "MAT102", "nombre": "Cálculo Diferencial", "creditos": 5, "semestre": 1, "programa_id": programas[5].id,
         "docente_id": docentes[3].id, "max_estudiantes": 40, "tipo": "teoria", "horas_semanales": 6},
    ]
    
    for data in cursos:
        curso = CursoDB(**data)
        db.add(curso)
    
    db.commit()
    print(f"✅ {len(cursos)} cursos creados")
    return db.query(CursoDB).all()

def seed_usuarios(db):
    """Poblar usuarios"""
    print("👤 Poblando usuarios...")
    usuarios = [
        {"email": "admin@uni.edu", "password": "admin123", "nombre": "Admin", "apellido": "Sistema", "rol": "admin", "activo": True},
        {"email": "coord@uni.edu", "password": "coord123", "nombre": "Coordinador", "apellido": "Académico", "rol": "coordinador", "activo": True},
        {"email": "doc1@uni.edu", "password": "doc123", "nombre": "Juan", "apellido": "Pérez", "rol": "docente", "activo": True},
        {"email": "doc2@uni.edu", "password": "doc123", "nombre": "María", "apellido": "González", "rol": "docente", "activo": True},
        {"email": "est1@uni.edu", "password": "est123", "nombre": "Estudiante", "apellido": "Uno", "rol": "estudiante", "activo": True},
        {"email": "est2@uni.edu", "password": "est123", "nombre": "Estudiante", "apellido": "Dos", "rol": "estudiante", "activo": True},
        {"email": "est3@uni.edu", "password": "est123", "nombre": "Estudiante", "apellido": "Tres", "rol": "estudiante", "activo": True},
    ]
    
    for data in usuarios:
        hashed_password = get_password_hash(data.pop("password"))
        usuario = Usuario(hashed_password=hashed_password, **data)
        db.add(usuario)
    
    db.commit()
    print(f"✅ {len(usuarios)} usuarios creados")
    print("   Credenciales de acceso:")
    print("   - Admin: admin@uni.edu / admin123")
    print("   - Coordinador: coord@uni.edu / coord123")
    print("   - Docente: doc1@uni.edu / doc123")
    print("   - Estudiante: est1@uni.edu / est123")

def main():
    """Función principal de seeding"""
    print("\n" + "="*50)
    print("🚀 INICIANDO SEEDING DE BASE DE DATOS")
    print("="*50 + "\n")
    
    # Crear sesión
    db = SessionLocal()
    
    try:
        # 1. Eliminar y recrear tablas
        drop_all_tables()
        create_all_tables()
        
        # 2. Poblar datos en orden (respetando relaciones)
        facultades = seed_facultades(db)
        programas = seed_programas(db, facultades)
        docentes = seed_docentes(db)
        aulas = seed_aulas(db)
        cursos = seed_cursos(db, programas, docentes)
        seed_usuarios(db)
        
        print("\n" + "="*50)
        print("✅ SEEDING COMPLETADO EXITOSAMENTE")
        print("="*50)
        print("\n📊 Resumen de datos cargados:")
        print(f"   - Facultades: {len(facultades)}")
        print(f"   - Programas: {len(programas)}")
        print(f"   - Docentes: {len(docentes)}")
        print(f"   - Aulas: {len(aulas)}")
        print(f"   - Cursos: {len(cursos)}")
        print("\n🔐 Credenciales de acceso:")
        print("   Admin: admin@uni.edu / admin123")
        print("   Coordinador: coord@uni.edu / coord123")
        print("   Estudiante: est1@uni.edu / est123")
        print("   Docente: doc1@uni.edu / doc123")
        print("\n" + "="*50 + "\n")
        
    except Exception as e:
        print(f"\n❌ ERROR durante el seeding: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()