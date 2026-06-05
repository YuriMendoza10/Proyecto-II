from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.models.academic import AcademicPeriod, AcademicPeriodStatus, AcademicProgram, CurriculumPlan
from app.models.classroom import Classroom
from app.models.offering import OfferingConflict, OfferingConflictSeverity, OfferingStatus, SectionOffering
from app.models.schedule import AcademicSchedule, ScheduleBlock, ScheduleStatus, ScheduleType, StudentSchedule
from app.models.schedule_change_request import ScheduleChangeRequest, ScheduleChangeRequestStatus
from app.models.student import Student, StudentCourseEnrollment
from app.models.teacher import Teacher
from app.models.user import User
from app.services.environmental_service import EnvironmentalService


class ReportService:
    AVAILABLE_WEEKLY_HOURS = 75.0
    GREENFRAME_PATH = Path(__file__).resolve().parents[2] / "public" / "assets" / "greenframe-latest.txt"

    def __init__(self, db: Session):
        self.db = db

    def executive_summary(self, academic_period_id: int | None = None) -> dict:
        period = self._period(academic_period_id)
        offerings = self._offerings(period)
        schedules = self._institutional_schedules(period)
        conflicts = self._conflicts(period)
        requests = self._change_requests(period)
        enrollment_query = self.db.query(StudentCourseEnrollment).filter(StudentCourseEnrollment.is_active.is_(True))
        if period:
            enrollment_query = enrollment_query.filter(StudentCourseEnrollment.academic_period_id == period.id)
        schedule_student_ids = self.db.query(StudentSchedule.student_id).distinct().all()
        teacher_rows = self.db.query(Teacher).join(User, Teacher.user_id == User.id).all()

        return {
            "active_period": self._period_value(period),
            "total_programs": self.db.query(AcademicProgram).count(),
            "total_curriculum_plans": self.db.query(CurriculumPlan).count(),
            "total_offerings": len(offerings),
            "offerings_by_status": self._enum_counts(offerings, "status"),
            "total_schedules": len(schedules),
            "schedules_by_status": self._enum_counts(schedules, "status"),
            "total_published_schedules": sum(item.status == ScheduleStatus.PUBLISHED for item in schedules),
            "total_teachers": len(teacher_rows),
            "active_teachers": sum(bool(item.user.is_active) for item in teacher_rows),
            "total_students": self.db.query(Student).count(),
            "students_with_enrollments": enrollment_query.with_entities(StudentCourseEnrollment.student_id).distinct().count(),
            "students_with_saved_schedules": len(schedule_student_ids),
            "total_classrooms": self.db.query(Classroom).count(),
            "active_classrooms": self.db.query(Classroom).filter(Classroom.is_active.is_(True)).count(),
            "total_conflicts": len(conflicts),
            "critical_conflicts": sum(
                item.severity == OfferingConflictSeverity.CRITICAL and not item.is_resolved for item in conflicts
            ),
            "pending_change_requests": sum(item.status == ScheduleChangeRequestStatus.PENDING for item in requests),
            "approved_change_requests": sum(item.status == ScheduleChangeRequestStatus.APPROVED for item in requests),
            "latest_greenframe_result": self._greenframe_value(),
        }

    def teacher_load(self, academic_period_id: int | None = None) -> dict:
        period = self._period(academic_period_id)
        blocks = self._published_blocks(period)
        grouped = defaultdict(list)
        for block in blocks:
            if block.section_offering and block.section_offering.teacher_id:
                grouped[block.section_offering.teacher_id].append(block)

        teachers = self.db.query(Teacher).options(joinedload(Teacher.user)).order_by(Teacher.id).all()
        data = []
        for teacher in teachers:
            teacher_blocks = grouped.get(teacher.id, [])
            hours_by_day = defaultdict(float)
            courses = {}
            section_ids = set()
            for block in teacher_blocks:
                hours = self._duration(block)
                hours_by_day[str(block.day_of_week)] += hours
                offering = block.section_offering
                section_ids.add(offering.id)
                course = offering.course
                item = courses.setdefault(
                    course.id,
                    {"course_id": course.id, "course_code": course.code, "course_name": course.name, "hours": 0.0},
                )
                item["hours"] += hours
            assigned = round(sum(hours_by_day.values()), 2)
            percentage = round(assigned / teacher.max_weekly_hours * 100, 2) if teacher.max_weekly_hours else 0.0
            if percentage == 0:
                load_status = "LOW"
            elif assigned > teacher.max_weekly_hours:
                load_status = "OVERLOADED"
            elif percentage >= 85:
                load_status = "WARNING"
            else:
                load_status = "NORMAL"
            data.append(
                {
                    "teacher_id": teacher.id,
                    "teacher_name": teacher.user.full_name,
                    "assigned_weekly_hours": assigned,
                    "max_weekly_hours": teacher.max_weekly_hours,
                    "load_percentage": percentage,
                    "status": load_status,
                    "courses_count": len(courses),
                    "sections_count": len(section_ids),
                    "hours_by_day": {key: round(value, 2) for key, value in hours_by_day.items()},
                    "courses_summary": [
                        {**value, "hours": round(value["hours"], 2)} for value in courses.values()
                    ],
                }
            )
        return {"active_period": self._period_value(period), "teachers": data}

    def classroom_usage(self, academic_period_id: int | None = None) -> dict:
        period = self._period(academic_period_id)
        grouped = defaultdict(list)
        for block in self._published_blocks(period):
            if block.classroom_id:
                grouped[block.classroom_id].append(block)
        classrooms = self.db.query(Classroom).order_by(Classroom.code).all()
        result = []
        for classroom in classrooms:
            blocks = grouped.get(classroom.id, [])
            by_day = defaultdict(float)
            by_shift = defaultdict(float)
            for block in blocks:
                hours = self._duration(block)
                by_day[str(block.day_of_week)] += hours
                shift = block.section_offering.shift.value if block.section_offering else self._time_shift(block)
                by_shift[shift] += hours
            used = round(sum(by_day.values()), 2)
            percentage = round(used / self.AVAILABLE_WEEKLY_HOURS * 100, 2)
            usage_status = (
                "SATURATED" if percentage >= 95 else
                "HIGH_USAGE" if percentage >= 70 else
                "NORMAL" if percentage >= 25 else
                "LOW_USAGE"
            )
            result.append(
                {
                    "classroom_id": classroom.id,
                    "classroom_code": classroom.code,
                    "classroom_name": classroom.name,
                    "type": classroom.classroom_type.value,
                    "capacity": classroom.capacity,
                    "used_hours": used,
                    "usage_percentage": percentage,
                    "blocks_count": len(blocks),
                    "usage_by_day": {key: round(value, 2) for key, value in by_day.items()},
                    "usage_by_shift": {key: round(value, 2) for key, value in by_shift.items()},
                    "status": usage_status,
                }
            )
        return {
            "active_period": self._period_value(period),
            "available_weekly_hours": self.AVAILABLE_WEEKLY_HOURS,
            "classrooms": result,
        }

    def offering_status(self, academic_period_id: int | None = None) -> dict:
        period = self._period(academic_period_id)
        offerings = self._offerings(period)
        statuses = self._enum_counts(offerings, "status")
        return {
            "active_period": self._period_value(period),
            "total_offerings": len(offerings),
            "by_status": statuses,
            "by_cycle": self._counts(offerings, lambda item: str(item.cycle_number)),
            "by_modality": self._counts(offerings, lambda item: item.modality.value),
            "by_shift": self._counts(offerings, lambda item: item.shift.value),
            "missing_teacher": sum(item.teacher_id is None for item in offerings),
            "missing_classroom": sum(
                item.classroom_id is None and item.modality.value != "VIRTUAL" for item in offerings
            ),
            "ready_count": statuses.get(OfferingStatus.READY.value, 0),
            "approved_count": statuses.get(OfferingStatus.APPROVED.value, 0),
            "published_count": statuses.get(OfferingStatus.PUBLISHED.value, 0),
            "draft_count": statuses.get(OfferingStatus.DRAFT.value, 0),
        }

    def conflicts(self, academic_period_id: int | None = None) -> dict:
        period = self._period(academic_period_id)
        conflicts = self._conflicts(period)
        return {
            "active_period": self._period_value(period),
            "total_conflicts": len(conflicts),
            "by_type": self._enum_counts(conflicts, "conflict_type"),
            "by_severity": self._enum_counts(conflicts, "severity"),
            "unresolved_count": sum(not item.is_resolved for item in conflicts),
            "resolved_count": sum(item.is_resolved for item in conflicts),
            "details": [
                {
                    "id": item.id,
                    "conflict_type": item.conflict_type.value,
                    "severity": item.severity.value,
                    "message": item.message,
                    "suggested_action": item.suggested_action,
                    "related_course": item.section_offering.course.name if item.section_offering else None,
                    "related_section": item.section_offering.section_code if item.section_offering else None,
                    "is_resolved": item.is_resolved,
                }
                for item in conflicts
            ],
        }

    def schedules(self, academic_period_id: int | None = None) -> dict:
        period = self._period(academic_period_id)
        schedules = self._institutional_schedules(period)
        result = []
        for schedule in schedules:
            blocks = schedule.blocks
            result.append(
                {
                    "schedule_id": schedule.id,
                    "name": schedule.name,
                    "source_type": schedule.source_type.value,
                    "status": schedule.status.value,
                    "quality_score": schedule.quality_score,
                    "total_blocks": len(blocks),
                    "period": schedule.academic_period,
                    "program": schedule.academic_program.name if schedule.academic_program else None,
                    "plan": schedule.curriculum_plan.code if schedule.curriculum_plan else None,
                    "created_at": schedule.created_at,
                    "published_at": schedule.updated_at if schedule.status == ScheduleStatus.PUBLISHED else None,
                    "blocks_by_cycle": self._counts(
                        blocks,
                        lambda block: str(block.section_offering.cycle_number)
                        if block.section_offering else "LEGACY",
                    ),
                    "blocks_by_day": self._counts(blocks, lambda block: str(block.day_of_week)),
                    "blocks_by_shift": self._counts(
                        blocks,
                        lambda block: block.section_offering.shift.value
                        if block.section_offering else self._time_shift(block),
                    ),
                }
            )
        return {"active_period": self._period_value(period), "schedules": result}

    def students(self, academic_period_id: int | None = None) -> dict:
        period = self._period(academic_period_id)
        students = self.db.query(Student).all()
        enrollments = (
            self.db.query(StudentCourseEnrollment)
            .options(joinedload(StudentCourseEnrollment.course))
            .filter(StudentCourseEnrollment.is_active.is_(True))
        )
        if period:
            enrollments = enrollments.filter(StudentCourseEnrollment.academic_period_id == period.id)
        enrollments = enrollments.all()
        enrolled_student_ids = {item.student_id for item in enrollments}
        saved = self.db.query(StudentSchedule).all()
        saved_student_ids = {item.student_id for item in saved}
        total_credits = sum(item.course.credits for item in enrollments)
        course_counts = Counter((item.course.id, item.course.code, item.course.name) for item in enrollments)
        return {
            "active_period": self._period_value(period),
            "total_students": len(students),
            "students_with_enrollments": len(enrolled_student_ids),
            "students_without_enrollments": len(students) - len(enrolled_student_ids),
            "students_with_saved_schedules": len(saved_student_ids),
            "students_without_saved_schedules": len(students) - len(saved_student_ids),
            "average_credits": round(total_credits / len(enrolled_student_ids), 2) if enrolled_student_ids else 0.0,
            "enrollments_by_cycle": self._counts(enrollments, lambda item: str(item.course.cycle)),
            "schedules_by_generation_mode": self._counts(saved, lambda item: item.generation_mode),
            "most_common_courses": [
                {"course_id": key[0], "course_code": key[1], "course_name": key[2], "students": count}
                for key, count in course_counts.most_common(10)
            ],
        }

    def change_requests(self, academic_period_id: int | None = None) -> dict:
        period = self._period(academic_period_id)
        requests = self._change_requests(period)
        resolved_durations = [
            (item.resolved_at - item.created_at).total_seconds() / 3600
            for item in requests if item.resolved_at
        ]
        teachers = defaultdict(lambda: {"teacher_id": None, "teacher_name": None, "total": 0, "pending": 0})
        for item in requests:
            summary = teachers[item.teacher_id]
            summary["teacher_id"] = item.teacher_id
            summary["teacher_name"] = item.teacher.user.full_name
            summary["total"] += 1
            if item.status == ScheduleChangeRequestStatus.PENDING:
                summary["pending"] += 1
        statuses = self._enum_counts(requests, "status")
        return {
            "active_period": self._period_value(period),
            "total": len(requests),
            "by_status": statuses,
            "by_type": self._enum_counts(requests, "request_type"),
            "pending_count": statuses.get("PENDING", 0),
            "approved_count": statuses.get("APPROVED", 0),
            "rejected_count": statuses.get("REJECTED", 0),
            "cancelled_count": statuses.get("CANCELLED", 0),
            "requests_by_teacher": list(teachers.values()),
            "average_resolution_time_hours": (
                round(sum(resolved_durations) / len(resolved_durations), 2) if resolved_durations else None
            ),
        }

    def sustainability(self) -> dict:
        greenframe = self._greenframe_value(include_content=True)
        return {
            "environmental_metrics": EnvironmentalService(self.db).get_summary(),
            "latest_greenframe_result": greenframe,
            "message": (
                "Resultado GreenFrame disponible."
                if greenframe["available"]
                else "No existe reporte GreenFrame generado; el panel ambiental continua disponible."
            ),
        }

    def _period(self, academic_period_id: int | None) -> AcademicPeriod | None:
        query = self.db.query(AcademicPeriod)
        if academic_period_id:
            period = query.filter(AcademicPeriod.id == academic_period_id).first()
            if period is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Periodo academico no encontrado",
                )
            return period
        return (
            query.filter(AcademicPeriod.status == AcademicPeriodStatus.ACTIVE, AcademicPeriod.is_active.is_(True))
            .order_by(AcademicPeriod.id.desc())
            .first()
        )

    def _offerings(self, period: AcademicPeriod | None) -> list[SectionOffering]:
        query = self.db.query(SectionOffering)
        if period:
            query = query.filter(SectionOffering.academic_period_id == period.id)
        return query.all()

    def _institutional_schedules(self, period: AcademicPeriod | None) -> list[AcademicSchedule]:
        query = (
            self.db.query(AcademicSchedule)
            .options(
                joinedload(AcademicSchedule.blocks).joinedload(ScheduleBlock.section_offering),
                joinedload(AcademicSchedule.academic_program),
                joinedload(AcademicSchedule.curriculum_plan),
            )
            .filter(AcademicSchedule.schedule_type == ScheduleType.INSTITUTIONAL)
        )
        if period:
            query = query.filter(AcademicSchedule.academic_period_id == period.id)
        return query.order_by(AcademicSchedule.created_at.desc()).all()

    def _published_blocks(self, period: AcademicPeriod | None) -> list[ScheduleBlock]:
        query = (
            self.db.query(ScheduleBlock)
            .join(AcademicSchedule, ScheduleBlock.schedule_id == AcademicSchedule.id)
            .options(
                joinedload(ScheduleBlock.section_offering).joinedload(SectionOffering.course),
                joinedload(ScheduleBlock.classroom),
            )
            .filter(
                AcademicSchedule.schedule_type == ScheduleType.INSTITUTIONAL,
                AcademicSchedule.status == ScheduleStatus.PUBLISHED,
                AcademicSchedule.is_active.is_(True),
            )
        )
        if period:
            query = query.filter(AcademicSchedule.academic_period_id == period.id)
        return query.all()

    def _conflicts(self, period: AcademicPeriod | None) -> list[OfferingConflict]:
        query = self.db.query(OfferingConflict).options(
            joinedload(OfferingConflict.section_offering).joinedload(SectionOffering.course)
        )
        if period:
            query = query.filter(OfferingConflict.academic_period_id == period.id)
        return query.order_by(OfferingConflict.is_resolved, OfferingConflict.id.desc()).all()

    def _change_requests(self, period: AcademicPeriod | None) -> list[ScheduleChangeRequest]:
        query = self.db.query(ScheduleChangeRequest).options(
            joinedload(ScheduleChangeRequest.teacher).joinedload(Teacher.user)
        )
        if period:
            query = query.filter(ScheduleChangeRequest.academic_period_id == period.id)
        return query.order_by(ScheduleChangeRequest.created_at.desc()).all()

    @staticmethod
    def _duration(block: ScheduleBlock) -> float:
        start = datetime.combine(datetime.min.date(), block.start_time)
        end = datetime.combine(datetime.min.date(), block.end_time)
        return round((end - start).total_seconds() / 3600, 2)

    @staticmethod
    def _period_value(period: AcademicPeriod | None) -> dict | None:
        return {"id": period.id, "code": period.code, "name": period.name} if period else None

    @staticmethod
    def _counts(items: list, accessor) -> dict[str, int]:
        return dict(Counter(accessor(item) for item in items))

    @classmethod
    def _enum_counts(cls, items: list, attribute: str) -> dict[str, int]:
        return cls._counts(items, lambda item: getattr(item, attribute).value)

    @staticmethod
    def _time_shift(block: ScheduleBlock) -> str:
        if block.start_time.hour < 12:
            return "MORNING"
        if block.start_time.hour < 18:
            return "AFTERNOON"
        return "NIGHT"

    def _greenframe_value(self, include_content: bool = False) -> dict:
        if not self.GREENFRAME_PATH.is_file():
            return {"available": False, "message": "No hay reporte GreenFrame generado."}
        value = {"available": True, "updated_at": datetime.fromtimestamp(self.GREENFRAME_PATH.stat().st_mtime)}
        if include_content:
            value["content"] = self.GREENFRAME_PATH.read_text(encoding="utf-8", errors="replace")
        return value
