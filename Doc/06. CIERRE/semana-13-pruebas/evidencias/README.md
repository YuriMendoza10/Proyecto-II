# Evidencias visuales de pruebas - Semana 13

Esta carpeta debe almacenar capturas reales de las ejecuciones de pruebas de OptiAcademic. No se deben inventar capturas ni colocar imagenes que no provengan de ejecuciones verificables.

## Capturas requeridas

- Captura de `npm --prefix frontend run test` mostrando `51 passed`.
- Captura de `npm --prefix frontend run test` mostrando `51 passed`, `81.11 %` de cobertura frontend y generacion de `frontend/coverage/lcov.info`.
- Captura de `py -m pytest --cov=app --cov-report=xml:coverage.xml --cov-report=html --cov-report=term` mostrando `46 passed`, `5 skipped`, `51 %` de cobertura backend y generacion de `backend/coverage.xml`.
- Captura de modulos criticos backend:
  - `app.core.security`: 95 %.
  - `app.csp.utils`: 96 %.
  - `app.services.schedule_publication_service`: 82 %.
- Captura de `git diff --check` sin errores criticos, solo warnings LF/CRLF si aparecen en Windows.
- Captura de `npm --prefix frontend run e2e` si se ejecuta Playwright.
- Captura de Cypress si se logra ejecutar `npm --prefix frontend run acceptance` en un entorno donde el binario funcione correctamente.

## Relacion con la rubrica

Estas evidencias permiten demostrar:

- Ejecucion de pruebas unitarias frontend.
- Ejecucion de pruebas de componentes React.
- Uso de mocks MSW para pruebas sin backend real.
- Ejecucion de pruebas backend con Pytest.
- Analisis de cobertura frontend y backend.
- Validacion de advertencias no bloqueantes.
- Revision del repositorio con `git diff --check`.

## Reglas

- No subir capturas inventadas.
- No subir reportes pesados generados automaticamente si estan ignorados por Git.
- Mantener nombres descriptivos para cada imagen, por ejemplo `frontend-tests-51-passed.png` o `backend-coverage-51.png`.
- Si una prueba queda omitida por credenciales, la captura debe mostrar el `skip` y la explicacion correspondiente.
