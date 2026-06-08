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

- 7 archivos de prueba pasaron.
- 24 pruebas pasaron.

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

- 4 pruebas pasaron.
- 2 pruebas quedaron en `skip` por no existir credenciales `E2E_ADMIN_EMAIL` y `E2E_ADMIN_PASSWORD`.

Observaciones:

- Las pruebas publicas de login y tema se ejecutan sin credenciales.
- Las rutas autenticadas quedan preparadas para ejecutarse con credenciales demo.

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
