# Propuesta: dashboard de impacto ambiental por endpoint

## Resumen

Se propone incorporar en OptiAcademic un mecanismo de observabilidad ambiental que estime el impacto de las respuestas HTTP atendidas por el backend. La funcionalidad registrara metricas por endpoint FastAPI, las persistira en MySQL y las mostrara en un dashboard React administrativo alimentado por endpoints JSON. Tambien conservara una vista HTML publica en `GET /api/v1/environmental-impact`.

Esta propuesta adapta una actividad originalmente planteada para Express y MongoDB a la arquitectura real del proyecto: frontend React, backend FastAPI y base de datos MySQL.

## Motivacion

Actualmente OptiAcademic no ofrece informacion sobre el volumen de datos entregado por sus endpoints ni una estimacion del CO2 asociado a esas respuestas. Incorporar esta medicion permite:

- Visibilizar el impacto ambiental estimado del uso de la API.
- Identificar endpoints con mayor transferencia de datos o mayor impacto acumulado.
- Comunicar el resultado mediante un panel demostrativo y accesible.
- Aplicar la actividad de clase sin sustituir la tecnologia existente del proyecto.

## Alcance

El cambio incluira:

- Medicion automatica del impacto ambiental estimado de respuestas HTTP procesadas por FastAPI.
- Registro por solicitud de la ruta o endpoint, metodo HTTP, codigo de estado, tamano de respuesta, tiempo de respuesta y CO2 estimado.
- Persistencia de las metricas ambientales en MySQL.
- Endpoints JSON de resumen, detalle y ranking bajo `/api/v1/environmental-impact/*`.
- Pantalla React administrativa en `/admin/environmental-impact`.
- Visualizacion HTML publica opcional mediante `GET /api/v1/environmental-impact`.
- Limpieza de las metricas ambientales al iniciar el servidor para que el dashboard represente la sesion de ejecucion actual.
- Documentacion de la formula o factor de estimacion utilizado y de su caracter aproximado.

## Compatibilidad

La instrumentacion sera transversal y no cambiara los contratos, permisos, datos de negocio ni respuestas funcionales de las rutas existentes. El nuevo dashboard sera adicional a la API vigente.

## Fuera de alcance

- Migrar la persistencia del proyecto a MongoDB.
- Reemplazar FastAPI por Express o ejecutar CO2.js como requisito de runtime.
- Tratar la estimacion como medicion fisica exacta del consumo energetico.
- Agregar autenticacion al dashboard publico.
- Implementar optimizaciones de endpoints a partir de los resultados.

## Criterios de aceptacion

- Las respuestas HTTP elegibles generan una metrica ambiental asociada a su endpoint FastAPI.
- Las metricas se almacenan y consultan desde MySQL.
- La pantalla `/admin/environmental-impact` presenta indicadores agregados, ranking y detalle reciente consumiendo la API real.
- `GET /api/v1/environmental-impact` permanece publico como dashboard HTML complementario.
- Al iniciar el servidor, los registros ambientales previos se eliminan antes de comenzar una nueva sesion de medicion.
- Las rutas preexistentes conservan su comportamiento observable, salvo el costo interno de instrumentacion.
- La documentacion declara explicitamente que la solucion es una adaptacion de la actividad a FastAPI + MySQL.
