# OptiAcademic

Aplicación web Full Stack para la planificación, generación, validación y
publicación de horarios académicos universitarios mediante optimización basada
en restricciones CSP.

Repositorio oficial: <https://github.com/YuriMendoza10/Proyecto-II.git>

## Tabla de Contenido

1. [Equipo](#equipo)
2. [Problemática](#problemática)
3. [Justificación del PMV](#justificación-del-pmv)
4. [Tecnologías](#tecnologías)
5. [Arquitectura](#arquitectura)
6. [Instalación](#instalación)
7. [Build](#build)
8. [Despliegue local](#despliegue-local)
9. [Calidad integral](#calidad-integral)
10. [Video explicativo](#video-explicativo)
11. [Documentación](#documentación)
12. [Control y cierre](#control-y-cierre)
13. [Estado de entrega](#estado-de-entrega)
14. [Recomendaciones de uso](#recomendaciones-de-uso)
15. [Licencia académica](#licencia-académica)

## Equipo

- Mendoza Vilcahuaman Yuri Luigui.
- Cajamarca Areche Reynaldo Elias.
- Torres Inche Ulises Yerko.
- Yarasca Batalla Jairo Ronald.
- Riveros Sumalabe Fredy.
- Zacarias Lopez Lenning Andree.

### Imagen del Equipo

<p align="center">
  <img src="https://github.com/user-attachments/assets/d00fc02f-5195-427c-849f-14022eb20509" alt="Equipo OptiAcademic" width="700"/>
</p>

La imagen ya estaba publicada por el equipo en el README remoto. Se conserva
su referencia sin duplicar el archivo ni alterar evidencias.

## Problemática

La planificación universitaria debe conciliar cursos, secciones, docentes,
disponibilidad, aulas, capacidad, períodos y restricciones institucionales. Un
proceso manual puede introducir cruces, inconsistencias, baja trazabilidad y
una alta carga administrativa.

OptiAcademic centraliza la información académica y aplica un motor CSP para
proponer horarios válidos, explicables y publicables mediante un flujo seguro.

## Justificación del PMV

El producto mínimo viable cubre el flujo esencial de planificación:

- Autenticación y permisos para `ADMIN`, `COORDINATOR`, `TEACHER` y `STUDENT`.
- Gestión de entidades y oferta académica.
- Preparación y validación de datos antes del CSP.
- Generación, revisión, guardado y publicación segura de horarios.
- Consulta docente y generación personal para estudiantes.
- Reportes, auditoría, trazabilidad y notificaciones.
- Evidencias de calidad, seguridad, accesibilidad y usabilidad.

Este alcance demuestra valor funcional sin afirmar una automatización total de
todos los procesos administrativos de una universidad.

## Tecnologías

| Área | Tecnologías |
|---|---|
| Frontend | React, Vite, Tailwind CSS, Axios |
| Backend | FastAPI, Python, SQLAlchemy, Alembic |
| Base de datos | MySQL |
| Optimización | CSP institucional |
| Contenedores | Docker Compose |
| Calidad | SonarQube |
| Seguridad | OWASP Top 10, JWT, autorización por roles |
| Accesibilidad | WCAG |
| Usabilidad | System Usability Scale (SUS) |
| Pruebas | Vitest, Pytest, Playwright |
| Documentación | Markdown organizado en `Doc/` |

## Arquitectura

```text
Usuario
  ↓
Frontend React / Vite
  ↓ HTTP + JWT
API FastAPI
  ↓
Servicios, repositorios y motor CSP
  ↓ SQLAlchemy / Alembic
MySQL
```

El frontend concentra presentación y experiencia de usuario. El backend
implementa API, seguridad y reglas de negocio. SQLAlchemy administra la
persistencia, Alembic controla el esquema y Docker Compose orquesta el entorno
local.

Detalle: [Arquitectura del sistema](Doc/03.%20IMPLEMENTACION/arquitectura-sistema.md).

## Instalación

Requisitos:

- Git.
- Docker Desktop con Docker Compose.
- Node.js para build o pruebas locales del frontend.
- Python para ejecución local opcional del backend.

```powershell
git clone https://github.com/YuriMendoza10/Proyecto-II.git
cd Proyecto-II
Copy-Item .env.docker.example .docker.env
```

El archivo `.docker.env` debe permanecer local y nunca subirse al repositorio.
Cada equipo debe configurar sus propios valores sin publicar secretos.

## Build

Validar y construir los servicios Docker:

```powershell
docker compose --env-file .docker.env config --quiet
docker compose --env-file .docker.env build
```

Build independiente del frontend:

```powershell
npm --prefix frontend install
npm --prefix frontend run build
```

## Despliegue Local

```powershell
docker compose --env-file .docker.env up -d --build
docker compose --env-file .docker.env exec backend alembic upgrade head
docker compose --env-file .docker.env ps
```

| Servicio | URL local |
|---|---|
| Frontend | <http://localhost:5173> |
| Backend | <http://localhost:8000> |
| Swagger | <http://localhost:8000/docs> |

Para detener sin borrar datos:

```powershell
docker compose --env-file .docker.env stop
```

No ejecutar `docker compose down -v`: elimina volúmenes persistentes.

## Calidad Integral

Las siguientes métricas están respaldadas por las evidencias de cierre del
repositorio; no corresponden a una nueva ejecución realizada durante esta
actualización documental.

| Área | Métrica real documentada |
|---|---|
| SonarQube Quality Gate | Passed |
| SonarQube Bugs | 0 |
| SonarQube Vulnerabilities | 0 |
| SonarQube Code Smells | 254 |
| SonarQube Coverage | 13.9 % |
| SonarQube Duplications | 4.5 % |
| Frontend | 51 pruebas aprobadas; cobertura 81.11 % |
| Backend | 46 pruebas aprobadas; 5 omitidas; cobertura 51 % |
| Seguridad backend | 9 pruebas aprobadas |
| Playwright E2E | 6 passed; 3 skipped |
| SUS | 82.19/100 en piloto académico de 8 participantes |

### Entorno y Datos Recuperados

| Evidencia | Resultado documentado |
|---|---|
| Frontend | HTTP 200 |
| Backend | HTTP 200 |
| Swagger | HTTP 200 |
| MySQL | Saludable |
| Usuarios | 226 |
| Docentes | 68 |
| Estudiantes | 155 |
| Cursos | 75 |
| Aulas | 68 |
| Horarios | 22 |
| Bloques | 1,575 |
| Ofertas | 68 |
| Períodos académicos | 1 |
| Alembic | `k2085f6a7b2c (head)` |

Evidencias: [calidad integral](Doc/06.%20CIERRE/calidad-integral/) y
[recuperación Docker](Doc/06.%20CIERRE/calidad-integral/07-evidencias/docker-demo-funcionamiento.md).

## Video Explicativo

**Pendiente: agregar enlace del video explicativo final de máximo 5 minutos.**

La estructura y checklist están en
[video-explicativo.md](Doc/05.%20LANZAMIENTO/video-explicativo.md).

## Documentación

La documentación oficial está centralizada en [Doc/](Doc/). La carpeta
[docs/](docs/) proporciona el punto de acceso compatible solicitado por la
consigna.

| Fase | Acceso |
|---|---|
| Inicio | [Doc/01. INICIO](Doc/01.%20INICIO/) |
| Planificación | [Doc/02. PLANIFICACION](Doc/02.%20PLANIFICACION/) |
| Implementación | [Doc/03. IMPLEMENTACION](Doc/03.%20IMPLEMENTACION/) |
| Revisión y retrospectiva | [Doc/04. REVISION Y RETROSPECTIVA](Doc/04.%20REVISION%20Y%20RETROSPECTIVA/) |
| Lanzamiento | [Doc/05. LANZAMIENTO](Doc/05.%20LANZAMIENTO/) |
| Cierre | [Doc/06. CIERRE](Doc/06.%20CIERRE/) |
| Exposición Semana 16 | [Guía rápida para los seis integrantes](Doc/08.%20EXPOSICION%20SEMANA%2016/) |

### Enlaces PFA

- [Índice oficial de `Doc/`](Doc/README.md)
- [Acceso compatible `docs/`](docs/README.md)
- [Flujo Feature Branch](Doc/02.%20PLANIFICACION/flujo-trabajo-git.md)
- [Versionado semántico](Doc/02.%20PLANIFICACION/versionado-semantico.md)
- [Arquitectura del sistema](Doc/03.%20IMPLEMENTACION/arquitectura-sistema.md)
- [Desarrollo colaborativo](Doc/04.%20REVISION%20Y%20RETROSPECTIVA/evidencia-desarrollo-colaborativo.md)
- [Video explicativo](Doc/05.%20LANZAMIENTO/video-explicativo.md)
- [Checklist final PFA](Doc/06.%20CIERRE/13-checklist-final-repositorio-pfa.md)
- [Exposición Semana 16](Doc/08.%20EXPOSICION%20SEMANA%2016/)

## Control y Cierre

La fase de cierre documenta informe final, lecciones aprendidas, riesgos,
incidentes, impedimentos, defectos, supuestos, SOW, capacitación, trazabilidad
y calidad integral. El historial Git evidencia desarrollo progresivo y existe
un merge localmente verificable del pull request `#1`.

El tag exacto `v1.0.0` solicitado para el PMV todavía no existe. Su creación se
mantiene como pendiente crítico hasta confirmar el commit definitivo.

## Estado de Entrega

| Componente | Estado |
|---|---|
| PMV funcional | Evidenciado |
| Documentación PMBOK | Disponible en `Doc/` |
| Calidad integral | Documentada con observaciones residuales |
| Flujo Git | Documentado y verificable localmente |
| Tag `v1.0.0` | Pendiente crítico |
| Video final | Pendiente de adjuntar |

## Recomendaciones de Uso

- Usar únicamente cuentas y datos autorizados.
- No subir `.env`, `.docker.env`, tokens ni credenciales.
- Aplicar migraciones con Alembic antes de la demostración.
- Verificar Docker, frontend, backend y Swagger antes de exponer.
- No borrar volúmenes persistentes para resolver problemas de arranque.
- Revisar restricciones CSP y conflictos antes de publicar horarios.
- Mantener `main` estable mediante ramas y revisión de integración.

## Licencia Académica

Proyecto desarrollado con fines educativos para Taller de Proyectos 2 de
Ingeniería de Sistemas e Informática. Su uso, distribución o reutilización debe
respetar la autoría del equipo, las políticas institucionales y las licencias
de las dependencias empleadas. Este texto no sustituye una licencia de software
formal para distribución pública.
