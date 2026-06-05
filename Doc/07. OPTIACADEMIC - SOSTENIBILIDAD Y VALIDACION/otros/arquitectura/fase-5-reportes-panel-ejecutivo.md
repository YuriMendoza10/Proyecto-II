# Fase 5: Reportes Academicos Y Panel Ejecutivo

## Objetivo

La Fase 5 agrega lectura analitica para `ADMIN` y `COORDINATOR` sin crear
tablas nuevas. Los indicadores se calculan con la informacion operativa ya
persistida para el periodo activo o para el periodo solicitado mediante
`academic_period_id`.

## Fuentes De Datos

| Reporte | Fuentes principales |
| --- | --- |
| Resumen ejecutivo | periodos, programas, planes, ofertas, horarios, usuarios, conflictos y solicitudes |
| Carga docente | bloques de horarios institucionales `PUBLISHED`, ofertas y docentes |
| Uso de aulas | bloques publicados, aulas y turno de la oferta |
| Ofertas | `section_offerings` del periodo |
| Conflictos | `offering_conflicts` registrados por validacion |
| Horarios | `academic_schedules` institucionales y `schedule_blocks` |
| Estudiantes | `student_course_enrollments` y `student_schedules` |
| Solicitudes | `schedule_change_requests` |
| Sostenibilidad | `environmental_metrics` y archivo GreenFrame si existe |

La utilizacion de aulas usa como capacidad semanal referencial 75 horas
(lunes a viernes, de 07:00 a 22:00). El valor `published_at` del reporte de
horarios utiliza `updated_at` para horarios publicados, porque el esquema
actual no mantiene una marca historica separada de publicacion.

## Permisos

- `ADMIN` accede al panel ejecutivo y a todos los reportes desde `/admin`.
- `COORDINATOR` accede al panel de reportes y a vistas operativas de carga,
  aulas, ofertas, conflictos, horarios y solicitudes desde `/coordinator`.
- `TEACHER` conserva sus indicadores propios en el portal docente; no accede
  a `/api/v1/reports`.
- `STUDENT` no accede a reportes administrativos.

## Exportacion CSV

Los reportes de carga docente, uso de aulas, ofertas, conflictos y estudiantes
se pueden exportar mediante endpoints `/api/v1/reports/*/export.csv`. Los
archivos se generan en el momento y respetan el filtro `academic_period_id`.

## KPIs Principales

- `critical_conflicts`: conflictos criticos pendientes de resolucion.
- `students_with_enrollments`: estudiantes con cursos asignados en el periodo.
- `total_published_schedules`: horarios institucionales visibles a usuarios finales.
- `pending_change_requests`: solicitudes docentes pendientes de coordinacion.
- `latest_greenframe_result`: disponibilidad del ultimo analisis ambiental externo.

## Verificacion

Con los seeds de las fases previas cargados, iniciar sesion como administrador
o coordinador y abrir `/admin/executive-dashboard` o `/coordinator/reports`.
Las exportaciones CSV se descargan desde los botones de los reportes
detallados.
