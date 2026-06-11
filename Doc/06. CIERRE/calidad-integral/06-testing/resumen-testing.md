# Resumen de testing

## Frontend

Resultados reales documentados:

- 12 archivos de prueba.
- 51 pruebas aprobadas.
- Coverage frontend: 81.11 %.
- Branch coverage: 65.24 %.
- Functions: 68.24 %.
- Lines: 81.11 %.
- MSW implementado para simular APIs.
- Componentes comunes, CSP, paginas administrativas y utilidades reforzadas.

Comando:

```powershell
npm --prefix frontend run test
```

## Backend

Resultados reales documentados:

- 46 pruebas aprobadas.
- 5 pruebas `skipped` justificadas.
- Coverage backend global: 51 %.
- `app.core.security`: 95 %.
- `app.csp.utils`: 96 %.
- `app.services.schedule_publication_service`: 82 %.
- `app.middleware.environmental`: 100 %.

Comando:

```powershell
cd backend
py -m pytest --cov=app --cov-report=xml:coverage.xml --cov-report=html --cov-report=term
cd ..
```

## E2E

- Playwright configurado.
- Resultado documentado: 6 passed, 3 skipped.
- Los skips autenticados se justifican por ausencia de `E2E_ADMIN_EMAIL` y `E2E_ADMIN_PASSWORD`.

## Cypress

- Cypress configurado para aceptacion.
- Pendiente de ejecucion estable si el binario local falla por entorno.

## Interpretacion

La estrategia cubre pruebas unitarias, componentes, integracion, E2E, mocks de API y cobertura. Se adapta al stack real de OptiAcademic: React + FastAPI + MySQL.
