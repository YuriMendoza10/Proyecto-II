# Tecnologías utilizadas en OptiAcademic

## Descripción general

**OptiAcademic** es una aplicación web full-stack para la gestión, generación y optimización de horarios académicos universitarios.

El sistema está compuesto por:

- Un **frontend** desarrollado con React.
- Un **backend** desarrollado con FastAPI.
- Una **base de datos** en MySQL.
- Un **motor CSP** para la generación inteligente de horarios.
- Un sistema de autenticación y autorización basado en JWT y roles.

La arquitectura tecnológica permite separar claramente la interfaz de usuario, la lógica de negocio, el motor de optimización y la persistencia de datos.

---

## 1. Resumen de tecnologías por capa

| Capa | Tecnologías |
|---|---|
| Frontend | React, Vite, JavaScript, Tailwind CSS, Axios, Zustand |
| Backend | Python, FastAPI, SQLAlchemy, Pydantic, Uvicorn |
| Base de datos | MySQL, PyMySQL |
| Seguridad | JWT, Python-Jose, Passlib, bcrypt, CORS |
| Motor de optimización | CSP, Backtracking, MRV, Scoring |
| Documentación API | Swagger / OpenAPI |
| Control de versiones | Git, GitHub |
| Desarrollo | Visual Studio Code, PowerShell |
| Exportación | html2pdf.js |
| Migraciones | Alembic |

---

## 2. Tecnologías del frontend

El frontend es la capa visual del sistema. Permite que administradores, coordinadores, docentes y estudiantes interactúen con las funcionalidades del sistema.

### 2.1 React

**React** se utiliza para construir la interfaz de usuario mediante componentes reutilizables.

En OptiAcademic se usa para:

- Crear las páginas administrativas.
- Crear las páginas del estudiante.
- Construir dashboards.
- Mostrar formularios.
- Renderizar tablas.
- Visualizar horarios.
- Comparar soluciones generadas por el motor CSP.
- Controlar estados de carga, errores y resultados.

Ejemplos de páginas construidas con React:

- Login.
- Dashboard administrador.
- Dashboard estudiante.
- Gestión de cursos.
- Gestión de docentes.
- Gestión de aulas.
- Generador CSP institucional.
- Oferta académica del estudiante.
- Generador de horario estudiantil.
- Horario final del estudiante.

---

### 2.2 Vite

**Vite** se utiliza como herramienta de desarrollo y compilación del frontend.

Permite:

- Ejecutar el servidor de desarrollo rápidamente.
- Recargar cambios automáticamente.
- Compilar el proyecto para producción.
- Trabajar con módulos modernos de JavaScript.

Comando principal:

```bash
npm run dev
```

---

### 2.3 JavaScript

**JavaScript** es el lenguaje principal utilizado en el frontend.

Se usa para:

- Crear componentes React.
- Manejar eventos.
- Consumir servicios del backend.
- Procesar respuestas JSON.
- Gestionar datos temporales.
- Controlar la navegación entre páginas.
- Construir lógica de interacción del usuario.

---

### 2.4 Tailwind CSS

**Tailwind CSS** se utiliza para diseñar la interfaz del sistema mediante clases utilitarias.

En el proyecto se usa para:

- Diseñar tarjetas.
- Crear botones.
- Crear dashboards.
- Diseñar tablas.
- Crear grillas semanales.
- Mostrar estados visuales.
- Diseñar formularios.
- Crear paneles compactos.
- Crear acordeones de diagnóstico.

Ejemplo de uso:

```jsx
className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
```

---

### 2.5 Axios

**Axios** se utiliza para realizar peticiones HTTP desde el frontend hacia el backend.

Se usa para consumir endpoints de:

- Autenticación.
- Cursos.
- Docentes.
- Estudiantes.
- Aulas.
- Secciones.
- Horarios.
- Motor CSP institucional.
- Motor CSP estudiantil.
- Publicación de horarios.

Ejemplo de uso:

```js
const response = await api.get('/courses')
```

---

### 2.6 Zustand

**Zustand** se utiliza para manejar estado global en el frontend.

En OptiAcademic se usa principalmente para:

- Guardar información del usuario autenticado.
- Guardar el token JWT.
- Mantener la sesión activa.
- Controlar datos de autenticación.
- Centralizar datos compartidos entre componentes.

---

### 2.7 React Router DOM

**React Router DOM** permite manejar la navegación interna del sistema.

Se utiliza para separar rutas según el rol del usuario:

- Rutas públicas.
- Rutas protegidas.
- Rutas de administrador.
- Rutas de coordinador.
- Rutas de docente.
- Rutas de estudiante.

Ejemplos de rutas:

```text
/admin
/student
/student/offer
/student/schedule-generator
/student/my-schedules
```

---

### 2.8 Lucide React

**Lucide React** se utiliza para mostrar iconos dentro de la interfaz.

Se usa en:

- Botones.
- Dashboards.
- Menús laterales.
- Tarjetas informativas.
- Indicadores visuales.
- Acciones rápidas.

---

### 2.9 React Hot Toast

**React Hot Toast** se utiliza para mostrar notificaciones en la interfaz.

Ejemplos de uso:

- Inicio de sesión correcto.
- Error al generar horario.
- Horario guardado correctamente.
- Publicación exitosa.
- Validaciones de formularios.
- Errores de conexión.

---

### 2.10 html2pdf.js

**html2pdf.js** se utiliza para exportar el horario final del estudiante en formato PDF.

El PDF incluye:

- Datos generales del horario.
- Créditos.
- Cursos seleccionados.
- Docentes.
- Aulas.
- Grilla semanal.
- Lista de clases.

---

### 2.11 date-fns

**date-fns** se utiliza para el manejo de fechas dentro del frontend.

Puede emplearse para:

- Formatear fechas.
- Comparar fechas.
- Mostrar horarios de forma legible.
- Calcular datos relacionados con días y horas.

---

### 2.12 Recharts

**Recharts** se utiliza para gráficos y visualizaciones dentro del sistema.

Puede emplearse para mostrar:

- Métricas del dashboard.
- Estadísticas de horarios.
- Distribución de bloques.
- Indicadores académicos.

---

## 3. Tecnologías del backend

El backend contiene la lógica de negocio, la seguridad, los endpoints REST, la conexión a base de datos y la ejecución del motor CSP.

### 3.1 Python

**Python** es el lenguaje principal del backend.

Se utiliza para:

- Crear la API REST.
- Implementar servicios.
- Implementar repositorios.
- Definir modelos.
- Ejecutar el motor CSP.
- Procesar validaciones.
- Gestionar autenticación.
- Ejecutar scripts de carga de datos.

---

### 3.2 FastAPI

**FastAPI** es el framework principal del backend.

Se utiliza para crear endpoints REST de forma rápida, segura y documentada.

Ventajas dentro del proyecto:

- Alto rendimiento.
- Documentación automática con Swagger.
- Validación con Pydantic.
- Soporte para inyección de dependencias.
- Fácil integración con JWT.
- Organización modular de endpoints.

Documentación automática:

```text
http://127.0.0.1:8000/docs
```

---

### 3.3 Uvicorn

**Uvicorn** se utiliza como servidor ASGI para ejecutar FastAPI.

Comando principal:

```bash
uvicorn app.main:app --reload
```

---

### 3.4 SQLAlchemy

**SQLAlchemy** se utiliza como ORM para interactuar con la base de datos MySQL.

Permite:

- Definir modelos de base de datos.
- Crear consultas.
- Relacionar entidades.
- Insertar registros.
- Actualizar registros.
- Eliminar registros.
- Trabajar con sesiones de base de datos.

Ejemplos de entidades:

- Usuario.
- Docente.
- Estudiante.
- Curso.
- Aula.
- Sección.
- Horario académico.
- Bloque de horario.

---

### 3.5 PyMySQL

**PyMySQL** permite conectar Python con MySQL.

Se utiliza dentro de la URL de conexión:

```env
DATABASE_URL=mysql+pymysql://usuario:password@localhost:3306/optiacademic
```

---

### 3.6 Pydantic

**Pydantic** se utiliza para validar datos de entrada y salida.

En el proyecto se usa para:

- Schemas de usuarios.
- Schemas de cursos.
- Schemas de docentes.
- Schemas de aulas.
- Schemas de horarios.
- Schemas del motor CSP.
- Validaciones de payloads.

Ejemplo:

```python
class CSPDiagnosticRequest(BaseModel):
    schedule_id: int
    academic_period: str
```

---

### 3.7 Alembic

**Alembic** se utiliza para gestionar migraciones de base de datos.

Permite:

- Crear cambios estructurales.
- Versionar tablas.
- Mantener control sobre la evolución de la base de datos.
- Aplicar migraciones de forma ordenada.

Estructura relacionada:

```text
backend/alembic/
backend/alembic/versions/
```

---

### 3.8 Python-Jose

**Python-Jose** se utiliza para trabajar con tokens JWT.

En el sistema se usa para:

- Generar tokens de acceso.
- Validar tokens.
- Proteger endpoints.
- Identificar al usuario autenticado.

---

### 3.9 Passlib y bcrypt

**Passlib** y **bcrypt** se utilizan para el manejo seguro de contraseñas.

Permiten:

- Encriptar contraseñas.
- Verificar contraseñas ingresadas.
- Evitar almacenar contraseñas en texto plano.
- Mejorar la seguridad del sistema.

---

### 3.10 python-multipart

**python-multipart** permite trabajar con formularios y datos enviados desde el cliente.

Es comúnmente necesario en proyectos FastAPI para ciertos tipos de peticiones.

---

### 3.11 python-dotenv

**python-dotenv** permite cargar variables de entorno desde archivos `.env`.

Se usa para configurar:

- URL de base de datos.
- Clave secreta.
- Algoritmo JWT.
- Tiempo de expiración del token.
- Orígenes permitidos por CORS.

---

## 4. Base de datos

### 4.1 MySQL

**MySQL** es el sistema gestor de base de datos utilizado en OptiAcademic.

Se encarga de almacenar:

- Usuarios.
- Roles.
- Cursos.
- Docentes.
- Estudiantes.
- Aulas.
- Secciones.
- Disponibilidades.
- Horarios institucionales.
- Bloques de horario.
- Horarios guardados por estudiantes.

---

### 4.2 Modelo relacional

El sistema usa relaciones entre tablas para representar la estructura académica.

Ejemplo de relación institucional:

```text
courses
   ↓
course_sections
   ↓
schedule_blocks
   ↓
academic_schedules
```

Ejemplo de relación estudiantil:

```text
users
   ↓
students
   ↓
student_schedules
   ↓
student_schedule_blocks
```

---

## 5. Motor CSP

### 5.1 CSP

**CSP** significa **Constraint Satisfaction Problem**, o Problema de Satisfacción de Restricciones.

En OptiAcademic se usa para resolver el problema de asignación de horarios.

El motor CSP permite asignar:

- Cursos.
- Secciones.
- Docentes.
- Aulas.
- Días.
- Horas.

Respetando restricciones como:

- Un docente no puede estar en dos clases al mismo tiempo.
- Un aula no puede tener dos clases simultáneas.
- Una sección no puede cruzarse consigo misma.
- El horario debe estar dentro del rango permitido.
- El docente debe tener disponibilidad.
- El estudiante no debe tener cruces en su horario personal.

---

### 5.2 Backtracking

**Backtracking** es la técnica principal de búsqueda del motor CSP.

Funciona probando asignaciones posibles y retrocediendo cuando encuentra un conflicto.

Flujo simplificado:

```text
Elegir sección
→ Probar día, hora y aula
→ Validar restricciones
→ Continuar con la siguiente sección
→ Si hay conflicto, retroceder
```

---

### 5.3 MRV

**MRV** significa **Minimum Remaining Values**.

Se utiliza para elegir primero las variables con menos opciones disponibles.

Esto mejora la eficiencia porque las secciones más difíciles se programan antes.

---

### 5.4 Scoring

El **scoring** permite evaluar la calidad de una solución.

No solo importa generar un horario válido, sino también generar un horario conveniente.

Criterios considerados:

- Distribución de bloques.
- Horas preferidas.
- Penalización por horas extremas.
- Balance semanal.
- Cantidad de créditos.
- Preferencias del estudiante.
- Docentes preferidos.
- Docentes evitados.

---

## 6. Seguridad

### 6.1 JWT

**JWT** se utiliza para manejar sesiones de usuario.

Flujo:

```text
Frontend envía credenciales
→ Backend valida usuario
→ Backend genera token
→ Frontend guarda token
→ Frontend envía token en cada petición protegida
```

---

### 6.2 Control de roles

El sistema protege rutas según el rol del usuario.

Roles principales:

```text
ADMIN
COORDINATOR
TEACHER
STUDENT
```

Ejemplo de protección en backend:

```python
require_roles(UserRole.ADMIN, UserRole.COORDINATOR)
```

---

### 6.3 CORS

**CORS** permite que el frontend pueda comunicarse con el backend aunque estén en puertos distintos.

Ejemplo:

```text
Frontend: http://localhost:5173
Backend:  http://127.0.0.1:8000
```

---

## 7. Herramientas de desarrollo

### 7.1 Git

**Git** se utiliza para el control de versiones del proyecto.

Comandos principales:

```bash
git status
git add .
git commit -m "mensaje"
git push
```

---

### 7.2 GitHub

**GitHub** se utiliza como repositorio remoto.

Repositorio:

```text
https://github.com/ArweNMera/AcademiC.git
```

Rama principal:

```text
main
```

---

### 7.3 Visual Studio Code

**Visual Studio Code** se utiliza como editor principal de desarrollo.

Permite:

- Editar código.
- Abrir terminal integrada.
- Gestionar carpetas.
- Revisar errores.
- Ejecutar comandos.
- Trabajar con Git.

---

### 7.4 PowerShell

**PowerShell** se utiliza como terminal principal en Windows.

Se usa para:

- Ejecutar backend.
- Ejecutar frontend.
- Instalar dependencias.
- Ejecutar scripts.
- Usar Git.

---

## 8. Librerías principales del proyecto

### 8.1 Backend

| Librería | Uso |
|---|---|
| FastAPI | Framework API REST |
| Uvicorn | Servidor ASGI |
| SQLAlchemy | ORM |
| PyMySQL | Conexión MySQL |
| Pydantic | Validación de datos |
| Alembic | Migraciones |
| python-jose | JWT |
| passlib | Hash de contraseñas |
| bcrypt | Encriptación de contraseñas |
| python-dotenv | Variables de entorno |
| python-multipart | Soporte para formularios |

---

### 8.2 Frontend

| Librería | Uso |
|---|---|
| React | Interfaz de usuario |
| Vite | Servidor y build |
| Axios | Peticiones HTTP |
| Zustand | Estado global |
| React Router DOM | Rutas |
| Tailwind CSS | Estilos |
| Lucide React | Iconos |
| React Hot Toast | Notificaciones |
| html2pdf.js | Exportar PDF |
| date-fns | Manejo de fechas |
| Recharts | Gráficos y visualizaciones |

---

## 9. Organización tecnológica del proyecto

```text
optiacademic/
├── backend/
│   ├── app/
│   │   ├── api/              # Endpoints REST
│   │   ├── core/             # Configuración, seguridad y dependencias
│   │   ├── csp/              # Motor CSP institucional y estudiantil
│   │   ├── models/           # Modelos SQLAlchemy
│   │   ├── repositories/     # Acceso a datos
│   │   ├── schemas/          # Schemas Pydantic
│   │   └── services/         # Lógica de negocio
│   ├── alembic/              # Migraciones
│   └── requirements.txt      # Dependencias backend
│
├── frontend/
│   ├── src/
│   │   ├── api/              # Configuración Axios
│   │   ├── components/       # Componentes reutilizables
│   │   ├── pages/            # Pantallas del sistema
│   │   ├── services/         # Servicios HTTP
│   │   ├── stores/           # Estado global
│   │   └── utils/            # Utilidades
│   └── package.json          # Dependencias frontend
│
└── docs/                     # Documentación del proyecto
```

---

## 10. Justificación tecnológica

### ¿Por qué React?

Porque permite construir una interfaz dinámica, modular y reutilizable para distintos roles del sistema.

### ¿Por qué FastAPI?

Porque permite crear APIs rápidas, modernas y con documentación automática.

### ¿Por qué MySQL?

Porque el sistema trabaja con datos estructurados y relaciones académicas claras.

### ¿Por qué CSP?

Porque la generación de horarios es un problema basado en restricciones.

### ¿Por qué Tailwind CSS?

Porque permite diseñar interfaces modernas rápidamente sin crear demasiados archivos CSS personalizados.

### ¿Por qué JWT?

Porque permite proteger endpoints y mantener sesiones de usuario de forma escalable.

### ¿Por qué SQLAlchemy?

Porque facilita trabajar con la base de datos usando modelos de Python en lugar de escribir SQL directamente en todo el sistema.

---

## 11. Conclusión

Las tecnologías utilizadas en OptiAcademic permiten construir un sistema académico moderno, escalable y funcional.

La combinación de **React**, **FastAPI**, **MySQL** y **CSP** permite resolver el problema de generación de horarios de forma automatizada, validada y orientada tanto a la administración institucional como a la experiencia del estudiante.

El uso de roles, JWT, servicios separados, componentes reutilizables y documentación estructurada permite que el proyecto sea mantenible, explicable y ampliable en futuras etapas.
