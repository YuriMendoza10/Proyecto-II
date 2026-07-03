# Parte 3 - Arquitectura y Tecnologías

## Responsable Sugerido

**Riveros Sumalabe Fredy**

## Criterios de Rúbrica que Cubre

- Organización del código fuente.
- Separación frontend/backend y arquitectura por capas.
- Separación de responsabilidades.
- Mantenibilidad, escalabilidad y buenas prácticas.

## Qué Debe Explicar

- El frontend es la capa de presentación y experiencia de usuario.
- El backend concentra API, seguridad y lógica de negocio.
- MySQL almacena la información académica.
- SQLAlchemy gestiona persistencia y Alembic controla migraciones.
- Docker Compose orquesta el entorno local.
- El CSP es el motor especializado de optimización de horarios.
- La separación reduce acoplamiento y facilita mantenimiento y evolución.

## Qué Debe Mostrar

1. Carpetas [`frontend/`](../../frontend/) y [`backend/`](../../backend/).
2. [`docker-compose.yml`](../../docker-compose.yml).
3. [Arquitectura del sistema](../03.%20IMPLEMENTACION/arquitectura-sistema.md).

## Tecnologías a Mencionar

React, Vite, Tailwind CSS, Axios, FastAPI, SQLAlchemy, Alembic, MySQL,
Docker Compose, SonarQube, Pytest, Vitest y Playwright.

## Guion Breve Sugerido

> OptiAcademic está organizado en frontend y backend con responsabilidades
> separadas. El frontend, desarrollado con React, Vite, Tailwind y Axios,
> gestiona la interfaz y la interacción por roles. El backend, construido con
> FastAPI, expone las APIs y concentra seguridad, validaciones, servicios y el
> motor CSP. MySQL conserva los datos mediante SQLAlchemy, mientras Alembic
> controla la evolución del esquema. Docker Compose permite levantar el
> entorno de forma reproducible. Esta separación reduce acoplamiento y facilita
> mantenimiento, pruebas y escalabilidad futura.

## Conexión con la Parte 4

> Con la arquitectura explicada, ahora se mostrará el funcionamiento real del
> PMV.
