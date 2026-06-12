# Comandos para ejecutar OptiAcademic en vivo y correr pruebas

## 1. Ubicarse en la raíz del proyecto

```powershell
cd D:\CHATTT\Proyecto-II-compartido
```

Verificar rama actual:

```powershell
git branch --show-current
git status
```

La rama esperada para la sustentación es:

```txt
main
```

---

# 2. Ejecutar backend FastAPI

Abrir una terminal nueva y ejecutar:

```powershell
cd D:\CHATTT\Proyecto-II-compartido\backend
py -m uvicorn app.main:app --reload
```

Ruta para verificar backend:

```txt
http://localhost:8000
```

Documentación Swagger:

```txt
http://localhost:8000/docs
```

Resultado esperado:

```txt
Uvicorn running on http://127.0.0.1:8000
```

---

# 3. Ejecutar frontend React/Vite

Abrir otra terminal nueva y ejecutar:

```powershell
cd D:\CHATTT\Proyecto-II-compartido
npm --prefix frontend run dev
```

Ruta para abrir la aplicación web:

```txt
http://localhost:5173
```

Ruta de login:

```txt
http://localhost:5173/login
```

Resultado esperado:

```txt
VITE ready
Local: http://localhost:5173/
```

---

# 4. Rutas principales para mostrar en vivo

Backend:

```txt
http://localhost:8000/docs
```

Frontend:

```txt
http://localhost:5173/login
http://localhost:5173/admin/institutional-csp
http://localhost:5173/admin/schedule-view
http://localhost:5173/admin/reports/sustainability
```

---

# 5. Ejecutar pruebas frontend

Desde la raíz del proyecto:

```powershell
cd D:\CHATTT\Proyecto-II-compartido
npm --prefix frontend run test
```

Resultado esperado:

```txt
12 test files passed
51 tests passed
Coverage frontend: 81.11 %
```

Verificar archivo de cobertura generado para SonarQube:

```powershell
Test-Path frontend\coverage\lcov.info
```

Resultado esperado:

```txt
True
```

---

# 6. Ejecutar pruebas backend con cobertura

Desde la raíz del proyecto:

```powershell
cd D:\CHATTT\Proyecto-II-compartido
cd backend
py -m pytest --cov=app --cov-report=xml:coverage.xml --cov-report=html --cov-report=term
cd ..
```

Resultado esperado:

```txt
46 passed
5 skipped
Coverage backend: 51 %
Coverage XML written to file coverage.xml
```

Verificar archivo de cobertura generado:

```powershell
Test-Path backend\coverage.xml
```

Resultado esperado:

```txt
True
```

---

# 7. Ejecutar pruebas de seguridad OWASP

Desde la raíz del proyecto:

```powershell
cd D:\CHATTT\Proyecto-II-compartido
cd backend
py -m pytest tests/test_security_core.py tests/test_semana13_integration_api.py -v
cd ..
```

Resultado esperado:

```txt
9 passed
```

Estas pruebas validan:

* hash y verificación de contraseña;
* generación y decodificación de JWT;
* rechazo de token inválido;
* bloqueo de ruta protegida sin token;
* control de errores en endpoints sensibles;
* respuesta del endpoint `/docs`.

---

# 8. Ejecutar auditoría de dependencias frontend

Desde la raíz del proyecto:

```powershell
cd D:\CHATTT\Proyecto-II-compartido
npm --prefix frontend audit
```

Resultado documentado:

```txt
4 moderate severity vulnerabilities
```

Nota:

```txt
No ejecutar npm audit fix --force durante la sustentación, porque puede instalar versiones con cambios rompientes y afectar Cypress o el entorno de pruebas.
```

---

# 9. Ejecutar auditoría de dependencias backend

Desde la raíz del proyecto:

```powershell
cd D:\CHATTT\Proyecto-II-compartido
py -m pip_audit -r backend/requirements.txt
```

Si el comando anterior no funciona, usar:

```powershell
pip-audit -r backend/requirements.txt
```

Resultado documentado:

```txt
Found 19 known vulnerabilities in 6 packages
```

Nota:

```txt
Las vulnerabilidades se documentan como riesgo residual controlado. No se actualizan dependencias de forma forzada antes de la sustentación para evitar romper compatibilidad con FastAPI, JWT, multipart o pruebas.
```

---

# 10. Ejecutar pruebas E2E con Playwright

Desde la raíz del proyecto:

```powershell
cd D:\CHATTT\Proyecto-II-compartido
npm --prefix frontend run e2e
```

Resultado esperado:

```txt
6 passed
3 skipped
```

Los casos `skipped` corresponden a flujos autenticados que requieren variables de entorno:

```txt
E2E_ADMIN_EMAIL
E2E_ADMIN_PASSWORD
```

Abrir reporte de Playwright:

```powershell
cd frontend
npx playwright show-report
cd ..
```

---

# 11. Ejecutar build del frontend

Desde la raíz del proyecto:

```powershell
cd D:\CHATTT\Proyecto-II-compartido
npm --prefix frontend run build
```

Resultado esperado:

```txt
built successfully
```

Este comando valida que el frontend compila correctamente para producción.

---

# 12. Ejecutar SonarQube

## 12.1. Levantar SonarQube

Intentar iniciar el contenedor existente:

```powershell
docker start sonarqube-optiacademic
```

Si el contenedor no existe, crearlo:

```powershell
docker run -d --name sonarqube-optiacademic -p 9000:9000 sonarqube:lts-community
```

Abrir SonarQube:

```txt
http://localhost:9000
```

---

## 12.2. Ejecutar scanner de SonarQube

Desde la raíz del proyecto:

```powershell
cd D:\CHATTT\Proyecto-II-compartido
```

Cargar token:

```powershell
$env:SONAR_TOKEN="PEGA_AQUI_TU_TOKEN"
```

Ejecutar scanner:

```powershell
docker run --rm `
  -v "${PWD}:/usr/src" `
  -e SONAR_TOKEN="$env:SONAR_TOKEN" `
  sonarsource/sonar-scanner-cli `
  -D"sonar.host.url=http://host.docker.internal:9000" `
  -D"sonar.token=$env:SONAR_TOKEN"
```

Eliminar token de la sesión:

```powershell
Remove-Item Env:\SONAR_TOKEN
```

Resultado esperado en consola:

```txt
EXECUTION SUCCESS
ANALYSIS SUCCESSFUL
```

Abrir dashboard:

```txt
http://localhost:9000/dashboard?id=optic2
```

Resultado esperado en SonarQube:

```txt
Quality Gate: Passed
Bugs: 0
Vulnerabilities: 0
Code Smells: 254
Coverage: 13.9 %
Duplications: 4.5 %
```

---

# 13. Ejecutar validación WCAG / Accesibilidad

Levantar frontend:

```powershell
npm --prefix frontend run dev
```

Abrir en Chrome:

```txt
http://localhost:5173/login
```

Luego:

```txt
F12 → Lighthouse → Accessibility → Analyze page load
```

Rutas sugeridas para evaluar:

```txt
/login
/admin/institutional-csp
/admin/schedule-view
/admin/reports/sustainability
```

También validar manualmente:

```txt
Tab
Shift + Tab
Enter
Space
```

Aspectos revisados:

* navegación por teclado;
* foco visible;
* contraste;
* labels;
* botones;
* mensajes de error;
* estructura visual;
* claridad de componentes.

---

# 14. Documentación para mostrar en GitHub

Ruta principal:

```txt
Doc/06. CIERRE/calidad-integral/
```

Archivos principales:

```txt
Doc/06. CIERRE/calidad-integral/README.md
Doc/06. CIERRE/calidad-integral/resumen-general-calidad-integral.md
Doc/06. CIERRE/calidad-integral/matriz-cumplimiento-calidad.md
```

SonarQube:

```txt
Doc/06. CIERRE/calidad-integral/02-sonarqube/
```

OWASP:

```txt
Doc/06. CIERRE/calidad-integral/03-owasp/
```

WCAG:

```txt
Doc/06. CIERRE/calidad-integral/04-wcag/
```

SUS:

```txt
Doc/06. CIERRE/calidad-integral/05-sus/
```

Testing:

```txt
Doc/06. CIERRE/calidad-integral/06-testing/
```

Evidencias:

```txt
Doc/06. CIERRE/calidad-integral/07-evidencias/
```

---

# 15. Comandos para commit final

Verificar estado:

```powershell
cd D:\CHATTT\Proyecto-II-compartido
git branch --show-current
git status
```

Validar formato:

```powershell
git diff --check
```

Agregar cambios:

```powershell
git add -A
```

Crear commit:

```powershell
git commit -m "docs: completar evidencias de calidad integral"
```

Sincronizar con GitHub:

```powershell
git pull origin main --rebase
git push origin main
```

Verificar:

```powershell
git status
git log --oneline -5
```

Resultado esperado:

```txt
nothing to commit, working tree clean
Your branch is up to date with 'origin/main'
```

---

# 16. Orden recomendado para la sustentación en vivo

```txt
1. Mostrar README principal del repositorio.
2. Mostrar Doc/06. CIERRE/calidad-integral/.
3. Ejecutar backend FastAPI.
4. Ejecutar frontend React/Vite.
5. Mostrar login y rutas principales.
6. Ejecutar pruebas frontend.
7. Ejecutar pruebas backend.
8. Ejecutar pruebas de seguridad OWASP.
9. Mostrar npm audit y pip-audit.
10. Ejecutar build frontend.
11. Ejecutar SonarQube scanner.
12. Mostrar dashboard Quality Gate Passed.
13. Mostrar evidencias WCAG.
14. Mostrar sección SUS.
15. Mostrar matriz de cumplimiento.
```

---

# 17. Frase de cierre para la exposición

```txt
OptiAcademic fue validado mediante una estrategia de calidad integral que incluye pruebas automatizadas, análisis estático con SonarQube, revisión OWASP, validación WCAG y evaluación de usabilidad mediante SUS. El proyecto evidencia Quality Gate Passed, 0 bugs, 0 vulnerabilidades directas, pruebas frontend y backend aprobadas, cobertura documentada y riesgos residuales identificados con propuestas de mejora.
```
