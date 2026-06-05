from app.core import database
from datetime import time

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.teacher import Teacher, TeacherAvailability
from app.models.student import Student
from app.models.course import Course, CourseSection
from app.models.classroom import Classroom
from app.models.schedule import AcademicSchedule, ScheduleStatus, ScheduleType


ACADEMIC_PERIOD = "2026-1"
CAREER = "Ingeniería de Sistemas"


COURSES = [
    # Ciclo 1
    ("IS101", "Comprensión y Producción de Textos 1", 3, 1, 3),
    ("IS102", "Laboratorio de Liderazgo e Innovación", 3, 1, 3),
    ("IS103", "Estrategias y Herramientas Digitales para el Aprendizaje", 3, 1, 3),
    ("IS104", "Fundamentos de Programación", 4, 1, 4),
    ("IS105", "Matemática Básica", 4, 1, 4),
    ("IS106", "Introducción a la Ingeniería de Sistemas", 3, 1, 3),

    # Ciclo 2
    ("IS201", "Programación Orientada a Objetos", 4, 2, 4),
    ("IS202", "Matemática Discreta", 4, 2, 4),
    ("IS203", "Arquitectura de Computadoras", 3, 2, 3),
    ("IS204", "Base de Datos 1", 4, 2, 4),
    ("IS205", "Estadística General", 3, 2, 3),

    # Ciclo 3
    ("IS301", "Estructura de Datos", 4, 3, 4),
    ("IS302", "Base de Datos 2", 4, 3, 4),
    ("IS303", "Ingeniería de Software 1", 4, 3, 4),
    ("IS304", "Redes de Computadoras 1", 3, 3, 3),
    ("IS305", "Sistemas Operativos", 4, 3, 4),

    # Ciclo 4
    ("IS401", "Análisis y Diseño de Sistemas", 4, 4, 4),
    ("IS402", "Desarrollo de Aplicaciones Web", 4, 4, 4),
    ("IS403", "Redes de Computadoras 2", 3, 4, 3),
    ("IS404", "Investigación Operativa", 4, 4, 4),
    ("IS405", "Gestión de Base de Datos", 3, 4, 3),

    # Ciclo 5
    ("IS501", "Arquitectura de Software", 4, 5, 4),
    ("IS502", "Inteligencia Artificial", 4, 5, 4),
    ("IS503", "Seguridad Informática", 3, 5, 3),
    ("IS504", "Ingeniería de Requisitos", 3, 5, 3),
    ("IS505", "Gestión de Proyectos TI", 3, 5, 3),
]


SPECIALTIES = [
    "Programación",
    "Base de Datos",
    "Redes",
    "Ingeniería de Software",
    "Inteligencia Artificial",
    "Seguridad Informática",
    "Sistemas Operativos",
    "Gestión de Proyectos",
    "Matemática",
    "Comunicación",
]


def get_or_create_user(
    db: Session,
    email: str,
    full_name: str,
    role: UserRole,
    password: str,
):
    user = db.query(User).filter(User.email == email).first()

    if user:
        return user

    user = User(
        email=email,
        full_name=full_name,
        hashed_password=get_password_hash(password),
        role=role,
        is_active=True,
    )

    db.add(user)
    db.flush()

    return user


def get_or_create_teacher(
    db: Session,
    index: int,
):
    email = f"docente.demo{index}@optiacademic.com"
    teacher_code = f"DOCD{index:03d}"

    user = get_or_create_user(
        db=db,
        email=email,
        full_name=f"Docente Demo {index:03d}",
        role=UserRole.TEACHER,
        password="docente123",
    )

    teacher = (
        db.query(Teacher)
        .filter(Teacher.teacher_code == teacher_code)
        .first()
    )

    if teacher:
        return teacher

    teacher = Teacher(
        user_id=user.id,
        teacher_code=teacher_code,
        specialty=SPECIALTIES[(index - 1) % len(SPECIALTIES)],
        max_weekly_hours=24,
        rating=4.0,
    )

    db.add(teacher)
    db.flush()

    return teacher


def create_teacher_availability(
    db: Session,
    teacher: Teacher,
):
    existing_count = (
        db.query(TeacherAvailability)
        .filter(TeacherAvailability.teacher_id == teacher.id)
        .count()
    )

    if existing_count > 0:
        return

    for day in range(1, 7):  # lunes a sábado
        availability = TeacherAvailability(
            teacher_id=teacher.id,
            day_of_week=day,
            start_time=time(7, 0),
            end_time=time(22, 0),
            is_available=True,
        )

        db.add(availability)


def get_or_create_student(
    db: Session,
    index: int,
):
    email = f"estudiante.demo{index}@optiacademic.com"
    student_code = f"ESTD{index:03d}"

    user = get_or_create_user(
        db=db,
        email=email,
        full_name=f"Estudiante Demo {index:03d}",
        role=UserRole.STUDENT,
        password="estudiante123",
    )

    student = (
        db.query(Student)
        .filter(Student.student_code == student_code)
        .first()
    )

    if student:
        return student

    current_cycle = ((index - 1) % 5) + 1

    student = Student(
        user_id=user.id,
        student_code=student_code,
        career=CAREER,
        current_cycle=current_cycle,
        min_credits=7,
        max_credits=25,
    )

    db.add(student)
    db.flush()

    return student


def get_or_create_course(
    db: Session,
    code: str,
    name: str,
    credits: int,
    cycle: int,
    weekly_hours: int,
):
    course = db.query(Course).filter(Course.code == code).first()

    if course:
        return course

    course = Course(
        code=code,
        name=name,
        credits=credits,
        cycle=cycle,
        career=CAREER,
        weekly_hours=weekly_hours,
        is_active=True,
    )

    db.add(course)
    db.flush()

    return course


def get_or_create_classroom(
    db: Session,
    index: int,
):
    code = f"AULA-{index:03d}"

    classroom = (
        db.query(Classroom)
        .filter(Classroom.code == code)
        .first()
    )

    if classroom:
        return classroom

    capacity = 35 + ((index - 1) % 5) * 5

    classroom = Classroom(
        code=code,
        name=f"Aula Demo {index:03d}",
        capacity=capacity,
        classroom_type="THEORY",
        campus="Principal",
        building=None,
        floor=None,
        has_projector=False,
        has_computers=False,
        is_active=True,
    )

    db.add(classroom)
    db.flush()

    return classroom


def get_or_create_section(
    db: Session,
    course: Course,
    teacher: Teacher,
    section_code: str,
):
    section = (
        db.query(CourseSection)
        .filter(
            CourseSection.course_id == course.id,
            CourseSection.section_code == section_code,
        )
        .first()
    )

    if section:
        section.teacher_id = teacher.id
        return section

    section = CourseSection(
        course_id=course.id,
        teacher_id=teacher.id,
        section_code=section_code,
        max_students=35,
        enrolled_students=0,
    )

    db.add(section)
    db.flush()

    return section


def get_or_create_schedule(db: Session):
    name = "Horario Institucional Demo 50x50 2026-1"

    schedule = (
        db.query(AcademicSchedule)
        .filter(AcademicSchedule.name == name)
        .first()
    )

    if schedule:
        return schedule

    schedule = AcademicSchedule(
        name=name,
        academic_period=ACADEMIC_PERIOD,
        schedule_type=ScheduleType.INSTITUTIONAL,
        status=ScheduleStatus.DRAFT,
        score=0,
        is_active=True,
    )

    db.add(schedule)
    db.flush()

    return schedule


def seed():
    db = SessionLocal()

    try:
        print("Iniciando población demo 50 docentes / 50 estudiantes...")

        teachers = []

        for index in range(1, 51):
            teacher = get_or_create_teacher(db, index)
            create_teacher_availability(db, teacher)
            teachers.append(teacher)

        print("Docentes y disponibilidades creados/verificados.")

        for index in range(1, 51):
            get_or_create_student(db, index)

        print("Estudiantes creados/verificados.")

        courses = []

        for course_data in COURSES:
            course = get_or_create_course(db, *course_data)
            courses.append(course)

        print("Cursos creados/verificados.")

        for index in range(1, 21):
            get_or_create_classroom(db, index)

        print("Aulas creadas/verificadas.")

        section_letters = ["A", "B"]

        teacher_index = 0

        for course in courses:
            for section_letter in section_letters:
                teacher = teachers[teacher_index % len(teachers)]
                section_code = f"{course.code}-{section_letter}"

                get_or_create_section(
                    db=db,
                    course=course,
                    teacher=teacher,
                    section_code=section_code,
                )

                teacher_index += 1

        print("Secciones creadas/verificadas.")

        schedule = get_or_create_schedule(db)

        db.commit()

        print("Base demo 50x50 poblada correctamente.")
        print(f"Horario institucional demo ID: {schedule.id}")
        print("")
        print("Usuarios de prueba:")
        print("Admin: admin@optiacademic.com / admin123")
        print("Docente: docente.demo1@optiacademic.com / docente123")
        print("Estudiante: estudiante.demo1@optiacademic.com / estudiante123")
        print("")
        print("Recomendación CSP inicial:")
        print(f"schedule_id: {schedule.id}")
        print("career_filter: Ingeniería de Sistemas")
        print("cycle_filter: [1]")
        print("max_sections_to_schedule: 5 o 10")

    except Exception as error:
        db.rollback()
        print("Error al poblar la base demo 50x50:")
        print(error)
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed()