# Recuperación del entorno Docker y datos de demostración

## Fecha de verificación

12 de junio de 2026.

## Objetivo

Restaurar el funcionamiento de OptiAcademic después del reinicio de WSL/Docker, preservando el volumen MySQL y los datos existentes.

## Causa encontrada

El contenedor MySQL estaba saludable, pero el backend reiniciaba continuamente con el error:

```text
Access denied for user 'optiacademic' (using password: YES)
```

El volumen persistente `optiacademic_dev_mysql_data` fue creado originalmente con las credenciales definidas en `.env.docker.example`. Al ejecutar `docker compose` sin `--env-file`, Compose aplicaba los valores por defecto `change_me_*`, que no coincidían con las credenciales almacenadas en MySQL.

Adicionalmente, el archivo local `.docker.env` estaba desalineado porque configuraba `root/root` en lugar del usuario de aplicación persistido en el volumen.

## Recuperación aplicada

1. Se mantuvo intacto el volumen `optiacademic_dev_mysql_data`.
2. No se ejecutó `docker compose down -v`.
3. No se eliminaron bases, tablas ni registros.
4. Se validaron las credenciales originales contra MySQL.
5. Se levantaron los servicios con el archivo de entorno correcto.
6. Se corrigió el archivo local `.docker.env`, ignorado por Git, para futuros reinicios.

Variables locales alineadas:

- Usuario MySQL de aplicación: `optiacademic`.
- Base de datos: `optiacademic_db`.
- Host interno: `mysql:3306`.
- API para el navegador: `http://127.0.0.1:8000/api/v1`.
- Frontend: `http://localhost:5173`.

Las contraseñas no se reproducen en este documento.

## Estado de la base de datos

La base **no estaba vacía**. Por ello no se ejecutó ningún seed.

| Tabla | Registros recuperados |
|---|---:|
| `users` | 226 |
| `teachers` | 68 |
| `students` | 155 |
| `courses` | 75 |
| `classrooms` | 68 |
| `academic_schedules` | 22 |
| `schedule_blocks` | 1575 |
| `section_offerings` | 68 |
| `academic_periods` | 1 |

## Migraciones Alembic

La revisión de migraciones devolvió:

```text
k2085f6a7b2c (head)
```

La base ya se encontraba en la migración más reciente. No fue necesario aplicar cambios manuales ni recrear tablas.

## Servicios Docker

| Servicio | Estado final | Puerto |
|---|---|---:|
| `mysql` | Up / healthy | 3307 |
| `backend` | Up | 8000 |
| `frontend` | Up | 5173 |

No se encontraron `OperationalError`, trazas ni respuestas 500 en la revisión final de logs del backend.

## Rutas y endpoints verificados

### Acceso público

| Recurso | Resultado |
|---|---|
| `http://localhost:5173` | HTTP 200 |
| `http://localhost:8000` | HTTP 200 |
| `http://localhost:8000/docs` | HTTP 200 |

### Acceso autenticado de lectura

Se validó el login con el usuario administrador demo documentado y se consultaron los siguientes endpoints:

| Funcionalidad | Endpoint | Resultado |
|---|---|---|
| Usuario autenticado | `/api/v1/auth/me` | HTTP 200 |
| Dashboard administrativo | `/api/v1/dashboard/admin-summary` | HTTP 200 |
| Docentes | `/api/v1/teachers` | HTTP 200 |
| Estudiantes | `/api/v1/students` | HTTP 200 |
| Cursos | `/api/v1/courses` | HTTP 200 |
| Aulas | `/api/v1/classrooms` | HTTP 200 |
| Horarios | `/api/v1/schedules` | HTTP 200 |
| Generador CSP institucional | `/api/v1/institutional-csp/available-schedules` | HTTP 200 |
| Impacto ambiental | `/api/v1/environmental-impact/summary` | HTTP 200 |

La configuración frontend utiliza `localhost` o `127.0.0.1:8000`; no se encontraron llamadas activas del navegador hacia `http://backend:8000`.

## Pruebas rápidas ejecutadas

### Frontend

```powershell
npm --prefix frontend run test
```

Resultado: 12 archivos y 51 pruebas aprobadas. Cobertura global: 81.11 %.

### Backend

```powershell
cd backend
py -m pytest tests/test_security_core.py tests/test_semana13_integration_api.py -v
cd ..
```

Resultado: 9 pruebas aprobadas y 3 advertencias no bloqueantes.

## Comandos de arranque recomendados

Desde la raíz del repositorio:

```powershell
docker compose --env-file .docker.env up -d --build
docker compose --env-file .docker.env ps
docker compose --env-file .docker.env logs --tail=120 backend
```

Para detener los contenedores sin borrar datos:

```powershell
docker compose --env-file .docker.env stop
```

No utilizar `docker compose down -v`, porque eliminaría el volumen de datos.

## Riesgos y observaciones

1. Docker muestra un warning porque el volumen fue creado originalmente bajo el proyecto Compose `optiacademic` y ahora se reutiliza desde `proyecto-ii-compartido`. El volumen se monta correctamente; no se modificó para evitar riesgos.
2. Durante el inicio, el backend ejecuta `DELETE FROM environmental_metrics`. Este comportamiento preexistente reinicia las métricas ambientales de sesión y puede afectar el histórico del reporte de sostenibilidad. No se modificó lógica productiva durante esta recuperación.
3. `.docker.env` es un archivo local ignorado por Git. Cada entorno debe conservar una copia con credenciales compatibles con su volumen existente.

## Resultado final

Se recuperaron los datos existentes y la aplicación volvió a operar con frontend, backend y MySQL activos. No se creó seed demo, no se eliminó información y no se realizaron cambios destructivos.
