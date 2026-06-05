from app.core.database import SessionLocal
from app.models.academic import AcademicProgram, Campus, Faculty
from app.models.classroom import Classroom
from app.models.offering import SectionOffering
from app.models.schedule import AcademicSchedule


FACULTIES = (
    ("ING", "Facultad de Ingeniería"),
    ("SALUD", "Facultad de Ciencias de la Salud"),
    ("EMPRESA", "Facultad de Ciencias de la Empresa"),
    ("DERECHO", "Facultad de Derecho"),
    ("HUM", "Facultad de Humanidades"),
)


def ensure_huancayo_base(db):
    campus = db.query(Campus).filter(Campus.name == "Sede Huancayo").first()
    if not campus:
        campus = Campus(name="Sede Huancayo", city="Huancayo", is_active=True)
        db.add(campus)
        db.flush()

    faculties = {}
    for code, name in FACULTIES:
        faculty = db.query(Faculty).filter(Faculty.code == code).first()
        if not faculty:
            faculty = Faculty(code=code, name=name, is_active=True)
            db.add(faculty)
            db.flush()
        faculties[code] = faculty

    programs = db.query(AcademicProgram).all()
    for program in programs:
        if not program.campus_id:
            program.campus_id = campus.id
        if not program.faculty_id and program.faculty and "Ingenier" in program.faculty:
            program.faculty_id = faculties["ING"].id

    for classroom in db.query(Classroom).all():
        if not classroom.campus_id:
            classroom.campus_id = campus.id

    for offering in db.query(SectionOffering).all():
        if not offering.campus_id:
            offering.campus_id = campus.id

    for schedule in db.query(AcademicSchedule).all():
        if not schedule.campus_id:
            schedule.campus_id = campus.id
        if not schedule.faculty_id and schedule.academic_program and schedule.academic_program.faculty_id:
            schedule.faculty_id = schedule.academic_program.faculty_id

    db.commit()
    return {
        "campus": campus.name,
        "faculties": len(faculties),
        "programs_backfilled": sum(program.campus_id == campus.id for program in programs),
        "classrooms_backfilled": db.query(Classroom).filter(Classroom.campus_id == campus.id).count(),
        "offerings_backfilled": db.query(SectionOffering).filter(SectionOffering.campus_id == campus.id).count(),
        "schedules_backfilled": db.query(AcademicSchedule).filter(AcademicSchedule.campus_id == campus.id).count(),
    }


if __name__ == "__main__":
    session = SessionLocal()
    try:
        print(ensure_huancayo_base(session))
    finally:
        session.close()
