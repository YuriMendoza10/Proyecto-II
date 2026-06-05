from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.models.user import User
from app.schemas.user_schema import UserCreate, UserUpdate


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: int) -> User | None:
        return (
            self.db.query(User)
            .filter(User.id == user_id)
            .first()
        )

    def get_by_email(self, email: str) -> User | None:
        return (
            self.db.query(User)
            .filter(User.email == email)
            .first()
        )

    def count_all(self) -> int:
        return self.db.query(User).count()

    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
    ) -> list[User]:
        return (
            self.db.query(User)
            .order_by(User.id.asc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def create(self, user_data: UserCreate) -> User:
        user = User(
            full_name=user_data.full_name,
            email=user_data.email,
            hashed_password=get_password_hash(user_data.password),
            role=user_data.role,
        )

        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        return user

    def update(
        self,
        user: User,
        user_data: UserUpdate,
    ) -> User:
        update_data = user_data.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(user, field, value)

        self.db.commit()
        self.db.refresh(user)

        return user

    def deactivate(self, user: User) -> User:
        user.is_active = False

        self.db.commit()
        self.db.refresh(user)

        return user

    def activate(self, user: User) -> User:
        user.is_active = True

        self.db.commit()
        self.db.refresh(user)

        return user

    def delete_permanently(self, user: User) -> None:
        self.db.delete(user)
        self.db.commit()