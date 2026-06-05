# 3. Requerimientos funcionales

Los requerimientos funcionales describen las acciones que el sistema debe permitir realizar.

## 3.1 Autenticación y seguridad

| Código | Requerimiento funcional | Prioridad |
|---|---|---|
| RF-001 | El sistema debe permitir iniciar sesión mediante correo y contraseña. | Alta |
| RF-002 | El sistema debe generar un token JWT después de una autenticación correcta. | Alta |
| RF-003 | El sistema debe restringir el acceso a módulos según el rol del usuario. | Alta |
| RF-004 | El sistema debe permitir cerrar sesión desde el frontend. | Media |
| RF-005 | El sistema debe proteger los endpoints privados del backend. | Alta |

## 3.2 Gestión de usuarios

| Código | Requerimiento funcional | Prioridad |
|---|---|---|
| RF-006 | El administrador debe poder registrar usuarios. | Alta |
| RF-007 | El administrador debe poder listar usuarios. | Alta |
| RF-008 | El administrador debe poder actualizar información de usuarios. | Media |
| RF-009 | El administrador debe poder desactivar o eliminar usuarios según corresponda. | Media |
| RF-010 | El sistema debe asociar cada usuario con un rol. | Alta |

## 3.3 Gestión de docentes

| Código | Requerimiento funcional | Prioridad |
|---|---|---|
| RF-011 | El sistema debe permitir registrar docentes. | Alta |
| RF-012 | El sistema debe permitir listar docentes. | Alta |
| RF-013 | El sistema debe permitir actualizar datos de docentes. | Media |
| RF-014 | El sistema debe permitir registrar disponibilidad docente. | Alta |
| RF-015 | El motor CSP debe considerar la disponibilidad docente. | Alta |

## 3.4 Gestión de estudiantes

| Código | Requerimiento funcional | Prioridad |
|---|---|---|
| RF-016 | El sistema debe permitir registrar estudiantes. | Alta |
| RF-017 | El sistema debe permitir listar estudiantes. | Alta |
| RF-018 | El sistema debe permitir asociar estudiantes con un usuario. | Alta |
| RF-019 | El sistema debe registrar el ciclo actual del estudiante. | Alta |
| RF-020 | El sistema debe permitir que el estudiante consulte su perfil académico. | Media |

## 3.5 Gestión de cursos

| Código | Requerimiento funcional | Prioridad |
|---|---|---|
| RF-021 | El sistema debe permitir registrar cursos. | Alta |
| RF-022 | El sistema debe permitir listar cursos. | Alta |
| RF-023 | El sistema debe almacenar créditos del curso. | Alta |
| RF-024 | El sistema debe almacenar ciclo académico del curso. | Alta |
| RF-025 | El sistema debe permitir filtrar cursos por ciclo o carrera. | Media |

## 3.6 Gestión de aulas

| Código | Requerimiento funcional | Prioridad |
|---|---|---|
| RF-026 | El sistema debe permitir registrar aulas. | Alta |
| RF-027 | El sistema debe permitir listar aulas. | Alta |
| RF-028 | El sistema debe registrar capacidad del aula. | Alta |
| RF-029 | El sistema debe registrar tipo de aula. | Media |
| RF-030 | El motor CSP debe evitar cruces de aula. | Alta |

## 3.7 Gestión de secciones

| Código | Requerimiento funcional | Prioridad |
|---|---|---|
| RF-031 | El sistema debe permitir crear secciones por curso. | Alta |
| RF-032 | El sistema debe asociar una sección con un docente. | Alta |
| RF-033 | El sistema debe definir cupos máximos para la sección. | Media |
| RF-034 | El sistema debe definir horas semanales por sección. | Alta |
| RF-035 | El motor CSP debe programar secciones según sus horas requeridas. | Alta |

## 3.8 Horario institucional

| Código | Requerimiento funcional | Prioridad |
|---|---|---|
| RF-036 | El sistema debe permitir crear un horario académico institucional. | Alta |
| RF-037 | El sistema debe permitir generar bloques de horario institucional. | Alta |
| RF-038 | El sistema debe permitir visualizar bloques generados en una grilla semanal. | Alta |
| RF-039 | El sistema debe permitir filtrar bloques por curso, docente, aula o sección. | Media |
| RF-040 | El sistema debe permitir evaluar la calidad del horario institucional. | Media |

## 3.9 Motor CSP institucional

| Código | Requerimiento funcional | Prioridad |
|---|---|---|
| RF-041 | El sistema debe ejecutar diagnóstico de dominios CSP. | Alta |
| RF-042 | El sistema debe indicar qué secciones son programables. | Alta |
| RF-043 | El sistema debe indicar razones cuando una sección no es programable. | Alta |
| RF-044 | El sistema debe generar una o más soluciones institucionales. | Alta |
| RF-045 | El sistema debe evitar cruces de docente. | Alta |
| RF-046 | El sistema debe evitar cruces de aula. | Alta |
| RF-047 | El sistema debe evitar cruces de sección. | Alta |
| RF-048 | El sistema debe distribuir horarios evitando concentración excesiva. | Media |
| RF-049 | El sistema debe permitir seleccionar una solución generada. | Alta |
| RF-050 | El sistema debe guardar la solución institucional seleccionada. | Alta |

## 3.10 Publicación de oferta académica

| Código | Requerimiento funcional | Prioridad |
|---|---|---|
| RF-051 | El sistema debe permitir publicar un horario institucional. | Alta |
| RF-052 | El sistema debe validar que el horario tenga bloques antes de publicarlo. | Alta |
| RF-053 | El sistema debe impedir que los estudiantes usen horarios no publicados. | Alta |
| RF-054 | El sistema debe mostrar al estudiante solo la oferta publicada. | Alta |
| RF-055 | El sistema debe mantener identificable el periodo académico publicado. | Media |

## 3.11 Módulo estudiante

| Código | Requerimiento funcional | Prioridad |
|---|---|---|
| RF-056 | El estudiante debe poder visualizar la oferta académica publicada. | Alta |
| RF-057 | El estudiante debe poder seleccionar cursos de la oferta. | Alta |
| RF-058 | El estudiante debe poder seleccionar docentes preferidos. | Media |
| RF-059 | El estudiante debe poder seleccionar docentes a evitar. | Media |
| RF-060 | El estudiante debe poder indicar días no disponibles. | Alta |
| RF-061 | El estudiante debe poder generar alternativas de horario. | Alta |
| RF-062 | El sistema debe mostrar varias alternativas de horario personal. | Alta |
| RF-063 | El sistema debe recomendar la mejor alternativa. | Media |
| RF-064 | El estudiante debe poder elegir una alternativa como horario final. | Alta |
| RF-065 | El estudiante debe poder consultar su horario final. | Alta |
| RF-066 | El estudiante debe poder exportar su horario final a PDF. | Media |

## 3.12 Dashboard

| Código | Requerimiento funcional | Prioridad |
|---|---|---|
| RF-067 | El administrador debe tener un dashboard con indicadores generales. | Media |
| RF-068 | El estudiante debe tener un dashboard con su horario activo. | Media |
| RF-069 | El dashboard estudiantil debe mostrar créditos y cursos. | Media |
| RF-070 | El dashboard estudiantil debe mostrar próximas clases si existen bloques. | Media |
