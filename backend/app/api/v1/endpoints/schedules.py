from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.schedule import ScheduleStatus, ScheduleType
from app.models.user import User, UserRole
from app.schemas.schedule_publication_schema import SchedulePublicationResponse
from app.schemas.schedule_schema import (
    AcademicScheduleCreate,
    AcademicScheduleListResponse,
    AcademicScheduleResponse,
    AcademicScheduleUpdate,
)
from app.services.schedule_publication_service import SchedulePublicationService
from app.services.schedule_service import ScheduleService


router = APIRouter()


@router.get(
    "",
    response_model=AcademicScheduleListResponse,
    summary="Listar horarios academicos",
)
def list_schedules(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    academic_period: str | None = Query(default=None),
    schedule_type: ScheduleType | None = Query(default=None),
    status_filter: ScheduleStatus | None = Query(default=None),
    is_active: bool | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            UserRole.ADMIN,
            UserRole.COORDINATOR,
            UserRole.TEACHER,
            UserRole.STUDENT,
        )
    ),
):
    if current_user.role in {UserRole.STUDENT, UserRole.TEACHER}:
        schedule_type = ScheduleType.INSTITUTIONAL
        status_filter = ScheduleStatus.PUBLISHED
        is_active = True

    schedule_service = ScheduleService(db)
    return schedule_service.list_schedules(
        skip=skip,
        limit=limit,
        academic_period=academic_period,
        schedule_type=schedule_type,
        status_filter=status_filter,
        is_active=is_active,
    )


@router.post(
    "",
    response_model=AcademicScheduleResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear horario academico",
)
def create_schedule(
    schedule_data: AcademicScheduleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.COORDINATOR)
    ),
):
    schedule_service = ScheduleService(db)
    return schedule_service.create_schedule(schedule_data)


@router.patch(
    "/{schedule_id}/publish",
    response_model=SchedulePublicationResponse,
    summary="Publicar horario institucional mediante validacion segura",
)
def publish_academic_schedule(
    schedule_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.COORDINATOR)
    ),
):
    return SchedulePublicationService(db).publish_safely(schedule_id=schedule_id, actor=current_user)


@router.get(
    "/{schedule_id}",
    response_model=AcademicScheduleResponse,
    summary="Obtener horario academico por ID",
)
def get_schedule(
    schedule_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            UserRole.ADMIN,
            UserRole.COORDINATOR,
            UserRole.TEACHER,
            UserRole.STUDENT,
        )
    ),
):
    schedule_service = ScheduleService(db)
    schedule = schedule_service.get_schedule_by_id(schedule_id)

    if (
        current_user.role in {UserRole.STUDENT, UserRole.TEACHER}
        and (
            schedule.schedule_type != ScheduleType.INSTITUTIONAL
            or schedule.status != ScheduleStatus.PUBLISHED
            or not schedule.is_active
        )
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Horario publicado no encontrado",
        )

    return schedule


@router.put(
    "/{schedule_id}",
    response_model=AcademicScheduleResponse,
    summary="Actualizar horario academico",
)
def update_schedule(
    schedule_id: int,
    schedule_data: AcademicScheduleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.COORDINATOR)
    ),
):
    schedule_service = ScheduleService(db)
    return schedule_service.update_schedule(schedule_id, schedule_data)


@router.patch(
    "/{schedule_id}/approve",
    response_model=AcademicScheduleResponse,
    summary="Aprobar horario academico",
)
def approve_schedule(
    schedule_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.COORDINATOR)
    ),
):
    schedule_service = ScheduleService(db)
    return schedule_service.approve_schedule(schedule_id)


@router.patch(
    "/{schedule_id}/archive",
    response_model=AcademicScheduleResponse,
    summary="Archivar horario academico",
)
def archive_schedule(
    schedule_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.COORDINATOR)
    ),
):
    schedule_service = ScheduleService(db)
    return schedule_service.archive_schedule(schedule_id)


@router.patch(
    "/{schedule_id}/deactivate",
    response_model=AcademicScheduleResponse,
    summary="Desactivar horario academico",
)
def deactivate_schedule(
    schedule_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.COORDINATOR)
    ),
):
    schedule_service = ScheduleService(db)
    return schedule_service.deactivate_schedule(schedule_id)


@router.patch(
    "/{schedule_id}/activate",
    response_model=AcademicScheduleResponse,
    summary="Activar horario academico",
)
def activate_schedule(
    schedule_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.COORDINATOR)
    ),
):
    schedule_service = ScheduleService(db)
    return schedule_service.activate_schedule(schedule_id)


@router.delete(
    "/{schedule_id}",
    status_code=status.HTTP_200_OK,
    summary="Eliminar horario academico",
)
def delete_schedule(
    schedule_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    schedule_service = ScheduleService(db)
    return schedule_service.delete_schedule(schedule_id)
