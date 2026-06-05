from datetime import date

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.models.academic import AcademicPeriod, AcademicPeriodStatus
from app.models.offering import OfferingConflict, OfferingConflictSeverity, SectionOffering
from app.models.schedule import AcademicSchedule, ScheduleBlock, ScheduleStatus
from app.models.schedule_change_request import ScheduleChangeRequest, ScheduleChangeRequestStatus
from app.models.teacher import Teacher, TeacherAvailability


class TeacherPortalService:
    def __init__(self, db: Session):
        self.db = db

    def dashboard(self, user_id: int):
        teacher = self._teacher(user_id)
        period = self._active_period()
        schedule = self.schedule(user_id)
        sections = self.sections(user_id)
        load = self.load(user_id)
        conflicts = self.conflicts(user_id)
        today = date.today().weekday() + 1
        today_classes = [item for item in schedule["blocks"] if item["day_of_week"] == today]
        pending_requests = self.db.query(ScheduleChangeRequest).filter(
            ScheduleChangeRequest.teacher_id == teacher.id,
            ScheduleChangeRequest.status == ScheduleChangeRequestStatus.PENDING,
        ).count()
        next_classes = sorted(schedule["blocks"], key=lambda item: (item["day_of_week"], item["start_time"]))[:5]
        return {
            "teacher_id": teacher.id,
            "teacher_name": teacher.user.full_name if teacher.user else None,
            "active_period": period.code if period else None,
            "total_courses": len({item["course_code"] for item in sections}),
            "total_sections": len(sections),
            "total_weekly_hours": load["assigned_weekly_hours"],
            "today_classes": len(today_classes),
            "pending_conflicts": len(conflicts),
            "pending_change_requests": pending_requests,
            "upcoming_classes": next_classes,
        }

    def schedule(self, user_id: int):
        teacher = self._teacher(user_id)
        period = self._active_period()
        blocks = self._published_blocks(teacher.id, period.id if period else None)
        return {
            "teacher_id": teacher.id,
            "academic_period": period.code if period else None,
            "message": "Horario publicado disponible." if blocks else "No existe horario publicado para el docente en el periodo activo.",
            "blocks": [self._block_response(block) for block in blocks],
        }

    def sections(self, user_id: int):
        teacher = self._teacher(user_id)
        period = self._active_period()
        if not period:
            return []
        offerings = (
            self.db.query(SectionOffering)
            .options(
                joinedload(SectionOffering.course),
                joinedload(SectionOffering.classroom),
                joinedload(SectionOffering.academic_period),
            )
            .filter(
                SectionOffering.teacher_id == teacher.id,
                SectionOffering.academic_period_id == period.id,
            )
            .order_by(SectionOffering.cycle_number, SectionOffering.id)
            .all()
        )
        published_blocks = self._published_blocks(teacher.id, period.id)
        count_by_offering = {}
        for block in published_blocks:
            count_by_offering[block.section_offering_id] = count_by_offering.get(block.section_offering_id, 0) + 1
        return [
            {
                "section_offering_id": item.id,
                "course_name": item.course.name if item.course else None,
                "course_code": item.course.code if item.course else None,
                "section_code": item.section_code,
                "cycle_number": item.cycle_number,
                "estimated_students": item.estimated_students,
                "classroom": item.classroom.code if item.classroom else None,
                "modality": item.modality.value,
                "shift": item.shift.value,
                "status": item.status.value,
                "academic_period": item.academic_period.code if item.academic_period else None,
                "schedule_summary": {
                    "published_blocks": count_by_offering.get(item.id, 0),
                    "has_published_schedule": count_by_offering.get(item.id, 0) > 0,
                },
            }
            for item in offerings
        ]

    def load(self, user_id: int):
        teacher = self._teacher(user_id)
        period = self._active_period()
        blocks = self._published_blocks(teacher.id, period.id if period else None)
        hours_by_day = {}
        hours_by_course = {}
        sections = set()
        courses = set()
        for block in blocks:
            hours = self._block_hours(block)
            offering = block.section_offering
            course_name = offering.course.name if offering and offering.course else "Curso"
            hours_by_day[str(block.day_of_week)] = round(hours_by_day.get(str(block.day_of_week), 0) + hours, 2)
            hours_by_course[course_name] = round(hours_by_course.get(course_name, 0) + hours, 2)
            if offering:
                sections.add(offering.id)
                courses.add(offering.course_id)
        assigned = round(sum(hours_by_day.values()), 2)
        percentage = round((assigned / teacher.max_weekly_hours * 100) if teacher.max_weekly_hours else 0, 2)
        load_status = "OVERLOADED" if assigned > teacher.max_weekly_hours else "WARNING" if percentage >= 85 else "NORMAL"
        return {
            "teacher_id": teacher.id,
            "max_weekly_hours": teacher.max_weekly_hours,
            "assigned_weekly_hours": assigned,
            "load_percentage": percentage,
            "status": load_status,
            "courses": len(courses),
            "sections": len(sections),
            "hours_by_day": hours_by_day,
            "hours_by_course": hours_by_course,
        }

    def conflicts(self, user_id: int):
        teacher = self._teacher(user_id)
        period = self._active_period()
        if not period:
            return []
        results = []
        stored = (
            self.db.query(OfferingConflict)
            .options(joinedload(OfferingConflict.section_offering).joinedload(SectionOffering.course))
            .join(SectionOffering, OfferingConflict.section_offering_id == SectionOffering.id)
            .filter(
                SectionOffering.teacher_id == teacher.id,
                OfferingConflict.academic_period_id == period.id,
                OfferingConflict.is_resolved == False,
            )
            .all()
        )
        for conflict in stored:
            results.append({
                "conflict_type": conflict.conflict_type.value,
                "severity": conflict.severity.value,
                "message": conflict.message,
                "suggested_action": conflict.suggested_action,
                "section_offering_id": conflict.section_offering_id,
                "course_name": conflict.section_offering.course.name if conflict.section_offering and conflict.section_offering.course else None,
            })
        blocks = self._published_blocks(teacher.id, period.id)
        availability = self.db.query(TeacherAvailability).filter(
            TeacherAvailability.teacher_id == teacher.id,
            TeacherAvailability.is_available == True,
        ).all()
        for block in blocks:
            if not any(
                row.day_of_week == block.day_of_week
                and row.start_time <= block.start_time
                and row.end_time >= block.end_time
                for row in availability
            ):
                results.append({
                    "conflict_type": "TEACHER_NOT_AVAILABLE",
                    "severity": "HIGH",
                    "message": "Clase publicada fuera de la disponibilidad registrada.",
                    "suggested_action": "Registrar una solicitud de cambio o actualizar disponibilidad.",
                    "section_offering_id": block.section_offering_id,
                    "course_name": block.section_offering.course.name if block.section_offering else None,
                })
        load = self.load(user_id)
        if load["status"] == "OVERLOADED":
            results.append({
                "conflict_type": "TEACHER_OVERLOAD",
                "severity": OfferingConflictSeverity.CRITICAL.value,
                "message": "La carga semanal publicada supera el maximo configurado.",
                "suggested_action": "Solicitar redistribucion de secciones.",
                "section_offering_id": None,
                "course_name": None,
            })
        return results

    def teacher_for_user(self, user_id: int):
        return self._teacher(user_id)

    def _teacher(self, user_id: int):
        teacher = self.db.query(Teacher).options(joinedload(Teacher.user)).filter(Teacher.user_id == user_id).first()
        if not teacher:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Perfil docente no encontrado.")
        return teacher

    def _active_period(self):
        return self.db.query(AcademicPeriod).filter(
            AcademicPeriod.status == AcademicPeriodStatus.ACTIVE,
            AcademicPeriod.is_active == True,
        ).order_by(AcademicPeriod.id.desc()).first()

    def _published_blocks(self, teacher_id, academic_period_id):
        if not academic_period_id:
            return []
        return (
            self.db.query(ScheduleBlock)
            .options(
                joinedload(ScheduleBlock.schedule),
                joinedload(ScheduleBlock.section_offering).joinedload(SectionOffering.course),
                joinedload(ScheduleBlock.section_offering).joinedload(SectionOffering.classroom),
            )
            .join(AcademicSchedule, AcademicSchedule.id == ScheduleBlock.schedule_id)
            .join(SectionOffering, SectionOffering.id == ScheduleBlock.section_offering_id)
            .filter(
                AcademicSchedule.academic_period_id == academic_period_id,
                AcademicSchedule.status == ScheduleStatus.PUBLISHED,
                AcademicSchedule.is_active == True,
                SectionOffering.teacher_id == teacher_id,
            )
            .order_by(ScheduleBlock.day_of_week, ScheduleBlock.start_time)
            .all()
        )

    @staticmethod
    def _block_hours(block):
        start = block.start_time.hour * 60 + block.start_time.minute
        end = block.end_time.hour * 60 + block.end_time.minute
        return (end - start) / 60

    @staticmethod
    def _block_response(block):
        offering = block.section_offering
        return {
            "schedule_id": block.schedule_id,
            "schedule_block_id": block.id,
            "section_offering_id": block.section_offering_id,
            "course_name": offering.course.name if offering and offering.course else None,
            "course_code": offering.course.code if offering and offering.course else None,
            "section_code": offering.section_code if offering else None,
            "day_of_week": block.day_of_week,
            "start_time": block.start_time,
            "end_time": block.end_time,
            "classroom": block.classroom.code if block.classroom else None,
            "modality": offering.modality.value if offering else None,
            "shift": offering.shift.value if offering else None,
            "academic_period": block.schedule.academic_period if block.schedule else None,
            "status": block.schedule.status.value if block.schedule else None,
        }
