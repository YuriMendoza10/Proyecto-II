from datetime import datetime

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.environmental_metric import EnvironmentalMetric


class EnvironmentalService:
    # FastAPI equivalent of the classroom CO2.js exercise: the emissions
    # estimate is centralized here so a future provider can replace it.
    EMISSIONS_FACTOR_G_PER_GB = 0.81
    BYTES_PER_GB = 1024 ** 3

    def __init__(self, db: Session):
        self.db = db

    @classmethod
    def calculate_co2_g(cls, response_bytes: int) -> float:
        transferred_gb = max(response_bytes, 0) / cls.BYTES_PER_GB
        return transferred_gb * cls.EMISSIONS_FACTOR_G_PER_GB

    def record_metric(
        self,
        *,
        recorded_at: datetime,
        http_method: str,
        endpoint_path: str,
        status_code: int,
        response_time_ms: float,
        response_bytes: int,
    ) -> EnvironmentalMetric:
        metric = EnvironmentalMetric(
            recorded_at=recorded_at,
            http_method=http_method,
            endpoint_path=endpoint_path,
            status_code=status_code,
            response_time_ms=response_time_ms,
            response_bytes=response_bytes,
            estimated_co2_g=self.calculate_co2_g(response_bytes),
        )
        self.db.add(metric)
        try:
            self.db.commit()
            self.db.refresh(metric)
        except Exception:
            self.db.rollback()
            raise
        return metric

    def clear_metrics(self) -> None:
        try:
            self.db.query(EnvironmentalMetric).delete(synchronize_session=False)
            self.db.commit()
        except Exception:
            self.db.rollback()
            raise

    def get_summary(self) -> dict:
        totals = (
            self.db.query(
                func.count(EnvironmentalMetric.id),
                func.coalesce(func.sum(EnvironmentalMetric.response_bytes), 0),
                func.coalesce(func.sum(EnvironmentalMetric.estimated_co2_g), 0.0),
                func.coalesce(func.avg(EnvironmentalMetric.response_time_ms), 0.0),
            )
            .one()
        )

        most_polluting = (
            self.db.query(EnvironmentalMetric.endpoint_path)
            .group_by(EnvironmentalMetric.endpoint_path)
            .order_by(func.sum(EnvironmentalMetric.estimated_co2_g).desc())
            .first()
        )
        most_used = (
            self.db.query(EnvironmentalMetric.endpoint_path)
            .group_by(EnvironmentalMetric.endpoint_path)
            .order_by(func.count(EnvironmentalMetric.id).desc())
            .first()
        )
        total_requests = int(totals[0] or 0)
        total_co2 = float(totals[2] or 0.0)

        return {
            "total_requests": total_requests,
            "total_co2": total_co2,
            "average_co2": total_co2 / total_requests if total_requests else 0.0,
            "total_bytes": int(totals[1] or 0),
            "most_polluting_endpoint": most_polluting[0] if most_polluting else None,
            "most_used_endpoint": most_used[0] if most_used else None,
            "average_response_time": float(totals[3] or 0.0),
        }

    def get_ranking(self, limit: int = 25) -> list[dict]:
        rows = (
            self.db.query(
                EnvironmentalMetric.endpoint_path,
                func.count(EnvironmentalMetric.id).label("requests"),
                func.sum(EnvironmentalMetric.response_bytes).label("bytes"),
                func.sum(EnvironmentalMetric.estimated_co2_g).label("co2_g"),
                func.avg(EnvironmentalMetric.response_time_ms).label("response_time_ms"),
            )
            .group_by(EnvironmentalMetric.endpoint_path)
            .order_by(func.sum(EnvironmentalMetric.estimated_co2_g).desc())
            .limit(limit)
            .all()
        )

        return [
            {
                "path": row.endpoint_path,
                "total_requests": int(row.requests or 0),
                "total_co2": float(row.co2_g or 0.0),
                "average_response_time": float(row.response_time_ms or 0.0),
                "total_bytes": int(row.bytes or 0),
            }
            for row in rows
        ]

    def get_metrics(self, limit: int = 100) -> list[dict]:
        metrics = (
            self.db.query(EnvironmentalMetric)
            .order_by(EnvironmentalMetric.recorded_at.desc(), EnvironmentalMetric.id.desc())
            .limit(limit)
            .all()
        )

        return [
            {
                "measured_at": metric.recorded_at,
                "method": metric.http_method,
                "path": metric.endpoint_path,
                "status_code": metric.status_code,
                "response_time_ms": metric.response_time_ms,
                "response_size_bytes": metric.response_bytes,
                "estimated_co2_g": metric.estimated_co2_g,
            }
            for metric in metrics
        ]

    def get_dashboard_data(self, recent_limit: int = 100) -> dict:
        summary = self.get_summary()
        return {
            "total_requests": summary["total_requests"],
            "total_bytes": summary["total_bytes"],
            "total_co2_g": summary["total_co2"],
            "average_response_time_ms": summary["average_response_time"],
            "factor_g_per_gb": self.EMISSIONS_FACTOR_G_PER_GB,
            "endpoints": self.get_ranking(),
            "recent_metrics": self.get_metrics(recent_limit),
        }
