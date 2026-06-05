from collections import defaultdict

from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.academic import AcademicPeriod, AcademicPeriodStatus, Campus, CurriculumCourse, CurriculumPlan, CurriculumPlanStatus
from app.models.student import Student, StudentAcademicHistory, StudentAcademicHistoryStatus, StudentEnrollmentStatus
from app.models.user import User, UserRole

STUDENT_COUNT = 150
DEFAULT_PASSWORD = "Student123!"


def seed_students_history(db):
    summary = defaultdict(int)
    warnings: list[str] = []
    errors: list[str] = []
    campus = db.query(Campus).filter(Campus.name == "Sede Huancayo").first()
    if not campus:
        raise RuntimeError("No existe Sede Huancayo. Ejecuta primero seed_huancayo_institutional_base.py")

    plans = (
        db.query(CurriculumPlan)
        .filter(CurriculumPlan.status == CurriculumPlanStatus.ACTIVE)
        .order_by(CurriculumPlan.id.asc())
        .all()
    )
    if not plans:
        raise RuntimeError("No existen planes curriculares activos para generar estudiantes demo")
    if len(plans) < 2:
        warnings.append("Solo existe un plan curricular activo; la distribucion demo queda limitada a una carrera.")

    period = (
        db.query(AcademicPeriod)
        .filter(AcademicPeriod.status == AcademicPeriodStatus.ACTIVE)
        .order_by(AcademicPeriod.id.desc())
        .first()
    )
    if not period:
        period = db.query(AcademicPeriod).order_by(AcademicPeriod.id.desc()).first()
    if not period:
        raise RuntimeError("No existe periodo academico para asociar el historial demo")

    hashed_password = get_password_hash(DEFAULT_PASSWORD)
    courses_by_plan = {}
    for plan in plans:
        courses_by_plan[plan.id] = (
            db.query(CurriculumCourse)
            .filter(CurriculumCourse.curriculum_plan_id == plan.id, CurriculumCourse.is_active.is_(True))
            .order_by(CurriculumCourse.cycle_number.asc(), CurriculumCourse.id.asc())
            .all()
        )

    for number in range(1, STUDENT_COUNT + 1):
        try:
            plan = plans[(number - 1) % len(plans)]
            current_cycle = ((number - 1) % 10) + 1
            student_code = f"HYO{number:04d}"
            email = f"estudiante.huancayo{number:03d}@optiacademic.com"
            user = db.query(User).filter(User.email == email).first()
            if not user:
                user = User(
                    full_name=f"Estudiante Huancayo {number:03d}",
                    email=email,
                    hashed_password=hashed_password,
                    role=UserRole.STUDENT,
                    is_active=True,
                )
                db.add(user)
                db.flush()

            student = db.query(Student).filter(Student.student_code == student_code).first()
            if not student:
                student = Student(user_id=user.id, student_code=student_code, career=plan.program.name)
                db.add(student)
                db.flush()
                summary["students_created"] += 1
            else:
                summary["students_updated"] += 1

            student.academic_program_id = plan.program_id
            student.curriculum_plan_id = plan.id
            student.campus_id = campus.id
            student.admission_period_id = period.id
            student.current_cycle = current_cycle
            student.enrollment_status = StudentEnrollmentStatus.ENROLLED
            student.max_credits_allowed = student.max_credits or 25
            student.is_active = True

            for curriculum_course in courses_by_plan[plan.id]:
                if curriculum_course.cycle_number > current_cycle:
                    continue
                if curriculum_course.cycle_number == current_cycle:
                    record_status = StudentAcademicHistoryStatus.IN_PROGRESS
                    grade = None
                elif (number + curriculum_course.course_id) % 11 == 0:
                    record_status = StudentAcademicHistoryStatus.FAILED
                    grade = 9
                else:
                    record_status = StudentAcademicHistoryStatus.APPROVED
                    grade = 15

                record = (
                    db.query(StudentAcademicHistory)
                    .filter(
                        StudentAcademicHistory.student_id == student.id,
                        StudentAcademicHistory.course_id == curriculum_course.course_id,
                        StudentAcademicHistory.academic_period_id == period.id,
                        StudentAcademicHistory.attempt_number == 1,
                    )
                    .first()
                )
                if not record:
                    record = StudentAcademicHistory(
                        student_id=student.id,
                        course_id=curriculum_course.course_id,
                        academic_period_id=period.id,
                        attempt_number=1,
                    )
                    db.add(record)
                    summary["history_created"] += 1
                else:
                    summary["history_updated"] += 1
                record.status = record_status
                record.grade = grade
                record.credits = curriculum_course.credits
                summary[f"{record_status.value.lower()}_records"] += 1
        except Exception as exc:  # Keep the demo seed informative without leaving a partial failed row.
            db.rollback()
            errors.append(f"Estudiante {number}: {exc}")
        else:
            db.commit()

    result = {
        "students_created": summary["students_created"],
        "students_updated": summary["students_updated"],
        "history_created": summary["history_created"],
        "history_updated": summary["history_updated"],
        "approved_records": summary["approved_records"],
        "failed_records": summary["failed_records"],
        "in_progress_records": summary["in_progress_records"],
        "warnings": warnings,
        "errors": errors,
    }
    print(result)
    return result


if __name__ == "__main__":
    session = SessionLocal()
    try:
        seed_students_history(session)
    finally:
        session.close()
