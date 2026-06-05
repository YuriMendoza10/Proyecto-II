# Fase 4: Portal docente operativo

## Proposito

El portal docente consulta el horario institucional ya publicado desde ofertas academicas. No permite crear, aprobar ni publicar horarios, ni editar secciones asignadas.

## Funcionalidades

- Dashboard propio con cursos, secciones, horas publicadas, clases del dia, conflictos y solicitudes pendientes.
- Horario publicado, secciones asignadas, carga semanal y conflictos vinculados al docente autenticado.
- Gestion de disponibilidad propia mediante `/teachers/me/availability`.
- Solicitudes de cambio de horario sin alteracion automatica del horario publicado.

## Permisos

- `TEACHER`: ve exclusivamente su informacion y gestiona su disponibilidad/solicitudes.
- `COORDINATOR` y `ADMIN`: revisan solicitudes mediante `/coordinator/change-requests` y conservan endpoints administrativos globales.
- `STUDENT`: no tiene acceso a rutas docentes ni de resolucion.

## Solicitudes

Una solicitud puede referenciar un bloque publicado o una oferta asignada al docente. Las solicitudes nacen en `PENDING`; el docente solo puede cancelar las pendientes. Coordinacion registra `APPROVED` o `REJECTED` y su respuesta, sin cambiar automáticamente el horario.

## Demo

```bash
python seed_teacher_portal_demo.py
```

El script usa un bloque publicado existente y crea una solicitud pendiente idempotente. Si aun no existe horario publicado desde ofertas, solicita ejecutar primero el flujo demo de Fase 3 y la publicacion segura.
