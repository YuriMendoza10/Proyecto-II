"""add academic offerings domain

Revision ID: f8530a1b2c7d
Revises: e7429f0a1b6c
Create Date: 2026-05-27 00:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "f8530a1b2c7d"
down_revision: Union[str, None] = "e7429f0a1b6c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())

    if not inspector.has_table("section_offerings"):
        op.create_table(
            "section_offerings",
            sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
            sa.Column("academic_period_id", sa.Integer(), nullable=False),
            sa.Column("academic_program_id", sa.Integer(), nullable=False),
            sa.Column("curriculum_plan_id", sa.Integer(), nullable=False),
            sa.Column("curriculum_course_id", sa.Integer(), nullable=False),
            sa.Column("course_id", sa.Integer(), nullable=False),
            sa.Column("section_code", sa.String(length=30), nullable=False),
            sa.Column("display_name", sa.String(length=240), nullable=False),
            sa.Column("cycle_number", sa.Integer(), nullable=False),
            sa.Column("teacher_id", sa.Integer(), nullable=True),
            sa.Column("classroom_id", sa.Integer(), nullable=True),
            sa.Column("estimated_students", sa.Integer(), nullable=False),
            sa.Column("capacity", sa.Integer(), nullable=False),
            sa.Column(
                "modality",
                sa.Enum("PRESENTIAL", "VIRTUAL", "HYBRID", name="offeringmodality"),
                nullable=False,
            ),
            sa.Column(
                "shift",
                sa.Enum("MORNING", "AFTERNOON", "NIGHT", "FLEXIBLE", name="offeringshift"),
                nullable=False,
            ),
            sa.Column(
                "status",
                sa.Enum("DRAFT", "READY", "APPROVED", "PUBLISHED", "CLOSED", name="offeringstatus"),
                nullable=False,
            ),
            sa.Column("notes", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
            sa.CheckConstraint("estimated_students >= 0", name="ck_offering_estimated_students_nonnegative"),
            sa.CheckConstraint("capacity >= 0", name="ck_offering_capacity_nonnegative"),
            sa.CheckConstraint("cycle_number BETWEEN 1 AND 10", name="ck_offering_cycle_range"),
            sa.ForeignKeyConstraint(["academic_period_id"], ["academic_periods.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["academic_program_id"], ["academic_programs.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["curriculum_plan_id"], ["curriculum_plans.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["curriculum_course_id"], ["curriculum_courses.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["course_id"], ["courses.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["teacher_id"], ["teachers.id"], ondelete="SET NULL"),
            sa.ForeignKeyConstraint(["classroom_id"], ["classrooms.id"], ondelete="SET NULL"),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint(
                "academic_period_id",
                "curriculum_course_id",
                "section_code",
                name="uq_offering_period_curriculum_section",
            ),
        )
        for column in (
            "id", "academic_period_id", "academic_program_id", "curriculum_plan_id",
            "curriculum_course_id", "course_id", "cycle_number", "teacher_id", "classroom_id", "status"
        ):
            op.create_index(f"ix_section_offerings_{column}", "section_offerings", [column])

    if not inspector.has_table("section_requirements"):
        op.create_table(
            "section_requirements",
            sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
            sa.Column("section_offering_id", sa.Integer(), nullable=False),
            sa.Column(
                "required_classroom_type",
                sa.Enum("THEORY", "LAB", "AUDITORIUM", "VIRTUAL", name="classroomtype"),
                nullable=True,
            ),
            sa.Column("required_equipment", sa.String(length=240), nullable=True),
            sa.Column("requires_lab", sa.Boolean(), nullable=False),
            sa.Column("min_capacity", sa.Integer(), nullable=False),
            sa.Column(
                "preferred_shift",
                sa.Enum("MORNING", "AFTERNOON", "NIGHT", "FLEXIBLE", name="offeringshift"),
                nullable=True,
            ),
            sa.Column("notes", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
            sa.CheckConstraint("min_capacity >= 0", name="ck_requirement_min_capacity_nonnegative"),
            sa.ForeignKeyConstraint(["section_offering_id"], ["section_offerings.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_section_requirements_id", "section_requirements", ["id"])
        op.create_index(
            "ix_section_requirements_section_offering_id",
            "section_requirements",
            ["section_offering_id"],
        )

    if not inspector.has_table("offering_conflicts"):
        op.create_table(
            "offering_conflicts",
            sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
            sa.Column("section_offering_id", sa.Integer(), nullable=True),
            sa.Column("academic_period_id", sa.Integer(), nullable=False),
            sa.Column(
                "conflict_type",
                sa.Enum(
                    "MISSING_TEACHER", "MISSING_CLASSROOM", "CLASSROOM_CAPACITY",
                    "TEACHER_NOT_AVAILABLE", "TEACHER_OVERLOAD", "CLASSROOM_TYPE_MISMATCH",
                    "DUPLICATED_SECTION", "UNREADY_OFFERING", name="offeringconflicttype"
                ),
                nullable=False,
            ),
            sa.Column(
                "severity",
                sa.Enum("LOW", "MEDIUM", "HIGH", "CRITICAL", name="offeringconflictseverity"),
                nullable=False,
            ),
            sa.Column("message", sa.Text(), nullable=False),
            sa.Column("suggested_action", sa.Text(), nullable=True),
            sa.Column("is_resolved", sa.Boolean(), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
            sa.ForeignKeyConstraint(["section_offering_id"], ["section_offerings.id"], ondelete="SET NULL"),
            sa.ForeignKeyConstraint(["academic_period_id"], ["academic_periods.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
        )
        for column in ("id", "section_offering_id", "academic_period_id", "conflict_type", "severity", "is_resolved"):
            op.create_index(f"ix_offering_conflicts_{column}", "offering_conflicts", [column])


def downgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    if inspector.has_table("offering_conflicts"):
        op.drop_table("offering_conflicts")
    if inspector.has_table("section_requirements"):
        op.drop_table("section_requirements")
    if inspector.has_table("section_offerings"):
        op.drop_table("section_offerings")
