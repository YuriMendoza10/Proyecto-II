from datetime import time

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.models.classroom import Classroom
from app.models.course import Course, CourseSection
from app.models.offering import OfferingModality, SectionOffering
from app.models.schedule import AcademicSchedule, ScheduleBlock, ScheduleSourceType
from app.models.teacher import Teacher, TeacherAvailability


class ScheduleQualityService:
    def __init__(self, db: Session):
        self.db = db

    def get_quality_report(
        self,
        schedule_id: int,
        career_filter: str | None = None,
        cycle_filter: list[int] | None = None,
        course_ids: list[int] | None = None,
        allowed_days: list[int] | None = None,
        start_hour: time = time(7, 0),
        end_hour: time = time(22, 0),
    ):
        cycle_filter = cycle_filter or []
        course_ids = course_ids or []
        allowed_days = allowed_days or [1, 2, 3, 4, 5, 6, 7]

        schedule = self._get_schedule(schedule_id)

        if schedule.source_type == ScheduleSourceType.SECTION_OFFERINGS:
            return self._get_offering_quality_report(
                schedule=schedule,
                allowed_days=allowed_days,
                start_hour=start_hour,
                end_hour=end_hour,
            )

        sections_scope = self._get_sections_scope(
            career_filter=career_filter,
            cycle_filter=cycle_filter,
            course_ids=course_ids,
        )

        blocks = self._get_blocks(schedule_id=schedule_id)

        scoped_section_ids = {section.id for section in sections_scope}

        scoped_blocks = [
            block
            for block in blocks
            if block.section_id in scoped_section_ids
        ]

        issues = []

        issues.extend(
            self._validate_basic_block_integrity(
                blocks=scoped_blocks,
                allowed_days=allowed_days,
                start_hour=start_hour,
                end_hour=end_hour,
            )
        )

        issues.extend(
            self._validate_classroom_conflicts(blocks=scoped_blocks)
        )

        issues.extend(
            self._validate_teacher_conflicts(blocks=scoped_blocks)
        )

        issues.extend(
            self._validate_section_conflicts(blocks=scoped_blocks)
        )

        issues.extend(
            self._validate_teacher_availability(blocks=scoped_blocks)
        )

        issues.extend(
            self._validate_sections_without_blocks(
                sections=sections_scope,
                blocks=scoped_blocks,
            )
        )

        stats = self._build_stats(
            sections=sections_scope,
            blocks=scoped_blocks,
            issues=issues,
        )

        summary = self._build_summary(issues)

        return {
            "schedule_id": schedule.id,
            "schedule_name": schedule.name,
            "schedule_status": self._enum_to_str(schedule.status),

            "career_filter": career_filter,
            "cycle_filter": cycle_filter,
            "course_ids": course_ids,

            "summary": summary,
            "stats": stats,
            "issues": issues,
        }

    def _get_schedule(self, schedule_id: int):
        schedule = (
            self.db.query(AcademicSchedule)
            .filter(AcademicSchedule.id == schedule_id)
            .first()
        )

        if not schedule:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Horario académico no encontrado.",
            )

        return schedule

    def _get_sections_scope(
        self,
        career_filter: str | None,
        cycle_filter: list[int],
        course_ids: list[int],
    ):
        query = (
            self.db.query(CourseSection)
            .options(
                joinedload(CourseSection.course),
                joinedload(CourseSection.teacher)
                .joinedload(Teacher.user),
            )
            .join(CourseSection.course)
            .filter(Course.is_active == True)
        )

        if career_filter:
            query = query.filter(Course.career == career_filter)

        if cycle_filter:
            query = query.filter(Course.cycle.in_(cycle_filter))

        if course_ids:
            query = query.filter(Course.id.in_(course_ids))

        return (
            query.order_by(
                Course.career.asc(),
                Course.cycle.asc(),
                Course.code.asc(),
                CourseSection.section_code.asc(),
            )
            .all()
        )

    def _get_blocks(self, schedule_id: int):
        return (
            self.db.query(ScheduleBlock)
            .options(
                joinedload(ScheduleBlock.section)
                .joinedload(CourseSection.course),
                joinedload(ScheduleBlock.section)
                .joinedload(CourseSection.teacher)
                .joinedload(Teacher.user),
                joinedload(ScheduleBlock.classroom),
            )
            .filter(ScheduleBlock.schedule_id == schedule_id)
            .all()
        )

    def _get_offering_quality_report(self, schedule, allowed_days, start_hour, end_hour):
        blocks = (
            self.db.query(ScheduleBlock)
            .options(
                joinedload(ScheduleBlock.section_offering).joinedload(SectionOffering.course),
                joinedload(ScheduleBlock.section_offering).joinedload(SectionOffering.teacher).joinedload(Teacher.user),
                joinedload(ScheduleBlock.section_offering).joinedload(SectionOffering.requirements),
                joinedload(ScheduleBlock.classroom),
            )
            .filter(ScheduleBlock.schedule_id == schedule.id)
            .all()
        )
        issues = []
        availability_rows = self.db.query(TeacherAvailability).filter(TeacherAvailability.is_available == True).all()
        availability = {}
        for row in availability_rows:
            availability.setdefault(row.teacher_id, []).append(row)
        for block in blocks:
            offering = block.section_offering
            context = self._block_context(block)
            if not offering:
                issues.append(self._issue("BLOCK_WITHOUT_OFFERING", "CRITICAL", "Bloque sin oferta", block, context))
                continue
            if not offering.teacher or not offering.teacher.user or not offering.teacher.user.is_active:
                issues.append(self._issue("BLOCK_WITHOUT_TEACHER", "CRITICAL", "Bloque sin docente activo", block, context))
            requires_room = offering.modality == OfferingModality.PRESENTIAL or (
                offering.modality == OfferingModality.HYBRID
                and any(item.requires_lab or item.required_classroom_type for item in offering.requirements)
            )
            if requires_room and not block.classroom:
                issues.append(self._issue("BLOCK_WITHOUT_CLASSROOM", "CRITICAL", "Bloque sin aula requerida", block, context))
            if block.classroom and (not block.classroom.is_active or block.classroom.capacity < offering.estimated_students):
                issues.append(self._issue("INVALID_CLASSROOM", "CRITICAL", "Aula inactiva o sin capacidad", block, context))
            if block.day_of_week not in allowed_days or block.start_time < start_hour or block.end_time > end_hour:
                issues.append(self._issue("BLOCK_OUTSIDE_ALLOWED_TIME", "WARNING", "Bloque fuera del rango permitido", block, context))
            teacher_slots = availability.get(offering.teacher_id, [])
            if offering.teacher_id and not any(
                row.day_of_week == block.day_of_week
                and row.start_time <= block.start_time
                and row.end_time >= block.end_time
                for row in teacher_slots
            ):
                issues.append(self._issue("TEACHER_UNAVAILABLE_FOR_BLOCK", "CRITICAL", "Docente fuera de disponibilidad", block, context))
        for index, first in enumerate(blocks):
            for second in blocks[index + 1:]:
                if first.day_of_week != second.day_of_week or not self._overlaps(
                    first.start_time, first.end_time, second.start_time, second.end_time
                ):
                    continue
                first_offering = first.section_offering
                second_offering = second.section_offering
                if first.classroom_id and first.classroom_id == second.classroom_id:
                    issues.append(self._issue("CLASSROOM_TIME_CONFLICT", "CRITICAL", "Cruce de aula", first, self._block_context(first)))
                if first_offering and second_offering and first_offering.teacher_id == second_offering.teacher_id:
                    issues.append(self._issue("TEACHER_TIME_CONFLICT", "CRITICAL", "Cruce de docente", first, self._block_context(first)))
                if first_offering and second_offering and first_offering.cycle_number == second_offering.cycle_number:
                    issues.append(self._issue("CYCLE_TIME_CONFLICT", "CRITICAL", "Cruce de cursos del mismo ciclo", first, self._block_context(first)))
        summary = self._build_summary(issues)
        return {
            "schedule_id": schedule.id,
            "schedule_name": schedule.name,
            "schedule_status": self._enum_to_str(schedule.status),
            "career_filter": None,
            "cycle_filter": [],
            "course_ids": [],
            "summary": summary,
            "stats": {"total_blocks": len(blocks), "total_sections_scope": len({block.section_offering_id for block in blocks})},
            "issues": issues,
        }

    @staticmethod
    def _issue(code, severity, title, block, context):
        return {
            "code": code,
            "severity": severity,
            "title": title,
            "detail": title,
            "entity_type": "schedule_block",
            "entity_id": block.id,
            "context": context,
        }

    def _validate_basic_block_integrity(
        self,
        blocks: list[ScheduleBlock],
        allowed_days: list[int],
        start_hour: time,
        end_hour: time,
    ):
        issues = []

        for block in blocks:
            section = block.section
            course = section.course if section else None
            teacher = section.teacher if section else None
            teacher_user = teacher.user if teacher else None
            classroom = block.classroom

            context = self._block_context(block)

            if not classroom:
                issues.append(
                    {
                        "code": "BLOCK_WITHOUT_CLASSROOM",
                        "severity": "CRITICAL",
                        "title": "Bloque sin aula asignada",
                        "detail": (
                            f"El bloque {block.id} no tiene aula asignada."
                        ),
                        "entity_type": "schedule_block",
                        "entity_id": block.id,
                        "context": context,
                    }
                )

            if not teacher:
                issues.append(
                    {
                        "code": "BLOCK_WITHOUT_TEACHER",
                        "severity": "CRITICAL",
                        "title": "Bloque sin docente",
                        "detail": (
                            f"El bloque {block.id} pertenece a una sección sin docente asignado."
                        ),
                        "entity_type": "schedule_block",
                        "entity_id": block.id,
                        "context": context,
                    }
                )

            if block.day_of_week not in allowed_days:
                issues.append(
                    {
                        "code": "BLOCK_INVALID_DAY",
                        "severity": "WARNING",
                        "title": "Bloque en día no permitido",
                        "detail": (
                            f"El bloque {block.id} está programado en el día {block.day_of_week}, "
                            "fuera de los días permitidos para esta validación."
                        ),
                        "entity_type": "schedule_block",
                        "entity_id": block.id,
                        "context": context,
                    }
                )

            if block.start_time < start_hour or block.end_time > end_hour:
                issues.append(
                    {
                        "code": "BLOCK_OUTSIDE_ALLOWED_TIME",
                        "severity": "WARNING",
                        "title": "Bloque fuera del rango horario permitido",
                        "detail": (
                            f"El bloque {block.id} está fuera del rango permitido "
                            f"{start_hour} - {end_hour}."
                        ),
                        "entity_type": "schedule_block",
                        "entity_id": block.id,
                        "context": context,
                    }
                )

            if classroom and not classroom.is_active:
                issues.append(
                    {
                        "code": "INACTIVE_CLASSROOM_USED",
                        "severity": "CRITICAL",
                        "title": "Aula inactiva utilizada",
                        "detail": (
                            f"El bloque {block.id} usa el aula {classroom.code}, "
                            "pero el aula está inactiva."
                        ),
                        "entity_type": "schedule_block",
                        "entity_id": block.id,
                        "related_entity_type": "classroom",
                        "related_entity_id": classroom.id,
                        "context": context,
                    }
                )

        return issues

    def _validate_classroom_conflicts(self, blocks: list[ScheduleBlock]):
        issues = []
        grouped = {}

        for block in blocks:
            if not block.classroom_id:
                continue

            key = (block.classroom_id, block.day_of_week)
            grouped.setdefault(key, []).append(block)

        for (classroom_id, day), day_blocks in grouped.items():
            sorted_blocks = sorted(day_blocks, key=lambda item: item.start_time)

            for index in range(len(sorted_blocks)):
                for other_index in range(index + 1, len(sorted_blocks)):
                    first = sorted_blocks[index]
                    second = sorted_blocks[other_index]

                    if second.start_time >= first.end_time:
                        break

                    if self._overlaps(
                        first.start_time,
                        first.end_time,
                        second.start_time,
                        second.end_time,
                    ):
                        classroom = first.classroom

                        issues.append(
                            {
                                "code": "CLASSROOM_TIME_CONFLICT",
                                "severity": "CRITICAL",
                                "title": "Cruce de aula",
                                "detail": (
                                    f"El aula {classroom.code if classroom else classroom_id} "
                                    f"tiene dos bloques cruzados el día {day}."
                                ),
                                "entity_type": "schedule_block",
                                "entity_id": first.id,
                                "related_entity_type": "schedule_block",
                                "related_entity_id": second.id,
                                "context": {
                                    "classroom_id": classroom_id,
                                    "day_of_week": day,
                                    "first_block": self._block_context(first),
                                    "second_block": self._block_context(second),
                                },
                            }
                        )

        return issues

    def _validate_teacher_conflicts(self, blocks: list[ScheduleBlock]):
        issues = []
        grouped = {}

        for block in blocks:
            teacher_id = None

            if block.section and block.section.teacher_id:
                teacher_id = block.section.teacher_id

            if not teacher_id:
                continue

            key = (teacher_id, block.day_of_week)
            grouped.setdefault(key, []).append(block)

        for (teacher_id, day), day_blocks in grouped.items():
            sorted_blocks = sorted(day_blocks, key=lambda item: item.start_time)

            for index in range(len(sorted_blocks)):
                for other_index in range(index + 1, len(sorted_blocks)):
                    first = sorted_blocks[index]
                    second = sorted_blocks[other_index]

                    if second.start_time >= first.end_time:
                        break

                    if self._overlaps(
                        first.start_time,
                        first.end_time,
                        second.start_time,
                        second.end_time,
                    ):
                        teacher = first.section.teacher if first.section else None
                        teacher_user = teacher.user if teacher else None

                        issues.append(
                            {
                                "code": "TEACHER_TIME_CONFLICT",
                                "severity": "CRITICAL",
                                "title": "Cruce de docente",
                                "detail": (
                                    f"El docente {teacher_user.full_name if teacher_user else teacher_id} "
                                    f"tiene dos bloques cruzados el día {day}."
                                ),
                                "entity_type": "schedule_block",
                                "entity_id": first.id,
                                "related_entity_type": "schedule_block",
                                "related_entity_id": second.id,
                                "context": {
                                    "teacher_id": teacher_id,
                                    "day_of_week": day,
                                    "first_block": self._block_context(first),
                                    "second_block": self._block_context(second),
                                },
                            }
                        )

        return issues

    def _validate_section_conflicts(self, blocks: list[ScheduleBlock]):
        issues = []
        grouped = {}

        for block in blocks:
            key = (block.section_id, block.day_of_week)
            grouped.setdefault(key, []).append(block)

        for (section_id, day), day_blocks in grouped.items():
            sorted_blocks = sorted(day_blocks, key=lambda item: item.start_time)

            for index in range(len(sorted_blocks)):
                for other_index in range(index + 1, len(sorted_blocks)):
                    first = sorted_blocks[index]
                    second = sorted_blocks[other_index]

                    if second.start_time >= first.end_time:
                        break

                    if self._overlaps(
                        first.start_time,
                        first.end_time,
                        second.start_time,
                        second.end_time,
                    ):
                        issues.append(
                            {
                                "code": "SECTION_TIME_CONFLICT",
                                "severity": "CRITICAL",
                                "title": "Cruce de sección",
                                "detail": (
                                    f"La sección {section_id} tiene dos bloques cruzados el día {day}."
                                ),
                                "entity_type": "schedule_block",
                                "entity_id": first.id,
                                "related_entity_type": "schedule_block",
                                "related_entity_id": second.id,
                                "context": {
                                    "section_id": section_id,
                                    "day_of_week": day,
                                    "first_block": self._block_context(first),
                                    "second_block": self._block_context(second),
                                },
                            }
                        )

        return issues

    def _validate_teacher_availability(self, blocks: list[ScheduleBlock]):
        issues = []

        teacher_ids = {
            block.section.teacher_id
            for block in blocks
            if block.section and block.section.teacher_id
        }

        availability_rows = (
            self.db.query(TeacherAvailability)
            .filter(TeacherAvailability.teacher_id.in_(teacher_ids))
            .filter(TeacherAvailability.is_available == True)
            .all()
            if teacher_ids
            else []
        )

        availability_map = {}

        for availability in availability_rows:
            availability_map.setdefault(
                availability.teacher_id,
                [],
            ).append(availability)

        for block in blocks:
            if not block.section or not block.section.teacher_id:
                continue

            teacher_id = block.section.teacher_id
            availabilities = availability_map.get(teacher_id, [])

            is_valid = False

            for availability in availabilities:
                if availability.day_of_week != block.day_of_week:
                    continue

                if (
                    availability.start_time <= block.start_time
                    and availability.end_time >= block.end_time
                ):
                    is_valid = True
                    break

            if not is_valid:
                teacher = block.section.teacher
                teacher_user = teacher.user if teacher else None

                issues.append(
                    {
                        "code": "TEACHER_UNAVAILABLE_FOR_BLOCK",
                        "severity": "CRITICAL",
                        "title": "Docente fuera de disponibilidad",
                        "detail": (
                            f"El docente {teacher_user.full_name if teacher_user else teacher_id} "
                            f"tiene un bloque asignado fuera de su disponibilidad registrada."
                        ),
                        "entity_type": "schedule_block",
                        "entity_id": block.id,
                        "related_entity_type": "teacher",
                        "related_entity_id": teacher_id,
                        "context": self._block_context(block),
                    }
                )

        return issues

    def _validate_sections_without_blocks(
        self,
        sections: list[CourseSection],
        blocks: list[ScheduleBlock],
    ):
        issues = []
        scheduled_section_ids = {block.section_id for block in blocks}

        for section in sections:
            if section.id in scheduled_section_ids:
                continue

            course = section.course

            issues.append(
                {
                    "code": "SECTION_WITHOUT_BLOCKS",
                    "severity": "WARNING",
                    "title": "Sección sin bloques generados",
                    "detail": (
                        f"La sección {section.section_code} del curso "
                        f"{course.code if course else section.course_id} no tiene bloques generados."
                    ),
                    "entity_type": "course_section",
                    "entity_id": section.id,
                    "context": {
                        "section_id": section.id,
                        "section_code": section.section_code,
                        "course_id": section.course_id,
                        "course_code": course.code if course else None,
                        "course_name": course.name if course else None,
                        "cycle": course.cycle if course else None,
                    },
                }
            )

        return issues

    def _build_stats(
        self,
        sections: list[CourseSection],
        blocks: list[ScheduleBlock],
        issues: list[dict],
    ):
        issue_count_by_code = {}

        for issue in issues:
            code = issue["code"]
            issue_count_by_code[code] = issue_count_by_code.get(code, 0) + 1

        scheduled_section_ids = {block.section_id for block in blocks}

        return {
            "total_blocks": len(blocks),
            "total_sections_scope": len(sections),
            "scheduled_sections": len(scheduled_section_ids),
            "sections_without_blocks": issue_count_by_code.get("SECTION_WITHOUT_BLOCKS", 0),

            "classroom_conflicts": issue_count_by_code.get("CLASSROOM_TIME_CONFLICT", 0),
            "teacher_conflicts": issue_count_by_code.get("TEACHER_TIME_CONFLICT", 0),
            "section_conflicts": issue_count_by_code.get("SECTION_TIME_CONFLICT", 0),

            "blocks_without_teacher": issue_count_by_code.get("BLOCK_WITHOUT_TEACHER", 0),
            "blocks_without_classroom": issue_count_by_code.get("BLOCK_WITHOUT_CLASSROOM", 0),
            "blocks_outside_allowed_time": issue_count_by_code.get("BLOCK_OUTSIDE_ALLOWED_TIME", 0),
            "blocks_invalid_day": issue_count_by_code.get("BLOCK_INVALID_DAY", 0),
            "blocks_with_inactive_classroom": issue_count_by_code.get("INACTIVE_CLASSROOM_USED", 0),
            "blocks_without_teacher_availability": issue_count_by_code.get("TEACHER_UNAVAILABLE_FOR_BLOCK", 0),
        }

    def _build_summary(self, issues: list[dict]):
        critical_count = len(
            [
                issue
                for issue in issues
                if issue["severity"] == "CRITICAL"
            ]
        )

        warning_count = len(
            [
                issue
                for issue in issues
                if issue["severity"] == "WARNING"
            ]
        )

        info_count = len(
            [
                issue
                for issue in issues
                if issue["severity"] == "INFO"
            ]
        )

        if critical_count > 0:
            quality_status = "CRITICAL"
        elif warning_count > 0:
            quality_status = "WARNING"
        else:
            quality_status = "OK"

        return {
            "total_issues": len(issues),
            "critical_issues": critical_count,
            "warning_issues": warning_count,
            "info_issues": info_count,
            "publishable": critical_count == 0,
            "quality_status": quality_status,
        }

    def _block_context(self, block: ScheduleBlock):
        section = block.section
        offering = block.section_offering
        course = section.course if section else offering.course if offering else None
        teacher = section.teacher if section else offering.teacher if offering else None
        teacher_user = teacher.user if teacher else None
        classroom = block.classroom

        return {
            "block_id": block.id,
            "schedule_id": block.schedule_id,

            "section_id": block.section_id,
            "section_offering_id": block.section_offering_id,
            "section_code": section.section_code if section else offering.section_code if offering else None,

            "course_id": course.id if course else None,
            "course_code": course.code if course else None,
            "course_name": course.name if course else None,
            "cycle": course.cycle if course else None,

            "teacher_id": teacher.id if teacher else None,
            "teacher_code": teacher.teacher_code if teacher else None,
            "teacher_name": teacher_user.full_name if teacher_user else None,

            "classroom_id": classroom.id if classroom else None,
            "classroom_code": classroom.code if classroom else None,

            "day_of_week": block.day_of_week,
            "start_time": str(block.start_time),
            "end_time": str(block.end_time),
        }

    def _overlaps(
        self,
        first_start: time,
        first_end: time,
        second_start: time,
        second_end: time,
    ):
        return first_start < second_end and second_start < first_end

    def _enum_to_str(self, value):
        if value is None:
            return None

        if hasattr(value, "value"):
            return value.value

        return str(value)
