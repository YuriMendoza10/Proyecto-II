# Propuesta: analisis GreenFrame y reporte publico

## Resumen

Se propone integrar GreenFrame CLI en OptiAcademic para medir la huella de carbono estimada de un flujo critico de la aplicacion full-stack y publicar el ultimo reporte generado mediante FastAPI.

La actividad original se plantea para un proyecto MERN con Express y MongoDB. Esta propuesta la adapta a la arquitectura real de OptiAcademic: frontend React + Vite, backend FastAPI + SQLAlchemy + Alembic y base de datos MySQL. No se migrara la aplicacion a Node/Express, MongoDB ni MERN.

## Motivacion

El dashboard ambiental actual observa respuestas HTTP desde el backend. GreenFrame complementara esa medicion con un analisis reproducible del recorrido del usuario sobre la aplicacion completa, incluyendo frontend, backend y base de datos durante un escenario controlado.

Esto permitira:

- Medir un flujo representativo de OptiAcademic con una herramienta especializada.
- Conservar evidencia legible del ultimo analisis ejecutado.
- Exponer los resultados de forma publica para presentaciones y revision academica.
- Documentar el uso de Docker y GreenFrame sin cambiar la arquitectura del producto.

## Alcance

El cambio incluira:

- Archivo `.greenframe.yml` en la raiz del proyecto con la configuracion del analisis full-stack.
- Configuracion para los contenedores reales: frontend React, backend FastAPI y database MySQL, separando MySQL como contenedor de base de datos cuando GreenFrame lo soporte.
- Archivo `scenario.js` en la raiz del proyecto con un escenario Playwright exportado explicitamente mediante `module.exports`.
- Escenario de prueba con login usando credenciales de demostracion configurables, navegacion a una pantalla relevante y espera de estabilizacion de al menos 10 segundos.
- Script raiz `sustainability:analyze` que ejecute `greenframe analyze` y persista una salida de consola legible en `backend/public/assets/greenframe-latest.txt`.
- Endpoint FastAPI publico `GET /api/v1/sustainability` para consultar el ultimo reporte disponible.
- Documento `docs/sostenibilidad/02-greenframe-report.md`.
- Definicion de una posible integracion futura del reporte GreenFrame en la pantalla React `/admin/environmental-impact`, sin implementarla en esta fase.

## Compatibilidad y seguridad

- GreenFrame se incorporara como herramienta de analisis, no como dependencia funcional de las rutas existentes.
- El endpoint publico solo leera el reporte generado y no expondra secretos, tokens ni configuracion sensible.
- Las credenciales del escenario seran datos de prueba o variables de entorno documentadas; no se codificaran secretos reales.
- La integracion no modificara configuraciones criticas de produccion ni requerira cambiar MySQL por MongoDB.

## Fuera de alcance

- Implementar el analisis o el endpoint en esta propuesta.
- Construir o modificar la pantalla React para mostrar el reporte GreenFrame.
- Migrar el backend FastAPI a Express o Node.js.
- Migrar la base de datos MySQL a MongoDB.
- Publicar `GREENFRAME_SECRET_TOKEN`, `.env`, `venv` o `node_modules`.
- Establecer que un reporte GreenFrame representa medicion exacta del impacto real de produccion.

## Criterios de aceptacion

- Existe una planificacion OpenSpec completa para la integracion GreenFrame.
- El diseno describe la ejecucion basada en Docker para React + FastAPI + MySQL y el ciclo de vida del reporte.
- Las tareas cubren configuracion, escenario, automatizacion, endpoint publico, documentacion y verificacion.
- La solucion propuesta es coherente con OptiAcademic y no introduce Express, MongoDB ni una migracion a MERN.
