"""add institutional students and academic history

Revision ID: k2085f6a7b2c
Revises: j1974e5f6a1b
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "k2085f6a7b2c"
down_revision: str | None = "j1974e5f6a1b"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    enrollment_status = sa.Enum(
        "ENROLLED",
        "RESERVED",
        "GRADUATED",
        "WITHDRAWN",
        "SUSPENDED",
        name="studentenrollmentstatus",
    )
    history_status = sa.Enum(
        "APPROVED",
        "FAILED",
        "IN_PROGRESS",
        "WITHDRAWN",
        "PENDING_REVIEW",
        name="studentacademichistorystatus",
    )

    with op.batch_alter_table("students") as batch_op:
        batch_op.add_column(sa.Column("academic_program_id", sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column("curriculum_plan_id", sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column("campus_id", sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column("admission_period_id", sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column("max_credits_allowed", sa.Integer(), nullable=True))
        batch_op.add_column(
            sa.Column("enrollment_status", enrollment_status, nullable=False, server_default="ENROLLED")
        )
        batch_op.add_column(sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()))
        batch_op.create_foreign_key(
            "fk_students_academic_program_id", "academic_programs", ["academic_program_id"], ["id"], ondelete="SET NULL"
        )
        batch_op.create_foreign_key(
            "fk_students_curriculum_plan_id", "curriculum_plans", ["curriculum_plan_id"], ["id"], ondelete="SET NULL"
        )
        batch_op.create_foreign_key("fk_students_campus_id", "campuses", ["campus_id"], ["id"], ondelete="SET NULL")
        batch_op.create_foreign_key(
            "fk_students_admission_period_id", "academic_periods", ["admission_period_id"], ["id"], ondelete="SET NULL"
        )
        batch_op.create_index("ix_students_academic_program_id", ["academic_program_id"])
        batch_op.create_index("ix_students_curriculum_plan_id", ["curriculum_plan_id"])
        batch_op.create_index("ix_students_campus_id", ["campus_id"])
        batch_op.create_index("ix_students_admission_period_id", ["admission_period_id"])
        batch_op.create_index("ix_students_current_cycle", ["current_cycle"])
        batch_op.create_index("ix_students_enrollment_status", ["enrollment_status"])

    op.execute("UPDATE students SET max_credits_allowed = max_credits WHERE max_credits_allowed IS NULL")
    op.execute(
        """
        UPDATE students s
        JOIN campuses c ON c.name = 'Sede Huancayo'
        SET s.campus_id = c.id
        WHERE s.campus_id IS NULL
        """
    )
    op.execute(
        """
        UPDATE students s
        JOIN academic_programs p
          ON p.name LIKE CONCAT(s.career, '%')
          OR s.career LIKE CONCAT(p.name, '%')
        SET s.academic_program_id = p.id
        WHERE s.academic_program_id IS NULL
        """
    )
    op.execute(
        """
        UPDATE students s
        JOIN curriculum_plans cp
          ON cp.program_id = s.academic_program_id
         AND cp.status = 'ACTIVE'
        SET s.curriculum_plan_id = cp.id
        WHERE s.curriculum_plan_id IS NULL
        """
    )

    op.create_table(
        "student_academic_history",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("student_id", sa.Integer(), nullable=False),
        sa.Column("course_id", sa.Integer(), nullable=False),
        sa.Column("academic_period_id", sa.Integer(), nullable=True),
        sa.Column("status", history_status, nullable=False),
        sa.Column("grade", sa.Float(), nullable=True),
        sa.Column("attempt_number", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("credits", sa.Integer(), nullable=True),
        sa.Column("observation", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["academic_period_id"], ["academic_periods.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["course_id"], ["courses.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["student_id"], ["students.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "student_id",
            "course_id",
            "academic_period_id",
            "attempt_number",
            name="uq_student_history_course_period_attempt",
        ),
    )
    op.create_index("ix_student_academic_history_id", "student_academic_history", ["id"])
    op.create_index("ix_student_academic_history_student_id", "student_academic_history", ["student_id"])
    op.create_index("ix_student_academic_history_course_id", "student_academic_history", ["course_id"])
    op.create_index("ix_student_academic_history_academic_period_id", "student_academic_history", ["academic_period_id"])
    op.create_index("ix_student_academic_history_status", "student_academic_history", ["status"])
    op.create_index("ix_student_academic_history_student_course", "student_academic_history", ["student_id", "course_id"])
    op.create_index("ix_student_academic_history_student_status", "student_academic_history", ["student_id", "status"])


def downgrade() -> None:
    op.drop_table("student_academic_history")
    with op.batch_alter_table("students") as batch_op:
        batch_op.drop_index("ix_students_enrollment_status")
        batch_op.drop_index("ix_students_current_cycle")
        batch_op.drop_index("ix_students_admission_period_id")
        batch_op.drop_index("ix_students_campus_id")
        batch_op.drop_index("ix_students_curriculum_plan_id")
        batch_op.drop_index("ix_students_academic_program_id")
        batch_op.drop_constraint("fk_students_admission_period_id", type_="foreignkey")
        batch_op.drop_constraint("fk_students_campus_id", type_="foreignkey")
        batch_op.drop_constraint("fk_students_curriculum_plan_id", type_="foreignkey")
        batch_op.drop_constraint("fk_students_academic_program_id", type_="foreignkey")
        batch_op.drop_column("is_active")
        batch_op.drop_column("enrollment_status")
        batch_op.drop_column("max_credits_allowed")
        batch_op.drop_column("admission_period_id")
        batch_op.drop_column("campus_id")
        batch_op.drop_column("curriculum_plan_id")
        batch_op.drop_column("academic_program_id")
