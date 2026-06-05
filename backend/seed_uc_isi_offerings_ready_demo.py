from app.core.database import SessionLocal
from app.services.demo_preparation_service import DemoPreparationService


def main():
    db = SessionLocal()
    try:
        result = DemoPreparationService(db).prepare_institutional_csp(
            {
                "cycles": "all",
                "status_target": "APPROVED",
                "create_missing_offerings": True,
                "create_missing_teachers": True,
                "create_missing_classrooms": True,
                "fix_existing_offerings": True,
            }
        )
        print("Preparacion demo CSP institucional")
        print(f"Success: {result.get('success')}")
        print(f"Periodo: {result.get('period')}")
        print(f"Programa: {result.get('program')}")
        print(f"Plan: {result.get('plan')}")
        print(f"Ciclos preparados: {result.get('cycles_prepared')}")
        print(f"Ofertas revisadas: {result.get('offerings_reviewed')}")
        print(f"Ofertas creadas: {result.get('offerings_created')}")
        print(f"Ofertas actualizadas: {result.get('offerings_updated')}")
        print(f"Ofertas APPROVED: {result.get('offerings_approved')}")
        print(f"Docentes asignados: {result.get('teachers_assigned')}")
        print(f"Aulas asignadas: {result.get('classrooms_assigned')}")
        print(f"Docentes creados: {result.get('created_teachers')}")
        print(f"Aulas creadas: {result.get('created_classrooms')}")
        print(f"Disponibilidades creadas: {result.get('teacher_availability_created')}")
        print(f"Warnings: {result.get('warnings')}")
        print(f"Errors: {result.get('errors')}")
        if not result.get("success"):
            raise RuntimeError(result.get("message") or "Preparacion demo incompleta.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
