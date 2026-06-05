from datetime import time

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.csp.utils import (
    DEFAULT_ACADEMIC_SLOTS,
    build_time_slots_from_academic_slots,
    filter_academic_slots_by_range,
    split_weekly_hours_into_blocks,
)
from app.models.course import CourseSection
from app.models.schedule import ScheduleBlock
from app.models.teacher import TeacherAvailability
from app.repositories.classroom_repository import ClassroomRepository
from app.repositories.schedule_repository import ScheduleRepository
from app.schemas.csp_diagnostic_schema import CSPDiagnosticRequest


class CSPDiagnosticService:
    def __init__(self, db: Session):
        self.db = db
        self.schedule_repository = ScheduleRepository(db)
        self.classroom_repository = ClassroomRepository(db)

    def diagnose_institutional_domains(
        self,
        request: CSPDiagnosticRequest,
    ):
        schedule = self.schedule_repository.get_by_id(request.schedule_id)

        if not schedule:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Horario académico no encontrado",
            )

        classrooms = self.classroom_repository.get_all(
            skip=0,
            limit=1000,
            is_active=True,
        )

        teacher_availabilities = (
            self.db.query(TeacherAvailability)
            .filter(TeacherAvailability.is_available == True)
            .all()
        )

        existing_blocks = (
            self.db.query(ScheduleBlock)
            .filter(ScheduleBlock.schedule_id == request.schedule_id)
            .all()
        )

        programmed_section_ids = {
            block.section_id
            for block in existing_blocks
        }

        sections_query = (
            self.db.query(CourseSection)
            .options(
                joinedload(CourseSection.course),
                joinedload(CourseSection.teacher),
            )
            .filter(CourseSection.teacher_id.isnot(None))
        )

        sections = sections_query.all()

        academic_slots = self._resolve_academic_slots(request)

        diagnostics = []

        for section in sections:
            reasons: list[str] = []

            if (
                request.avoid_duplicate_section_blocks
                and section.id in programmed_section_ids
            ):
                reasons.append(
                    "La sección ya tiene bloques programados en este horario."
                )

            if section.course is None:
                reasons.append(
                    "La sección no tiene curso asociado."
                )

            if section.teacher_id is None:
                reasons.append(
                    "La sección no tiene docente asignado."
                )

            if not classrooms:
                reasons.append(
                    "No existen aulas activas registradas."
                )

            compatible_classrooms = [
                classroom
                for classroom in classrooms
                if classroom.capacity >= section.max_students
            ]

            if not compatible_classrooms:
                reasons.append(
                    "No hay aulas activas con capacidad suficiente para esta sección."
                )

            teacher_code = None

            if section.teacher is not None:
                teacher_code = section.teacher.teacher_code

            teacher_availability_for_section = [
                availability
                for availability in teacher_availabilities
                if availability.teacher_id == section.teacher_id
                and availability.day_of_week in request.days
            ]

            if section.teacher_id is not None and not teacher_availability_for_section:
                reasons.append(
                    "El docente no tiene disponibilidad registrada en los días solicitados."
                )

            weekly_hours = section.course.weekly_hours if section.course else None

            required_blocks: list[int] = []

            if weekly_hours is not None:
                required_blocks = split_weekly_hours_into_blocks(
                    weekly_hours=weekly_hours,
                    default_block_duration_minutes=request.default_block_duration_minutes,
                    min_block_duration_minutes=request.min_block_duration_minutes,
                )

                if not required_blocks:
                    reasons.append(
                        "Las horas semanales del curso no generan bloques válidos con la configuración actual."
                    )

            valid_domain_options = 0

            if not reasons or self._can_still_evaluate_domain(reasons):
                valid_domain_options = self._count_valid_domain_options(
                    section=section,
                    compatible_classrooms=compatible_classrooms,
                    teacher_availabilities=teacher_availability_for_section,
                    academic_slots=academic_slots,
                    request=request,
                    required_blocks=required_blocks,
                )

                if valid_domain_options == 0:
                    reasons.append(
                        "No hay combinaciones válidas de aula, día, franja y disponibilidad docente."
                    )

            is_programmable = len(reasons) == 0 and valid_domain_options > 0

            course_name = section.course.name if section.course else None

            diagnostics.append(
                {
                    "section_id": section.id,
                    "section_code": section.section_code,
                    "course_id": section.course_id,
                    "course_name": course_name,
                    "weekly_hours": weekly_hours,
                    "teacher_id": section.teacher_id,
                    "teacher_code": teacher_code,
                    "max_students": section.max_students,
                    "required_blocks": required_blocks,
                    "valid_domain_options": valid_domain_options,
                    "is_programmable": is_programmable,
                    "reasons": reasons,
                }
            )

        total_sections = len(diagnostics)
        programmable_sections = len(
            [item for item in diagnostics if item["is_programmable"]]
        )
        problematic_sections = total_sections - programmable_sections

        summary = self._build_summary(
            diagnostics=diagnostics,
            classrooms_count=len(classrooms),
            teacher_availability_count=len(teacher_availabilities),
        )

        return {
            "success": True,
            "schedule_id": request.schedule_id,
            "total_sections_checked": total_sections,
            "programmable_sections": programmable_sections,
            "problematic_sections": problematic_sections,
            "summary": summary,
            "diagnostics": diagnostics,
        }

    def _resolve_academic_slots(
        self,
        request: CSPDiagnosticRequest,
    ):
        if not request.use_academic_slots:
            return []

        if request.academic_slots is None:
            return DEFAULT_ACADEMIC_SLOTS

        return [
            (slot.start_time, slot.end_time)
            for slot in request.academic_slots
        ]

    def _can_still_evaluate_domain(
        self,
        reasons: list[str],
    ) -> bool:
        blocking_reasons = [
            "La sección no tiene curso asociado.",
            "La sección no tiene docente asignado.",
            "No existen aulas activas registradas.",
            "No hay aulas activas con capacidad suficiente para esta sección.",
            "El docente no tiene disponibilidad registrada en los días solicitados.",
            "Las horas semanales del curso no generan bloques válidos con la configuración actual.",
        ]

        return not any(reason in blocking_reasons for reason in reasons)

    def _count_valid_domain_options(
        self,
        section: CourseSection,
        compatible_classrooms,
        teacher_availabilities,
        academic_slots,
        request: CSPDiagnosticRequest,
        required_blocks: list[int],
    ) -> int:
        count = 0

        ranged_slots = filter_academic_slots_by_range(
            academic_slots=academic_slots,
            start_hour=request.start_hour,
            end_hour=request.end_hour,
        )

        for required_duration in required_blocks:
            candidate_slots = build_time_slots_from_academic_slots(
                academic_slots=ranged_slots,
                required_duration_minutes=required_duration,
                min_block_duration_minutes=request.min_block_duration_minutes,
            )

            if not candidate_slots:
                continue

            for classroom in compatible_classrooms:
                for day in request.days:
                    for slot_start, slot_end in candidate_slots:
                        if self._teacher_has_availability(
                            teacher_availabilities=teacher_availabilities,
                            day=day,
                            start_time=slot_start,
                            end_time=slot_end,
                        ):
                            count += 1

        return count

    def _teacher_has_availability(
        self,
        teacher_availabilities,
        day: int,
        start_time: time,
        end_time: time,
    ) -> bool:
        for availability in teacher_availabilities:
            if availability.day_of_week != day:
                continue

            if (
                availability.start_time <= start_time
                and availability.end_time >= end_time
            ):
                return True

        return False

    def _build_summary(
        self,
        diagnostics: list[dict],
        classrooms_count: int,
        teacher_availability_count: int,
    ) -> list[str]:
        summary: list[str] = []

        summary.append(f"Aulas activas encontradas: {classrooms_count}.")
        summary.append(
            f"Disponibilidades docentes activas encontradas: {teacher_availability_count}."
        )

        problematic = [
            item
            for item in diagnostics
            if not item["is_programmable"]
        ]

        if not problematic:
            summary.append(
                "Todas las secciones tienen dominio válido para generar horario."
            )
            return summary

        summary.append(
            f"Secciones con problemas: {len(problematic)}."
        )

        reason_counter: dict[str, int] = {}

        for item in problematic:
            for reason in item["reasons"]:
                reason_counter[reason] = reason_counter.get(reason, 0) + 1

        for reason, count in reason_counter.items():
            summary.append(f"{reason} ({count})")

        return summary