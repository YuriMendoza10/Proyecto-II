from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.user import User, UserRole
from app.schemas.offering_schema import CoordinatorDashboardResponse
from app.services.offering_service import CoordinatorDashboardService


router = APIRouter()


@router.get("", response_model=CoordinatorDashboardResponse)
def get_coordinator_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.COORDINATOR)),
):
    return CoordinatorDashboardService(db).get_dashboard()
