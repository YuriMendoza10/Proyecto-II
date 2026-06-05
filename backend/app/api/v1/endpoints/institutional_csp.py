from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import case, func

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.schedule import AcademicSchedule, ScheduleBlock, ScheduleStatus, ScheduleType
from app.models.offering import OfferingConflict, OfferingModality, OfferingStatus, SectionOffering
from app.models.user import User, UserRole
from app.schemas.csp_schema import (
    AvailableScheduleResponse,
    InstitutionalCSPGenerateRequest,
    InstitutionalCSPGenerateResponse,
    InstitutionalCSPPreviewResponse,
    InstitutionalCSPSaveSelectedRequest,
)
from app.schemas.offering_csp_schema import (
    OfferingCSPGenerateRequest,
    OfferingCSPGenerateResponse,
    OfferingCSPPreviewResponse,
    OfferingCSPSaveSolutionRequest,
    OfferingCSPSaveSolutionResponse,
)
from app.services.institutional_csp_service import InstitutionalCSPService
from app.services.offering_csp_service import OfferingCSPService
from app.services.traceability_service import TraceabilityService
from app.services.demo_preparation_service import DemoPreparationService


router = APIRouter()


@router.get(
    "/available-schedules",
    response_model=list[AvailableScheduleResponse],
    summary="Listar horarios institucionales disponibles para CSP",
)
def list_available_schedules(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.COORDINATOR)),
):
    status_priority = case(
        (AcademicSchedule.status == ScheduleStatus.DRAFT, 0),
        (AcademicSchedule.status == ScheduleStatus.GENERATED, 1),
        (AcademicSchedule.status == ScheduleStatus.APPROVED, 2),
        (AcademicSchedule.status == ScheduleStatus.PUBLISHED, 3),
        else_=4,
    )

    block_counts = (
        db.query(
            ScheduleBlock.schedule_id.label("schedule_id"),
            func.count(ScheduleBlock.id).label("blocks_count"),
        )
        .group_by(ScheduleBlock.schedule_id)
        .subquery()
    )

    rows = (
        db.query(AcademicSchedule, func.coalesce(block_counts.c.blocks_count, 0).label("blocks_count"))
        .outerjoin(block_counts, block_counts.c.schedule_id == AcademicSchedule.id)
        .filter(
            AcademicSchedule.schedule_type == ScheduleType.INSTITUTIONAL,
            AcademicSchedule.is_active.is_(True),
        )
        .order_by(
            status_priority,
            AcademicSchedule.updated_at.desc(),
            AcademicSchedule.id.desc(),
        )
        .limit(200)
        .all()
    )

    result = []
    for schedule, blocks_count in rows:
        period_code = schedule.academic_period_entity.code if schedule.academic_period_entity else schedule.academic_period
        program_name = schedule.academic_program.name if schedule.academic_program else None
        plan_code = schedule.curriculum_plan.code if schedule.curriculum_plan else None
        score = schedule.quality_score if schedule.quality_score is not None else schedule.score
        parts = [
            plan_code or program_name or schedule.name,
            period_code,
            schedule.status.value,
            f"{blocks_count} bloques",
        ]
        if score is not None:
            parts.append(f"Score {score:.2f}")

        result.append(
            {
                "id": schedule.id,
                "name": schedule.name,
                "status": schedule.status.value,
                "source_type": schedule.source_type.value,
                "academic_period_id": schedule.academic_period_id,
                "academic_period_code": period_code,
                "academic_program_id": schedule.academic_program_id,
                "academic_program_name": program_name,
                "curriculum_plan_id": schedule.curriculum_plan_id,
                "curriculum_plan_code": plan_code,
                "quality_score": score,
                "blocks_count": int(blocks_count or 0),
                "created_at": schedule.created_at.isoformat() if schedule.created_at else None,
                "updated_at": schedule.updated_at.isoformat() if schedule.updated_at else None,
                "label": " - ".join(str(part) for part in parts if part),
            }
        )

    return result


@router.post(
    "/preview-from-offerings",
    response_model=OfferingCSPPreviewResponse,
    summary="Previsualizar preparacion CSP desde ofertas academicas",
)
def preview_from_offerings(
    request: OfferingCSPGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.COORDINATOR)),
):
    request.cycles = DemoPreparationService(db).resolve_cycles_for_request(
        request.cycles, request.curriculum_plan_id
    )
    base_query = db.query(SectionOffering).filter(
        SectionOffering.academic_period_id == request.academic_period_id
    )
    if request.academic_program_id:
        base_query = base_query.filter(SectionOffering.academic_program_id == request.academic_program_id)
    if request.curriculum_plan_id:
        base_query = base_query.filter(SectionOffering.curriculum_plan_id == request.curriculum_plan_id)
    if request.cycles:
        base_query = base_query.filter(SectionOffering.cycle_number.in_(request.cycles))

    offerings = base_query.all()
    ready = [item for item in offerings if item.status == OfferingStatus.READY]
    approved = [item for item in offerings if item.status == OfferingStatus.APPROVED]
    eligible = approved if request.include_approved_only else approved + (ready if request.allow_ready else [])
    missing_teacher = sum(1 for item in eligible if not item.teacher_id)
    missing_classroom = sum(
        1
        for item in eligible
        if item.modality != OfferingModality.VIRTUAL and not item.classroom_id
    )
    conflict_rows = (
        db.query(OfferingConflict)
        .filter(OfferingConflict.academic_period_id == request.academic_period_id)
        .filter(OfferingConflict.is_resolved.is_(False))
        .order_by(OfferingConflict.severity.desc(), OfferingConflict.created_at.desc())
        .limit(50)
        .all()
    )
    conflicts = [
        {
            "section": row.section_offering.section_code if row.section_offering else "-",
            "course": row.section_offering.course.name if row.section_offering and row.section_offering.course else "-",
            "severity": row.severity.value,
            "message": row.message,
            "recommendation": row.suggested_action,
        }
        for row in conflict_rows
    ]
    warnings = []
    summary_by_cycle = []
    for cycle in sorted({item.cycle_number for item in offerings} | set(request.cycles or [])):
        cycle_items = [item for item in offerings if item.cycle_number == cycle]
        cycle_ready = [item for item in cycle_items if item.status == OfferingStatus.READY]
        cycle_approved = [item for item in cycle_items if item.status == OfferingStatus.APPROVED]
        cycle_eligible = cycle_approved if request.include_approved_only else cycle_approved + (cycle_ready if request.allow_ready else [])
        cycle_missing_teacher = sum(1 for item in cycle_eligible if not item.teacher_id)
        cycle_missing_classroom = sum(
            1 for item in cycle_eligible if item.modality != OfferingModality.VIRTUAL and not item.classroom_id
        )
        cycle_draft = sum(1 for item in cycle_items if item.status == OfferingStatus.DRAFT)
        summary_by_cycle.append(
            {
                "cycle": cycle,
                "total": len(cycle_items),
                "eligible": len(cycle_eligible),
                "approved": len(cycle_approved),
                "ready": len(cycle_ready),
                "draft": cycle_draft,
                "missing_teacher": cycle_missing_teacher,
                "missing_classroom": cycle_missing_classroom,
            }
        )
    not_eligible_by_cycle = [
        {
            **item,
            "reason": "Ofertas en DRAFT o con docentes/aulas faltantes.",
            "suggestion": "Use Preparar datos demo completo o complete la oferta academica.",
        }
        for item in summary_by_cycle
        if item["total"] == 0 or item["eligible"] == 0 or item["missing_teacher"] or item["missing_classroom"] or item["draft"]
    ]
    if not offerings:
        warnings.append("No hay ofertas academicas para el periodo, plan o ciclos seleccionados.")
    if offerings and not eligible:
        warnings.append("No hay ofertas READY o APPROVED para los filtros seleccionados.")
    if missing_teacher:
        warnings.append(f"{missing_teacher} oferta(s) no tienen docente asignado.")
    if missing_classroom:
        warnings.append(f"{missing_classroom} oferta(s) presenciales o hibridas no tienen aula asignada.")

    can_generate = bool(eligible) and missing_teacher == 0 and missing_classroom == 0
    return {
        "success": True,
        "message": "Previsualizacion de ofertas academicas completada.",
        "source_type": "SECTION_OFFERINGS",
        "academic_period_id": request.academic_period_id,
        "academic_program_id": request.academic_program_id,
        "curriculum_plan_id": request.curriculum_plan_id,
        "cycles": request.cycles,
        "total_offerings": len(offerings),
        "ready_offerings": len(ready),
        "approved_offerings": len(approved),
        "eligible_offerings": len(eligible),
        "missing_teacher": missing_teacher,
        "missing_classroom": missing_classroom,
        "summary_by_cycle": summary_by_cycle,
        "not_eligible_by_cycle": not_eligible_by_cycle,
        "conflicts": conflicts,
        "warnings": warnings,
        "can_generate": can_generate,
        "summary": {
            "total_offerings": len(offerings),
            "ready_offerings": len(ready),
            "approved_offerings": len(approved),
            "eligible_offerings": len(eligible),
            "can_generate": can_generate,
        },
    }


@router.post(
    "/generate-from-offerings",
    response_model=OfferingCSPGenerateResponse,
    summary="Generar soluciones CSP institucionales desde ofertas academicas",
)
def generate_from_offerings(
    request: OfferingCSPGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.COORDINATOR)),
):
    result = OfferingCSPService(db).generate(request)
    TraceabilityService(db).record_csp_generation(current_user, request, result)
    return result


@router.post(
    "/save-offering-solution",
    response_model=OfferingCSPSaveSolutionResponse,
    summary="Guardar como DRAFT una solucion CSP basada en ofertas",
)
def save_offering_solution(
    request: OfferingCSPSaveSolutionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.COORDINATOR)),
):
    result = OfferingCSPService(db).save_solution(request, current_user)
    TraceabilityService(db).record_saved_solution(current_user, result["schedule_id"])
    return result


@router.post(
    "/preview",
    response_model=InstitutionalCSPPreviewResponse,
    summary="Previsualizar soluciones CSP institucionales sin guardar",
)
def preview_institutional_schedule(
    request: InstitutionalCSPGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.COORDINATOR)
    ),
):
    csp_service = InstitutionalCSPService(db)

    return csp_service.preview_institutional_schedule(request)


@router.post(
    "/generate",
    response_model=InstitutionalCSPGenerateResponse,
    summary="Generar horario institucional con motor CSP",
)
def generate_institutional_schedule(
    request: InstitutionalCSPGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.COORDINATOR)
    ),
):
    csp_service = InstitutionalCSPService(db)

    return csp_service.generate_institutional_schedule(request)


@router.post(
    "/generate-selected",
    response_model=InstitutionalCSPGenerateResponse,
    summary="Guardar una solución CSP específica del preview",
)
def generate_selected_institutional_schedule(
    request: InstitutionalCSPSaveSelectedRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.COORDINATOR)
    ),
):
    csp_service = InstitutionalCSPService(db)

    return csp_service.generate_selected_solution(request)
