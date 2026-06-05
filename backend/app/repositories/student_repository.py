from sqlalchemy.orm import Session, joinedload

from app.models.student import Student
from app.schemas.student_schema import StudentCreate, StudentUpdate


class StudentRepository:
    def __init__(self, db: Session):
        self.db = db

    def _apply_filters(
        self,
        query,
        academic_program_id: int | None = None,
        curriculum_plan_id: int | None = None,
        campus_id: int | None = None,
        current_cycle: int | None = None,
        enrollment_status: str | None = None,
    ):
        if academic_program_id is not None:
            query = query.filter(Student.academic_program_id == academic_program_id)
        if curriculum_plan_id is not None:
            query = query.filter(Student.curriculum_plan_id == curriculum_plan_id)
        if campus_id is not None:
            query = query.filter(Student.campus_id == campus_id)
        if current_cycle is not None:
            query = query.filter(Student.current_cycle == current_cycle)
        if enrollment_status is not None:
            query = query.filter(Student.enrollment_status == enrollment_status)
        return query

    def count_all(self, **filters) -> int:
        return self._apply_filters(self.db.query(Student), **filters).count()

    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        **filters,
    ) -> list[Student]:
        return (
            self._apply_filters(
                self.db.query(Student)
                .options(
                    joinedload(Student.user),
                    joinedload(Student.academic_program),
                    joinedload(Student.curriculum_plan),
                    joinedload(Student.campus),
                ),
                **filters,
            )
            .order_by(Student.id.asc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_id(self, student_id: int) -> Student | None:
        return (
            self.db.query(Student)
            .options(
                joinedload(Student.user),
                joinedload(Student.academic_program),
                joinedload(Student.curriculum_plan),
                joinedload(Student.campus),
            )
            .filter(Student.id == student_id)
            .first()
        )

    def get_by_user_id(self, user_id: int) -> Student | None:
        return (
            self.db.query(Student)
            .filter(Student.user_id == user_id)
            .first()
        )

    def get_by_student_code(self, student_code: str) -> Student | None:
        return (
            self.db.query(Student)
            .filter(Student.student_code == student_code)
            .first()
        )

    def create(self, student_data: StudentCreate) -> Student:
        student = Student(**student_data.model_dump())

        self.db.add(student)
        self.db.commit()
        self.db.refresh(student)

        return student

    def update(
        self,
        student: Student,
        student_data: StudentUpdate,
    ) -> Student:
        update_data = student_data.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(student, field, value)

        self.db.commit()
        self.db.refresh(student)

        return student

    def delete(self, student: Student) -> None:
        self.db.delete(student)
        self.db.commit()
