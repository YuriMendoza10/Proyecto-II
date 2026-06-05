from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    Integer,
    MetaData,
    Numeric,
    String,
    Table,
    create_engine,
    select,
)

from app.core.config import settings


engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)

metadata = MetaData()
metadata.reflect(bind=engine)

academic_schedules = metadata.tables["academic_schedules"]


def pick_enum_value(column, preferred_values):
    enum_values = getattr(column.type, "enums", None)

    if not enum_values:
        return None

    for preferred in preferred_values:
        for enum_value in enum_values:
            if str(enum_value).upper() == str(preferred).upper():
                return enum_value

    return enum_values[0]


def default_value_for_column(column):
    name = column.name.lower()

    enum_value = pick_enum_value(
        column,
        [
            "INSTITUTIONAL",
            "ACADEMIC",
            "GENERAL",
            "REGULAR",
            "AUTO",
            "GENERATED",
            "CSP",
            "DRAFT",
            "ACTIVE",
            "PENDING",
        ],
    )

    if enum_value is not None:
        return enum_value

    if name in {"created_at", "updated_at"}:
        return datetime.now()

    if isinstance(column.type, Boolean):
        if name in {"is_active"}:
            return True
        if name in {"is_published", "published"}:
            return False
        return False

    if isinstance(column.type, Integer):
        return 0

    if isinstance(column.type, (Float, Numeric)):
        return 0

    if isinstance(column.type, DateTime):
        return datetime.now()

    if isinstance(column.type, String):
        if name in {"name", "title"}:
            return "Horario Institucional Ingeniería de Sistemas 2026-1"

        if name in {"academic_period", "period"}:
            return "2026-1"

        if name == "schedule_type":
            return "INSTITUTIONAL"

        if name == "status":
            return "DRAFT"

        if name == "career":
            return "Ingeniería de Sistemas"

        return "N/A"

    return None


def only_existing_columns(table, data):
    clean_data = {
        key: value
        for key, value in data.items()
        if key in table.c
    }

    for column in table.c:
        if column.primary_key:
            continue

        if column.name in clean_data:
            if clean_data[column.name] is None and not column.nullable:
                clean_data[column.name] = default_value_for_column(column)
            continue

        if column.nullable:
            continue

        if column.default is not None or column.server_default is not None:
            continue

        clean_data[column.name] = default_value_for_column(column)

    return clean_data


def apply_enum_values(table, data):
    if "schedule_type" in table.c:
        selected_type = pick_enum_value(
            table.c.schedule_type,
            [
                "INSTITUTIONAL",
                "ACADEMIC",
                "GENERAL",
                "REGULAR",
                "AUTO",
                "GENERATED",
                "CSP",
            ],
        )

        if selected_type is not None:
            data["schedule_type"] = selected_type

    if "status" in table.c:
        selected_status = pick_enum_value(
            table.c.status,
            [
                "DRAFT",
                "ACTIVE",
                "PENDING",
                "CREATED",
                "GENERATED",
            ],
        )

        if selected_status is not None:
            data["status"] = selected_status

    return data


def find_existing_schedule(conn):
    if "name" in academic_schedules.c:
        return (
            conn.execute(
                select(academic_schedules).where(
                    academic_schedules.c.name
                    == "Horario Institucional Ingeniería de Sistemas 2026-1"
                )
            )
            .mappings()
            .first()
        )

    if "academic_period" in academic_schedules.c:
        return (
            conn.execute(
                select(academic_schedules).where(
                    academic_schedules.c.academic_period == "2026-1"
                )
            )
            .mappings()
            .first()
        )

    return conn.execute(select(academic_schedules).limit(1)).mappings().first()


def main():
    data = {
        "name": "Horario Institucional Ingeniería de Sistemas 2026-1",
        "title": "Horario Institucional Ingeniería de Sistemas 2026-1",
        "academic_period": "2026-1",
        "period": "2026-1",
        "career": "Ingeniería de Sistemas",
        "schedule_type": "INSTITUTIONAL",
        "status": "DRAFT",
        "score": 0,
        "is_active": True,
        "is_published": False,
        "published": False,
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
    }

    data = apply_enum_values(academic_schedules, data)

    with engine.begin() as conn:
        existing = find_existing_schedule(conn)

        if existing:
            print("Ya existe un horario institucional base.")
            print(f"schedule_id = {existing['id']}")
            print("")
            print("Puedes usar ese ID para el diagnóstico CSP y generación institucional.")
            return

        clean_data = only_existing_columns(academic_schedules, data)

        result = conn.execute(
            academic_schedules.insert().values(**clean_data)
        )

        schedule_id = result.inserted_primary_key[0]

        print("Horario institucional base creado correctamente.")
        print(f"schedule_id = {schedule_id}")
        print("")
        print("Siguiente paso:")
        print("1. Usar este schedule_id en el diagnóstico CSP.")
        print("2. Generar bloques institucionales con el motor CSP.")
        print("3. Publicar el horario.")
        print("4. Probar el flujo estudiantil.")


if __name__ == "__main__":
    main()