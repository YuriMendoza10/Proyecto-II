from datetime import time
from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from app.models.academic import AcademicPeriodStatus
from app.services.report_service import ReportService


def test_report_helpers_count_enums_duration_and_shift():
    service = ReportService(SimpleNamespace())
    items = [
        SimpleNamespace(status=SimpleNamespace(value="DRAFT")),
        SimpleNamespace(status=SimpleNamespace(value="DRAFT")),
        SimpleNamespace(status=SimpleNamespace(value="PUBLISHED")),
    ]
    block = SimpleNamespace(start_time=time(8, 0), end_time=time(9, 30))

    assert service._enum_counts(items, "status") == {"DRAFT": 2, "PUBLISHED": 1}
    assert service._duration(block) == 1.5
    assert service._time_shift(SimpleNamespace(start_time=time(8, 0))) == "MORNING"
    assert service._time_shift(SimpleNamespace(start_time=time(15, 0))) == "AFTERNOON"
    assert service._time_shift(SimpleNamespace(start_time=time(19, 0))) == "NIGHT"


def test_period_value_and_greenframe_missing(tmp_path, monkeypatch):
    service = ReportService(SimpleNamespace())
    monkeypatch.setattr(service, "GREENFRAME_PATH", tmp_path / "missing.txt")
    period = SimpleNamespace(id=1, code="2026-I", name="Periodo 2026-I")

    assert service._period_value(period) == {"id": 1, "code": "2026-I", "name": "Periodo 2026-I"}
    assert service._period_value(None) is None
    assert service._greenframe_value() == {"available": False, "message": "No hay reporte GreenFrame generado."}


def test_greenframe_existing_file_includes_content(tmp_path, monkeypatch):
    path = tmp_path / "greenframe-latest.txt"
    path.write_text("Performance OK", encoding="utf-8")
    service = ReportService(SimpleNamespace())
    monkeypatch.setattr(service, "GREENFRAME_PATH", path)

    value = service._greenframe_value(include_content=True)

    assert value["available"] is True
    assert value["content"] == "Performance OK"


def test_period_raises_404_when_requested_period_does_not_exist():
    class Query:
        def filter(self, *_args):
            return self

        def first(self):
            return None

    db = SimpleNamespace(query=lambda _model: Query())
    service = ReportService(db)

    with pytest.raises(HTTPException) as exc:
        service._period(academic_period_id=123)

    assert exc.value.status_code == 404


def test_period_returns_active_period_when_no_id():
    period = SimpleNamespace(id=1, code="2026-I", name="Activo", status=AcademicPeriodStatus.ACTIVE)

    class Query:
        def filter(self, *_args):
            return self

        def order_by(self, *_args):
            return self

        def first(self):
            return period

    db = SimpleNamespace(query=lambda _model: Query())
    service = ReportService(db)

    assert service._period(None) is period
