# API FastAPI

La API REST se publica bajo `/api/v1`. En desarrollo, su documentacion
interactiva esta disponible en:

```text
http://localhost:8000/docs
```

## Autenticacion

El frontend obtiene un JWT mediante:

```http
POST /api/v1/auth/login-json
```

Las rutas protegidas reciben:

```http
Authorization: Bearer <token>
```

El registro publico es deliberadamente restringido:

```http
POST /api/v1/auth/register
```

Acepta `full_name`, `email` y `password`, y siempre crea un usuario
`STUDENT`. El campo `role` es rechazado. Usuarios con privilegios se crean
solo mediante `/users` autenticado como `ADMIN` o scripts de carga.

## Grupos De Endpoints

| Prefijo | Funcion |
| --- | --- |
| `/auth` | Login, registro y usuario actual. |
| `/users`, `/teachers`, `/students` | Gestion de usuarios y perfiles. |
| `/courses`, `/sections`, `/classrooms` | Catalogo academico. |
| `/schedules`, `/schedule-blocks` | Horarios y bloques. |
| `/institutional-csp`, `/csp-diagnostics` | Generacion y diagnostico CSP. |
| `/student-csp`, `/student-enrollments` | Experiencia estudiante. |
| `/academic-periods`, `/academic-programs` | Periodos y carreras. |
| `/curriculum-plans`, `/curriculum-courses` | Plan curricular y malla por ciclos. |
| `/course-prerequisites`, `/elective-bank-courses` | Reglas y sugerencias editables. |
| `/section-offerings`, `/section-requirements` | Oferta por periodo y requerimientos. |
| `/offering-conflicts`, `/coordinator/dashboard` | Validacion y operacion coordinador. |
| `/dashboard`, `/schedule-quality`, `/data-readiness` | Control administrativo. |
| `/environmental-impact` | Indicadores ambientales. |
| `/sustainability` | Reporte publico GreenFrame. |

## Controles De Fase 0

| Operacion | Regla aplicada |
| --- | --- |
| `PATCH /schedules/{id}/publish` | Compatibilidad: delega al flujo de publicacion segura. |
| `PATCH /schedule-publication/{id}/publish-safe` | Exige readiness sin fallas criticas y calidad publicable. |
| `POST /schedules`, `PUT /schedules/{id}` con `status=PUBLISHED` | Rechazado; no se permite saltar validaciones. |
| `GET /schedules`, `GET /schedules/{id}` para `STUDENT` | Solo horarios institucionales activos `PUBLISHED`. |
| `GET /schedule-blocks*` para `STUDENT` | Solo bloques pertenecientes a horarios institucionales activos `PUBLISHED`. |
| `/teachers/*/availability` para `TEACHER` | Solo el perfil docente asociado al usuario autenticado. |

La migracion `c6217d0e4a12_add_student_course_enrollments` agrega la tabla
de inscripciones por curso y periodo usada por `/student-enrollments`.

## Dominio Académico - Fase 1

| Ruta | Escritura | Regla |
| --- | --- | --- |
| `/academic-periods` | `ADMIN` | Define período vigente. |
| `/academic-programs` | `ADMIN` | Define carrera/programa. |
| `/curriculum-plans` | `ADMIN` | Mantiene versiones de plan. |
| `/curriculum-courses` | `ADMIN`, `COORDINATOR` | Administra cursos, ciclos y electivos sugeridos. |
| `/course-prerequisites` | `ADMIN`, `COORDINATOR` | Administra relaciones editables. |
| `/elective-bank-courses` | `ADMIN`, `COORDINATOR` | Administra alternativas sugeridas. |
| `/students/me/curriculum` | Sin escritura | El estudiante ve solo la malla `ACTIVE`. |
| `/students/me/eligible-courses` | Sin escritura | Solo `REQUIRED` puede bloquear elegibilidad. |

La malla `ISI-UC-2026` es base editable proporcionada por el usuario. Los
electivos y prerrequisitos `RECOMMENDED` cargados no sustituyen confirmación
documental oficial.

## Oferta Academica - Fase 2

| Ruta | Escritura | Regla |
| --- | --- | --- |
| `/section-offerings` | `ADMIN`, `COORDINATOR` | CRUD con filtros de periodo, plan, ciclo, estado y docente. |
| `/section-offerings/bulk-from-curriculum` | `ADMIN`, `COORDINATOR` | Crea secciones `DRAFT` sin duplicar curso/seccion/periodo. |
| `/section-offerings/{id}/status` | `ADMIN`, `COORDINATOR` | Solo publica desde `APPROVED` y tras validacion completa. |
| `/section-requirements` | `ADMIN`, `COORDINATOR` | Requisitos tecnicos de aula. |
| `/offering-conflicts/analyze` | `ADMIN`, `COORDINATOR` | Registra conflictos operativos. |
| `/coordinator/dashboard` | Sin escritura | Resumen del periodo activo. |
| `/section-offerings/published/me` | Sin escritura | Estudiante: solo `PUBLISHED` del periodo activo/ciclo propio. |
| `/institutional-csp/generate-from-offerings` | `ADMIN`, `COORDINATOR` | Valida nueva fuente y conserva fallback actual. |

Las ofertas incompletas pueden permanecer `DRAFT`, pero no pueden aprobarse
ni publicarse. La integracion CSP prepara la fuente sin reemplazar el
generador de `course_sections`.

## Rutas Publicas Destacadas

| Metodo | Ruta | Respuesta |
| --- | --- | --- |
| `GET` | `/api/v1/health` | Estado de API. |
| `GET` | `/api/v1/environmental-impact` | Dashboard HTML ambiental. |
| `GET` | `/api/v1/sustainability` | Reporte GreenFrame o mensaje de ausencia. |

Para contratos de request/response y autorizacion vigente, Swagger es la
referencia ejecutable.
## Fase 3: CSP de ofertas y horarios personales

### Coordinador y administrador

- `POST /api/v1/institutional-csp/generate-from-offerings`: genera soluciones usando solo ofertas `READY`/`APPROVED`; retorna score explicable, resumen docente, uso de aulas y distribucion por ciclo.
- `POST /api/v1/institutional-csp/save-offering-solution`: guarda la alternativa seleccionada como horario institucional `DRAFT` con bloques vinculados a `section_offering_id`.

La publicacion se realiza posteriormente con el flujo seguro existente; no se publica desde el generador.

### Estudiante

- `GET /api/v1/students/me/enrolled-courses`: cursos asignados del periodo activo.
- `GET /api/v1/students/me/published-sections`: secciones publicadas correspondientes a sus cursos asignados.
- `POST /api/v1/student-csp/generate-from-enrollments`: alternativas sin cruces solo con esos cursos.
- `POST /api/v1/student-csp/save-from-enrollments`: guarda la alternativa elegida con `generation_mode=ENROLLMENTS`.

El flujo `/student-csp/preview` previo queda disponible como modo exploracion.

## Fase 4: Portal docente

- `GET /api/v1/teachers/me/dashboard`
- `GET /api/v1/teachers/me/schedule`
- `GET /api/v1/teachers/me/sections`
- `GET /api/v1/teachers/me/load`
- `GET /api/v1/teachers/me/conflicts`
- `GET|POST /api/v1/teachers/me/availability`
- `PATCH|DELETE /api/v1/teachers/me/availability/{id}`
- `GET|POST /api/v1/teachers/me/change-requests`
- `PATCH /api/v1/teachers/me/change-requests/{id}/cancel`
- `GET /api/v1/coordinator/change-requests`
- `PATCH /api/v1/coordinator/change-requests/{id}/resolve`

El horario docente solo contiene bloques institucionales `PUBLISHED`. Resolver una solicitud registra la decision, pero no altera bloques publicados.

## Fase 5: Reportes

Todos los endpoints siguientes requieren `ADMIN` o `COORDINATOR`:

| Metodo | Ruta | Contenido |
| --- | --- | --- |
| `GET` | `/api/v1/reports/executive-summary` | KPIs del periodo activo. |
| `GET` | `/api/v1/reports/teacher-load` | Carga docente desde horarios publicados. |
| `GET` | `/api/v1/reports/classroom-usage` | Horas y utilizacion de aulas. |
| `GET` | `/api/v1/reports/offering-status` | Estados de la oferta academica. |
| `GET` | `/api/v1/reports/conflicts` | Resumen y detalle de conflictos. |
| `GET` | `/api/v1/reports/schedules` | Horarios institucionales y distribuciones. |
| `GET` | `/api/v1/reports/students` | Asignaciones y horarios personales. |
| `GET` | `/api/v1/reports/change-requests` | Solicitudes docentes agregadas. |
| `GET` | `/api/v1/reports/sustainability` | Metricas ambientales y GreenFrame. |

Los reportes academicos aceptan opcionalmente `academic_period_id`. Se
exportan como CSV mediante `/teacher-load/export.csv`,
`/classroom-usage/export.csv`, `/offering-status/export.csv`,
`/conflicts/export.csv` y `/students/export.csv`, todos bajo
`/api/v1/reports`.

## Fase 6: Notificaciones, Auditoria Y Trazabilidad

| Metodo | Ruta | Rol |
| --- | --- | --- |
| `GET` | `/api/v1/notifications/me` | Autenticado, solo bandeja propia. |
| `GET` | `/api/v1/notifications/me/unread-count` | Autenticado. |
| `PATCH` | `/api/v1/notifications/{id}/read` | Autenticado, propietario. |
| `PATCH` | `/api/v1/notifications/read-all` | Autenticado. |
| `DELETE` | `/api/v1/notifications/{id}` | Autenticado, propietario. |
| `GET` | `/api/v1/audit-logs` | `ADMIN`. |
| `GET` | `/api/v1/audit-logs/{id}` | `ADMIN`. |
| `GET` | `/api/v1/audit-logs/export.csv` | `ADMIN`. |
| `GET` | `/api/v1/traceability/schedule/{schedule_id}` | `ADMIN`, `COORDINATOR`. |
| `GET` | `/api/v1/traceability/change-request/{request_id}` | `ADMIN`, `COORDINATOR`, docente propietario. |

Las exportaciones de reportes CSV, publicaciones seguras, acciones CSP,
solicitudes docentes y logins exitosos generan auditoria. Los campos
sensibles se ocultan antes de persistir `old_values` o `new_values`.

## Generacion Institucional Guiada

| Metodo | Ruta | Rol |
| --- | --- | --- |
| `GET` | `/api/v1/institutional-csp/available-schedules` | `ADMIN`, `COORDINATOR` |
| `POST` | `/api/v1/admin/demo/prepare-institutional-csp` | `ADMIN` |
| `POST` | `/api/v1/institutional-csp/preview-from-offerings` | `ADMIN`, `COORDINATOR` |

Este endpoint lista horarios institucionales activos para la pantalla
`/admin/institutional-csp`. Incluye etiqueta legible, estado, fuente, periodo,
programa, plan, score y cantidad de bloques. El frontend ya no solicita que el
usuario escriba el ID interno del horario.

Para la demostracion, el administrador puede preparar ofertas, docentes, aulas
y disponibilidad desde `/admin/demo/prepare-institutional-csp` con
`cycles: "all"`. Luego el flujo moderno usa `preview-from-offerings`,
`generate-from-offerings`, `save-offering-solution` y publicacion segura.
