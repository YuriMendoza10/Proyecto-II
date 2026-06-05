# Fase 2 - Oferta Academica Por Periodo

## Proposito

La oferta academica convierte cursos de una malla en secciones planificables
para un periodo. La fuente curricular sigue siendo `curriculum_courses`; cada
apertura se registra en `section_offerings` con docente, aula, capacidad,
modalidad, turno y estado.

## Flujo Del Coordinador

1. Elegir periodo y plan curricular.
2. Crear secciones manualmente o mediante
   `POST /section-offerings/bulk-from-curriculum`.
3. Completar docente, aula, cupos y requisitos tecnicos.
4. Ejecutar `POST /offering-conflicts/analyze`.
5. Mover la oferta de `DRAFT` a `READY`, `APPROVED` y finalmente
   `PUBLISHED`.

El modulo frontend vive en `/coordinator/dashboard`,
`/coordinator/offerings` y `/coordinator/conflicts`.

## Estados Y Validacion

| Estado | Regla |
| --- | --- |
| `DRAFT` | Puede estar incompleto. |
| `READY` | Exige curso, ciclo y capacidad/cupos definidos. |
| `APPROVED` | No admite conflictos criticos; exige docente, aula activa, capacidad y disponibilidad. |
| `PUBLISHED` | Solo se alcanza desde `APPROVED` y vuelve a validar la oferta completa. |
| `CLOSED` | Conserva la trazabilidad de una oferta concluida. |

Los conflictos persistidos indican faltantes de docente/aula, capacidad,
inactividad, disponibilidad o incompatibilidad de aula.

## CSP Y Compatibilidad

`POST /institutional-csp/generate-from-offerings` valida ofertas `READY` o
`APPROVED` para preparar su uso por el motor institucional. Si no existen,
informa el fallback a `course_sections`. La generacion y persistencia actual
de bloques permanece intacta hasta introducir un adaptador de oferta a CSP.

## Visibilidad Estudiantil

`GET /section-offerings/published/me` devuelve solo secciones `PUBLISHED` del
periodo activo y ciclo asociado al estudiante. Las ofertas `DRAFT`, `READY` y
`APPROVED` nunca se exponen a ese rol. La pantalla `/student/offer` mantiene
el horario institucional publicado necesario para el generador personal.
