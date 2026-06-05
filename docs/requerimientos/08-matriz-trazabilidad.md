# 8. Matriz de trazabilidad

La matriz de trazabilidad permite relacionar los requerimientos funcionales con los módulos del sistema y los actores involucrados.

## 8.1 Trazabilidad de requerimientos funcionales principales

| Código | Requerimiento | Módulo | Actor |
|---|---|---|---|
| RF-001 | Iniciar sesión | Autenticación | Todos |
| RF-003 | Restringir acceso por rol | Seguridad | Todos |
| RF-006 | Registrar usuarios | Usuarios | Administrador |
| RF-011 | Registrar docentes | Docentes | Admin / Coordinador |
| RF-016 | Registrar estudiantes | Estudiantes | Admin / Coordinador |
| RF-021 | Registrar cursos | Cursos | Admin / Coordinador |
| RF-026 | Registrar aulas | Aulas | Admin / Coordinador |
| RF-031 | Crear secciones | Secciones | Admin / Coordinador |
| RF-036 | Crear horario institucional | Horarios | Admin / Coordinador |
| RF-041 | Ejecutar diagnóstico CSP | CSP institucional | Admin / Coordinador |
| RF-044 | Generar soluciones institucionales | CSP institucional | Admin / Coordinador |
| RF-051 | Publicar horario | Publicación | Admin / Coordinador |
| RF-056 | Visualizar oferta publicada | Oferta académica | Estudiante |
| RF-061 | Generar alternativas personales | CSP estudiante | Estudiante |
| RF-064 | Elegir horario final | Horario estudiante | Estudiante |
| RF-066 | Exportar horario a PDF | Reportes | Estudiante |

## 8.2 Requerimientos y entidades relacionadas

| Código | Entidades relacionadas |
|---|---|
| RF-006 | users |
| RF-011 | teachers, users |
| RF-016 | students, users |
| RF-021 | courses |
| RF-026 | classrooms |
| RF-031 | course_sections, courses, teachers |
| RF-036 | academic_schedules |
| RF-037 | schedule_blocks, academic_schedules |
| RF-041 | course_sections, teachers, classrooms, schedule_blocks |
| RF-051 | academic_schedules |
| RF-056 | academic_schedules, schedule_blocks, courses |
| RF-061 | student_schedules, student_schedule_blocks |
| RF-066 | student_schedules, student_schedule_blocks |

## 8.3 Requerimientos por prioridad

| Prioridad | Requerimientos |
|---|---|
| Alta | RF-001, RF-003, RF-011, RF-016, RF-021, RF-026, RF-031, RF-036, RF-041, RF-044, RF-051, RF-056, RF-061, RF-064 |
| Media | RF-004, RF-008, RF-013, RF-025, RF-029, RF-039, RF-040, RF-058, RF-059, RF-066, RF-067, RF-068 |
| Baja | Puede definirse para mejoras futuras |

## 8.4 Trazabilidad con casos de uso

| Caso de uso | Requerimientos relacionados |
|---|---|
| CU-001 Iniciar sesión | RF-001, RF-002, RF-003 |
| CU-002 Gestionar cursos | RF-021, RF-022, RF-023, RF-024 |
| CU-003 Gestionar docentes | RF-011, RF-012, RF-014 |
| CU-004 Generar horario institucional | RF-036, RF-041, RF-044, RF-045, RF-046, RF-047 |
| CU-005 Publicar horario | RF-051, RF-052, RF-053 |
| CU-006 Visualizar oferta | RF-054, RF-056, RF-057 |
| CU-007 Generar horario personal | RF-061, RF-062, RF-063 |
| CU-008 Elegir horario final | RF-064, RF-065 |
| CU-009 Exportar PDF | RF-066 |
