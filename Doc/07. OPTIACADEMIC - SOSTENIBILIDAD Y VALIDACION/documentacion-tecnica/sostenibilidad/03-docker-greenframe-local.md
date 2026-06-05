# Docker local para preparar GreenFrame

## Objetivo

Esta configuracion permite ejecutar OptiAcademic en contenedores durante
desarrollo, como paso previo a un analisis full-stack con GreenFrame.
GreenFrame no se instala ni se ejecuta todavia.

La ejecucion local existente continua disponible: los comandos habituales de
FastAPI, Vite y MySQL local no cambian.

## Servicios

`docker-compose.yml` levanta tres servicios:

| Servicio | Contenedor | Puerto en el host | Uso |
| --- | --- | --- | --- |
| `frontend` | Vite / React | `5173` | Aplicacion web de desarrollo |
| `backend` | FastAPI / Uvicorn | `8000` | API y Swagger |
| `mysql` | MySQL 8.4 | `3307` por defecto | Persistencia del entorno Docker |

Dentro de la red Docker, el backend se conecta a `mysql:3306`. El puerto
`3307` solo publica la base de datos hacia la maquina local, evitando el
conflicto habitual con un MySQL ya instalado en `3306`.

## Archivos agregados

| Archivo | Proposito |
| --- | --- |
| `docker-compose.yml` | Orquesta frontend, backend y MySQL. |
| `.env.docker.example` | Plantilla sin credenciales reales. |
| `backend/Dockerfile` | Imagen de desarrollo de FastAPI. |
| `backend/.dockerignore` | Excluye `.env`, `venv` y caches de la imagen. |
| `frontend/Dockerfile` | Imagen de desarrollo de Vite. |
| `frontend/.dockerignore` | Excluye `.env`, `node_modules` y `dist`. |

Compose monta solamente carpetas de codigo necesarias para hot reload. Por
ello, `backend/.env` y `frontend/.env` locales no se montan ni se copian a
las imagenes.

## Preparar variables Docker

Desde la raiz del proyecto:

```powershell
Copy-Item .env.docker.example .docker.env
```

Editar `.docker.env` y sustituir los valores de ejemplo para
`MYSQL_ROOT_PASSWORD`, `MYSQL_PASSWORD` y `SECRET_KEY` por valores locales.
El archivo `.docker.env` coincide con la regla `*.env` del `.gitignore` y no
debe versionarse.

Las variables que consume FastAPI son compatibles con
`backend/app/core/config.py`:

```env
MYSQL_HOST=mysql
MYSQL_PORT=3306
MYSQL_USER=optiacademic
MYSQL_PASSWORD=replace_with_local_app_password
MYSQL_DATABASE=optiacademic_db
SECRET_KEY=replace_with_a_long_random_local_secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
BACKEND_CORS_ORIGINS=["http://localhost:5173","http://127.0.0.1:5173"]
```

`MYSQL_HOST` y `MYSQL_PORT` se fijan en Compose a `mysql` y `3306` porque
son los valores correctos entre contenedores. No apuntan al puerto publicado
en el host.

## Levantar el entorno

```powershell
docker compose --env-file .docker.env up --build
```

Al iniciar, Compose espera que MySQL este saludable y el backend ejecuta:

```bash
alembic upgrade head
```

Luego inicia Uvicorn con recarga automatica. Vite tambien se inicia en modo
desarrollo con recarga al editar archivos del frontend.

## Verificacion

Con los contenedores ejecutandose, abrir:

| URL | Resultado esperado |
| --- | --- |
| `http://localhost:5173` | Interfaz React |
| `http://localhost:8000/docs` | Documentacion Swagger de FastAPI |
| `http://localhost:8000/` | Estado basico de la API |

Para consultar el estado o logs:

```powershell
docker compose --env-file .docker.env ps
docker compose --env-file .docker.env logs -f backend frontend mysql
```

## Puertos alternativos

Si un puerto publicado ya esta ocupado, cambiar solo su valor en
`.docker.env`. Por ejemplo, para publicar MySQL en `3308`:

```env
MYSQL_EXPOSED_PORT=3308
```

El backend debe conservar su conexion interna a `mysql:3306`.

## Detener y limpiar

Detener los contenedores conservando la base de datos:

```powershell
docker compose --env-file .docker.env down
```

Eliminar ademas los datos MySQL creados para este entorno Docker:

```powershell
docker compose --env-file .docker.env down -v
```

El segundo comando borra exclusivamente el volumen Docker `mysql_data`; no
modifica la base de datos de una instalacion MySQL local.

## Alcance respecto de GreenFrame

Esta etapa solo proporciona un entorno full-stack reproducible con Docker
Compose. La instalacion, los escenarios y las mediciones de GreenFrame deben
incorporarse en una etapa posterior, una vez verificado este arranque local.
