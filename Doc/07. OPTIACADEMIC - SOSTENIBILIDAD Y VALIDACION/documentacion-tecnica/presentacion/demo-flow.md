# Flujo De Sustentacion OptiAcademic

## Usuarios Demo

| Rol | Usuario | Clave |
| --- | --- | --- |
| `ADMIN` | `admin@optiacademic.com` | `admin123` |
| `COORDINATOR` | `coordinator@optiacademic.com` | `coordinator123` |
| `TEACHER` | `docente.demo1@optiacademic.com` | `docente123` |
| `STUDENT` | `estudiante.demo1@optiacademic.com` | `estudiante123` |

## Preparacion

```powershell
docker compose --env-file .env.docker.example up --build -d
docker compose --env-file .env.docker.example exec backend alembic upgrade head
docker compose --env-file .env.docker.example exec backend python seed_realistic_demo.py
docker compose --env-file .env.docker.example exec backend python seed_uc_ingenieria_sistemas_curriculum.py
docker compose --env-file .env.docker.example exec backend python seed_uc_isi_offerings_2026.py
docker compose --env-file .env.docker.example exec backend python seed_uc_isi_offerings_ready_demo.py
docker compose --env-file .env.docker.example exec backend python seed_uc_isi_student_enrollments_2026.py
docker compose --env-file .env.docker.example exec backend python seed_teacher_portal_demo.py
```

Frontend: `http://127.0.0.1:5173`

API: `http://127.0.0.1:8000/docs`

## Guion Recomendado

1. **Admin: panel ejecutivo**
   - Ruta: `/admin/executive-dashboard`
   - Mostrar KPIs del periodo, ofertas, horarios publicados, docentes,
     estudiantes, aulas, conflictos y sostenibilidad.

2. **Coordinador: oferta academica**
   - Ruta: `/coordinator/offerings`
   - Mostrar secciones por periodo, estados y filtros.

3. **Coordinador: generar CSP**
   - Ruta: `/coordinator/csp`
   - Generar desde ofertas `READY` o `APPROVED`, revisar score y guardar una
     solucion `DRAFT`.

3.1. **Admin/Coordinador: generacion institucional guiada**
   - Ruta: `/admin/institutional-csp`
   - Mostrar que ya no se escribe un ID manual.
   - Seleccionar **Crear nuevo horario** o un horario detectado.
   - Ver periodo activo, programa, plan y ciclos con controles guiados.
   - Confirmar que la fuente por defecto sea **Oferta academica moderna**:
     usa `section_offerings`, no el generador clasico de `course_sections`.
   - Presionar **Preparar datos demo completo**. El sistema completa todos los
     ciclos del plan activo, docentes, aulas y disponibilidad sin entrar a
     MySQL.
   - Ejecutar diagnostico, vista previa y generacion; los resultados aparecen
     como tarjetas, tablas y listas de problemas, no como JSON crudo.
   - Guardar una solucion para crear un horario `DRAFT` con bloques y luego
     publicar mediante validacion segura.
   - Abrir solo si hace falta el acordeon **Ver detalles tecnicos** para
     mostrar que el JSON queda disponible para depuracion.

4. **Coordinador/Admin: publicar horario**
   - Ruta: `/admin/institutional-csp` o flujo seguro disponible.
   - Publicar solo con validacion; explicar que estudiantes no ven borradores.

5. **Docente: horario y solicitud**
   - Rutas: `/teacher/dashboard`, `/teacher/schedule`,
     `/teacher/change-requests`
   - Mostrar horario publicado propio, carga y solicitud de cambio.

6. **Estudiante: horario personal**
   - Rutas: `/student/offer`, `/student/schedule-generator`,
     `/student/my-schedules`
   - Mostrar que se generan alternativas solo con cursos asignados.

7. **Notificaciones**
   - Ruta: `/notifications`
   - Mostrar avisos internos por rol y contador en la campana.

8. **Auditoria**
   - Ruta: `/admin/audit-logs`
   - Mostrar login, CSP, publicacion, solicitudes y exportaciones CSV.

9. **Reportes**
   - Rutas: `/admin/reports/*` o `/coordinator/reports/*`
   - Mostrar carga docente, uso de aulas, ofertas, conflictos, horarios y
     solicitudes.

10. **Sostenibilidad**
    - Rutas: `/admin/environmental-impact` y `/admin/reports/sustainability`
    - Mostrar metricas ambientales y mensaje GreenFrame si no existe reporte.

## Rutas Clave

| Rol | Rutas |
| --- | --- |
| `ADMIN` | `/admin/dashboard`, `/admin/executive-dashboard`, `/admin/audit-logs`, `/admin/traceability`, `/admin/environmental-impact` |
| `COORDINATOR` | `/coordinator/dashboard`, `/coordinator/offerings`, `/coordinator/csp`, `/coordinator/change-requests`, `/coordinator/reports` |
| `TEACHER` | `/teacher/dashboard`, `/teacher/schedule`, `/teacher/availability`, `/teacher/change-requests` |
| `STUDENT` | `/student`, `/student/curriculum`, `/student/offer`, `/student/schedule-generator`, `/student/my-schedules` |

## Notas Para La Demo

- Si una ruta falla, el Error Boundary muestra recuperacion y permite volver al
  dashboard.
- Refrescar con F5 en rutas internas debe mantener la sesion y reconstruir la
  vista.
- La exportacion PDF del estudiante se carga bajo demanda para no inflar el
  bundle principal.
- El menu lateral es colapsable por grupos; para la demo conviene abrir solo
  el grupo del flujo que se esta explicando.
