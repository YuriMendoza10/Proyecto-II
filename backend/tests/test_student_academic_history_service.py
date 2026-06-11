from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from app.models.student import StudentAcademicHistoryStatus
from app.services.student_academic_history_service import StudentAcademicHistoryService


class QueryStub:
    def __init__(self, records):
        self.records = records

    def filter(self, *_args):
        return self

    def all(self):
        return self.records


class DbStub:
    def __init__(self, student=None, records=None):
        self.student = student
        self.records = records or []

    def get(self, _model, _id):
        return self.student

    def query(self, *_args):
        return QueryStub(self.records)


def test_serialize_history_record_with_period():
    student = SimpleNamespace(
        student_code="S001",
        student_name="Ana Torres",
        academic_program_id=1,
        academic_program_name="Ingenieria de Sistemas",
        curriculum_plan_id=2,
        curriculum_plan_code="ISI-2026",
    )
    course = SimpleNamespace(code="CS101", name="Algoritmos")
    period = SimpleNamespace(name="2026-I")
    record = SimpleNamespace(
        id=1,
        student_id=10,
        student=student,
        course_id=20,
        course=course,
        academic_period_id=30,
        academic_period=period,
        status=StudentAcademicHistoryStatus.APPROVED,
        grade=17,
        attempt_number=1,
        credits=4,
        observation="Aprobado",
        created_at=None,
        updated_at=None,
    )

    data = StudentAcademicHistoryService._serialize(record)

    assert data["student_name"] == "Ana Torres"
    assert data["course_code"] == "CS101"
    assert data["academic_period_name"] == "2026-I"


def test_get_student_academic_summary_counts_statuses_and_credits():
    student = SimpleNamespace(
        id=10,
        student_code="S001",
        student_name="Ana Torres",
        current_cycle=5,
        academic_program_name="Ingenieria",
        curriculum_plan_code="ISI-2026",
    )
    records = [
        SimpleNamespace(status=StudentAcademicHistoryStatus.APPROVED, credits=4),
        SimpleNamespace(status=StudentAcademicHistoryStatus.APPROVED, credits=3),
        SimpleNamespace(status=StudentAcademicHistoryStatus.FAILED, credits=4),
        SimpleNamespace(status=StudentAcademicHistoryStatus.IN_PROGRESS, credits=None),
        SimpleNamespace(status=StudentAcademicHistoryStatus.WITHDRAWN, credits=2),
    ]
    service = StudentAcademicHistoryService(DbStub(student=student, records=records))

    summary = service.get_student_academic_summary(10)

    assert summary["total_courses"] == 5
    assert summary["approved_courses"] == 2
    assert summary["approved_credits"] == 7
    assert summary["failed_courses"] == 1
    assert summary["failed_credits"] == 4
    assert summary["in_progress_courses"] == 1
    assert summary["withdrawn_courses"] == 1


def test_get_student_academic_summary_returns_404_for_missing_student():
    service = StudentAcademicHistoryService(DbStub(student=None))

    with pytest.raises(HTTPException) as exc:
        service.get_student_academic_summary(99)

    assert exc.value.status_code == 404
