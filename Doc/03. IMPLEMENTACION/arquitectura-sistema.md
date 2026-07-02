# Arquitectura del Sistema

## Visión General

OptiAcademic usa una arquitectura web separada por responsabilidades. El
frontend gestiona la experiencia de usuario; el backend concentra reglas de
negocio, seguridad y API; MySQL conserva los datos; y el motor CSP genera y
evalúa horarios bajo restricciones académicas.

```text
Usuario
  ↓
Frontend React / Vite
  ↓ HTTP + JWT
API FastAPI
  ↓
Servicios, repositorios y motor CSP
  ↓ SQLAlchemy / Alembic
MySQL
```

Docker Compose orquesta los servicios locales y las herramientas de calidad y
pruebas verifican el comportamiento del PMV.

## Capas y Responsabilidades

| Capa | Responsabilidad | Tecnología | Evidencia |
|---|---|---|---|
| Presentación | UI/UX, navegación por roles, formularios y visualización | React, Vite, Tailwind CSS, Axios | `frontend/src/` |
| API | Endpoints HTTP, autenticación JWT y autorización | FastAPI, Pydantic | `backend/app/api/` |
| Aplicación | Casos de uso, validaciones y coordinación de reglas | Servicios Python | `backend/app/services/` |
| Dominio y datos | Entidades académicas y acceso persistente | SQLAlchemy | `backend/app/models/`, repositorios |
| Migraciones | Evolución controlada del esquema | Alembic | `backend/alembic/` |
| Persistencia | Usuarios, cursos, ofertas, horarios y bloques | MySQL | Servicio `mysql` en Docker Compose |
| Optimización | Generación y scoring de horarios | Motor CSP | Módulos CSP del backend |
| Orquestación | Ejecución reproducible de frontend, backend y BD | Docker Compose | `docker-compose.yml` |
| Calidad | Análisis estático y pruebas automatizadas | SonarQube, Vitest, Pytest, Playwright | `sonar-project.properties`, evidencias de cierre |

## Mantenibilidad y Escalabilidad

- La separación frontend/backend reduce acoplamiento entre UI y negocio.
- Los servicios y repositorios concentran responsabilidades específicas.
- Alembic mantiene trazabilidad del esquema sin recrear la base.
- La API permite integrar otros clientes sin reescribir el dominio.
- Docker Compose estandariza el entorno de desarrollo y demostración.
- El CSP está aislado como componente especializado de optimización.

La arquitectura actual sostiene el PMV. La escalabilidad futura debe abordar
observabilidad, pruebas de carga, ejecución asíncrona del CSP y despliegue por
entornos sin alterar los contratos existentes de manera no controlada.
