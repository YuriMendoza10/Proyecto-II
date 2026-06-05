# OptiAcademic - Sostenibilidad Y Validacion

Esta carpeta centraliza la documentacion tecnica de `OptiAcademic` dentro del
repositorio compartido. Su objetivo es que el docente encuentre en una sola
ubicacion la arquitectura real del sistema, los modulos principales, las guias
de instalacion, las evidencias de calidad y la documentacion de sostenibilidad.

## Relacion Con La Rubrica

La carpeta agrupa los entregables usados para sustentar:

- sensibilizacion sobre impacto ambiental del software;
- identificacion de oportunidades de optimizacion;
- implementacion de mejoras sostenibles;
- validacion con evidencias y Lighthouse;
- documentacion tecnica de arquitectura, requerimientos, API, TDD y modulos.

## Arquitectura Real

`OptiAcademic` usa:

- Frontend: React, Vite, Tailwind CSS y Axios.
- Backend: FastAPI, Python, SQLAlchemy y Alembic.
- Base de datos: MySQL.
- Contenedores: Docker Compose.

El material de clase puede mencionar `MegaBlog`, MERN, MongoDB o Express como
referencia pedagogica. Esas tecnologias no son el stack principal de
`OptiAcademic`.

## Indice De Carpetas

| Carpeta | Contenido |
| --- | --- |
| [sostenibilidad](sostenibilidad/) | Actividades 2.1 a 2.4, matriz de optimizaciones, plan de evidencias y Lighthouse. |
| [proyecto](proyecto/) | Introduccion, tecnologias y decisiones tecnicas. |
| [arquitectura](arquitectura/) | Arquitectura general, frontend, backend y base de datos. |
| [instalacion](instalacion/) | Instalacion local, Docker y mantenimiento Git. |
| [modulos](modulos/) | Roles, permisos, motor CSP, estudiantes institucionales e historial academico. |
| [demo](demo/) | Flujo de demostracion y preparacion de datos. |
| [calidad](calidad/) | Validaciones, accesibilidad, sostenibilidad y calidad. |
| [api](api/) | Referencia operativa de endpoints y Swagger. |
| [requerimientos](requerimientos/) | Requerimientos funcionales y no funcionales. |
| [validacion-problema](validacion-problema/) | Evidencia de problema, analisis y encuestas. |
| [tdd](tdd/) | Estrategia, casos y evidencias TDD. |
| [presentacion](presentacion/) | Material de presentacion y guias de demo. |
| [sostenibilidad-tecnica](sostenibilidad-tecnica/) | Documentacion ambiental operativa complementaria. |
| [base-datos](base-datos/) | Documentacion de persistencia y datos. |
| [otros](otros/) | Documentos tecnicos migrados que no encajan en las secciones anteriores. |

## Documentos Clave De Sostenibilidad

- [Sensibilizacion sobre impacto ambiental](sostenibilidad/01-sensibilizacion-impacto-ambiental.md)
- [Identificacion de oportunidades](sostenibilidad/02-identificacion-oportunidades.md)
- [Implementacion de optimizaciones](sostenibilidad/03-implementacion-optimizaciones.md)
- [Validacion de optimizaciones](sostenibilidad/04-validacion-optimizaciones.md)
- [Matriz de optimizaciones OptiAcademic](sostenibilidad/05-matriz-optimizaciones-optiacademic.md)
- [Plan de validacion y evidencias](sostenibilidad/06-plan-validacion-evidencias.md)
- [Validacion Lighthouse](sostenibilidad/07-validacion-lighthouse.md)

## Evidencias Esperadas

- capturas antes y despues;
- resultados Lighthouse;
- tiempos de respuesta API;
- cantidad de solicitudes HTTP;
- tamanos de respuesta;
- build frontend exitoso;
- Swagger operativo;
- logs backend sin errores `500`;
- cantidad de ofertas elegibles y bloques generados en CSP.
