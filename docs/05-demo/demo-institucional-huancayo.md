# Demo Institucional Huancayo

## Preparar La Base

Con Docker activo, aplicar migraciones y ejecutar el seed idempotente:

```powershell
docker compose --env-file .env.docker.example exec backend alembic upgrade head
docker compose --env-file .env.docker.example exec backend python seed_huancayo_institutional_base.py
docker compose --env-file .env.docker.example exec backend python seed_huancayo_students_history_demo.py
```

## Resultado Esperado

- existe `Sede Huancayo`;
- existen cinco facultades demo;
- programas, aulas, ofertas y horarios previos conservan su funcionamiento;
- los registros existentes quedan asociados progresivamente a la sede;
- el flujo vigente de generación institucional sigue disponible.
- existen perfiles institucionales demo e historial parcial idempotente;
- el resumen del seed informa estudiantes e historiales creados o actualizados.

## Pantallas

Iniciar sesión como administrador y abrir:

```text
/admin/faculties
/admin/campuses
/admin/institutional-students
/admin/academic-history
/admin/institutional-csp
```

La Fase 11 agrega una muestra de 150 estudiantes para preparar la futura
demanda académica. La proyección, el cálculo de demanda y la generación masiva
corresponden a la Fase 12 y posteriores.
