# Adaptacion de la rubrica de testing

La consigna academica usa MERN como referencia para explicar estrategias de testing y aseguramiento de calidad en aplicaciones web. OptiAcademic no usa MERN como arquitectura principal; el sistema real esta construido con React, Vite, Tailwind CSS, Axios, FastAPI, SQLAlchemy, Alembic, MySQL y Docker Compose.

Por ese motivo, la Semana 13 adapta las herramientas equivalentes sin forzar tecnologias que no corresponden al proyecto.

| Requisito de la rubrica | En MERN | Adaptacion en OptiAcademic |
|---|---|---|
| Backend Jest/Vitest | Node/Express | Pytest para pruebas unitarias e integracion del backend Python |
| Supertest | Express API | FastAPI TestClient para validar rutas HTTP sin servidor externo |
| MongoDB | Base NoSQL | MySQL con SQLAlchemy como ORM y Alembic para migraciones |
| React Testing Library | React | React Testing Library para componentes React del frontend |
| MSW | Mock APIs | MSW para interceptar llamadas Axios/API en pruebas de componentes |
| Cypress aceptacion | Flujos usuario | Cypress minimo para criterios de aceptacion sobre login y CSP |
| E2E Playwright/Cypress | E2E | Playwright para navegacion real en navegador y rutas criticas |

## Justificacion tecnica

Supertest esta disenado para probar aplicaciones Express en Node.js. No aplica directamente a OptiAcademic porque el backend no es Express; es FastAPI. La alternativa equivalente es `TestClient`, que permite ejecutar solicitudes HTTP contra la aplicacion FastAPI en memoria, validar codigos de respuesta y comprobar que rutas criticas no devuelvan errores 500.

De forma similar, MongoDB no aplica porque la persistencia real es MySQL. Las pruebas de Semana 13 evitan escribir en la base real y priorizan funciones puras, schemas Pydantic, rutas protegidas, respuestas controladas y mocks cuando corresponde.

## Enfoque aplicado

- Backend: Pytest, FastAPI TestClient y cobertura con pytest-cov.
- Frontend: Vitest, React Testing Library, MSW y cobertura con V8.
- Aceptacion: Cypress con variables de entorno para credenciales demo.
- E2E: Playwright con skips condicionales cuando no existen credenciales.
- Documentacion: matriz de casos, resultados, evidencias y analisis de cobertura.

Esta adaptacion conserva el objetivo de la rubrica: demostrar calidad, trazabilidad, validacion de flujos y reduccion de riesgos antes de la entrega final.
