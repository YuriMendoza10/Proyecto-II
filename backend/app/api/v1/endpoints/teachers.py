from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.user import User, UserRole
from app.schemas.teacher_schema import (
    TeacherAvailabilityCreate,
    TeacherAvailabilityListResponse,
    TeacherAvailabilityResponse,
    TeacherAvailabilityUpdate,
    TeacherCreate,
    TeacherListResponse,
    TeacherResponse,
    TeacherUpdate,
)
from app.services.teacher_service import (
    TeacherAvailabilityService,
    TeacherService,
)
from app.schemas.teacher_portal_schema import (
    ScheduleChangeRequestCreate,
    ScheduleChangeRequestResponse,
    TeacherOwnAvailabilityCreate,
)
from app.services.schedule_change_request_service import ScheduleChangeRequestService
from app.services.teacher_portal_service import TeacherPortalService
from app.models.traceability import AuditAction
from app.services.audit_log_service import AuditLogService


router = APIRouter()


@router.get(
    "",
    response_model=TeacherListResponse,
    summary="Listar docentes",
)
def list_teachers(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.COORDINATOR)
    ),
):
    teacher_service = TeacherService(db)
    return teacher_service.list_teachers(skip=skip, limit=limit)


@router.post(
    "",
    response_model=TeacherResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear perfil docente",
)
def create_teacher(
    teacher_data: TeacherCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.COORDINATOR)
    ),
):
    teacher_service = TeacherService(db)
    return teacher_service.create_teacher(teacher_data)


@router.get("/me/dashboard", summary="Dashboard operativo del docente")
def get_my_teacher_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.TEACHER)),
):
    return TeacherPortalService(db).dashboard(current_user.id)


@router.get("/me/schedule", summary="Horario publicado del docente")
def get_my_teacher_schedule(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.TEACHER)),
):
    return TeacherPortalService(db).schedule(current_user.id)


@router.get("/me/sections", summary="Secciones asignadas al docente")
def get_my_teacher_sections(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.TEACHER)),
):
    return TeacherPortalService(db).sections(current_user.id)


@router.get("/me/load", summary="Carga academica publicada del docente")
def get_my_teacher_load(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.TEACHER)),
):
    return TeacherPortalService(db).load(current_user.id)


@router.get("/me/conflicts", summary="Conflictos vinculados al docente")
def get_my_teacher_conflicts(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.TEACHER)),
):
    return TeacherPortalService(db).conflicts(current_user.id)


@router.get("/me/availability", response_model=TeacherAvailabilityListResponse, summary="Listar mi disponibilidad")
def get_my_teacher_availability(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.TEACHER)),
):
    teacher = TeacherPortalService(db).teacher_for_user(current_user.id)
    return TeacherAvailabilityService(db).list_teacher_availabilities(teacher.id, current_user)


@router.post("/me/availability", response_model=TeacherAvailabilityResponse, status_code=status.HTTP_201_CREATED, summary="Crear mi disponibilidad")
def create_my_teacher_availability(
    payload: TeacherOwnAvailabilityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.TEACHER)),
):
    teacher = TeacherPortalService(db).teacher_for_user(current_user.id)
    result = TeacherAvailabilityService(db).create_availability(
        TeacherAvailabilityCreate(teacher_id=teacher.id, **payload.model_dump()), current_user
    )
    AuditLogService(db).record(
        actor=current_user, action=AuditAction.CREATE, entity_type="TEACHER_AVAILABILITY",
        entity_id=result.id, description="Disponibilidad docente creada.", new_values=payload, commit=True,
    )
    return result


@router.patch("/me/availability/{availability_id}", response_model=TeacherAvailabilityResponse, summary="Editar mi disponibilidad")
@router.put("/me/availability/{availability_id}", response_model=TeacherAvailabilityResponse, summary="Editar mi disponibilidad")
def update_my_teacher_availability(
    availability_id: int,
    payload: TeacherAvailabilityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.TEACHER)),
):
    result = TeacherAvailabilityService(db).update_availability(availability_id, payload, current_user)
    AuditLogService(db).record(
        actor=current_user, action=AuditAction.UPDATE, entity_type="TEACHER_AVAILABILITY",
        entity_id=availability_id, description="Disponibilidad docente actualizada.", new_values=payload, commit=True,
    )
    return result


@router.delete("/me/availability/{availability_id}", summary="Eliminar mi disponibilidad")
def delete_my_teacher_availability(
    availability_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.TEACHER)),
):
    result = TeacherAvailabilityService(db).delete_availability(availability_id, current_user)
    AuditLogService(db).record(
        actor=current_user, action=AuditAction.DELETE, entity_type="TEACHER_AVAILABILITY",
        entity_id=availability_id, description="Disponibilidad docente eliminada.", commit=True,
    )
    return result


@router.post("/me/change-requests", response_model=ScheduleChangeRequestResponse, status_code=status.HTTP_201_CREATED, summary="Crear solicitud de cambio propia")
def create_my_change_request(
    payload: ScheduleChangeRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.TEACHER)),
):
    return ScheduleChangeRequestService(db).create_for_teacher(current_user.id, payload, current_user)


@router.get("/me/change-requests", response_model=list[ScheduleChangeRequestResponse], summary="Listar mis solicitudes de cambio")
def list_my_change_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.TEACHER)),
):
    return ScheduleChangeRequestService(db).list_for_teacher(current_user.id)


@router.patch("/me/change-requests/{request_id}/cancel", response_model=ScheduleChangeRequestResponse, summary="Cancelar solicitud pendiente propia")
def cancel_my_change_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.TEACHER)),
):
    return ScheduleChangeRequestService(db).cancel_for_teacher(current_user.id, request_id, current_user)


@router.get(
    "/{teacher_id}",
    response_model=TeacherResponse,
    summary="Obtener docente por ID",
)
def get_teacher(
    teacher_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.TEACHER)
    ),
):
    teacher_service = TeacherService(db)
    return teacher_service.get_teacher_by_id(teacher_id, current_user)


@router.put(
    "/{teacher_id}",
    response_model=TeacherResponse,
    summary="Actualizar docente",
)
def update_teacher(
    teacher_id: int,
    teacher_data: TeacherUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.COORDINATOR)
    ),
):
    teacher_service = TeacherService(db)
    return teacher_service.update_teacher(teacher_id, teacher_data)


@router.delete(
    "/{teacher_id}",
    status_code=status.HTTP_200_OK,
    summary="Eliminar docente",
)
def delete_teacher(
    teacher_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    teacher_service = TeacherService(db)
    return teacher_service.delete_teacher(teacher_id)


@router.get(
    "/{teacher_id}/availability",
    response_model=TeacherAvailabilityListResponse,
    summary="Listar disponibilidad de un docente",
)
def list_teacher_availability(
    teacher_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.TEACHER)
    ),
):
    availability_service = TeacherAvailabilityService(db)
    return availability_service.list_teacher_availabilities(
        teacher_id,
        current_user,
    )


@router.post(
    "/availability",
    response_model=TeacherAvailabilityResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear disponibilidad docente",
)
def create_teacher_availability(
    availability_data: TeacherAvailabilityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.TEACHER)
    ),
):
    availability_service = TeacherAvailabilityService(db)
    result = availability_service.create_availability(
        availability_data,
        current_user,
    )
    AuditLogService(db).record(
        actor=current_user, action=AuditAction.CREATE, entity_type="TEACHER_AVAILABILITY",
        entity_id=result.id, description="Disponibilidad docente creada.", new_values=availability_data, commit=True,
    )
    return result


@router.put(
    "/availability/{availability_id}",
    response_model=TeacherAvailabilityResponse,
    summary="Actualizar disponibilidad docente",
)
def update_teacher_availability(
    availability_id: int,
    availability_data: TeacherAvailabilityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.TEACHER)
    ),
):
    availability_service = TeacherAvailabilityService(db)
    result = availability_service.update_availability(
        availability_id,
        availability_data,
        current_user,
    )
    AuditLogService(db).record(
        actor=current_user, action=AuditAction.UPDATE, entity_type="TEACHER_AVAILABILITY",
        entity_id=availability_id, description="Disponibilidad docente actualizada.", new_values=availability_data, commit=True,
    )
    return result


@router.delete(
    "/availability/{availability_id}",
    status_code=status.HTTP_200_OK,
    summary="Eliminar disponibilidad docente",
)
def delete_teacher_availability(
    availability_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.TEACHER)
    ),
):
    availability_service = TeacherAvailabilityService(db)
    result = availability_service.delete_availability(
        availability_id,
        current_user,
    )
    AuditLogService(db).record(
        actor=current_user, action=AuditAction.DELETE, entity_type="TEACHER_AVAILABILITY",
        entity_id=availability_id, description="Disponibilidad docente eliminada.", commit=True,
    )
    return result
