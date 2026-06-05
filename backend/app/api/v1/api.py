from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    admin_demo,
    academic_periods,
    academic_programs,
    campuses,
    classrooms,
    courses,
    course_prerequisites,
    csp_diagnostics,
    dashboard,
    data_readiness,
    elective_bank_courses,
    section_offerings,
    section_requirements,
    offering_conflicts,
    coordinator_dashboard,
    coordinator_change_requests,
    reports,
    notifications,
    audit_logs,
    traceability,
    environmental_impact,
    institutional_csp,
    schedule_blocks,
    schedule_publication,
    schedule_quality,
    schedules,
    sections,
    curriculum_courses,
    curriculum_plans,
    faculties,
    student_csp,
    student_enrollments,
    student_academic_history,
    students,
    sustainability,
    teachers,
    users,
)

api_router = APIRouter()


@api_router.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "ok",
        "message": "OptiAcademic API funcionando correctamente",
    }


# --- Registro de Routers ---

api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Auth"],
)

api_router.include_router(
    admin_demo.router,
    prefix="/admin/demo",
    tags=["Admin Demo"],
)

api_router.include_router(
    academic_periods.router,
    prefix="/academic-periods",
    tags=["Academic Periods"],
)

api_router.include_router(
    academic_programs.router,
    prefix="/academic-programs",
    tags=["Academic Programs"],
)

api_router.include_router(
    curriculum_plans.router,
    prefix="/curriculum-plans",
    tags=["Curriculum Plans"],
)

api_router.include_router(
    curriculum_courses.router,
    prefix="/curriculum-courses",
    tags=["Curriculum Courses"],
)

api_router.include_router(
    course_prerequisites.router,
    prefix="/course-prerequisites",
    tags=["Course Prerequisites"],
)

api_router.include_router(
    elective_bank_courses.router,
    prefix="/elective-bank-courses",
    tags=["Elective Bank Courses"],
)

api_router.include_router(
    section_offerings.router,
    prefix="/section-offerings",
    tags=["Section Offerings"],
)

api_router.include_router(
    section_requirements.router,
    prefix="/section-requirements",
    tags=["Section Requirements"],
)

api_router.include_router(
    offering_conflicts.router,
    prefix="/offering-conflicts",
    tags=["Offering Conflicts"],
)

api_router.include_router(
    coordinator_dashboard.router,
    prefix="/coordinator/dashboard",
    tags=["Coordinator Dashboard"],
)

api_router.include_router(
    faculties.router,
    prefix="/faculties",
    tags=["Faculties"],
)

api_router.include_router(
    campuses.router,
    prefix="/campuses",
    tags=["Campuses"],
)

api_router.include_router(
    coordinator_change_requests.router,
    prefix="/coordinator/change-requests",
    tags=["Coordinator Change Requests"],
)

api_router.include_router(
    reports.router,
    prefix="/reports",
    tags=["Reports"],
)

api_router.include_router(
    notifications.router,
    prefix="/notifications",
    tags=["Notifications"],
)

api_router.include_router(
    audit_logs.router,
    prefix="/audit-logs",
    tags=["Audit Logs"],
)

api_router.include_router(
    traceability.router,
    prefix="/traceability",
    tags=["Traceability"],
)

api_router.include_router(
    users.router,
    prefix="/users",
    tags=["Users"],
)

api_router.include_router(
    teachers.router,
    prefix="/teachers",
    tags=["Teachers"],
)

api_router.include_router(
    students.router,
    prefix="/students",
    tags=["Students"],
)

api_router.include_router(
    courses.router,
    prefix="/courses",
    tags=["Courses"],
)

api_router.include_router(
    classrooms.router,
    prefix="/classrooms",
    tags=["Classrooms"],
)

api_router.include_router(
    sections.router,
    prefix="/sections",
    tags=["Sections"],
)

api_router.include_router(
    schedules.router,
    prefix="/schedules",
    tags=["Schedules"],
)

api_router.include_router(
    schedule_blocks.router,
    prefix="/schedule-blocks",
    tags=["Schedule Blocks"],
)

api_router.include_router(
    institutional_csp.router,
    prefix="/institutional-csp",
    tags=["Institutional CSP"],
)

api_router.include_router(
    csp_diagnostics.router,
    prefix="/csp-diagnostics",
    tags=["CSP Diagnostics"],
)

api_router.include_router(
    student_csp.router,
    prefix="/student-csp",
    tags=["Student CSP"],
)

api_router.include_router(
    dashboard.router,
    prefix="/dashboard",
    tags=["Dashboard"],
)

api_router.include_router(
    schedule_quality.router,
    prefix="/schedule-quality",
    tags=["Schedule Quality"],
)

api_router.include_router(
    schedule_publication.router,
    prefix="/schedule-publication",
    tags=["Schedule Publication"],
)

api_router.include_router(
    data_readiness.router,
    prefix="/data-readiness",
    tags=["Data Readiness"],
)

api_router.include_router(
    student_enrollments.router,
    prefix="/student-enrollments",
    tags=["Student Enrollments"],
)

api_router.include_router(
    student_academic_history.router,
    prefix="/student-academic-history",
    tags=["Student Academic History"],
)

api_router.include_router(
    environmental_impact.router,
    tags=["Environmental Impact"],
)

api_router.include_router(
    sustainability.router,
    tags=["Sustainability"],
)
