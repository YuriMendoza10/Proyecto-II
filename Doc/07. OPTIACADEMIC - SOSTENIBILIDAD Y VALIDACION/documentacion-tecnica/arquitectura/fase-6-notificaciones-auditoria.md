# Fase 6: Notificaciones, Auditoria Y Trazabilidad

## Objetivo

La Fase 6 agrega avisos internos por usuario y un rastro auditable para
acciones academicas sensibles. No envia correos y no almacena contrasenas,
tokens ni secretos.

## Modelo De Datos

| Tabla | Proposito |
| --- | --- |
| `notifications` | Bandeja personal de avisos, lectura y entidad relacionada. |
| `audit_logs` | Acciones criticas ejecutadas por usuarios autenticados. |
| `schedule_publication_history` | Evidencia de publicaciones y destinatarios afectados. |
| `schedule_change_history` | Ciclo de vida de solicitudes y cambios operativos. |

La migracion aditiva es
`i0863d4e5f0a_add_notifications_audit_traceability.py`.

## Eventos Cubiertos

| Evento | Notificacion | Auditoria / historial |
| --- | --- | --- |
| Login exitoso | No | `LOGIN` sobre usuario. |
| Generacion CSP desde ofertas | Coordinador ejecutor | `GENERATE_CSP`. |
| Guardado de solucion CSP | Coordinador ejecutor | `SAVE_SOLUTION`. |
| Publicacion segura de horario | Docentes, estudiantes y coordinacion afectados | `PUBLISH` e historial de publicacion. |
| Cambio a `PUBLISHED` de oferta | Docente asignado | `UPDATE` e historial operativo. |
| Solicitud creada por docente | Coordinadores | `CREATE` e historial de solicitud. |
| Solicitud cancelada | No | `UPDATE` e historial de solicitud. |
| Solicitud aprobada o rechazada | Docente solicitante | `APPROVE` o `REJECT` e historial. |
| Exportacion CSV de reportes | No | `EXPORT_REPORT`. |
| Disponibilidad docente modificada | No | `CREATE`, `UPDATE` o `DELETE`. |

## Permisos

- Cualquier usuario autenticado lista, lee y elimina exclusivamente sus
  propias notificaciones.
- `ADMIN` consulta y exporta la auditoria global.
- `ADMIN` y `COORDINATOR` consultan trazabilidad de horarios.
- `TEACHER` consulta la trazabilidad de una solicitud solo cuando es suya.
- `STUDENT` no accede a auditoria ni trazabilidad operativa.

## API

```text
GET    /api/v1/notifications/me
GET    /api/v1/notifications/me/unread-count
PATCH  /api/v1/notifications/{id}/read
PATCH  /api/v1/notifications/read-all
DELETE /api/v1/notifications/{id}

GET    /api/v1/audit-logs
GET    /api/v1/audit-logs/{id}
GET    /api/v1/audit-logs/export.csv

GET    /api/v1/traceability/schedule/{schedule_id}
GET    /api/v1/traceability/change-request/{request_id}
```

## Interfaz

Todos los roles reciben una campana en la barra superior y la pagina
`/notifications`. El administrador dispone de `/admin/audit-logs`. La
trazabilidad operativa se consulta en `/admin/traceability` o
`/coordinator/traceability`.

## Seguridad

Los campos `old_values` y `new_values` son sanitizados antes de persistirse.
Las claves sensibles como `password`, `hashed_password`, `token`,
`access_token`, `secret` y `secret_key` se registran como datos ocultos, no
como valores originales.
