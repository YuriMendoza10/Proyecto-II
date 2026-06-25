# Informe final del proyecto OptiAcademic

## 1. Resumen ejecutivo

OptiAcademic es una aplicación web Full Stack orientada a la generación, gestión y validación de horarios académicos mediante un enfoque institucional. El sistema integra gestión de usuarios, docentes, estudiantes, cursos, aulas, horarios, reportes, sostenibilidad y generación institucional basada en restricciones.

El proyecto se desarrolló con un enfoque iterativo/adaptativo. Durante el cierre se verificó el funcionamiento de frontend, backend, base de datos, contenedores, migraciones, pruebas automatizadas, calidad estática, seguridad, accesibilidad, usabilidad y documentación.

## 2. Descripción del proyecto

El sistema atiende la problemática de elaboración manual de horarios académicos, asignación de docentes, validación de aulas, control de traslapes, apertura de secciones y consulta de información académica. Su propósito es reducir fricción operativa y mejorar la trazabilidad de decisiones académicas.

## 3. Objetivo general

Desarrollar una plataforma web para optimizar la gestión académica y la generación de horarios, incorporando criterios de calidad, sostenibilidad, seguridad, accesibilidad, usabilidad y validación automatizada.

## 4. Alcance planificado

- Frontend web para roles administrativos, docentes y estudiantes.
- Backend API REST.
- Persistencia en MySQL.
- Gestión de usuarios, docentes, estudiantes, cursos, aulas y horarios.
- Generación de horarios mediante CSP.
- Reportes académicos y de sostenibilidad.
- Contenedores Docker Compose.
- Pruebas automatizadas y documentación técnica.

## 5. Alcance logrado

| Área | Resultado logrado |
|---|---|
| Frontend | React + Vite + Tailwind + Axios operativo |
| Backend | FastAPI + SQLAlchemy + Alembic operativo |
| Base de datos | MySQL con datos recuperados y migración en `k2085f6a7b2c (head)` |
| Docker | Frontend, backend y MySQL levantan correctamente |
| CSP | Generador institucional y horarios disponibles |
| Reportes | Reportes académicos y sostenibilidad documentados |
| Calidad | SonarQube, OWASP, WCAG, SUS y pruebas documentadas |
| Documentación | Estructura de cierre y calidad integral en Markdown |

## 6. Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React, Vite, Tailwind CSS, Axios |
| Backend | FastAPI, Python, SQLAlchemy, Alembic |
| Base de datos | MySQL |
| Contenedores | Docker Compose |
| Pruebas frontend | Vitest, React Testing Library, MSW |
| Pruebas backend | Pytest, FastAPI TestClient |
| E2E | Playwright |
| Calidad | SonarQube |
| Seguridad | OWASP Top 10 |
| Accesibilidad | WCAG |
| Usabilidad | SUS |
| Sostenibilidad | Reporte ambiental / Green Software |

## 7. Desempeño del alcance

El alcance funcional principal fue cumplido. El sistema opera en ambiente local Docker y conserva datos académicos relevantes. Se verificaron módulos de dashboard, docentes, estudiantes, cursos, aulas, horarios, generador CSP institucional y sostenibilidad.

## 8. Desempeño del cronograma

| Fase | Resultado |
|---|---|
| Inicio | Definición del problema, objetivos y visión del sistema |
| Planificación | Requerimientos, arquitectura y alcance inicial |
| Ejecución | Desarrollo frontend, backend, base de datos y módulos académicos |
| Seguimiento y control | Pruebas, SonarQube, OWASP, WCAG, SUS, Docker y evidencias |
| Cierre | Consolidación documental, capacitación, registros y trazabilidad |

El proyecto evolucionó de forma iterativa/adaptativa, incorporando fases institucionales, mejoras de accesibilidad, sostenibilidad, testing y recuperación de entorno Docker.

## 9. Desempeño de calidad

La calidad fue evaluada con criterios alineados a ISO/IEC 25010:

- Mantenibilidad: SonarQube y deuda técnica documentada.
- Seguridad: OWASP, JWT, rutas protegidas y pruebas de seguridad.
- Usabilidad: SUS con puntaje piloto 82.19.
- Accesibilidad: WCAG documentado con evidencias pendientes.
- Confiabilidad: pruebas frontend/backend y verificación Docker.
- Portabilidad: Docker Compose.

### Métricas verificables

| Categoría | Resultado |
|---|---|
| SonarQube Quality Gate | Passed |
| Bugs | 0 |
| Vulnerabilities | 0 |
| Code Smells | 254 |
| Coverage SonarQube | 13.9 % |
| Duplications | 4.5 % |
| Frontend tests | 12 archivos, 51 pruebas aprobadas |
| Frontend coverage | 81.11 % |
| Backend tests | 46 pruebas aprobadas, 5 omitidas |
| Backend coverage | 51 % |
| Seguridad backend | 9 pruebas aprobadas |
| Playwright E2E | 6 aprobadas, 3 omitidas por credenciales |

## 10. Desempeño de costos

No se gestionó un presupuesto monetario formal por tratarse de un proyecto académico. El costo fue principalmente académico/operativo:

- Tiempo de desarrollo y documentación.
- Uso de herramientas open source.
- Infraestructura local de Docker Desktop.
- Mantenimiento futuro de dependencias y pruebas.
- Costo de ciclo de vida asociado a mejorar cobertura, reducir code smells, actualizar dependencias y fortalecer monitoreo.

## 11. Riesgos principales

- Pérdida de datos por eliminación de volúmenes Docker.
- Incompatibilidad de credenciales Docker/MySQL.
- Vulnerabilidades de dependencias frontend/backend.
- Baja cobertura integrada en SonarQube.
- Complejidad del generador CSP.
- Falta de credenciales E2E para pruebas autenticadas.
- Evidencias incompletas de WCAG/SUS en entorno real ampliado.

## 12. Incidentes principales

| Incidente | Acción |
|---|---|
| Docker levantaba pero no cargaba datos | Se alineó `.docker.env` con el volumen MySQL existente |
| SonarQube tuvo Quality Gate fallido previo | Se corrigieron bugs y configuración hasta obtener Passed |
| Playwright omitió pruebas autenticadas | Se documentó dependencia de credenciales |
| Auditorías npm/pip detectaron vulnerabilidades | Se documentó riesgo residual controlado |

## 13. Defectos relevantes

No se documentan defectos funcionales graves abiertos. Se mantienen observaciones técnicas como deuda controlada:

- Code smells remanentes.
- Cobertura global backend mejorable.
- Dependencias con vulnerabilidades conocidas.
- Métricas ambientales reiniciadas por lógica preexistente del backend.

## 14. Evidencias verificables

- `Doc/06. CIERRE/calidad-integral/`
- `Doc/06. CIERRE/semana-13-pruebas/`
- `Doc/06. CIERRE/calidad-integral/07-evidencias/docker-demo-funcionamiento.md`
- `frontend/coverage/lcov.info`
- `backend/coverage.xml`

## 15. Resultados finales

| Resultado | Estado |
|---|---|
| Aplicación web funcional | Cumplido |
| Docker Compose operativo | Cumplido |
| MySQL con datos recuperados | Cumplido |
| Migraciones al día | Cumplido |
| SonarQube Passed | Cumplido |
| Pruebas automatizadas | Cumplido |
| OWASP documentado | Cumplido con observaciones |
| WCAG documentado | Pendiente de capturas reales |
| SUS documentado | Cumple en evaluación piloto |

## 16. Conclusiones

OptiAcademic alcanzó un estado funcional y verificable para sustentación académica. El sistema opera en Docker, conserva datos, presenta evidencias de calidad y cuenta con documentación formal de cierre. Las oportunidades pendientes se concentran en elevar cobertura global, reducir deuda técnica, actualizar dependencias y completar evidencias visuales WCAG/SUS.

## 17. Recomendaciones

- No usar `docker compose down -v`.
- Mantener `.docker.env` local y fuera de Git.
- Incrementar cobertura backend con base de datos de prueba aislada.
- Ejecutar auditorías de dependencias en rama separada.
- Automatizar CI/CD.
- Reaplicar SUS con muestra institucional ampliada.
- Reducir progresivamente code smells de alto impacto.
