# Resumen de Exposición - Fase de Control y Cierre del Proyecto

## 1. Propósito del documento

Este documento consolida los 11 documentos de cierre del proyecto OptiAcademic en una estructura breve, técnica y organizada para facilitar la exposición oral del equipo de 6 integrantes. Su finalidad es mantener trazabilidad directa con la consigna de la Fase de Control y Cierre del Proyecto, la rúbrica de evaluación y las evidencias verificables generadas durante el cierre.

El resumen no reemplaza los documentos originales. Funciona como guía de exposición, distribuye responsabilidades entre integrantes y permite presentar de forma ordenada el cumplimiento de informe final, lecciones aprendidas, riesgos, incidentes, impedimentos, defectos, supuestos, acta, SOW, capacitación, trazabilidad, PMBOK, control de configuración y calidad documental.

## 2. Resumen ejecutivo de cierre

OptiAcademic es una aplicación web Full Stack para la generación y gestión óptima de horarios académicos. El sistema fue desarrollado con React, Vite, Tailwind CSS y Axios en el frontend; FastAPI, SQLAlchemy y Alembic en el backend; MySQL como base de datos; y Docker Compose como entorno de ejecución.

La fase de control y cierre documenta formalmente el estado final del proyecto mediante archivos Markdown versionables en `Doc/06. CIERRE/`. La documentación integra criterios PMBOK, trazabilidad documental, control de configuración, evidencias de calidad integral y resultados técnicos verificables.

### Métricas técnicas verificables

| Área | Resultado documentado |
|---|---|
| SonarQube Quality Gate | Passed |
| Bugs SonarQube | 0 |
| Vulnerabilities SonarQube | 0 |
| Code Smells SonarQube | 254 |
| Coverage SonarQube | 13.9 % |
| Duplications SonarQube | 4.5 % |
| Frontend testing | 51 pruebas aprobadas |
| Frontend coverage | 81.11 % |
| Backend testing | 46 pruebas aprobadas, 5 skipped |
| Backend coverage | 51 % |
| Seguridad backend | 9 pruebas aprobadas |
| Playwright E2E | 6 passed, 3 skipped |
| Docker | Recuperado con datos reales, sin borrar volúmenes |

### Datos recuperados en Docker/MySQL

| Entidad | Cantidad |
|---|---:|
| Usuarios | 226 |
| Docentes | 68 |
| Estudiantes | 155 |
| Cursos | 75 |
| Aulas | 68 |
| Horarios | 22 |
| Bloques | 1,575 |
| Ofertas | 68 |
| Periodos académicos | 1 |

## 3. Relación de los 11 documentos de cierre

| N.º | Documento | Propósito | Evidencia principal | Criterio de rúbrica que cumple |
|---:|---|---|---|---|
| 1 | `01-informe-final-proyecto.md` | Presentar el cierre ejecutivo, técnico y académico del proyecto | Métricas de calidad, testing, Docker y alcance logrado | Informe Final del Proyecto |
| 2 | `02-lecciones-aprendidas.md` | Registrar aprendizajes, acciones correctivas y recomendaciones | Tabla de lecciones por área y estado | Informe Final de Lecciones Aprendidas |
| 3 | `03-registro-riesgos.md` | Documentar riesgos, probabilidad, impacto y respuesta | Registro de riesgos técnicos, operativos y académicos | Registro de Riesgos |
| 4 | `04-registro-incidentes.md` | Registrar incidentes reales ocurridos durante el proyecto | Docker sin datos visibles, SonarQube, auditorías y evidencias | Registro de Incidentes |
| 5 | `05-registro-impedimentos.md` | Describir obstáculos que afectaron el avance y su mitigación | Impedimentos de Docker, credenciales, SonarQube y CSP | Registro de Impedimentos |
| 6 | `06-registro-defectos.md` | Controlar defectos, observaciones técnicas y deuda controlada | Bugs iniciales, Quality Gate, E2E skipped y dependencias | Registro de Defectos |
| 7 | `07-registro-supuestos.md` | Validar supuestos relevantes al cierre | Supuestos sobre Docker, GitHub, credenciales, evidencias y Markdown | Registro de Supuestos |
| 8 | `08-acta-constitucion-cierre.md` | Revisar el acta del proyecto al cierre | Criterios de éxito cumplidos y validación final | Acta de Constitución |
| 9 | `09-declaracion-trabajo-sow.md` | Comparar alcance comprometido, entregables y exclusiones | SOW, entregables realizados y mejoras futuras | Declaración de Trabajo |
| 10 | `10-documentacion-capacitacion.md` | Guiar la operación, pruebas, demo y sustentación | Comandos Docker, pruebas, SonarQube y rutas principales | Documentación de Capacitación |
| 11 | `11-matriz-trazabilidad-cierre.md` | Relacionar requisitos de cierre con documentos y evidencias | Matriz de trazabilidad PMBOK/rúbrica/evidencias | Coherencia y trazabilidad documental |

## 4. Distribución para 6 integrantes

| Integrante | Tema asignado | Documentos que debe presentar | Tiempo sugerido | Ideas clave | Evidencia que debe mostrar |
|---|---|---|---|---|---|
| Integrante 1 | Introducción, contexto y cierre general | `README.md`, `01-informe-final-proyecto.md` | 2 minutos | Qué es OptiAcademic, por qué se realiza el cierre, alcance logrado, stack tecnológico, estado final | `Doc/06. CIERRE/README.md`, informe final |
| Integrante 2 | Calidad integral y resultados técnicos | `01-informe-final-proyecto.md`, `calidad-integral/README.md`, `calidad-integral/resumen-general-calidad-integral.md`, `calidad-integral/matriz-cumplimiento-calidad.md` | 2 minutos | SonarQube, testing, OWASP, WCAG, SUS, Docker recuperado y evidencias verificables | Resumen de calidad integral, dashboard/capturas si están disponibles |
| Integrante 3 | Riesgos, incidentes e impedimentos | `03-registro-riesgos.md`, `04-registro-incidentes.md`, `05-registro-impedimentos.md` | 2 minutos | Riesgos identificados, incidentes reales, impedimentos técnicos, acciones correctivas y estados finales | Tablas de riesgos, incidentes e impedimentos |
| Integrante 4 | Defectos, supuestos y lecciones aprendidas | `06-registro-defectos.md`, `07-registro-supuestos.md`, `02-lecciones-aprendidas.md` | 2 minutos | Defectos controlados, supuestos validados, aprendizajes del equipo, oportunidades de mejora | Registro de defectos, supuestos y lecciones |
| Integrante 5 | Acta, SOW y capacitación | `08-acta-constitucion-cierre.md`, `09-declaracion-trabajo-sow.md`, `10-documentacion-capacitacion.md` | 2 minutos | Objetivos de alto nivel, criterios de éxito, alcance comprometido vs entregado, comandos de demo | Acta, SOW y guía de capacitación |
| Integrante 6 | Trazabilidad, PMBOK y cierre final | `11-matriz-trazabilidad-cierre.md`, `README.md`, evidencias de calidad integral | 2 minutos | Cumplimiento de consigna, rúbrica, trazabilidad, control de configuración y conclusión | Matriz de trazabilidad y evidencias clave |

## 5. Guion breve por integrante

### Integrante 1: Introducción, contexto y cierre general

OptiAcademic es una aplicación web Full Stack orientada a la generación y gestión óptima de horarios académicos. En esta fase se formaliza el control y cierre del proyecto mediante documentación técnica, administrativa y académica.

Ideas clave:

- El sistema usa React/Vite en frontend, FastAPI en backend, MySQL y Docker Compose.
- La documentación de cierre está centralizada en `Doc/06. CIERRE/`.
- El alcance logrado incluye módulos académicos, reportes, CSP, sostenibilidad y evidencias de calidad.
- El cierre permite demostrar cumplimiento, trazabilidad y control de configuración.
- El estado final queda documentado y versionable.

Frase de cierre: Esta introducción ubica el proyecto y muestra que el cierre no es solo administrativo, sino también técnico y verificable.

### Integrante 2: Calidad integral y resultados técnicos

La calidad integral del proyecto se sustenta con evidencia objetiva en SonarQube, pruebas automatizadas, OWASP, WCAG, SUS y recuperación funcional con Docker.

Ideas clave:

- SonarQube obtuvo Quality Gate Passed, 0 bugs y 0 vulnerabilities.
- El frontend registra 51 pruebas aprobadas y 81.11 % de cobertura.
- El backend registra 46 pruebas aprobadas, 5 skipped y 51 % de cobertura.
- La seguridad backend cuenta con 9 pruebas aprobadas.
- Docker fue recuperado con datos reales sin borrar volúmenes.

Frase de cierre: Estos resultados permiten sustentar que OptiAcademic fue cerrado con evidencia técnica verificable.

### Integrante 3: Riesgos, incidentes e impedimentos

Durante el proyecto se identificaron riesgos, incidentes e impedimentos que fueron gestionados mediante acciones correctivas y seguimiento documental.

Ideas clave:

- Se controló el riesgo de pérdida de datos evitando `docker compose down -v`.
- El incidente de Docker se resolvió alineando credenciales con el volumen MySQL existente.
- SonarQube, credenciales E2E y auditorías de dependencias quedaron documentadas.
- Los impedimentos técnicos no se ocultaron, se registraron y se mitigaron.
- Los estados finales permiten distinguir riesgos cerrados, mitigados y residuales.

Frase de cierre: La gestión de riesgos demuestra control del proyecto y aprendizaje técnico del equipo.

### Integrante 4: Defectos, supuestos y lecciones aprendidas

El cierre incluye defectos, supuestos y lecciones aprendidas para dejar trazabilidad de lo corregido, lo validado y lo que debe mejorar en futuras iteraciones.

Ideas clave:

- Se documentaron bugs iniciales de SonarQube y su corrección.
- Los code smells remanentes se consideran deuda técnica controlada.
- Los supuestos sobre Docker, GitHub, credenciales y evidencias fueron validados o aceptados.
- Las lecciones aprendidas cubren Docker, SonarQube, cobertura, OWASP, SUS y Markdown.
- El aprendizaje principal fue sostener evidencia verificable antes de la sustentación.

Frase de cierre: Esta sección transforma problemas técnicos en conocimiento reutilizable para el equipo.

### Integrante 5: Acta, SOW y capacitación

El acta, la declaración de trabajo y la capacitación permiten demostrar que el proyecto cerró con criterios de aceptación, entregables claros y una guía operativa para sustentación.

Ideas clave:

- El acta valida los objetivos de alto nivel al cierre.
- El SOW compara alcance comprometido, entregables realizados y exclusiones.
- La capacitación explica cómo levantar Docker, abrir la app, ejecutar pruebas y revisar evidencias.
- Se documenta expresamente que no debe usarse `docker compose down -v`.
- La demo se apoya en frontend, backend, Swagger y evidencias técnicas.

Frase de cierre: Estos documentos permiten que otra persona opere y sustente el proyecto sin depender solo del equipo desarrollador.

### Integrante 6: Trazabilidad, PMBOK y cierre final

La matriz de trazabilidad conecta la consigna, los documentos, las evidencias y el estado de cumplimiento, cerrando el proyecto desde una perspectiva PMBOK y académica.

Ideas clave:

- Cada requisito de cierre se vincula con un documento Markdown.
- Las evidencias técnicas respaldan calidad, seguridad, pruebas y operación.
- El control de configuración se sostiene con documentación versionable en GitHub.
- La rúbrica queda cubierta mediante informe final, registros, acta, SOW, capacitación y trazabilidad.
- El cierre final demuestra orden, verificabilidad y profesionalismo documental.

Frase de cierre: Con esta trazabilidad, el equipo demuestra que la entrega es revisable, auditable y alineada con la rúbrica.

## 6. Resumen de cumplimiento de la rúbrica

| Criterio de la rúbrica | Documento donde se evidencia | Evidencia concreta | Estado |
|---|---|---|---|
| Informe Final del Proyecto | `01-informe-final-proyecto.md` | Resumen ejecutivo, métricas, alcance y conclusiones | Cumple con evidencia |
| Informe Final de Lecciones Aprendidas | `02-lecciones-aprendidas.md` | Tabla de lecciones y acciones recomendadas | Cumple |
| Registro de Riesgos | `03-registro-riesgos.md` | Riesgos, impacto, respuesta y estado final | Cumple con evidencia |
| Registro de Incidentes | `04-registro-incidentes.md` | Incidentes reales y acciones correctivas | Cumple con evidencia |
| Registro de Impedimentos | `05-registro-impedimentos.md` | Obstáculos técnicos y mitigaciones | Cumple |
| Registro de Defectos | `06-registro-defectos.md` | Defectos, deuda técnica y validación | Cumple con observación |
| Registro de Supuestos | `07-registro-supuestos.md` | Supuestos validados al cierre | Cumple |
| Acta de Constitución | `08-acta-constitucion-cierre.md` | Criterios de éxito y validación al cierre | Cumple |
| Declaración de Trabajo | `09-declaracion-trabajo-sow.md` | Alcance comprometido, entregables y exclusiones | Cumple |
| Documentación de Capacitación | `10-documentacion-capacitacion.md` | Comandos de operación, pruebas y demo | Cumple con evidencia |
| Markdown y organización en repositorio | `README.md`, `Doc/06. CIERRE/` | Documentos versionables en Markdown | Cumple |
| Coherencia y trazabilidad documental | `11-matriz-trazabilidad-cierre.md` | Relación requisito-documento-evidencia | Cumple con evidencia |
| PMBOK y control de configuración | `README.md`, registros, matriz | Control de cierre, riesgos, incidentes y cambios | Cumple |
| Calidad técnica y redacción profesional | `calidad-integral/`, cierre completo | SonarQube, testing, OWASP, WCAG, SUS y Docker | Cumple con observación |

## 7. Evidencias que se deben mostrar en exposición

- GitHub: `Doc/06. CIERRE/`.
- `01-informe-final-proyecto.md`.
- `11-matriz-trazabilidad-cierre.md`.
- `calidad-integral/resumen-general-calidad-integral.md`.
- Dashboard final de SonarQube.
- Evidencia de testing frontend/backend.
- `calidad-integral/07-evidencias/docker-demo-funcionamiento.md`.
- Swagger: `http://localhost:8000/docs`.
- App frontend: `http://localhost:5173`.
- Evidencias WCAG.
- Resultados SUS.
- Matriz OWASP o evidencias de seguridad.

## 8. Orden recomendado de exposición

1. Abrir el repositorio GitHub.
2. Mostrar la carpeta `Doc/06. CIERRE/`.
3. Mostrar el `README.md` del cierre.
4. Mostrar el Informe Final del Proyecto.
5. Mostrar la carpeta de Calidad Integral.
6. Mostrar los registros de control: riesgos, incidentes, impedimentos y defectos.
7. Mostrar capacitación y comandos principales.
8. Mostrar la Matriz de Trazabilidad de Cierre.
9. Mostrar evidencias técnicas: SonarQube, testing, Docker, Swagger y app.
10. Cerrar con conclusiones y estado final del proyecto.

## 9. Frase final del equipo

El proyecto OptiAcademic culmina la fase de control y cierre con documentación técnica, administrativa y de gestión en formato Markdown, evidencias verificables, trazabilidad de entregables y control de configuración, demostrando el cumplimiento de la consigna y de los criterios de calidad establecidos para Taller de Proyectos 2.

## 10. Checklist antes de exponer

- [ ] GitHub actualizado.
- [ ] Rama `main` disponible para revisión.
- [ ] Documentos Markdown visibles en `Doc/06. CIERRE/`.
- [ ] App Docker funcionando.
- [ ] Swagger disponible.
- [ ] Evidencias abiertas o capturas listas.
- [ ] SonarQube disponible o captura final preparada.
- [ ] Pruebas documentadas.
- [ ] Cada integrante conoce su bloque de exposición.
- [ ] No abrir archivos con tokens, `.docker.env` ni credenciales locales.
