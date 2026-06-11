# Adaptacion de la rubrica al proyecto OptiAcademic

La consigna solicita una revision de calidad para aplicaciones Web modernas Full Stack mediante SonarQube, OWASP Top 10 2025, WCAG, SUS y pruebas automatizadas. Algunas herramientas o ejemplos de clase pueden estar asociados al ecosistema MERN. Sin embargo, OptiAcademic fue desarrollado con React + FastAPI + MySQL.

Por ello se aplica una adaptacion tecnica equivalente. El objetivo no es forzar MERN, sino cumplir los criterios de calidad con las herramientas correctas para el stack real del proyecto.

| Elemento solicitado por la rubrica | Enfoque de referencia | Adaptacion en OptiAcademic | Justificacion |
|---|---|---|---|
| Frontend moderno | React | React + Vite | Stack real del proyecto |
| Backend API | Express/Node | FastAPI | API REST profesional en Python |
| Base de datos | MongoDB | MySQL + SQLAlchemy | Persistencia relacional del proyecto |
| Supertest | Pruebas Express | Pytest + FastAPI TestClient | Equivalente para FastAPI |
| Jest/RTL | Componentes React | Vitest + React Testing Library | Integracion natural con Vite |
| MSW | Mock APIs | MSW | Simulacion de endpoints sin backend real |
| E2E | Playwright/Cypress | Playwright | Flujos reales del navegador |
| Aceptacion | Cypress | Cypress configurado | Requisito de la rubrica |
| Calidad estatica | SonarQube | SonarQube | Analisis de deuda tecnica y seguridad |
| Seguridad | OWASP Top 10 2025 | OWASP aplicado a JWT, roles, API y validaciones | Seguridad web |
| Accesibilidad | WCAG | WCAG aplicado a UI React | Accesibilidad funcional |
| Usabilidad | SUS | SUS aplicado a usuarios de OptiAcademic | Medicion cuantitativa |

## Por que no se fuerza MERN

- El proyecto ya fue desarrollado con FastAPI y MySQL.
- Cambiar el stack romperia trazabilidad tecnica, historial de commits y arquitectura validada.
- La rubrica evalua criterios de calidad, no una tecnologia unica.
- FastAPI, SQLAlchemy y MySQL cumplen el mismo rol arquitectonico que Express y MongoDB dentro de otro ecosistema.
- Las pruebas se adaptan con herramientas equivalentes: Pytest y FastAPI TestClient reemplazan Supertest para el backend Python.

## Sustento tecnico

La calidad se evidencia con:

- Testing frontend: Vitest, React Testing Library y MSW.
- Testing backend: Pytest y FastAPI TestClient.
- Cobertura: Vitest V8 y pytest-cov.
- E2E: Playwright.
- Aceptacion: Cypress configurado.
- Seguridad: JWT, roles, validaciones Pydantic y rutas protegidas.
- Accesibilidad: mejoras documentadas y checklist WCAG.
- Usabilidad: instrumento SUS preparado.
- Calidad estatica: estructura para SonarQube y metricas antes/despues.
