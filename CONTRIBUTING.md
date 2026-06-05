# Contribuir A OptiAcademic

## Flujo De Ramas

Crear una rama corta desde la rama base actualizada:

```bash
git checkout main
git pull origin main
git checkout -b feature/nombre-corto
```

Usar prefijos como `feature/`, `fix/`, `docs/` o `chore/`.

## Commits

Usar mensajes claros con formato convencional:

```text
feat: agregar reporte publico de sostenibilidad
fix: corregir conexion MySQL en Docker
docs: organizar guia de presentacion
```

No mezclar cambios funcionales grandes con reorganizaciones documentales.

## Verificacion Antes De Subir

```powershell
git status
docker compose --env-file .docker.env config
docker compose --env-file .docker.env up --build -d
docker compose --env-file .docker.env ps
cd frontend
npm install
npm run build
```

Si se modifica el backend, verificar Swagger y los endpoints afectados.

## Archivos Sensibles Y Generados

Nunca subir:

- `.env` o `.docker.env`.
- Tokens como `GREENFRAME_SECRET_TOKEN`.
- `backend/venv/` o cualquier `venv/`.
- `frontend/node_modules/` o `node_modules/`.
- `__pycache__/`, compilados o logs.
- `backend/public/assets/greenframe-latest.txt`, salvo una decision academica
  explicita para incorporar una evidencia depurada.

Los ejemplos de configuracion deben contener solo valores ficticios.
