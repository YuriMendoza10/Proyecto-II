# Registro de incidentes o problemas

## Introducción

Este documento registra incidentes reales o problemas técnicos observados durante el desarrollo, control de calidad y cierre de OptiAcademic.

| ID | Fecha aproximada o semana | Incidente | Módulo afectado | Prioridad | Responsable | Acción correctiva | Evidencia | Estado final |
|---|---|---|---|---|---|---|---|---|
| INC-01 | Cierre | Docker levantaba pero la app no cargaba datos | Docker, backend, MySQL | Alta | Equipo técnico | Se alineó `.docker.env` con el volumen MySQL existente | `calidad-integral/07-evidencias/docker-demo-funcionamiento.md` | Cerrado |
| INC-02 | Calidad | SonarScanner falló por token no autorizado | SonarQube | Alta | QA/DevOps | Se documentó comando con token local sin exponer secretos | `calidad-integral/02-sonarqube/` | Controlado |
| INC-03 | Calidad | Quality Gate fallido en ejecución previa | SonarQube | Alta | Equipo técnico | Se corrigieron bugs y configuración | `metricas-antes-despues.md` | Cerrado |
| INC-04 | Calidad | Doble indexación o mala configuración inicial de fuentes/tests | SonarQube | Media | QA | Se separaron `sonar.sources` y `sonar.tests` | `sonar-project.properties`, docs de calidad | Cerrado |
| INC-05 | Pruebas | Playwright omitió pruebas autenticadas | E2E | Media | QA | Se documentó dependencia de credenciales E2E | `semana-13-pruebas/` | Controlado |
| INC-06 | Seguridad | npm audit reportó vulnerabilidades moderadas | Frontend/testing | Media | QA | Se documentó riesgo residual y no se aplicó fix forzado | `calidad-integral/03-owasp/` | En seguimiento |
| INC-07 | Seguridad | pip-audit reportó vulnerabilidades backend | Backend/dependencias | Media | QA | Se documentó plan de actualización en rama separada | `calidad-integral/03-owasp/` | En seguimiento |
| INC-08 | Repositorio | Advertencias LF/CRLF o espacios finales | Git/Windows | Baja | Equipo | Se revisó `git diff --check` y se documentaron warnings | Registros de validación | Controlado |
| INC-09 | Sostenibilidad | Posible reinicio de histórico ambiental por lógica preexistente de `environmental_metrics` | Backend/sostenibilidad | Media | Equipo backend | Se registró como observación técnica; no se modificó lógica en recuperación | `docker-demo-funcionamiento.md` | En seguimiento |
| INC-10 | Documentación | Evidencias OWASP/WCAG/testing requerían reorganización | Documentación | Media | Documentación/QA | Se consolidó `calidad-integral/07-evidencias/` | `calidad-integral/` | Cerrado |

## Conclusión

Los incidentes críticos fueron resueltos o controlados. Los pendientes se mantienen como observaciones técnicas o riesgos residuales para iteraciones posteriores.
