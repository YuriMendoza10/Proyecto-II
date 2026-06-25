# Acta de constitución revisada al cierre

## Nombre del proyecto

**OptiAcademic: sistema web para generación y gestión óptima de horarios académicos.**

## Propósito

Proveer una plataforma web que permita gestionar información académica y generar horarios considerando restricciones de docentes, aulas, ciclos, programas, planes curriculares y disponibilidad.

## Problema que atiende

El proceso tradicional de elaboración de horarios presenta carga manual, estimación compleja de NRC, coordinación dispersa de disponibilidad docente, validación física de aulas/laboratorios, riesgo de traslapes y retrasos por datos incompletos.

## Objetivos de alto nivel

- Centralizar datos académicos.
- Generar horarios con criterios de optimización.
- Reducir cruces de asignaturas y conflictos operativos.
- Mejorar trazabilidad y reportabilidad.
- Incorporar calidad, seguridad, accesibilidad, usabilidad y sostenibilidad.

## Interesados principales

| Interesado | Interés |
|---|---|
| Administradores académicos | Gestión institucional y reportes |
| Coordinadores | Configuración de oferta y horarios |
| Docentes | Disponibilidad, carga y horario |
| Estudiantes | Consulta de oferta y horarios |
| Docente del curso | Evaluación técnica y documental |
| Equipo de desarrollo | Implementación y sustentación |

## Alcance de alto nivel

- Frontend React/Vite.
- Backend FastAPI.
- MySQL con migraciones Alembic.
- Docker Compose.
- Módulos académicos principales.
- Generador CSP institucional.
- Reportes y sostenibilidad.
- Documentación y pruebas.

## Requisitos de alto nivel

- Login y roles.
- CRUD académico principal.
- Gestión de horarios y bloques.
- Reportes.
- Ejecución local reproducible.
- Pruebas automatizadas.
- Evidencias de calidad integral.

## Criterios de éxito

| Criterio | Validación de cumplimiento al cierre |
|---|---|
| Aplicación web funcional | Frontend HTTP 200 |
| Backend operativo | Backend HTTP 200 y Swagger HTTP 200 |
| MySQL con datos recuperados | 226 usuarios, 68 docentes, 155 estudiantes, 22 horarios, 1575 bloques |
| Docker Compose operativo | Servicios `frontend`, `backend`, `mysql` activos |
| Migraciones vigentes | Alembic `k2085f6a7b2c (head)` |
| SonarQube Quality Gate Passed | Documentado en calidad integral |
| OWASP documentado | Matriz y riesgo residual documentado |
| WCAG documentado | Checklist y evidencias pendientes |
| SUS documentado | Evaluación piloto 82.19 |
| Pruebas automatizadas | Frontend 51, backend 46, seguridad 9 |
| Evidencias en repositorio | `Doc/06. CIERRE/` |

## Restricciones

- Entorno académico local.
- No exponer secretos.
- No borrar volúmenes Docker.
- No aplicar fixes forzados de dependencias sin regresión.
- No inventar evidencias.

## Riesgos iniciales

- Complejidad del motor CSP.
- Inconsistencia de datos académicos.
- Configuración local Docker.
- Cobertura de pruebas insuficiente.
- Vulnerabilidades de dependencias.

## Conclusión de cierre

El proyecto cumple los criterios centrales de funcionalidad, documentación y validación académica. Permanece apto para sustentación en entorno local controlado, con mejoras futuras planificadas para automatización, seguridad, cobertura y optimización algorítmica.
