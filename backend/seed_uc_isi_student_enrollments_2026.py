from app.core.database import SessionLocal
from app.models.academic import AcademicPeriod, CurriculumCourse, CurriculumPlan
from app.models.student import Student, StudentCourseEnrollment
from app.models.user import User


def main():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "estudiante.demo1@optiacademic.com").first()
        student = db.query(Student).filter(Student.user_id == user.id).first() if user else None
        period = db.query(AcademicPeriod).filter(AcademicPeriod.code == "2026-I").first()
        plan = db.query(CurriculumPlan).filter(CurriculumPlan.code == "ISI-UC-2026").first()
        if not student or not period or not plan:
            raise RuntimeError("Ejecute primero los seeds realista y curricular.")
        courses = (
            db.query(CurriculumCourse)
            .filter(
                CurriculumCourse.curriculum_plan_id == plan.id,
                CurriculumCourse.cycle_number == 1,
                CurriculumCourse.is_active == True,
            )
            .order_by(CurriculumCourse.id)
            .all()
        )
        created = 0
        updated = 0
        for curriculum_course in courses:
            item = (
                db.query(StudentCourseEnrollment)
                .filter(
                    StudentCourseEnrollment.student_id == student.id,
                    StudentCourseEnrollment.course_id == curriculum_course.course_id,
                    StudentCourseEnrollment.academic_period == period.code,
                )
                .first()
            )
            if not item:
                item = StudentCourseEnrollment(
                    student_id=student.id,
                    course_id=curriculum_course.course_id,
                    academic_period=period.code,
                    academic_period_id=period.id,
                    status="ASSIGNED",
                    is_active=True,
                )
                db.add(item)
                created += 1
            else:
                item.academic_period_id = period.id
                item.status = "ASSIGNED"
                item.is_active = True
                updated += 1
        db.commit()
        print(f"Cursos asignados al estudiante demo para 2026-I: {len(courses)}.")
        print(f"Nuevos: {created}; actualizados: {updated}.")
        print("Estos registros representan cursos asignados, no una matricula oficial.")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
