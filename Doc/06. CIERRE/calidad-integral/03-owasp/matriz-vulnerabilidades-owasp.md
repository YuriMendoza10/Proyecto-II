# Matriz de vulnerabilidades OWASP

| Categoria OWASP | Riesgo en OptiAcademic | Evidencia | Mitigacion aplicada/propuesta | Riesgo residual | Estado |
|---|---|---|---|---|---|
| Broken Access Control | Acceso no autorizado a rutas de administracion, reportes, horarios o datos academicos | Pruebas de ruta protegida sin token y roles documentados | JWT, dependencias de usuario actual y roles ADMIN/COORDINATOR/TEACHER/STUDENT | Validar permisos por rol con mas pruebas de integracion | Cumple parcialmente |
| Authentication Failures | Login invalido, token manipulado o expirado | `test_security_core.py`, prueba de login invalido | Hash de contrasena, verificacion de password, creacion/decodificacion de JWT | Capturar evidencia visual y revisar expiracion en entorno real | Cumple parcialmente |
| Injection | Filtros y parametros de reportes/listados podrian recibir entradas maliciosas | Revision de uso de SQLAlchemy y schemas | SQLAlchemy, Pydantic y parametros tipados | Aumentar pruebas con entradas maliciosas controladas | Cumple parcialmente |
| Security Misconfiguration | Variables sensibles, CORS, debug o Docker mal configurado | Revision de `.gitignore`, Docker Compose y archivos `.env` | `.env` no versionado, `.env.docker.example` para entorno, no subir tokens | Revisar configuracion productiva final | Pendiente de evidencia |
| Vulnerable Components | Dependencias npm o Python con vulnerabilidades conocidas | `npm audit`, `pip-audit` | Auditoria de dependencias y actualizacion controlada | Depende de ejecucion real de auditorias | Pendiente de ejecucion |
| Data Exposure | Exposicion de datos de estudiantes, docentes o reportes administrativos | Rutas protegidas y roles | JWT, permisos y serializacion controlada | Revisar payloads y campos sensibles en endpoints | Cumple parcialmente |
| Logging and Monitoring | Falta de trazabilidad ante acciones sensibles | Modulos de auditoria y trazabilidad | Audit logs, trazabilidad y reportes existentes | Validar capturas y escenarios de error | Cumple parcialmente |
| Input Validation | Entradas invalidas en formularios o API | Schemas Pydantic y pruebas de validacion | Pydantic, formularios React y manejo de errores | Completar pruebas negativas por modulo | Cumple parcialmente |

## Nota

Esta matriz no afirma vulnerabilidades explotadas. Clasifica riesgos aplicables al sistema y relaciona mitigaciones verificables o pendientes de evidencia real.
