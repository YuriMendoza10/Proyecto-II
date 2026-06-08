# Casos de prueba unitarias

## Backend

Las pruebas unitarias del backend se ubican en:

- `backend/tests/test_semana13_schemas.py`
- `backend/tests/test_semana13_sustainability_logic.py`

Casos cubiertos:

| ID | Modulo | Caso |
|---|---|---|
| PU-BE-01 | Schemas | Crear estudiante valido con datos minimos |
| PU-BE-02 | Schemas | Rechazar rango invalido de creditos permitidos |
| PU-BE-03 | Historial academico | Crear registro aprobado valido |
| PU-BE-04 | Historial academico | Rechazar nota fuera de rango |
| PU-BE-05 | Sostenibilidad | Calcular CO2 estimado para respuestas HTTP |
| PU-BE-06 | CSP | Detectar solapamiento de horarios |
| PU-BE-07 | CSP | Generar bloques de horario validos |

## Frontend

Las pruebas unitarias del frontend se ubican en:

- `frontend/src/tests/endpointLabels.test.js`
- `frontend/src/tests/formatters.test.js`
- `frontend/src/tests/ThemeToggle.test.jsx`
- `frontend/src/tests/PaginationControls.test.jsx`

Casos cubiertos:

| ID | Modulo | Caso |
|---|---|---|
| PU-FE-01 | endpointLabels | Traducir rutas tecnicas a nombres amigables |
| PU-FE-02 | formatters | Formatear CO2 con unidad clara |
| PU-FE-03 | formatters | Formatear porcentajes con separacion legible |
| PU-FE-04 | ThemeToggle | Cambiar entre modo claro y oscuro |
| PU-FE-05 | PaginationControls | Avanzar y retroceder paginas |
| PU-FE-06 | PaginationControls | Bloquear botones en limites |

## Comandos

```powershell
cd backend
py -m pytest -v
```

```powershell
npm --prefix frontend run test
```

