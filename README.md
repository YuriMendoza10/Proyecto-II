# 🚀 OptiAcademic  
## Aplicativo web inteligente para la planificación y automatización de horarios académicos mediante modelado de restricciones

OptiAcademic es un aplicativo web diseñado para apoyar la planificación, generación y validación de horarios académicos en instituciones de educación superior. El sistema utiliza un enfoque basado en restricciones para reducir cruces de horarios, validar disponibilidad docente, controlar capacidad de aulas y mejorar la organización de la oferta académica.

El proyecto integra una arquitectura web moderna con frontend en React, backend en FastAPI, base de datos MySQL y ejecución local mediante Docker Compose. Además, incorpora documentación de sostenibilidad digital, optimización de recursos y validación mediante métricas de rendimiento.

---

## 📑 Tabla de contenidos

- [👥 Integrantes del equipo](#-integrantes-del-equipo)
- [⚠️ Problemática abordada](#️-problemática-abordada)
- [📌 Justificación del PMV](#-justificación-del-pmv)
- [🧩 Alcance del sistema](#-alcance-del-sistema)
- [⚙️ Funcionalidades principales](#️-funcionalidades-principales)
- [🛠 Tecnologías utilizadas](#-tecnologías-utilizadas)
- [🌱 Sostenibilidad y optimización](#-sostenibilidad-y-optimización)
- [🚀 Ejecución local](#-ejecución-local)
- [🧪 Pruebas y validación](#-pruebas-y-validación)
- [📂 Documentación](#-documentación)
- [📌 Estado de la entrega](#-estado-de-la-entrega)
- [📄 Licencia](#-licencia)

---

## 👥 Integrantes del equipo

- Mendoza Vilcahuaman Yuri Luigui
- Cajamarca Areche Reynaldo Elias
- Torres Inche Ulises Yerko
- Yarasca Batalla Jairo Ronald
- Riveros Sumalabe Fredy
- Zacarias Lopez Lenning Andree

---

## ⚠️ Problemática abordada

La planificación de horarios académicos en instituciones de educación superior es un proceso complejo debido a la cantidad de restricciones que deben considerarse al mismo tiempo: disponibilidad docente, capacidad de aulas, carga horaria, secciones, ciclos académicos, prerrequisitos y cruces entre cursos.

Cuando este proceso se realiza manualmente o mediante herramientas genéricas, pueden presentarse problemas como:

- Cruces de horarios entre docentes, aulas o cursos del mismo ciclo.
- Dificultad para validar disponibilidad docente e infraestructura.
- Demora en la generación y corrección de horarios.
- Falta de trazabilidad sobre los criterios usados para construir la programación.
- Mayor carga administrativa para coordinadores y responsables académicos.
- Riesgo de generar horarios poco eficientes para estudiantes y docentes.

OptiAcademic aborda esta problemática mediante una plataforma web que permite organizar datos académicos, preparar la oferta institucional, generar horarios y validar restricciones de manera más controlada.

---

## 📌 Justificación del PMV

El Producto Mínimo Viable de OptiAcademic se enfoca en resolver el núcleo del problema: la generación y validación de horarios académicos sin conflictos lógicos.

El PMV es viable porque prioriza:

- Un motor de generación de horarios basado en restricciones.
- La gestión de entidades principales: estudiantes, docentes, cursos, aulas, facultades, campus, planes curriculares y ofertas académicas.
- La validación de disponibilidad docente y capacidad de aulas.
- La publicación segura de horarios institucionales.
- Reportes de apoyo para la toma de decisiones.
- Documentación de sostenibilidad y optimización del software.

Este enfoque permite validar la utilidad del sistema antes de una implementación institucional de mayor escala.

---

## 🧩 Alcance del sistema

OptiAcademic permite administrar y validar información académica relacionada con la planificación de horarios.

El alcance principal incluye:

- Gestión de usuarios y roles.
- Gestión de docentes, estudiantes, aulas, cursos y secciones.
- Gestión de facultades, campus y programas académicos.
- Gestión de planes curriculares e historial académico.
- Preparación de ofertas académicas.
- Generación de horarios institucionales.
- Generación de alternativas de horario para estudiantes.
- Reportes ejecutivos y académicos.
- Auditoría, trazabilidad y notificaciones.
- Reporte de sostenibilidad digital e impacto ambiental estimado.

---

## ⚙️ Funcionalidades principales

### Administración académica

- Registro y consulta de estudiantes institucionales.
- Registro de historial académico.
- Gestión de docentes, cursos, aulas, facultades y campus.
- Gestión de planes curriculares y programas académicos.

### Motor de horarios

- Preparación de ofertas académicas.
- Generación de horarios institucionales.
- Validación de restricciones.
- Publicación segura de horarios.
- Visualización de bloques horarios.

### Portal por roles

- Administrador.
- Coordinador.
- Docente.
- Estudiante.

### Reportes

- Panel ejecutivo.
- Reportes de estudiantes.
- Reportes de horarios.
- Reportes de aulas.
- Reportes de carga docente.
- Reporte de sostenibilidad.
- Auditoría y trazabilidad.

---

## 🛠 Tecnologías utilizadas

### Frontend

- React
- Vite
- Tailwind CSS
- Axios
- React Router
- Zustand

### Backend

- Python
- FastAPI
- SQLAlchemy
- Alembic
- Pydantic
- JWT para autenticación

### Base de datos

- MySQL

### Contenedores y entorno local

- Docker Compose
- Variables de entorno mediante `.env.docker.example`

### Optimización y sostenibilidad

- Paginación en listados grandes.
- Caché breve de catálogos.
- Reducción de solicitudes HTTP repetidas.
- Lazy loading en rutas React.
- Reporte ambiental con solicitudes, transferencia, tiempo promedio y CO₂ estimado.
- Validación con Lighthouse.

---

## 🌱 Sostenibilidad y optimización

El proyecto incorpora una sección de sostenibilidad digital orientada a reducir el consumo innecesario de recursos tecnológicos.

Las mejoras aplicadas o documentadas incluyen:

- Identificación de impactos ambientales del software.
- Optimización de listados mediante paginación.
- Reducción de cargas iniciales.
- Caché de datos estables.
- Nombres amigables en reportes.
- Modo claro y modo oscuro.
- Reporte de impacto ambiental.
- Plan de validación con Lighthouse.
- Documentación de evidencias antes y después de las optimizaciones.

La documentación correspondiente se encuentra en:

[Doc/07. OPTIACADEMIC - SOSTENIBILIDAD Y VALIDACION](Doc/07.%20OPTIACADEMIC%20-%20SOSTENIBILIDAD%20Y%20VALIDACION)

---

## 🚀 Ejecución local

### 1. Clonar el repositorio

```bash
git clone https://github.com/YuriMendoza10/Proyecto-II.git
cd Proyecto-II
