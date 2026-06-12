# SonarQube

SonarQube se utiliza para analizar calidad estatica del codigo fuente de OptiAcademic: bugs, vulnerabilities, security hotspots, code smells, duplicacion, deuda tecnica, ratings de mantenibilidad/seguridad/confiabilidad y cobertura.

## Alcance configurado

Archivo de configuracion:

```txt
sonar-project.properties
```

Fuentes analizadas:

- `frontend/src`
- `backend/app`

Pruebas declaradas:

- `frontend/src/tests`
- `backend/tests`

## Por que se excluyen carpetas de pruebas desde sources

`frontend/src/tests` esta dentro de `frontend/src`. Si se declara `frontend/src` como fuente y tambien `frontend/src/tests` como pruebas, SonarQube puede intentar indexar el mismo archivo dos veces.

Por eso:

- `frontend/src/tests` se declara en `sonar.tests`.
- `frontend/src/tests/**` se excluye de `sonar.sources`.
- `backend/tests` se declara en `sonar.tests`.
- `backend/tests/**` se excluye de `sonar.sources`.

Esto evita el error: `file can't be indexed twice`.

## Cobertura para SonarQube

Frontend:

```powershell
npm --prefix frontend run test
Test-Path frontend\coverage\lcov.info
```

El archivo `frontend/coverage/lcov.info` se usa mediante:

```properties
sonar.javascript.lcov.reportPaths=frontend/coverage/lcov.info
```

Backend:

```powershell
cd backend
py -m pytest --cov=app --cov-report=xml:coverage.xml --cov-report=html --cov-report=term
cd ..
Test-Path backend\coverage.xml
```

El archivo `backend/coverage.xml` se usa mediante:

```properties
sonar.python.coverage.reportPaths=backend/coverage.xml
```

## Ejecutar SonarQube Scanner

No ejecutar el scanner con tokens reales dentro del repositorio. Usar un token local y no versionarlo.

```powershell
docker run --rm -v "${PWD}:/usr/src" -e SONAR_TOKEN="$env:SONAR_TOKEN" sonarsource/sonar-scanner-cli `
  -D"sonar.host.url=http://host.docker.internal:9000" `
  -D"sonar.login=$env:SONAR_TOKEN"
```

## Que no hacer

No usar:

```powershell
-D"sonar.sources=."
```

Esto puede provocar doble indexacion de pruebas, incluir artefactos generados y contaminar metricas con `coverage`, `dist`, `htmlcov`, reportes o dependencias.

## Evidencias requeridas

- Dashboard inicial.
- Dashboard despues de corregir cobertura.
- Bugs.
- Vulnerabilities.
- Security hotspots.
- Code smells.
- Coverage.
- Duplications.
- Technical debt.
- Quality gate.

## Resultado inicial conocido

| Metrica | Resultado inicial | Interpretacion |
|---|---:|---|
| Quality Gate | Passed | La compuerta de calidad pasa con la configuracion actual |
| Bugs | 0 | Los bugs previos de comparaciones estrictas fueron corregidos |
| Vulnerabilities | 0 | Sin vulnerabilidades directas reportadas |
| Code Smells | 194 | Existe deuda de mantenibilidad restante |
| Coverage | 17.5 % | Cobertura integrada calculada por SonarQube sobre el conjunto combinado analizado |
| Duplications | 2.5 % | Duplicacion baja/moderada |
| Security Hotspots Reviewed | 0.0 % | Requiere revision manual de hotspots |
| Lines | 41k | Tamano aproximado analizado |

No se inventan resultados posteriores. Las siguientes ejecuciones deben registrarse con capturas reales.
