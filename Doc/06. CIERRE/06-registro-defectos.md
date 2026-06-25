# Registro de defectos y observaciones técnicas

## Introducción

Este registro documenta defectos, observaciones técnicas y deuda controlada identificada durante el control de calidad de OptiAcademic. No se declaran defectos funcionales graves abiertos sin evidencia.

## Criterios de severidad

| Severidad | Descripción |
|---|---|
| Alta | Impide operación o compromete datos |
| Media | Afecta calidad, mantenibilidad o evidencia |
| Baja | Observación técnica sin impacto funcional directo |

## Registro

| ID | Defecto | Tipo | Severidad | Módulo | Estado inicial | Corrección aplicada | Validación | Evidencia | Estado final |
|---|---|---|---|---|---|---|---|---|---|
| DEF-01 | Bugs iniciales detectados por SonarQube | Bug estático | Alta | Frontend CSP | 2 bugs | Normalización explícita de tipos | SonarQube Bugs 0 | `02-sonarqube/` | Cerrado |
| DEF-02 | Quality Gate fallido previo | Calidad | Alta | SonarQube | Failed | Ajustes de bugs/configuración | Quality Gate Passed | `metricas-antes-despues.md` | Cerrado |
| DEF-03 | Configuración incorrecta del scanner/token | Configuración | Media | SonarQube | Scanner no autorizado | Documentar token local | Comando seguro documentado | `10-documentacion-capacitacion.md` | Controlado |
| DEF-04 | Doble indexación o configuración inadecuada | Configuración | Media | SonarQube | Riesgo de análisis inválido | Separar fuentes/pruebas | Documentación Sonar | `02-sonarqube/` | Cerrado |
| DEF-05 | App Docker sin datos visibles | Configuración/entorno | Alta | Docker/MySQL/backend | Backend sin conexión | Alinear `.docker.env` | HTTP 200 y datos recuperados | `docker-demo-funcionamiento.md` | Cerrado |
| DEF-06 | Pruebas E2E omitidas por credenciales | Prueba | Media | Playwright | Skips | Variables documentadas | 6 passed, 3 skipped | `semana-13-pruebas/` | Controlado |
| DEF-07 | Vulnerabilidades de dependencias | Seguridad | Media | npm/pip | Reportadas por auditoría | Riesgo residual documentado | OWASP documentado | `03-owasp/` | En seguimiento |
| DEF-08 | Code smells remanentes | Deuda técnica | Media | Frontend/backend | 254 smells | Documentación y plan gradual | Quality Gate Passed | `deuda-tecnica.md` | Deuda controlada |
| DEF-09 | Advertencias de paquetes/configuración | Entorno | Baja | Pytest/Pydantic/jose | Warnings no bloqueantes | Documentación | Pruebas pasan | `06-testing/` | Aceptado |
| DEF-10 | Reinicio de `environmental_metrics` al startup | Observación técnica | Media | Sostenibilidad/backend | Métricas se limpian al iniciar | Documentado, sin cambio funcional | Logs de recuperación | `docker-demo-funcionamiento.md` | En seguimiento |

## Conclusión

Los defectos críticos asociados a operación y calidad fueron cerrados. La deuda remanente queda registrada y priorizada para mantenimiento posterior.
