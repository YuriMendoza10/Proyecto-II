from datetime import datetime, time

from pydantic import BaseModel, Field, model_validator


class ScheduleBlockBase(BaseModel):
    schedule_id: int = Field(..., gt=0)
    section_id: int = Field(..., gt=0)
    classroom_id: int | None = Field(default=None, gt=0)
    day_of_week: int = Field(..., ge=1, le=7)
    start_time: time
    end_time: time

    @model_validator(mode="after")
    def validate_time_range(self):
        if self.start_time >= self.end_time:
            raise ValueError("La hora de inicio debe ser menor que la hora de fin")

        if self.start_time < time(7, 0):
            raise ValueError("La clase no puede iniciar antes de las 07:00")

        if self.end_time > time(22, 0):
            raise ValueError("La clase no puede terminar después de las 22:00")

        return self


class ScheduleBlockCreate(ScheduleBlockBase):
    pass


class ScheduleBlockUpdate(BaseModel):
    schedule_id: int | None = Field(default=None, gt=0)
    section_id: int | None = Field(default=None, gt=0)
    classroom_id: int | None = Field(default=None, gt=0)
    day_of_week: int | None = Field(default=None, ge=1, le=7)
    start_time: time | None = None
    end_time: time | None = None


class ScheduleBlockResponse(BaseModel):
    id: int
    schedule_id: int
    section_id: int | None
    section_offering_id: int | None = None
    classroom_id: int | None
    day_of_week: int
    start_time: time
    end_time: time
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }


class ScheduleBlockListResponse(BaseModel):
    total: int
    blocks: list[ScheduleBlockResponse]
