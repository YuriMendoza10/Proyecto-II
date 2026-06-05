"""add environmental metrics

Revision ID: 8d5c2a9f1e70
Revises: 43a31e08c46e
Create Date: 2026-05-25 23:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "8d5c2a9f1e70"
down_revision: Union[str, None] = "43a31e08c46e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "environmental_metrics",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("recorded_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("http_method", sa.String(length=10), nullable=False),
        sa.Column("endpoint_path", sa.String(length=255), nullable=False),
        sa.Column("status_code", sa.Integer(), nullable=False),
        sa.Column("response_time_ms", sa.Float(), nullable=False),
        sa.Column("response_bytes", sa.BigInteger(), nullable=False),
        sa.Column("estimated_co2_g", sa.Float(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_environmental_metrics_endpoint_path"),
        "environmental_metrics",
        ["endpoint_path"],
        unique=False,
    )
    op.create_index(
        op.f("ix_environmental_metrics_id"),
        "environmental_metrics",
        ["id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_environmental_metrics_recorded_at"),
        "environmental_metrics",
        ["recorded_at"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_environmental_metrics_recorded_at"),
        table_name="environmental_metrics",
    )
    op.drop_index(
        op.f("ix_environmental_metrics_id"),
        table_name="environmental_metrics",
    )
    op.drop_index(
        op.f("ix_environmental_metrics_endpoint_path"),
        table_name="environmental_metrics",
    )
    op.drop_table("environmental_metrics")
