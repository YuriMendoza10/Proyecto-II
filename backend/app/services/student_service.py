from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import UserRole
from app.repositories.student_repository import StudentRepository
from app.repositories.user_repository import UserRepository
from app.schemas.student_schema import StudentCreate, StudentUpdate


class StudentService:
    def __init__(self, db: Session):
        self.db = db
        self.student_repository = StudentRepository(db)
        self.user_repository = UserRepository(db)

    def list_students(
        self,
        skip: int = 0,
        limit: int = 100,
        academic_program_id: int | None = None,
        curriculum_plan_id: int | None = None,
        campus_id: int | None = None,
        current_cycle: int | None = None,
        enrollment_status: str | None = None,
    ):
        filters = {
            "academic_program_id": academic_program_id,
            "curriculum_plan_id": curriculum_plan_id,
            "campus_id": campus_id,
            "current_cycle": current_cycle,
            "enrollment_status": enrollment_status,
        }
        total = self.student_repository.count_all(**filters)
        students = self.student_repository.get_all(skip=skip, limit=limit, **filters)

        return {
            "total": total,
            "students": students,
        }

    def get_student_by_id(self, student_id: int):
        student = self.student_repository.get_by_id(student_id)

        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Estudiante no encontrado",
            )

        return student

    def create_student(self, student_data: StudentCreate):
        user = self.user_repository.get_by_id(student_data.user_id)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado",
            )

        if user.role != UserRole.STUDENT:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El usuario debe tener rol STUDENT",
            )

        existing_profile = self.student_repository.get_by_user_id(
            student_data.user_id
        )

        if existing_profile:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Este usuario ya tiene perfil estudiante",
            )

        existing_code = self.student_repository.get_by_student_code(
            student_data.student_code
        )

        if existing_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El código de estudiante ya está registrado",
            )

        if student_data.min_credits > student_data.max_credits:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Los créditos mínimos no pueden ser mayores que los máximos",
            )

        if student_data.min_credits < 7 or student_data.max_credits > 25:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Los créditos deben estar entre 7 y 25",
            )

        return self.student_repository.create(student_data)

    def update_student(
        self,
        student_id: int,
        student_data: StudentUpdate,
    ):
        student = self.get_student_by_id(student_id)

        if student_data.student_code:
            existing_code = self.student_repository.get_by_student_code(
                student_data.student_code
            )

            if existing_code and existing_code.id != student.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="El código de estudiante ya pertenece a otro estudiante",
                )

        new_min_credits = (
            student_data.min_credits
            if student_data.min_credits is not None
            else student.min_credits
        )

        new_max_credits = (
            student_data.max_credits
            if student_data.max_credits is not None
            else student.max_credits
        )

        if new_min_credits > new_max_credits:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Los créditos mínimos no pueden ser mayores que los máximos",
            )

        if new_min_credits < 7 or new_max_credits > 25:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Los créditos deben estar entre 7 y 25",
            )

        return self.student_repository.update(student, student_data)

    def delete_student(self, student_id: int):
        student = self.get_student_by_id(student_id)
        self.student_repository.delete(student)

        return {
            "message": "Estudiante eliminado correctamente",
        }
