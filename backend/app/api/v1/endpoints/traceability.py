from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.schedule_change_request import ScheduleChangeRequest
from app.models.teacher import Teacher
from app.models.user import User, UserRole
from app.schemas.traceability_schema import ChangeHistoryResponse, PublicationHistoryResponse
from app.services.traceability_service import TraceabilityService


router = APIRouter()


@router.get("/schedule/{schedule_id}")
def schedule_trace(
    schedule_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.ADMIN, UserRole.COORDINATOR)),
):
    data = TraceabilityService(db).schedule_trace(schedule_id)
    return {
        "schedule_id": schedule_id,
        "publications": [PublicationHistoryResponse.model_validate(item) for item in data["publications"]],
        "changes": [ChangeHistoryResponse.model_validate(item) for item in data["changes"]],
    }


@router.get("/change-request/{request_id}", response_model=list[ChangeHistoryResponse])
def request_trace(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.TEACHER)),
):
    if current_user.role == UserRole.TEACHER:
        owned = (
            db.query(ScheduleChangeRequest)
            .join(Teacher, Teacher.id == ScheduleChangeRequest.teacher_id)
            .filter(ScheduleChangeRequest.id == request_id, Teacher.user_id == current_user.id)
            .first()
        )
        if not owned:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solicitud no asociada al docente autenticado")
    return TraceabilityService(db).request_trace(request_id)
