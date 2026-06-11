from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from app.models.schedule import ScheduleSourceType, ScheduleStatus
from app.services.schedule_publication_service import SchedulePublicationService


class FakeDb:
    def __init__(self):
        self.added = []
        self.committed = False
        self.refreshed = None

    def add(self, value):
        self.added.append(value)

    def commit(self):
        self.committed = True

    def refresh(self, value):
        self.refreshed = value

    def query(self, *_args):
        return FakeQuery()


class FakeQuery:
    def filter(self, *_args):
        return self

    def distinct(self):
        return self

    def all(self):
        return []

    def update(self, *_args, **_kwargs):
        return 0


def make_service(schedule, quality_report, readiness_report=None):
    service = SchedulePublicationService(FakeDb())
    service._get_schedule = lambda _schedule_id: schedule
    service.quality_service = SimpleNamespace(get_quality_report=lambda **_kwargs: quality_report)
    service.readiness_service = SimpleNamespace(
        get_readiness_report=lambda **_kwargs: readiness_report or {"summary": {"status": "READY", "critical_checks": 0}, "checks": []}
    )
    return service


def test_publish_safely_blocks_schedule_without_generated_blocks():
    schedule = SimpleNamespace(
        id=10,
        name="Horario prueba",
        status=ScheduleStatus.DRAFT,
        source_type="LEGACY",
        academic_period=None,
    )
    service = make_service(schedule, {
        "summary": {"critical_issues": 0, "warning_issues": 0, "info_issues": 0, "total_issues": 0},
        "stats": {"total_blocks": 0},
        "issues": [],
    })

    with pytest.raises(HTTPException) as exc:
        service.publish_safely(10)

    assert exc.value.status_code == 400
    assert "sin bloques" in exc.value.detail["message"]


def test_publish_safely_blocks_critical_readiness_checks():
    schedule = SimpleNamespace(
        id=10,
        name="Horario prueba",
        status=ScheduleStatus.DRAFT,
        source_type="LEGACY",
        academic_period=None,
    )
    service = make_service(
        schedule,
        {"summary": {}, "stats": {}, "issues": []},
        readiness_report={
            "summary": {"status": "BLOCKED", "critical_checks": 1},
            "checks": [{"severity": "CRITICAL", "message": "Falta aula"}],
        },
    )

    with pytest.raises(HTTPException) as exc:
        service.publish_safely(10)

    assert exc.value.status_code == 400
    assert exc.value.detail["readiness_critical_checks"] == 1


def test_publish_safely_publishes_when_quality_is_valid():
    schedule = SimpleNamespace(
        id=10,
        name="Horario prueba",
        status=ScheduleStatus.DRAFT,
        source_type="LEGACY",
        academic_period=None,
    )
    service = make_service(schedule, {
        "summary": {"critical_issues": 0, "warning_issues": 1, "info_issues": 0, "total_issues": 1},
        "stats": {"total_blocks": 4},
        "issues": [{"severity": "WARNING", "message": "Observacion menor"}],
    })

    result = service.publish_safely(10)

    assert result["success"] is True
    assert result["previous_status"] == "DRAFT"
    assert result["new_status"] == "PUBLISHED"
    assert result["total_blocks"] == 4
    assert schedule.status == ScheduleStatus.PUBLISHED


def test_section_offerings_source_skips_readiness_report():
    schedule = SimpleNamespace(
        id=10,
        name="Horario prueba",
        status=ScheduleStatus.DRAFT,
        source_type=ScheduleSourceType.SECTION_OFFERINGS,
        academic_period=None,
    )
    service = make_service(schedule, {
        "summary": {"critical_issues": 0, "warning_issues": 0, "info_issues": 0, "total_issues": 0},
        "stats": {"total_blocks": 2},
        "issues": [],
    })

    result = service.publish_safely(10)

    assert result["readiness_status"] == "READY"
