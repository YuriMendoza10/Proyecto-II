from datetime import time

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.user import User, UserRole
from app.schemas.schedule_publication_schema import SchedulePublicationResponse
from app.services.schedule_publication_service import SchedulePublicationService


router = APIRouter()


@router.patch(
    "/{schedule_id}/publish-safe",
    response_model=SchedulePublicationResponse,
    summary="Publicar horario institucional con validación de calidad",
)
def publish_schedule_safely(
    schedule_id: int,
    career_filter: str | None = Query(default=None),
    cycle_filter: list[int] = Query(default=[]),
    course_ids: list[int] = Query(default=[]),
    allowed_days: list[int] = Query(default=[1, 2, 3, 4, 5, 6, 7]),
    start_hour: time = Query(default=time(7, 0)),
    end_hour: time = Query(default=time(22, 0)),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.COORDINATOR)
    ),
):
    service = SchedulePublicationService(db)

    return service.publish_safely(
        schedule_id=schedule_id,
        career_filter=career_filter,
        cycle_filter=cycle_filter,
        course_ids=course_ids,
        allowed_days=allowed_days,
        start_hour=start_hour,
        end_hour=end_hour,
        actor=current_user,
    )
