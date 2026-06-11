# Analisis SonarQube

## Objetivo

Registrar la lectura tecnica del analisis SonarQube de OptiAcademic y explicar los hallazgos sin inventar metricas.

## Configuracion usada

- `sonar.sources=frontend/src,backend/app`
- `sonar.tests=frontend/src/tests,backend/tests`
- `sonar.javascript.lcov.reportPaths=frontend/coverage/lcov.info`
- `sonar.python.coverage.reportPaths=backend/coverage.xml`
- `sonar.sourceEncoding=UTF-8`

## Resultado inicial conocido

| Metrica | Valor inicial | Lectura tecnica |
|---|---:|---|
| Quality Gate | Failed | La compuerta falla por hallazgos de calidad pendientes |
| Bugs | 2 | Corresponden a comparaciones estrictas entre tipos distintos en `InstitutionalCSPPage.jsx` |
| Vulnerabilities | 0 | No se reportan vulnerabilidades directas |
| Code Smells | 254 | Hay deuda de mantenibilidad por revisar |
| Coverage | 13.9 % | Cobertura integrada calculada por SonarQube sobre el conjunto combinado analizado |
| Duplications | 4.5 % | Duplicacion moderada |
| Security Hotspots Reviewed | 0.0 % | Falta revision manual de hotspots |
| Lines | 48k | Tamano aproximado del codigo analizado |

## Interpretacion

El resultado inicial muestra que la compuerta de calidad fallo por hallazgos que requieren correccion y revision. Los 2 bugs detectados se ubican en `frontend/src/pages/admin/InstitutionalCSPPage.jsx` y corresponden a comparaciones estrictas entre valores de distinto tipo.

La mitigacion aplicada fue normalizar los valores opcionales numericos antes de compararlos o convertirlos, evitando comparaciones imposibles como numero contra cadena vacia. No se uso `==`; se uso conversion explicita con `String()` para detectar vacio y `Number()` para enviar valores numericos al payload.

No se detectaron vulnerabilidades directas. Los Security Hotspots requieren revision manual desde SonarQube.

La cobertura integrada de SonarQube, 13.9 %, es menor que la cobertura individual reportada por Vitest y Pytest porque SonarQube calcula sobre el conjunto combinado del codigo analizado y sobre los reportes que puede mapear a sus fuentes.

La configuracion preparada consiste en:

1. Generar `frontend/coverage/lcov.info` con Vitest.
2. Generar `backend/coverage.xml` con pytest-cov.
3. Declarar ambos archivos en `sonar-project.properties`.
4. Evitar doble indexacion de pruebas.

## Pendiente

Ejecutar nuevamente SonarQube Scanner y completar metricas posteriores con capturas reales. No se inventan resultados finales.
