# Arquitectura General

## Vision

OptiAcademic aplica una arquitectura web de tres capas orientada a resolver
la programacion academica mediante restricciones:

```text
Usuario
  |
  v
React + Vite + Tailwind CSS
  | Axios / JWT Bearer
  v
FastAPI + Servicios + Motor CSP
  | SQLAlchemy / Alembic
  v
MySQL
```

En desarrollo, Docker Compose levanta un contenedor por capa. El navegador
consume el frontend en `:5173`, la API se publica en `:8000` y MySQL se
publica en `:3307` para evitar conflictos con instalaciones locales.

## Frontend

React organiza vistas por rol y delega las solicitudes HTTP a servicios Axios.
Zustand conserva la sesion y el token JWT localmente. Vite ofrece recarga en
caliente durante desarrollo.

## Backend

FastAPI expone la API `/api/v1`, Swagger, autenticacion, CRUD academico,
generacion CSP y sostenibilidad. La logica se distribuye en endpoints,
servicios, esquemas y modelos SQLAlchemy. Alembic versiona el esquema MySQL.

## Base De Datos

MySQL persiste usuarios, perfiles, oferta academica, horarios, bloques y
metricas ambientales. En Docker los datos se almacenan en un volumen
independiente del codigo fuente.

## Flujo De Autenticacion

```text
Login React
  -> POST /api/v1/auth/login-json
  -> FastAPI valida credenciales en MySQL
  -> Devuelve JWT
  -> React envia Authorization: Bearer <token>
  -> FastAPI valida token y rol requerido
```

Los roles implementados son `ADMIN`, `COORDINATOR`, `TEACHER` y `STUDENT`.
El registro anonimo solo crea usuarios `STUDENT`; los roles operativos se
provisionan desde administracion autenticada o seeds.

## Flujo De Generacion De Horarios

1. Administrador o coordinador gestiona cursos, aulas, docentes y secciones.
2. Se valida disponibilidad y preparacion de los datos.
3. El motor CSP genera soluciones respetando restricciones institucionales.
4. Se revisan conflictos y calidad del horario.
5. La solucion seleccionada solo se publica si supera validaciones de
   preparacion de datos y calidad.

## Flujo Estudiante

1. El estudiante consulta la oferta publicada.
2. Selecciona cursos y preferencias.
3. El servicio CSP estudiantil produce alternativas compatibles.
4. El estudiante compara, guarda y exporta su horario final.

Los endpoints genericos de horarios y bloques tambien restringen al
estudiante a horarios institucionales activos con estado `PUBLISHED`, para
que un borrador no quede expuesto fuera del flujo de oferta.

## Proteccion Docente

Los endpoints de disponibilidad verifican propiedad del perfil: `TEACHER`
solo gestiona su propia disponibilidad. `ADMIN` y `COORDINATOR` conservan
permisos globales para planificacion institucional.

## Flujo De Sostenibilidad

```text
Solicitudes HTTP
  -> Middleware FastAPI estima bytes/CO2
  -> MySQL guarda metricas
  -> React presenta /admin/environmental-impact

GreenFrame + Playwright
  -> Ejecuta login y dashboard ambiental en Docker
  -> Escribe backend/public/assets/greenframe-latest.txt
  -> GET /api/v1/sustainability publica el ultimo reporte
```

El reporte GreenFrame generado es un artefacto local ignorado por Git; la
documentacion y la configuracion del analisis si son versionables.
