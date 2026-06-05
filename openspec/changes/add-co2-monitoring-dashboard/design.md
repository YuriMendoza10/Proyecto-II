# Diseno tecnico: dashboard de impacto ambiental por endpoint

## Contexto

OptiAcademic usa React para el frontend, FastAPI para la API y MySQL para persistencia. La actividad de referencia describe medicion ambiental en Express con MongoDB; este diseno conserva el objetivo didactico y lo integra de forma nativa en la arquitectura actual.

La estimacion Python se plantea como equivalente funcional al uso academico de
CO2.js, sin agregar Node.js ni sustituir el backend FastAPI.

## Decisiones

### Instrumentacion en FastAPI

Se incorporara un middleware HTTP del backend para observar solicitudes y respuestas sin intervenir en la logica propia de cada endpoint.

Flujo previsto:

```text
Solicitud HTTP
  -> middleware ambiental inicia temporizador
  -> router y endpoint FastAPI procesan la solicitud
  -> middleware obtiene estado, ruta normalizada y tamano de respuesta
  -> servicio calcula CO2 estimado y guarda la metrica en MySQL
  -> respuesta original se entrega al cliente
```

La ruta guardada debe representar el patron del endpoint cuando FastAPI lo permita, por ejemplo `/api/v1/courses/{course_id}`, en vez de generar una agrupacion distinta por cada identificador recibido.

### Datos registrados

Cada respuesta medida almacenara como minimo:

| Campo | Proposito |
| --- | --- |
| `id` | Identificador de la metrica. |
| `recorded_at` | Fecha y hora de registro. |
| `http_method` | Metodo HTTP de la solicitud. |
| `endpoint_path` | Ruta normalizada del endpoint. |
| `status_code` | Codigo HTTP devuelto. |
| `response_bytes` | Tamano de la respuesta usado para la estimacion. |
| `response_time_ms` | Duracion total observada por el middleware. |
| `estimated_co2_g` | Emisiones estimadas en gramos de CO2 equivalente. |

La tabla MySQL sera exclusiva para observabilidad ambiental y no tendra dependencias funcionales con cursos, horarios, usuarios u otras entidades de negocio.

### Calculo estimado

La estimacion se basara en el volumen de respuesta transferido y en un factor documentado de emisiones por unidad de datos:

```text
response_gb = response_bytes / (1024 ^ 3)
estimated_co2_g = response_gb * emissions_factor_g_per_gb
```

El factor elegido debera estar centralizado y documentado para que el valor pueda auditarse o reemplazarse posteriormente. El dashboard lo presentara como una estimacion, no como una medicion exacta.

### Persistencia y limpieza al inicio

Un servicio ambiental encapsulara el calculo, la escritura de registros y las consultas agregadas. La persistencia utilizara MySQL y los patrones de acceso a datos ya usados por el backend.

Durante el evento de inicio de la aplicacion, una operacion de limpieza eliminara los registros de la tabla ambiental. Esta decision limita las cifras a la sesion activa del servidor y cumple el objetivo de la actividad. No se eliminara informacion de otras tablas.

### API y dashboard React

Se agregaran endpoints JSON para la vista administrativa React:

```http
GET /api/v1/environmental-impact/summary
GET /api/v1/environmental-impact/metrics
GET /api/v1/environmental-impact/ranking
```

La pantalla `/admin/environmental-impact` consumira estos endpoints para
mostrar indicadores, metricas recientes y ranking por endpoint. El acceso a
la pantalla y a sus endpoints JSON seguira el control de roles existente para
`ADMIN` y `COORDINATOR`.

### Dashboard HTML publico opcional

Se agregara el endpoint publico:

```http
GET /api/v1/environmental-impact
```

La respuesta ofrecera una vista de monitoreo ambiental utilizable sin autenticacion. Podra entregarse como HTML renderizado por el backend o mediante el formato que siga el patron vigente del proyecto, siempre que el acceso publico y la visualizacion requerida se conserven.

La vista React y, como apoyo, la pagina HTML mostraran como minimo:

- Total de solicitudes medidas.
- Total de bytes observados.
- Total de CO2 estimado.
- Tiempo de respuesta promedio o resumen equivalente.
- Agrupacion o ranking de endpoints por impacto estimado.
- Detalle de metricas recientes, ordenado desde la mas reciente.

Las tablas de detalle deberan tolerar multiples registros mediante desplazamiento cuando la presentacion lo requiera.

### Proteccion del comportamiento existente

El middleware observara la respuesta producida por el endpoint y la devolvera con el mismo cuerpo, estado y encabezados funcionales. Un fallo al generar una metrica no debe convertir una respuesta valida de negocio en un error del endpoint observado; dicho fallo se gestionara como error interno de observabilidad.

Para evitar auto-medicion confusa, la implementacion definira explicitamente si el propio dashboard y las rutas tecnicas (`/docs`, `/openapi.json` o equivalentes) quedan excluidos. La decision debera probarse y documentarse.

## Riesgos y mitigaciones

| Riesgo | Mitigacion |
| --- | --- |
| Medir el cuerpo altera respuestas en streaming o incrementa memoria. | Seleccionar una estrategia compatible con los tipos de respuesta existentes y probar endpoints representativos. |
| Una escritura MySQL agrega latencia a todas las solicitudes. | Mantener la operacion acotada y medir la sobrecarga durante las pruebas. |
| El valor de CO2 se interpreta como exacto. | Etiquetar indicadores como estimados y documentar el factor usado. |
| La limpieza borra historico deseado. | Declarar que el alcance es por sesion y limitar la eliminacion a la tabla ambiental. |

## Pruebas esperadas

- Verificar el calculo a partir de tamanos conocidos de respuesta.
- Verificar que una solicitud elegible crea un registro MySQL con endpoint y estado correctos.
- Verificar agregaciones y ordenamiento del dashboard.
- Verificar acceso publico a `GET /api/v1/environmental-impact`.
- Verificar que el inicio del servidor limpia exclusivamente las metricas ambientales.
- Verificar que endpoints existentes mantienen cuerpo, estado y comportamiento esperado bajo instrumentacion.
