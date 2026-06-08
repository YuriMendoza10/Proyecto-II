# Casos de prueba de integracion

Las pruebas de integracion del backend se ubican en:

- `backend/tests/test_semana13_integration_api.py`

## Casos cubiertos

| ID | Ruta o modulo | Resultado esperado |
|---|---|---|
| PI-01 | `GET /docs` | Responde 200 y carga Swagger |
| PI-02 | `GET /` | Responde estado general del sistema |
| PI-03 | Login invalido | Responde error controlado, no 500 |
| PI-04 | Ruta protegida sin token | Bloquea acceso con 401 o 403 |
| PI-05 | Reporte ambiental sin token | Bloquea acceso sin generar 500 |
| PI-06 | Historial academico paginado sin token | Bloquea acceso sin generar 500 |

## Consideraciones

- No se desactiva autenticacion para facilitar pruebas.
- Las pruebas autenticadas reales deben usar variables de entorno cuando existan credenciales demo.
- Las pruebas no escriben datos en la base de datos productiva.

## Comando

```powershell
cd backend
py -m pytest -v tests/test_semana13_integration_api.py
```

