# Evidencias de testing

Guardar capturas reales de:

- `npm --prefix frontend run test` con 51 pruebas aprobadas.
- Coverage frontend 81.11 %.
- Archivo `frontend/coverage/lcov.info` existente.
- `py -m pytest --cov=app --cov-report=xml:coverage.xml --cov-report=html --cov-report=term`.
- Backend con 46 passed, 5 skipped y 51 % coverage.
- Archivo `backend/coverage.xml` existente.
- Modulos criticos: `app.core.security` 95 %, `app.csp.utils` 96 %, `app.services.schedule_publication_service` 82 %.
- Playwright con 6 passed y 3 skipped.
- Cypress acceptance si el entorno local permite ejecutarlo.
- `git diff --check` sin errores criticos.

Las capturas deben provenir de ejecuciones reales. No se deben crear evidencias manuales ficticias.
