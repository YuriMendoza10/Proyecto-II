# OWASP Top 10 2025

Esta carpeta documenta la revision de seguridad de OptiAcademic segun OWASP Top 10 2025. La evaluacion se adapta al stack real del proyecto: React + Vite en frontend, FastAPI + SQLAlchemy en backend y MySQL como base de datos.

## Superficie evaluada

- Autenticacion con login y JWT.
- Autorizacion por roles: ADMIN, COORDINATOR, TEACHER y STUDENT.
- Rutas protegidas y endpoints administrativos.
- Validaciones Pydantic en backend.
- Formularios y validaciones en frontend.
- Acceso a datos academicos de estudiantes, docentes, horarios y reportes.
- Configuracion de Docker Compose, CORS, variables de entorno y archivos `.env`.
- Auditoria, trazabilidad, logs y reporte ambiental.

## Categorias aplicadas

- Broken Access Control.
- Authentication Failures.
- Injection.
- Security Misconfiguration.
- Vulnerable Components.
- Data Exposure.
- Logging and Monitoring.
- Input Validation.

## Mitigaciones existentes

- Rutas protegidas sin token devuelven 401 o 403.
- Login invalido devuelve error controlado.
- Tokens JWT para sesiones autenticadas.
- Roles para separar permisos administrativos, academicos y estudiantiles.
- Validaciones Pydantic para datos de entrada.
- SQLAlchemy reduce riesgo de SQL injection frente a concatenacion manual.
- `.env` se mantiene fuera del repositorio.
- Pruebas backend de seguridad en `backend/tests/test_security_core.py`.

## Comandos de evidencia

```powershell
cd backend
py -m pytest tests/test_security_core.py -v
cd ..
```

```powershell
npm --prefix frontend audit
```

```powershell
py -m pip install pip-audit
py -m pip_audit -r backend/requirements.txt
```

## Evidencias pendientes

- Captura de login invalido.
- Captura de ruta protegida sin token.
- Resultado de `test_security_core.py`.
- Resultado de `npm audit`.
- Resultado de `pip-audit`.
- Revision de riesgos residuales.

No se inventan vulnerabilidades explotadas ni resultados de auditoria. Las evidencias deben provenir de ejecuciones reales.
