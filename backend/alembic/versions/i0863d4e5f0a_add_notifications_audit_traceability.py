"""add notifications audit and traceability

Revision ID: i0863d4e5f0a
Revises: h0752c3d4e9f
"""

from alembic import op
import sqlalchemy as sa


revision = "i0863d4e5f0a"
down_revision = "h0752c3d4e9f"
branch_labels = None
depends_on = None


notification_type = sa.Enum(
    "INFO", "SUCCESS", "WARNING", "ERROR", "SCHEDULE_PUBLISHED",
    "CHANGE_REQUEST", "OFFERING_UPDATED", "CSP_GENERATED", "REPORT_READY",
    name="notificationtype",
)
related_entity_type = sa.Enum(
    "ACADEMIC_SCHEDULE", "SECTION_OFFERING", "SCHEDULE_CHANGE_REQUEST",
    "STUDENT_SCHEDULE", "REPORT", "OTHER",
    name="relatedentitytype",
)
audit_action = sa.Enum(
    "CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT", "PUBLISH", "APPROVE",
    "REJECT", "GENERATE_CSP", "SAVE_SOLUTION", "EXPORT_REPORT",
    name="auditaction",
)
schedule_change_type = sa.Enum(
    "REQUEST_CREATED", "REQUEST_CANCELLED", "REQUEST_APPROVED",
    "REQUEST_REJECTED", "BLOCK_UPDATED", "OFFERING_UPDATED",
    name="schedulechangetype",
)


def upgrade() -> None:
    op.create_table(
        "notifications",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=180), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("notification_type", notification_type, nullable=False),
        sa.Column("related_entity_type", related_entity_type, nullable=True),
        sa.Column("related_entity_id", sa.Integer(), nullable=True),
        sa.Column("is_read", sa.Boolean(), nullable=False, server_default=sa.text("0")),
        sa.Column("read_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_notifications_id", "notifications", ["id"])
    op.create_index("ix_notifications_user_id", "notifications", ["user_id"])
    op.create_index("ix_notifications_is_read", "notifications", ["is_read"])
    op.create_index("ix_notifications_notification_type", "notifications", ["notification_type"])

    op.create_table(
        "audit_logs",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("user_role", sa.String(length=30), nullable=True),
        sa.Column("action", audit_action, nullable=False),
        sa.Column("entity_type", sa.String(length=80), nullable=False),
        sa.Column("entity_id", sa.Integer(), nullable=True),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("old_values", sa.JSON(), nullable=True),
        sa.Column("new_values", sa.JSON(), nullable=True),
        sa.Column("ip_address", sa.String(length=64), nullable=True),
        sa.Column("user_agent", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_audit_logs_id", "audit_logs", ["id"])
    op.create_index("ix_audit_logs_user_id", "audit_logs", ["user_id"])
    op.create_index("ix_audit_logs_action", "audit_logs", ["action"])
    op.create_index("ix_audit_logs_entity_type", "audit_logs", ["entity_type"])
    op.create_index("ix_audit_logs_created_at", "audit_logs", ["created_at"])

    op.create_table(
        "schedule_publication_history",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("academic_schedule_id", sa.Integer(), nullable=False),
        sa.Column("academic_period_id", sa.Integer(), nullable=True),
        sa.Column("published_by_user_id", sa.Integer(), nullable=False),
        sa.Column("previous_status", sa.String(length=30), nullable=False),
        sa.Column("new_status", sa.String(length=30), nullable=False),
        sa.Column("publication_notes", sa.Text(), nullable=True),
        sa.Column("affected_teachers_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("affected_students_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("affected_sections_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["academic_schedule_id"], ["academic_schedules.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["academic_period_id"], ["academic_periods.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["published_by_user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_schedule_publication_history_id", "schedule_publication_history", ["id"])
    op.create_index("ix_schedule_publication_history_schedule", "schedule_publication_history", ["academic_schedule_id"])
    op.create_index("ix_schedule_publication_history_period", "schedule_publication_history", ["academic_period_id"])
    op.create_index("ix_schedule_publication_history_user", "schedule_publication_history", ["published_by_user_id"])

    op.create_table(
        "schedule_change_history",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("schedule_change_request_id", sa.Integer(), nullable=True),
        sa.Column("academic_schedule_id", sa.Integer(), nullable=True),
        sa.Column("schedule_block_id", sa.Integer(), nullable=True),
        sa.Column("changed_by_user_id", sa.Integer(), nullable=False),
        sa.Column("change_type", schedule_change_type, nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("old_values", sa.JSON(), nullable=True),
        sa.Column("new_values", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["schedule_change_request_id"], ["schedule_change_requests.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["academic_schedule_id"], ["academic_schedules.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["schedule_block_id"], ["schedule_blocks.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["changed_by_user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_schedule_change_history_id", "schedule_change_history", ["id"])
    op.create_index("ix_schedule_change_history_request", "schedule_change_history", ["schedule_change_request_id"])
    op.create_index("ix_schedule_change_history_schedule", "schedule_change_history", ["academic_schedule_id"])
    op.create_index("ix_schedule_change_history_block", "schedule_change_history", ["schedule_block_id"])
    op.create_index("ix_schedule_change_history_user", "schedule_change_history", ["changed_by_user_id"])
    op.create_index("ix_schedule_change_history_type", "schedule_change_history", ["change_type"])


def downgrade() -> None:
    op.drop_table("schedule_change_history")
    op.drop_table("schedule_publication_history")
    op.drop_table("audit_logs")
    op.drop_table("notifications")
