# Parte 3 - Arquitectura y Tecnologías

## Responsable

Riveros Sumalabe Fredy.

## Objetivo de esta parte

Demostrar que OptiAcademic tiene una arquitectura Full Stack organizada, con
responsabilidades separadas y tecnologías coherentes con el PMV.

## Resumen de lo que se hizo

El sistema separa frontend, backend, persistencia y optimización. El frontend
representa la capa de presentación UI/UX y utiliza React, Vite, Tailwind CSS y
Axios. El backend contiene las APIs y la lógica de negocio con FastAPI,
SQLAlchemy y Alembic.

MySQL conserva los datos académicos, Docker Compose orquesta el entorno y el
motor CSP resuelve la generación de horarios basada en restricciones. Esta
separación reduce acoplamiento y favorece mantenibilidad, pruebas y
escalabilidad.

## Qué criterio de la rúbrica cumple

- Organización del código fuente.
- Separación frontend/backend.
- Arquitectura por capas o características.
- Separación de responsabilidades.
- Mantenibilidad y escalabilidad.
- Buenas prácticas de desarrollo.
- Código organizado y documentado.

## Evidencia resumida

Las carpetas `frontend/` y `backend/` evidencian la separación principal. El
documento de arquitectura describe presentación, API, servicios, persistencia,
migraciones, CSP y orquestación. SonarQube, Pytest, Vitest y Playwright
complementan la validación técnica.

## Dónde está la evidencia completa

- `frontend/`.
- `backend/`.
- `docker-compose.yml`.
- `Doc/03. IMPLEMENTACION/arquitectura-sistema.md`.
- `README.md`, secciones Tecnologías y Arquitectura.

## Cómo explicarlo al docente

> En esta parte mostramos que OptiAcademic está dividido en frontend y backend
> con responsabilidades claras. El frontend usa React, Vite, Tailwind y Axios
> para la interfaz; el backend usa FastAPI para las APIs y la lógica de
> negocio, junto con SQLAlchemy y Alembic para persistencia y migraciones.
> MySQL almacena la información, Docker Compose levanta el entorno y el CSP se
> encarga de optimizar horarios. Esto se evidencia en las carpetas principales,
> el archivo Docker y el documento de arquitectura. Con esta separación
> cumplimos organización, mantenibilidad, escalabilidad y buenas prácticas. Si
> se requiere detalle, está en `arquitectura-sistema.md`.

## Qué mostrar durante la exposición

- Carpetas `frontend/` y `backend/`.
- `docker-compose.yml` sin abrir archivos de entorno.
- Diagrama textual de `arquitectura-sistema.md`.
- Tabla de tecnologías del README.

## Transición a la siguiente parte

> Con la arquitectura explicada, ahora se mostrará el funcionamiento real del
> PMV.
