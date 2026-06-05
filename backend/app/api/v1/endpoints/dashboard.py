from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.user import User, UserRole
from app.schemas.dashboard_schema import AdminDashboardSummaryResponse
from app.services.dashboard_service import DashboardService


router = APIRouter()


@router.get(
    "/admin-summary",
    response_model=AdminDashboardSummaryResponse,
    summary="Resumen institucional para dashboard admin/coordinador",
)
def get_admin_dashboard_summary(
    schedule_id: int | None = Query(default=None, gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.COORDINATOR)
    ),
):
    service = DashboardService(db)
    return service.get_admin_summary(schedule_id=schedule_id)