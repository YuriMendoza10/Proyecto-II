# Resumen de testing

## Frontend

Comando:

```powershell
npm --prefix frontend run test
```

Resultado real:

- 12 archivos de prueba aprobados.
- 51 pruebas aprobadas.
- Coverage frontend: 81.11 %.
- Branch coverage: 65.24 %.
- Functions: 68.24 %.
- Lines: 81.11 %.

Las pruebas cubren componentes visuales, utilidades de formato, login, dashboard, matricula, paginacion, cambio de tema, componentes comunes, componentes CSP, mocks MSW, reporte de sostenibilidad y vista CSP institucional.

## Backend

Comando:

```powershell
cd backend
py -m pytest --cov=app --cov-report=xml.xml --cov-report=html --cov-report=term
cd ..
```

Resultado real:

- 46 pruebas aprobadas.
- 5 skipped.
- Coverage backend: 51 %.

Warnings no bloqueantes:

- `pytest-asyncio` loop scope.
- Pydantic `class Config` deprecated.
- `jose jwt datetime.utcnow` deprecated.

## Seguridad backend

Comando:

```powershell
cd backend
py -m pytest tests/test_security_core.py tests/test_semana13_integration_api.py -v
cd ..
```

Resultado real:

- 9 pruebas aprobadas.
- 3 warnings no bloqueantes.

Cobertura funcional:

- Hash y verificacion de contrasena.
- Creacion y decodificacion de JWT.
- Rechazo de token invalido.
- `/docs` responde 200.
- Endpoint raiz responde sin base de datos.
- Login invalido retorna error controlado.
- Ruta protegida sin token queda bloqueada.
- Endpoint ambiental sin token no devuelve 500.
- Endpoint historial academico sin token no devuelve 500.

## E2E y aceptacion

- Playwright: 6 passed, 3 skipped.
- Los skipped corresponden a pruebas autenticadas que requieren `E2E_ADMIN_EMAIL` y `E2E_ADMIN_PASSWORD`.
- Cypress esta configurado para aceptacion. Si el binario local falla por entorno, se documenta como limitacion local, no como falla funcional del sistema.
