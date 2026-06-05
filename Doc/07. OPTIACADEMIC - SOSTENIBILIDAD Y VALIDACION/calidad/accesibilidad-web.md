# Accesibilidad Web

## Alcance

OptiAcademic incorpora una capa transversal de accesibilidad visual y
navegación para mejorar el uso con teclado, lectores de pantalla, baja visión,
daltonismo y sensibilidad al movimiento. Las mejoras toman como referencia
criterios WCAG de contraste, foco visible, semántica y percepción no basada
únicamente en color.

## Preferencias Visuales

La barra compacta de accesibilidad permite:

- activar o desactivar alto contraste;
- aumentar o reducir el tamaño del texto;
- restablecer preferencias;
- conservar la selección en `localStorage`.

Los estilos globales también respetan `prefers-reduced-motion`.

## Navegación Y Lectores De Pantalla

- Existe un enlace **Saltar al contenido principal**.
- El contenido principal usa `id="main-content"`.
- Las secciones del menú lateral exponen `aria-expanded` y `aria-controls`.
- Los enlaces activos usan la semántica de `NavLink`.
- Los botones de icono prioritarios tienen nombre accesible.
- Las cargas usan `role="status"` y los errores importantes `role="alert"`.
- Las tablas institucionales incluyen `caption` y encabezados con
  `scope="col"`.

## Estados

`StatusBadge` combina color, icono y texto legible. Por ejemplo: **Publicado**,
**Borrador**, **Advertencia**, **Aprobado** y **Desaprobado**. Ningún estado
prioritario depende únicamente del color.

## Formularios Priorizados

Se revisaron login, facultades, sede Huancayo, estudiantes institucionales,
historial académico, filtros del panel ejecutivo, disponibilidad docente y
oferta estudiantil.

## Limitaciones Pendientes

La aplicación conserva pantallas legacy extensas. Una auditoría posterior con
Lighthouse, axe o lector de pantalla real debe ampliar captions, labels y
descripciones en formularios administrativos secundarios y visualizaciones
complejas.

## Legibilidad De Reportes

- Las tablas densas usan encabezados visibles, `scope="col"`, captions
  accesibles y separacion clara entre filas.
- Los indicadores muestran unidades explicitas y redondeo consistente para
  porcentajes, CO2, tiempos y transferencia.
- Las barras de participacion ambiental incluyen porcentaje textual y
  atributos ARIA de progreso.
- Los reportes y el panel ejecutivo incluyen tarjetas resumen para lectura
  rapida durante una demo.
- Las rutas API se sustituyen visualmente por nombres amigables de modulo.
  El endpoint original se conserva en un detalle tecnico colapsable.
- La apariencia permite alternar entre modo claro y modo oscuro slate,
  persistidos en `localStorage`, sin usar negro puro como fondo principal.
- Se mantienen foco visible, labels, semantica de tablas y ajuste de texto sin
  sobrecargar la pantalla principal con informacion de depuracion.
