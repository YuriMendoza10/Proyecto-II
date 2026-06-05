# Base De Datos

OptiAcademic utiliza MySQL como sistema relacional de persistencia. SQLAlchemy
define los modelos del backend y Alembic controla la evolucion del esquema.

## Entidades Principales

- Usuarios y roles.
- Perfiles de estudiante y docente.
- Cursos, secciones y aulas.
- Horarios academicos y bloques.
- Horarios personales de estudiantes.
- Metricas de impacto ambiental.

## Migraciones

Desde `backend/` en instalacion manual:

```powershell
alembic upgrade head
```

En Docker:

```powershell
docker compose --env-file .docker.env exec backend alembic upgrade head
```

## Datos De Demostracion

```powershell
docker compose --env-file .docker.env exec backend python seed_realistic_demo.py
```

Los scripts de seed son para desarrollo y demostracion, no para cargar datos
reales de una institucion.

## Seguridad

Las credenciales MySQL se definen localmente en `.env` o `.docker.env`.
Ningun archivo con contrasenas reales debe versionarse.
# Oferta Academica Por Periodo

La Fase 2 agrega tres tablas aditivas:

| Tabla | Proposito |
| --- | --- |
| `section_offerings` | Seccion ofertada desde un curso de malla para un periodo. |
| `section_requirements` | Necesidades de aula/equipamiento de una seccion. |
| `offering_conflicts` | Hallazgos de validacion y su resolucion. |

`section_offerings` evita duplicados mediante la combinacion unica
`academic_period_id + curriculum_course_id + section_code`. Los campos de
capacidad y estudiantes estimados son no negativos y el ciclo se limita a
`1..10` para el plan ISI inicial.

La migracion es
`f8530a1b2c7d_add_academic_offerings_domain.py` y depende del dominio
curricular de Fase 1.
## Extension Fase 3

`academic_schedules.source_type` identifica horarios basados en `COURSE_SECTIONS` o `SECTION_OFFERINGS`. Los horarios originados en ofertas guardan periodo, programa, plan, estrategia y score; sus bloques usan `schedule_blocks.section_offering_id`.

`student_course_enrollments.academic_period_id` enlaza de forma aditiva los cursos asignados con el periodo academico, preservando `academic_period` para compatibilidad. `student_schedules.generation_mode=ENROLLMENTS` identifica horarios personales creados desde asignaciones institucionales.

## Solicitudes de cambio docente

`schedule_change_requests` enlaza opcionalmente docente, bloque publicado, oferta y periodo. Registra tipo, franja actual/solicitada, razon, estado y respuesta de coordinacion. La tabla es trazabilidad de decisiones: no dispara modificaciones automaticas del horario.

## Reportes De Fase 5

La Fase 5 no incorpora tablas ni migraciones: agrega consultas agregadas
sobre periodos, ofertas, horarios, bloques, docentes, aulas, estudiantes,
solicitudes de cambio y metricas ambientales. Los reportes conservan los
datos operativos como fuente unica y no duplican indicadores persistidos.

## Notificaciones Y Trazabilidad De Fase 6

La migracion `i0863d4e5f0a_add_notifications_audit_traceability.py` es
aditiva e incorpora:

| Tabla | Relacion principal |
| --- | --- |
| `notifications` | `user_id -> users.id`; avisos privados y lectura. |
| `audit_logs` | `user_id -> users.id`; eventos criticos con JSON sanitizado. |
| `schedule_publication_history` | Horario, periodo y usuario publicador. |
| `schedule_change_history` | Solicitud, horario, bloque y usuario ejecutor. |

Se indexan destinatario/estado de lectura, usuario/entidad/fecha de auditoria
y las referencias de historiales para consultas operativas.
