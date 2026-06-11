# Evidencias de calidad integral

Esta carpeta organiza la lista de evidencias verificables para la rubrica de SonarQube, OWASP Top 10 2025, WCAG, SUS y testing automatizado.

## SonarQube

Capturas requeridas:

- Dashboard inicial.
- Dashboard final.
- Bugs.
- Vulnerabilities.
- Security Hotspots.
- Code Smells.
- Coverage.
- Duplications.
- Quality Gate.
- Technical Debt.

## Testing

Capturas requeridas:

- `npm --prefix frontend run test` con 51 passed.
- Frontend coverage 81.11 %.
- `frontend/coverage/lcov.info` generado.
- `py -m pytest --cov=app --cov-report=xml:coverage.xml --cov-report=html --cov-report=term` con 46 passed, 5 skipped y 51 %.
- `backend/coverage.xml` generado.
- Modulos criticos backend: `app.core.security` 95 %, `app.csp.utils` 96 %, `app.services.schedule_publication_service` 82 %.
- Playwright: 6 passed, 3 skipped.

## OWASP

Capturas requeridas:

- `test_security_core.py`.
- Ruta protegida devolviendo 401 o 403.
- Login invalido.
- `npm audit`.
- `pip-audit`.
- Matriz de vulnerabilidades revisada.

## WCAG

Capturas requeridas:

- Lighthouse Accessibility.
- Prueba manual con teclado.
- Foco visible.
- Formularios con labels.
- Tablas legibles.
- Modo claro y oscuro.

## SUS

Evidencias requeridas:

- Formulario aplicado.
- Tabla de respuestas reales.
- Calculo SUS.
- Interpretacion cuantitativa.
- Propuestas de mejora.

## GitHub

Capturas requeridas:

- Historial de commits.
- Ramas o flujo de trabajo.
- README principal actualizado.
- Estructura `Doc/`.
- Configuracion `sonar-project.properties`.

## Regla de evidencia

No se deben inventar capturas, puntajes ni respuestas. Toda evidencia debe provenir de una ejecucion real, una herramienta real o una revision verificable del repositorio.
