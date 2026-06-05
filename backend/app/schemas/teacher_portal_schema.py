from datetime import datetime, time

from pydantic import BaseModel, Field, model_validator

from app.models.schedule_change_request import ScheduleChangeRequestStatus, ScheduleChangeRequestType


class TeacherOwnAvailabilityCreate(BaseModel):
    day_of_week: int = Field(..., ge=1, le=7)
    start_time: time
    end_time: time
    is_available: bool = True


class ScheduleChangeRequestCreate(BaseModel):
    schedule_block_id: int | None = Field(default=None, gt=0)
    section_offering_id: int | None = Field(default=None, gt=0)
    academic_period_id: int | None = Field(default=None, gt=0)
    request_type: ScheduleChangeRequestType
    requested_day_of_week: int | None = Field(default=None, ge=1, le=7)
    requested_start_time: time | None = None
    requested_end_time: time | None = None
    reason: str = Field(..., min_length=5, max_length=2000)

    @model_validator(mode="after")
    def validate_requested_time(self):
        if self.requested_start_time and self.requested_end_time:
            if self.requested_start_time >= self.requested_end_time:
                raise ValueError("La hora solicitada de inicio debe ser menor que la hora fin.")
        return self


class ScheduleChangeRequestResolve(BaseModel):
    status: ScheduleChangeRequestStatus
    coordinator_response: str = Field(..., min_length=3, max_length=2000)

    @model_validator(mode="after")
    def validate_resolution_status(self):
        if self.status not in {ScheduleChangeRequestStatus.APPROVED, ScheduleChangeRequestStatus.REJECTED}:
            raise ValueError("La resolucion debe ser APPROVED o REJECTED.")
        return self


class ScheduleChangeRequestResponse(BaseModel):
    id: int
    teacher_id: int
    teacher_name: str | None = None
    schedule_block_id: int | None = None
    section_offering_id: int | None = None
    course_name: str | None = None
    section_code: str | None = None
    academic_period_id: int | None = None
    academic_period_code: str | None = None
    request_type: ScheduleChangeRequestType
    current_day_of_week: int | None = None
    current_start_time: time | None = None
    current_end_time: time | None = None
    requested_day_of_week: int | None = None
    requested_start_time: time | None = None
    requested_end_time: time | None = None
    reason: str
    status: ScheduleChangeRequestStatus
    coordinator_response: str | None = None
    created_at: datetime
    updated_at: datetime
    resolved_at: datetime | None = None
