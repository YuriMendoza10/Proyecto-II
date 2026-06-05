# Fase 3: CSP conectado a ofertas e inscripciones

## Alcance

OptiAcademic distingue tres conceptos:

- **Oferta academica institucional**: `section_offerings` define secciones por periodo, docente, aula, cupos y estado.
- **Horario institucional generado**: el coordinador genera soluciones CSP desde ofertas `READY` o `APPROVED`; la solucion guardada crea `academic_schedules` y `schedule_blocks` en estado `DRAFT`.
- **Horario personal del estudiante**: se genera solo sobre cursos ya asignados en `student_course_enrollments` y secciones publicadas del periodo activo.

El proyecto no implementa matricula oficial desde cero. Los registros `ASSIGNED`/`ENROLLED` representan cursos ya asignados por la institucion para organizar horarios.

## Flujo coordinador

1. Preparar ofertas por periodo y llevarlas a `READY` o `APPROVED`.
2. Ejecutar `POST /api/v1/institutional-csp/generate-from-offerings`.
3. Comparar score, carga docente y uso de aulas en `/coordinator/csp`.
4. Guardar una alternativa con `POST /api/v1/institutional-csp/save-offering-solution`.
5. Publicar el horario `DRAFT` unicamente mediante publicacion segura.

El flujo anterior basado en `course_sections` se conserva cuando no existen ofertas.

## Restricciones

La generacion desde ofertas descarta estados `DRAFT`, `CLOSED` y `PUBLISHED`; comprueba docente activo, disponibilidad, aula requerida, capacidad y requisitos de aula. El CSP evita cruces de docente y aula, respeta turno y puede evitar cruces entre cursos del mismo ciclo.

La publicacion segura valida nuevamente bloques generados desde ofertas. Al publicar el horario, las ofertas asociadas pasan a `PUBLISHED`.

## Flujo estudiante

`GET /students/me/enrolled-courses` muestra asignaciones del periodo activo. `GET /students/me/published-sections` solo devuelve secciones de esos cursos que forman parte de horarios publicados. `POST /student-csp/generate-from-enrollments` y `/save-from-enrollments` generan y guardan horarios personales sin admitir cursos ajenos.

El modo exploracion anterior se mantiene diferenciado en la interfaz.

## Seeds

```bash
python seed_uc_isi_offerings_ready_demo.py
python seed_uc_isi_student_enrollments_2026.py
```

El primer script prepara ofertas aprobadas para pruebas CSP sin publicarlas automaticamente. El segundo crea asignaciones demo, no matriculas oficiales.
