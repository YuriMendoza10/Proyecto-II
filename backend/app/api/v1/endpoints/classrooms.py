from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.classroom import ClassroomType
from app.models.user import User, UserRole
from app.schemas.classroom_schema import (
    ClassroomCreate,
    ClassroomListResponse,
    ClassroomResponse,
    ClassroomUpdate,
)
from app.services.classroom_service import ClassroomService


router = APIRouter()


@router.get(
    "",
    response_model=ClassroomListResponse,
    summary="Listar aulas",
)
def list_classrooms(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    campus: str | None = Query(default=None),
    classroom_type: ClassroomType | None = Query(default=None),
    is_active: bool | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.COORDINATOR)
    ),
):
    classroom_service = ClassroomService(db)

    return classroom_service.list_classrooms(
        skip=skip,
        limit=limit,
        campus=campus,
        classroom_type=classroom_type,
        is_active=is_active,
    )


@router.post(
    "",
    response_model=ClassroomResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear aula",
)
def create_classroom(
    classroom_data: ClassroomCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.COORDINATOR)
    ),
):
    classroom_service = ClassroomService(db)
    return classroom_service.create_classroom(classroom_data)


@router.get(
    "/{classroom_id}",
    response_model=ClassroomResponse,
    summary="Obtener aula por ID",
)
def get_classroom(
    classroom_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.COORDINATOR)
    ),
):
    classroom_service = ClassroomService(db)
    return classroom_service.get_classroom_by_id(classroom_id)


@router.put(
    "/{classroom_id}",
    response_model=ClassroomResponse,
    summary="Actualizar aula",
)
def update_classroom(
    classroom_id: int,
    classroom_data: ClassroomUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.COORDINATOR)
    ),
):
    classroom_service = ClassroomService(db)
    return classroom_service.update_classroom(classroom_id, classroom_data)


@router.patch(
    "/{classroom_id}/deactivate",
    response_model=ClassroomResponse,
    summary="Desactivar aula",
)
def deactivate_classroom(
    classroom_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.COORDINATOR)
    ),
):
    classroom_service = ClassroomService(db)
    return classroom_service.deactivate_classroom(classroom_id)


@router.patch(
    "/{classroom_id}/activate",
    response_model=ClassroomResponse,
    summary="Activar aula",
)
def activate_classroom(
    classroom_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.COORDINATOR)
    ),
):
    classroom_service = ClassroomService(db)
    return classroom_service.activate_classroom(classroom_id)


@router.delete(
    "/{classroom_id}",
    status_code=status.HTTP_200_OK,
    summary="Eliminar aula permanentemente",
)
def delete_classroom(
    classroom_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    classroom_service = ClassroomService(db)
    return classroom_service.delete_classroom(classroom_id)