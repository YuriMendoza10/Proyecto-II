from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.auth_schema import (
    LoginRequest,
    TokenResponse,
    CurrentUserResponse,
)
from app.schemas.user_schema import PublicUserRegister
from app.services.auth_service import AuthService


router = APIRouter()


@router.post(
    "/register",
    response_model=TokenResponse,
    summary="Registrar nuevo usuario",
)
def register(
    user_data: PublicUserRegister,
    db: Session = Depends(get_db),
):
    auth_service = AuthService(db)
    return auth_service.register(user_data)


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Iniciar sesión para Swagger OAuth2",
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """
    Login compatible con el botón Authorize de Swagger.

    En Swagger:
    - username = correo del usuario
    - password = contraseña
    """
    auth_service = AuthService(db)

    return auth_service.authenticate_user(
        email=form_data.username,
        password=form_data.password,
    )


@router.post(
    "/login-json",
    response_model=TokenResponse,
    summary="Iniciar sesión con JSON",
)
def login_json(
    login_data: LoginRequest,
    db: Session = Depends(get_db),
):
    """
    Login alternativo para frontend React usando JSON.
    """
    auth_service = AuthService(db)
    return auth_service.login(login_data)


@router.get(
    "/me",
    response_model=CurrentUserResponse,
    summary="Obtener usuario autenticado",
)
def get_me(
    current_user: User = Depends(get_current_user),
):
    return {
        "user": current_user,
    }
