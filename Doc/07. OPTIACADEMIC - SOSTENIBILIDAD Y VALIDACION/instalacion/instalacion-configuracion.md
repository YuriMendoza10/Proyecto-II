# 3. Instalación y configuración

## Requisitos

- Python 3.11 recomendado.
- Node.js.
- MySQL.
- Git.

## Clonar repositorio

```powershell
git clone https://github.com/ArweNMera/AcademiC.git
cd AcademiC
```

## Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

La API estará en:

```text
http://127.0.0.1:8000
```

Swagger:

```text
http://127.0.0.1:8000/docs
```

## Frontend

```powershell
cd frontend
npm install
npm run dev
```

La aplicación estará en:

```text
http://localhost:5173
```

## Variables de entorno backend

Crear `.env` basado en `.env.example`.

```env
DATABASE_URL=mysql+pymysql://usuario:password@localhost:3306/optiacademic
SECRET_KEY=clave-secreta
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
BACKEND_CORS_ORIGINS=["http://localhost:5173"]
```

## Scripts importantes

| Script | Función |
|---|---|
| `seed_sistemas_10_ciclos.py` | Pobla malla, docentes, estudiantes, aulas y secciones |
| `crear_horario_base.py` | Crea un horario institucional base |
| `seed_50_demo.py` | Carga datos de demostración |
| `seed_realistic_demo.py` | Carga datos realistas |
