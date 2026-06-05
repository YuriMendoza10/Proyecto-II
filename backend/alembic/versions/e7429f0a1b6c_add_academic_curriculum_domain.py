"""add academic curriculum domain

Revision ID: e7429f0a1b6c
Revises: c6217d0e4a12
Create Date: 2026-05-26 23:55:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "e7429f0a1b6c"
down_revision: Union[str, None] = "c6217d0e4a12"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())

    if not inspector.has_table("academic_periods"):
        op.create_table(
            "academic_periods",
            sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
            sa.Column("code", sa.String(length=20), nullable=False),
            sa.Column("name", sa.String(length=120), nullable=False),
            sa.Column("start_date", sa.Date(), nullable=True),
            sa.Column("end_date", sa.Date(), nullable=True),
            sa.Column(
                "status",
                sa.Enum("PLANNED", "ACTIVE", "CLOSED", name="academicperiodstatus"),
                nullable=False,
            ),
            sa.Column("is_active", sa.Boolean(), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("code", name="uq_academic_periods_code"),
        )
        op.create_index("ix_academic_periods_code", "academic_periods", ["code"])
        op.create_index("ix_academic_periods_id", "academic_periods", ["id"])

    if not inspector.has_table("academic_programs"):
        op.create_table(
            "academic_programs",
            sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
            sa.Column("code", sa.String(length=30), nullable=False),
            sa.Column("name", sa.String(length=180), nullable=False),
            sa.Column("university", sa.String(length=180), nullable=False),
            sa.Column("faculty", sa.String(length=180), nullable=True),
            sa.Column("modality", sa.String(length=80), nullable=True),
            sa.Column(
                "status",
                sa.Enum("ACTIVE", "INACTIVE", name="academicprogramstatus"),
                nullable=False,
            ),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("code", name="uq_academic_programs_code"),
        )
        op.create_index("ix_academic_programs_code", "academic_programs", ["code"])
        op.create_index("ix_academic_programs_id", "academic_programs", ["id"])

    if not inspector.has_table("curriculum_plans"):
        op.create_table(
            "curriculum_plans",
            sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
            sa.Column("program_id", sa.Integer(), nullable=False),
            sa.Column("code", sa.String(length=40), nullable=False),
            sa.Column("name", sa.String(length=200), nullable=False),
            sa.Column("effective_year", sa.Integer(), nullable=False),
            sa.Column("total_cycles", sa.Integer(), nullable=False),
            sa.Column("total_credits", sa.Integer(), nullable=False),
            sa.Column(
                "status",
                sa.Enum("ACTIVE", "INACTIVE", "DRAFT", name="curriculumplanstatus"),
                nullable=False,
            ),
            sa.Column("source_note", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
            sa.ForeignKeyConstraint(["program_id"], ["academic_programs.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("code", name="uq_curriculum_plans_code"),
        )
        op.create_index("ix_curriculum_plans_code", "curriculum_plans", ["code"])
        op.create_index("ix_curriculum_plans_id", "curriculum_plans", ["id"])
        op.create_index("ix_curriculum_plans_program_id", "curriculum_plans", ["program_id"])

    if not inspector.has_table("curriculum_courses"):
        op.create_table(
            "curriculum_courses",
            sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
            sa.Column("curriculum_plan_id", sa.Integer(), nullable=False),
            sa.Column("course_id", sa.Integer(), nullable=False),
            sa.Column("cycle_number", sa.Integer(), nullable=False),
            sa.Column(
                "course_type",
                sa.Enum(
                    "REQUIRED",
                    "GENERAL_ELECTIVE",
                    "SPECIALTY_ELECTIVE",
                    "GENERAL",
                    "SPECIALTY",
                    name="curriculumcoursetype",
                ),
                nullable=False,
            ),
            sa.Column("credits", sa.Integer(), nullable=False),
            sa.Column("weekly_theory_hours", sa.Integer(), nullable=False),
            sa.Column("weekly_practice_hours", sa.Integer(), nullable=False),
            sa.Column("weekly_lab_hours", sa.Integer(), nullable=False),
            sa.Column("is_suggested_elective", sa.Boolean(), nullable=False),
            sa.Column("is_active", sa.Boolean(), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
            sa.ForeignKeyConstraint(["course_id"], ["courses.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(
                ["curriculum_plan_id"], ["curriculum_plans.id"], ondelete="CASCADE"
            ),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint(
                "curriculum_plan_id", "course_id", name="uq_curriculum_plan_course"
            ),
        )
        op.create_index("ix_curriculum_courses_course_id", "curriculum_courses", ["course_id"])
        op.create_index(
            "ix_curriculum_courses_curriculum_plan_id",
            "curriculum_courses",
            ["curriculum_plan_id"],
        )
        op.create_index("ix_curriculum_courses_cycle_number", "curriculum_courses", ["cycle_number"])
        op.create_index("ix_curriculum_courses_id", "curriculum_courses", ["id"])

    if not inspector.has_table("course_prerequisites"):
        op.create_table(
            "course_prerequisites",
            sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
            sa.Column("curriculum_course_id", sa.Integer(), nullable=False),
            sa.Column("prerequisite_course_id", sa.Integer(), nullable=False),
            sa.Column(
                "prerequisite_type",
                sa.Enum("REQUIRED", "CO_REQUIRED", "RECOMMENDED", name="prerequisitetype"),
                nullable=False,
            ),
            sa.Column("minimum_grade", sa.Float(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
            sa.ForeignKeyConstraint(
                ["curriculum_course_id"], ["curriculum_courses.id"], ondelete="CASCADE"
            ),
            sa.ForeignKeyConstraint(
                ["prerequisite_course_id"], ["curriculum_courses.id"], ondelete="CASCADE"
            ),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint(
                "curriculum_course_id",
                "prerequisite_course_id",
                name="uq_course_prerequisite_pair",
            ),
        )
        op.create_index(
            "ix_course_prerequisites_curriculum_course_id",
            "course_prerequisites",
            ["curriculum_course_id"],
        )
        op.create_index("ix_course_prerequisites_id", "course_prerequisites", ["id"])
        op.create_index(
            "ix_course_prerequisites_prerequisite_course_id",
            "course_prerequisites",
            ["prerequisite_course_id"],
        )

    if not inspector.has_table("elective_bank_courses"):
        op.create_table(
            "elective_bank_courses",
            sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
            sa.Column("curriculum_plan_id", sa.Integer(), nullable=False),
            sa.Column("mention_name", sa.String(length=160), nullable=False),
            sa.Column("course_name", sa.String(length=180), nullable=False),
            sa.Column("credits", sa.Integer(), nullable=False),
            sa.Column(
                "area",
                sa.Enum("IA_DATA", "CYBERSECURITY", "DEVOPS", "MANAGEMENT", name="electivearea"),
                nullable=False,
            ),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column("is_active", sa.Boolean(), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
            sa.ForeignKeyConstraint(
                ["curriculum_plan_id"], ["curriculum_plans.id"], ondelete="CASCADE"
            ),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(
            "ix_elective_bank_courses_curriculum_plan_id",
            "elective_bank_courses",
            ["curriculum_plan_id"],
        )
        op.create_index("ix_elective_bank_courses_id", "elective_bank_courses", ["id"])


def downgrade() -> None:
    inspector = sa.inspect(op.get_bind())

    if inspector.has_table("elective_bank_courses"):
        op.drop_table("elective_bank_courses")
    if inspector.has_table("course_prerequisites"):
        op.drop_table("course_prerequisites")
    if inspector.has_table("curriculum_courses"):
        op.drop_table("curriculum_courses")
    if inspector.has_table("curriculum_plans"):
        op.drop_table("curriculum_plans")
    if inspector.has_table("academic_programs"):
        op.drop_table("academic_programs")
    if inspector.has_table("academic_periods"):
        op.drop_table("academic_periods")
