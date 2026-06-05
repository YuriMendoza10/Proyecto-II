from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.csp.offering_engine import OfferingCSPEngine
from app.models.academic import AcademicPeriod, AcademicProgram
from app.models.classroom import ClassroomType
from app.models.offering import (
    OfferingConflict,
    OfferingConflictSeverity,
    OfferingConflictType,
    OfferingModality,
    OfferingStatus,
    SectionOffering,
)
from app.models.schedule import (
    AcademicSchedule,
    ScheduleBlock,
    ScheduleSourceType,
    ScheduleStatus,
    ScheduleType,
)
from app.models.teacher import Teacher, TeacherAvailability


class OfferingCSPService:
    def __init__(self, db: Session):
        self.db = db

    def generate(self, request):
        request.cycles = self._normalize_cycles(request)
        offerings = self._eligible_offerings(request)
        if not offerings:
            existing = (
                self.db.query(SectionOffering)
                .filter(SectionOffering.academic_period_id == request.academic_period_id)
                .count()
            )
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No existen ofertas READY o APPROVED aptas; DRAFT, CLOSED y PUBLISHED no generan horarios.",
                )
            return {
                "success": True,
                "message": "No existen ofertas para el periodo; use el flujo vigente basado en course_sections.",
                "source_type": "COURSE_SECTIONS",
                "fallback_to_course_sections": True,
                "academic_period_id": request.academic_period_id,
                "offering_count": 0,
                "solutions": [],
                "conflicts": [],
                "warnings": ["El endpoint /institutional-csp/preview conserva el modo anterior."],
            }
        conflicts = self._validate_for_generation(offerings, request)
        if conflicts:
            self.db.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "message": "Las ofertas seleccionadas tienen conflictos criticos.",
                    "conflicts": conflicts,
                },
            )
        availability = {}
        for row in (
            self.db.query(TeacherAvailability)
            .filter(TeacherAvailability.teacher_id.in_([item.teacher_id for item in offerings]))
            .filter(TeacherAvailability.is_available == True)
            .all()
        ):
            availability.setdefault(row.teacher_id, []).append(row)
        solutions = OfferingCSPEngine(offerings, availability, request).solve()
        if not solutions:
            message = "No existe una combinacion de franjas que satisfaga las restricciones duras."
            self._persist_conflict(
                offerings[0], OfferingConflictType.UNREADY_OFFERING, message,
                "Revise disponibilidad docente, turnos o separacion por ciclos.",
            )
            self.db.commit()
            raise HTTPException(status_code=400, detail=message)
        serialized = [self._serialize_solution(index, solution) for index, solution in enumerate(solutions)]
        best = serialized[0]
        return {
            "success": True,
            "message": "Soluciones CSP generadas desde oferta academica.",
            "source_type": "SECTION_OFFERINGS",
            "fallback_to_course_sections": False,
            "academic_period_id": request.academic_period_id,
            "offering_count": len(offerings),
            "solutions": serialized,
            "conflicts": [],
            "warnings": best["soft_warnings"],
            "quality_score": best["score_total"],
            "score_breakdown": best["score_breakdown"],
            "teacher_load_summary": best["teacher_load_summary"],
            "classroom_usage": best["classroom_usage"],
            "cycle_distribution": best["cycle_distribution"],
        }

    def save_solution(self, request, current_user):
        request.cycles = self._normalize_cycles(request)
        result = self.generate(request)
        if result.get("source_type") != "SECTION_OFFERINGS":
            raise HTTPException(status_code=400, detail="No hay soluciones de ofertas para guardar.")
        if request.solution_index >= len(result["solutions"]):
            raise HTTPException(status_code=400, detail="Indice de solucion no valido.")
        selected = result["solutions"][request.solution_index]
        period = self.db.query(AcademicPeriod).filter(AcademicPeriod.id == request.academic_period_id).first()
        program = (
            self.db.query(AcademicProgram)
            .filter(AcademicProgram.id == request.academic_program_id)
            .first()
            if request.academic_program_id else None
        )
        schedule = AcademicSchedule(
            name=request.schedule_name,
            academic_period=period.code if period else str(request.academic_period_id),
            academic_period_id=request.academic_period_id,
            academic_program_id=request.academic_program_id,
            campus_id=program.campus_id if program else None,
            faculty_id=program.faculty_id if program else None,
            curriculum_plan_id=request.curriculum_plan_id,
            schedule_type=ScheduleType.INSTITUTIONAL,
            source_type=ScheduleSourceType.SECTION_OFFERINGS,
            status=ScheduleStatus.DRAFT,
            generated_by_user_id=current_user.id,
            generation_strategy=request.strategy,
            score=selected["score_total"],
            quality_score=selected["score_total"],
            is_active=True,
        )
        self.db.add(schedule)
        self.db.flush()
        for block in selected["blocks"]:
            self.db.add(
                ScheduleBlock(
                    schedule_id=schedule.id,
                    section_id=None,
                    section_offering_id=block["section_offering_id"],
                    section_requirement_id=block["section_requirement_id"],
                    classroom_id=block["classroom_id"],
                    day_of_week=block["day_of_week"],
                    start_time=block["start_time"],
                    end_time=block["end_time"],
                    quality_score=selected["score_total"],
                )
            )
        self.db.commit()
        return {
            "success": True,
            "message": "Solucion guardada como horario DRAFT; use publicacion segura para exponerla.",
            "schedule_id": schedule.id,
            "schedule_status": ScheduleStatus.DRAFT.value,
            "source_type": ScheduleSourceType.SECTION_OFFERINGS.value,
            "quality_score": selected["score_total"],
            "total_blocks": len(selected["blocks"]),
            "blocks": selected["blocks"],
        }

    def _eligible_offerings(self, request):
        statuses = [OfferingStatus.APPROVED]
        if request.allow_ready and not request.include_approved_only:
            statuses.append(OfferingStatus.READY)
        query = (
            self.db.query(SectionOffering)
            .options(
                joinedload(SectionOffering.course),
                joinedload(SectionOffering.teacher).joinedload(Teacher.user),
                joinedload(SectionOffering.classroom),
                joinedload(SectionOffering.requirements),
            )
            .filter(
                SectionOffering.academic_period_id == request.academic_period_id,
                SectionOffering.status.in_(statuses),
            )
        )
        if request.academic_program_id:
            query = query.filter(SectionOffering.academic_program_id == request.academic_program_id)
        if request.curriculum_plan_id:
            query = query.filter(SectionOffering.curriculum_plan_id == request.curriculum_plan_id)
        if request.cycles:
            query = query.filter(SectionOffering.cycle_number.in_(request.cycles))
        return query.order_by(SectionOffering.cycle_number, SectionOffering.id).all()

    def _normalize_cycles(self, request):
        if request.cycles in (None, "", [], "all", "ALL"):
            query = self.db.query(SectionOffering.cycle_number).filter(
                SectionOffering.academic_period_id == request.academic_period_id
            )
            if request.academic_program_id:
                query = query.filter(SectionOffering.academic_program_id == request.academic_program_id)
            if request.curriculum_plan_id:
                query = query.filter(SectionOffering.curriculum_plan_id == request.curriculum_plan_id)
            return [
                row[0]
                for row in query.distinct().order_by(SectionOffering.cycle_number).all()
            ]
        if isinstance(request.cycles, str):
            return [int(item.strip()) for item in request.cycles.split(",") if item.strip().isdigit()]
        return sorted({int(cycle) for cycle in request.cycles if int(cycle) > 0})

    def _validate_for_generation(self, offerings, request):
        conflicts = []
        teacher_load = {}
        for offering in offerings:
            if offering.teacher_id:
                teacher_load[offering.teacher_id] = teacher_load.get(offering.teacher_id, 0) + int(
                    offering.course.weekly_hours or 0
                )
        for offering in offerings:
            def fail(kind, message, action):
                conflicts.append(message)
                self._persist_conflict(offering, kind, message, action)

            if offering.status not in {OfferingStatus.READY, OfferingStatus.APPROVED}:
                fail(OfferingConflictType.UNREADY_OFFERING, f"{offering.display_name} no esta lista para CSP.", "Cambiar a READY o APPROVED.")
            if not offering.teacher or not offering.teacher.user or not offering.teacher.user.is_active:
                fail(OfferingConflictType.MISSING_TEACHER, f"{offering.display_name} no tiene docente activo.", "Asignar docente activo.")
            elif teacher_load.get(offering.teacher_id, 0) > offering.teacher.max_weekly_hours:
                fail(
                    OfferingConflictType.TEACHER_OVERLOAD,
                    f"El docente de {offering.display_name} supera su carga semanal maxima en la solucion.",
                    "Redistribuir secciones entre docentes.",
                )
            classroom_required = offering.modality == OfferingModality.PRESENTIAL or (
                offering.modality == OfferingModality.HYBRID
                and any(req.requires_lab or req.required_classroom_type for req in offering.requirements)
            )
            if classroom_required and not offering.classroom:
                fail(OfferingConflictType.MISSING_CLASSROOM, f"{offering.display_name} requiere aula fisica.", "Asignar un aula activa.")
            if offering.classroom:
                if not offering.classroom.is_active:
                    fail(OfferingConflictType.MISSING_CLASSROOM, f"El aula de {offering.display_name} esta inactiva.", "Asignar aula activa.")
                if request.respect_classroom_capacity and offering.classroom.capacity < offering.estimated_students:
                    fail(OfferingConflictType.CLASSROOM_CAPACITY, f"El aula de {offering.display_name} no tiene capacidad suficiente.", "Asignar un aula de mayor capacidad.")
                if request.respect_classroom_requirements:
                    for requirement in offering.requirements:
                        required_type = ClassroomType.LAB if requirement.requires_lab else requirement.required_classroom_type
                        if required_type and offering.classroom.classroom_type != required_type:
                            fail(OfferingConflictType.CLASSROOM_TYPE_MISMATCH, f"El aula de {offering.display_name} no cumple el tipo requerido.", "Asignar aula compatible.")
                        if offering.classroom.capacity < requirement.min_capacity:
                            fail(OfferingConflictType.CLASSROOM_CAPACITY, f"El aula de {offering.display_name} no cubre la capacidad tecnica requerida.", "Asignar aula de mayor capacidad.")
            if offering.capacity < offering.estimated_students:
                fail(OfferingConflictType.UNREADY_OFFERING, f"{offering.display_name} tiene cupos menores que la demanda estimada.", "Aumentar cupos o dividir la seccion.")
            if not (1 <= offering.cycle_number <= 10) or offering.capacity <= 0:
                fail(OfferingConflictType.UNREADY_OFFERING, f"{offering.display_name} contiene ciclo o cupos invalidos.", "Corregir datos de oferta.")
        return conflicts

    def _persist_conflict(self, offering, conflict_type, message, suggested_action):
        exists = (
            self.db.query(OfferingConflict)
            .filter(
                OfferingConflict.section_offering_id == offering.id,
                OfferingConflict.conflict_type == conflict_type,
                OfferingConflict.message == message,
                OfferingConflict.is_resolved == False,
            )
            .first()
        )
        if not exists:
            self.db.add(
                OfferingConflict(
                    section_offering_id=offering.id,
                    academic_period_id=offering.academic_period_id,
                    conflict_type=conflict_type,
                    severity=OfferingConflictSeverity.CRITICAL,
                    message=message,
                    suggested_action=suggested_action,
                    is_resolved=False,
                )
            )

    @staticmethod
    def _serialize_solution(index, solution):
        blocks = []
        for assignment in solution["assignments"]:
            offering = assignment.offering
            blocks.append(
                {
                    "section_offering_id": offering.id,
                    "section_requirement_id": assignment.requirement_id,
                    "course_id": offering.course_id,
                    "course_name": offering.course.name,
                    "section_code": offering.section_code,
                    "cycle_number": offering.cycle_number,
                    "teacher_id": offering.teacher_id,
                    "teacher_name": offering.teacher.user.full_name if offering.teacher and offering.teacher.user else None,
                    "classroom_id": assignment.classroom.id if assignment.classroom else None,
                    "classroom_code": assignment.classroom.code if assignment.classroom else None,
                    "day_of_week": assignment.day_of_week,
                    "start_time": assignment.start_time,
                    "end_time": assignment.end_time,
                    "modality": offering.modality.value,
                }
            )
        return {
            "solution_index": index,
            "score_total": solution["score_total"],
            "score_breakdown": solution["score_breakdown"],
            "hard_conflicts": solution["hard_conflicts"],
            "soft_warnings": solution["soft_warnings"],
            "classroom_usage": solution["classroom_usage"],
            "teacher_load_summary": solution["teacher_load_summary"],
            "cycle_distribution": solution["cycle_distribution"],
            "blocks": blocks,
        }
