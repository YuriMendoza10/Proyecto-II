# OptiAcademic

**Sistema web inteligente para la planificación, generación, validación y publicación de horarios académicos mediante optimización basada en restricciones.**

OptiAcademic es una aplicación web Full Stack orientada a apoyar la gestión académica de una institución de educación superior. El sistema permite organizar información de estudiantes, docentes, aulas, cursos, facultades, campus, programas académicos, planes curriculares, secciones y ofertas académicas, con el propósito de generar horarios más consistentes, trazables y verificables.

El proyecto integra funcionalidades académicas, validaciones técnicas, generación de horarios mediante un motor de optimización basado en restricciones CSP, reportes administrativos, sostenibilidad digital y documentación formal de control y cierre del proyecto.

> La documentación oficial del repositorio compartido se encuentra centralizada en la carpeta [`Doc/`](Doc/).

---

## Imagen del equipo

> Agregar aquí la imagen oficial del grupo.

```md
![Equipo OptiAcademic](Doc/00.%20RECURSOS/equipo-optiacademic.jpg)
```

Si la imagen se guarda en otra ruta, actualizar el enlace correspondiente.

---

## Integrantes del equipo

* Mendoza Vilcahuaman Yuri Luigui
* Cajamarca Areche Reynaldo Elias
* Torres Inche Ulises Yerko
* Yarasca Batalla Jairo Ronald
* Riveros Sumalabe Fredy
* Zacarias Lopez Lenning Andree

---

## Problemática abordada

La planificación de horarios académicos es un proceso complejo porque debe considerar múltiples variables y restricciones, tales como:

* Disponibilidad docente.
* Capacidad de aulas.
* Tipos de aula: teoría, laboratorio, auditorio o virtual.
* Ciclos académicos.
* Secciones.
* Cursos.
* Periodos académicos.
* Restricciones institucionales.
* Necesidades de estudiantes.
* Cruces de horarios.
* Trazabilidad de cambios y publicación de horarios.

Cuando este proceso se realiza manualmente o con herramientas generales, pueden aparecer conflictos de horario, duplicidad de datos, baja trazabilidad, inconsistencias en la información y mayor carga administrativa.

OptiAcademic busca reducir estos riesgos mediante una plataforma web que centraliza la información académica, valida condiciones mínimas, permite generar horarios con apoyo de un motor CSP y facilita la revisión, publicación y seguimiento de las soluciones generadas.

---

## Justificación del PMV

El Producto Mínimo Viable de OptiAcademic se enfoca en el flujo esencial de planificación académica:

1. Registrar y consultar entidades académicas principales.
2. Preparar ofertas académicas para generación de horarios.
3. Validar condiciones mínimas antes de ejecutar el motor CSP.
4. Generar soluciones de horario institucional.
5. Revisar, guardar y publicar horarios.
6. Consultar reportes, auditoría, trazabilidad y notificaciones.
7. Documentar sostenibilidad, calidad, seguridad, accesibilidad y usabilidad.
8. Consolidar evidencias técnicas para la fase de control y cierre.

Este alcance permite demostrar el valor del sistema sin depender de una automatización total de todos los procesos institucionales. Además, permite validar progresivamente la solución mediante pruebas, métricas y evidencias verificables.

---

## Alcance del sistema

El sistema incluye:

* Autenticación y navegación por roles.
* Roles principales: administrador, coordinador, docente y estudiante.
* Gestión de usuarios.
* Gestión de docentes.
* Gestión de estudiantes.
* Gestión de aulas.
* Gestión de cursos.
* Gestión de secciones.
* Gestión institucional de facultades, campus, programas académicos y planes curriculares.
* Gestión de estudiantes institucionales e historial académico.
* Preparación de ofertas académicas.
* Generación institucional de horarios.
* Motor CSP para optimización basada en restricciones.
* Vista previa, guardado y publicación segura de soluciones.
* Vista de horarios.
* Reportes académicos y ejecutivos.
* Auditoría, trazabilidad y notificaciones.
* Reporte de sostenibilidad digital.
* Validación técnica mediante SonarQube, OWASP, WCAG, SUS y pruebas automatizadas.

---

## Tecnologías utilizadas

| Capa              | Tecnologías                                                             |
| ----------------- | ----------------------------------------------------------------------- |
| Frontend          | React, Vite, Tailwind CSS, Axios                                        |
| Backend           | FastAPI, Python, SQLAlchemy, Alembic                                    |
| Base de datos     | MySQL                                                                   |
| Contenedores      | Docker Compose                                                          |
| Optimización      | CSP, paginación, caché, reducción de solicitudes HTTP                   |
| Pruebas           | Vitest, Pytest, Playwright                                              |
| Calidad de código | SonarQube                                                               |
| Seguridad         | OWASP Top 10, npm audit, pip-audit                                      |
| Accesibilidad     | WCAG, Lighthouse, validación manual                                     |
| Usabilidad        | SUS                                                                     |
| Sostenibilidad    | Reporte ambiental, CO2 estimado, transferencia de datos, Green Software |

---

## Funcionalidades principales

* Panel administrativo y paneles por rol.
* Gestión de datos académicos.
* Gestión institucional para sedes, facultades y programas.
* Registro de estudiantes institucionales.
* Historial académico.
* Preparación de datos para generación de horarios.
* Motor CSP para generación institucional.
* Vista previa de soluciones.
* Guardado de horarios generados.
* Publicación segura de horarios.
* Vista de horarios por semana.
* Reportes de estudiantes, horarios, carga docente, aulas y conflictos.
* Auditoría y trazabilidad.
* Notificaciones.
* Reporte de sostenibilidad con nombres amigables para usuarios no técnicos.
* Modo claro y modo oscuro.

---

## Calidad integral del proyecto

Como parte de la revisión de calidad de la aplicación web Full Stack, se aplicaron estrategias de aseguramiento de calidad basadas en:

* SonarQube.
* OWASP Top 10.
* WCAG.
* SUS.
* Pruebas automatizadas.
* Validación Docker.
* Documentación de evidencias técnicas.

La documentación correspondiente se encuentra en:

```txt
Doc/06. CIERRE/calidad-integral/
```

### Resultados principales

| Área               | Resultado                                  |
| ------------------ | ------------------------------------------ |
| SonarQube          | Quality Gate: Passed                       |
| Bugs               | 0                                          |
| Vulnerabilities    | 0                                          |
| Code Smells        | 254                                        |
| Coverage SonarQube | 13.9 %                                     |
| Duplications       | 4.5 %                                      |
| Frontend Testing   | 51 pruebas aprobadas                       |
| Cobertura Frontend | 81.11 %                                    |
| Backend Testing    | 46 pruebas aprobadas, 5 omitidas           |
| Cobertura Backend  | 51 %                                       |
| Seguridad Backend  | 9 pruebas aprobadas                        |
| Playwright E2E     | 6 pruebas aprobadas, 3 omitidas            |
| Docker             | Entorno recuperado con datos reales        |
| Swagger            | Disponible en `http://localhost:8000/docs` |

---

## Datos recuperados en entorno Docker

Durante la fase de control y cierre se verificó el funcionamiento del entorno Docker con datos reales del sistema. Se corrigió una incompatibilidad de credenciales entre Docker Compose y el volumen MySQL existente, sin eliminar volúmenes y sin ejecutar seeds.

| Entidad             | Cantidad recuperada |
| ------------------- | ------------------: |
| Usuarios            |                 226 |
| Docentes            |                  68 |
| Estudiantes         |                 155 |
| Cursos              |                  75 |
| Aulas               |                  68 |
| Horarios            |                  22 |
| Bloques de horario  |               1,575 |
| Ofertas             |                  68 |
| Periodos académicos |                   1 |

Documento de evidencia:

```txt
Doc/06. CIERRE/calidad-integral/07-evidencias/docker-demo-funcionamiento.md
```

---

## Sostenibilidad y optimización

La documentación de sostenibilidad digital incluye sensibilización, identificación de oportunidades, implementación de mejoras y validación de resultados.

Las mejoras aplicadas o documentadas incluyen:

* Paginación en listados grandes.
* Reducción de llamadas HTTP duplicadas.
* Caché breve para catálogos estables.
* Uso de nombres amigables en reportes.
* Reporte ambiental con solicitudes, tiempo promedio, datos transferidos y CO2 estimado.
* Preparación de validación con Lighthouse.
* Consideración de criterios de Green Software.
* Documentación de impacto técnico, social y ambiental.

---

## Ejecución local con Docker

### Requisitos

* Docker Desktop.
* Git.
* Node.js, solo si se ejecutan pruebas o build fuera de Docker.

### Levantar el entorno

Desde la raíz del proyecto:

```powershell
cd D:\CHATTT\Proyecto-II-compartido

docker compose --env-file .docker.env up -d --build
```

Verificar contenedores:

```powershell
docker compose --env-file .docker.env ps
```

Ver logs rápidos:

```powershell
docker compose --env-file .docker.env logs --tail=100
```

### Abrir la aplicación

Frontend:

```txt
http://localhost:5173
```

Backend:

```txt
http://localhost:8000
```

Swagger:

```txt
http://localhost:8000/docs
```

### Detener sin borrar datos

```powershell
docker compose --env-file .docker.env stop
```

> No usar `docker compose down -v`, porque elimina volúmenes y puede borrar la base de datos.

---

## Migraciones

Si la base de datos requiere migraciones:

```powershell
docker compose --env-file .docker.env exec backend python -m alembic upgrade head
```

Estado documentado:

```txt
Alembic: k2085f6a7b2c (head)
```

---

## Pruebas y validación

### Pruebas frontend

```powershell
npm --prefix frontend run test
```

Resultado documentado:

```txt
12 archivos de prueba aprobados
51 pruebas aprobadas
Cobertura frontend: 81.11 %
```

### Pruebas backend con cobertura

```powershell
cd backend
py -m pytest --cov=app --cov-report=xml:coverage.xml --cov-report=html --cov-report=term
cd ..
```

Resultado documentado:

```txt
46 pruebas aprobadas
5 pruebas omitidas
Cobertura backend: 51 %
```

### Pruebas de seguridad backend

```powershell
cd backend
py -m pytest tests/test_security_core.py tests/test_semana13_integration_api.py -v
cd ..
```

Resultado documentado:

```txt
9 pruebas aprobadas
```

### Pruebas E2E

```powershell
npm --prefix frontend run e2e
```

Resultado documentado:

```txt
6 pruebas aprobadas
3 pruebas omitidas
```

---

## SonarQube

El análisis de calidad de código se ejecutó mediante SonarQube y SonarScanner.

Resultado final documentado:

```txt
Quality Gate: Passed
Bugs: 0
Vulnerabilities: 0
Code Smells: 254
Coverage: 13.9 %
Duplications: 4.5 %
```

Dashboard local:

```txt
http://localhost:9000/dashboard?id=optic2
```

Evidencias:

```txt
Doc/06. CIERRE/calidad-integral/02-sonarqube/
```

---

## Documentación del proyecto

Toda la documentación oficial se encuentra en la carpeta:

```txt
Doc/
```

Estructura principal:

```txt
Doc/
├── 01. INICIO/
├── 02. PLANIFICACION/
├── 03. IMPLEMENTACION/
├── 04. REVISION Y RETROSPECTIVA/
├── 05. LANZAMIENTO/
├── 06. CIERRE/
└── 07. OPTIACADEMIC - SOSTENIBILIDAD Y VALIDACION/
```

---

## Fase de control y cierre

La fase de control y cierre se encuentra consolidada en:

```txt
Doc/06. CIERRE/
```

Documentos principales:

| Documento                          | Descripción                                 |
| ---------------------------------- | ------------------------------------------- |
| `01-informe-final-proyecto.md`     | Informe final del proyecto                  |
| `02-lecciones-aprendidas.md`       | Informe final de lecciones aprendidas       |
| `03-registro-riesgos.md`           | Registro de riesgos                         |
| `04-registro-incidentes.md`        | Registro de incidentes o problemas          |
| `05-registro-impedimentos.md`      | Registro de impedimentos                    |
| `06-registro-defectos.md`          | Registro de defectos                        |
| `07-registro-supuestos.md`         | Registro de supuestos                       |
| `08-acta-constitucion-cierre.md`   | Acta de constitución revisada al cierre     |
| `09-declaracion-trabajo-sow.md`    | Declaración de trabajo                      |
| `10-documentacion-capacitacion.md` | Documentación de capacitación               |
| `11-matriz-trazabilidad-cierre.md` | Matriz de trazabilidad documental           |
| `12-exposicion-cierre-6.md`        | Resumen de exposición para seis integrantes |

---

## Entregables según rúbrica

El repositorio contiene evidencias relacionadas con:

* Proyecto web Full Stack funcional.
* Documentación en Markdown.
* Calidad de código con SonarQube.
* Seguridad basada en OWASP Top 10.
* Accesibilidad mediante WCAG.
* Usabilidad mediante SUS.
* Pruebas unitarias, integración, seguridad y E2E.
* Control y cierre del proyecto.
* Registros de riesgos, incidentes, impedimentos, defectos y supuestos.
* Acta de constitución revisada.
* Declaración de trabajo.
* Documentación de capacitación.
* Matriz de trazabilidad.
* Evidencias técnicas verificables.

---

## Estado de la entrega

El repositorio se encuentra organizado para revisión académica y sustentación. La documentación se mantiene centralizada en `Doc/`, con especial énfasis en:

```txt
Doc/06. CIERRE/
Doc/06. CIERRE/calidad-integral/
```

La entrega incluye código fuente, documentación técnica, evidencias de calidad, validación funcional, control de configuración y documentos de cierre en formato Markdown.

---

## Recomendaciones de uso del repositorio

* No hacer push directo a `main` sin revisión previa del equipo.
* No subir `.docker.env` ni tokens.
* No ejecutar `docker compose down -v`.
* Usar commits descriptivos.
* Mantener las evidencias dentro de `Doc/`.
* Validar el estado de Docker antes de la demo.
* Revisar que las rutas principales respondan antes de la sustentación.

---

## Licencia

Proyecto académico desarrollado con fines educativos para el curso Taller de Proyectos 2 - Ingeniería de Sistemas e Informática.

El uso, distribución o reutilización del proyecto debe coordinarse con los integrantes del equipo y respetar las normas de la institución.

---

## Evidencias

Las evidencias finales de validación se encuentran en:

```txt
Doc/06. CIERRE/calidad-integral/
Doc/06. CIERRE/evidencias/
```

Evidencias relevantes:

* SonarQube.
* OWASP.
* WCAG.
* SUS.
* Testing.
* Docker.
* Swagger.
* Frontend.
* Backend.
* Sostenibilidad.
* Control y cierre del proyecto.
