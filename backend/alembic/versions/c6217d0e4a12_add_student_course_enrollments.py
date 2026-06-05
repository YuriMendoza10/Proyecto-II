"""add student course enrollments

Revision ID: c6217d0e4a12
Revises: 8d5c2a9f1e70
Create Date: 2026-05-26 03:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c6217d0e4a12"
down_revision: Union[str, None] = "8d5c2a9f1e70"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()

    if sa.inspect(bind).has_table("student_course_enrollments"):
        return

    op.create_table(
        "student_course_enrollments",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("student_id", sa.Integer(), nullable=False),
        sa.Column("course_id", sa.Integer(), nullable=False),
        sa.Column("academic_period", sa.String(length=20), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["course_id"], ["courses.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["student_id"], ["students.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "student_id",
            "course_id",
            "academic_period",
            name="uq_student_course_period",
        ),
    )
    op.create_index(
        op.f("ix_student_course_enrollments_academic_period"),
        "student_course_enrollments",
        ["academic_period"],
        unique=False,
    )
    op.create_index(
        op.f("ix_student_course_enrollments_course_id"),
        "student_course_enrollments",
        ["course_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_student_course_enrollments_id"),
        "student_course_enrollments",
        ["id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_student_course_enrollments_student_id"),
        "student_course_enrollments",
        ["student_id"],
        unique=False,
    )


def downgrade() -> None:
    bind = op.get_bind()

    if not sa.inspect(bind).has_table("student_course_enrollments"):
        return

    op.drop_index(
        op.f("ix_student_course_enrollments_student_id"),
        table_name="student_course_enrollments",
    )
    op.drop_index(
        op.f("ix_student_course_enrollments_id"),
        table_name="student_course_enrollments",
    )
    op.drop_index(
        op.f("ix_student_course_enrollments_course_id"),
        table_name="student_course_enrollments",
    )
    op.drop_index(
        op.f("ix_student_course_enrollments_academic_period"),
        table_name="student_course_enrollments",
    )
    op.drop_table("student_course_enrollments")
