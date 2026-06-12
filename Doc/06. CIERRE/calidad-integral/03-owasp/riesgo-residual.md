# Riesgo residual OWASP

| Riesgo | Evidencia | Motivo para no aplicar fix automatico | Plan |
|---|---|---|---|
| Vulnerabilidades moderadas frontend | `npm audit`: 4 moderadas en dependencias relacionadas con Cypress | `npm audit fix --force` podria instalar Cypress 13.14.2 y romper entorno de pruebas | Crear rama de actualizacion, ejecutar Vitest, Playwright y Cypress |
| Vulnerabilidades backend | `pip-audit`: 19 vulnerabilidades en 6 paquetes | Actualizar JWT, multipart, Starlette o cryptography puede romper compatibilidad FastAPI | Crear rama de hardening, actualizar por paquete y ejecutar Pytest completo |
| Security Hotspots no revisados | SonarQube: 0.0 % reviewed | Requieren clasificacion manual, no correccion automatica | Revisar hotspot por hotspot y adjuntar captura |
| WCAG sin capturas | Checklist preparado | Falta ejecucion manual/Lighthouse | Ejecutar Lighthouse y navegacion por teclado |
| SUS sin respuestas reales | Instrumento preparado | No se deben inventar participantes | Aplicar cuestionario a usuarios reales o de prueba |

Los riesgos residuales se consideran controlados para la sustentacion siempre que se expliquen y no se oculten.
