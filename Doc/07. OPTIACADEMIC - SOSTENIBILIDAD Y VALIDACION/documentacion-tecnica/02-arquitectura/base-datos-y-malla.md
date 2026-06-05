# 4. Base de datos y malla curricular

## Tablas principales

| Tabla | Descripción |
|---|---|
| `users` | Usuarios del sistema |
| `teachers` | Docentes |
| `students` | Estudiantes |
| `courses` | Cursos |
| `course_sections` | Secciones |
| `classrooms` | Aulas |
| `teacher_availabilities` | Disponibilidad docente |
| `academic_schedules` | Horarios institucionales |
| `schedule_blocks` | Bloques del horario institucional |
| `student_schedules` | Horarios guardados por estudiantes |
| `student_schedule_blocks` | Bloques del horario del estudiante |

## Malla curricular

Carrera: **Ingeniería de Sistemas e Informática**.

| Ciclo | Cursos | Créditos |
|---|---:|---:|
| 1 | 7 | 23 |
| 2 | 7 | 24 |
| 3 | 8 | 24 |
| 4 | 7 | 23 |
| 5 | 7 | 21 |
| 6 | 6 | 22 |
| 7 | 8 | 24 |
| 8 | 6 | 20 |
| 9 | 6 | 20 |
| 10 | 6 | 19 |

Total aproximado:

```text
68 cursos
220 créditos
```

## Verificación SQL

```sql
SELECT 
    cycle,
    COUNT(*) AS total_cursos,
    SUM(credits) AS total_creditos
FROM courses
WHERE career = 'Ingeniería de Sistemas'
GROUP BY cycle
ORDER BY cycle;
```

## Limpiar horarios generados

```sql
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE student_schedule_blocks;
TRUNCATE TABLE student_schedules;
TRUNCATE TABLE schedule_blocks;

SET FOREIGN_KEY_CHECKS = 1;
```
