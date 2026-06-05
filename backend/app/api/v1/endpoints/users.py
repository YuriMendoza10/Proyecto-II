from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.user import User, UserRole
from app.schemas.user_schema import (
    UserCreate,
    UserListResponse,
    UserResponse,
    UserUpdate,
)
from app.services.user_service import UserService


router = APIRouter()


@router.get(
    "",
    response_model=UserListResponse,
    summary="Listar usuarios",
)
def list_users(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    user_service = UserService(db)
    return user_service.list_users(skip=skip, limit=limit)


@router.post(
    "",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear usuario",
)
def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    user_service = UserService(db)
    return user_service.create_user(user_data)


@router.get(
    "/{user_id}",
    response_model=UserResponse,
    summary="Obtener usuario por ID",
)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    user_service = UserService(db)
    return user_service.get_user_by_id(user_id)


@router.put(
    "/{user_id}",
    response_model=UserResponse,
    summary="Actualizar usuario",
)
def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    user_service = UserService(db)
    return user_service.update_user(user_id, user_data)


@router.patch(
    "/{user_id}/deactivate",
    response_model=UserResponse,
    summary="Desactivar usuario",
)
def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    user_service = UserService(db)
    return user_service.deactivate_user(user_id)


@router.patch(
    "/{user_id}/activate",
    response_model=UserResponse,
    summary="Activar usuario",
)
def activate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    user_service = UserService(db)
    return user_service.activate_user(user_id)