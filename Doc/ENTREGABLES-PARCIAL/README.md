# 🚀 OptiAcademic

Sistema web inteligente para la planificación y automatización de horarios académicos mediante técnicas de optimización basadas en satisfacción de restricciones (CSP).

---

# 📘 Descripción del Sistema

OptiAcademic es una plataforma web desarrollada para optimizar la gestión y generación de horarios académicos en instituciones de educación superior.

El sistema automatiza procesos que tradicionalmente se realizan de manera manual, reduciendo conflictos de horarios, cruces de aulas y errores administrativos.

La aplicación implementa un motor de optimización basado en Constraint Satisfaction Problems (CSP), permitiendo generar horarios académicos válidos considerando múltiples restricciones, tales como:

- Disponibilidad docente
- Disponibilidad de aulas
- Capacidad de infraestructura
- Mallas curriculares
- Cursos por semestre
- Restricciones horarias
- Evitar cruces de horarios

## ✨ Funcionalidades principales

- Gestión de docentes
- Gestión de estudiantes
- Gestión de cursos y mallas curriculares
- Administración de aulas y laboratorios
- Registro de disponibilidad docente
- Generación automática de horarios
- Validación de conflictos académicos
- Exportación de reportes
- Visualización de horarios académicos

---

# ⚙️ Instrucciones de Instalación

## 📋 Requisitos Previos

Antes de ejecutar el proyecto, instalar:

### Backend

- Python 3.12 o superior
- pip

### Frontend

- Node.js 20 o superior
- npm

### Base de Datos

- SQLite

---

# 📥 Clonar el repositorio

```bash
git clone https://github.com/YuriMendoza10/Proyecto-II.git
cd Proyecto-II
```

---

# 🔧 Instalación del Backend

Ingresar a la carpeta backend:

```bash
cd backend
```

## Crear entorno virtual

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### Linux / Mac

```bash
python3 -m venv venv
source venv/bin/activate
```

---

## Instalar dependencias

```bash
pip install -r requirements.txt
```

---

## Ejecutar el servidor backend

```bash
uvicorn main:app --reload
```

Servidor disponible en:

```txt
http://127.0.0.1:8000
```

---

# 💻 Instalación del Frontend

Abrir una nueva terminal e ingresar a la carpeta frontend:

```bash
cd frontend
```

## Instalar dependencias

```bash
npm install
```

---

## Ejecutar el frontend

```bash
npm run dev
```

Aplicación disponible en:

```txt
http://localhost:5173
```

---

# 🏗️ Arquitectura

El sistema utiliza una arquitectura cliente-servidor desacoplada.

```txt
Frontend (React + Vite)
        ↓
API REST (FastAPI)
        ↓
Motor CSP y lógica de negocio
        ↓
Base de Datos (SQLite)
```

---

## 🔹 Frontend

Tecnologías utilizadas:

- React
- Vite
- TailwindCSS
- Axios
- React Router DOM

Responsabilidades:

- Interfaz gráfica del sistema
- Visualización de horarios
- Formularios de gestión académica
- Consumo de API REST
- Exportación de reportes

---

## 🔹 Backend

Tecnologías utilizadas:

- FastAPI
- SQLAlchemy
- OR-Tools
- Pydantic
- Uvicorn

Responsabilidades:

- Lógica de negocio
- Gestión académica
- Validación de restricciones
- Generación automática de horarios
- API REST
- Acceso a datos

---

## 🔹 Motor de Optimización CSP

El sistema implementa un motor basado en Constraint Satisfaction Problems (CSP) para resolver problemas de asignación académica.

El motor considera restricciones como:

- Cruces de horarios
- Disponibilidad docente
- Disponibilidad de aulas
- Capacidad máxima
- Compatibilidad de cursos

Esto permite generar horarios válidos y optimizados automáticamente.

---

## 🔹 Base de Datos

Tecnologías utilizadas:

- MySQL
- SQLite
- SQLAlchemy ORM

La base de datos almacena información relacionada con:

- Usuarios
- Docentes
- Estudiantes
- Cursos
- Horarios
- Aulas
- Matrículas
- Restricciones académicas

---

# 🌿 Gestión del Repositorio

## Estrategia de ramas

El proyecto utiliza actualmente la rama `main` como rama principal de desarrollo y almacenamiento del código fuente estable del sistema.


---

## Convención de commits

El proyecto utiliza commits descriptivos y, en varios casos, una convención semántica para facilitar el seguimiento de cambios y organización del desarrollo.

Ejemplos utilizados en el proyecto:

```txt
feat: Implementar sistema OptiAcademic completo
docs: Agregar documentación completa del proyecto
chore: Añadir configuración del proyecto
```

---

## Pull Requests

El repositorio permite integrar cambios mediante Pull Requests para facilitar la revisión del código y el trabajo colaborativo entre integrantes.

---

# 👥 Integrantes

- Mendoza Vilcahuaman Yuri Luigui
- Cajamarca Areche Reynaldo Elias
- Torres Inche Ulises Yerko
- Yarasca Batalla Jairo Ronald
- Riveros Sumalabe Fredy
- Zacarias Lopez Lenning Andree

---

# 📄 Licencia

Proyecto desarrollado con fines académicos.

