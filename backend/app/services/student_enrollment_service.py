from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.models.course import Course
from app.models.student import Student, StudentCourseEnrollment


class StudentEnrollmentService:
    def __init__(self, db: Session):
        self.db = db

    def list_enrollments(
        self,
        student_id: int | None = None,
        academic_period: str | None = None,
        only_active: bool = True,
    ):
        query = (
            self.db.query(StudentCourseEnrollment)
            .options(joinedload(StudentCourseEnrollment.course))
        )

        if student_id:
            query = query.filter(StudentCourseEnrollment.student_id == student_id)

        if academic_period:
            query = query.filter(StudentCourseEnrollment.academic_period == academic_period)

        if only_active:
            query = query.filter(StudentCourseEnrollment.is_active == True)

        enrollments = query.order_by(StudentCourseEnrollment.id.asc()).all()

        return [
            self._enrollment_to_response(enrollment)
            for enrollment in enrollments
        ]

    def create_enrollment(
        self,
        student_id: int,
        course_id: int,
        academic_period: str,
        status_value: str = "ENROLLED",
        is_active: bool = True,
    ):
        student = self._get_student(student_id)
        course = self._get_course(course_id)

        if student.career != course.career:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "No se puede matricular el curso porque pertenece a otra carrera. "
                    f"Estudiante: {student.career}. Curso: {course.career}."
                ),
            )

        existing = (
            self.db.query(StudentCourseEnrollment)
            .filter(StudentCourseEnrollment.student_id == student_id)
            .filter(StudentCourseEnrollment.course_id == course_id)
            .filter(StudentCourseEnrollment.academic_period == academic_period)
            .first()
        )

        if existing:
            existing.status = status_value
            existing.is_active = is_active

            self.db.add(existing)
            self.db.commit()
            self.db.refresh(existing)

            return self._enrollment_to_response(existing)

        enrollment = StudentCourseEnrollment(
            student_id=student_id,
            course_id=course_id,
            academic_period=academic_period,
            status=status_value,
            is_active=is_active,
        )

        self.db.add(enrollment)
        self.db.commit()
        self.db.refresh(enrollment)

        return self._enrollment_to_response(enrollment)

    def bulk_create_enrollments(
        self,
        student_id: int,
        course_ids: list[int],
        academic_period: str,
    ):
        if not course_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Debes enviar al menos un curso para matricular.",
            )

        created = []

        for course_id in course_ids:
            created.append(
                self.create_enrollment(
                    student_id=student_id,
                    course_id=course_id,
                    academic_period=academic_period,
                    status_value="ENROLLED",
                    is_active=True,
                )
            )

        return created

    def delete_enrollment(self, enrollment_id: int):
        enrollment = (
            self.db.query(StudentCourseEnrollment)
            .filter(StudentCourseEnrollment.id == enrollment_id)
            .first()
        )

        if not enrollment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Matrícula de curso no encontrada.",
            )

        self.db.delete(enrollment)
        self.db.commit()

        return {
            "success": True,
            "message": "Curso retirado de la matrícula del estudiante.",
            "enrollment_id": enrollment_id,
        }

    def deactivate_enrollment(self, enrollment_id: int):
        enrollment = (
            self.db.query(StudentCourseEnrollment)
            .filter(StudentCourseEnrollment.id == enrollment_id)
            .first()
        )

        if not enrollment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Matrícula de curso no encontrada.",
            )

        enrollment.is_active = False
        enrollment.status = "DROPPED"

        self.db.add(enrollment)
        self.db.commit()
        self.db.refresh(enrollment)

        return self._enrollment_to_response(enrollment)

    def get_available_courses_for_student(
        self,
        student_id: int,
        academic_period: str,
    ):
        student = (
            self.db.query(Student)
            .options(joinedload(Student.user))
            .filter(Student.id == student_id)
            .first()
        )

        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Estudiante no encontrado.",
            )

        enrollments = (
            self.db.query(StudentCourseEnrollment)
            .options(joinedload(StudentCourseEnrollment.course))
            .filter(StudentCourseEnrollment.student_id == student_id)
            .filter(StudentCourseEnrollment.academic_period == academic_period)
            .filter(StudentCourseEnrollment.is_active == True)
            .all()
        )

        courses = [
            self._enrollment_to_response(enrollment)
            for enrollment in enrollments
        ]

        total_credits = sum(
            course.get("credits") or 0
            for course in courses
        )

        return {
            "student_id": student.id,
            "student_code": student.student_code,
            "student_name": student.user.full_name if student.user else None,
            "career": student.career,
            "current_cycle": student.current_cycle,
            "min_credits": student.min_credits,
            "max_credits": student.max_credits,
            "academic_period": academic_period,
            "total_courses": len(courses),
            "total_credits": total_credits,
            "courses": courses,
        }

    def seed_student_cycle_courses(
        self,
        student_id: int,
        academic_period: str = "2026-1",
    ):
        student = self._get_student(student_id)

        courses = (
            self.db.query(Course)
            .filter(Course.is_active == True)
            .filter(Course.career == student.career)
            .filter(Course.cycle == student.current_cycle)
            .order_by(Course.id.asc())
            .all()
        )

        if not courses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "No hay cursos activos para la carrera y ciclo actual del estudiante."
                ),
            )

        return self.bulk_create_enrollments(
            student_id=student_id,
            course_ids=[course.id for course in courses],
            academic_period=academic_period,
        )

    def _get_student(self, student_id: int):
        student = (
            self.db.query(Student)
            .filter(Student.id == student_id)
            .first()
        )

        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Estudiante no encontrado.",
            )

        return student

    def _get_course(self, course_id: int):
        course = (
            self.db.query(Course)
            .filter(Course.id == course_id)
            .first()
        )

        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Curso no encontrado.",
            )

        if not course.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se puede matricular un curso inactivo.",
            )

        return course

    def _enrollment_to_response(self, enrollment: StudentCourseEnrollment):
        course = enrollment.course

        return {
            "id": enrollment.id,
            "student_id": enrollment.student_id,
            "course_id": enrollment.course_id,
            "academic_period": enrollment.academic_period,
            "academic_period_id": enrollment.academic_period_id,
            "status": enrollment.status,
            "is_active": enrollment.is_active,
            "course_code": course.code if course else None,
            "course_name": course.name if course else None,
            "credits": course.credits if course else None,
            "cycle": course.cycle if course else None,
            "career": course.career if course else None,
            "weekly_hours": course.weekly_hours if course else None,
        }
