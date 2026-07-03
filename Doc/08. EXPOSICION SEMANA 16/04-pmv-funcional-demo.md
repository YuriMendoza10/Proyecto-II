# Parte 4 - PMV Funcional y Demo

## Responsable

Torres Inche Ulises Yerko.

## Objetivo de esta parte

Demostrar que el PMV funciona localmente y responde de forma coherente al
problema de gestión y generación de horarios académicos.

## Resumen de lo que se hizo

OptiAcademic funciona con frontend, backend, Swagger y MySQL. El sistema
incluye login, dashboard y gestión de docentes, estudiantes, cursos, aulas,
horarios, CSP institucional, vista de horarios y reportes.

El entorno Docker fue recuperado sin eliminar volúmenes ni reiniciar la base.
La evidencia documenta frontend, backend y Swagger con HTTP 200, MySQL
saludable y Alembic en `k2085f6a7b2c (head)`.

## Qué criterio de la rúbrica cumple

- Implementación del PMV.
- Funcionalidad del sistema.
- Coherencia con la problemática.
- Valor agregado.
- Demostración del sistema.

## Evidencia resumida

Los servicios estuvieron disponibles en `localhost:5173`, `localhost:8000` y
`localhost:8000/docs`. Los datos recuperados fueron 226 usuarios, 68 docentes,
155 estudiantes, 75 cursos, 68 aulas, 22 horarios, 1,575 bloques, 68 ofertas y
1 período académico.

Estas cifras corresponden a la evidencia registrada durante la recuperación
del entorno; no deben presentarse como una medición realizada en tiempo real si
no se vuelve a verificar la base antes de exponer.

## Dónde está la evidencia completa

- <http://localhost:5173>.
- <http://localhost:8000>.
- <http://localhost:8000/docs>.
- `Doc/06. CIERRE/calidad-integral/07-evidencias/docker-demo-funcionamiento.md`.
- `Doc/06. CIERRE/13-checklist-final-repositorio-pfa.md`.
