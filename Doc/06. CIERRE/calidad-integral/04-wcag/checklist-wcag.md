# Checklist WCAG

| Criterio | Descripcion | Ruta evaluada | Estado | Evidencia | Observacion |
|---|---|---|---|---|---|
| Contraste de colores | Texto y controles con contraste suficiente | `/login` | Pendiente de evidencia | Lighthouse / captura | Evaluar en claro y oscuro |
| Navegacion con Tab | El usuario puede recorrer controles principales | `/login` | Pendiente de evidencia | Captura o video corto | Validar orden logico |
| Navegacion con Shift + Tab | El foco retrocede sin perderse | `/admin/institutional-csp` | Pendiente de evidencia | Captura o video corto | Requiere sesion |
| Uso de Enter | Botones y acciones responden con teclado | `/admin/reports/sustainability` | Pendiente de evidencia | Captura | Validar acciones principales |
| Uso de Space | Controles interactivos responden correctamente | `/admin/dashboard` | Pendiente de evidencia | Captura | Validar toggles/botones |
| Foco visible | El elemento activo se identifica visualmente | Todas | Pendiente de evidencia | Captura de foco | Verificar dark mode |
| Etiquetas en formularios | Inputs con labels visibles o nombre accesible | `/login` | Pendiente de evidencia | DOM / captura | Revisar email y password |
| Botones accesibles | Botones con texto claro o `aria-label` | Todas | Pendiente de evidencia | DOM / captura | No depender solo de iconos |
| Mensajes de error | Errores comprensibles y no tecnicos | `/login` | Pendiente de evidencia | Captura | Login invalido |
| Tablas legibles | Encabezados claros y datos con contraste | `/admin/students` | Pendiente de evidencia | Captura | Validar scroll responsive |
| Modo claro/oscuro | Ambos modos conservan legibilidad | Todas | Pendiente de evidencia | Capturas comparativas | No usar alto contraste agresivo |
| Lector de pantalla | Estructura semantica y nombres accesibles | `/admin/institutional-csp` | Pendiente de evidencia | Revision manual | Validar headings y regiones |

## Nota

Los estados deben actualizarse despues de ejecutar Lighthouse y validacion manual. No se debe marcar como aprobado un criterio sin evidencia.
