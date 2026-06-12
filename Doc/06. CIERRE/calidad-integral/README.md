# Calidad integral - SonarQube, OWASP, WCAG, SUS y Testing

Esta carpeta organiza la documentacion de calidad integral de OptiAcademic para la rubrica de revision de aplicaciones Web modernas Full Stack.

OptiAcademic no usa MERN. El proyecto real usa React, Vite, Tailwind CSS, Axios, FastAPI, SQLAlchemy, Alembic, MySQL y Docker Compose. Por ello, la rubrica se aplica por equivalencia tecnica.

## Resultado general documentado

| Area | Resultado | Estado |
|---|---|---|
| SonarQube | Quality Gate Passed, 0 bugs, 0 vulnerabilities | Cumple |
| Testing frontend | 51 pruebas aprobadas, 81.11 % coverage | Cumple |
| Testing backend | 46 pruebas aprobadas, 5 skipped, 51 % coverage | Cumple con observacion |
| OWASP | 9 pruebas de seguridad aprobadas, auditorias npm/pip documentadas | Cumple con observaciones |
| WCAG | Checklist y rutas preparadas | Pendiente de capturas reales |
| SUS | Instrumento, formula y base preparadas | Pendiente de aplicacion real |
| Evidencias | Lista de capturas requerida | En proceso |

## Contenido

- [Resumen general](resumen-general-calidad-integral.md)
- [01-adaptacion-rubrica.md](01-adaptacion-rubrica.md)
- [matriz-cumplimiento-calidad.md](matriz-cumplimiento-calidad.md)
- [02-sonarqube](02-sonarqube/)
- [03-owasp](03-owasp/)
- [04-wcag](04-wcag/)
- [05-sus](05-sus/)
- [06-testing](06-testing/)
- [07-evidencias](07-evidencias/)

No se inventan capturas, puntajes SUS ni metricas. Las evidencias deben provenir de ejecuciones reales del proyecto.
