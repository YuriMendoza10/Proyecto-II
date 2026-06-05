# 9. API backend

## Base URL

```text
http://127.0.0.1:8000/api/v1
```

## Swagger

```text
http://127.0.0.1:8000/docs
```

## Endpoints principales

### Autenticación

```text
POST /auth/login
```

### Gestión académica

```text
GET/POST /users
GET/POST /teachers
GET/POST /students
GET/POST /courses
GET/POST /classrooms
GET/POST /sections
GET/POST /schedules
```

### CSP institucional

```text
POST /csp-diagnostics/institutional/domains
POST /institutional-csp/preview
POST /institutional-csp/generate
POST /institutional-csp/generate-selected
```

### Publicación

```text
PATCH /schedule-publication/{schedule_id}/publish-safe
```

### CSP estudiante

```text
GET /student-csp/me
GET /student-csp/offer-courses
GET /student-csp/offer-detail
POST /student-csp/preview
POST /student-csp/save-selected
GET /student-csp/saved
GET /student-csp/saved/{student_schedule_id}
PATCH /student-csp/saved/{student_schedule_id}/favorite
```

## Payload institucional

```json
{
  "schedule_id": 1,
  "academic_period": "2026-1",
  "use_academic_slots": true,
  "academic_slots": null,
  "start_hour": "07:00:00",
  "end_hour": "22:00:00",
  "default_block_duration_minutes": 90,
  "min_block_duration_minutes": 60,
  "transfer_tolerance_minutes": 10,
  "days": [1, 2, 3, 4, 5, 6, 7],
  "avoid_duplicate_section_blocks": true,
  "max_solutions": 3
}
```
