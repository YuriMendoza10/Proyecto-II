from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import UserRole
from app.repositories.teacher_repository import (
    TeacherAvailabilityRepository,
    TeacherRepository,
)
from app.repositories.user_repository import UserRepository
from app.schemas.teacher_schema import (
    TeacherAvailabilityCreate,
    TeacherAvailabilityUpdate,
    TeacherCreate,
    TeacherUpdate,
)


TEACHER_NOT_FOUND_MESSAGE = "Docente no encontrado"


class TeacherService:
    def __init__(self, db: Session):
        self.db = db
        self.teacher_repository = TeacherRepository(db)
        self.user_repository = UserRepository(db)

    def list_teachers(
        self,
        skip: int = 0,
        limit: int = 100,
    ):
        total = self.teacher_repository.count_all()
        teachers = self.teacher_repository.get_all(skip=skip, limit=limit)

        return {
            "total": total,
            "teachers": teachers,
        }

    def get_teacher_by_id(self, teacher_id: int, current_user=None):
        teacher = self.teacher_repository.get_by_id(teacher_id)

        if not teacher:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=TEACHER_NOT_FOUND_MESSAGE,
            )

        if current_user and current_user.role == UserRole.TEACHER:
            own_profile = self.teacher_repository.get_by_user_id(current_user.id)
            if not own_profile or own_profile.id != teacher.id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo puedes consultar tu propio perfil docente")
        return teacher

    def create_teacher(self, teacher_data: TeacherCreate):
        user = self.user_repository.get_by_id(teacher_data.user_id)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado",
            )

        if user.role != UserRole.TEACHER:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El usuario debe tener rol TEACHER",
            )

        existing_profile = self.teacher_repository.get_by_user_id(
            teacher_data.user_id
        )

        if existing_profile:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Este usuario ya tiene perfil docente",
            )

        existing_code = self.teacher_repository.get_by_teacher_code(
            teacher_data.teacher_code
        )

        if existing_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El código docente ya está registrado",
            )

        return self.teacher_repository.create(teacher_data)

    def update_teacher(
        self,
        teacher_id: int,
        teacher_data: TeacherUpdate,
    ):
        teacher = self.get_teacher_by_id(teacher_id)

        if teacher_data.teacher_code:
            existing_code = self.teacher_repository.get_by_teacher_code(
                teacher_data.teacher_code
            )

            if existing_code and existing_code.id != teacher.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="El código docente ya pertenece a otro docente",
                )

        return self.teacher_repository.update(teacher, teacher_data)

    def delete_teacher(self, teacher_id: int):
        teacher = self.get_teacher_by_id(teacher_id)
        self.teacher_repository.delete(teacher)

        return {
            "message": "Docente eliminado correctamente",
        }


class TeacherAvailabilityService:
    def __init__(self, db: Session):
        self.db = db
        self.teacher_repository = TeacherRepository(db)
        self.availability_repository = TeacherAvailabilityRepository(db)

    def list_teacher_availabilities(self, teacher_id: int, current_user):
        teacher = self.teacher_repository.get_by_id(teacher_id)

        if not teacher:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=TEACHER_NOT_FOUND_MESSAGE,
            )

        self._ensure_teacher_access(teacher_id, current_user)

        availabilities = self.availability_repository.get_by_teacher(
            teacher_id
        )

        return {
            "total": len(availabilities),
            "availabilities": availabilities,
        }

    def get_availability_by_id(self, availability_id: int):
        availability = self.availability_repository.get_by_id(
            availability_id
        )

        if not availability:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Disponibilidad no encontrada",
            )

        return availability

    def create_availability(
        self,
        availability_data: TeacherAvailabilityCreate,
        current_user,
    ):
        teacher = self.teacher_repository.get_by_id(
            availability_data.teacher_id
        )

        if not teacher:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=TEACHER_NOT_FOUND_MESSAGE,
            )

        self._ensure_teacher_access(teacher.id, current_user)

        if availability_data.start_time >= availability_data.end_time:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La hora de inicio debe ser menor que la hora de fin",
            )

        return self.availability_repository.create(availability_data)

    def update_availability(
        self,
        availability_id: int,
        availability_data: TeacherAvailabilityUpdate,
        current_user,
    ):
        availability = self.get_availability_by_id(availability_id)
        self._ensure_teacher_access(availability.teacher_id, current_user)

        new_start_time = (
            availability_data.start_time
            if availability_data.start_time is not None
            else availability.start_time
        )
        new_end_time = (
            availability_data.end_time
            if availability_data.end_time is not None
            else availability.end_time
        )

        if new_start_time >= new_end_time:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La hora de inicio debe ser menor que la hora de fin",
            )

        return self.availability_repository.update(
            availability,
            availability_data,
        )

    def delete_availability(self, availability_id: int, current_user):
        availability = self.get_availability_by_id(availability_id)
        self._ensure_teacher_access(availability.teacher_id, current_user)
        self.availability_repository.delete(availability)

        return {
            "message": "Disponibilidad eliminada correctamente",
        }

    def _ensure_teacher_access(self, teacher_id: int, current_user) -> None:
        if current_user.role in (UserRole.ADMIN, UserRole.COORDINATOR):
            return

        own_profile = self.teacher_repository.get_by_user_id(current_user.id)

        if (
            current_user.role != UserRole.TEACHER
            or own_profile is None
            or own_profile.id != teacher_id
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo puedes gestionar tu propia disponibilidad docente",
            )
