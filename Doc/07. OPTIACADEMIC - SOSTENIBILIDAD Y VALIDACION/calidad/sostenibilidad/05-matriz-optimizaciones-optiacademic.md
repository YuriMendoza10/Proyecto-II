# Matriz De Optimizaciones OptiAcademic

La matriz distingue mejoras ya aplicadas de propuestas pendientes. No implica
que todas deban implementarse en una sola fase.

| Capa | Problema detectado | Mejora aplicada o propuesta | Evidencia | Prioridad |
| --- | --- | --- | --- | --- |
| Frontend React | Carga inicial pesada cuando todas las pantallas se incluyen juntas. | Mantener division por rutas con `React.lazy`. | `frontend/src/App.jsx` y chunks del build Vite. | Alta |
| Frontend React | Componentes grandes en generacion y vistas de horarios. | Proponer separacion progresiva de subcomponentes y medicion de renders. | Revision de archivos CSP y horarios. | Media |
| Frontend React | Llamadas repetidas durante carga o efectos. | Auditar dependencias de `useEffect`, reutilizar datos estables y evaluar cache. | Network del navegador y lint React Hooks. | Alta |
| Frontend React | Rutas API visibles como informacion principal en reportes. | Mostrar nombres funcionales y conservar endpoints en detalle tecnico colapsable. | Reporte ambiental y `endpointLabels.js`. | Media |
| Frontend React | Accesibilidad visual desigual. | Mantener texto legible, foco visible, labels, tablas semanticas y tema claro/oscuro. | `index.css`, componentes comunes y Lighthouse. | Alta |
| Backend FastAPI | Algunos endpoints pueden devolver respuestas grandes. | Medir tamano de respuesta y proponer schemas especificos por pantalla. | Network, Swagger y reporte ambiental. | Alta |
| Backend FastAPI | Consultas repetidas entre reportes o dashboards. | Identificar rutas frecuentes y evaluar cache o agregacion controlada. | Ranking ambiental y logs API. | Media |
| Backend FastAPI | Reportes pesados bajo demanda. | Medir tiempos antes de optimizar consultas o introducir cache. | Tiempo promedio por endpoint. | Alta |
| Backend FastAPI | Errores `400` por datos incompletos en flujos institucionales. | Mejorar mensajes y validar readiness antes de generar. | Preview CSP y preparación demo completa. | Alta |
| Backend FastAPI | Validaciones duplicadas. | Centralizar reglas compartidas cuando la medicion confirme repeticion. | Revision de servicios Python. | Media |
| MySQL | Listados extensos sin paginacion uniforme. | Proponer paginacion gradual comenzando por listados de mayor volumen. | Tamaño de respuestas y consultas SQL. | Alta |
| MySQL | Consultas sin filtros suficientes. | Aplicar filtros por periodo, programa, sede y estado donde corresponda. | Swagger y consultas SQL revisadas. | Alta |
| MySQL | Indices faltantes en filtros frecuentes. | Revisar planes de consulta e incorporar indices mediante Alembic cuando exista evidencia. | `EXPLAIN`, migraciones e índices actuales. | Alta |
| MySQL | Reportes con muchos registros. | Optimizar agregaciones y evitar traer filas no utilizadas. | Tiempo de respuesta antes/despues. | Media |
| Docker / entorno | Contenedores activos cuando no se usan. | Levantar servicios solo durante desarrollo, pruebas o demo. | `docker compose ps` y guía de ejecución. | Baja |
| CSP / horarios | La generacion falla si las ofertas no estan `READY` o `APPROVED`. | Mantener validacion previa y preparación demo completa. | Preview desde ofertas y flujo demo. | Alta |
| CSP / horarios | Generar muchos bloques puede tardar. | Medir bloques y tiempo; conservar estrategia greedy para escenarios amplios. | Resumen de generacion y logs backend. | Alta |
| CSP / horarios | Un cambio pequeño puede provocar recalculo completo. | Evaluar recalculo parcial o invalidacion selectiva en una fase posterior. | Comparativa de ejecuciones CSP. | Media |
| Documentacion | Evidencias dispersas. | Centralizar sostenibilidad y optimizacion en esta seccion. | Índice de documentos. | Alta |
| Documentacion | Falta comparacion antes/despues uniforme. | Usar el plan de validacion y la plantilla de evidencias. | `06-plan-validacion-evidencias.md`. | Alta |
| Documentacion | Falta capturar Lighthouse y consola. | Registrar capturas antes/despues en cada ronda de optimizacion. | Carpeta o informe de evidencias. | Media |

## Recomendaciones De Bajo Riesgo

- Medir antes de introducir paginacion o cache.
- Priorizar endpoints con mayor tiempo o transferencia.
- Revisar deuda lint de React Hooks por lotes pequenos.
- Incorporar capturas Lighthouse en la siguiente ronda de validacion.
