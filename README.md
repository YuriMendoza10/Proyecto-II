# OptiAcademic

OptiAcademic es un sistema web académico orientado a la generación, validación y publicación de horarios universitarios. El proyecto combina gestión institucional, reportes, trazabilidad y optimización mediante CSP para apoyar la planificación académica de una sede universitaria.

Este repositorio corresponde a la integración final del proyecto compartido y centraliza la documentación oficial en la carpeta [Doc](Doc/).

## Descripción Breve

El sistema permite administrar información académica relevante, preparar datos institucionales, generar horarios desde ofertas académicas, publicar resultados de forma controlada y revisar reportes operativos. También incorpora una línea de sostenibilidad digital con métricas de consumo estimado, reducción de solicitudes HTTP, paginación y validación con Lighthouse.

## Integrantes Del Equipo

| Integrante | Rol | Responsabilidad principal |
|---|---|---|
| Mendoza Vilcahuaman Yuri Luigui | Scrum Master / Backend | Gestión del equipo y arquitectura del servidor |
| Cajamarca Areche Reynaldo Elias | Base de Datos | Diseño e integridad de la base de datos |
| Torres Inche Ulises Yerko | Algoritmos CSP | Desarrollo del motor de optimización |
| Yarasca Batalla Jairo Ronald | Full Stack | Integración frontend-backend |
| Riveros Sumalabe Fredy | Frontend | Interfaz de usuario y reportes |
| Zacarias Lopez Lenning Andree | QA / Datos | Pruebas y validación |
| Gamarra Moreno Daniel | Product Owner | Definición de requerimientos y validación |

## Problemática Abordada

La planificación de horarios académicos suele requerir coordinación entre carreras, docentes, aulas, periodos, secciones y restricciones institucionales. Cuando este proceso se realiza de forma manual, aumenta el riesgo de cruces, uso ineficiente de recursos, duplicidad de datos y poca trazabilidad para justificar los resultados.

OptiAcademic aborda esta problemática con una plataforma que organiza la información académica, valida condiciones mínimas, genera propuestas de horario y conserva evidencias para auditoría, reportes y mejora continua.

## Justificación Del PMV

El producto mínimo viable se enfoca en resolver el flujo principal de planificación académica:

- Registrar y consultar datos institucionales necesarios para la programación.
- Preparar ofertas académicas y condiciones iniciales.
- Generar horarios institucionales mediante optimización CSP.
- Revisar, guardar y publicar soluciones de horario.
- Consultar reportes, auditoría, trazabilidad y notificaciones.
- Incorporar criterios de sostenibilidad y accesibilidad visual.

Este alcance permite demostrar valor funcional sin esperar una automatización total de todos los procesos universitarios.

## Alcance Del Sistema

El alcance actual incluye:

- Gestión de usuarios y roles: administrador, coordinador, docente y estudiante.
- Gestión institucional de sede, facultades, programas, planes, estudiantes e historial académico.
- Administración de aulas, cursos, docentes, secciones y ofertas académicas.
- Generación institucional de horarios desde ofertas académicas.
- Publicación segura de soluciones de horario.
- Paneles, reportes, auditoría, trazabilidad y notificaciones.
- Reporte de sostenibilidad digital y preparación para validación con Lighthouse.

Quedan como mejoras posteriores la proyección masiva de demanda, reglas institucionales más avanzadas, analítica predictiva y validaciones con mayor volumen de datos reales.

## Tecnologías Reales

| Capa | Tecnologías |
|---|---|
| Frontend | React, Vite, Tailwind CSS, Axios |
| Backend | FastAPI, Python, SQLAlchemy, Alembic |
| Base de datos | MySQL |
| Contenedores | Docker Compose |
| Optimización | CSP, paginación, caché de catálogos, reducción de solicitudes HTTP |
| Sostenibilidad | Reporte ambiental, CO2 estimado, métricas de transferencia, Lighthouse |

## Funcionalidades Principales

- Autenticación y navegación por roles.
- Dashboard administrativo y paneles de coordinación.
- Gestión de facultades, campus, programas académicos y planes curriculares.
- Gestión de estudiantes institucionales e historial académico.
- Preparación de datos para generación institucional.
- Vista previa, generación, guardado y publicación segura de horarios.
- Reportes de estudiantes, horarios, carga docente, uso de aulas y conflictos.
- Auditoría, trazabilidad y notificaciones.
- Reporte de sostenibilidad con nombres amigables para usuarios no técnicos.
- Modo claro y modo oscuro en la interfaz.

## Sostenibilidad Y Optimización

La línea de sostenibilidad del proyecto documenta y aplica mejoras orientadas a reducir carga innecesaria y facilitar la validación de calidad:

- Paginación gradual en listados grandes.
- Reducción de llamadas HTTP duplicadas.
- Caché breve para catálogos estables.
- Nombres amigables en reportes en lugar de rutas técnicas como dato principal.
- Medición de solicitudes, tiempos de respuesta, transferencia y CO2 estimado.
- Preparación de evidencias con Lighthouse para rendimiento, accesibilidad y buenas prácticas.

La documentación detallada está en [Doc/07. OPTIACADEMIC - SOSTENIBILIDAD Y VALIDACION](Doc/07.%20OPTIACADEMIC%20-%20SOSTENIBILIDAD%20Y%20VALIDACION/).

## Ejecución Local

Requisitos sugeridos:

- Docker Desktop.
- Node.js para tareas del frontend fuera de contenedores.
- Git.

Ejecución con Docker Compose:

```powershell
docker compose --env-file .env.docker.example config --quiet
docker compose --env-file .env.docker.example up --build -d
docker compose --env-file .env.docker.example exec backend alembic upgrade head
```

Compilación del frontend:

```powershell
npm --prefix frontend install
npm --prefix frontend run build
```

Verificación del backend:

```powershell
docker compose --env-file .env.docker.example exec backend python -m compileall app alembic
```

## Pruebas Y Validación

Las validaciones consideradas para la entrega incluyen:

- Build del frontend con Vite.
- Validación de configuración de Docker Compose.
- Migraciones de base de datos con Alembic.
- Compilación del backend Python.
- Revisión de rutas críticas por rol.
- Revisión de reportes, auditoría, trazabilidad y notificaciones.
- Validación manual de modo claro y modo oscuro.
- Validación de sostenibilidad y accesibilidad con Lighthouse.

Las plantillas y evidencias se organizan en [Doc/07. OPTIACADEMIC - SOSTENIBILIDAD Y VALIDACION/sostenibilidad](Doc/07.%20OPTIACADEMIC%20-%20SOSTENIBILIDAD%20Y%20VALIDACION/sostenibilidad/).

## Documentación Centralizada En Doc

Toda la documentación oficial del repositorio compartido está centralizada en [Doc](Doc/). No se mantiene una segunda carpeta de documentación en la raíz.

| Sección | Ubicación |
|---|---|
| Inicio y organización del equipo | [Doc/01. INICIO](Doc/01.%20INICIO/) |
| Planificación | [Doc/02. PLANIFICACION](Doc/02.%20PLANIFICACION/) |
| Implementación | [Doc/3. IMPLEMENTACION](Doc/3.%20IMPLEMENTACION/) |
| Entregables del equipo | [Doc/ENTREGABLES](Doc/ENTREGABLES/) |
| Entregables parciales | [Doc/ENTREGABLES-PARCIAL](Doc/ENTREGABLES-PARCIAL/) |
| OptiAcademic, sostenibilidad y validación | [Doc/07. OPTIACADEMIC - SOSTENIBILIDAD Y VALIDACION](Doc/07.%20OPTIACADEMIC%20-%20SOSTENIBILIDAD%20Y%20VALIDACION/) |

## Estado De La Entrega

El repositorio se encuentra en integración final para revisión académica. La rama de trabajo compartida conserva la documentación histórica del equipo y agrega la documentación técnica de OptiAcademic dentro de `Doc/`.

No se debe hacer push directo a `main` sin revisión previa del equipo.

## Licencia

Proyecto académico desarrollado con fines educativos. El uso, distribución o reutilización debe coordinarse con los integrantes del equipo y las normas de la institución.
