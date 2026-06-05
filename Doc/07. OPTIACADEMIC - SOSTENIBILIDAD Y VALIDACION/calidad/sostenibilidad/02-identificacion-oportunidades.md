# Actividad 2.2: Identificacion de oportunidades de optimizacion

## Objetivo

Analizar el funcionamiento actual del proyecto para identificar modulos,
componentes o funcionalidades que puedan optimizarse. Esta etapa busca detectar
problemas de rendimiento que incrementan el uso de recursos tecnologicos y, en
consecuencia, el consumo energetico asociado a la aplicacion.

## Alcance de la revision

La revision se enfoca en las capas principales de la arquitectura usada en el
proyecto:

- **Base de datos - MySQL:** consultas SQL, indices, filtros, paginacion,
  relaciones y volumen de registros.
- **Backend - FastAPI:** endpoints, servicios, validaciones, respuestas,
  manejo de errores y cantidad de solicitudes.
- **Frontend - React:** componentes, renderizados, carga de recursos, imagenes
  y consumo de API.
- **Infraestructura local - Docker Compose:** contenedores, variables de
  entorno, servicios activos y consumo durante desarrollo.

El analisis no solo considera si la aplicacion funciona, sino tambien si lo
hace de manera eficiente. Un sistema puede cumplir su objetivo funcional y aun
asi consumir mas recursos de los necesarios.

La revision se aplica a modulos reales: login, dashboard administrativo,
generacion institucional, preparacion demo completa, estudiantes
institucionales, historial academico, reportes, sostenibilidad, auditoria,
trazabilidad y notificaciones.

## Metodologia de analisis

Para identificar oportunidades de mejora se sigue el siguiente proceso:

1. Revisar las pantallas principales del proyecto.
2. Observar tiempos de carga, comportamiento de formularios, listados y rutas.
3. Identificar llamadas repetidas o innecesarias a la API.
4. Revisar si las respuestas del backend contienen datos excesivos.
5. Analizar consultas SQL que podrian requerir filtros, indices o
   paginacion.
6. Verificar si existen imagenes pesadas o recursos estaticos sin optimizar.
7. Detectar dependencias que no se usan o que podrian reemplazarse por
   soluciones mas ligeras.
8. Proponer mejoras justificadas desde el punto de vista tecnico.

## Oportunidades de mejora identificadas

### 1. Optimizar consultas MySQL

**Problema detectado:** algunas consultas pueden traer demasiados registros sin
filtros o paginacion.

**Mejora propuesta:** aplicar filtros, paginacion e indices en campos
consultados frecuentemente.

**Justificacion tecnica:** reduce tiempo de respuesta, uso de CPU y memoria en
la base de datos.

### 2. Reducir datos enviados por la API

**Problema detectado:** algunos endpoints pueden devolver campos que el frontend
no utiliza.

**Mejora propuesta:** crear respuestas mas especificas por caso de uso.

**Justificacion tecnica:** disminuye bytes transferidos y acelera la carga de
la interfaz.

### 3. Controlar solicitudes HTTP

**Problema detectado:** algunas pantallas pueden hacer varias peticiones al
cargar o repetirlas en cada render.

**Mejora propuesta:** agrupar solicitudes, usar cache y revisar dependencias de
`useEffect`.

**Justificacion tecnica:** reduce trafico de red y carga del servidor.

### 4. Optimizar imagenes

**Problema detectado:** imagenes grandes o sin compresion aumentan el peso
inicial de la pagina.

**Mejora propuesta:** comprimir imagenes, usar formatos modernos y cargar solo
el tamano necesario.

**Justificacion tecnica:** mejora el tiempo de carga y reduce transferencia de
datos.

### 5. Dividir componentes React

**Problema detectado:** componentes grandes pueden renderizarse aunque no sean
necesarios en la vista actual.

**Mejora propuesta:** aplicar lazy loading y separacion por rutas o modulos.

**Justificacion tecnica:** disminuye el JavaScript inicial y mejora la
experiencia del usuario.

### 6. Revisar dependencias

**Problema detectado:** algunas librerias pueden no utilizarse o ser demasiado
pesadas para una funcion simple.

**Mejora propuesta:** eliminar dependencias innecesarias y evaluar alternativas
ligeras.

**Justificacion tecnica:** reduce el tamano del proyecto y el bundle del
frontend.

### 7. Mejorar manejo de estados

**Problema detectado:** estados globales o locales mal organizados pueden
generar renderizados innecesarios.

**Mejora propuesta:** separar estados por responsabilidad y memorizar calculos
costosos.

**Justificacion tecnica:** reduce trabajo del navegador y mejora la fluidez de
la interfaz.

### 8. Implementar cache

**Problema detectado:** datos poco cambiantes pueden consultarse repetidamente
al backend.

**Mejora propuesta:** usar cache en frontend o backend para datos estables.

**Justificacion tecnica:** evita procesamiento repetido y disminuye solicitudes
a la API.

### 9. Optimizar validaciones

**Problema detectado:** validaciones complejas pueden ejecutarse muchas veces en
servidor o cliente.

**Mejora propuesta:** validar solo cuando sea necesario y reutilizar resultados
cuando aplique.

**Justificacion tecnica:** reduce procesamiento duplicado y mejora la respuesta
del sistema.

### 10. Monitorear rendimiento

**Problema detectado:** sin mediciones es dificil saber donde se consume mas
tiempo o recursos.

**Mejora propuesta:** registrar tiempos de respuesta, tamanos de respuesta y
endpoints mas usados.

**Justificacion tecnica:** permite priorizar mejoras con evidencia tecnica.

### 11. Revisar la generacion institucional CSP

**Problema detectado:** la generacion depende de ofertas elegibles en estados
`READY` o `APPROVED`; cuando faltan datos o crece la cantidad de bloques, una
recomputacion completa puede tardar mas de lo necesario.

**Mejora propuesta:** medir ofertas elegibles y bloques generados, conservar
una estrategia greedy controlada para escenarios amplios y evaluar
recalculos parciales cuando cambie un dato pequeno.

**Justificacion tecnica:** reduce trabajo repetido sin alterar las reglas de
negocio del horario institucional.

## Analisis por capa del proyecto

### MySQL

La base de datos puede convertirse en un punto critico si las consultas no
estan optimizadas. Consultar tablas completas, no usar indices o filtrar datos
en el backend despues de traerlos desde la base aumenta el consumo de recursos.

Oportunidades:

- Agregar indices en campos usados para busqueda, filtros o relaciones.
- Usar paginacion en listados extensos.
- Evitar traer registros completos si solo se necesitan algunos campos.
- Revisar consultas que se ejecutan muchas veces por una misma accion.
- Optimizar relaciones y cargas asociadas para evitar consultas repetitivas.

### FastAPI

El backend debe responder con la menor cantidad de trabajo necesario. Si una
ruta ejecuta muchas consultas, repite validaciones o devuelve datos excesivos,
la API consumira mas CPU, memoria y ancho de banda.

Oportunidades:

- Separar endpoints por necesidad real del frontend.
- Evitar respuestas demasiado grandes.
- Centralizar validaciones comunes.
- Revisar middleware que se ejecuta en todas las rutas.
- Controlar errores sin generar procesos innecesarios.
- Medir endpoints criticos para detectar rutas con mayor tiempo de respuesta.

### React

El frontend influye directamente en el rendimiento percibido por el usuario.
Una carga inicial pesada, componentes con renderizados innecesarios o llamadas
repetidas a la API pueden hacer que la aplicacion se sienta lenta.

Oportunidades:

- Aplicar `React.lazy` para modulos no criticos.
- Revisar dependencias de `useEffect` para evitar llamadas duplicadas.
- Memorizar componentes o calculos cuando sea necesario.
- Reducir imagenes decorativas pesadas.
- Dividir pantallas grandes en componentes mas simples.

### Recursos estaticos

Los recursos como imagenes, iconos, fuentes y hojas de estilo tambien afectan
el rendimiento. Si no estan optimizados, aumentan la transferencia de datos y
el tiempo de carga.

Oportunidades:

- Comprimir imagenes.
- Usar formatos como WebP o AVIF cuando sea posible.
- Evitar cargar imagenes que no aparecen inicialmente en pantalla.
- Revisar fuentes externas y pesos tipograficos innecesarios.
- Eliminar archivos estaticos no utilizados.

## Priorizacion de mejoras

| Prioridad | Mejora | Motivo |
| --- | --- | --- |
| Alta | Paginacion y filtros en listados | Impacta directamente en base de datos, API y frontend. |
| Alta | Reduccion de solicitudes HTTP duplicadas | Disminuye carga del servidor y mejora la experiencia de usuario. |
| Media | Optimizacion de imagenes | Reduce peso de carga y consumo de red. |
| Media | Eliminacion de dependencias no usadas | Mejora mantenimiento y reduce el tamano del proyecto. |
| Media | Lazy loading de componentes | Reduce el JavaScript inicial descargado por el navegador. |
| Baja | Ajustes visuales menores | Mejoran la experiencia, pero tienen menor impacto ambiental directo. |

## Estado Actual De Mejoras

| Mejora | Estado |
| --- | --- |
| Paginacion en listados principales | Implementado parcialmente: usuarios, docentes, estudiantes, aulas, auditoria, estudiantes institucionales e historial academico tienen control visual. Cursos, secciones y horarios conservan `skip` y `limit`, pero queda pendiente un control visual uniforme. |
| Reduccion de solicitudes repetidas | Implementado parcialmente: cache breve en catalogos estables y reutilizacion de sesion; quedan pendientes revisiones profundas en dashboards y notificaciones. |
| Lazy loading | Implementado en rutas principales mediante `React.lazy` y `Suspense`. |
| Medicion ambiental | Implementado con middleware, endpoints `/api/v1/environmental-impact/*`, vista `/admin/environmental-impact` y ruta `/admin/reports/sustainability`. |
| Lighthouse | Pendiente de captura manual con evidencias antes/despues. |
| Optimizacion de imagenes | Pendiente; no se documenta como implementada. |

## Justificacion tecnica

Las mejoras propuestas son necesarias porque el rendimiento de una aplicacion
web esta relacionado con la cantidad de recursos que consume. Cuando una API
responde mas rapido, la base de datos trabaja menos tiempo. Cuando el frontend
descarga menos datos, el navegador procesa menos informacion. Cuando se reducen
las solicitudes innecesarias, tambien se reduce el trabajo del servidor y de la
red.

Por ello, optimizar el sistema no solo mejora la experiencia del usuario, sino
que tambien contribuye a reducir el consumo energetico asociado al uso de la
aplicacion. En un entorno con muchos usuarios, estas mejoras pueden representar
una reduccion importante de carga acumulada.

## Resultado esperado

Como resultado de esta actividad se obtiene una lista clara de oportunidades
de mejora para optimizar el sistema basado en React, FastAPI y MySQL. Estas
oportunidades permiten priorizar acciones tecnicas que reduzcan el consumo de
recursos, mejoren el rendimiento del sistema y aporten a una practica de
desarrollo web mas sostenible.
