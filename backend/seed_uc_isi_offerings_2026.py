from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.academic import AcademicPeriod, AcademicProgram, CurriculumCourse, CurriculumPlan
from app.models.course import CourseSection
from app.models.offering import OfferingModality, OfferingShift, OfferingStatus, SectionOffering
from app.models.user import User, UserRole


PERIOD_CODE = "2026-I"
PROGRAM_CODE = "ISI"
PLAN_CODE = "ISI-UC-2026"
ESTIMATED_BY_CYCLE = {1: 40, 2: 35, 3: 30}


def ensure_coordinator(db):
    email = "coordinator@optiacademic.com"
    user = db.query(User).filter(User.email == email).first()
    if user:
        return user
    user = User(
        full_name="Coordinador Academico Demo",
        email=email,
        hashed_password=get_password_hash("coordinator123"),
        role=UserRole.COORDINATOR,
        is_active=True,
    )
    db.add(user)
    db.flush()
    return user


def find_safe_teacher_id(db, course_id):
    section = (
        db.query(CourseSection)
        .filter(CourseSection.course_id == course_id, CourseSection.teacher_id.isnot(None))
        .order_by(CourseSection.id)
        .first()
    )
    return section.teacher_id if section else None


def main():
    db = SessionLocal()
    try:
        period = db.query(AcademicPeriod).filter(AcademicPeriod.code == PERIOD_CODE).first()
        program = db.query(AcademicProgram).filter(AcademicProgram.code == PROGRAM_CODE).first()
        plan = db.query(CurriculumPlan).filter(CurriculumPlan.code == PLAN_CODE).first()
        if not period or not program or not plan:
            raise RuntimeError(
                "Ejecute primero seed_uc_ingenieria_sistemas_curriculum.py para crear periodo, programa y plan."
            )

        ensure_coordinator(db)
        curriculum_courses = (
            db.query(CurriculumCourse)
            .filter(
                CurriculumCourse.curriculum_plan_id == plan.id,
                CurriculumCourse.cycle_number.in_([1, 2, 3]),
                CurriculumCourse.is_active == True,
            )
            .order_by(CurriculumCourse.cycle_number, CurriculumCourse.id)
            .all()
        )

        created = 0
        reused = 0
        assigned_teachers = 0
        for curriculum_course in curriculum_courses:
            offering = (
                db.query(SectionOffering)
                .filter(
                    SectionOffering.academic_period_id == period.id,
                    SectionOffering.curriculum_course_id == curriculum_course.id,
                    SectionOffering.section_code == "A",
                )
                .first()
            )
            if offering:
                reused += 1
                continue
            teacher_id = find_safe_teacher_id(db, curriculum_course.course_id)
            assigned_teachers += int(teacher_id is not None)
            offering = SectionOffering(
                academic_period_id=period.id,
                academic_program_id=program.id,
                curriculum_plan_id=plan.id,
                curriculum_course_id=curriculum_course.id,
                course_id=curriculum_course.course_id,
                section_code="A",
                display_name=f"{curriculum_course.course.name} - Seccion A",
                cycle_number=curriculum_course.cycle_number,
                teacher_id=teacher_id,
                classroom_id=None,
                estimated_students=ESTIMATED_BY_CYCLE[curriculum_course.cycle_number],
                capacity=40,
                modality=OfferingModality.PRESENTIAL,
                shift=OfferingShift.MORNING,
                status=OfferingStatus.DRAFT,
                notes="Oferta demo inicial; completar docente/aula y validar antes de aprobar.",
            )
            db.add(offering)
            created += 1

        db.commit()
        print("Oferta academica ISI 2026-I poblada correctamente.")
        print(f"Ofertas creadas: {created}; existentes omitidas: {reused}.")
        print(f"Docentes asignados por coincidencia segura con secciones existentes: {assigned_teachers}.")
        print("Usuario coordinador demo: coordinator@optiacademic.com / coordinator123")
        print("Las ofertas quedan DRAFT hasta completar recursos y validaciones.")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
