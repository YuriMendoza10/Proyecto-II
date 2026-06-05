from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.user_repository import UserRepository
from app.schemas.user_schema import UserCreate, UserUpdate


class UserService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repository = UserRepository(db)

    def list_users(
        self,
        skip: int = 0,
        limit: int = 100,
    ):
        total = self.user_repository.count_all()
        users = self.user_repository.get_all(skip=skip, limit=limit)

        return {
            "total": total,
            "users": users,
        }

    def get_user_by_id(self, user_id: int):
        user = self.user_repository.get_by_id(user_id)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado",
            )

        return user

    def create_user(self, user_data: UserCreate):
        existing_user = self.user_repository.get_by_email(user_data.email)

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El correo ya está registrado",
            )

        return self.user_repository.create(user_data)

    def update_user(
        self,
        user_id: int,
        user_data: UserUpdate,
    ):
        user = self.get_user_by_id(user_id)

        if user_data.email:
            existing_user = self.user_repository.get_by_email(user_data.email)

            if existing_user and existing_user.id != user.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="El correo ya pertenece a otro usuario",
                )

        return self.user_repository.update(user, user_data)

    def deactivate_user(self, user_id: int):
        user = self.get_user_by_id(user_id)
        return self.user_repository.deactivate(user)

    def activate_user(self, user_id: int):
        user = self.get_user_by_id(user_id)
        return self.user_repository.activate(user)