# Parte 5 - Calidad Integral

## Responsable

Yarasca Batalla Jairo Ronald.

## Objetivo de esta parte

Demostrar que el PMV fue evaluado con métricas y evidencias de calidad,
seguridad, accesibilidad, usabilidad y pruebas automatizadas.

## Resumen de lo que se hizo

El equipo aplicó SonarQube para analizar la calidad del código y obtuvo
Quality Gate Passed, 0 bugs, 0 vulnerabilidades, 254 code smells, 13.9 % de
cobertura integrada y 4.5 % de duplicación.

También se documentaron OWASP Top 10, WCAG, SUS, `npm audit`, `pip-audit`,
riesgos residuales y pruebas con Vitest, Pytest y Playwright.

## Qué criterio de la rúbrica cumple

- Buenas prácticas y calidad del código.
- Código limpio y organizado.
- Evidencia técnica y validación del PMV.
- Pruebas automatizadas.
- Seguridad, accesibilidad y usabilidad.

## Evidencia resumida

| Área | Resultado real documentado |
|---|---|
| SonarQube | Quality Gate Passed; 0 bugs; 0 vulnerabilidades |
| Mantenibilidad | 254 code smells |
| Cobertura SonarQube | 13.9 % |
| Duplicación | 4.5 % |
| Frontend | 51 pruebas aprobadas; cobertura 81.11 % |
| Backend | 46 aprobadas; 5 omitidas; cobertura 51 % |
| Seguridad backend | 9 pruebas aprobadas |
| E2E | 6 passed; 3 skipped |

Los code smells, pruebas omitidas y riesgos de dependencias se documentaron
como observaciones técnicas; no se presentan como inexistentes.

## Dónde está la evidencia completa

- `Doc/06. CIERRE/calidad-integral/`.
- `Doc/06. CIERRE/calidad-integral/02-sonarqube/`.
- `Doc/06. CIERRE/calidad-integral/03-owasp/`.
- `Doc/06. CIERRE/calidad-integral/04-wcag/`.
- `Doc/06. CIERRE/calidad-integral/05-sus/`.
- `Doc/06. CIERRE/calidad-integral/06-testing/`.
- `Doc/06. CIERRE/calidad-integral/07-evidencias/`.

## Cómo explicarlo al docente

> En esta parte mostramos que el PMV fue validado con SonarQube, pruebas
> automatizadas, OWASP, WCAG y SUS. SonarQube obtuvo Quality Gate Passed, cero
> bugs y cero vulnerabilidades, aunque registró 254 code smells y 13.9 % de
> cobertura integrada. El frontend alcanzó 51 pruebas y 81.11 % de cobertura;
> el backend, 46 pruebas aprobadas, 5 omitidas y 51 % de cobertura. Además, se
> aprobaron 9 pruebas de seguridad y 6 E2E, con 3 omitidas. Con esto cumplimos
> calidad, pruebas y evidencia técnica sin ocultar riesgos residuales. Si el
> docente requiere detalle, se encuentra en `Doc/06. CIERRE/calidad-integral/`.

## Qué mostrar durante la exposición

- Resumen de calidad integral.
- Captura final de SonarQube.
- Matriz OWASP.
- Evidencias WCAG y resultado SUS.
- Resumen de testing frontend, backend y E2E.

## Transición a la siguiente parte

> Con las evidencias de calidad presentadas, ahora se explicará cómo se
> organizó la documentación, el cierre y el cumplimiento final de la rúbrica.
