from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.course_repository import CourseRepository
from app.schemas.course_schema import CourseCreate, CourseUpdate


class CourseService:
    def __init__(self, db: Session):
        self.db = db
        self.course_repository = CourseRepository(db)

    def list_courses(
        self,
        skip: int = 0,
        limit: int = 100,
        career: str | None = None,
        cycle: int | None = None,
        is_active: bool | None = None,
    ):
        total = self.course_repository.count_all(
            career=career,
            cycle=cycle,
            is_active=is_active,
        )

        courses = self.course_repository.get_all(
            skip=skip,
            limit=limit,
            career=career,
            cycle=cycle,
            is_active=is_active,
        )

        return {
            "total": total,
            "courses": courses,
        }

    def get_course_by_id(self, course_id: int):
        course = self.course_repository.get_by_id(course_id)

        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Curso no encontrado",
            )

        return course

    def create_course(self, course_data: CourseCreate):
        existing_course = self.course_repository.get_by_code(course_data.code)

        if existing_course:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El código del curso ya está registrado",
            )

        if course_data.weekly_hours < course_data.credits:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Las horas semanales no pueden ser menores que los créditos",
            )

        return self.course_repository.create(course_data)

    def update_course(
        self,
        course_id: int,
        course_data: CourseUpdate,
    ):
        course = self.get_course_by_id(course_id)

        if course_data.code:
            existing_course = self.course_repository.get_by_code(
                course_data.code
            )

            if existing_course and existing_course.id != course.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="El código del curso ya pertenece a otro curso",
                )

        new_credits = (
            course_data.credits
            if course_data.credits is not None
            else course.credits
        )

        new_weekly_hours = (
            course_data.weekly_hours
            if course_data.weekly_hours is not None
            else course.weekly_hours
        )

        if new_weekly_hours < new_credits:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Las horas semanales no pueden ser menores que los créditos",
            )

        return self.course_repository.update(course, course_data)

    def deactivate_course(self, course_id: int):
        course = self.get_course_by_id(course_id)

        course_data = CourseUpdate(is_active=False)

        return self.course_repository.update(course, course_data)

    def activate_course(self, course_id: int):
        course = self.get_course_by_id(course_id)

        course_data = CourseUpdate(is_active=True)

        return self.course_repository.update(course, course_data)

    def delete_course(self, course_id: int):
        course = self.get_course_by_id(course_id)

        self.course_repository.delete(course)

        return {
            "message": "Curso eliminado correctamente",
        }