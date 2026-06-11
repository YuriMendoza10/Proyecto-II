from datetime import datetime
from types import SimpleNamespace

import pytest

from app.services.environmental_service import EnvironmentalService


class FakeDb:
    def __init__(self, fail_commit=False):
        self.fail_commit = fail_commit
        self.added = []
        self.committed = False
        self.rolled_back = False
        self.refreshed = None

    def add(self, value):
        self.added.append(value)

    def commit(self):
        if self.fail_commit:
            raise RuntimeError("fallo controlado")
        self.committed = True

    def refresh(self, value):
        self.refreshed = value

    def rollback(self):
        self.rolled_back = True

    def query(self, *_args):
        return FakeDeleteQuery(self)


class FakeDeleteQuery:
    def __init__(self, db):
        self.db = db
        self.deleted = False

    def delete(self, synchronize_session=False):
        self.deleted = True
        return 3


def test_calculate_co2_handles_positive_zero_and_negative_bytes():
    assert EnvironmentalService.calculate_co2_g(0) == 0
    assert EnvironmentalService.calculate_co2_g(-100) == 0
    assert EnvironmentalService.calculate_co2_g(1024 ** 3) == pytest.approx(0.81)


def test_record_metric_persists_estimated_co2():
    db = FakeDb()
    service = EnvironmentalService(db)

    metric = service.record_metric(
        recorded_at=datetime(2026, 1, 1),
        http_method="GET",
        endpoint_path="/api/v1/reports/sustainability",
        status_code=200,
        response_time_ms=12.5,
        response_bytes=1024,
    )

    assert db.added == [metric]
    assert db.committed is True
    assert db.refreshed is metric
    assert metric.estimated_co2_g > 0


def test_record_metric_rolls_back_on_commit_error():
    db = FakeDb(fail_commit=True)
    service = EnvironmentalService(db)

    with pytest.raises(RuntimeError):
        service.record_metric(
            recorded_at=datetime(2026, 1, 1),
            http_method="GET",
            endpoint_path="/api/v1/fail",
            status_code=500,
            response_time_ms=1,
            response_bytes=1,
        )

    assert db.rolled_back is True


def test_get_dashboard_data_combines_summary_ranking_and_metrics(monkeypatch):
    service = EnvironmentalService(SimpleNamespace())
    monkeypatch.setattr(service, "get_summary", lambda: {
        "total_requests": 2,
        "total_bytes": 2048,
        "total_co2": 0.1,
        "average_response_time": 25.0,
    })
    monkeypatch.setattr(service, "get_ranking", lambda: [{"path": "/api/v1/a"}])
    monkeypatch.setattr(service, "get_metrics", lambda limit: [{"path": "/api/v1/b", "limit": limit}])

    data = service.get_dashboard_data(recent_limit=5)

    assert data["total_requests"] == 2
    assert data["total_co2_g"] == 0.1
    assert data["endpoints"] == [{"path": "/api/v1/a"}]
    assert data["recent_metrics"][0]["limit"] == 5
