# Fase 1 - Dominio Académico

## Objetivo

La Fase 1 añade el dominio base necesario para planificar oferta y horarios a
partir de una malla curricular: período, programa, plan, cursos por ciclo,
prerrequisitos y banco de electivos.

## Componentes

```text
React por rol
  -> /academic-periods, /academic-programs, /curriculum-plans
  -> /curriculum-courses, /course-prerequisites, /elective-bank-courses
  -> /students/me/curriculum, /students/me/eligible-courses
FastAPI
  -> AcademicCatalogService / CurriculumService
SQLAlchemy + Alembic
  -> MySQL: tablas curriculares aditivas
```

## Autorización

| Operación | Roles |
| --- | --- |
| Crear/editar/eliminar períodos, programas y planes | `ADMIN` |
| Crear/editar cursos de malla y prerrequisitos | `ADMIN`, `COORDINATOR` |
| Consultar malla de gestión | `ADMIN`, `COORDINATOR`, `TEACHER` |
| Consultar malla personal activa | `STUDENT` |

Los estudiantes solo obtienen planes `ACTIVE` y elementos activos mediante
endpoints personales. El servicio intenta asociar el plan activo a la carrera
del perfil y solo usa un fallback cuando existe un unico plan activo. No
tienen rutas de escritura del dominio curricular.

## Elegibilidad

`/students/me/eligible-courses` evalúa únicamente prerrequisitos marcados
`REQUIRED` como bloqueo. La carga inicial solo incluye relaciones
`RECOMMENDED`, porque la fuente entregada no confirma prerrequisitos oficiales.

## Decisiones De Datos

- Se implementa `elective_bank_courses` para permitir edición futura desde la
  aplicación.
- La distribución horaria inicial de cada curso es un dato operativo editable;
  se inicializa sin declarar una distribución oficial de teoría/práctica/lab.
- Existe una diferencia entre el total declarado (`221`) y la suma de cursos
  recibidos (`220`); se deja visible para validación académica.
