from datetime import time

from pydantic import BaseModel


class ScheduleBlockEnrichedResponse(BaseModel):
    id: int
    schedule_id: int

    section_id: int | None
    section_offering_id: int | None = None
    section_code: str | None

    course_id: int | None
    course_code: str | None
    course_name: str | None
    weekly_hours: int | None

    teacher_id: int | None
    teacher_code: str | None
    teacher_name: str | None

    classroom_id: int | None
    classroom_code: str | None
    classroom_name: str | None
    classroom_capacity: int | None

    day_of_week: int
    start_time: time
    end_time: time

    class Config:
        from_attributes = True
