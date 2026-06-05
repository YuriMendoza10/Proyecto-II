"""Connect offering schedules and enrollment periods.

Revision ID: g9641b2c3d8e
Revises: f8530a1b2c7d
Create Date: 2026-05-27
"""

from alembic import op
import sqlalchemy as sa


revision = "g9641b2c3d8e"
down_revision = "f8530a1b2c7d"
branch_labels = None
depends_on = None


schedule_source_type = sa.Enum(
    "COURSE_SECTIONS",
    "SECTION_OFFERINGS",
    name="schedulesourcetype",
)


def upgrade() -> None:
    op.add_column(
        "academic_schedules",
        sa.Column(
            "source_type",
            schedule_source_type,
            nullable=False,
            server_default="COURSE_SECTIONS",
        ),
    )
    op.add_column("academic_schedules", sa.Column("academic_period_id", sa.Integer(), nullable=True))
    op.add_column("academic_schedules", sa.Column("academic_program_id", sa.Integer(), nullable=True))
    op.add_column("academic_schedules", sa.Column("curriculum_plan_id", sa.Integer(), nullable=True))
    op.add_column("academic_schedules", sa.Column("generation_strategy", sa.String(length=30), nullable=True))
    op.add_column("academic_schedules", sa.Column("quality_score", sa.Float(), nullable=True))
    op.create_index("ix_academic_schedules_academic_period_id", "academic_schedules", ["academic_period_id"])
    op.create_index("ix_academic_schedules_academic_program_id", "academic_schedules", ["academic_program_id"])
    op.create_index("ix_academic_schedules_curriculum_plan_id", "academic_schedules", ["curriculum_plan_id"])
    op.create_foreign_key(
        "fk_schedule_academic_period",
        "academic_schedules",
        "academic_periods",
        ["academic_period_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_foreign_key(
        "fk_schedule_academic_program",
        "academic_schedules",
        "academic_programs",
        ["academic_program_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_foreign_key(
        "fk_schedule_curriculum_plan",
        "academic_schedules",
        "curriculum_plans",
        ["curriculum_plan_id"],
        ["id"],
        ondelete="SET NULL",
    )

    op.alter_column("schedule_blocks", "section_id", existing_type=sa.Integer(), nullable=True)
    op.add_column("schedule_blocks", sa.Column("section_offering_id", sa.Integer(), nullable=True))
    op.add_column("schedule_blocks", sa.Column("section_requirement_id", sa.Integer(), nullable=True))
    op.add_column("schedule_blocks", sa.Column("conflict_notes", sa.Text(), nullable=True))
    op.add_column("schedule_blocks", sa.Column("quality_score", sa.Float(), nullable=True))
    op.create_index("ix_schedule_blocks_section_offering_id", "schedule_blocks", ["section_offering_id"])
    op.create_index("ix_schedule_blocks_section_requirement_id", "schedule_blocks", ["section_requirement_id"])
    op.create_foreign_key(
        "fk_block_section_offering",
        "schedule_blocks",
        "section_offerings",
        ["section_offering_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_foreign_key(
        "fk_block_section_requirement",
        "schedule_blocks",
        "section_requirements",
        ["section_requirement_id"],
        ["id"],
        ondelete="SET NULL",
    )

    op.add_column("student_course_enrollments", sa.Column("academic_period_id", sa.Integer(), nullable=True))
    op.create_index(
        "ix_student_course_enrollments_academic_period_id",
        "student_course_enrollments",
        ["academic_period_id"],
    )
    op.create_foreign_key(
        "fk_enrollment_academic_period",
        "student_course_enrollments",
        "academic_periods",
        ["academic_period_id"],
        ["id"],
        ondelete="SET NULL",
    )

    op.add_column(
        "student_schedules",
        sa.Column("generation_mode", sa.String(length=30), nullable=False, server_default="EXPLORATION"),
    )


def downgrade() -> None:
    op.drop_column("student_schedules", "generation_mode")

    op.drop_constraint("fk_enrollment_academic_period", "student_course_enrollments", type_="foreignkey")
    op.drop_index("ix_student_course_enrollments_academic_period_id", table_name="student_course_enrollments")
    op.drop_column("student_course_enrollments", "academic_period_id")

    op.drop_constraint("fk_block_section_requirement", "schedule_blocks", type_="foreignkey")
    op.drop_constraint("fk_block_section_offering", "schedule_blocks", type_="foreignkey")
    op.drop_index("ix_schedule_blocks_section_requirement_id", table_name="schedule_blocks")
    op.drop_index("ix_schedule_blocks_section_offering_id", table_name="schedule_blocks")
    op.drop_column("schedule_blocks", "quality_score")
    op.drop_column("schedule_blocks", "conflict_notes")
    op.drop_column("schedule_blocks", "section_requirement_id")
    op.drop_column("schedule_blocks", "section_offering_id")
    op.alter_column("schedule_blocks", "section_id", existing_type=sa.Integer(), nullable=False)

    op.drop_constraint("fk_schedule_curriculum_plan", "academic_schedules", type_="foreignkey")
    op.drop_constraint("fk_schedule_academic_program", "academic_schedules", type_="foreignkey")
    op.drop_constraint("fk_schedule_academic_period", "academic_schedules", type_="foreignkey")
    op.drop_index("ix_academic_schedules_curriculum_plan_id", table_name="academic_schedules")
    op.drop_index("ix_academic_schedules_academic_program_id", table_name="academic_schedules")
    op.drop_index("ix_academic_schedules_academic_period_id", table_name="academic_schedules")
    op.drop_column("academic_schedules", "quality_score")
    op.drop_column("academic_schedules", "generation_strategy")
    op.drop_column("academic_schedules", "curriculum_plan_id")
    op.drop_column("academic_schedules", "academic_program_id")
    op.drop_column("academic_schedules", "academic_period_id")
    op.drop_column("academic_schedules", "source_type")
