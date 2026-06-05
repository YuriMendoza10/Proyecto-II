# Reporte GreenFrame de OptiAcademic

## Que es GreenFrame

GreenFrame es una herramienta de medicion que ejecuta un escenario de usuario
en un navegador controlado y estima el consumo y la huella de carbono
asociados a esa ejecucion. Requiere Docker para observar una aplicacion
full-stack local durante el analisis.

## Uso en OptiAcademic

En OptiAcademic, GreenFrame mide el flujo critico de consulta del dashboard
ambiental: inicia sesion como administrador demo, abre la zona administrativa
y visita `/admin/environmental-impact`.

La integracion respeta la arquitectura real del proyecto:

| Capa | Tecnologia medida |
| --- | --- |
| Interfaz | React + Vite + Tailwind CSS |
| API | FastAPI + Python + SQLAlchemy + Alembic |
| Persistencia | MySQL |

No incorpora Express, MongoDB ni una migracion a MERN. Frontend, backend y
base de datos se ejecutan con el Docker Compose ya definido para desarrollo.
El ultimo resultado del CLI se conserva como texto y puede consultarse
publicamente desde la API FastAPI.

## Componentes

| Archivo | Uso |
| --- | --- |
| `.greenframe.yml` | Indica URL base, escenario, muestras y contenedores que GreenFrame debe medir. |
| `scenario.js` | Escenario Playwright de autenticacion y navegacion. |
| `backend/public/assets/greenframe-latest.txt` | Salida generada por el analisis. |
| `GET /api/v1/sustainability` | Publicacion del ultimo reporte disponible. |

La configuracion mide los contenedores `optiacademic_frontend`,
`optiacademic_backend` y `optiacademic_mysql`, definidos con esos nombres en
`docker-compose.yml`.

## Prerrequisitos

- Docker Compose operativo.
- GreenFrame CLI instalado segun la documentacion oficial:
  <https://docs.greenframe.io/commands/>.
- Un archivo `.docker.env` local creado a partir de `.env.docker.example`,
  como se explica en `03-docker-greenframe-local.md`.

No se debe guardar `GREENFRAME_SECRET_TOKEN` en el repositorio, en archivos
`.env` versionados ni en la configuracion GreenFrame. Si el CLI lo requiere
para una ejecucion remota, debe proporcionarse solo mediante el entorno local
o el gestor de secretos de CI.

## Preparar la aplicacion

Levantar los servicios desde la raiz del proyecto:

```powershell
docker compose --env-file .docker.env up --build -d
```

Una base MySQL nueva contiene las tablas despues de las migraciones, pero no
incluye usuarios. Cargar los datos de demostracion para disponer del usuario
administrador requerido por el escenario:

```powershell
docker compose --env-file .docker.env exec backend python seed_realistic_demo.py
```

El escenario utiliza exclusivamente la cuenta demo:

```text
admin@optiacademic.com / admin123
```

## Escenario medido

`scenario.js` exporta una funcion mediante `module.exports` y ejecuta la
siguiente navegacion con Playwright:

1. Abre `http://localhost:5173`.
2. Si aparece el login, completa el acceso con el administrador demo.
3. Navega a `/admin/dashboard`.
4. Navega a `/admin/environmental-impact`.
5. Espera la carga del titulo del dashboard y lo mantiene visible 11 segundos.

Los hitos del escenario permiten identificar carga de login, autenticacion y
visualizacion del dashboard en el resultado GreenFrame. Los selectores del
login aceptan tanto atributos `name` como tipos de input para tolerar cambios
menores de maquetacion.

## Ejecutar el analisis

Con los servicios levantados y los datos demo cargados:

```powershell
npm run sustainability:analyze
```

Para conservar la salida en pantalla y escribir el archivo mediante
`Tee-Object`, npm debe estar configurado para ejecutar scripts con PowerShell
(en Windows, npm puede usar `cmd.exe` por defecto):

```powershell
npm config set script-shell powershell.exe
```

Luego puede ejecutarse:

```powershell
npm run sustainability:analyze:ps
```

El script ejecuta `greenframe analyze` usando `.greenframe.yml` y reemplaza
el resultado anterior en:

```text
backend/public/assets/greenframe-latest.txt
```

Se ejecutan tres muestras del escenario para obtener una medicion mas estable.
El archivo es un resultado generado localmente y esta ignorado por Git; solo
debe presentarse como evidencia cuando el escenario termine exitosamente.

## Consultar el reporte publico

Tras generar un analisis:

```http
GET http://localhost:8000/api/v1/sustainability
```

La respuesta es el contenido textual de `greenframe-latest.txt`. Si aun no se
ha ejecutado GreenFrame, el endpoint responde `404` e indica:

```text
No se ha ejecutado un análisis GreenFrame todavía.
```

La ruta del reporte queda excluida de las metricas HTTP internas del dashboard
para que consultar el resultado no modifique el conjunto de solicitudes que
se esta observando.

## Resultado Actual

El repositorio no versiona un resultado GreenFrame pre-generado. En una
instalacion nueva, el endpoint devuelve el mensaje de ausencia hasta que se
ejecute el analisis local y se cree `greenframe-latest.txt`.

## Seguridad

- Las credenciales incluidas en el escenario corresponden solo al usuario de
  demostracion creado por el script de seed.
- Las contrasenas Docker y la clave JWT permanecen en `.docker.env`, que no se
  versiona.
- `GREENFRAME_SECRET_TOKEN` no forma parte de `.greenframe.yml`, `scenario.js`
  ni de los comandos npm del proyecto.

## Referencias

- Configuracion y comandos GreenFrame: <https://docs.greenframe.io/commands/>
- Escenarios Playwright GreenFrame: <https://docs.greenframe.io/scenario/>
