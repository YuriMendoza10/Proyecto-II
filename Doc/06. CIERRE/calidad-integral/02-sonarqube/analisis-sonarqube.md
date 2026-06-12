# Analisis SonarQube

## Objetivo

Registrar la lectura tecnica del analisis SonarQube de OptiAcademic y explicar los hallazgos sin inventar metricas.

## Resultado final estable

| Metrica | Valor | Lectura tecnica |
|---|---:|---|
| Quality Gate | Passed | La compuerta de calidad pasa con la configuracion actual. |
| Bugs | 0 | No se detectan errores logicos abiertos. |
| Vulnerabilities | 0 | No se reportan vulnerabilidades directas. |
| Security Hotspots Reviewed | 0.0 % | Falta revision manual de hotspots desde SonarQube. |
| Code Smells | 254 | Hay deuda de mantenibilidad documentada, con rating A. |
| Coverage | 13.9 % | Cobertura integrada reconocida por SonarQube. |
| Duplications | 4.5 % | Duplicacion baja. |
| Lines | 48k | Tamano aproximado del codigo analizado. |

## Interpretacion

El resultado final estable muestra que OptiAcademic pasa el Quality Gate y no mantiene bugs ni vulnerabilidades directas abiertas en SonarQube. Los Security Hotspots no significan automaticamente vulnerabilidades explotables; deben revisarse manualmente y documentarse como parte del analisis OWASP.

La cobertura de SonarQube, 13.9 %, difiere de los reportes especificos de Vitest y Pytest porque integra frontend y backend sobre el conjunto analizado.

## Evidencia de testing relacionada

- Frontend: 51 pruebas aprobadas y 81.11 % de coverage.
- Backend: 46 pruebas aprobadas, 5 skipped y 51 % de coverage.

## Nota sobre smells

Hubo intentos posteriores de reduccion de smells, pero para la evidencia final estable se conserva el analisis Passed con 0 bugs y 0 vulnerabilities. Cualquier reduccion posterior debe registrarse solo despues de una nueva ejecucion del scanner y con captura real.
