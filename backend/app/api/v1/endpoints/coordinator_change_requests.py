from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.schedule_change_request import ScheduleChangeRequestStatus
from app.models.user import User, UserRole
from app.schemas.teacher_portal_schema import ScheduleChangeRequestResolve, ScheduleChangeRequestResponse
from app.services.schedule_change_request_service import ScheduleChangeRequestService


router = APIRouter()


@router.get("", response_model=list[ScheduleChangeRequestResponse], summary="Listar solicitudes docentes")
def list_change_requests(
    status_filter: ScheduleChangeRequestStatus | None = Query(default=None, alias="status"),
    teacher_id: int | None = Query(default=None, gt=0),
    academic_period_id: int | None = Query(default=None, gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.COORDINATOR)),
):
    return ScheduleChangeRequestService(db).list_for_coordinator(status_filter, teacher_id, academic_period_id)


@router.patch("/{request_id}/resolve", response_model=ScheduleChangeRequestResponse, summary="Resolver solicitud docente")
def resolve_change_request(
    request_id: int,
    payload: ScheduleChangeRequestResolve,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.COORDINATOR)),
):
    return ScheduleChangeRequestService(db).resolve(request_id, payload, current_user)
