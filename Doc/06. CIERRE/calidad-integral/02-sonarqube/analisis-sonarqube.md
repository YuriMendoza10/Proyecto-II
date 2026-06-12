# Analisis SonarQube

## Objetivo

Registrar la lectura tecnica del analisis SonarQube de OptiAcademic y explicar los hallazgos sin inventar metricas.

## Configuracion usada

- `sonar.sources=frontend/src,backend/app`
- `sonar.tests=frontend/src/tests,backend/tests`
- `sonar.javascript.lcov.reportPaths=frontend/coverage/lcov.info`
- `sonar.python.coverage.reportPaths=backend/coverage.xml`
- `sonar.sourceEncoding=UTF-8`

## Resultado actual conocido

| Metrica | Valor actual | Lectura tecnica |
|---|---:|---|
| Quality Gate | Passed | La compuerta de calidad pasa con la configuracion actual |
| Bugs | 0 | Los bugs previos de comparacion estricta fueron corregidos |
| Vulnerabilities | 0 | No se reportan vulnerabilidades directas |
| Code Smells | 194 | Hay deuda de mantenibilidad restante por revisar gradualmente |
| Coverage | 17.5 % | Cobertura integrada calculada por SonarQube sobre el conjunto combinado analizado |
| Duplications | 2.5 % | Duplicacion baja/moderada |
| Security Hotspots Reviewed | 0.0 % | Falta revision manual de hotspots |
| Lines | 41k | Tamano aproximado del codigo analizado |

## Interpretacion

El resultado actual muestra que la compuerta de calidad pasa, sin bugs ni vulnerabilidades directas reportadas. Quedan 194 code smells y Security Hotspots sin revisar manualmente desde la interfaz de SonarQube.

Los 2 bugs previos se ubicaban en `frontend/src/pages/admin/InstitutionalCSPPage.jsx` y correspondian a comparaciones estrictas entre valores de distinto tipo. La mitigacion aplicada fue normalizar los valores opcionales numericos antes de compararlos o convertirlos, evitando comparaciones imposibles como numero contra cadena vacia. No se uso `==`; se uso conversion explicita con `String()` para detectar vacio y `Number()` para enviar valores numericos al payload.

No se detectaron vulnerabilidades directas. Los Security Hotspots requieren revision manual desde SonarQube.

La cobertura integrada de SonarQube, 17.5 %, es menor que la cobertura individual reportada por Vitest y Pytest porque SonarQube calcula sobre el conjunto combinado del codigo analizado y sobre los reportes que puede mapear a sus fuentes.

La configuracion preparada consiste en:

1. Generar `frontend/coverage/lcov.info` con Vitest.
2. Generar `backend/coverage.xml` con pytest-cov.
3. Declarar ambos archivos en `sonar-project.properties`.
4. Evitar doble indexacion de pruebas.

## Mejoras conservadoras aplicadas

- Eliminacion de imports no usados en frontend.
- Eliminacion de logs de depuracion y salida de token de desarrollo en consola.
- Constantes locales para literales repetidos en modelos y servicios.
- Ajuste de `backend/.coveragerc` con rutas relativas sin ocultar modulos reales.
- Mejora puntual de accesibilidad en botones de dias del CSP institucional.
- Correccion de keys con indice cuando existia un identificador estable.

No se refactorizaron funciones grandes del motor CSP ni servicios complejos para evitar romper flujos criticos sin pruebas adicionales.

## Pendiente

Revisar manualmente Security Hotspots desde SonarQube y capturar evidencia del dashboard actual. No se inventan resultados finales.
