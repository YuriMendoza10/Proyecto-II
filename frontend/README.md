# Frontend React - OptiAcademic

## Oferta Academica - Fase 2

El rol `COORDINATOR` dispone de navegacion propia en
`/coordinator/dashboard`, `/coordinator/offerings`,
`/coordinator/offerings/create` y `/coordinator/conflicts`. Admin tambien
puede gestionar esas pantallas. El estudiante ve en `/student/offer`
exclusivamente `section_offerings` con estado `PUBLISHED` del periodo activo;
el generador personal conserva el flujo institucional existente.

## Descripcion

La interfaz web de OptiAcademic ofrece navegacion por roles para gestion
academica, generacion de horarios y consulta de indicadores ambientales.

## Tecnologias

- React con Vite.
- Tailwind CSS.
- React Router.
- Axios para consumo de la API.
- Zustand para estado de autenticacion.

## Estructura

```text
frontend/
|-- public/
|-- src/
|   |-- api/            # Cliente Axios
|   |-- components/     # Layout y componentes reutilizables
|   |-- pages/          # Pantallas por rol
|   |-- services/       # Consumo de endpoints
|   `-- stores/         # Sesion del usuario
|-- package.json
`-- vite.config.js
```

## Variable De Entorno

Crear `.env` local sin versionarlo:

```env
VITE_API_URL=http://127.0.0.1:8000/api/v1
```

## Comandos

```powershell
npm install
npm run dev
npm run build
npm run lint
npm run preview
```

## Rutas Principales

| Ruta | Vista |
| --- | --- |
| `/login` | Inicio de sesion. |
| `/admin/dashboard` | Resumen institucional. |
| `/admin/environmental-impact` | Dashboard ambiental. |
| `/admin/schedules` | Gestion/generacion institucional. |
| `/admin/schedule-quality` | Validacion de calidad. |
| `/admin/academic-periods` | Gestión de períodos. |
| `/admin/academic-programs` | Gestión de carreras. |
| `/admin/curriculum-plans` | Planes curriculares. |
| `/admin/curriculum` | Malla, electivos y prerrequisitos editables. |
| `/student` | Inicio estudiante. |
| `/student/schedule-generator` | Generacion personal. |
| `/student/curriculum` | Malla activa y elegibilidad. |

## Roles Y Vistas

| Rol | Alcance en interfaz |
| --- | --- |
| `ADMIN` | Gestion integral y dashboards. |
| `COORDINATOR` | Planificacion y publicacion academica. |
| `TEACHER` | Informacion docente. |
| `STUDENT` | Oferta, preferencias y horarios personales. |

## Malla Curricular

La pantalla administrativa permite filtrar cursos por ciclo/tipo, marcar
electivos sugeridos y mantener prerrequisitos. La pantalla estudiantil muestra
la malla activa y trata los prerrequisitos `RECOMMENDED` como orientación, no
como bloqueo. El cliente HTTP continúa usando el Axios unificado con JWT.
## Fase 3

El coordinador dispone de `/coordinator/csp` para generar y guardar horarios institucionales desde ofertas academicas. El estudiante ve en `/student/offer` solo secciones publicadas de cursos asignados y en `/student/schedule-generator` puede usar el modo real **Generar horario con mis cursos matriculados**, manteniendo el modo exploracion previo.

## Portal docente

El rol `TEACHER` tiene rutas propias: `/teacher/dashboard`, `/teacher/schedule`, `/teacher/sections`, `/teacher/availability`, `/teacher/load`, `/teacher/conflicts` y `/teacher/change-requests`. Coordinacion revisa solicitudes en `/coordinator/change-requests`.

## Reportes Y Panel Ejecutivo

El administrador dispone de `/admin/executive-dashboard` y de reportes
detallados bajo `/admin/reports/*`. El coordinador consulta el panel operativo
en `/coordinator/reports` y sus reportes de carga, aulas, ofertas, conflictos,
horarios y solicitudes. Las vistas usan `reportService.js`, el cliente Axios
unificado y permiten filtrar por ID de periodo y descargar CSV donde aplica.

## Notificaciones Y Trazabilidad

Todos los usuarios autenticados disponen de la campana de notificaciones y de
`/notifications`. `ADMIN` consulta auditoria en `/admin/audit-logs` y puede
exportarla en CSV. `ADMIN` y `COORDINATOR` consultan publicaciones y cambios
en `/admin/traceability` y `/coordinator/traceability`, respectivamente.

Las vistas reutilizan el Axios unificado mediante `notificationService.js`,
`auditLogService.js` y `traceabilityService.js`.

## Navegacion Y Generacion Guiada

La pantalla `/admin/institutional-csp` reemplaza el campo manual de ID por el
selector **Horario institucional**. Permite crear un horario nuevo o elegir
horarios detectados automaticamente con etiquetas de periodo, estado, bloques
y score.

La vista tambien detecta periodo activo, programa ISI, plan curricular activo
y ciclos segun `total_cycles`. El menu lateral agrupa opciones por rol en
secciones expandibles y recuerda el estado en `localStorage`.

## Resultados CSP Visuales

Los resultados de diagnostico, vista previa, generacion y publicacion ya no se
presentan como JSON crudo. Se muestran mediante tarjetas, badges, tablas de
bloques, listas de problemas y resumenes de docentes/aulas. El JSON tecnico
queda disponible solo en el acordeon `Ver detalles tecnicos`, cerrado por
defecto para depuracion.

La pantalla `/admin/institutional-csp` usa por defecto la fuente **Oferta
academica moderna**, basada en `section_offerings`. En ese modo llama a
`/institutional-csp/preview-from-offerings`,
`/institutional-csp/generate-from-offerings` y
`/institutional-csp/save-offering-solution`. El generador clasico se mantiene
como opcion `legacy` explicita para datos antiguos basados en `course_sections`.

Para una demo completa, el rol `ADMIN` dispone del boton **Preparar datos demo
completo**. Este boton crea/completa ofertas para todos los ciclos del plan
activo, asigna docentes, aulas y disponibilidad, y ejecuta una vista previa
moderna sin requerir comandos SQL durante la presentacion.

## Accesibilidad Visual Y Navegacion

La interfaz incluye una barra compacta para aumentar o reducir texto y
restablecer preferencias guardadas en `localStorage`. El selector de apariencia
permite elegir modo claro u oscuro desde login y desde la cabecera autenticada.

El layout ofrece **Saltar al contenido principal**, foco reforzado, navegación
lateral semántica, estados que combinan texto e icono, anuncios accesibles para
cargas y errores, y reducción de movimiento mediante
`prefers-reduced-motion`.

## Tablas Y Reportes Legibles

Los reportes administrativos usan encabezados semanticos, captions para
lectores de pantalla, scroll horizontal controlado y tipografia minima
`text-sm`. Los indicadores ambientales muestran unidades explicitas
(`g CO2`, `ms`, `KB`) y barras de participacion con valor textual.

Las rutas tecnicas de API se presentan con nombres funcionales comprensibles.
Cuando el dato tecnico aporta valor para soporte, queda disponible dentro de
`Ver detalle tecnico`, cerrado por defecto. La barra visual ofrece modo claro
y modo oscuro suave, ademas del ajuste persistente de tamano de texto.

## Optimizacion De Listados Y Solicitudes

Los listados administrativos prioritarios cargan paginas acotadas y muestran
el total de registros. Facultades, sedes, programas academicos, periodos y
planes curriculares usan una cache breve con deduplicacion de solicitudes
concurrentes e invalidacion despues de cambios.

La preparacion de mediciones antes y despues se documenta en
[`Doc/07. OPTIACADEMIC - SOSTENIBILIDAD Y VALIDACION/sostenibilidad/07-validacion-lighthouse.md`](../Doc/07.%20OPTIACADEMIC%20-%20SOSTENIBILIDAD%20Y%20VALIDACION/sostenibilidad/07-validacion-lighthouse.md).
