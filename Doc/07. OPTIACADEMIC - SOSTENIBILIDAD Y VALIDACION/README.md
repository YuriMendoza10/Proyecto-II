# Sostenibilidad Digital Y Optimizacion

Esta seccion integra el trabajo de sensibilizacion, diagnostico, implementacion
y validacion de optimizaciones sostenibles aplicado a `OptiAcademic`.

## Objetivo

Relacionar rendimiento y sostenibilidad digital con decisiones verificables
del proyecto. Menos solicitudes innecesarias, respuestas mas pequenas,
consultas eficientes y procesos controlados reducen consumo de red, CPU,
memoria y tiempo de ejecucion.

## Arquitectura Real

`OptiAcademic` usa:

- React, Vite, Tailwind CSS y Axios en el frontend;
- FastAPI, Python, SQLAlchemy y Alembic en el backend;
- MySQL como base de datos;
- Docker Compose para ejecucion local.

El material de clase puede mencionar MERN, MongoDB o Express como referencia.
Estas tecnologias no son el stack principal de `OptiAcademic`.

## Documentos

1. [Sensibilizacion sobre impacto ambiental](01-sensibilizacion-impacto-ambiental.md)
2. [Identificacion de oportunidades](02-identificacion-oportunidades.md)
3. [Implementacion de optimizaciones](03-implementacion-optimizaciones.md)
4. [Validacion de optimizaciones](04-validacion-optimizaciones.md)
5. [Matriz de optimizaciones OptiAcademic](05-matriz-optimizaciones-optiacademic.md)
6. [Plan de validacion y evidencias](06-plan-validacion-evidencias.md)
7. [Validacion Lighthouse](07-validacion-lighthouse.md)

## Evidencias Esperadas

- capturas antes y despues;
- resultados Lighthouse;
- tiempos de respuesta API;
- cantidad de solicitudes HTTP;
- tamanos de respuesta;
- build frontend exitoso;
- Swagger operativo;
- logs backend sin errores `500`;
- cantidad de ofertas elegibles y bloques generados en CSP.

Esta seccion complementa la documentacion ambiental operativa existente en
[docs/sostenibilidad](../../sostenibilidad/README.md).
