# Matriz de cumplimiento de calidad integral

| Criterio de la rubrica | Evidencia en OptiAcademic | Ubicacion | Estado | Observacion |
|---|---|---|---|---|
| Repositorio GitHub publico, codigo completo, commits, ramas y documentacion | Repositorio compartido, README principal, estructura `Doc/` y configuracion de calidad | `README.md`, `Doc/`, `sonar-project.properties` | Cumple | Requiere verificar que la rama final este actualizada en GitHub |
| Informe tecnico integral | Estructura de calidad integral con SonarQube, OWASP, WCAG, SUS y Testing | `Doc/06. CIERRE/calidad-integral/` | Cumple parcialmente | Falta adjuntar capturas reales de herramientas pendientes |
| SonarQube | Configuracion preparada para frontend/backend, LCOV y coverage XML; Quality Gate inicial Failed con 2 bugs corregidos en `InstitutionalCSPPage.jsx` | `02-sonarqube/`, `sonar-project.properties` | Cumple parcialmente | Pendiente segunda ejecucion para verificar Quality Gate, coverage integrado y hotspots revisados |
| OWASP Top 10 2025 | Matriz, mitigaciones, riesgo residual y comandos de evidencia | `03-owasp/` | Cumple parcialmente | Pendiente capturas de `npm audit`, `pip-audit`, login invalido y ruta protegida |
| WCAG | Checklist, validacion manual y evidencias requeridas | `04-wcag/` | Pendiente de evidencias reales | Falta ejecutar Lighthouse Accessibility y validacion manual por teclado |
| SUS | Instrumento, escala, tabla de participantes, formula e interpretacion | `05-sus/` | Pendiente de aplicacion real | No se registran respuestas inventadas |
| Testing automatizado | Vitest/RTL/MSW, Pytest/TestClient, Playwright y Cypress configurado | `06-testing/`, `../semana-13-pruebas/` | Cumple | Frontend 81.11 %, backend 51 % global con logica critica alta |
| Evidencias tecnicas verificables | Guia de capturas para SonarQube, testing, OWASP, WCAG, SUS y GitHub | `07-evidencias/`, `../evidencias/` | En proceso | Falta subir capturas finales de las herramientas |
| Presentacion tecnica profesional | Documentacion preparada para sintetizar hallazgos y metricas | `Doc/`, `07-evidencias/` | Pendiente | Requiere preparar diapositivas finales con resultados reales |
