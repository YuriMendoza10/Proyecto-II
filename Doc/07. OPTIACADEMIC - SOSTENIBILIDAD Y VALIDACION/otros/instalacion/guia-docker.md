# Guia Docker De Desarrollo

## Requisitos

- Git.
- Docker Desktop con Docker Compose habilitado.
- PowerShell para los scripts de apoyo en Windows.
- GreenFrame CLI solo si se ejecutara el analisis ambiental.

Verificar Docker Desktop:

```powershell
docker version
docker compose version
```

## Configurar Variables

Desde la raiz del repositorio:

```powershell
Copy-Item .env.docker.example .docker.env
```

Editar `.docker.env` y reemplazar los secretos de ejemplo. Este archivo esta
ignorado por Git y no debe compartirse.

## Levantar El Stack

```powershell
docker compose --env-file .docker.env up --build -d
docker compose --env-file .docker.env ps
```

Servicios esperados:

| Contenedor | Estado | Puerto |
| --- | --- | --- |
| `optiacademic_frontend` | `Up` | `5173` |
| `optiacademic_backend` | `Up` | `8000` |
| `optiacademic_mysql` | `Up (healthy)` | `3307` hacia `3306` |

El backend ejecuta `alembic upgrade head` al iniciar, una vez MySQL esta
saludable.

## Migraciones Manuales

Cuando sea necesario reaplicar o inspeccionar migraciones:

```powershell
docker compose --env-file .docker.env exec backend alembic upgrade head
```

## Seed Demo

```powershell
docker compose --env-file .docker.env exec backend python seed_realistic_demo.py
```

Credencial de demostracion:

```text
admin@optiacademic.com / admin123
```

## URLs Finales

| Uso | URL |
| --- | --- |
| Frontend | <http://localhost:5173> |
| API base | <http://localhost:8000/api/v1> |
| Swagger | <http://localhost:8000/docs> |
| Dashboard ambiental publico | <http://localhost:8000/api/v1/environmental-impact> |
| Reporte GreenFrame | <http://localhost:8000/api/v1/sustainability> |

## Detener El Stack

```powershell
docker compose --env-file .docker.env down
```

Para reiniciar ademas la base de datos Docker de desarrollo:

```powershell
docker compose --env-file .docker.env down -v
```

Este ultimo comando elimina el volumen Docker del entorno y debe usarse solo
cuando se acepta perder sus datos de desarrollo.
