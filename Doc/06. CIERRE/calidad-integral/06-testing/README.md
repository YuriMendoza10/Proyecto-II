# Testing automatizado

Esta carpeta resume la evidencia de pruebas automatizadas de OptiAcademic y enlaza con la documentacion completa de Semana 13.

Documentacion detallada:

- [Semana 13 - pruebas](../../semana-13-pruebas)
- [Resultados de pruebas](../../semana-13-pruebas/06-resultados-pruebas.md)
- [Analisis de cobertura](../../semana-13-pruebas/analisis-cobertura-calidad.md)
- [Matriz de casos](../../semana-13-pruebas/matriz-casos-prueba.md)

## Resultados reales documentados

Frontend:

- 12 archivos de prueba.
- 51 pruebas aprobadas.
- Coverage frontend: 81.11 %.
- Branch coverage: 65.24 %.
- Functions: 68.24 %.
- Lines: 81.11 %.
- MSW implementado para simular APIs sin llamar backend real.

Backend:

- 46 pruebas aprobadas.
- 5 skipped justificados.
- Coverage backend global: 51 %.
- `app.core.security`: 95 %.
- `app.csp.utils`: 96 %.
- `app.services.schedule_publication_service`: 82 %.
- `app.middleware.environmental`: 100 %.

E2E:

- Playwright: 6 passed, 3 skipped.
- Skips justificados por falta de `E2E_ADMIN_EMAIL` y `E2E_ADMIN_PASSWORD`.

Cypress:

- Configurado como pruebas de aceptacion.
- Pendiente si el binario local falla por entorno.

## Interpretacion

Frontend supera el minimo de 70 % solicitado por la rubrica. Backend queda en 51 % global, pero los modulos criticos de seguridad, CSP, middleware ambiental y publicacion segura tienen cobertura alta. No se excluyeron modulos reales artificialmente para inflar cobertura.
