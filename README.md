# OptiAcademic

Sistema web inteligente para la planificación, generación, validación y publicación de horarios académicos mediante optimización basada en restricciones.

OptiAcademic apoya la gestión académica de una institución de educación superior. El sistema permite organizar datos de estudiantes, docentes, aulas, cursos, facultades, campus, programas académicos y ofertas, con el objetivo de generar horarios más consistentes, trazables y verificables.

La documentación oficial del repositorio compartido está centralizada únicamente en la carpeta [Doc](Doc/).

## Integrantes Del Equipo

- Mendoza Vilcahuaman Yuri Luigui
- Cajamarca Areche Reynaldo Elias
- Torres Inche Ulises Yerko
- Yarasca Batalla Jairo Ronald
- Riveros Sumalabe Fredy
- Zacarias Lopez Lenning Andree

## Problematica Abordada

La planificación de horarios académicos es un proceso complejo porque debe considerar disponibilidad docente, capacidad de aulas, ciclos, secciones, cursos, periodos académicos, restricciones institucionales y necesidades de estudiantes.

Cuando este proceso se realiza manualmente o con herramientas generales, pueden aparecer cruces de horarios, duplicidad de datos, poca trazabilidad y mayor carga administrativa. OptiAcademic busca reducir esos riesgos mediante una plataforma web que centraliza información, valida datos y genera horarios con apoyo de un motor de optimización CSP.

## Justificacion Del PMV

El producto mínimo viable se enfoca en el flujo esencial de planificación académica:

- Registrar y consultar entidades académicas principales.
- Preparar ofertas académicas para generación de horarios.
- Validar condiciones mínimas antes de ejecutar el motor CSP.
- Generar, revisar, guardar y publicar soluciones de horario.
- Consultar reportes, auditoría, trazabilidad y notificaciones.
- Documentar sostenibilidad, optimización y validación técnica.

Este alcance permite demostrar el valor del sistema sin depender todavía de una automatización total de todos los procesos institucionales.

## Alcance Del Sistema

El sistema incluye:

- Autenticación y navegación por roles: administrador, coordinador, docente y estudiante.
- Gestión de usuarios, docentes, estudiantes, aulas, cursos y secciones.
- Gestión institucional de facultades, campus, programas académicos y planes curriculares.
- Gestión de estudiantes institucionales e historial académico.
- Preparación de ofertas académicas.
- Generación institucional de horarios.
- Publicación segura de horarios.
- Reportes académicos y ejecutivos.
- Auditoría, trazabilidad y notificaciones.
- Reporte de sostenibilidad digital y validación con Lighthouse.

## Tecnologias Reales

| Capa | Tecnologias |
|---|---|
| Frontend | React, Vite, Tailwind CSS, Axios |
| Backend | FastAPI, Python, SQLAlchemy, Alembic |
| Base de datos | MySQL |
| Contenedores | Docker Compose |
| Optimizacion | CSP, paginacion, cache, reduccion de solicitudes HTTP |
| Sostenibilidad | Reporte ambiental, CO2 estimado, transferencia, Lighthouse |

## Funcionalidades Principales

- Panel administrativo y paneles por rol.
- Gestión de datos académicos.
- Gestión institucional para sede, facultades y programas.
- Registro de estudiantes institucionales e historial académico.
- Preparación de datos para generación de horarios.
- Motor CSP para generación institucional.
- Vista previa, guardado y publicación segura de soluciones.
- Reportes de estudiantes, horarios, carga docente, aulas y conflictos.
- Auditoría, trazabilidad y notificaciones.
- Reporte de sostenibilidad con nombres amigables para usuarios no técnicos.
- Modo claro y modo oscuro.

## Sostenibilidad Y Optimizacion

La documentación de sostenibilidad digital incluye sensibilización, identificación de oportunidades, implementación de mejoras y validación de resultados.

Las mejoras aplicadas o documentadas incluyen:

- Paginación en listados grandes.
- Reducción de llamadas HTTP duplicadas.
- Caché breve para catálogos estables.
- Nombres amigables en reportes en lugar de rutas técnicas como información principal.
- Reporte ambiental con solicitudes, tiempo promedio, datos transferidos y CO2 estimado.
- Preparación de validación con Lighthouse.

## Ejecucion Local

Requisitos sugeridos:

- Docker Desktop.
- Node.js.
- Git.

Validar configuración de Docker Compose:

```powershell
docker compose --env-file .env.docker.example config --quiet
```

Levantar el entorno:

```powershell
docker compose --env-file .env.docker.example up --build -d
```

Ejecutar migraciones:

```powershell
docker compose --env-file .env.docker.example exec backend alembic upgrade head
```

Compilar frontend:

```powershell
npm --prefix frontend run build
```

## Pruebas Y Validacion

Las pruebas y verificaciones consideradas para la revisión incluyen:

- Build del frontend con Vite.
- Validación de configuración Docker Compose.
- Migraciones Alembic.
- Compilación del backend Python.
- Revisión de rutas críticas por rol.
- Verificación de reportes, auditoría, trazabilidad y notificaciones.
- Revisión de modo claro y modo oscuro.
- Validación manual con Lighthouse para rendimiento, accesibilidad y buenas prácticas.

## Documentacion

Toda la documentación del proyecto está centralizada en la carpeta [Doc](Doc/).

- [01. INICIO](Doc/01.%20INICIO/)
- [02. PLANIFICACION](Doc/02.%20PLANIFICACION/)
- [03. IMPLEMENTACION](Doc/03.%20IMPLEMENTACION/)
- [04. REVISION Y RETROSPECTIVA](Doc/04.%20REVISION%20Y%20RETROSPECTIVA/)
- [05. LANZAMIENTO](Doc/05.%20LANZAMIENTO/)
- [06. CIERRE](Doc/06.%20CIERRE/)
- [07. OPTIACADEMIC - SOSTENIBILIDAD Y VALIDACION](Doc/07.%20OPTIACADEMIC%20-%20SOSTENIBILIDAD%20Y%20VALIDACION/)
- [Entregables segun rubrica](Doc/06.%20CIERRE/entregables-rubrica/)
- [Evidencias finales](Doc/06.%20CIERRE/evidencias/)

## Estado De La Entrega

El repositorio se encuentra organizado para revisión académica. La documentación antigua del equipo fue preservada dentro de la estructura sucesiva de `Doc/`, y la documentación técnica de OptiAcademic se mantiene en la sección 07.

No se debe hacer push directo a `main` sin revisión previa del equipo.

## Licencia

Proyecto académico desarrollado con fines educativos. El uso, distribución o reutilización debe coordinarse con los integrantes del equipo y las normas de la institución.

## Evidencias

Las evidencias finales de validación se encuentran en:

- [Doc/06. CIERRE/evidencias](Doc/06.%20CIERRE/evidencias/)
