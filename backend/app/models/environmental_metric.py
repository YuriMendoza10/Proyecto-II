from datetime import datetime, timezone

from sqlalchemy import BigInteger, DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class EnvironmentalMetric(Base):
    __tablename__ = "environmental_metrics"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True,
    )

    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )

    http_method: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
    )

    endpoint_path: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
    )

    status_code: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    response_time_ms: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    response_bytes: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
    )

    estimated_co2_g: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )
