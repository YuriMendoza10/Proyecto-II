"""Add teacher schedule change requests.

Revision ID: h0752c3d4e9f
Revises: g9641b2c3d8e
Create Date: 2026-05-27
"""

from alembic import op
import sqlalchemy as sa


revision = "h0752c3d4e9f"
down_revision = "g9641b2c3d8e"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "schedule_change_requests",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("teacher_id", sa.Integer(), nullable=False),
        sa.Column("schedule_block_id", sa.Integer(), nullable=True),
        sa.Column("section_offering_id", sa.Integer(), nullable=True),
        sa.Column("academic_period_id", sa.Integer(), nullable=True),
        sa.Column(
            "request_type",
            sa.Enum(
                "CHANGE_TIME",
                "CHANGE_CLASSROOM",
                "SWAP_SECTION",
                "AVAILABILITY_CONFLICT",
                "OTHER",
                name="schedulechangerequesttype",
            ),
            nullable=False,
        ),
        sa.Column("current_day_of_week", sa.Integer(), nullable=True),
        sa.Column("current_start_time", sa.Time(), nullable=True),
        sa.Column("current_end_time", sa.Time(), nullable=True),
        sa.Column("requested_day_of_week", sa.Integer(), nullable=True),
        sa.Column("requested_start_time", sa.Time(), nullable=True),
        sa.Column("requested_end_time", sa.Time(), nullable=True),
        sa.Column("reason", sa.Text(), nullable=False),
        sa.Column(
            "status",
            sa.Enum("PENDING", "APPROVED", "REJECTED", "CANCELLED", name="schedulechangerequeststatus"),
            nullable=False,
            server_default="PENDING",
        ),
        sa.Column("coordinator_response", sa.Text(), nullable=True),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["academic_period_id"], ["academic_periods.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["schedule_block_id"], ["schedule_blocks.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["section_offering_id"], ["section_offerings.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["teacher_id"], ["teachers.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_schedule_change_requests_id", "schedule_change_requests", ["id"])
    op.create_index("ix_schedule_change_requests_teacher_id", "schedule_change_requests", ["teacher_id"])
    op.create_index("ix_schedule_change_requests_schedule_block_id", "schedule_change_requests", ["schedule_block_id"])
    op.create_index("ix_schedule_change_requests_section_offering_id", "schedule_change_requests", ["section_offering_id"])
    op.create_index("ix_schedule_change_requests_academic_period_id", "schedule_change_requests", ["academic_period_id"])
    op.create_index("ix_schedule_change_requests_status", "schedule_change_requests", ["status"])


def downgrade() -> None:
    op.drop_index("ix_schedule_change_requests_status", table_name="schedule_change_requests")
    op.drop_index("ix_schedule_change_requests_academic_period_id", table_name="schedule_change_requests")
    op.drop_index("ix_schedule_change_requests_section_offering_id", table_name="schedule_change_requests")
    op.drop_index("ix_schedule_change_requests_schedule_block_id", table_name="schedule_change_requests")
    op.drop_index("ix_schedule_change_requests_teacher_id", table_name="schedule_change_requests")
    op.drop_index("ix_schedule_change_requests_id", table_name="schedule_change_requests")
    op.drop_table("schedule_change_requests")
