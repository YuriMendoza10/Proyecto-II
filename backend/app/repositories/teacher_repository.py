from sqlalchemy.orm import Session

from app.models.teacher import Teacher, TeacherAvailability
from app.schemas.teacher_schema import (
    TeacherAvailabilityCreate,
    TeacherAvailabilityUpdate,
    TeacherCreate,
    TeacherUpdate,
)


class TeacherRepository:
    def __init__(self, db: Session):
        self.db = db

    def count_all(self) -> int:
        return self.db.query(Teacher).count()

    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
    ) -> list[Teacher]:
        return (
            self.db.query(Teacher)
            .order_by(Teacher.id.asc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_id(self, teacher_id: int) -> Teacher | None:
        return (
            self.db.query(Teacher)
            .filter(Teacher.id == teacher_id)
            .first()
        )

    def get_by_user_id(self, user_id: int) -> Teacher | None:
        return (
            self.db.query(Teacher)
            .filter(Teacher.user_id == user_id)
            .first()
        )

    def get_by_teacher_code(self, teacher_code: str) -> Teacher | None:
        return (
            self.db.query(Teacher)
            .filter(Teacher.teacher_code == teacher_code)
            .first()
        )

    def create(self, teacher_data: TeacherCreate) -> Teacher:
        teacher = Teacher(**teacher_data.model_dump())

        self.db.add(teacher)
        self.db.commit()
        self.db.refresh(teacher)

        return teacher

    def update(
        self,
        teacher: Teacher,
        teacher_data: TeacherUpdate,
    ) -> Teacher:
        update_data = teacher_data.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(teacher, field, value)

        self.db.commit()
        self.db.refresh(teacher)

        return teacher

    def delete(self, teacher: Teacher) -> None:
        self.db.delete(teacher)
        self.db.commit()


class TeacherAvailabilityRepository:
    def __init__(self, db: Session):
        self.db = db

    def count_by_teacher(self, teacher_id: int) -> int:
        return (
            self.db.query(TeacherAvailability)
            .filter(TeacherAvailability.teacher_id == teacher_id)
            .count()
        )

    def get_by_id(
        self,
        availability_id: int,
    ) -> TeacherAvailability | None:
        return (
            self.db.query(TeacherAvailability)
            .filter(TeacherAvailability.id == availability_id)
            .first()
        )

    def get_by_teacher(
        self,
        teacher_id: int,
    ) -> list[TeacherAvailability]:
        return (
            self.db.query(TeacherAvailability)
            .filter(TeacherAvailability.teacher_id == teacher_id)
            .order_by(
                TeacherAvailability.day_of_week.asc(),
                TeacherAvailability.start_time.asc(),
            )
            .all()
        )

    def create(
        self,
        availability_data: TeacherAvailabilityCreate,
    ) -> TeacherAvailability:
        availability = TeacherAvailability(
            **availability_data.model_dump()
        )

        self.db.add(availability)
        self.db.commit()
        self.db.refresh(availability)

        return availability

    def update(
        self,
        availability: TeacherAvailability,
        availability_data: TeacherAvailabilityUpdate,
    ) -> TeacherAvailability:
        update_data = availability_data.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(availability, field, value)

        self.db.commit()
        self.db.refresh(availability)

        return availability

    def delete(self, availability: TeacherAvailability) -> None:
        self.db.delete(availability)
        self.db.commit()