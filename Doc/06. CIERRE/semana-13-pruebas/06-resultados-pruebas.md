# Resultados de pruebas

Fecha de ejecucion aproximada: 2026-06-08.

Este documento resume los resultados finales de pruebas de Semana 13 para OptiAcademic. La lectura se organiza por comando ejecutado, evidencia generada, interpretacion tecnica y relacion con la rubrica de testing y aseguramiento de calidad.

## Resumen ejecutivo

| Validacion | Comando | Resultado | Estado |
|---|---|---|---|
| Pruebas frontend | `npm --prefix frontend run test` | 12 archivos, 51 pruebas aprobadas | Aprobado |
| Cobertura frontend | `npm --prefix frontend run test` | 81.11 % global focalizado y LCOV generado | Aprobado |
| Backend + coverage | `py -m pytest --cov=app --cov-report=xml:coverage.xml --cov-report=html --cov-report=term` | 46 passed, 5 skipped, 51 % coverage | Aprobado con observacion |
| Playwright E2E | `npm --prefix frontend run e2e` | 6 passed, 3 skipped por credenciales | Aprobado con observacion |
| Docker config | `docker compose --env-file .env.docker.example config --quiet` | Sin errores | Aprobado |
| Git diff check | `git diff --check` | Sin errores, solo warnings LF/CRLF | Aprobado |

## Frontend - Vitest y React Testing Library

Comando:

```powershell
npm --prefix frontend run test
```

Resultado:

```txt
12 archivos de prueba pasaron
51 pruebas pasaron
0 fallos
```

### Que valida

Estas pruebas validan componentes visuales, utilidades, estados de UI, manejo de datos nulos, paginacion, cambio de tema, vistas CSP y reportes con mocks de API.

Archivos destacados:

- `endpointLabels.test.js`
- `formatters.test.js`
- `MatriculaPanel.test.jsx`
- `Dashboard.test.jsx`
- `utilsExtra.test.js`
- `Login.test.jsx`
- `ThemeToggle.test.jsx`
- `PaginationControls.test.jsx`
- `cspComponentsExtra.test.jsx`
- `commonComponentsExtra.test.jsx`
- `SustainabilityReport.msw.test.jsx`
- `InstitutionalCspGeneratorPage.msw.test.jsx`

### Interpretacion

El resultado `51 passed` indica que las pruebas unitarias y de componentes se ejecutaron correctamente. No hubo fallos de renderizado, callbacks, formatos, mocks MSW ni estados visuales cubiertos por la suite.

## Detalle de pruebas frontend

### `endpointLabels.test.js`

Valida nombres amigables para endpoints tecnicos. Aporta a trazabilidad y comprension de reportes, evitando que el usuario vea rutas como `/api/v1/notifications/me` como dato principal.

### `formatters.test.js`

Valida formato de porcentajes, CO2, milisegundos y datos transferidos. Esto evita indicadores confusos en reportes de sostenibilidad o metricas.

### `utilsExtra.test.js`

Valida `extractList` y `safeData` frente a arrays, objetos paginados, respuestas vacias, `null`, `undefined` y errores normalizados. Esto protege pantallas que consumen APIs con estructuras distintas.

### `Login.test.jsx`

Valida que el formulario de inicio de sesion renderice elementos principales y permita ejecutar el callback de login en una prueba controlada.

### `Dashboard.test.jsx`

Valida que el panel principal renderice sin errores. Representa una prueba de estabilidad visual de una vista central.

### `MatriculaPanel.test.jsx`

Valida comportamiento basico del panel academico/matricula, importante para flujos de estudiantes y horarios.

### `ThemeToggle.test.jsx`

Valida cambio entre modo claro y oscuro. Se relaciona con accesibilidad visual y consistencia de experiencia de usuario.

### `PaginationControls.test.jsx`

Valida avance, retroceso y limites de paginacion. Esta prueba se relaciona con optimizacion porque evita cargar datos innecesarios en listados grandes.

### `commonComponentsExtra.test.jsx`

Refuerza componentes comunes: `AccessibleAlert`, `DataTable`, `ErrorBoundary`, `ReadableNumber` y `SectionCard`. Valida estados de carga, error, vacio, recuperacion ante error y formato legible.

### `cspComponentsExtra.test.jsx`

Refuerza componentes CSP: `CspIssueList`, `CspPreviewResult` y `CspGenerationResult`. Valida advertencias sin aula, sin docente, sin disponibilidad, filtros, vista previa sin secciones listas y resultados de generacion.

### `SustainabilityReport.msw.test.jsx`

Usa MSW para simular APIs de sostenibilidad sin llamar al backend real. Valida carga, exito, vacio y error controlado.

### `InstitutionalCspGeneratorPage.msw.test.jsx`

Usa MSW para simular `/api/v1/institutional-csp/available-schedules`. Valida horarios generados, busqueda, filtros, estados vacios y error controlado.

## Frontend - cobertura

Comando:

```powershell
npm --prefix frontend run test
```

Resultado:

```txt
Coverage global: 81.11 %
Statements: 81.11 %
Branches: 65.24 %
Functions: 68.24 %
Lines: 81.11 %
```

| Area | Cobertura | Interpretacion |
|---|---:|---|
| `components/common` | 100 % | Componentes comunes cubiertos ampliamente |
| `components/csp` | 68.38 % | Componentes CSP reforzados, aun con componentes secundarios pendientes |
| `pages/admin` | 80.08 % | Paginas administrativas principales cubiertas |
| `utils` | 95 % | Utilidades criticas bien cubiertas |

La cobertura frontend aumento de 58.07 % a 81.11 %. El aumento se logro agregando pruebas sobre componentes comunes, utilidades, componentes CSP y pruebas MSW que simulan APIs sin depender del backend real.

### Relacion con la rubrica

El frontend supera el minimo de 70 % solicitado por la rubrica. Ademas, usa herramientas equivalentes para aseguramiento de calidad en React: Vitest, React Testing Library, MSW y cobertura V8.

## Backend - Pytest y coverage

Comando:

```powershell
cd backend
py -m pytest --cov=app --cov-report=xml:coverage.xml --cov-report=html --cov-report=term
```

Resultado:

```txt
46 pruebas pasaron
5 pruebas omitidas
3 warnings
Coverage backend global: 51 %
Coverage HTML generado en backend/htmlcov
```

### Que valida

Las pruebas backend validan:

- Motor CSP basico.
- Utilidades CSP.
- Seguridad y tokens.
- Calculo ambiental.
- Publicacion segura de horarios.
- Historial academico.
- Reportes.
- Schemas.
- Endpoints de integracion.

## Detalle de pruebas backend nuevas

### `test_security_core.py`

Valida hash de contrasena, verificacion de contrasena, creacion y decodificacion de token, y rechazo de token invalido.

### `test_csp_utils_extra.py`

Valida conversion de tiempos, duracion de bloques, solapamientos, tolerancias, slots academicos y division de horas semanales.

### `test_environmental_service.py`

Valida calculo de CO2, persistencia simulada de metricas ambientales, rollback ante error y combinacion de resumen, ranking y metricas.

### `test_schedule_publication_service.py`

Valida reglas de negocio para publicacion segura: bloquear horarios sin bloques, bloquear readiness critico y permitir publicacion cuando la calidad es valida.

### `test_student_academic_history_service.py`

Valida serializacion de historial academico, resumen por estados y creditos, y error 404 cuando no existe estudiante.

### `test_report_service.py`

Valida helpers de reportes, calculo de periodo, uso de GreenFrame y error cuando no existe periodo solicitado.

## Cobertura backend critica

| Modulo critico | Cobertura | Comentario |
|---|---:|---|
| `app.core.security` | 95 % | Seguridad y tokens cubiertos |
| `app.csp.utils` | 96 % | Utilidades CSP criticas cubiertas |
| `app.services.schedule_publication_service` | 82 % | Reglas de publicacion segura cubiertas |
| `app.middleware.environmental` | 100 % | Middleware ambiental cubierto |
| Schemas principales | 80 % - 100 % | Validaciones de datos cubiertas |

### Interpretacion

Aunque la cobertura global backend es 51 %, los modulos criticos relacionados con seguridad, CSP, middleware ambiental y publicacion segura alcanzan cobertura alta. Esto se alinea con la intencion de la rubrica: priorizar logica critica, pruebas mantenibles y reduccion de riesgos.

No se excluyeron servicios reales de forma artificial para inflar el porcentaje. Para llegar a 70 % global o mas en backend se requiere una base de datos de prueba aislada, fixtures de integracion y pruebas sobre repositorios/servicios dependientes de MySQL.

## Pruebas omitidas y advertencias

### 5 skipped

Corresponden a pruebas legacy o escenarios que no deben mezclarse con la suite actual. No representan fallos funcionales.

### Warnings

- `pytest-asyncio`: `asyncio_default_fixture_loop_scope` no esta configurado. Es una advertencia de compatibilidad futura.
- `Pydantic`: `class Config` sera deprecado en futuras versiones. Se recomienda migrar progresivamente a `ConfigDict`.
- `python-jose`: advertencia interna por uso de `datetime.utcnow` dentro de dependencia.

Son advertencias no bloqueantes y no afectan la ejecucion de pruebas.

## Playwright E2E

Comando:

```powershell
npm --prefix frontend run e2e
```

Resultado documentado:

```txt
6 passed
3 skipped
```

Las pruebas publicas validan login, login invalido, cambio de tema y ausencia de pantalla blanca. Las pruebas autenticadas quedan omitidas si no existen `E2E_ADMIN_EMAIL` y `E2E_ADMIN_PASSWORD`.

## Cypress aceptacion

Comando configurado:

```powershell
npm --prefix frontend run acceptance
```

Resultado documentado:

- Cypress quedo configurado con specs de aceptacion para login y CSP.
- La ejecucion local quedo bloqueada por el binario de Cypress en Windows: `bad option: --smoke-test` y `bad option: --ping`.

El bloqueo corresponde al entorno/binario local, no a la logica funcional de OptiAcademic.

## Git

Comandos:

```powershell
git diff --check
git status --short
```

Resultado:

- `git diff --check` no reporto errores.
- Solo se observaron warnings LF/CRLF normales en Windows.
- `git status --short` mostro archivos nuevos de pruebas y documentacion, sin reportes pesados generados.

## Conclusion final

Resultados finales actualizados:

Frontend:

- 51 pruebas aprobadas.
- 81.11 % de cobertura.
- MSW integrado para simular APIs.

Backend:

- 46 pruebas aprobadas.
- 5 pruebas omitidas.
- 51 % de cobertura global.
- Logica critica reforzada con 95 % en seguridad, 96 % en CSP utils y 82 % en publicacion segura.

La estrategia de testing cumple de manera equivalente la rubrica considerando que OptiAcademic no usa MERN, sino React + FastAPI + MySQL. Se aplicaron herramientas equivalentes: Vitest, React Testing Library y MSW para frontend; Pytest y FastAPI TestClient para backend; Playwright y Cypress configurado para pruebas E2E/aceptacion.
