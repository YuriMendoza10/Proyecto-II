# Malla Curricular ISI - Universidad Continental

## Alcance

La Fase 1 incorpora una malla base editable para **Ingeniería de Sistemas e
Informática** de la Universidad Continental. La información fue proporcionada
por el usuario para operación de la plataforma; no se presenta como documento
oficial de la universidad.

El plan cargado es `ISI-UC-2026`, con metadato de `10` ciclos y `221`
créditos. Los créditos de los cursos recibidos suman `220` y el ciclo 06
detalla `22` aunque fue rotulado como `23`; esta diferencia se conserva
documentada para revisión académica posterior.

## Modelo Relacional

| Tabla | Propósito |
| --- | --- |
| `academic_periods` | Períodos de operación, incluido `2026-I`. |
| `academic_programs` | Carrera `ISI` y universidad asociada. |
| `curriculum_plans` | Versiones de malla, fuente y vigencia. |
| `curriculum_courses` | Asociación del curso existente al ciclo y tipo de plan. |
| `course_prerequisites` | Relaciones editables entre cursos del mismo plan. |
| `elective_bank_courses` | Alternativas sugeridas agrupadas por mención. |

`curriculum_courses` referencia a `courses`; el seed reutiliza un curso por
código o nombre antes de crear uno nuevo con formato `ISI-CNN-NNN`.

## Electivos Y Prerrequisitos

- Los cursos marcados `is_suggested_elective=true` y el banco de electivos
  son sugerencias editables, no afirmaciones de oficialidad.
- Los diez prerrequisitos iniciales se almacenan como `RECOMMENDED`.
- Un prerrequisito `RECOMMENDED` orienta al estudiante y no bloquea
  elegibilidad.
- Solo una decisión académica posterior debería cambiar relaciones a
  `REQUIRED`.

## Seed

Con Docker:

```powershell
docker compose --env-file .env.docker.example exec backend python seed_uc_ingenieria_sistemas_curriculum.py
```

El seed es idempotente: actualiza el período, programa y plan identificados
por código; reutiliza cursos; y evita duplicar prerrequisitos o electivos.
