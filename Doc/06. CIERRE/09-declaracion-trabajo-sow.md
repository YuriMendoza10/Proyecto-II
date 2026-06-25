# Declaración de trabajo (SOW) revisada al cierre

## Introducción

Este documento formaliza el alcance comprometido, los entregables realizados, las exclusiones y los criterios de aceptación del proyecto OptiAcademic.

## Alcance comprometido

Desarrollar una aplicación web académica para gestionar información institucional y apoyar la generación óptima de horarios mediante un backend API, frontend web, base de datos relacional, contenedores y documentación de calidad.

## Entregables comprometidos

- Aplicación web funcional.
- Backend API REST.
- Frontend web.
- Base de datos MySQL.
- Docker Compose.
- Módulos académicos.
- Pruebas automatizadas.
- Documentación técnica.
- Evidencias de calidad.

## Entregables realizados

| Entregable | Estado |
|---|---|
| Aplicación web OptiAcademic | Realizado |
| Backend FastAPI | Realizado |
| Frontend React/Vite | Realizado |
| Base de datos MySQL | Realizado |
| Docker Compose | Realizado |
| Gestión de usuarios | Realizado |
| Gestión de docentes | Realizado |
| Gestión de estudiantes | Realizado |
| Gestión de cursos | Realizado |
| Gestión de aulas | Realizado |
| Gestión de horarios | Realizado |
| Generador CSP institucional | Realizado |
| Vista de horarios / schedule view | Realizado |
| Reportes académicos y sostenibilidad | Realizado |
| Pruebas automatizadas | Realizado |
| Análisis SonarQube | Realizado |
| Análisis OWASP | Realizado |
| Validación WCAG documental | Preparada |
| Evaluación SUS | Realizada como piloto académico |
| Documentación técnica y cierre | Realizado |

## Exclusiones

- Despliegue en nube productiva.
- Pipeline CI/CD completamente automatizado.
- Actualización forzada de dependencias vulnerables antes de regresión.
- Validación WCAG con capturas completas si no se adjuntan evidencias reales.
- SUS institucional masivo con muestra ampliada.

## Criterios de aceptación

| Criterio | Validación |
|---|---|
| La app levanta con Docker | `docker compose --env-file .docker.env up -d --build` |
| Backend responde | `http://localhost:8000` |
| Swagger responde | `http://localhost:8000/docs` |
| Frontend responde | `http://localhost:5173` |
| Base conserva datos | Conteos MySQL documentados |
| Pruebas frontend pasan | 51 pruebas aprobadas |
| Pruebas backend pasan | 46 pruebas aprobadas |
| SonarQube cumple | Quality Gate Passed |
| Seguridad documentada | OWASP y pruebas de seguridad |
| Usabilidad documentada | SUS 82.19 piloto |

## Limitaciones

- Evaluación en entorno local.
- Dependencia de Docker Desktop.
- Credenciales E2E requeridas para pruebas autenticadas.
- Cobertura SonarQube integrada inferior a coberturas locales.

## Mejoras futuras

- Incrementar cobertura global.
- Reducir code smells.
- Automatizar pipeline CI/CD.
- Aplicar SUS con muestra mayor.
- Configurar credenciales E2E para pruebas autenticadas.
- Optimizar CSP.
- Mejorar monitoreo de seguridad y logs.
- Planificar actualización controlada de dependencias.

## Cierre del SOW

El alcance esencial fue cumplido para el contexto académico. Las exclusiones y mejoras futuras quedan documentadas como parte del cierre y mantenimiento posterior.
