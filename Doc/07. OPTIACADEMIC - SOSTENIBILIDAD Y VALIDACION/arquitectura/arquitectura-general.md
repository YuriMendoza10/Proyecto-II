# 2. Arquitectura general

## Arquitectura del sistema

```text
Frontend React
    ↓ HTTP / Axios
Backend FastAPI
    ↓ SQLAlchemy
Base de datos MySQL
```

## Estructura general

```text
optiacademic/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── csp/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── schemas/
│   │   └── services/
│   ├── alembic/
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── stores/
│   │   └── utils/
│   └── package.json
│
└── Doc/
```

## Backend

El backend utiliza FastAPI y se encarga de:

- Autenticación.
- Gestión de entidades académicas.
- Ejecución del motor CSP.
- Validación de horarios.
- Publicación de horarios.
- Exposición de API REST.

## Frontend

El frontend utiliza React + Vite y se encarga de:

- Interfaz de usuario.
- Rutas por rol.
- Consumo de API.
- Visualización de horarios.
- Generación y comparación de soluciones.
- Exportación de PDF.

## Patrón lógico del backend

```text
Endpoint
→ Service
→ Repository
→ Model
→ Database
```
