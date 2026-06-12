# Checklist WCAG

| Criterio WCAG | Ruta | Metodo de validacion | Resultado | Evidencia | Observacion |
|---|---|---|---|---|---|
| Contraste de colores | `/login` | Lighthouse Accessibility / inspeccion visual | Pendiente | `wcag-login-lighthouse.png` | Evaluar modo claro y oscuro. |
| Contraste de colores | `/admin/reports/sustainability` | Lighthouse Accessibility | Pendiente | `wcag-sustainability-lighthouse.png` | Revisar tablas y metricas. |
| Navegacion con teclado | `/login` | Tab, Shift + Tab, Enter | Pendiente | `wcag-keyboard-navigation.png` | Validar orden logico. |
| Navegacion con teclado | `/admin/institutional-csp` | Tab, Shift + Tab, Enter, Space | Pendiente | `wcag-institutional-csp-lighthouse.png` | Requiere sesion. |
| Foco visible | `/admin/institutional-csp` | Revision manual de foco | Pendiente | `wcag-keyboard-navigation.png` | Validar botones y tabs. |
| Labels en formularios | `/login` | Inspeccion DOM / lector de pantalla | Pendiente | `wcag-login-lighthouse.png` | Email y contrasena deben tener nombre accesible. |
| Textos alternativos | Rutas con imagenes | Inspeccion DOM | Pendiente | Captura DOM | No aplicar si no hay imagenes informativas. |
| Botones accesibles | `/admin/schedule-view` | Inspeccion DOM / teclado | Pendiente | `wcag-schedule-view-lighthouse.png` | Iconos deben tener texto o `aria-label`. |
| Mensajes de error | `/login` | Login invalido | Pendiente | Captura login invalido | Debe ser comprensible y no tecnico. |
| Estructura semantica | Todas las rutas evaluadas | Lighthouse / inspeccion headings | Pendiente | Capturas Lighthouse | Revisar jerarquia h1/h2. |
| Modo claro/oscuro | Rutas principales | Validacion visual | Pendiente | Capturas comparativas | No debe haber texto ilegible. |

No marcar criterios como aprobados sin captura o evidencia real.
