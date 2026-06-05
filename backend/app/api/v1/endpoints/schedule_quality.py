from datetime import time

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.user import User, UserRole
from app.schemas.schedule_quality_schema import ScheduleQualityReportResponse
from app.services.schedule_quality_service import ScheduleQualityService


router = APIRouter()


@router.get(
    "/{schedule_id}/report",
    response_model=ScheduleQualityReportResponse,
    summary="Reporte de calidad del horario institucional",
)
def get_schedule_quality_report(
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
    service = ScheduleQualityService(db)

    return service.get_quality_report(
        schedule_id=schedule_id,
        career_filter=career_filter,
        cycle_filter=cycle_filter,
        course_ids=course_ids,
        allowed_days=allowed_days,
        start_hour=start_hour,
        end_hour=end_hour,
    )