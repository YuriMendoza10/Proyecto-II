from sqlalchemy.orm import Session, joinedload

from app.models.classroom import Classroom
from app.models.course import Course, CourseSection
from app.models.schedule import AcademicSchedule, ScheduleBlock, ScheduleType
from app.models.student import Student
from app.models.teacher import Teacher, TeacherAvailability
from app.models.user import User


class DataReadinessService:
    def __init__(self, db: Session):
        self.db = db

    def get_readiness_report(
        self,
        career_filter: str | None = None,
        academic_period: str | None = None,
    ):
        checks = [
            self._check_courses_without_sections(career_filter),
            self._check_sections_without_teacher(career_filter),
            self._check_teachers_without_availability(),
            self._check_no_active_classrooms(),
            self._check_courses_without_weekly_hours(career_filter),
            self._check_students_with_incomplete_data(career_filter),
            self._check_institutional_schedules_without_blocks(academic_period),
        ]

        summary = self._build_summary(checks)

        return {
            "career_filter": career_filter,
            "academic_period": academic_period,
            "summary": summary,
            "checks": checks,
        }

    def _check_courses_without_sections(self, career_filter: str | None):
        query = (
            self.db.query(Course)
            .outerjoin(CourseSection, CourseSection.course_id == Course.id)
            .filter(Course.is_active == True)
        )

        if career_filter:
            query = query.filter(Course.career == career_filter)

        courses = query.all()

        affected_items = []

        for course in courses:
            section_count = (
                self.db.query(CourseSection)
                .filter(CourseSection.course_id == course.id)
                .count()
            )

            if section_count == 0:
                affected_items.append(
                    {
                        "course_id": course.id,
                        "code": course.code,
                        "name": course.name,
                        "career": course.career,
                        "cycle": course.cycle,
                    }
                )

        affected = len(affected_items)

        return {
            "code": "COURSES_WITHOUT_SECTIONS",
            "title": "Cursos sin secciones",
            "severity": "CRITICAL" if affected > 0 else "OK",
            "passed": affected == 0,
            "total": len(courses),
            "affected": affected,
            "message": (
                "Todos los cursos activos tienen secciones."
                if affected == 0
                else f"Hay {affected} curso(s) activo(s) sin secciones."
            ),
            "items": affected_items[:50],
        }

    def _check_sections_without_teacher(self, career_filter: str | None):
        query = (
            self.db.query(CourseSection)
            .options(joinedload(CourseSection.course))
            .join(CourseSection.course)
            .filter(Course.is_active == True)
        )

        if career_filter:
            query = query.filter(Course.career == career_filter)

        sections = query.all()

        affected_items = []

        for section in sections:
            course = section.course

            if section.teacher_id is None:
                affected_items.append(
                    {
                        "section_id": section.id,
                        "section_code": section.section_code,
                        "course_id": section.course_id,
                        "course_code": course.code if course else None,
                        "course_name": course.name if course else None,
                        "cycle": course.cycle if course else None,
                    }
                )

        affected = len(affected_items)

        return {
            "code": "SECTIONS_WITHOUT_TEACHER",
            "title": "Secciones sin docente",
            "severity": "CRITICAL" if affected > 0 else "OK",
            "passed": affected == 0,
            "total": len(sections),
            "affected": affected,
            "message": (
                "Todas las secciones tienen docente asignado."
                if affected == 0
                else f"Hay {affected} sección(es) sin docente asignado."
            ),
            "items": affected_items[:50],
        }

    def _check_teachers_without_availability(self):
        teachers = (
            self.db.query(Teacher)
            .options(joinedload(Teacher.user))
            .all()
        )

        affected_items = []

        for teacher in teachers:
            availability_count = (
                self.db.query(TeacherAvailability)
                .filter(TeacherAvailability.teacher_id == teacher.id)
                .filter(TeacherAvailability.is_available == True)
                .count()
            )

            if availability_count == 0:
                user = teacher.user

                affected_items.append(
                    {
                        "teacher_id": teacher.id,
                        "teacher_code": teacher.teacher_code,
                        "teacher_name": user.full_name if user else None,
                        "email": user.email if user else None,
                    }
                )

        affected = len(affected_items)

        return {
            "code": "TEACHERS_WITHOUT_AVAILABILITY",
            "title": "Docentes sin disponibilidad",
            "severity": "CRITICAL" if affected > 0 else "OK",
            "passed": affected == 0,
            "total": len(teachers),
            "affected": affected,
            "message": (
                "Todos los docentes tienen disponibilidad registrada."
                if affected == 0
                else f"Hay {affected} docente(s) sin disponibilidad registrada."
            ),
            "items": affected_items[:50],
        }

    def _check_no_active_classrooms(self):
        total_classrooms = self.db.query(Classroom).count()

        active_classrooms = (
            self.db.query(Classroom)
            .filter(Classroom.is_active == True)
            .count()
        )

        affected = 1 if active_classrooms == 0 else 0

        return {
            "code": "NO_ACTIVE_CLASSROOMS",
            "title": "Aulas activas disponibles",
            "severity": "CRITICAL" if active_classrooms == 0 else "OK",
            "passed": active_classrooms > 0,
            "total": total_classrooms,
            "affected": affected,
            "message": (
                f"Hay {active_classrooms} aula(s) activa(s) disponibles."
                if active_classrooms > 0
                else "No existen aulas activas disponibles para generar horarios."
            ),
            "items": [],
        }

    def _check_courses_without_weekly_hours(self, career_filter: str | None):
        query = self.db.query(Course).filter(Course.is_active == True)

        if career_filter:
            query = query.filter(Course.career == career_filter)

        courses = query.all()

        affected_items = []

        for course in courses:
            weekly_hours = int(course.weekly_hours or 0)

            if weekly_hours <= 0:
                affected_items.append(
                    {
                        "course_id": course.id,
                        "code": course.code,
                        "name": course.name,
                        "career": course.career,
                        "cycle": course.cycle,
                        "weekly_hours": course.weekly_hours,
                    }
                )

        affected = len(affected_items)

        return {
            "code": "COURSES_WITHOUT_WEEKLY_HOURS",
            "title": "Cursos sin horas semanales válidas",
            "severity": "CRITICAL" if affected > 0 else "OK",
            "passed": affected == 0,
            "total": len(courses),
            "affected": affected,
            "message": (
                "Todos los cursos activos tienen horas semanales válidas."
                if affected == 0
                else f"Hay {affected} curso(s) con horas semanales inválidas."
            ),
            "items": affected_items[:50],
        }

    def _check_students_with_incomplete_data(self, career_filter: str | None):
        query = (
            self.db.query(Student)
            .options(joinedload(Student.user))
        )

        if career_filter:
            query = query.filter(Student.career == career_filter)

        students = query.all()

        affected_items = []

        for student in students:
            has_issue = False
            reasons = []

            if not student.career:
                has_issue = True
                reasons.append("Sin carrera")

            if not student.current_cycle or student.current_cycle <= 0:
                has_issue = True
                reasons.append("Ciclo inválido")

            if not student.min_credits or not student.max_credits:
                has_issue = True
                reasons.append("Créditos incompletos")

            if student.min_credits and student.max_credits:
                if student.min_credits > student.max_credits:
                    has_issue = True
                    reasons.append("Créditos mínimos mayores que máximos")

            if has_issue:
                user = student.user

                affected_items.append(
                    {
                        "student_id": student.id,
                        "student_code": student.student_code,
                        "student_name": user.full_name if user else None,
                        "email": user.email if user else None,
                        "career": student.career,
                        "current_cycle": student.current_cycle,
                        "min_credits": student.min_credits,
                        "max_credits": student.max_credits,
                        "reasons": reasons,
                    }
                )

        affected = len(affected_items)

        return {
            "code": "STUDENTS_WITH_INCOMPLETE_DATA",
            "title": "Estudiantes con datos incompletos",
            "severity": "WARNING" if affected > 0 else "OK",
            "passed": affected == 0,
            "total": len(students),
            "affected": affected,
            "message": (
                "Todos los estudiantes evaluados tienen datos académicos mínimos."
                if affected == 0
                else f"Hay {affected} estudiante(s) con datos incompletos."
            ),
            "items": affected_items[:50],
        }

    def _check_institutional_schedules_without_blocks(
        self,
        academic_period: str | None,
    ):
        query = (
            self.db.query(AcademicSchedule)
            .filter(AcademicSchedule.schedule_type == ScheduleType.INSTITUTIONAL)
            .filter(AcademicSchedule.is_active == True)
        )

        if academic_period:
            query = query.filter(AcademicSchedule.academic_period == academic_period)

        schedules = query.all()

        affected_items = []

        for schedule in schedules:
            block_count = (
                self.db.query(ScheduleBlock)
                .filter(ScheduleBlock.schedule_id == schedule.id)
                .count()
            )

            if block_count == 0:
                affected_items.append(
                    {
                        "schedule_id": schedule.id,
                        "name": schedule.name,
                        "academic_period": schedule.academic_period,
                        "status": self._enum_to_str(schedule.status),
                    }
                )

        affected = len(affected_items)

        return {
            "code": "INSTITUTIONAL_SCHEDULES_WITHOUT_BLOCKS",
            "title": "Horarios institucionales sin bloques",
            "severity": "WARNING" if affected > 0 else "OK",
            "passed": affected == 0,
            "total": len(schedules),
            "affected": affected,
            "message": (
                "Todos los horarios institucionales activos evaluados tienen bloques."
                if affected == 0
                else f"Hay {affected} horario(s) institucional(es) activo(s) sin bloques."
            ),
            "items": affected_items[:50],
        }

    def _build_summary(self, checks: list[dict]):
        critical_checks = len(
            [
                check
                for check in checks
                if check["severity"] == "CRITICAL"
            ]
        )

        warning_checks = len(
            [
                check
                for check in checks
                if check["severity"] == "WARNING"
            ]
        )

        passed_checks = len(
            [
                check
                for check in checks
                if check["passed"]
            ]
        )

        if critical_checks > 0:
            status = "CRITICAL"
        elif warning_checks > 0:
            status = "WARNING"
        else:
            status = "READY"

        return {
            "ready": critical_checks == 0,
            "status": status,
            "total_checks": len(checks),
            "passed_checks": passed_checks,
            "warning_checks": warning_checks,
            "critical_checks": critical_checks,
        }

    def _enum_to_str(self, value):
        if value is None:
            return None

        if hasattr(value, "value"):
            return value.value

        return str(value)