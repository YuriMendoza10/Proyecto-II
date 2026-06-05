from datetime import datetime
from typing import Any

from pydantic import BaseModel


class ExecutiveSummaryReport(BaseModel):
    active_period: dict[str, Any] | None
    total_programs: int
    total_curriculum_plans: int
    total_offerings: int
    offerings_by_status: dict[str, int]
    total_schedules: int
    schedules_by_status: dict[str, int]
    total_published_schedules: int
    total_teachers: int
    active_teachers: int
    total_students: int
    students_with_enrollments: int
    students_with_saved_schedules: int
    total_classrooms: int
    active_classrooms: int
    total_conflicts: int
    critical_conflicts: int
    pending_change_requests: int
    approved_change_requests: int
    latest_greenframe_result: dict[str, Any]


class TeacherLoadItem(BaseModel):
    teacher_id: int
    teacher_name: str
    assigned_weekly_hours: float
    max_weekly_hours: int
    load_percentage: float
    status: str
    courses_count: int
    sections_count: int
    hours_by_day: dict[str, float]
    courses_summary: list[dict[str, Any]]


class TeacherLoadReport(BaseModel):
    active_period: dict[str, Any] | None
    teachers: list[TeacherLoadItem]


class ClassroomUsageItem(BaseModel):
    classroom_id: int
    classroom_code: str
    classroom_name: str
    type: str
    capacity: int
    used_hours: float
    usage_percentage: float
    blocks_count: int
    usage_by_day: dict[str, float]
    usage_by_shift: dict[str, float]
    status: str


class ClassroomUsageReport(BaseModel):
    active_period: dict[str, Any] | None
    available_weekly_hours: float
    classrooms: list[ClassroomUsageItem]


class OfferingStatusReport(BaseModel):
    active_period: dict[str, Any] | None
    total_offerings: int
    by_status: dict[str, int]
    by_cycle: dict[str, int]
    by_modality: dict[str, int]
    by_shift: dict[str, int]
    missing_teacher: int
    missing_classroom: int
    ready_count: int
    approved_count: int
    published_count: int
    draft_count: int


class ConflictsReport(BaseModel):
    active_period: dict[str, Any] | None
    total_conflicts: int
    by_type: dict[str, int]
    by_severity: dict[str, int]
    unresolved_count: int
    resolved_count: int
    details: list[dict[str, Any]]


class SchedulesReport(BaseModel):
    active_period: dict[str, Any] | None
    schedules: list[dict[str, Any]]


class StudentsReport(BaseModel):
    active_period: dict[str, Any] | None
    total_students: int
    students_with_enrollments: int
    students_without_enrollments: int
    students_with_saved_schedules: int
    students_without_saved_schedules: int
    average_credits: float
    enrollments_by_cycle: dict[str, int]
    schedules_by_generation_mode: dict[str, int]
    most_common_courses: list[dict[str, Any]]


class ChangeRequestsReport(BaseModel):
    active_period: dict[str, Any] | None
    total: int
    by_status: dict[str, int]
    by_type: dict[str, int]
    pending_count: int
    approved_count: int
    rejected_count: int
    cancelled_count: int
    requests_by_teacher: list[dict[str, Any]]
    average_resolution_time_hours: float | None


class SustainabilityReport(BaseModel):
    environmental_metrics: dict[str, Any]
    latest_greenframe_result: dict[str, Any]
    message: str
