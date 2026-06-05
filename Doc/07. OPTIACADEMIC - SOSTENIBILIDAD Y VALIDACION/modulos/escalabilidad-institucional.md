# Escalabilidad Institucional Huancayo

## Alcance De La Fase 10

La Fase 10 agrega la base institucional mínima para evolucionar OptiAcademic
hacia varias facultades y carreras dentro de una única sede: **Sede Huancayo**.
No implementa multi-sede ni reemplaza el flujo CSP existente.

## Nuevas Entidades

- `campuses`: registra Sede Huancayo como base territorial.
- `faculties`: registra las facultades institucionales.

Los programas académicos, aulas, ofertas y horarios incorporan relaciones
opcionales hacia sede o facultad. Los campos de texto anteriores se conservan
para mantener compatibilidad con seeds, pantallas y flujos legacy.

## Compatibilidad

La migración realiza un backfill progresivo:

- vincula programas existentes con Sede Huancayo;
- vincula aulas, ofertas y horarios existentes con Sede Huancayo;
- asocia programas cuyo texto de facultad contiene `Ingenier` con la Facultad
  de Ingeniería;
- conserva `academic_programs.faculty`, `classrooms.campus` y
  `students.career`.

Los endpoints CSP modernos y legacy, la publicación segura, los reportes, la
auditoría y las notificaciones continúan disponibles sin cambios de contrato.

## Endpoints

Las consultas de facultades y sedes están disponibles para `ADMIN`,
`COORDINATOR` y `TEACHER`. La escritura corresponde exclusivamente a `ADMIN`.

```text
/api/v1/faculties
/api/v1/campuses
```

## Alcance De La Fase 11

La Fase 11 agrega estudiantes institucionales e historial académico sin
calcular todavía demanda, proyección de NRC ni CSP masivo. Conserva los campos
legacy, incluido `students.career`, y suma relaciones nullable hacia sede,
programa, plan curricular y período de admisión.

El historial se guarda en `student_academic_history` y admite los estados
`APPROVED`, `FAILED`, `IN_PROGRESS`, `WITHDRAWN` y `PENDING_REVIEW`.

```text
/api/v1/student-academic-history
/api/v1/students/{student_id}/academic-summary
```

## Próximos Pasos

La Fase 12 podrá usar esta base para calcular demanda estudiantil y proyección
académica. La disponibilidad institucional y la generación CSP masiva por
particiones siguen fuera del alcance de esta fase.
