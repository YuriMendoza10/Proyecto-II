# Evidencias de ejecucion de pruebas - Semana 13

Este documento resume las evidencias de ejecucion de pruebas automatizadas realizadas para OptiAcademic durante la Semana 13. La evidencia corresponde a pruebas unitarias, pruebas de componentes, pruebas con mocks, pruebas backend, analisis de cobertura y validacion basica del estado del repositorio.

Las evidencias corresponden a:

- Pruebas unitarias frontend.
- Pruebas de componentes React.
- Pruebas con mocks MSW.
- Pruebas backend con Pytest.
- Pruebas de integracion API.
- Analisis de cobertura frontend.
- Analisis de cobertura backend.
- Validacion de advertencias no bloqueantes.
- Validacion `git diff --check`.

## Resumen de evidencias

| Evidencia | Comando | Resultado | Estado |
|---|---|---|---|
| Pruebas frontend | `npm --prefix frontend run test` | 51 passed | Aprobado |
| Coverage frontend | `npm --prefix frontend run test:coverage` | 81.11 % | Aprobado |
| Pruebas backend + coverage | `py -m pytest --cov=app --cov-report=term --cov-report=html` | 46 passed, 5 skipped, 51 % coverage | Aprobado con observacion |
| Revision de diferencias | `git diff --check` | Sin errores, solo warnings LF/CRLF | Aprobado |

## Pruebas unitarias y de componentes frontend

Comando:

```powershell
npm --prefix frontend run test
```

Resultado:

```txt
12 test files passed
51 tests passed
0 failed
```

Estas pruebas validan componentes visuales, utilidades de formato, login, dashboard, matricula, paginacion, cambio de tema, componentes comunes, componentes CSP, mocks de API con MSW, reporte de sostenibilidad y vista CSP institucional.

### `endpointLabels.test.js`

Valida que las rutas tecnicas de API se transformen en nombres amigables para el usuario. Esto mejora la trazabilidad y evita que reportes como sostenibilidad, auditoria o metricas muestren endpoints crudos como informacion principal.

### `formatters.test.js`

Valida el formato de porcentajes, CO2, milisegundos, bytes/kilobytes y valores nulos. Esta prueba evita que los indicadores ambientales o de rendimiento se muestren con numeros largos, unidades incorrectas o valores dificiles de interpretar.

### `utilsExtra.test.js`

Valida utilidades como `extractList` y `safeData`. Cubre datos vacios, nulos, arrays, respuestas paginadas y estructuras inesperadas de API. Es importante porque varias pantallas consumen respuestas con formatos distintos.

### `Login.test.jsx`

Valida el renderizado del formulario de inicio de sesion. Comprueba que existan los campos principales y que el flujo basico pueda ejecutarse sin romper la pantalla publica de acceso.

### `Dashboard.test.jsx`

Valida que el panel principal renderice sin errores. Representa una prueba de estabilidad visual de una vista central del sistema.

### `MatriculaPanel.test.jsx`

Valida comportamiento basico del panel academico/matricula. Ayuda a asegurar que componentes relacionados con informacion del estudiante no fallen ante datos esperados.

### `ThemeToggle.test.jsx`

Valida el cambio entre modo claro y modo oscuro. Esto se relaciona con accesibilidad visual y consistencia de experiencia de usuario.

### `PaginationControls.test.jsx`

Valida avance, retroceso y limites de paginacion. Esta prueba aporta a rendimiento y sostenibilidad porque la paginacion evita cargar listados completos cuando solo se necesita una pagina.

### `commonComponentsExtra.test.jsx`

Refuerza componentes comunes que antes tenian baja cobertura:

- `AccessibleAlert`.
- `DataTable`.
- `ErrorBoundary`.
- `ReadableNumber`.
- `SectionCard`.

Estas pruebas verifican renderizado correcto, estados vacios, estados de error, manejo de `null` o `undefined`, y recuperacion controlada ante errores de renderizado.

### `cspComponentsExtra.test.jsx`

Refuerza componentes CSP:

- `CspIssueList`.
- `CspPreviewResult`.
- `CspGenerationResult`.

Valida advertencias sin aula, sin docente, sin disponibilidad, filtros de severidad, vista previa sin secciones listas, vista previa con bloques y estado de generacion. Esto es relevante porque la generacion institucional CSP es uno de los flujos criticos de OptiAcademic.

### `SustainabilityReport.msw.test.jsx`

Usa MSW para simular la API de sostenibilidad sin llamar al backend real. Valida estados de carga, respuesta exitosa, estado vacio y error controlado. Esta prueba permite probar la interfaz ambiental de forma aislada.

### `InstitutionalCspGeneratorPage.msw.test.jsx`

Usa MSW para simular `/api/v1/institutional-csp/available-schedules`. Valida que la vista muestre horarios generados, busqueda, filtros, estados vacios y datos simulados sin depender de una base de datos real.

## Cobertura frontend

Comando:

```powershell
npm --prefix frontend run test:coverage
```

Resultado:

```txt
Coverage global: 81.11 %
Statements: 81.11 %
Branches: 65.29 %
Functions: 68.24 %
Lines: 81.11 %
```

El frontend supera el minimo de 70 % solicitado por la rubrica.

| Area | Cobertura | Interpretacion |
|---|---:|---|
| `components/common` | 100 % | Componentes comunes cubiertos ampliamente |
| `components/csp` | 68.38 % | Componentes CSP reforzados, aun con componentes secundarios pendientes |
| `pages/admin` | 80.08 % | Paginas administrativas principales cubiertas |
| `utils` | 95 % | Utilidades criticas bien cubiertas |

La cobertura frontend mejoro desde 58.07 % hasta 81.11 %. El aumento se logro agregando pruebas sobre componentes comunes, utilidades, componentes CSP y pruebas con MSW para simular APIs sin depender del backend real.

## Pruebas backend con Pytest

Comando:

```powershell
cd backend
py -m pytest --cov=app --cov-report=term --cov-report=html
```

Resultado:

```txt
46 pruebas pasaron
5 pruebas omitidas
3 warnings
Coverage backend global: 51 %
Reporte HTML generado en backend/htmlcov
```

Las pruebas backend validan motor CSP basico, utilidades CSP, seguridad, autenticacion/token, calculo ambiental, publicacion segura de horarios, historial academico, reportes, schemas y endpoints de integracion.

### `test_security_core.py`

Valida hash de contrasena, verificacion de contrasena, creacion y decodificacion de token, y token invalido. Cubre parte critica de seguridad del sistema.

### `test_csp_utils_extra.py`

Valida conversion de tiempos, duracion de bloques, solapamientos, tolerancias, slots academicos y division de horas semanales. Cubre utilidades base para el motor CSP.

### `test_environmental_service.py`

Valida calculo de CO2, persistencia simulada de metricas ambientales, rollback ante error y combinacion de resumen, ranking y metricas. Se usan mocks para no escribir en MySQL real.

### `test_schedule_publication_service.py`

Valida reglas de publicacion segura: bloquear horarios sin bloques, bloquear readiness critico y permitir publicacion cuando la calidad es valida.

### `test_student_academic_history_service.py`

Valida serializacion de historial academico, resumen por estados y creditos, y error 404 cuando no existe estudiante.

### `test_report_service.py`

Valida helpers de reportes, calculo de periodo, uso de GreenFrame y error cuando no existe un periodo solicitado.

## Pruebas omitidas y advertencias

### Pruebas omitidas

Las 5 pruebas omitidas corresponden a pruebas legacy o escenarios que no deben mezclarse con la suite actual. El estado `skipped` no representa un fallo funcional.

### Warnings backend

- `pytest-asyncio`: advierte que `asyncio_default_fixture_loop_scope` no esta configurado para futuras versiones.
- `Pydantic`: advierte que `class Config` sera deprecado en futuras versiones.
- `python-jose`: advierte uso de `datetime.utcnow` dentro de una dependencia interna.

Estas advertencias son no bloqueantes y no afectan la ejecucion de pruebas.

## Relacion con la rubrica

La evidencia cubre estrategias de testing y aseguramiento de calidad de forma equivalente al enfoque MERN de la rubrica, adaptado al stack real de OptiAcademic:

- Frontend: Vitest, React Testing Library y MSW.
- Backend: Pytest y FastAPI TestClient.
- E2E y aceptacion: Playwright y Cypress configurado.
- Cobertura: Vitest V8 y pytest-cov.

Las pruebas reducen riesgo sobre login, dashboard, sostenibilidad, CSP institucional, utilidades, seguridad, publicacion segura e historial academico.
