# Tareas: dashboard de impacto ambiental por endpoint

## 1. Persistencia MySQL

- [x] Definir la entidad o modelo de metrica ambiental con ruta, metodo, estado, bytes, duracion, CO2 estimado y fecha de registro.
- [x] Crear la tabla o migracion correspondiente en MySQL conforme a los patrones del backend.
- [x] Confirmar que la tabla ambiental no modifica relaciones ni datos funcionales existentes.

## 2. Calculo y servicio ambiental

- [x] Definir y documentar el factor de estimacion de emisiones por volumen transferido.
- [x] Implementar el calculo de `estimated_co2_g` a partir del tamano de respuesta.
- [x] Implementar las operaciones de registro, consulta de totales y agrupacion por endpoint.
- [x] Implementar la limpieza exclusiva de metricas ambientales para el inicio de la aplicacion.

## 3. Instrumentacion FastAPI

- [x] Incorporar middleware HTTP para medir respuestas elegibles de FastAPI.
- [x] Capturar ruta normalizada, metodo, estado HTTP, bytes de respuesta y tiempo de procesamiento.
- [x] Persistir una metrica sin alterar el cuerpo, estado o encabezados funcionales de la respuesta observada.
- [x] Definir y documentar el tratamiento de rutas tecnicas y del propio dashboard para evitar resultados ambiguos.
- [x] Manejar fallos de observabilidad sin romper endpoints funcionales existentes.

## 4. API y dashboards

- [x] Agregar `GET /api/v1/environmental-impact` como ruta HTML accesible sin autenticacion.
- [x] Agregar endpoints JSON de `summary`, `metrics` y `ranking` para roles administrativos.
- [x] Crear servicio React y pantalla `/admin/environmental-impact`.
- [x] Integrar acceso a la pantalla en rutas y menu de `ADMIN`/`COORDINATOR`.
- [x] Mostrar cards, ranking y metricas recientes con scroll, carga, vacio y errores.

## 5. Inicio y documentacion

- [x] Integrar la limpieza de registros ambientales en el ciclo de inicio del servidor.
- [x] Documentar que el dashboard representa metricas de la sesion activa tras cada arranque.
- [x] Documentar la adaptacion de la actividad original de Express + MongoDB a FastAPI + MySQL.
- [x] Documentar el caracter estimado del calculo, endpoints y ruta web.

## 6. Verificacion

- [x] Probar el calculo de CO2 estimado con tamanos de respuesta controlados.
- [x] Probar el registro y la consulta de metricas persistidas en MySQL.
- [x] Probar que el dashboard HTML y los endpoints JSON presentan los indicadores definidos.
- [x] Probar que las metricas se limpian al iniciar el servidor sin afectar otras tablas.
- [x] Ejecutar pruebas de integracion para confirmar que middleware, exclusiones y rutas existentes conservan su comportamiento.
