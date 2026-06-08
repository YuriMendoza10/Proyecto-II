# Resultados de pruebas

Fecha de ejecucion aproximada: 2026-06-07.

## Backend - pytest

Comando:

```powershell
cd backend
py -m pytest -v
```

Resultado:

- 23 pruebas pasaron.
- 5 pruebas legacy quedaron en `skip` justificado.
- 2 advertencias no bloqueantes.

Observaciones:

- Las pruebas omitidas pertenecen a archivos legacy que importaban una estructura anterior del backend.
- Se agregaron pruebas Semana 13 para la aplicacion actual FastAPI bajo `app.main`.

## Frontend - Vitest

Comando:

```powershell
npm --prefix frontend run test
```

Resultado:

- 9 archivos de prueba pasaron.
- 33 pruebas pasaron.

Pruebas nuevas agregadas:

- `InstitutionalCspGeneratorPage.msw.test.jsx`: valida carga, exito, busqueda de horarios generados, estado vacio y error controlado usando MSW.
- `SustainabilityReport.msw.test.jsx`: valida carga, respuesta exitosa, estado vacio y error controlado del reporte ambiental.

## Frontend - cobertura Vitest

Comando:

```powershell
npm --prefix frontend run test:coverage
```

Resultado:

- 9 archivos de prueba pasaron.
- 33 pruebas pasaron.
- Cobertura focalizada frontend: 58.07 %.
- Reporte HTML generado en `frontend/coverage`.

Observaciones:

- `EnvironmentalImpactPage` e `InstitutionalCspGeneratorPage` quedaron cubiertas con escenarios simulados.
- Los huecos principales estan en componentes comunes no ejercitados directamente y componentes CSP secundarios.

## Mejora visual CSP institucional

Se mejoro la vista de generacion institucional CSP para mostrar de forma explicita el ID del horario, el estado del proceso, el resumen de preparacion y las advertencias principales sin necesidad de desplazamiento excesivo.

La pantalla `/admin/institutional-csp` ahora presenta:

- Tarjeta superior de `Horario seleccionado` con ID, estado, periodo, programa, plan, bloques, score y fecha de actualizacion.
- Panel compacto de `Resumen de preparacion` con ciclos, ofertas, docentes, aulas, disponibilidades, bloques y advertencias.
- Barra sticky de acciones CSP para diagnosticar, previsualizar, generar y publicar.
- Advertencias con resumen, filtros rapidos y scroll interno.
- Mensaje mas claro cuando no hay secciones listas para previsualizar.

## Frontend - ESLint

Comando global:

```powershell
npm --prefix frontend run lint
```

Resultado:

- Fallo por deuda previa de lint en componentes y paginas existentes.
- Tambien se detectaron detalles menores en archivos nuevos de pruebas, corregidos durante la implementacion.

Comando enfocado en archivos nuevos/modificados de pruebas:

```powershell
npx --prefix frontend eslint frontend/e2e frontend/playwright.config.js frontend/src/tests/setup.js frontend/src/tests/endpointLabels.test.js frontend/src/tests/formatters.test.js frontend/src/tests/ThemeToggle.test.jsx frontend/src/tests/PaginationControls.test.jsx
```

Resultado:

- Sin errores.

## E2E - Playwright

Comando:

```powershell
npm --prefix frontend run e2e
```

Resultado:

- 6 pruebas pasaron.
- 3 pruebas quedaron en `skip` por no existir credenciales `E2E_ADMIN_EMAIL` y `E2E_ADMIN_PASSWORD`.

Observaciones:

- Las pruebas publicas de login y tema se ejecutan sin credenciales.
- Las rutas autenticadas quedan preparadas para ejecutarse con credenciales demo.
- Se agrego `institutional-csp.spec.js` para validar login publico, login invalido y CSP institucional con listado de horarios cuando existan credenciales.

## Aceptacion - Cypress

Comando:

```powershell
npm --prefix frontend run acceptance
```

Resultado:

- Cypress quedo configurado con specs de aceptacion para login y CSP.
- La ejecucion local quedo bloqueada por el binario de Cypress en Windows: `bad option: --smoke-test` y `bad option: --ping`.
- Se borro y reinstalo la cache local `Cypress\Cache\14.5.4`, pero el binario continuo fallando al iniciar.

Observaciones:

- El bloqueo no corresponde a logica funcional de OptiAcademic ni a las specs creadas.
- Se recomienda probar `npm --prefix frontend run acceptance` en otra estacion o limpiar Cypress global si existe una instalacion global conflictiva.
- Las pruebas no incluyen credenciales reales; las rutas autenticadas usan `CYPRESS_ADMIN_EMAIL` y `CYPRESS_ADMIN_PASSWORD`.

## Backend - cobertura pytest

Comando:

```powershell
cd backend
py -m pytest --cov=app --cov-report=term --cov-report=html
```

Resultado:

- 23 pruebas pasaron.
- 5 pruebas quedaron en `skip`.
- Cobertura global backend: 50 %.
- Reporte HTML generado en `backend/htmlcov`.

Observaciones:

- La cobertura global incluye servicios extensos, repositorios y motores que dependen de base de datos real.
- Para la entrega se documenta tambien una lectura focalizada de modulos criticos en `analisis-cobertura-calidad.md`.

## Build frontend

Comando:

```powershell
npm --prefix frontend run build
```

Resultado:

- Build exitoso con Vite.
- Se generaron artefactos en `frontend/dist/`, carpeta ignorada por Git.

## Docker Compose

Comando:

```powershell
docker compose --env-file .env.docker.example config --quiet
```

Resultado:

- Configuracion valida, sin salida de error.

Comando adicional:

```powershell
docker compose --env-file .env.docker.example ps
```

Resultado:

- `backend` activo en puerto 8000.
- `frontend` activo en puerto 5173.
- `mysql` activo y saludable en puerto 3307.

Observacion:

- Los logs recientes del backend muestran el servicio levantado y atendiendo solicitudes. Tambien aparece un error previo de `WatchfilesRustInternalError` asociado al reloader de Uvicorn sobre `/app/alembic`; el contenedor se reinicio y quedo activo. Se recomienda revisar esa configuracion si se repite durante la demo.

## Compile backend

Comando:

```powershell
py -m compileall backend/app backend/alembic
```

Resultado:

- Compilacion de modulos Python completada sin errores.

## Git

Comandos:

```powershell
git diff --check
git status
```

Resultado:

- `git diff --check` no reporto errores de espacios en blanco.
- `git status` muestra cambios esperados de pruebas, dependencias y documentacion.
- Git mostro advertencias de conversion LF a CRLF en Windows; no son errores bloqueantes.

## Mejora de listado de horarios CSP

Se agrego la seccion `Horarios generados` en `/admin/institutional-csp`, que permite listar horarios institucionales existentes, buscar por nombre o ID, filtrar por estado y periodo, cargar un horario sin escribir manualmente el ID, ver sus bloques y publicar si corresponde.
