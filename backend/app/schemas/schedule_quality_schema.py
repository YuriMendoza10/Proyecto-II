from typing import Any, Literal

from pydantic import BaseModel


IssueSeverity = Literal["INFO", "WARNING", "CRITICAL"]


class ScheduleQualityIssue(BaseModel):
    code: str
    severity: IssueSeverity
    title: str
    detail: str

    entity_type: str | None = None
    entity_id: int | None = None

    related_entity_type: str | None = None
    related_entity_id: int | None = None

    context: dict[str, Any] = {}


class ScheduleQualitySummary(BaseModel):
    total_issues: int
    critical_issues: int
    warning_issues: int
    info_issues: int

    publishable: bool
    quality_status: Literal["OK", "WARNING", "CRITICAL"]


class ScheduleQualityStats(BaseModel):
    total_blocks: int
    total_sections_scope: int
    scheduled_sections: int
    sections_without_blocks: int

    classroom_conflicts: int
    teacher_conflicts: int
    section_conflicts: int

    blocks_without_teacher: int
    blocks_without_classroom: int
    blocks_outside_allowed_time: int
    blocks_invalid_day: int
    blocks_with_inactive_classroom: int
    blocks_without_teacher_availability: int


class ScheduleQualityReportResponse(BaseModel):
    schedule_id: int
    schedule_name: str | None = None
    schedule_status: str | None = None

    career_filter: str | None = None
    cycle_filter: list[int] = []
    course_ids: list[int] = []

    summary: ScheduleQualitySummary
    stats: ScheduleQualityStats
    issues: list[ScheduleQualityIssue]