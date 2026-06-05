from datetime import time

from app.core.database import SessionLocal
from app.models.user import User, UserRole
from app.models.teacher import Teacher, TeacherAvailability
from app.models.student import Student
from app.models.course import Course, CourseSection
from app.models.classroom import Classroom, ClassroomType
from app.models.schedule import AcademicSchedule, ScheduleStatus, ScheduleType

try:
    from app.core.security import get_password_hash
except ImportError:
    from app.core.security import hash_password as get_password_hash


CAREER = "Ingeniería de Sistemas"
PERIOD = "2026-1"


COURSES = [
    ("IS101", "Comprensión y Producción de Textos 1", 3, 1, 3),
    ("IS102", "Laboratorio de Liderazgo e Innovación", 3, 1, 3),
    ("IS103", "Estrategias y Herramientas Digitales para el Aprendizaje", 4, 1, 4),
    ("IS104", "Fundamentos de Programación", 4, 1, 4),
    ("IS105", "Matemática Básica", 4, 1, 4),
    ("IS106", "Introducción a la Ingeniería de Sistemas", 3, 1, 3),

    ("IS201", "Programación Orientada a Objetos", 4, 2, 4),
    ("IS202", "Matemática Discreta", 4, 2, 4),
    ("IS203", "Arquitectura de Computadoras", 3, 2, 3),
    ("IS204", "Base de Datos 1", 4, 2, 4),
    ("IS205", "Estadística General", 3, 2, 3),

    ("IS301", "Estructura de Datos", 4, 3, 4),
    ("IS302", "Base de Datos 2", 4, 3, 4),
    ("IS303", "Ingeniería de Software 1", 4, 3, 4),
    ("IS304", "Redes de Computadoras 1", 4, 3, 4),
    ("IS305", "Sistemas Operativos", 4, 3, 4),
]


CLASSROOMS = [
    ("A101", "Aula 101", 45, ClassroomType.THEORY, "Principal", "Pabellón A", "1", True, False),
    ("A102", "Aula 102", 45, ClassroomType.THEORY, "Principal", "Pabellón A", "1", True, False),
    ("A201", "Aula 201", 50, ClassroomType.THEORY, "Principal", "Pabellón A", "2", True, False),
    ("A202", "Aula 202", 50, ClassroomType.THEORY, "Principal", "Pabellón A", "2", True, False),
    ("B101", "Aula 101", 40, ClassroomType.THEORY, "Principal", "Pabellón B", "1", True, False),
    ("B102", "Aula 102", 40, ClassroomType.THEORY, "Principal", "Pabellón B", "1", True, False),
    ("LAB01", "Laboratorio 01", 35, ClassroomType.LAB, "Principal", "Laboratorios", "1", True, True),
    ("LAB02", "Laboratorio 02", 35, ClassroomType.LAB, "Principal", "Laboratorios", "1", True, True),
    ("LAB03", "Laboratorio 03", 35, ClassroomType.LAB, "Principal", "Laboratorios", "2", True, True),
    ("AUD01", "Auditorio Principal", 120, ClassroomType.AUDITORIUM, "Principal", "Pabellón C", "1", True, False),
]


SPECIALTIES = [
    "Programación",
    "Base de Datos",
    "Redes",
    "Matemática",
    "Ingeniería de Software",
    "Sistemas Operativos",
    "Arquitectura de Computadoras",
    "Estadística",
    "Comunicación",
    "Innovación",
]


def get_or_create_user(db, email, full_name, role, password):
    user = db.query(User).filter(User.email == email).first()

    if user:
        return user

    user = User(
        full_name=full_name,
        email=email,
        hashed_password=get_password_hash(password),
        role=role,
        is_active=True,
    )

    db.add(user)
    db.flush()

    return user


def get_or_create_teacher(db, user, teacher_code, specialty):
    teacher = db.query(Teacher).filter(Teacher.teacher_code == teacher_code).first()

    if teacher:
        return teacher

    teacher = Teacher(
        user_id=user.id,
        teacher_code=teacher_code,
        specialty=specialty,
        max_weekly_hours=28,
        rating=4.5,
    )

    db.add(teacher)
    db.flush()

    return teacher


def create_teacher_availability(db, teacher):
    existing = (
        db.query(TeacherAvailability)
        .filter(TeacherAvailability.teacher_id == teacher.id)
        .count()
    )

    if existing > 0:
        return

    # Disponibilidad amplia para pruebas reales del CSP.
    # Luego puedes hacerla más estricta desde el frontend.
    for day in range(1, 7):
        availability = TeacherAvailability(
            teacher_id=teacher.id,
            day_of_week=day,
            start_time=time(7, 0),
            end_time=time(22, 0),
            is_available=True,
        )
        db.add(availability)


def get_or_create_course(db, code, name, credits, cycle, weekly_hours):
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
    db,
    code,
    name,
    capacity,
    classroom_type,
    campus,
    building,
    floor,
    has_projector,
    has_computers,
):
    classroom = db.query(Classroom).filter(Classroom.code == code).first()

    if classroom:
        return classroom

    classroom = Classroom(
        code=code,
        name=name,
        capacity=capacity,
        classroom_type=classroom_type,
        campus=campus,
        building=building,
        floor=floor,
        has_projector=has_projector,
        has_computers=has_computers,
        is_active=True,
    )

    db.add(classroom)
    db.flush()

    return classroom


def get_or_create_section(db, course, teacher, section_code):
    section = (
        db.query(CourseSection)
        .filter(
            CourseSection.course_id == course.id,
            CourseSection.section_code == section_code,
        )
        .first()
    )

    if section:
        return section

    section = CourseSection(
        course_id=course.id,
        teacher_id=teacher.id,
        section_code=section_code,
        max_students=40,
        enrolled_students=0,
    )

    db.add(section)
    db.flush()

    return section


def get_or_create_student(db, index, cycle):
    email = f"estudiante.demo{index}@optiacademic.com"

    user = get_or_create_user(
        db=db,
        email=email,
        full_name=f"Estudiante Demo {index}",
        role=UserRole.STUDENT,
        password="estudiante123",
    )

    code = f"ESTD{index:03d}"

    student = db.query(Student).filter(Student.student_code == code).first()

    if student:
        return student

    student = Student(
        user_id=user.id,
        student_code=code,
        career=CAREER,
        current_cycle=cycle,
        min_credits=7,
        max_credits=25,
    )

    db.add(student)
    db.flush()

    return student


def get_or_create_schedule(db):
    schedule = (
        db.query(AcademicSchedule)
        .filter(AcademicSchedule.name == f"Horario Institucional Demo {PERIOD}")
        .first()
    )

    if schedule:
        return schedule

    admin = db.query(User).filter(User.role == UserRole.ADMIN).first()

    if not admin:
        admin = get_or_create_user(
            db=db,
            email="admin@optiacademic.com",
            full_name="Administrador OptiAcademic",
            role=UserRole.ADMIN,
            password="admin123",
        )

    schedule = AcademicSchedule(
        name=f"Horario Institucional Demo {PERIOD}",
        academic_period=PERIOD,
        schedule_type=ScheduleType.INSTITUTIONAL,
        status=ScheduleStatus.DRAFT,
        generated_by_user_id=admin.id,
        score=0,
        is_active=True,
    )

    db.add(schedule)
    db.flush()

    return schedule


def main():
    db = SessionLocal()

    try:
        print("Poblando docentes...")

        teachers = []

        for index in range(1, 25):
            email = f"docente.demo{index}@optiacademic.com"

            user = get_or_create_user(
                db=db,
                email=email,
                full_name=f"Docente Demo {index}",
                role=UserRole.TEACHER,
                password="docente123",
            )

            specialty = SPECIALTIES[(index - 1) % len(SPECIALTIES)]

            teacher = get_or_create_teacher(
                db=db,
                user=user,
                teacher_code=f"DOCD{index:03d}",
                specialty=specialty,
            )

            create_teacher_availability(db, teacher)
            teachers.append(teacher)

        print("Poblando cursos...")

        courses = []

        for code, name, credits, cycle, weekly_hours in COURSES:
            course = get_or_create_course(
                db=db,
                code=code,
                name=name,
                credits=credits,
                cycle=cycle,
                weekly_hours=weekly_hours,
            )

            courses.append(course)

        print("Poblando aulas...")

        for classroom_data in CLASSROOMS:
            get_or_create_classroom(db, *classroom_data)

        print("Poblando secciones...")

        section_codes = ["A", "B", "C"]

        teacher_index = 0

        for course in courses:
            for section_code in section_codes:
                teacher = teachers[teacher_index % len(teachers)]

                get_or_create_section(
                    db=db,
                    course=course,
                    teacher=teacher,
                    section_code=section_code,
                )

                teacher_index += 1

        print("Poblando estudiantes...")

        get_or_create_student(db, 1, 1)
        get_or_create_student(db, 2, 1)
        get_or_create_student(db, 3, 2)
        get_or_create_student(db, 4, 2)
        get_or_create_student(db, 5, 3)

        print("Creando horario institucional demo...")

        schedule = get_or_create_schedule(db)

        db.commit()

        print("Base demo poblada correctamente.")
        print(f"Horario institucional demo ID: {schedule.id}")
        print("Ahora genera bloques desde /admin/schedules y luego publica el horario.")

    except Exception as error:
        db.rollback()
        print("Error poblando datos:")
        print(error)
        raise

    finally:
        db.close()


if __name__ == "__main__":
    main()