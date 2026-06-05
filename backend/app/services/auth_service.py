from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import verify_password, create_access_token
from app.models.user import UserRole
from app.repositories.user_repository import UserRepository
from app.schemas.user_schema import PublicUserRegister, UserCreate
from app.schemas.auth_schema import LoginRequest
from app.models.traceability import AuditAction
from app.services.audit_log_service import AuditLogService


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repository = UserRepository(db)

    def register(self, user_data: PublicUserRegister):
        existing_user = self.user_repository.get_by_email(user_data.email)

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El correo ya está registrado",
            )

        user = self.user_repository.create(
            UserCreate(
                full_name=user_data.full_name,
                email=user_data.email,
                password=user_data.password,
                role=UserRole.STUDENT,
            )
        )

        access_token = create_access_token(subject=user.id)
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user,
        }

    def login(self, login_data: LoginRequest):
        return self.authenticate_user(
            email=login_data.email,
            password=login_data.password,
        )

    def authenticate_user(self, email: str, password: str):
        user = self.user_repository.get_by_email(email)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales incorrectas",
            )

        if not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales incorrectas",
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="El usuario está desactivado",
            )

        access_token = create_access_token(subject=user.id)
        AuditLogService(self.db).record(
            actor=user,
            action=AuditAction.LOGIN,
            entity_type="USER",
            entity_id=user.id,
            description="Inicio de sesion exitoso.",
            commit=True,
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user,
        }
