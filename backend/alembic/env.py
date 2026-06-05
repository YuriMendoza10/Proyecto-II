from logging.config import fileConfig
from pathlib import Path
import sys

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# ============================================================
# Permitir que Alembic encuentre la carpeta app/
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[1]
sys.path.append(str(BASE_DIR))

# ============================================================
# Importar configuración y modelos del proyecto
# ============================================================

from app.core.config import settings
from app.core.database import Base

from app.models import (
    User,
    Student,
    StudentCourseEnrollment,
    StudentAcademicHistory,
    Teacher,
    TeacherAvailability,
    Course,
    CourseSection,
    Classroom,
    AcademicSchedule,
    EnvironmentalMetric,
    ScheduleBlock,
    StudentSchedule,
    StudentScheduleBlock,
    AcademicPeriod,
    AcademicProgram,
    Campus,
    Faculty,
    CurriculumPlan,
    CurriculumCourse,
    CoursePrerequisite,
    ElectiveBankCourse,
    SectionOffering,
    SectionRequirement,
    OfferingConflict,
    ScheduleChangeRequest,
    Notification,
    AuditLog,
    SchedulePublicationHistory,
    ScheduleChangeHistory,
)

# ============================================================
# Configuración de Alembic
# ============================================================

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Metadata de SQLAlchemy
target_metadata = Base.metadata

# Usar DATABASE_URL desde .env
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)


def run_migrations_offline() -> None:
    """
    Ejecuta migraciones en modo offline.
    """
    url = config.get_main_option("sqlalchemy.url")

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={
            "paramstyle": "named",
        },
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """
    Ejecuta migraciones en modo online.
    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
