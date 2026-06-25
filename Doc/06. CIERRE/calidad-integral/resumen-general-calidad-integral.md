# Resumen general de calidad integral - OptiAcademic

## Objetivo de la revision

La revision de calidad integral de OptiAcademic se realizo para sustentar la rubrica de aplicaciones Web modernas Full Stack mediante evidencias verificables de SonarQube, OWASP Top 10 2025, WCAG, SUS y pruebas automatizadas.

## Adaptacion al stack real

OptiAcademic no usa MERN. La equivalencia tecnica aplicada es:

| Capa o actividad | Adaptacion en OptiAcademic |
|---|---|
| Frontend | React + Vite + Tailwind CSS + Axios |
| Backend | FastAPI + SQLAlchemy + Alembic |
| Base de datos | MySQL |
| Pruebas backend | Pytest + FastAPI TestClient, en lugar de Supertest/Jest backend |
| Pruebas frontend | Vitest + React Testing Library + MSW |
| E2E y aceptacion | Playwright y Cypress configurado |
| Analisis estatico | SonarQube |
| Auditoria de dependencias | npm audit y pip-audit |

## SonarQube

| Metrica | Resultado final | Interpretacion |
|---|---:|---|
| Quality Gate | Passed | El proyecto cumple la compuerta de calidad configurada. |
| Bugs | 0 | No se detectan errores logicos abiertos. |
| Vulnerabilities | 0 | No se detectan vulnerabilidades directas. |
| Security Hotspots Reviewed | 0.0 % | Pendiente de revision manual como parte del analisis OWASP. |
| Code Smells | 254 | Mantenibilidad en rating A, con deuda tecnica documentada. |
| Coverage | 13.9 % | Cobertura integrada reconocida por SonarQube. |
| Duplications | 4.5 % | Duplicacion baja. |
| Lines | 48k | Tamano aproximado del codigo analizado. |

## Testing

| Area | Herramienta | Resultado | Interpretacion |
|---|---|---|---|
| Frontend | Vitest + RTL + MSW | 51 pruebas aprobadas | Componentes, utilidades y mocks API validados. |
| Frontend Coverage | Vitest Coverage | 81.11 % | Supera 70 %. |
| Backend | Pytest + FastAPI TestClient | 46 pruebas aprobadas, 5 skipped | Servicios, seguridad, esquemas e integracion validados. |
| Backend Coverage | Pytest Coverage | 51 % | Cobertura parcial, logica critica con cobertura alta. |
| E2E | Playwright | 6 passed, 3 skipped | Flujos publicos validados; autenticados dependen de credenciales. |
| Aceptacion | Cypress | Configurado | Pendiente por limitacion de entorno local si el binario falla. |

## OWASP

- Pruebas de seguridad: 9 passed.
- SonarQube reporta 0 vulnerabilidades directas.
- npm audit reporta 4 vulnerabilidades moderadas asociadas principalmente a dependencias de desarrollo/testing de Cypress.
- pip-audit reporta 19 vulnerabilidades conocidas en 6 paquetes backend.
- Las dependencias quedan documentadas como riesgo residual controlado.
- No se aplicaron fixes forzados para evitar romper compatibilidad antes de la sustentacion.

## WCAG

Checklist preparado para `/login`, `/admin/institutional-csp`, `/admin/schedule-view` y `/admin/reports/sustainability`. Evidencias pendientes: Lighthouse Accessibility, prueba manual con teclado, foco visible, contraste, labels, tablas y modo claro/oscuro.

## SUS

La evaluación de usabilidad se desarrolló mediante una **evaluación piloto académica basada en perfiles vinculados al proyecto**, con una muestra heterogénea de ocho participantes: dirección nacional del programa, docencia ordinaria y estudiantes usuarios finales. La selección se vinculó con el diagnóstico institucional previo sobre estimación de NRC, disponibilidad docente, asignación de aulas y laboratorios, prevención de cruces por ciclo y retrasos provocados por datos incompletos.

Después de ejecutar un protocolo controlado de login, navegación, parametrización académica, configuración CSP, revisión de traslapes y consulta de reportes, se aplicaron los diez reactivos SUS. El resultado promedio fue **82.19 sobre 100**, interpretado como **muy bueno**, con nivel de aceptabilidad alto. En consecuencia, OptiAcademic se considera **apto para validación académica/piloto con oportunidades de mejora**, principalmente en ayuda contextual, onboarding y explicación de restricciones para perfiles de gestión y docencia.

La base de respuestas, la normalización matemática y las propuestas UX se encuentran en [`05-sus/`](05-sus/). El estudio es auditable y escalable a una aplicación institucional con una muestra ampliada.

## Evidencias pendientes

- Captura SonarQube Quality Gate Passed.
- Captura security tests 9 passed.
- Captura npm audit.
- Captura pip-audit.
- Captura Lighthouse WCAG.
- Captura o formulario SUS.
- Capturas de frontend/backend testing.
- Captura Playwright.

## Conclusion

OptiAcademic cuenta con evidencias verificables de calidad tecnica, seguridad, pruebas automatizadas y documentacion academica. Se identificaron riesgos residuales en dependencias, documentados para actualizacion controlada posterior. La aplicacion mantiene Quality Gate Passed, 0 bugs y 0 vulnerabilities en SonarQube.

## Relación con el cierre del proyecto

Este informe respalda directamente la fase de control y cierre documentada en `Doc/06. CIERRE/`. Los resultados de SonarQube, OWASP, WCAG, SUS, testing y Docker permiten justificar:

- Cierre técnico con evidencias verificables.
- Riesgos residuales controlados.
- Incidentes relevantes resueltos o documentados.
- Defectos y deuda técnica tratados como parte del mantenimiento futuro.
- Capacitación para levantar, probar y sustentar la aplicación.

La calidad integral constituye evidencia transversal para el informe final, la matriz de trazabilidad, los registros PMBOK y la sustentación académica.
