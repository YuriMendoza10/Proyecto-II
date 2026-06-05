"""add Huancayo institutional base

Revision ID: j1974e5f6a1b
Revises: i0863d4e5f0a
"""

from alembic import op
import sqlalchemy as sa


revision = "j1974e5f6a1b"
down_revision = "i0863d4e5f0a"
branch_labels = None
depends_on = None


FACULTIES = (
    ("ING", "Facultad de Ingeniería"),
    ("SALUD", "Facultad de Ciencias de la Salud"),
    ("EMPRESA", "Facultad de Ciencias de la Empresa"),
    ("DERECHO", "Facultad de Derecho"),
    ("HUM", "Facultad de Humanidades"),
)


def upgrade() -> None:
    op.create_table(
        "faculties",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=180), nullable=False),
        sa.Column("code", sa.String(length=30), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("1")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("code", name="uq_faculties_code"),
        sa.UniqueConstraint("name", name="uq_faculties_name"),
    )
    op.create_index("ix_faculties_code", "faculties", ["code"])
    op.create_index("ix_faculties_id", "faculties", ["id"])

    op.create_table(
        "campuses",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=180), nullable=False),
        sa.Column("city", sa.String(length=120), nullable=False),
        sa.Column("address", sa.String(length=240), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("1")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name", name="uq_campuses_name"),
    )
    op.create_index("ix_campuses_id", "campuses", ["id"])

    op.add_column("academic_programs", sa.Column("faculty_id", sa.Integer(), nullable=True))
    op.add_column("academic_programs", sa.Column("campus_id", sa.Integer(), nullable=True))
    op.create_index("ix_academic_programs_faculty_id", "academic_programs", ["faculty_id"])
    op.create_index("ix_academic_programs_campus_id", "academic_programs", ["campus_id"])
    op.create_foreign_key(
        "fk_academic_programs_faculty_id", "academic_programs", "faculties",
        ["faculty_id"], ["id"], ondelete="SET NULL",
    )
    op.create_foreign_key(
        "fk_academic_programs_campus_id", "academic_programs", "campuses",
        ["campus_id"], ["id"], ondelete="SET NULL",
    )

    op.add_column("classrooms", sa.Column("campus_id", sa.Integer(), nullable=True))
    op.create_index("ix_classrooms_campus_id", "classrooms", ["campus_id"])
    op.create_foreign_key(
        "fk_classrooms_campus_id", "classrooms", "campuses",
        ["campus_id"], ["id"], ondelete="SET NULL",
    )

    op.add_column("section_offerings", sa.Column("campus_id", sa.Integer(), nullable=True))
    op.create_index("ix_section_offerings_campus_id", "section_offerings", ["campus_id"])
    op.create_foreign_key(
        "fk_section_offerings_campus_id", "section_offerings", "campuses",
        ["campus_id"], ["id"], ondelete="SET NULL",
    )

    op.add_column("academic_schedules", sa.Column("campus_id", sa.Integer(), nullable=True))
    op.add_column("academic_schedules", sa.Column("faculty_id", sa.Integer(), nullable=True))
    op.create_index("ix_academic_schedules_campus_id", "academic_schedules", ["campus_id"])
    op.create_index("ix_academic_schedules_faculty_id", "academic_schedules", ["faculty_id"])
    op.create_index("ix_academic_schedules_status", "academic_schedules", ["status"])
    op.create_foreign_key(
        "fk_academic_schedules_campus_id", "academic_schedules", "campuses",
        ["campus_id"], ["id"], ondelete="SET NULL",
    )
    op.create_foreign_key(
        "fk_academic_schedules_faculty_id", "academic_schedules", "faculties",
        ["faculty_id"], ["id"], ondelete="SET NULL",
    )

    bind = op.get_bind()
    bind.execute(
        sa.text(
            "INSERT INTO campuses (name, city, address, is_active, created_at, updated_at) "
            "VALUES (:name, :city, NULL, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
        ),
        {"name": "Sede Huancayo", "city": "Huancayo"},
    )
    for code, name in FACULTIES:
        bind.execute(
            sa.text(
                "INSERT INTO faculties (name, code, description, is_active, created_at, updated_at) "
                "VALUES (:name, :code, NULL, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
            ),
            {"name": name, "code": code},
        )

    bind.execute(
        sa.text(
            "UPDATE academic_programs "
            "SET campus_id = (SELECT id FROM campuses WHERE name = 'Sede Huancayo' LIMIT 1) "
            "WHERE campus_id IS NULL"
        )
    )
    bind.execute(
        sa.text(
            "UPDATE academic_programs "
            "SET faculty_id = (SELECT id FROM faculties WHERE code = 'ING' LIMIT 1) "
            "WHERE faculty_id IS NULL AND faculty LIKE '%Ingenier%'"
        )
    )
    bind.execute(
        sa.text(
            "UPDATE classrooms "
            "SET campus_id = (SELECT id FROM campuses WHERE name = 'Sede Huancayo' LIMIT 1) "
            "WHERE campus_id IS NULL"
        )
    )
    bind.execute(
        sa.text(
            "UPDATE section_offerings "
            "SET campus_id = (SELECT id FROM campuses WHERE name = 'Sede Huancayo' LIMIT 1) "
            "WHERE campus_id IS NULL"
        )
    )
    bind.execute(
        sa.text(
            "UPDATE academic_schedules "
            "SET campus_id = (SELECT id FROM campuses WHERE name = 'Sede Huancayo' LIMIT 1) "
            "WHERE campus_id IS NULL"
        )
    )
    bind.execute(
        sa.text(
            "UPDATE academic_schedules s "
            "JOIN academic_programs p ON p.id = s.academic_program_id "
            "SET s.faculty_id = p.faculty_id "
            "WHERE s.faculty_id IS NULL AND p.faculty_id IS NOT NULL"
        )
    )


def downgrade() -> None:
    op.drop_constraint("fk_academic_schedules_faculty_id", "academic_schedules", type_="foreignkey")
    op.drop_constraint("fk_academic_schedules_campus_id", "academic_schedules", type_="foreignkey")
    op.drop_index("ix_academic_schedules_status", table_name="academic_schedules")
    op.drop_index("ix_academic_schedules_faculty_id", table_name="academic_schedules")
    op.drop_index("ix_academic_schedules_campus_id", table_name="academic_schedules")
    op.drop_column("academic_schedules", "faculty_id")
    op.drop_column("academic_schedules", "campus_id")

    op.drop_constraint("fk_section_offerings_campus_id", "section_offerings", type_="foreignkey")
    op.drop_index("ix_section_offerings_campus_id", table_name="section_offerings")
    op.drop_column("section_offerings", "campus_id")

    op.drop_constraint("fk_classrooms_campus_id", "classrooms", type_="foreignkey")
    op.drop_index("ix_classrooms_campus_id", table_name="classrooms")
    op.drop_column("classrooms", "campus_id")

    op.drop_constraint("fk_academic_programs_campus_id", "academic_programs", type_="foreignkey")
    op.drop_constraint("fk_academic_programs_faculty_id", "academic_programs", type_="foreignkey")
    op.drop_index("ix_academic_programs_campus_id", table_name="academic_programs")
    op.drop_index("ix_academic_programs_faculty_id", table_name="academic_programs")
    op.drop_column("academic_programs", "campus_id")
    op.drop_column("academic_programs", "faculty_id")

    op.drop_table("campuses")
    op.drop_table("faculties")
