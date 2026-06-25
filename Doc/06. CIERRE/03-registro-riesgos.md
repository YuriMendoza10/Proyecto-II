# Registro de riesgos del proyecto

## Introducción

El registro de riesgos consolida amenazas y oportunidades identificadas durante el ciclo de vida de OptiAcademic. Se documenta su causa, nivel, respuesta y estado al cierre.

## Criterios de evaluación

| Criterio | Bajo | Medio | Alto |
|---|---|---|---|
| Probabilidad | Poco probable | Posible | Probable |
| Impacto | Afecta parcialmente | Afecta módulos o evidencias | Afecta operación, datos o entrega |

## Registro

| ID | Riesgo | Causa | Probabilidad | Impacto | Nivel | Respuesta planificada | Acción aplicada | Evidencia | Estado final |
|---|---|---|---|---|---|---|---|---|---|
| R-01 | Pérdida de datos por eliminación de volumen Docker | Uso de `docker compose down -v` | Media | Alto | Alto | Evitar comandos destructivos | Se documentó prohibición y uso de `stop` | `docker-demo-funcionamiento.md` | Mitigado |
| R-02 | Incompatibilidad de credenciales Docker/MySQL | Variables distintas a las usadas al crear el volumen | Alta | Alto | Alto | Verificar `.docker.env` y credenciales persistidas | Se alineó `.docker.env` local | `docker-demo-funcionamiento.md` | Cerrado |
| R-03 | Fallo del Quality Gate de SonarQube | Bugs o mala configuración inicial | Media | Alto | Alto | Corregir bugs y validar configuración | Quality Gate Passed | `calidad-integral/02-sonarqube/` | Cerrado |
| R-04 | Baja cobertura integrada en SonarQube | SonarQube integra frontend/backend y reportes mapeados | Alta | Medio | Medio | Reportar cobertura local y SonarQube | Frontend 81.11 %, backend 51 %, Sonar 13.9 % | `calidad-integral/06-testing/` | Aceptado como riesgo residual |
| R-05 | Vulnerabilidades en dependencias | Paquetes npm/Python con CVE conocidas | Alta | Medio | Alto | Auditoría y actualización controlada | npm audit y pip-audit documentados | `calidad-integral/03-owasp/` | En seguimiento |
| R-06 | Fallo de pruebas E2E por credenciales | Variables `E2E_ADMIN_EMAIL` y `E2E_ADMIN_PASSWORD` no configuradas | Alta | Medio | Medio | Skips justificados y documentación | 6 passed, 3 skipped | `semana-13-pruebas/` | Controlado |
| R-07 | Lentitud del generador CSP | Backtracking y restricciones múltiples | Media | Medio | Medio | Optimización progresiva | Documentado como mejora futura | `01-informe-final-proyecto.md` | En seguimiento |
| R-08 | Falta de evidencias ordenadas | Capturas dispersas | Media | Medio | Medio | Crear estructura de evidencias | `calidad-integral/07-evidencias/` | `07-evidencias/` | Mitigado |
| R-09 | Problemas de accesibilidad no detectados | Falta de Lighthouse/validación manual final | Media | Medio | Medio | Checklist WCAG y capturas | Checklist preparado | `calidad-integral/04-wcag/` | En seguimiento |
| R-10 | Evaluación SUS con muestra limitada | Piloto académico N=8 | Media | Medio | Medio | Nota metodológica y plan de ampliación | SUS 82.19 documentado | `calidad-integral/05-sus/` | Aceptado como riesgo residual |
| R-11 | Mala configuración de variables de entorno | Archivos locales no versionados | Alta | Alto | Alto | Guía de capacitación y `.env` ejemplo | `.docker.env` local alineado | `10-documentacion-capacitacion.md` | Controlado |
| R-12 | Deuda técnica acumulada | Code smells y complejidad de servicios | Alta | Medio | Medio | Refactor gradual con pruebas | Code smells documentados | `calidad-integral/02-sonarqube/deuda-tecnica.md` | En seguimiento |

## Conclusión

Los riesgos críticos de operación local y recuperación de datos fueron mitigados. Permanecen riesgos residuales controlados relacionados con cobertura, dependencias, accesibilidad y deuda técnica.
