from sqlalchemy.orm import Session

from app.models.classroom import Classroom, ClassroomType
from app.schemas.classroom_schema import ClassroomCreate, ClassroomUpdate


class ClassroomRepository:
    def __init__(self, db: Session):
        self.db = db

    def count_all(
        self,
        campus: str | None = None,
        classroom_type: ClassroomType | None = None,
        is_active: bool | None = None,
    ) -> int:
        query = self.db.query(Classroom)

        if campus:
            query = query.filter(Classroom.campus == campus)

        if classroom_type:
            query = query.filter(Classroom.classroom_type == classroom_type)

        if is_active is not None:
            query = query.filter(Classroom.is_active == is_active)

        return query.count()

    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        campus: str | None = None,
        classroom_type: ClassroomType | None = None,
        is_active: bool | None = None,
    ) -> list[Classroom]:
        query = self.db.query(Classroom)

        if campus:
            query = query.filter(Classroom.campus == campus)

        if classroom_type:
            query = query.filter(Classroom.classroom_type == classroom_type)

        if is_active is not None:
            query = query.filter(Classroom.is_active == is_active)

        return (
            query.order_by(Classroom.campus.asc(), Classroom.code.asc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_id(self, classroom_id: int) -> Classroom | None:
        return (
            self.db.query(Classroom)
            .filter(Classroom.id == classroom_id)
            .first()
        )

    def get_by_code(self, code: str) -> Classroom | None:
        return (
            self.db.query(Classroom)
            .filter(Classroom.code == code)
            .first()
        )

    def create(self, classroom_data: ClassroomCreate) -> Classroom:
        classroom = Classroom(**classroom_data.model_dump())

        self.db.add(classroom)
        self.db.commit()
        self.db.refresh(classroom)

        return classroom

    def update(
        self,
        classroom: Classroom,
        classroom_data: ClassroomUpdate,
    ) -> Classroom:
        update_data = classroom_data.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(classroom, field, value)

        self.db.commit()
        self.db.refresh(classroom)

        return classroom

    def delete(self, classroom: Classroom) -> None:
        self.db.delete(classroom)
        self.db.commit()