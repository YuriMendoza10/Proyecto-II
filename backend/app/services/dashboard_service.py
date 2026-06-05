from sqlalchemy import func, text
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.classroom import Classroom
from app.models.course import Course, CourseSection
from app.models.schedule import AcademicSchedule, ScheduleBlock, ScheduleType
from app.models.student import Student
from app.models.teacher import Teacher, TeacherAvailability
from app.models.user import User


class DashboardService:
    def __init__(self, db: Session):
        self.db = db

    def get_admin_summary(self, schedule_id: int | None = None):
        schedule = self._resolve_schedule(schedule_id)

        total_users = self.db.query(User).count()
        total_active_users = self.db.query(User).filter(User.is_active == True).count()

        total_teachers = self.db.query(Teacher).count()
        total_students = self.db.query(Student).count()
        total_courses = self.db.query(Course).count()
        total_sections = self.db.query(CourseSection).count()

        total_classrooms = self.db.query(Classroom).count()
        total_active_classrooms = (
            self.db.query(Classroom)
            .filter(Classroom.is_active == True)
            .count()
        )

        total_schedules = self.db.query(AcademicSchedule).count()

        total_schedule_blocks = 0
        blocks_without_teacher = 0

        if schedule:
            total_schedule_blocks = (
                self.db.query(ScheduleBlock)
                .filter(ScheduleBlock.schedule_id == schedule.id)
                .count()
            )

            blocks_without_teacher = (
                self.db.query(ScheduleBlock)
                .join(CourseSection, CourseSection.id == ScheduleBlock.section_id)
                .filter(ScheduleBlock.schedule_id == schedule.id)
                .filter(CourseSection.teacher_id.is_(None))
                .count()
            )

        sections_without_teacher = (
            self.db.query(CourseSection)
            .filter(CourseSection.teacher_id.is_(None))
            .count()
        )

        teachers_without_availability = (
            self.db.query(Teacher)
            .outerjoin(
                TeacherAvailability,
                TeacherAvailability.teacher_id == Teacher.id,
            )
            .group_by(Teacher.id)
            .having(func.count(TeacherAvailability.id) == 0)
            .count()
        )

        courses_without_sections = (
            self.db.query(Course)
            .outerjoin(
                CourseSection,
                CourseSection.course_id == Course.id,
            )
            .group_by(Course.id)
            .having(func.count(CourseSection.id) == 0)
            .count()
        )

        schedules_by_status = self._get_schedules_by_status()
        teacher_load_top = self._get_teacher_load_top(schedule.id if schedule else None)
        classroom_usage_top = self._get_classroom_usage_top(schedule.id if schedule else None)

        return {
            "schedule_id": schedule.id if schedule else None,
            "schedule_name": schedule.name if schedule else None,
            "schedule_status": self._enum_to_str(schedule.status) if schedule else None,

            "total_users": total_users,
            "total_active_users": total_active_users,
            "total_teachers": total_teachers,
            "total_students": total_students,
            "total_courses": total_courses,
            "total_sections": total_sections,
            "total_classrooms": total_classrooms,
            "total_active_classrooms": total_active_classrooms,
            "total_schedules": total_schedules,
            "total_schedule_blocks": total_schedule_blocks,

            "sections_without_teacher": sections_without_teacher,
            "teachers_without_availability": teachers_without_availability,
            "courses_without_sections": courses_without_sections,
            "blocks_without_teacher": blocks_without_teacher,

            "schedules_by_status": schedules_by_status,
            "teacher_load_top": teacher_load_top,
            "classroom_usage_top": classroom_usage_top,
        }

    def _resolve_schedule(self, schedule_id: int | None):
        if schedule_id:
            return (
                self.db.query(AcademicSchedule)
                .filter(AcademicSchedule.id == schedule_id)
                .first()
            )

        return (
            self.db.query(AcademicSchedule)
            .filter(AcademicSchedule.schedule_type == ScheduleType.INSTITUTIONAL)
            .filter(AcademicSchedule.is_active == True)
            .order_by(AcademicSchedule.id.desc())
            .first()
        )

    def _get_schedules_by_status(self):
        rows = (
            self.db.query(
                AcademicSchedule.status,
                func.count(AcademicSchedule.id),
            )
            .group_by(AcademicSchedule.status)
            .all()
        )

        return [
            {
                "status": self._enum_to_str(status),
                "total": total,
            }
            for status, total in rows
        ]

    def _get_teacher_load_top(self, schedule_id: int | None):
        if not schedule_id:
            return []

        rows = (
            self.db.query(
                Teacher.id.label("teacher_id"),
                Teacher.teacher_code.label("teacher_code"),
                User.full_name.label("teacher_name"),
                func.count(ScheduleBlock.id).label("total_blocks"),
                func.sum(
                    func.timestampdiff(
                        text("MINUTE"),
                        ScheduleBlock.start_time,
                        ScheduleBlock.end_time,
                    )
                ).label("total_minutes"),
            )
            .join(User, User.id == Teacher.user_id)
            .join(CourseSection, CourseSection.teacher_id == Teacher.id)
            .join(ScheduleBlock, ScheduleBlock.section_id == CourseSection.id)
            .filter(ScheduleBlock.schedule_id == schedule_id)
            .group_by(Teacher.id, Teacher.teacher_code, User.full_name)
            .order_by(func.count(ScheduleBlock.id).desc())
            .limit(10)
            .all()
        )

        result = []

        for row in rows:
            total_minutes = int(row.total_minutes or 0)

            result.append(
                {
                    "teacher_id": row.teacher_id,
                    "teacher_code": row.teacher_code,
                    "teacher_name": row.teacher_name,
                    "total_blocks": int(row.total_blocks or 0),
                    "total_minutes": total_minutes,
                    "total_hours": round(total_minutes / 60, 2),
                }
            )

        return result

    def _get_classroom_usage_top(self, schedule_id: int | None):
        if not schedule_id:
            return []

        rows = (
            self.db.query(
                Classroom.id.label("classroom_id"),
                Classroom.code.label("classroom_code"),
                Classroom.name.label("classroom_name"),
                func.count(ScheduleBlock.id).label("total_blocks"),
            )
            .join(ScheduleBlock, ScheduleBlock.classroom_id == Classroom.id)
            .filter(ScheduleBlock.schedule_id == schedule_id)
            .group_by(Classroom.id, Classroom.code, Classroom.name)
            .order_by(func.count(ScheduleBlock.id).desc())
            .limit(10)
            .all()
        )

        return [
            {
                "classroom_id": row.classroom_id,
                "classroom_code": row.classroom_code,
                "classroom_name": row.classroom_name,
                "total_blocks": int(row.total_blocks or 0),
            }
            for row in rows
        ]

    def _enum_to_str(self, value):
        if value is None:
            return None

        if hasattr(value, "value"):
            return value.value

        return str(value)