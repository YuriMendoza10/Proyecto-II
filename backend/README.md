# Backend FastAPI - OptiAcademic

## Descripcion

El backend implementa la API REST de OptiAcademic con FastAPI, persistencia
MySQL mediante SQLAlchemy, migraciones Alembic, autenticacion JWT y servicios
de generacion/validacion de horarios.

## Estructura

```text
backend/
|-- app/
|   |-- api/v1/endpoints/   # Rutas HTTP
|   |-- core/               # Configuracion, DB y seguridad
|   |-- csp/                # Motor de restricciones
|   |-- middleware/         # Medicion ambiental HTTP
|   |-- models/             # Modelos SQLAlchemy
|   |-- schemas/            # Contratos Pydantic
|   `-- services/           # Logica de aplicacion
|-- alembic/                # Migraciones
|-- public/assets/          # Reporte GreenFrame local
|-- alembic.ini
`-- requirements.txt
```

## Variables De Entorno

Crear un `.env` local basado en `.env.example`; nunca versionar secretos.

| Variable | Ejemplo | Uso |
| --- | --- | --- |
| `APP_NAME` | `OptiAcademic` | Nombre de la API. |
| `APP_VERSION` | `1.0.0` | Version visible. |
| `APP_ENV` | `development` | Entorno. |
| `DEBUG` | `True` | Depuracion local. |
| `API_V1_PREFIX` | `/api/v1` | Prefijo REST. |
| `MYSQL_HOST` | `localhost` | Host MySQL; en Docker es `mysql`. |
| `MYSQL_PORT` | `3306` | Puerto interno MySQL. |
| `MYSQL_USER` | `root` | Usuario local. |
| `MYSQL_PASSWORD` | `tu_password` | Contrasena local. |
| `MYSQL_DATABASE` | `optiacademic_db` | Base de datos. |
| `SECRET_KEY` | `cambiar_localmente` | Firma JWT. |
| `ALGORITHM` | `HS256` | Algoritmo JWT. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | Caducidad del token. |
| `BACKEND_CORS_ORIGINS` | `["http://localhost:5173"]` | Origenes React. |

## Instalacion Local

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Migraciones

```powershell
alembic upgrade head
```

## Datos Demo

```powershell
python seed_realistic_demo.py
python seed_uc_ingenieria_sistemas_curriculum.py
python seed_uc_isi_offerings_2026.py
```

El seed principal crea la cuenta demo:

```text
admin@optiacademic.com / admin123
```

El seed curricular crea el período `2026-I`, la carrera `ISI`, el plan
`ISI-UC-2026`, sus cursos por ciclo, electivos sugeridos editables y
prerrequisitos iniciales `RECOMMENDED`. La malla es una base proporcionada
por el usuario y no acredita oficialidad de los electivos.

El seed de oferta crea secciones `DRAFT` para ciclos 1, 2 y 3 en `2026-I`,
sin inventar aulas ni docentes. Tambien habilita la cuenta demo:

```text
coordinator@optiacademic.com / coordinator123
```

## Reglas De Estabilizacion

- `POST /api/v1/auth/register` es registro publico exclusivo para estudiantes;
  no acepta el campo `role`.
- Los usuarios `ADMIN`, `COORDINATOR` y `TEACHER` se crean desde
  `/api/v1/users` con credenciales de administrador o mediante seeds.
- La publicacion de horarios siempre ejecuta validacion de preparacion de
  datos y calidad. La ruta compatible `/schedules/{id}/publish` delega al
  mismo flujo seguro de `/schedule-publication/{id}/publish-safe`.
- La creacion y edicion general de horarios rechaza `status=PUBLISHED`;
  publicar solo es posible mediante el flujo seguro.
- Un estudiante solo puede consultar horarios institucionales y bloques de
  horarios activos con estado `PUBLISHED`.
- Un docente solo puede consultar o modificar su propia disponibilidad; admin
  y coordinador pueden administrar disponibilidades de cualquier docente.

## Ejecutar La API

```powershell
uvicorn app.main:app --reload
```

Swagger: <http://127.0.0.1:8000/docs>

## Endpoints Destacados

| Metodo | Ruta | Acceso |
| --- | --- | --- |
| `POST` | `/api/v1/auth/login-json` | Publico |
| `POST` | `/api/v1/auth/register` | Publico, solo crea `STUDENT` |
| `GET` | `/api/v1/auth/me` | Autenticado |
| `GET` | `/api/v1/dashboard/admin-summary` | Admin/coordinador |
| `POST` | `/api/v1/institutional-csp/generate` | Admin/coordinador |
| `PATCH` | `/api/v1/schedule-publication/{id}/publish-safe` | Admin/coordinador |
| `GET/POST/PATCH` | `/api/v1/academic-periods` | Lectura autenticada/admin escritura |
| `GET/POST/PATCH` | `/api/v1/academic-programs` | Lectura autenticada/admin escritura |
| `GET/POST/PATCH` | `/api/v1/curriculum-plans` | Lectura autenticada/admin escritura |
| `GET/POST/PATCH` | `/api/v1/curriculum-courses` | Lectura autenticada/admin-coordinador escritura |
| `GET` | `/api/v1/students/me/curriculum` | Estudiante |
| `GET` | `/api/v1/students/me/eligible-courses` | Estudiante |
| `GET/POST/PATCH` | `/api/v1/section-offerings` | Lectura por rol/admin-coordinador escritura |
| `POST` | `/api/v1/section-offerings/bulk-from-curriculum` | Admin/coordinador |
| `POST` | `/api/v1/offering-conflicts/analyze` | Admin/coordinador |
| `GET` | `/api/v1/coordinator/dashboard` | Admin/coordinador |
| `GET` | `/api/v1/section-offerings/published/me` | Estudiante, solo publicadas |
| `POST` | `/api/v1/institutional-csp/generate-from-offerings` | Admin/coordinador |
| `GET` | `/api/v1/environmental-impact` | Publico |
| `GET` | `/api/v1/environmental-impact/summary` | Admin/coordinador |
| `GET` | `/api/v1/sustainability` | Publico |
## Fase 3: CSP desde ofertas

El motor institucional puede generar horarios desde `section_offerings` en estado `READY` o `APPROVED` mediante `POST /api/v1/institutional-csp/generate-from-offerings`, y guardar una alternativa `DRAFT` con `POST /api/v1/institutional-csp/save-offering-solution`. La publicacion continua pasando por el endpoint seguro.

El flujo estudiante asume cursos ya asignados: `GET /api/v1/students/me/enrolled-courses`, `GET /api/v1/students/me/published-sections`, `POST /api/v1/student-csp/generate-from-enrollments` y `POST /api/v1/student-csp/save-from-enrollments`.

Seeds adicionales:

```bash
python seed_uc_isi_offerings_ready_demo.py
python seed_uc_isi_student_enrollments_2026.py
```

## Fase 4: Portal docente

El docente consume solamente informacion propia bajo `/api/v1/teachers/me`: dashboard, horario publicado, secciones, carga, conflictos, disponibilidad y solicitudes de cambio. Las solicitudes no actualizan automaticamente el horario; `ADMIN` o `COORDINATOR` las resuelven mediante `/api/v1/coordinator/change-requests`.

```bash
python seed_teacher_portal_demo.py
```

## Fase 5: Reportes Y Panel Ejecutivo

`ADMIN` y `COORDINATOR` pueden consultar indicadores bajo
`/api/v1/reports`: resumen ejecutivo, carga docente, uso de aulas, estado de
oferta, conflictos, horarios, estudiantes, solicitudes y sostenibilidad.
Los reportes usan por defecto el periodo activo y aceptan
`academic_period_id` cuando aplica.

Exportaciones CSV disponibles:

```text
/api/v1/reports/teacher-load/export.csv
/api/v1/reports/classroom-usage/export.csv
/api/v1/reports/offering-status/export.csv
/api/v1/reports/conflicts/export.csv
/api/v1/reports/students/export.csv
```

## Fase 6: Notificaciones, Auditoria Y Trazabilidad

La migracion `i0863d4e5f0a` agrega `notifications`, `audit_logs`,
`schedule_publication_history` y `schedule_change_history`. Las publicaciones
seguras notifican a los usuarios afectados; la generacion CSP, sus soluciones,
las solicitudes docentes, los cambios de estado, el login y las exportaciones
CSV quedan auditados.

Rutas nuevas:

```text
/api/v1/notifications/me
/api/v1/notifications/me/unread-count
/api/v1/audit-logs
/api/v1/audit-logs/export.csv
/api/v1/traceability/schedule/{schedule_id}
/api/v1/traceability/change-request/{request_id}
```

`/audit-logs` es exclusivo de `ADMIN`. Las notificaciones son privadas por
usuario y los datos auditados excluyen secretos y tokens.
