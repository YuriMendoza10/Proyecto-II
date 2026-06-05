from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.user import User, UserRole
from app.schemas.csp_diagnostic_schema import (
    CSPDiagnosticRequest,
    CSPDiagnosticResponse,
)
from app.services.csp_diagnostic_service import CSPDiagnosticService


router = APIRouter()


@router.get(
    "/institutional/domains",
    summary="Diagnosticar dominios del CSP institucional sin body",
)
def diagnose_institutional_domains_get(
    schedule_id: int | None = Query(default=None, gt=0),
    academic_period: str = Query(default="2026-1", min_length=4, max_length=30),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.COORDINATOR)
    ),
):
    """
    Endpoint de compatibilidad para el frontend.
    Si no se envía schedule_id, devuelve una respuesta base para evitar error.
    """

    if schedule_id is None:
        return {
            "success": True,
            "schedule_id": 0,
            "total_sections_checked": 0,
            "programmable_sections": 0,
            "problematic_sections": 0,
            "summary": [
                "No se recibió schedule_id. Primero genera o selecciona un horario académico institucional."
            ],
            "diagnostics": [],
        }

    request = CSPDiagnosticRequest(
        schedule_id=schedule_id,
        academic_period=academic_period,
    )

    diagnostic_service = CSPDiagnosticService(db)

    return diagnostic_service.diagnose_institutional_domains(request)


@router.post(
    "/institutional/domains",
    response_model=CSPDiagnosticResponse,
    summary="Diagnosticar dominios del CSP institucional",
)
def diagnose_institutional_domains_post(
    request: CSPDiagnosticRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.COORDINATOR)
    ),
):
    diagnostic_service = CSPDiagnosticService(db)
    return diagnostic_service.diagnose_institutional_domains(request)