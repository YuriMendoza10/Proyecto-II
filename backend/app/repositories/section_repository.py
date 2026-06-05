from sqlalchemy.orm import Session

from app.models.course import CourseSection
from app.schemas.section_schema import SectionCreate, SectionUpdate


class SectionRepository:
    def __init__(self, db: Session):
        self.db = db

    def count_all(
        self,
        course_id: int | None = None,
        teacher_id: int | None = None,
    ) -> int:
        query = self.db.query(CourseSection)

        if course_id is not None:
            query = query.filter(CourseSection.course_id == course_id)

        if teacher_id is not None:
            query = query.filter(CourseSection.teacher_id == teacher_id)

        return query.count()

    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        course_id: int | None = None,
        teacher_id: int | None = None,
    ) -> list[CourseSection]:
        query = self.db.query(CourseSection)

        if course_id is not None:
            query = query.filter(CourseSection.course_id == course_id)

        if teacher_id is not None:
            query = query.filter(CourseSection.teacher_id == teacher_id)

        return (
            query.order_by(
                CourseSection.course_id.asc(),
                CourseSection.section_code.asc(),
            )
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_id(self, section_id: int) -> CourseSection | None:
        return (
            self.db.query(CourseSection)
            .filter(CourseSection.id == section_id)
            .first()
        )

    def get_by_course_and_code(
        self,
        course_id: int,
        section_code: str,
    ) -> CourseSection | None:
        return (
            self.db.query(CourseSection)
            .filter(
                CourseSection.course_id == course_id,
                CourseSection.section_code == section_code,
            )
            .first()
        )

    def create(self, section_data: SectionCreate) -> CourseSection:
        section = CourseSection(**section_data.model_dump())

        self.db.add(section)
        self.db.commit()
        self.db.refresh(section)

        return section

    def update(
        self,
        section: CourseSection,
        section_data: SectionUpdate,
    ) -> CourseSection:
        update_data = section_data.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(section, field, value)

        self.db.commit()
        self.db.refresh(section)

        return section

    def delete(self, section: CourseSection) -> None:
        self.db.delete(section)
        self.db.commit()