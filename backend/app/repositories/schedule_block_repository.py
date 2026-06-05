from sqlalchemy.orm import Session

from app.models.schedule import (
    AcademicSchedule,
    ScheduleBlock,
    ScheduleStatus,
    ScheduleType,
)
from app.schemas.schedule_block_schema import (
    ScheduleBlockCreate,
    ScheduleBlockUpdate,
)


class ScheduleBlockRepository:
    def __init__(self, db: Session):
        self.db = db

    def count_all(
        self,
        schedule_id: int | None = None,
        section_id: int | None = None,
        classroom_id: int | None = None,
        day_of_week: int | None = None,
        published_institutional_only: bool = False,
    ) -> int:
        query = self.db.query(ScheduleBlock)

        if published_institutional_only:
            query = query.join(AcademicSchedule).filter(
                AcademicSchedule.schedule_type == ScheduleType.INSTITUTIONAL,
                AcademicSchedule.status == ScheduleStatus.PUBLISHED,
                AcademicSchedule.is_active == True,
            )

        if schedule_id is not None:
            query = query.filter(ScheduleBlock.schedule_id == schedule_id)

        if section_id is not None:
            query = query.filter(ScheduleBlock.section_id == section_id)

        if classroom_id is not None:
            query = query.filter(ScheduleBlock.classroom_id == classroom_id)

        if day_of_week is not None:
            query = query.filter(ScheduleBlock.day_of_week == day_of_week)

        return query.count()

    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        schedule_id: int | None = None,
        section_id: int | None = None,
        classroom_id: int | None = None,
        day_of_week: int | None = None,
        published_institutional_only: bool = False,
    ) -> list[ScheduleBlock]:
        query = self.db.query(ScheduleBlock)

        if published_institutional_only:
            query = query.join(AcademicSchedule).filter(
                AcademicSchedule.schedule_type == ScheduleType.INSTITUTIONAL,
                AcademicSchedule.status == ScheduleStatus.PUBLISHED,
                AcademicSchedule.is_active == True,
            )

        if schedule_id is not None:
            query = query.filter(ScheduleBlock.schedule_id == schedule_id)

        if section_id is not None:
            query = query.filter(ScheduleBlock.section_id == section_id)

        if classroom_id is not None:
            query = query.filter(ScheduleBlock.classroom_id == classroom_id)

        if day_of_week is not None:
            query = query.filter(ScheduleBlock.day_of_week == day_of_week)

        return (
            query.order_by(
                ScheduleBlock.day_of_week.asc(),
                ScheduleBlock.start_time.asc(),
            )
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_id(self, block_id: int) -> ScheduleBlock | None:
        return (
            self.db.query(ScheduleBlock)
            .filter(ScheduleBlock.id == block_id)
            .first()
        )

    def get_overlapping_classroom_blocks(
        self,
        classroom_id: int,
        day_of_week: int,
        start_time,
        end_time,
        exclude_block_id: int | None = None,
    ) -> list[ScheduleBlock]:
        query = (
            self.db.query(ScheduleBlock)
            .filter(
                ScheduleBlock.classroom_id == classroom_id,
                ScheduleBlock.day_of_week == day_of_week,
                ScheduleBlock.start_time < end_time,
                ScheduleBlock.end_time > start_time,
            )
        )

        if exclude_block_id is not None:
            query = query.filter(ScheduleBlock.id != exclude_block_id)

        return query.all()

    def get_overlapping_section_blocks(
        self,
        section_id: int,
        day_of_week: int,
        start_time,
        end_time,
        exclude_block_id: int | None = None,
    ) -> list[ScheduleBlock]:
        query = (
            self.db.query(ScheduleBlock)
            .filter(
                ScheduleBlock.section_id == section_id,
                ScheduleBlock.day_of_week == day_of_week,
                ScheduleBlock.start_time < end_time,
                ScheduleBlock.end_time > start_time,
            )
        )

        if exclude_block_id is not None:
            query = query.filter(ScheduleBlock.id != exclude_block_id)

        return query.all()

    def create(self, block_data: ScheduleBlockCreate) -> ScheduleBlock:
        block = ScheduleBlock(**block_data.model_dump())

        self.db.add(block)
        self.db.commit()
        self.db.refresh(block)

        return block

    def update(
        self,
        block: ScheduleBlock,
        block_data: ScheduleBlockUpdate,
    ) -> ScheduleBlock:
        update_data = block_data.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(block, field, value)

        self.db.commit()
        self.db.refresh(block)

        return block

    def delete(self, block: ScheduleBlock) -> None:
        self.db.delete(block)
        self.db.commit()
