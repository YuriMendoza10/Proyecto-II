from pydantic import BaseModel


class DashboardMetric(BaseModel):
    label: str
    value: int | float | str
    description: str | None = None


class TeacherLoadItem(BaseModel):
    teacher_id: int
    teacher_code: str | None = None
    teacher_name: str | None = None
    total_blocks: int
    total_minutes: int
    total_hours: float


class ClassroomUsageItem(BaseModel):
    classroom_id: int
    classroom_code: str | None = None
    classroom_name: str | None = None
    total_blocks: int


class ScheduleStatusItem(BaseModel):
    status: str
    total: int


class AdminDashboardSummaryResponse(BaseModel):
    schedule_id: int | None = None
    schedule_name: str | None = None
    schedule_status: str | None = None

    total_users: int
    total_active_users: int
    total_teachers: int
    total_students: int
    total_courses: int
    total_sections: int
    total_classrooms: int
    total_active_classrooms: int
    total_schedules: int
    total_schedule_blocks: int

    sections_without_teacher: int
    teachers_without_availability: int
    courses_without_sections: int
    blocks_without_teacher: int

    schedules_by_status: list[ScheduleStatusItem]
    teacher_load_top: list[TeacherLoadItem]
    classroom_usage_top: list[ClassroomUsageItem]