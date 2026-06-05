from typing import Any

from pydantic import BaseModel


class SchedulePublicationResponse(BaseModel):
    success: bool
    message: str

    schedule_id: int
    schedule_name: str | None = None
    previous_status: str | None = None
    new_status: str

    publishable: bool
    total_blocks: int

    total_issues: int
    critical_issues: int
    warning_issues: int
    info_issues: int
    readiness_status: str
    readiness_critical_checks: int

    warnings: list[dict[str, Any]] = []
