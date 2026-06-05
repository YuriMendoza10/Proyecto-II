from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.classroom import ClassroomType
from app.repositories.classroom_repository import ClassroomRepository
from app.schemas.classroom_schema import ClassroomCreate, ClassroomUpdate


class ClassroomService:
    def __init__(self, db: Session):
        self.db = db
        self.classroom_repository = ClassroomRepository(db)

    def list_classrooms(
        self,
        skip: int = 0,
        limit: int = 100,
        campus: str | None = None,
        classroom_type: ClassroomType | None = None,
        is_active: bool | None = None,
    ):
        total = self.classroom_repository.count_all(
            campus=campus,
            classroom_type=classroom_type,
            is_active=is_active,
        )

        classrooms = self.classroom_repository.get_all(
            skip=skip,
            limit=limit,
            campus=campus,
            classroom_type=classroom_type,
            is_active=is_active,
        )

        return {
            "total": total,
            "classrooms": classrooms,
        }

    def get_classroom_by_id(self, classroom_id: int):
        classroom = self.classroom_repository.get_by_id(classroom_id)

        if not classroom:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Aula no encontrada",
            )

        return classroom

    def create_classroom(self, classroom_data: ClassroomCreate):
        existing_classroom = self.classroom_repository.get_by_code(
            classroom_data.code
        )

        if existing_classroom:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El código del aula ya está registrado",
            )

        return self.classroom_repository.create(classroom_data)

    def update_classroom(
        self,
        classroom_id: int,
        classroom_data: ClassroomUpdate,
    ):
        classroom = self.get_classroom_by_id(classroom_id)

        if classroom_data.code:
            existing_classroom = self.classroom_repository.get_by_code(
                classroom_data.code
            )

            if existing_classroom and existing_classroom.id != classroom.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="El código del aula ya pertenece a otra aula",
                )

        return self.classroom_repository.update(classroom, classroom_data)

    def deactivate_classroom(self, classroom_id: int):
        classroom = self.get_classroom_by_id(classroom_id)

        classroom_data = ClassroomUpdate(is_active=False)

        return self.classroom_repository.update(classroom, classroom_data)

    def activate_classroom(self, classroom_id: int):
        classroom = self.get_classroom_by_id(classroom_id)

        classroom_data = ClassroomUpdate(is_active=True)

        return self.classroom_repository.update(classroom, classroom_data)

    def delete_classroom(self, classroom_id: int):
        classroom = self.get_classroom_by_id(classroom_id)

        self.classroom_repository.delete(classroom)

        return {
            "message": "Aula eliminada correctamente",
        }