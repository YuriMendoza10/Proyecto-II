# Comandos resumidos para demo en vivo - Docker, pruebas y calidad

## 1. Ir a la raíz del proyecto

```powershell
cd D:\CHATTT\Proyecto-II-compartido
```

Verificar rama:

```powershell
git branch --show-current
git status
```

Rama esperada:

```txt
main
```

---

# 2. Verificar Docker

Abrir **Docker Desktop** y esperar a que esté activo.

Luego ejecutar:

```powershell
docker version
docker ps
```

---

# 3. Levantar el proyecto con Docker Compose usando `.docker.env`

> Importante: el proyecto debe levantarse usando `.docker.env`, porque ese archivo contiene las credenciales alineadas con el volumen MySQL existente.
> No usar `docker compose down -v`, porque elimina volúmenes y puede borrar la base de datos.

```powershell
docker compose --env-file .docker.env up -d --build
```

Ver contenedores:

```powershell
docker compose --env-file .docker.env ps
```

Ver logs rápidos:

```powershell
docker compose --env-file .docker.env logs --tail=100
```

Ver logs en vivo:

```powershell
docker compose --env-file .docker.env logs -f
```

---

# 4. Abrir la aplicación

Frontend:

```txt
http://localhost:5173
```

Backend:

```txt
http://localhost:8000
```

Swagger:

```txt
http://localhost:8000/docs
```

---

# 5. Estado recuperado de la base de datos

Después de alinear `.docker.env` con el volumen MySQL existente, se recuperaron los datos del sistema.

| Entidad             | Cantidad recuperada |
| ------------------- | ------------------: |
| Usuarios            |                 226 |
| Docentes            |                  68 |
| Estudiantes         |                 155 |
| Cursos              |                  75 |
| Aulas               |                  68 |
| Horarios            |                  22 |
| Bloques de horario  |               1,575 |
| Ofertas             |                  68 |
| Periodos académicos |                   1 |

Estado de migraciones:

```txt
Alembic: k2085f6a7b2c (head)
```

---

# 6. Ejecutar migraciones si la base de datos lo requiere

Solo ejecutar si el backend indica que faltan migraciones.

```powershell
docker compose --env-file .docker.env exec backend alembic upgrade head
```

Si no reconoce `alembic`:

```powershell
docker compose --env-file .docker.env exec backend python -m alembic upgrade head
```

---

# 7. Pruebas unitarias frontend

```powershell
npm --prefix frontend run test
```

Resultado esperado:

```txt
12 test files passed
51 tests passed
Coverage frontend: 81.11 %
```

Verificar reporte LCOV:

```powershell
Test-Path frontend\coverage\lcov.info
```

Resultado esperado:

```txt
True
```

---

# 8. Pruebas unitarias backend

```powershell
cd backend
py -m pytest -v
cd ..
```

Resultado esperado:

```txt
46 passed
5 skipped
```

---

# 9. Pruebas backend con cobertura

```powershell
cd backend
py -m pytest --cov=app --cov-report=xml:coverage.xml --cov-report=html --cov-report=term
cd ..
```

Resultado esperado:

```txt
46 passed
5 skipped
Coverage backend: 51 %
```

Verificar reporte:

```powershell
Test-Path backend\coverage.xml
```

Resultado esperado:

```txt
True
```

---

# 10. Pruebas de integración backend

```powershell
cd backend
py -m pytest tests/test_semana13_integration_api.py -v
cd ..
```

Resultado esperado:

```txt
6 passed
```

---

# 11. Pruebas de seguridad OWASP backend

```powershell
cd backend
py -m pytest tests/test_security_core.py tests/test_semana13_integration_api.py -v
cd ..
```

Resultado esperado:

```txt
9 passed
```

Estas pruebas validan:

```txt
- hash y verificación de contraseña
- generación y decodificación de JWT
- rechazo de token inválido
- bloqueo de rutas protegidas sin token
- manejo controlado de errores
```

---

# 12. Pruebas E2E con Playwright

```powershell
npm --prefix frontend run e2e
```

Resultado esperado:

```txt
6 passed
3 skipped
```

Abrir reporte:

```powershell
cd frontend
npx playwright show-report
cd ..
```

---

# 13. Pruebas de aceptación con Cypress

Abrir Cypress:

```powershell
cd frontend
npx cypress open
cd ..
```

Ejecutar Cypress por consola:

```powershell
cd frontend
npx cypress run
cd ..
```

Nota:

```txt
Si Cypress falla por binario o entorno gráfico, se documenta como limitación del entorno local. Cypress está configurado para pruebas de aceptación.
```

---

# 14. Auditoría OWASP frontend

```powershell
npm --prefix frontend audit
```

Resultado documentado:

```txt
4 moderate severity vulnerabilities
```

No ejecutar:

```powershell
npm audit fix --force
```

Porque puede romper dependencias de Cypress o el entorno de pruebas.

---

# 15. Auditoría OWASP backend

```powershell
py -m pip_audit -r backend/requirements.txt
```

Si no funciona:

```powershell
pip-audit -r backend/requirements.txt
```

Resultado documentado:

```txt
Found 19 known vulnerabilities in 6 packages
```

---

# 16. Build frontend

```powershell
npm --prefix frontend run build
```

Resultado esperado:

```txt
built successfully
```

---

# 17. SonarQube

Levantar SonarQube si existe:

```powershell
docker start sonarqube-optiacademic
```

Si no existe:

```powershell
docker run -d --name sonarqube-optiacademic -p 9000:9000 sonarqube:lts-community
```

Abrir:

```txt
http://localhost:9000
```

Ejecutar scanner:

```powershell
cd D:\CHATTT\Proyecto-II-compartido

$env:SONAR_TOKEN="PEGA_AQUI_TU_TOKEN"

docker run --rm `
  -v "${PWD}:/usr/src" `
  -e SONAR_TOKEN="$env:SONAR_TOKEN" `
  sonarsource/sonar-scanner-cli `
  -D"sonar.host.url=http://host.docker.internal:9000" `
  -D"sonar.token=$env:SONAR_TOKEN"

Remove-Item Env:\SONAR_TOKEN
```

Dashboard:

```txt
http://localhost:9000/dashboard?id=optic2
```

Resultado esperado:

```txt
Quality Gate: Passed
Bugs: 0
Vulnerabilities: 0
Code Smells: 254
Coverage: 13.9 %
Duplications: 4.5 %
```

---

# 18. Apagar Docker al finalizar sin borrar datos

Para detener los servicios sin eliminar datos:

```powershell
docker compose --env-file .docker.env stop
```

También se puede usar:

```powershell
docker compose --env-file .docker.env down
```

No usar:

```powershell
docker compose down -v
```

Porque elimina volúmenes y puede borrar la base de datos.

---

# 19. Orden recomendado para ejecutar en vivo

```powershell
cd D:\CHATTT\Proyecto-II-compartido

docker compose --env-file .docker.env up -d --build
docker compose --env-file .docker.env ps

npm --prefix frontend run test

cd backend
py -m pytest --cov=app --cov-report=xml:coverage.xml --cov-report=html --cov-report=term
cd ..

cd backend
py -m pytest tests/test_security_core.py tests/test_semana13_integration_api.py -v
cd ..

npm --prefix frontend run e2e

npm --prefix frontend audit

py -m pip_audit -r backend/requirements.txt

npm --prefix frontend run build
```

Luego ejecutar SonarQube:

```powershell
$env:SONAR_TOKEN="PEGA_AQUI_TU_TOKEN"

docker run --rm `
  -v "${PWD}:/usr/src" `
  -e SONAR_TOKEN="$env:SONAR_TOKEN" `
  sonarsource/sonar-scanner-cli `
  -D"sonar.host.url=http://host.docker.internal:9000" `
  -D"sonar.token=$env:SONAR_TOKEN"

Remove-Item Env:\SONAR_TOKEN
```

---

# 20. Verificación rápida de funcionamiento

```powershell
docker compose --env-file .docker.env ps
```

Abrir:

```txt
http://localhost:5173
http://localhost:8000/docs
```

Verificar en la app:

```txt
- Login
- Dashboard
- Docentes
- Estudiantes
- Cursos
- Aulas
- Horarios
- Vista de horarios
- Generador CSP institucional
- Reporte de sostenibilidad
```

---

# 21. Frase para explicar en la sustentación

```txt
Se levantó el sistema con Docker Compose usando el archivo .docker.env alineado al volumen MySQL existente. No se borraron volúmenes ni se ejecutaron seeds. Se recuperaron los datos reales del sistema, incluyendo usuarios, docentes, estudiantes, cursos, aulas, horarios y bloques. Además, se ejecutaron pruebas unitarias, pruebas de integración, pruebas de seguridad, pruebas E2E, auditoría de dependencias, build de producción y análisis SonarQube como parte de la validación integral de calidad del proyecto OptiAcademic.
```
