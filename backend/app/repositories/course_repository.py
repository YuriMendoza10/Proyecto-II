from sqlalchemy.orm import Session

from app.models.course import Course
from app.schemas.course_schema import CourseCreate, CourseUpdate


class CourseRepository:
    def __init__(self, db: Session):
        self.db = db

    def count_all(
        self,
        career: str | None = None,
        cycle: int | None = None,
        is_active: bool | None = None,
    ) -> int:
        query = self.db.query(Course)

        if career:
            query = query.filter(Course.career == career)

        if cycle:
            query = query.filter(Course.cycle == cycle)

        if is_active is not None:
            query = query.filter(Course.is_active == is_active)

        return query.count()

    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        career: str | None = None,
        cycle: int | None = None,
        is_active: bool | None = None,
    ) -> list[Course]:
        query = self.db.query(Course)

        if career:
            query = query.filter(Course.career == career)

        if cycle:
            query = query.filter(Course.cycle == cycle)

        if is_active is not None:
            query = query.filter(Course.is_active == is_active)

        return (
            query.order_by(Course.cycle.asc(), Course.name.asc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_id(self, course_id: int) -> Course | None:
        return (
            self.db.query(Course)
            .filter(Course.id == course_id)
            .first()
        )

    def get_by_code(self, code: str) -> Course | None:
        return (
            self.db.query(Course)
            .filter(Course.code == code)
            .first()
        )

    def create(self, course_data: CourseCreate) -> Course:
        course = Course(**course_data.model_dump())

        self.db.add(course)
        self.db.commit()
        self.db.refresh(course)

        return course

    def update(
        self,
        course: Course,
        course_data: CourseUpdate,
    ) -> Course:
        update_data = course_data.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(course, field, value)

        self.db.commit()
        self.db.refresh(course)

        return course

    def delete(self, course: Course) -> None:
        self.db.delete(course)
        self.db.commit()