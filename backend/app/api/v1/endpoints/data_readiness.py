from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.user import User, UserRole
from app.schemas.data_readiness_schema import DataReadinessResponse
from app.services.data_readiness_service import DataReadinessService


router = APIRouter()


@router.get(
    "/report",
    response_model=DataReadinessResponse,
    summary="Reporte de preparación de datos para generación de horarios",
)
def get_data_readiness_report(
    career_filter: str | None = Query(default=None),
    academic_period: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.COORDINATOR)
    ),
):
    service = DataReadinessService(db)

    return service.get_readiness_report(
        career_filter=career_filter,
        academic_period=academic_period,
    )