# Documentación de capacitación para operación y sustentación

## Objetivo de la guía

Orientar al equipo en la operación local de OptiAcademic, ejecución de pruebas, revisión de evidencias y sustentación técnica del proyecto.

## Requisitos previos

- Docker Desktop activo.
- Python instalado para pruebas backend locales.
- Node.js/npm instalado.
- Archivo `.docker.env` presente localmente.
- No subir `.docker.env` a Git.

## Levantar el proyecto con Docker

```powershell
cd D:\CHATTT\Proyecto-II-compartido
docker compose --env-file .docker.env up -d --build
docker compose --env-file .docker.env ps
docker compose --env-file .docker.env logs --tail=100
```

## Verificar contenedores

```powershell
docker compose --env-file .docker.env ps
docker compose --env-file .docker.env logs --tail=100 backend
docker compose --env-file .docker.env logs --tail=100 frontend
docker compose --env-file .docker.env logs --tail=100 mysql
```

## Abrir aplicación

- Frontend: <http://localhost:5173>
- Backend: <http://localhost:8000>
- Swagger: <http://localhost:8000/docs>

## Detener sin borrar datos

```powershell
docker compose --env-file .docker.env stop
```

**Prohibido para la demo:**

```powershell
docker compose down -v
```

Ese comando elimina volúmenes y puede borrar la base de datos local.

## Ejecutar pruebas frontend

```powershell
npm --prefix frontend run test
```

Resultado esperado documentado: 12 archivos y 51 pruebas aprobadas.

## Ejecutar pruebas backend completas

```powershell
cd backend
py -m pytest --cov=app --cov-report=xml.xml --cov-report=html --cov-report=term
cd ..
```

Resultado documentado: 46 pruebas aprobadas, 5 omitidas.

## Ejecutar pruebas de seguridad backend

```powershell
cd backend
py -m pytest tests/test_security_core.py tests/test_semana13_integration_api.py -v
cd ..
```

Resultado documentado: 9 pruebas aprobadas.

## Ejecutar pruebas E2E

```powershell
npm --prefix frontend run e2e
```

Para rutas autenticadas configurar:

```powershell
$env:E2E_ADMIN_EMAIL="correo-demo"
$env:E2E_ADMIN_PASSWORD="clave-demo"
```

## Ejecutar auditorías de dependencias

```powershell
npm --prefix frontend audit
```

```powershell
py -m pip install pip-audit
py -m pip_audit -r backend/requirements.txt
```

No aplicar fixes forzados antes de ejecutar regresión.

## Ejecutar SonarQube

```powershell
docker start sonarqube-optiacademic
```

```powershell
$env:SONAR_TOKEN="TOKEN"
docker run --rm -v "${PWD}:/usr/src" `
  -e SONAR_TOKEN="$env:SONAR_TOKEN" sonarsource/sonar-scanner-cli `
  -D"sonar.host.url=http://host.docker.internal:9000" `
  -D"sonar.token=$env:SONAR_TOKEN"
Remove-Item Env:\SONAR_TOKEN
```

No guardar tokens en archivos versionados.

## Revisar evidencias

- `Doc/06. CIERRE/calidad-integral/`
- `Doc/06. CIERRE/semana-13-pruebas/`
- `Doc/06. CIERRE/calidad-integral/07-evidencias/docker-demo-funcionamiento.md`
- `Doc/06. CIERRE/11-matriz-trazabilidad-cierre.md`

## Rutas principales de la app

- `/login`
- `/admin/executive-dashboard`
- `/admin/institutional-csp`
- `/admin/schedule-view`
- `/admin/reports/sustainability`
- `/coordinator/csp`
- `/teacher/dashboard`
- `/student/offer`
- `/notifications`

## Recomendaciones para la demo

1. Levantar Docker antes de la sustentación.
2. Verificar `http://localhost:8000/docs`.
3. Verificar login admin.
4. Revisar dashboard y módulos de datos.
5. Mostrar generador CSP institucional.
6. Mostrar evidencias de SonarQube, pruebas, OWASP, WCAG y SUS.
7. No ejecutar comandos destructivos durante la demo.

## Solución rápida de errores comunes

| Problema | Revisión | Acción |
|---|---|---|
| Backend reinicia | Logs backend | Revisar credenciales `.docker.env` |
| MySQL no conecta | `docker compose ps` | Confirmar `mysql` healthy |
| Frontend no carga datos | URL API | Verificar `VITE_API_URL=http://127.0.0.1:8000/api/v1` |
| Swagger no abre | Backend | Revisar puerto 8000 |
| Datos faltan | MySQL | No seed; revisar volumen antes |
| E2E omitido | Variables | Configurar `E2E_ADMIN_EMAIL/PASSWORD` |
