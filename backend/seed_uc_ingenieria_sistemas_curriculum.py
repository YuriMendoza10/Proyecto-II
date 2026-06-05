from app.core.database import SessionLocal
from app.models.academic import (
    AcademicPeriod,
    AcademicPeriodStatus,
    AcademicProgram,
    AcademicProgramStatus,
    CoursePrerequisite,
    CurriculumCourse,
    CurriculumCourseType,
    CurriculumPlan,
    CurriculumPlanStatus,
    ElectiveArea,
    ElectiveBankCourse,
    PrerequisiteType,
)
from app.models.course import Course


PROGRAM_NAME = "Ingeniería de Sistemas e Informática"
PROGRAM_DISPLAY_NAME = "Ingeniería de Sistemas e Informática"
SOURCE_NOTE = "Malla base proporcionada por usuario; electivos sugeridos editables"

CURRICULUM = {
    1: [
        ("Comprensión y Producción de Textos 1", 3, "REQUIRED", False),
        ("Laboratorio de Liderazgo e Innovación", 3, "REQUIRED", False),
        ("Estrategias y Herramientas Digitales para el Aprendizaje", 4, "REQUIRED", False),
        ("Matemática Básica", 4, "REQUIRED", False),
        ("Matemática Discreta 1", 4, "REQUIRED", False),
        ("Técnicas de Programación", 2, "REQUIRED", False),
        ("Introducción a la Ingeniería de Sistemas e Informática", 3, "REQUIRED", False),
    ],
    2: [
        ("Comprensión y Producción de Textos 2", 4, "REQUIRED", False),
        ("Ética, Ciudadanía y Tecnología", 3, "GENERAL_ELECTIVE", True),
        ("Álgebra Lineal y Geometría Analítica", 4, "REQUIRED", False),
        ("Modelado de Negocios", 3, "REQUIRED", False),
        ("Matemática Superior", 4, "REQUIRED", False),
        ("Matemática Discreta 2", 4, "REQUIRED", False),
        ("Programación Orientada a Objetos", 2, "REQUIRED", False),
    ],
    3: [
        ("Estadística y Probabilidades", 4, "REQUIRED", False),
        ("Realidad Nacional y Globalización", 3, "GENERAL_ELECTIVE", True),
        ("Laboratorio de Liderazgo e Innovación Intermedio", 2, "REQUIRED", False),
        ("Cálculo Diferencial", 4, "REQUIRED", False),
        ("Física 1", 4, "REQUIRED", False),
        ("Base de Datos 1", 3, "REQUIRED", False),
        ("Diseño Web", 2, "REQUIRED", False),
        ("Estructura de Datos", 2, "REQUIRED", False),
    ],
    4: [
        ("Creatividad y Emprendimiento Digital", 3, "GENERAL_ELECTIVE", True),
        ("Sostenibilidad y Medio Ambiente", 3, "GENERAL_ELECTIVE", True),
        ("English Course 1", 3, "REQUIRED", False),
        ("Cálculo Integral", 4, "REQUIRED", False),
        ("Física Electromagnética", 4, "REQUIRED", False),
        ("Análisis y Diseño de Software", 4, "REQUIRED", False),
        ("Programación Web", 2, "REQUIRED", False),
    ],
    5: [
        ("English Course 2", 3, "REQUIRED", False),
        ("Laboratorio de Liderazgo e Innovación Avanzado", 3, "REQUIRED", False),
        ("Ecuaciones Diferenciales", 4, "REQUIRED", False),
        ("Estadística para Ingeniería", 3, "REQUIRED", False),
        ("Desarrollo de Aplicaciones Web", 2, "REQUIRED", False),
        ("Base de Datos 2", 3, "REQUIRED", False),
        ("Arquitectura del Computador", 3, "REQUIRED", False),
    ],
    6: [
        ("Investigación Académica", 3, "REQUIRED", False),
        ("English Course 3", 3, "REQUIRED", False),
        ("Investigación Operativa 1", 4, "REQUIRED", False),
        ("Métodos Numéricos", 4, "REQUIRED", False),
        ("Desarrollo de Videojuegos", 4, "REQUIRED", False),
        ("Sistemas Operativos", 4, "REQUIRED", False),
    ],
    7: [
        ("English Course 4", 3, "REQUIRED", False),
        ("Taller de Oratoria y Comunicación Efectiva", 1, "GENERAL_ELECTIVE", True),
        ("Ingeniería Económica", 3, "REQUIRED", False),
        ("Redes de Computadoras", 4, "REQUIRED", False),
        ("Ingeniería de Software", 4, "REQUIRED", False),
        ("Proyectos de Innovación", 2, "REQUIRED", False),
        ("Fundamentos de Sistemas Dinámicos y Modelado", 3, "REQUIRED", False),
        ("Construcción y Pruebas de Software", 4, "REQUIRED", False),
    ],
    8: [
        ("Simulación de Procesos", 3, "REQUIRED", False),
        ("Gestión de Proyectos en Ingeniería", 3, "REQUIRED", False),
        ("Conmutación y Enrutamiento", 4, "REQUIRED", False),
        ("Desarrollo de Aplicaciones Móviles", 4, "REQUIRED", False),
        ("Arquitectura de Software", 3, "REQUIRED", False),
        ("Metodologías Ágiles para el Desarrollo de Software", 3, "REQUIRED", False),
    ],
    9: [
        ("DevOps y Despliegue Continuo", 3, "SPECIALTY_ELECTIVE", True),
        ("Taller de Investigación 1 en Ingeniería de Sistemas e Informática", 4, "REQUIRED", False),
        ("Proyectos de Diseño en Ingeniería de Sistemas e Informática", 4, "REQUIRED", False),
        ("Inteligencia de Negocios y Ciencia de Datos", 4, "REQUIRED", False),
        ("Seguridad de la Información", 3, "REQUIRED", False),
        ("Aplicaciones Cloud", 2, "REQUIRED", False),
    ],
    10: [
        ("Taller de Investigación 2 en Ingeniería de Sistemas e Informática", 4, "REQUIRED", False),
        ("Proyectos de Diseño y Desarrollo en Ingeniería de Sistemas e Informática", 4, "REQUIRED", False),
        ("Auditoría de Sistemas", 3, "REQUIRED", False),
        ("Robótica y Machine Learning", 2, "REQUIRED", False),
        ("Planificación y Gestión de Tecnologías de la Información", 3, "REQUIRED", False),
        ("Visión por Computadora y PLN", 3, "SPECIALTY_ELECTIVE", True),
    ],
}

RECOMMENDED_PREREQUISITES = [
    ("Comprensión y Producción de Textos 2", "Comprensión y Producción de Textos 1"),
    ("Matemática Discreta 2", "Matemática Discreta 1"),
    ("Programación Orientada a Objetos", "Técnicas de Programación"),
    ("Base de Datos 2", "Base de Datos 1"),
    ("Programación Web", "Diseño Web"),
    ("Desarrollo de Aplicaciones Web", "Programación Web"),
    ("English Course 2", "English Course 1"),
    ("English Course 3", "English Course 2"),
    ("English Course 4", "English Course 3"),
    (
        "Taller de Investigación 2 en Ingeniería de Sistemas e Informática",
        "Taller de Investigación 1 en Ingeniería de Sistemas e Informática",
    ),
]

ELECTIVE_BANK = [
    ("Mención IA y Data Science", "Deep Learning y Redes Neuronales", 3, ElectiveArea.IA_DATA),
    ("Mención IA y Data Science", "Big Data y Arquitecturas de Datos", 3, ElectiveArea.IA_DATA),
    (
        "Mención Ciberseguridad Avanzada",
        "Hacking Ético y Pruebas de Penetración",
        3,
        ElectiveArea.CYBERSECURITY,
    ),
    (
        "Mención Ciberseguridad Avanzada",
        "Análisis Forense Digital e Incidentes",
        3,
        ElectiveArea.CYBERSECURITY,
    ),
    (
        "Mención Gestión de TI y Transformación Digital",
        "Gobierno de TI y Marcos de Trabajo COBIT/ITIL",
        3,
        ElectiveArea.MANAGEMENT,
    ),
    (
        "Mención Gestión de TI y Transformación Digital",
        "E-Commerce y Marketing Digital para Ingenieros",
        3,
        ElectiveArea.MANAGEMENT,
    ),
]


def get_or_create(db, model, filters, defaults):
    item = db.query(model).filter_by(**filters).first()
    if item:
        for field, value in defaults.items():
            setattr(item, field, value)
        return item
    item = model(**filters, **defaults)
    db.add(item)
    db.flush()
    return item


def seed_curriculum():
    db = SessionLocal()
    try:
        get_or_create(
            db,
            AcademicPeriod,
            {"code": "2026-I"},
            {
                "name": "Periodo Académico 2026-I",
                "status": AcademicPeriodStatus.ACTIVE,
                "is_active": True,
            },
        )
        program = get_or_create(
            db,
            AcademicProgram,
            {"code": "ISI"},
            {
                "name": PROGRAM_DISPLAY_NAME,
                "university": "Universidad Continental",
                "status": AcademicProgramStatus.ACTIVE,
            },
        )
        plan = get_or_create(
            db,
            CurriculumPlan,
            {"code": "ISI-UC-2026"},
            {
                "program_id": program.id,
                "name": "Plan Curricular Ingeniería de Sistemas e Informática",
                "effective_year": 2026,
                "total_cycles": 10,
                "total_credits": 221,
                "status": CurriculumPlanStatus.ACTIVE,
                "source_note": SOURCE_NOTE,
            },
        )

        curriculum_by_name = {}
        for cycle, courses in CURRICULUM.items():
            for index, (name, credits, course_type, suggested) in enumerate(courses, start=1):
                code = f"ISI-C{cycle:02d}-{index:03d}"
                course = db.query(Course).filter(Course.code == code).first()
                if not course:
                    course = db.query(Course).filter(Course.name == name).first()
                if not course:
                    course = Course(
                        code=code,
                        name=name,
                        credits=credits,
                        cycle=cycle,
                        career=PROGRAM_NAME,
                        weekly_hours=credits,
                        is_active=True,
                    )
                    db.add(course)
                    db.flush()
                curriculum_course = (
                    db.query(CurriculumCourse)
                    .filter(
                        CurriculumCourse.curriculum_plan_id == plan.id,
                        CurriculumCourse.course_id == course.id,
                    )
                    .first()
                )
                if not curriculum_course:
                    curriculum_course = CurriculumCourse(
                        curriculum_plan_id=plan.id,
                        course_id=course.id,
                        cycle_number=cycle,
                        course_type=CurriculumCourseType(course_type),
                        credits=credits,
                        weekly_theory_hours=credits,
                        weekly_practice_hours=0,
                        weekly_lab_hours=0,
                        is_suggested_elective=suggested,
                        is_active=True,
                    )
                    db.add(curriculum_course)
                    db.flush()
                else:
                    curriculum_course.cycle_number = cycle
                    curriculum_course.course_type = CurriculumCourseType(course_type)
                    curriculum_course.credits = credits
                    curriculum_course.is_suggested_elective = suggested
                    curriculum_course.is_active = True
                curriculum_by_name[name] = curriculum_course

        for target_name, prerequisite_name in RECOMMENDED_PREREQUISITES:
            target = curriculum_by_name[target_name]
            prerequisite = curriculum_by_name[prerequisite_name]
            relation = (
                db.query(CoursePrerequisite)
                .filter(
                    CoursePrerequisite.curriculum_course_id == target.id,
                    CoursePrerequisite.prerequisite_course_id == prerequisite.id,
                )
                .first()
            )
            if not relation:
                db.add(
                    CoursePrerequisite(
                        curriculum_course_id=target.id,
                        prerequisite_course_id=prerequisite.id,
                        prerequisite_type=PrerequisiteType.RECOMMENDED,
                    )
                )
            else:
                relation.prerequisite_type = PrerequisiteType.RECOMMENDED

        for mention, course_name, credits, area in ELECTIVE_BANK:
            item = (
                db.query(ElectiveBankCourse)
                .filter(
                    ElectiveBankCourse.curriculum_plan_id == plan.id,
                    ElectiveBankCourse.course_name == course_name,
                )
                .first()
            )
            if not item:
                db.add(
                    ElectiveBankCourse(
                        curriculum_plan_id=plan.id,
                        mention_name=mention,
                        course_name=course_name,
                        credits=credits,
                        area=area,
                        description="Electivo sugerido editable; no acreditado como oficial.",
                        is_active=True,
                    )
                )
            else:
                item.mention_name = mention
                item.credits = credits
                item.area = area
                item.is_active = True

        db.commit()
        course_count = sum(len(items) for items in CURRICULUM.values())
        detail_credits = sum(course[1] for items in CURRICULUM.values() for course in items)
        print("Malla ISI-UC-2026 cargada correctamente.")
        print(f"Cursos de malla: {course_count}; creditos detallados: {detail_credits}.")
        print("Nota: el metadato solicitado del plan conserva total_credits=221.")
        print("Electivos y prerrequisitos RECOMMENDED quedan editables en la aplicacion.")
    finally:
        db.close()


if __name__ == "__main__":
    seed_curriculum()
