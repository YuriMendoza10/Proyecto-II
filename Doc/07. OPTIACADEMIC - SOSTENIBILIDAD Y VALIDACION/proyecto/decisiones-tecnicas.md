# 13. Decisiones técnicas

## Separación frontend/backend

Se separó frontend y backend para mejorar mantenibilidad, escalabilidad y claridad.

## FastAPI

Se eligió FastAPI por su rendimiento, tipado, integración con Pydantic y documentación Swagger automática.

## React + Vite

React permite construir una interfaz dinámica y Vite agiliza el desarrollo.

## MySQL

MySQL permite representar correctamente entidades académicas y relaciones.

## CSP

El problema de horarios es naturalmente un problema de restricciones. Por eso CSP permite modelar variables, dominios y restricciones de manera clara.

## Scoring

El scoring permite diferenciar entre una solución válida y una solución recomendable.

## Oferta publicada

El estudiante solo debe generar horarios desde una oferta publicada para evitar usar datos incompletos o en prueba.

## Scripts de seed

Los scripts se usan para desarrollo y carga inicial. El flujo real debe hacerse desde la interfaz administrativa.
