# Registro de impedimentos

## Introducción

El registro de impedimentos describe obstáculos que afectaron el avance del proyecto y las acciones adoptadas para mitigarlos.

| ID | Impedimento | Causa | Impacto en el avance | Acción de mitigación | Resultado | Estado |
|---|---|---|---|---|---|---|
| IMP-01 | Dependencia de Docker Desktop activo | Entorno local basado en contenedores | La demo no funciona sin Docker | Documentar comandos de arranque y verificación | Entorno recuperado | Controlado |
| IMP-02 | Confusión de comandos desde backend en lugar de raíz | Comandos Docker/Sonar requieren raíz | Errores de ejecución | Guía de capacitación con rutas | Comandos normalizados | Mitigado |
| IMP-03 | Credenciales Docker/MySQL inconsistentes | Variables locales no versionadas | Backend no conectaba a MySQL | Alinear `.docker.env` local | Backend operativo | Cerrado |
| IMP-04 | Dependencia de token SonarQube | Token local no debe versionarse | Scanner no puede ejecutarse automáticamente | Documentar comando seguro | Pendiente de ejecución local cuando aplique | Controlado |
| IMP-05 | Credenciales E2E no configuradas | Variables `E2E_*` ausentes | Skips en rutas autenticadas | Skips justificados | 6 passed, 3 skipped | Controlado |
| IMP-06 | Evidencias dispersas | Documentos y capturas en varias carpetas | Dificultad de revisión | Crear índices y matrices | Evidencias centralizadas | Mitigado |
| IMP-07 | Tiempo limitado para SUS real ampliado | Muestra institucional no masiva | Generalización limitada | Piloto académico con nota metodológica | SUS 82.19 documentado | Aceptado |
| IMP-08 | Complejidad del CSP/backtracking | Restricciones académicas múltiples | Riesgo de lentitud o refactor riesgoso | Documentar mejora futura | Sin cambios destructivos | En seguimiento |
| IMP-09 | Diferencia entre cobertura local y SonarQube | Mapeo e integración de reportes | Confusión de métricas | Explicar cobertura local vs integrada | Documentado | Mitigado |
| IMP-10 | Riesgo residual de dependencias | npm audit y pip-audit | No conviene actualizar antes de sustentación | Plan de actualización en rama separada | Documentado | En seguimiento |

## Conclusión

Los impedimentos operativos principales fueron mitigados. Los impedimentos residuales corresponden a mejoras futuras de automatización, seguridad y validación ampliada.
