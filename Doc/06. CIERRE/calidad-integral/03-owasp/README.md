# OWASP Top 10 2025

Esta seccion documenta la auditoria de seguridad de OptiAcademic alineada a OWASP Top 10 2025.

## Evidencias reales documentadas

| Evidencia | Resultado |
|---|---|
| Pruebas backend de seguridad | 9 passed, 3 warnings no bloqueantes |
| SonarQube vulnerabilities | 0 |
| npm audit | 4 vulnerabilidades moderadas |
| pip-audit | 19 vulnerabilidades conocidas en 6 paquetes |

## Comandos usados

```powershell
cd backend
py -m pytest tests/test_security_core.py tests/test_semana13_integration_api.py -v
cd ..

npm --prefix frontend audit

py -m pip install pip-audit
py -m pip_audit -r backend/requirements.txt
```

## Interpretacion

Las pruebas validan autenticacion, JWT, rechazo de token invalido, login invalido y bloqueo de rutas protegidas. Las vulnerabilidades de dependencias detectadas no se corrigen automaticamente antes de la sustentacion para evitar romper compatibilidad; se documentan como riesgo residual controlado.
