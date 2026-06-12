# Matriz de vulnerabilidades OWASP

| Categoria OWASP | Hallazgo | Evidencia | Impacto | Mitigacion / Accion | Estado |
|---|---|---|---|---|---|
| Identification and Authentication Failures | JWT, contrasena y token invalido validados por pruebas | `test_security_core.py`, 3 pruebas aprobadas | Bajo si se mantienen controles | Hash y verificacion de contrasena; creacion/decodificacion de JWT; rechazo de token invalido | Mitigado |
| Broken Access Control | Ruta protegida sin token queda bloqueada | `test_protected_route_without_token_is_blocked` | Bajo en rutas cubiertas | Dependencias de autenticacion y roles del backend | Mitigado |
| Security Misconfiguration | Rutas sensibles sin token no devuelven 500 inesperado | Pruebas de integracion Semana 13 | Medio si hay configuracion productiva incompleta | Respuestas controladas y no exposicion de error interno en endpoints evaluados | Mitigado |
| Vulnerable and Outdated Components - frontend | `npm audit` detecta 4 vulnerabilidades moderadas en Cypress, `@cypress/request`, `qs` y `uuid` | `npm --prefix frontend audit` | Moderado, asociado principalmente a dependencias de desarrollo/testing | No ejecutar `npm audit fix --force` antes de sustentacion; actualizar en rama separada con regresion | Riesgo residual controlado |
| Vulnerable and Outdated Components - backend | `pip-audit` detecta 19 vulnerabilidades en `cryptography`, `python-jose`, `python-multipart`, `python-dotenv`, `pytest` y `starlette` | `py -m pip_audit -r backend/requirements.txt` | Moderado; depende de exposicion real y compatibilidad | Planificar actualizacion controlada con pruebas de login, JWT, multipart, FastAPI y middleware | Riesgo residual controlado |
| Injection | Uso de parametros y consultas mediante SQLAlchemy | Revision tecnica de stack y schemas Pydantic | Bajo si se mantiene ORM y validacion | Mantener SQLAlchemy, tipado y schemas Pydantic; agregar pruebas negativas progresivas | Cumple con observacion |
| Data Exposure | Datos de estudiantes, docentes y reportes requieren proteccion | Rutas protegidas, roles y pruebas sin token | Medio | JWT, roles y serializacion controlada | Cumple con observacion |
| Logging and Monitoring | Trazabilidad requerida para acciones sensibles | Modulos de auditoria y trazabilidad | Medio | Audit logs y trazabilidad del sistema | Cumple con observacion |

No se afirman vulnerabilidades explotadas. Se documentan riesgos, evidencias y mitigaciones verificables o pendientes de actualizacion controlada.
