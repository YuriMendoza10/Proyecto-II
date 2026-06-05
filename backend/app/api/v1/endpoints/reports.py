import csv
import io

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.user import User, UserRole
from app.schemas.report_schema import (
    ChangeRequestsReport,
    ClassroomUsageReport,
    ConflictsReport,
    ExecutiveSummaryReport,
    OfferingStatusReport,
    SchedulesReport,
    StudentsReport,
    SustainabilityReport,
    TeacherLoadReport,
)
from app.services.report_service import ReportService
from app.services.traceability_service import TraceabilityService


router = APIRouter()
REPORT_ROLES = (UserRole.ADMIN, UserRole.COORDINATOR)


@router.get("/executive-summary", response_model=ExecutiveSummaryReport)
def executive_summary(
    academic_period_id: int | None = Query(default=None, gt=0),
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(*REPORT_ROLES)),
):
    return ReportService(db).executive_summary(academic_period_id)


@router.get("/teacher-load", response_model=TeacherLoadReport)
def teacher_load(
    academic_period_id: int | None = Query(default=None, gt=0),
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(*REPORT_ROLES)),
):
    return ReportService(db).teacher_load(academic_period_id)


@router.get("/classroom-usage", response_model=ClassroomUsageReport)
def classroom_usage(
    academic_period_id: int | None = Query(default=None, gt=0),
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(*REPORT_ROLES)),
):
    return ReportService(db).classroom_usage(academic_period_id)


@router.get("/offering-status", response_model=OfferingStatusReport)
def offering_status(
    academic_period_id: int | None = Query(default=None, gt=0),
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(*REPORT_ROLES)),
):
    return ReportService(db).offering_status(academic_period_id)


@router.get("/conflicts", response_model=ConflictsReport)
def conflicts(
    academic_period_id: int | None = Query(default=None, gt=0),
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(*REPORT_ROLES)),
):
    return ReportService(db).conflicts(academic_period_id)


@router.get("/schedules", response_model=SchedulesReport)
def schedules(
    academic_period_id: int | None = Query(default=None, gt=0),
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(*REPORT_ROLES)),
):
    return ReportService(db).schedules(academic_period_id)


@router.get("/students", response_model=StudentsReport)
def students(
    academic_period_id: int | None = Query(default=None, gt=0),
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(*REPORT_ROLES)),
):
    return ReportService(db).students(academic_period_id)


@router.get("/change-requests", response_model=ChangeRequestsReport)
def change_requests(
    academic_period_id: int | None = Query(default=None, gt=0),
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(*REPORT_ROLES)),
):
    return ReportService(db).change_requests(academic_period_id)


@router.get("/sustainability", response_model=SustainabilityReport)
def sustainability(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(*REPORT_ROLES)),
):
    return ReportService(db).sustainability()


def _csv_response(filename: str, headers: list[str], rows: list[list]) -> StreamingResponse:
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(headers)
    writer.writerows(rows)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/teacher-load/export.csv")
def teacher_load_csv(
    academic_period_id: int | None = Query(default=None, gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*REPORT_ROLES)),
):
    items = ReportService(db).teacher_load(academic_period_id)["teachers"]
    TraceabilityService(db).record_report_export(current_user, "teacher-load")
    return _csv_response(
        "teacher-load.csv",
        ["teacher_id", "teacher_name", "assigned_weekly_hours", "max_weekly_hours", "load_percentage", "status", "courses_count", "sections_count"],
        [[item[key] for key in ["teacher_id", "teacher_name", "assigned_weekly_hours", "max_weekly_hours", "load_percentage", "status", "courses_count", "sections_count"]] for item in items],
    )


@router.get("/classroom-usage/export.csv")
def classroom_usage_csv(
    academic_period_id: int | None = Query(default=None, gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*REPORT_ROLES)),
):
    items = ReportService(db).classroom_usage(academic_period_id)["classrooms"]
    TraceabilityService(db).record_report_export(current_user, "classroom-usage")
    return _csv_response(
        "classroom-usage.csv",
        ["classroom_id", "classroom_code", "classroom_name", "type", "capacity", "used_hours", "usage_percentage", "blocks_count", "status"],
        [[item[key] for key in ["classroom_id", "classroom_code", "classroom_name", "type", "capacity", "used_hours", "usage_percentage", "blocks_count", "status"]] for item in items],
    )


@router.get("/offering-status/export.csv")
def offering_status_csv(
    academic_period_id: int | None = Query(default=None, gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*REPORT_ROLES)),
):
    data = ReportService(db).offering_status(academic_period_id)
    TraceabilityService(db).record_report_export(current_user, "offering-status")
    rows = [["TOTAL", data["total_offerings"]]]
    rows.extend([[f"STATUS_{key}", value] for key, value in data["by_status"].items()])
    rows.extend([[f"CYCLE_{key}", value] for key, value in data["by_cycle"].items()])
    rows.extend([["MISSING_TEACHER", data["missing_teacher"]], ["MISSING_CLASSROOM", data["missing_classroom"]]])
    return _csv_response("offering-status.csv", ["indicator", "value"], rows)


@router.get("/conflicts/export.csv")
def conflicts_csv(
    academic_period_id: int | None = Query(default=None, gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*REPORT_ROLES)),
):
    items = ReportService(db).conflicts(academic_period_id)["details"]
    TraceabilityService(db).record_report_export(current_user, "conflicts")
    return _csv_response(
        "conflicts.csv",
        ["id", "conflict_type", "severity", "related_course", "related_section", "message", "suggested_action", "is_resolved"],
        [[item.get(key) for key in ["id", "conflict_type", "severity", "related_course", "related_section", "message", "suggested_action", "is_resolved"]] for item in items],
    )


@router.get("/students/export.csv")
def students_csv(
    academic_period_id: int | None = Query(default=None, gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*REPORT_ROLES)),
):
    data = ReportService(db).students(academic_period_id)
    TraceabilityService(db).record_report_export(current_user, "students")
    rows = [
        ["total_students", data["total_students"]],
        ["students_with_enrollments", data["students_with_enrollments"]],
        ["students_without_enrollments", data["students_without_enrollments"]],
        ["students_with_saved_schedules", data["students_with_saved_schedules"]],
        ["students_without_saved_schedules", data["students_without_saved_schedules"]],
        ["average_credits", data["average_credits"]],
    ]
    rows.extend([[f"enrollments_cycle_{key}", value] for key, value in data["enrollments_by_cycle"].items()])
    return _csv_response("students.csv", ["indicator", "value"], rows)
