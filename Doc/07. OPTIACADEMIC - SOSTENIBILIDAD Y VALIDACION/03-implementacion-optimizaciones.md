# Actividad 2.3: Implementacion de mejoras de optimizacion

## Objetivo

Aplicar mejoras tecnicas dentro del proyecto para obtener un sistema mas
rapido, eficiente y sostenible. Esta fase se desarrolla segun la arquitectura
real del sistema: React en el frontend, FastAPI en el backend, MySQL como base
de datos y Docker Compose para el entorno local.

## Tecnologias consideradas

- **Frontend:** React, Vite, Tailwind CSS y Axios.
- **Backend:** FastAPI, Python, SQLAlchemy y Alembic.
- **Base de datos:** MySQL.
- **Ejecucion local:** Docker Compose.
- **Control de versiones:** Git y GitHub.

## Mejoras implementadas o propuestas

Este documento separa mejoras ya presentes de propuestas pendientes. La
integracion documental no implementa paginacion masiva ni cambios profundos
de backend.

## Resumen De Estado

| Mejora | Estado en OptiAcademic |
| --- | --- |
| `React.lazy` y `Suspense` | Implementado en `frontend/src/App.jsx`. |
| Paginacion visual | Implementada en usuarios, docentes, estudiantes, aulas, auditoria, estudiantes institucionales e historial academico. |
| Paginacion API o limites | Disponible en cursos, secciones, horarios y bloques mediante `skip`/`limit`; pendiente control visual uniforme. |
| Cache de catalogos | Implementada para facultades, sedes, programas academicos, periodos y planes curriculares mediante `serviceCache.js`. |
| Nombres amigables de endpoints | Implementado con `endpointLabels.js`; el endpoint tecnico queda en detalle colapsable. |
| Modo claro/oscuro | Implementado con `useTheme`, `ThemeToggle`, `localStorage` y clase `dark`. |
| Reporte ambiental | Implementado con `/api/v1/environmental-impact/*`, `/api/v1/reports/sustainability`, `/admin/environmental-impact` y `/admin/reports/sustainability`. |
| Optimizacion de imagenes | Pendiente. |
| Lighthouse | Documentado; pendiente captura manual antes/despues. |

### 1. Optimizar consultas en MySQL

Se revisan las consultas realizadas por SQLAlchemy hacia MySQL. El objetivo es
evitar lecturas innecesarias, consultas repetidas o busquedas sin filtros.

Acciones:

- Aplicar filtros en endpoints que listan informacion.
- Evitar traer registros que no se usaran en pantalla.
- Revisar campos usados frecuentemente para considerar indices.
- Reducir consultas repetidas en servicios del backend.

Resultado esperado:

- Menor tiempo de respuesta en la API.
- Menor carga sobre MySQL.
- Menor consumo de CPU y memoria en el servidor de base de datos.

### 2. Implementar paginacion

Los listados grandes pueden afectar el rendimiento si cargan todos los datos al
mismo tiempo. Por ello, la paginacion permite consultar solo una parte de la
informacion en cada solicitud.

Acciones:

- Usar parametros como `skip`, `limit`, `page` o `page_size` en endpoints de
  consulta.
- Aplicar paginacion en listados de usuarios, docentes, estudiantes, cursos,
  aulas, secciones y reportes.
- Mostrar en el frontend solo los registros necesarios para la vista actual.

Resultado esperado:

- Respuestas mas ligeras.
- Menor transferencia de datos.
- Carga mas rapida de pantallas administrativas.

Evidencia en el proyecto:

- `PaginationControls` se usa en usuarios, docentes, estudiantes, aulas,
  auditoria, estudiantes institucionales e historial academico.
- `student-academic-history/page` usa respuesta paginada con `items`, `total`,
  `page`, `page_size` y `total_pages`.
- Cursos, secciones y horarios aceptan `skip` y `limit` en backend y servicios,
  pero su paginacion visual queda documentada como pendiente.

### 3. Comprimir imagenes y recursos visuales

Las imagenes pesadas incrementan el tiempo de carga y la transferencia de
datos. Optimizar los recursos visuales ayuda a reducir el consumo de red y
mejora la experiencia del usuario.

Acciones:

- Comprimir imagenes ubicadas en el frontend.
- Usar formatos adecuados como WebP cuando sea posible.
- Evitar imagenes decorativas innecesarias.
- Mantener tamanos proporcionales al uso real dentro de la interfaz.

Resultado esperado:

- Menor peso de carga inicial.
- Mejor rendimiento en conexiones lentas.
- Menor consumo de ancho de banda.

### 4. Aplicar lazy loading en React

El proyecto ya organiza varias pantallas mediante carga diferida con
`React.lazy`. Esta practica permite cargar componentes solo cuando el usuario
realmente navega hacia ellos.

Estado: **implementado** en las rutas principales del frontend.

Acciones:

- Mantener las paginas principales cargadas con `React.lazy`.
- Separar modulos grandes por rutas.
- Evitar importar pantallas administrativas, docentes o estudiantiles si el
  usuario aun no las necesita.
- Mostrar estados de carga mientras se obtiene el componente.

Resultado esperado:

- Menor JavaScript inicial.
- Carga mas rapida al abrir la aplicacion.
- Mejor uso de recursos en el navegador.

### 5. Eliminar dependencias innecesarias

Las dependencias aumentan el peso del proyecto y pueden afectar el tiempo de
instalacion, compilacion y carga. Por ello, deben conservarse solo las librerias
que aportan valor real.

Acciones:

- Revisar dependencias declaradas en `package.json`.
- Identificar librerias que no se usan en el frontend.
- Evitar agregar paquetes para funciones simples que pueden resolverse con
  codigo propio.
- Mantener dependencias de backend estrictamente necesarias en
  `requirements.txt`.

Resultado esperado:

- Proyecto mas ligero.
- Menor superficie de mantenimiento.
- Instalaciones y builds mas rapidos.

### 6. Reducir solicitudes HTTP repetitivas

Las solicitudes duplicadas aumentan el trafico entre frontend y backend. Tambien
incrementan el trabajo de FastAPI y MySQL si cada solicitud vuelve a consultar
la base de datos.

Acciones:

- Revisar llamadas realizadas por servicios Axios.
- Evitar peticiones repetidas al cargar una misma pantalla.
- Controlar correctamente dependencias de `useEffect`.
- Reutilizar datos ya cargados cuando no hayan cambiado.

Resultado esperado:

- Menor carga en la API.
- Menor consumo de red.
- Navegacion mas fluida para el usuario.

Evidencia en el proyecto:

- Varias pantallas agrupan solicitudes relacionadas con `Promise.all`.
- Los servicios Axios centralizan la URL base y el token JWT.
- `serviceCache.js` deduplica solicitudes concurrentes y reutiliza por un
  periodo corto catalogos estables.

### 7. Implementar cache de recursos o datos estables

El cache permite reutilizar informacion que no cambia constantemente. Esto
reduce solicitudes repetidas y acelera el acceso a datos frecuentes.

Acciones:

- Mantener en estado local o global datos de sesion ya consultados.
- Reutilizar informacion de catalogos cuando no cambie con frecuencia.
- Evaluar cache en endpoints de lectura si los datos son estables.
- Evitar recalcular reportes o indicadores si no hay cambios relevantes.

Resultado esperado:

- Menos consultas repetidas.
- Mejor velocidad percibida.
- Menor carga sobre backend y base de datos.

Evidencia en el proyecto:

- La configuracion del backend usa `lru_cache` para reutilizar settings.
- El estado de autenticacion conserva token y usuario en `localStorage`.
- Los catalogos de facultades, sedes, programas academicos, periodos y planes
  curriculares usan cache breve en frontend e invalidan al crear, editar o
  eliminar.

### 8. Optimizar APIs desarrolladas con FastAPI

La optimizacion se aplica a los endpoints FastAPI, servicios Python y consultas
SQLAlchemy.

Acciones:

- Devolver solo los campos necesarios para cada pantalla.
- Evitar logica duplicada en servicios.
- Medir tiempos de respuesta de endpoints criticos.
- Controlar errores sin generar procesamiento innecesario.
- Revisar endpoints que consultan varias tablas o generan reportes.

Resultado esperado:

- API mas rapida y estable.
- Menor uso de recursos del backend.
- Respuestas mas claras y especificas.

Evidencia en el proyecto:

- El middleware ambiental mide tiempo de respuesta, bytes transferidos y CO2
  estimado por solicitud.
- Los endpoints `/api/v1/environmental-impact/summary`,
  `/api/v1/environmental-impact/metrics` y
  `/api/v1/environmental-impact/ranking` permiten observar el impacto HTTP.
- El reporte `/api/v1/reports/sustainability` resume las metricas ambientales
  para reportes administrativos.

### 9. Verificar funcionamiento despues de cada mejora

Cada cambio debe validarse para asegurar que el sistema siga funcionando
correctamente. La optimizacion no debe romper funcionalidades existentes.

Acciones:

- Probar login y navegacion por roles.
- Verificar listados y formularios principales.
- Revisar endpoints desde Swagger o desde el frontend.
- Ejecutar migraciones si la mejora incluye cambios de base de datos.
- Comprobar que no aparezcan errores en consola ni en logs del backend.

Resultado esperado:

- Sistema funcional despues de cada mejora.
- Menor riesgo de regresiones.
- Evidencia tecnica de que los cambios son correctos.

### 10. Mejorar lenguaje visual y accesibilidad practica

Los reportes deben ser comprensibles para usuarios no tecnicos sin perder
detalle para soporte.

Acciones:

- Mostrar nombres funcionales en lugar de rutas API como dato principal.
- Conservar endpoints tecnicos dentro de detalles colapsables.
- Mantener foco visible, labels, tablas semanticas y texto legible.
- Permitir modo claro y modo oscuro con contraste suficiente.

Estado: **implementado** en reportes ambientales y componentes comunes.

### 11. Registrar cambios en GitHub

Los cambios realizados deben registrarse con commits claros para mantener la
trazabilidad del trabajo.

Acciones:

- Revisar archivos modificados con `git status`.
- Agrupar cambios relacionados en commits pequenos y descriptivos.
- Escribir mensajes de commit que indiquen la mejora aplicada.
- Subir los cambios a GitHub cuando la revision local sea correcta.

Ejemplos de commits:

```text
docs: document sustainability optimization implementation
perf: add pagination to users endpoint
perf: reduce repeated dashboard requests
chore: remove unused frontend dependency
```

Resultado esperado:

- Historial claro de mejoras.
- Evidencia del trabajo realizado.
- Facil seguimiento del avance del proyecto.

## Enfoque aplicado en el proyecto

Las mejoras se orientan a las tecnologias reales del sistema:

- Consultas y persistencia en MySQL mediante SQLAlchemy.
- Endpoints y servicios desarrollados con FastAPI.
- Interfaz construida con React, Vite y Axios.
- Ejecucion local mediante contenedores Docker Compose.

## Resultado esperado

Al finalizar esta fase se espera contar con un sistema mas rapido, eficiente y
optimizado. Las mejoras reducen la carga de datos, evitan procesamiento
innecesario, disminuyen solicitudes repetitivas y ayudan a que el sistema use
menos recursos tecnologicos durante su ejecucion.
