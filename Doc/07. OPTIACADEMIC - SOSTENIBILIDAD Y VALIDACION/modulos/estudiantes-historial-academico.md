# Estudiantes Institucionales E Historial Académico

## Objetivo

La Fase 11 prepara la base estudiantil de Sede Huancayo para la futura Fase 12
de demanda y proyección académica. No implementa cálculo de demanda ni CSP
masivo.

## Perfil Institucional

La tabla `students` conserva los campos legacy y agrega relaciones nullable:

- `academic_program_id`
- `curriculum_plan_id`
- `campus_id`
- `admission_period_id`
- `current_cycle`
- `enrollment_status`
- `max_credits_allowed`
- `is_active`

Los estados de matrícula son `ENROLLED`, `RESERVED`, `GRADUATED`, `WITHDRAWN`
y `SUSPENDED`.

## Historial Académico

`student_academic_history` registra curso, período opcional, estado, nota,
intento, créditos y observación. Sus estados son `APPROVED`, `FAILED`,
`IN_PROGRESS`, `WITHDRAWN` y `PENDING_REVIEW`.

## API

```text
GET    /api/v1/student-academic-history
GET    /api/v1/student-academic-history/{id}
POST   /api/v1/student-academic-history
PATCH  /api/v1/student-academic-history/{id}
DELETE /api/v1/student-academic-history/{id}
POST   /api/v1/student-academic-history/bulk
GET    /api/v1/students/{student_id}/academic-summary
GET    /api/v1/students/me/academic-summary
```

## Demo

```powershell
docker compose --env-file .env.docker.example exec backend python seed_huancayo_students_history_demo.py
```

El seed es idempotente y crea una muestra de 150 estudiantes. Distribuye los
perfiles entre los planes activos disponibles y registra historial parcial con
cursos aprobados, desaprobados y en progreso.
