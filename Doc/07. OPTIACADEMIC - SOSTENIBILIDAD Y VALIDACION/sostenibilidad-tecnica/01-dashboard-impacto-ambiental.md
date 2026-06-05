# Dashboard de impacto ambiental

## Objetivo

OptiAcademic incorpora un dashboard publico que estima el impacto ambiental de
las respuestas HTTP procesadas por el backend. Esta funcionalidad adapta la
actividad original planteada para Express y MongoDB a la arquitectura real del
proyecto: FastAPI, SQLAlchemy, Alembic y MySQL.

La medicion sirve como indicador educativo y de observabilidad. No representa
una lectura fisica exacta de energia o emisiones reales de la infraestructura.
El calculo en Python es la adaptacion equivalente del uso didactico de CO2.js:
conserva una estimacion basada en bytes transferidos sin incorporar Node.js ni
cambiar la arquitectura FastAPI del backend.

## Acceso en la aplicacion web

El panel principal de sostenibilidad esta integrado en React y es accesible
para usuarios `ADMIN` y `COORDINATOR` desde el menu lateral en:

```text
/admin/environmental-impact
```

La pantalla consume indicadores, ranking y mediciones recientes desde la API,
y presenta cards, tablas con scroll, badges de estado HTTP, carga, estado
vacio y notificaciones de error.

## Ruta HTML publica

El dashboard esta disponible sin autenticacion en:

```http
GET /api/v1/environmental-impact
```

La respuesta es HTML renderizado por FastAPI y muestra:

- Cantidad total de solicitudes medidas en la sesion actual.
- Bytes de respuesta acumulados.
- Gramos de CO2 estimados.
- Tiempo promedio de respuesta.
- Ranking de endpoints por impacto acumulado.
- Tabla de las metricas mas recientes.

Esta vista se mantiene como apoyo demostrativo. La visualizacion prioritaria
para el usuario administrativo es la pantalla React.

## Endpoints JSON

El frontend utiliza los siguientes endpoints, protegidos para roles `ADMIN` y
`COORDINATOR`:

| Endpoint | Informacion devuelta |
| --- | --- |
| `GET /api/v1/environmental-impact/summary` | Totales, promedios y endpoints destacados. |
| `GET /api/v1/environmental-impact/metrics?limit=100` | Mediciones individuales en orden descendente por fecha. |
| `GET /api/v1/environmental-impact/ranking?limit=25` | Ranking agregado por ruta. |

## Medicion HTTP

El backend incorpora un middleware ASGI global. Para cada respuesta elegible
registra en MySQL:

| Campo | Descripcion |
| --- | --- |
| `recorded_at` | Fecha y hora UTC en que inicio la solicitud. |
| `http_method` | Metodo HTTP recibido. |
| `endpoint_path` | Patron de ruta FastAPI resuelto, cuando existe. |
| `status_code` | Codigo de respuesta HTTP. |
| `response_time_ms` | Tiempo observado por el middleware. |
| `response_bytes` | Bytes enviados en el cuerpo de respuesta. |
| `estimated_co2_g` | CO2 equivalente estimado en gramos. |

El middleware contabiliza los mensajes de cuerpo enviados por ASGI sin
reemplazar el contenido de la respuesta. Asi, los contratos de los endpoints
existentes permanecen iguales.

Una vez enviada la respuesta, la escritura de la metrica se ejecuta en una
tarea de fondo. Si MySQL esta temporalmente indisponible, el incidente se
registra en logs y no convierte la respuesta del endpoint observado en error
ni bloquea su entrega al cliente.

## Formula utilizada

La estimacion aplica un factor centralizado en
`EnvironmentalService.EMISSIONS_FACTOR_G_PER_GB`:

```text
response_gb = response_bytes / (1024 ^ 3)
estimated_co2_g = response_gb * 0.81
```

El factor implementado es `0.81 g CO2/GB` transferido. Puede sustituirse por
otro modelo de estimacion documentado sin cambiar la captura de metricas.

## Persistencia y ciclo de vida

Los registros se almacenan en la tabla MySQL `environmental_metrics`, creada
mediante la migracion Alembic `8d5c2a9f1e70_add_environmental_metrics.py`.

Al iniciar el servidor, OptiAcademic elimina exclusivamente los registros de
esta tabla. Por ello, los valores visibles en el dashboard pertenecen a la
sesion de ejecucion actual y no constituyen un historico permanente.

## Exclusiones

Las siguientes rutas no generan metricas para no contaminar los resultados:

- `/api/v1/environmental-impact`
- `/api/v1/environmental-impact/summary`
- `/api/v1/environmental-impact/metrics`
- `/api/v1/environmental-impact/ranking`
- `/docs` y subrutas
- `/openapi.json`
- `/redoc` y subrutas
- `/favicon.ico`

## Puesta en marcha

Antes de iniciar una version que use el dashboard, aplicar la migracion en el
backend:

```bash
alembic upgrade head
```

Una vez iniciado el servidor, consumir endpoints normales de la API generara
registros que podran consultarse desde la pantalla React o el dashboard HTML.

## Criterios de aceptacion

- El middleware mide respuestas de rutas funcionales FastAPI actuales y futuras.
- Las metricas se persisten en MySQL y se limpian al iniciar una sesion de servidor.
- Un fallo de persistencia no bloquea ni cambia la respuesta funcional medida.
- La API JSON entrega resumen, detalle reciente y ranking para la pantalla React.
- La pantalla `/admin/environmental-impact` presenta indicadores y tablas responsive.
- Las rutas de documentacion y monitoreo quedan excluidas del conteo.
