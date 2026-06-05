# 6. Módulo administrador y coordinador

## Funcionalidades

- Dashboard administrativo.
- Gestión de usuarios.
- Gestión de docentes.
- Gestión de estudiantes.
- Gestión de cursos.
- Gestión de aulas.
- Gestión de secciones.
- Preparación de datos.
- Diagnóstico CSP.
- Generación institucional.
- Publicación de horario.
- Evaluación de calidad.

## Flujo administrativo

```text
1. Revisar datos maestros.
2. Crear horario institucional base.
3. Ejecutar diagnóstico CSP.
4. Generar vista previa.
5. Seleccionar solución.
6. Guardar solución.
7. Revisar calidad.
8. Publicar horario.
```

## Rutas principales

| Ruta | Función |
|---|---|
| `/admin` | Dashboard |
| `/admin/users` | Usuarios |
| `/admin/teachers` | Docentes |
| `/admin/students` | Estudiantes |
| `/admin/courses` | Cursos |
| `/admin/classrooms` | Aulas |
| `/admin/sections` | Secciones |
| `/admin/schedules` | Horarios institucionales |
| `/admin/institutional-csp` | Motor CSP institucional |
| `/admin/data-readiness` | Preparación de datos |
| `/admin/schedule-quality` | Calidad de horario |

## Resultado esperado

El administrador genera y publica un horario institucional que luego será usado por los estudiantes.
