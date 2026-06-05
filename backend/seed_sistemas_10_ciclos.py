from datetime import datetime, time
from random import choice, randint, seed

from sqlalchemy import Boolean, DateTime, Integer, MetaData, String, Table, Time, create_engine, select
from sqlalchemy.exc import IntegrityError

try:
    from app.core.config import settings
    DATABASE_URL = settings.DATABASE_URL
except Exception:
    try:
        from app.config import settings
        DATABASE_URL = settings.DATABASE_URL
    except Exception:
        from config import settings
        DATABASE_URL = settings.DATABASE_URL


seed(2026)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
)

metadata = MetaData()
metadata.reflect(bind=engine)


def get_table(*names):
    for name in names:
        if name in metadata.tables:
            return metadata.tables[name]

    raise RuntimeError(f"No se encontró ninguna tabla con nombres: {names}")


users_table = get_table("users", "usuarios")
teachers_table = get_table("teachers", "docentes")
students_table = get_table("students", "estudiantes")
courses_table = get_table("courses", "cursos")
sections_table = get_table("course_sections", "sections", "secciones")
classrooms_table = get_table("classrooms", "aulas")
availability_table = get_table(
    "teacher_availability",
    "teacher_availabilities",
    "teacher_availabilities",
    "disponibilidad_docente",
)


CAREER = "Ingeniería de Sistemas"

COURSES = [
    # Ciclo 1 - Total 23 créditos
    ("SIS101", "Comprensión y Producción de Textos 1", 3, 1, 3),
    ("SIS102", "Laboratorio de Liderazgo e Innovación", 3, 1, 3),
    ("SIS103", "Estrategias y Herramientas Digitales para el Aprendizaje", 4, 1, 4),
    ("SIS104", "Matemática Básica", 4, 1, 4),
    ("SIS105", "Matemática Discreta 1", 4, 1, 4),
    ("SIS106", "Técnicas de Programación", 2, 1, 2),
    ("SIS107", "Introducción a la Ingeniería de Sistemas e Informática", 3, 1, 3),

    # Ciclo 2 - Total 24 créditos
    ("SIS201", "Comprensión y Producción de Textos 2", 4, 2, 4),
    ("SIS202", "Electivo General 1", 3, 2, 3),
    ("SIS203", "Álgebra Lineal y Geometría Analítica", 4, 2, 4),
    ("SIS204", "Modelado de Negocios", 3, 2, 3),
    ("SIS205", "Matemática Superior", 4, 2, 4),
    ("SIS206", "Matemática Discreta 2", 4, 2, 4),
    ("SIS207", "Programación Orientada a Objetos", 2, 2, 2),

    # Ciclo 3 - Total 24 créditos
    ("SIS301", "Estadística y Probabilidades", 4, 3, 4),
    ("SIS302", "Electivo General 2", 3, 3, 3),
    ("SIS303", "Laboratorio de Liderazgo e Innovación Intermedio", 2, 3, 2),
    ("SIS304", "Cálculo Diferencial", 4, 3, 4),
    ("SIS305", "Física 1", 4, 3, 4),
    ("SIS306", "Base de Datos 1", 3, 3, 3),
    ("SIS307", "Diseño Web", 2, 3, 2),
    ("SIS308", "Estructura de Datos", 2, 3, 2),

    # Ciclo 4 - Total 23 créditos
    ("SIS401", "Electivo General 3", 3, 4, 3),
    ("SIS402", "Electivo General 4", 3, 4, 3),
    ("SIS403", "English Course 1", 3, 4, 3),
    ("SIS404", "Cálculo Integral", 4, 4, 4),
    ("SIS405", "Física Electromagnética", 4, 4, 4),
    ("SIS406", "Análisis y Diseño de Software", 4, 4, 4),
    ("SIS407", "Programación Web", 2, 4, 2),

    # Ciclo 5 - Total 21 créditos
    ("SIS501", "English Course 2", 3, 5, 3),
    ("SIS502", "Laboratorio de Liderazgo e Innovación Avanzado", 3, 5, 3),
    ("SIS503", "Ecuaciones Diferenciales", 4, 5, 4),
    ("SIS504", "Estadística para Ingeniería", 3, 5, 3),
    ("SIS505", "Desarrollo de Aplicaciones Web", 2, 5, 2),
    ("SIS506", "Base de Datos 2", 3, 5, 3),
    ("SIS507", "Arquitectura del Computador", 3, 5, 3),

    # Ciclo 6 - Total 22 créditos
    ("SIS601", "Investigación Académica", 3, 6, 3),
    ("SIS602", "English Course 3", 3, 6, 3),
    ("SIS603", "Investigación Operativa 1", 4, 6, 4),
    ("SIS604", "Métodos Numéricos", 4, 6, 4),
    ("SIS605", "Desarrollo de Videojuegos", 4, 6, 4),
    ("SIS606", "Sistemas Operativos", 4, 6, 4),

    # Ciclo 7 - Total 24 créditos
    ("SIS701", "English Course 4", 3, 7, 3),
    ("SIS702", "Electivo General 5", 1, 7, 1),
    ("SIS703", "Ingeniería Económica", 3, 7, 3),
    ("SIS704", "Redes de Computadoras", 4, 7, 4),
    ("SIS705", "Ingeniería de Software", 4, 7, 4),
    ("SIS706", "Proyectos de Innovación", 2, 7, 2),
    ("SIS707", "Fundamentos de Sistemas Dinámicos y Modelado", 3, 7, 3),
    ("SIS708", "Construcción y Pruebas de Software", 4, 7, 4),

    # Ciclo 8 - Total 20 créditos
    ("SIS801", "Simulación de Procesos", 3, 8, 3),
    ("SIS802", "Gestión de Proyectos en Ingeniería", 3, 8, 3),
    ("SIS803", "Conmutación y Enrutamiento", 4, 8, 4),
    ("SIS804", "Desarrollo de Aplicaciones Móviles", 4, 8, 4),
    ("SIS805", "Arquitectura de Software", 3, 8, 3),
    ("SIS806", "Metodologías Ágiles para el Desarrollo de Software", 3, 8, 3),

    # Ciclo 9 - Total 20 créditos
    ("SIS901", "Electivo Transversal o de Especialidad 1", 3, 9, 3),
    ("SIS902", "Taller de Investigación 1 en Ingeniería de Sistemas e Informática", 4, 9, 4),
    ("SIS903", "Proyectos de Diseño en Ingeniería de Sistemas e Informática", 4, 9, 4),
    ("SIS904", "Inteligencia de Negocios y Ciencia de Datos", 4, 9, 4),
    ("SIS905", "Seguridad de la Información", 3, 9, 3),
    ("SIS906", "Aplicaciones Cloud", 2, 9, 2),

    # Ciclo 10 - Total 19 créditos
    ("SIS1001", "Taller de Investigación 2 en Ingeniería de Sistemas e Informática", 4, 10, 4),
    ("SIS1002", "Proyectos de Diseño y Desarrollo en Ingeniería de Sistemas e Informática", 4, 10, 4),
    ("SIS1003", "Auditoría de Sistemas", 3, 10, 3),
    ("SIS1004", "Robótica y Machine Learning", 2, 10, 2),
    ("SIS1005", "Planificación y Gestión de Tecnologías de la Información", 3, 10, 3),
    ("SIS1006", "Electivo Transversal o de Especialidad 2", 3, 10, 3),
]

SPECIALTIES = [
    "Programación",
    "Base de Datos",
    "Redes y Comunicaciones",
    "Ingeniería de Software",
    "Inteligencia Artificial",
    "Ciberseguridad",
    "Gestión de Proyectos TI",
    "Cloud Computing",
    "Arquitectura de Software",
    "Analítica de Datos",
]

CLASSROOM_TYPES = [
    ("THEORY", "Aula teórica"),
    ("LABORATORY", "Laboratorio"),
    ("VIRTUAL", "Aula virtual"),
    ("AUDITORIUM", "Auditorio"),
]


def has_column(table, column_name):
    return column_name in table.c


def default_value_for_column(column):
    column_name = column.name.lower()

    if column_name in {"created_at", "updated_at"}:
        return datetime.now()

    if column_name in {"start_time"}:
        return time(7, 0)

    if column_name in {"end_time"}:
        return time(22, 0)

    if isinstance(column.type, Boolean):
        return False

    if isinstance(column.type, Integer):
        if column_name in {"capacity", "max_students"}:
            return 40
        if column_name in {"floor"}:
            return 1
        if column_name in {"credits"}:
            return 3
        if column_name in {"cycle", "current_cycle"}:
            return 1
        if column_name in {"day_of_week"}:
            return 1
        return 0

    if isinstance(column.type, DateTime):
        return datetime.now()

    if isinstance(column.type, Time):
        if "end" in column_name:
            return time(22, 0)
        return time(7, 0)

    if isinstance(column.type, String):
        if column_name == "campus":
            return "Campus Huancayo"
        if column_name == "building":
            return "Pabellón Sistemas"
        if column_name == "location":
            return "Ingeniería de Sistemas"
        if column_name == "classroom_type":
            return "THEORY"
        if column_name == "type":
            return "THEORY"
        if column_name == "specialty":
            return "Ingeniería de Sistemas"
        if column_name == "career":
            return CAREER
        if column_name == "role":
            return "STUDENT"
        if column_name == "status":
            return "ACTIVE"
        return "N/A"

    return None


def only_existing_columns(table, data):
    clean_data = {
        key: value
        for key, value in data.items()
        if key in table.c
    }

    for column in table.c:
        if column.name in clean_data:
            continue

        if column.primary_key:
            continue

        if column.nullable:
            continue

        if column.default is not None or column.server_default is not None:
            continue

        clean_data[column.name] = default_value_for_column(column)

    return clean_data

def fetch_one_by(conn, table, **filters):
    conditions = []

    for column, value in filters.items():
        if column not in table.c:
            return None

        conditions.append(table.c[column] == value)

    stmt = select(table).where(*conditions).limit(1)
    return conn.execute(stmt).mappings().first()


def insert_and_get_id(conn, table, data):
    clean_data = only_existing_columns(table, data)

    result = conn.execute(table.insert().values(**clean_data))

    inserted_id = result.inserted_primary_key[0] if result.inserted_primary_key else None

    if inserted_id:
        return inserted_id

    return result.lastrowid


def get_or_create(conn, table, lookup, data, update_if_exists=True):
    existing = fetch_one_by(conn, table, **lookup)

    if existing:
        if update_if_exists:
            clean_data = only_existing_columns(table, data)

            update_data = {
                key: value
                for key, value in clean_data.items()
                if key not in lookup and key != "id"
            }

            if "updated_at" in table.c:
                update_data["updated_at"] = datetime.now()

            if update_data:
                conditions = [
                    table.c[column] == value
                    for column, value in lookup.items()
                    if column in table.c
                ]

                conn.execute(
                    table.update()
                    .where(*conditions)
                    .values(**update_data)
                )

        return existing["id"]

    try:
        return insert_and_get_id(conn, table, data)
    except IntegrityError:
        existing = fetch_one_by(conn, table, **lookup)
        if existing:
            return existing["id"]
        raise


def build_password_hash(value):
    try:
        from passlib.context import CryptContext

        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        return pwd_context.hash(value)
    except Exception:
        return value


def create_user(conn, email, full_name, role, password):
    if users_table.name == "usuarios":
        lookup = {"email": email}

        data = {
            "email": email,
            "nombre_completo": full_name,
            "full_name": full_name,
            "hashed_password": build_password_hash(password),
            "password_hash": build_password_hash(password),
            "role": role,
            "rol": role,
            "is_active": True,
            "activo": True,
        }

        return get_or_create(conn, users_table, lookup, data)

    lookup = {"email": email}

    data = {
        "email": email,
        "full_name": full_name,
        "name": full_name,
        "hashed_password": build_password_hash(password),
        "password_hash": build_password_hash(password),
        "role": role,
        "is_active": True,
    }

    return get_or_create(conn, users_table, lookup, data)


def create_courses(conn):
    course_ids = {}

    for code, name, credits, cycle, weekly_hours in COURSES:
        data = {
            "code": code,
            "course_code": code,
            "name": name,
            "course_name": name,
            "credits": credits,
            "cycle": cycle,
            "career": CAREER,
            "weekly_hours": weekly_hours,
            "is_active": True,
        }

        lookup = {}

        if has_column(courses_table, "code"):
            lookup["code"] = code
        elif has_column(courses_table, "course_code"):
            lookup["course_code"] = code
        else:
            raise RuntimeError("La tabla de cursos no tiene columna code/course_code")

        course_id = get_or_create(conn, courses_table, lookup, data)
        course_ids[code] = course_id

    return course_ids


def create_classrooms(conn):
    classroom_ids = []

    for index in range(1, 46):
        if index <= 25:
            classroom_type = "THEORY"
            code = f"AULA-SIS-{index:03d}"
            name = f"Aula Sistemas {index:03d}"
            capacity = randint(35, 55)
        elif index <= 38:
            classroom_type = "LAB"
            code = f"LAB-SIS-{index - 25:03d}"
            name = f"Laboratorio Sistemas {index - 25:03d}"
            capacity = randint(25, 35)
        elif index <= 42:
            classroom_type = "VIRTUAL"
            code = f"VIR-SIS-{index - 38:03d}"
            name = f"Aula Virtual Sistemas {index - 38:03d}"
            capacity = 60
        else:
            classroom_type = "AUDITORIUM"
            code = f"AUD-SIS-{index - 42:03d}"
            name = f"Auditorio Sistemas {index - 42:03d}"
            capacity = randint(80, 120)

        data = {
            "code": code,
            "classroom_code": code,
            "name": name,
            "classroom_name": name,
            "capacity": capacity,
            "classroom_type": classroom_type,
            "type": classroom_type,
            "campus": "Campus Huancayo",
            "building": "Pabellón Sistemas",
            "floor": randint(1, 6),
            "location": "Ingeniería de Sistemas",
            "has_projector": True,
            "has_computers": classroom_type in ["LAB", "VIRTUAL"],
            "has_internet": True,
            "is_lab": classroom_type == "LAB",
            "is_active": True,
        }

        lookup = {}

        if has_column(classrooms_table, "code"):
            lookup["code"] = code
        elif has_column(classrooms_table, "classroom_code"):
            lookup["classroom_code"] = code
        else:
            raise RuntimeError("La tabla de aulas no tiene columna code/classroom_code")

        classroom_id = get_or_create(conn, classrooms_table, lookup, data)
        classroom_ids.append(classroom_id)

    return classroom_ids


def create_teachers(conn):
    teacher_ids = []

    for index in range(1, 91):
        teacher_code = f"DOC-SIS-{index:03d}"
        full_name = f"Docente Sistemas {index:03d}"
        email = f"docente.sis{index:03d}@optiacademic.com"

        user_id = create_user(
            conn=conn,
            email=email,
            full_name=full_name,
            role="TEACHER",
            password="docente123",
        )

        data = {
            "user_id": user_id,
            "teacher_code": teacher_code,
            "code": teacher_code,
            "specialty": choice(SPECIALTIES),
            "max_weekly_hours": randint(18, 30),
            "rating": round(randint(38, 50) / 10, 1),
        }

        lookup = {}

        if has_column(teachers_table, "teacher_code"):
            lookup["teacher_code"] = teacher_code
        elif has_column(teachers_table, "code"):
            lookup["code"] = teacher_code
        else:
            raise RuntimeError("La tabla de docentes no tiene teacher_code/code")

        teacher_id = get_or_create(conn, teachers_table, lookup, data)
        teacher_ids.append(teacher_id)

    return teacher_ids


def create_students(conn):
    student_ids = []

    for index in range(1, 201):
        cycle = ((index - 1) % 10) + 1
        student_code = f"EST-SIS-{index:03d}"
        full_name = f"Estudiante Sistemas {index:03d}"
        email = f"estudiante.sis{index:03d}@optiacademic.com"

        user_id = create_user(
            conn=conn,
            email=email,
            full_name=full_name,
            role="STUDENT",
            password="estudiante123",
        )

        data = {
            "user_id": user_id,
            "student_code": student_code,
            "code": student_code,
            "career": CAREER,
            "current_cycle": cycle,
            "cycle": cycle,
            "min_credits": 7,
            "max_credits": 25,
        }

        lookup = {}

        if has_column(students_table, "student_code"):
            lookup["student_code"] = student_code
        elif has_column(students_table, "code"):
            lookup["code"] = student_code
        else:
            raise RuntimeError("La tabla de estudiantes no tiene student_code/code")

        student_id = get_or_create(conn, students_table, lookup, data)
        student_ids.append(student_id)

    return student_ids


def create_teacher_availability(conn, teacher_ids):
    for teacher_id in teacher_ids:
        for day in range(1, 8):
            existing = fetch_one_by(
                conn,
                availability_table,
                teacher_id=teacher_id,
                day_of_week=day,
            )

            if existing:
                continue

            data = {
                "teacher_id": teacher_id,
                "day_of_week": day,
                "start_time": time(7, 0),
                "end_time": time(22, 0),
                "is_available": True,
            }

            insert_and_get_id(conn, availability_table, data)


def create_sections(conn, course_ids, teacher_ids):
    section_letters = ["A", "B", "C"]
    teacher_index = 0

    for course_code, course_id in course_ids.items():
        for letter in section_letters:
            section_code = f"{course_code}-{letter}"

            teacher_id = teacher_ids[teacher_index % len(teacher_ids)]
            teacher_index += 1

            data = {
                "course_id": course_id,
                "teacher_id": teacher_id,
                "section_code": section_code,
                "code": section_code,
                "max_students": randint(30, 45),
                "enrolled_students": randint(0, 20),
            }

            lookup = {}

            if has_column(sections_table, "section_code"):
                lookup["section_code"] = section_code
            elif has_column(sections_table, "code"):
                lookup["code"] = section_code
            else:
                raise RuntimeError("La tabla de secciones no tiene section_code/code")

            get_or_create(conn, sections_table, lookup, data)


def main():
    print("============================================")
    print(" Seed Ingeniería de Sistemas - 10 ciclos")
    print("============================================")

    with engine.begin() as conn:
        course_ids = create_courses(conn)
        print(f"Cursos creados/verificados: {len(course_ids)}")

        classroom_ids = create_classrooms(conn)
        print(f"Aulas creadas/verificadas: {len(classroom_ids)}")

        teacher_ids = create_teachers(conn)
        print(f"Docentes creados/verificados: {len(teacher_ids)}")

        student_ids = create_students(conn)
        print(f"Estudiantes creados/verificados: {len(student_ids)}")

        create_teacher_availability(conn, teacher_ids)
        print("Disponibilidad docente creada/verificada")

        create_sections(conn, course_ids, teacher_ids)
        print(f"Secciones creadas/verificadas: {len(course_ids) * 3}")

    print("============================================")
    print(" Seed finalizado correctamente")
    print("============================================")
    print("")
    print("Usuarios de prueba:")
    print("Docente: docente.sis001@optiacademic.com / docente123")
    print("Estudiante: estudiante.sis001@optiacademic.com / estudiante123")
    print("")
    print("Siguiente paso:")
    print("1. Ir a Preparación de datos")
    print("2. Revisar que no haya errores críticos")
    print("3. Generar horario institucional con el motor CSP")
    print("4. Publicar horario validado")
    print("5. Probar flujo estudiantil")


if __name__ == "__main__":
    main()