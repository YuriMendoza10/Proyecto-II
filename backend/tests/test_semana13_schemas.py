import pytest
from pydantic import ValidationError

from app.models.student import StudentAcademicHistoryStatus
from app.schemas.student_academic_history_schema import StudentAcademicHistoryCreate
from app.schemas.student_schema import StudentCreate


def test_student_schema_accepts_valid_institutional_data():
    student = StudentCreate(
        user_id=1,
        student_code="S2026001",
        career="Ingenieria de Sistemas",
        current_cycle=5,
        min_credits=12,
        max_credits=22,
        academic_program_id=1,
        curriculum_plan_id=1,
        campus_id=1,
        max_credits_allowed=22,
    )

    assert student.current_cycle == 5
    assert student.academic_program_id == 1
    assert student.max_credits == 22


def test_student_schema_rejects_invalid_credit_range():
    with pytest.raises(ValidationError):
        StudentCreate(
            user_id=1,
            student_code="S2026002",
            career="Ingenieria de Sistemas",
            current_cycle=3,
            min_credits=20,
            max_credits=12,
        )


def test_academic_history_schema_accepts_approved_record():
    record = StudentAcademicHistoryCreate(
        student_id=1,
        course_id=10,
        status=StudentAcademicHistoryStatus.APPROVED,
        grade=16.5,
        attempt_number=1,
        credits=4,
    )

    assert record.status == StudentAcademicHistoryStatus.APPROVED
    assert record.grade == 16.5


def test_academic_history_schema_rejects_grade_outside_scale():
    with pytest.raises(ValidationError):
        StudentAcademicHistoryCreate(
            student_id=1,
            course_id=10,
            status=StudentAcademicHistoryStatus.FAILED,
            grade=25,
        )
