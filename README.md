# OptiAcademic

![React](https://img.shields.io/badge/React-Frontend-61DAFB?logo=react&logoColor=111)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?logo=mysql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)

**Sistema inteligente para generar, validar y publicar horarios académicos
universitarios.**

OptiAcademic es una aplicación web full-stack para planificación académica
universitaria. Centraliza la gestión de períodos, programas, malla curricular,
oferta académica, disponibilidad docente, aulas y horarios. Su flujo principal
usa un motor CSP institucional conectado a ofertas académicas modernas, con
publicación segura y portal por roles.

## Tecnologías

- Frontend: React, Vite, Tailwind CSS, Axios
- Backend: FastAPI, Python, SQLAlchemy, Alembic
- Base de datos: MySQL
- Contenedores: Docker Compose
- Optimización: paginación, caché, lazy loading, reducción de solicitudes HTTP
- Sostenibilidad: dashboard ambiental, CO₂ estimado, Lighthouse y documentación de evidencias

## Arquitectura Resumida

```text
Navegador
  |
  v
React + Vite :5173
  |  HTTP / JWT
  v
FastAPI :8000
  |
  | SQLAlchemy + Alembic
  v
MySQL :3306 (publicado localmente en :3307)
```

## Módulos Principales

| Módulo | Alcance |
| --- | --- |
| Autenticación | Login JWT, sesión persistente y protección por rol. |
| Dominio académico | Períodos, programas, planes curriculares y malla. |
| Base institucional Huancayo | Sede única, facultades y relaciones iniciales compatibles. |
| Estudiantes institucionales | Matrícula, carrera, plan curricular, ciclo e historial académico. |
| Oferta académica | Secciones por período, docentes, aulas, cupos y estados. |
| CSP institucional | Diagnóstico, vista previa, generación, guardado y publicación. |
| Portal coordinador | Gestión de oferta, conflictos, solicitudes y reportes. |
| Portal docente | Horario publicado, disponibilidad, carga y solicitudes de cambio. |
| Portal estudiante | Malla, oferta publicada y horarios personales. |
| Reportes | Panel ejecutivo, carga docente, aulas, estudiantes y CSV. |
| Trazabilidad | Notificaciones, auditoría y seguimiento de publicaciones. |
| Sostenibilidad | Métricas ambientales y soporte GreenFrame. |
| Accesibilidad web | Tema claro/oscuro, escala de texto, foco visible y navegación por teclado. |

## Roles

| Rol técnico | Vista principal |
| --- | --- |
| `ADMIN` | Administración completa, panel ejecutivo, auditoría y demo. |
| `COORDINATOR` | Oferta académica, CSP, solicitudes docentes y reportes. |
| `TEACHER` | Horario docente, disponibilidad, carga y solicitudes. |
| `STUDENT` | Malla, oferta publicada y generación de horario personal. |

## Inicio Rápido Con Docker

```powershell
docker compose --env-file .env.docker.example up --build -d
docker compose --env-file .env.docker.example exec backend alembic upgrade head
docker compose --env-file .env.docker.example exec backend python seed_realistic_demo.py
docker compose --env-file .env.docker.example exec backend python seed_uc_ingenieria_sistemas_curriculum.py
docker compose --env-file .env.docker.example exec backend python seed_uc_isi_offerings_ready_demo.py
docker compose --env-file .env.docker.example exec backend python seed_huancayo_institutional_base.py
docker compose --env-file .env.docker.example exec backend python seed_huancayo_students_history_demo.py
```

| Servicio | URL |
| --- | --- |
| Aplicación React | <http://localhost:5173> |
| Swagger FastAPI | <http://localhost:8000/docs> |
| API base | <http://localhost:8000/api/v1> |
| MySQL publicado | `localhost:3307` |

## Credenciales Demo

| Rol | Usuario | Contraseña |
| --- | --- | --- |
| Admin | `admin@optiacademic.com` | `admin123` |
| Coordinador | `coordinator@optiacademic.com` | `coordinator123` |
| Docente | `docente.demo1@optiacademic.com` | `docente123` |
| Estudiante | `estudiante.demo1@optiacademic.com` | `estudiante123` |

> Estas credenciales son solo para desarrollo y demostración.

## Flujo Rápido De Demo

1. Levantar servicios con Docker.
2. Ejecutar migraciones y seeds.
3. Iniciar sesión como administrador.
4. Ir a **Horarios → Generación institucional**.
5. Presionar **Preparar datos demo completo**.
6. Ejecutar **Vista previa**.
7. Generar horario.
8. Guardar solución.
9. Publicar horario.

## Documentación

| Sección | Descripción |
| --- | --- |
| [Proyecto](docs/01-proyecto/) | Introducción, tecnologías y decisiones técnicas |
| [Arquitectura](docs/02-arquitectura/) | Arquitectura general, backend, frontend y base de datos |
| [Instalación](docs/03-instalacion/) | Configuración local, Docker y mantenimiento Git |
| [Módulos](docs/04-modulos/) | Roles, permisos, estudiantes, coordinadores y motor CSP |
| [Demo](docs/05-demo/) | Flujo de demostración y preparación de datos |
| [Calidad](docs/06-calidad/) | Validaciones, pruebas y criterios de calidad |
| [Sostenibilidad y optimización](docs/06-calidad/sostenibilidad/) | Sensibilización, matriz de oportunidades y plan de evidencias |

Índice completo: [docs/README.md](docs/README.md).

## Endpoints Relevantes

| Método | Endpoint | Uso |
| --- | --- | --- |
| `POST` | `/api/v1/auth/login-json` | Autenticación del frontend. |
| `POST` | `/api/v1/admin/demo/prepare-institutional-csp` | Preparación demo completa. |
| `POST` | `/api/v1/institutional-csp/preview-from-offerings` | Vista previa desde oferta académica. |
| `POST` | `/api/v1/institutional-csp/generate-from-offerings` | Generación CSP moderna. |
| `POST` | `/api/v1/institutional-csp/save-offering-solution` | Guardar solución como horario institucional. |
| `PATCH` | `/api/v1/schedule-publication/{id}/publish-safe` | Publicación segura. |
| `GET` | `/api/v1/sustainability` | Reporte GreenFrame disponible. |
| `GET` | `/api/v1/student-academic-history` | Historial académico institucional. |
| `GET` | `/api/v1/students/{id}/academic-summary` | Resumen académico por estudiante. |

La referencia navegable completa está disponible en Swagger.

## Estado Del Proyecto

Proyecto académico funcional en evolución. Incluye frontend, backend,
persistencia MySQL, generación CSP, ejecución Docker, reportes, trazabilidad y
componentes de sostenibilidad. Antes de una demostración debe levantarse el
stack, aplicar migraciones y cargar datos demo.

## Autores

- Repositorio académico mantenido por `ArweNMera` y el equipo OptiAcademic.

## Licencia

No se ha publicado aún un archivo de licencia. Definir la licencia antes de
redistribuir el proyecto fuera del contexto académico.

## Documentación del proyecto

La documentación grupal se encuentra en:

- [01. INICIO](Doc/01.%20INICIO)
- [02. PLANIFICACION](Doc/02.%20PLANIFICACION)
- [03. IMPLEMENTACION](Doc/03.%20IMPLEMENTACION)
- [04. REVISION Y RETROSPECTIVA](Doc/04.%20REVISION%20Y%20RETROSPECTIVA)
- [05. LANZAMIENTO](Doc/05.%20LANZAMIENTO)
- [06. CIERRE](Doc/06.%20CIERRE)

La documentación técnica de sostenibilidad y validación se encuentra en:

- [07. OPTIACADEMIC - SOSTENIBILIDAD Y VALIDACION](Doc/07.%20OPTIACADEMIC%20-%20SOSTENIBILIDAD%20Y%20VALIDACION)