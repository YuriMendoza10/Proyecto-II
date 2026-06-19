# WCAG - Accesibilidad

Esta sección documenta la validación de accesibilidad aplicada al sistema OptiAcademic, considerando criterios WCAG relevantes para aplicaciones web modernas. La evaluación se realizó sobre rutas principales del sistema mediante revisión automática, inspección visual y validación manual de interacción.

## Rutas principales evaluadas

* `/login`.
* `/admin/institutional-csp`.
* `/admin/schedule-view`.
* `/admin/reports/sustainability`.

## Criterios evaluados

* Contraste de colores.
* Navegación mediante teclado.
* Foco visible en elementos interactivos.
* Uso de labels en formularios.
* Textos alternativos cuando corresponde.
* Botones accesibles.
* Mensajes de error comprensibles.
* Estructura semántica de la interfaz.
* Compatibilidad visual en modo claro/oscuro.
* Accesibilidad funcional de rutas principales.

## Herramientas y métodos utilizados

La validación de accesibilidad se realizó mediante:

* Revisión automática de accesibilidad con Lighthouse.
* Validación manual de navegación mediante teclado.
* Inspección visual de contraste, foco y jerarquía visual.
* Revisión de formularios, botones y mensajes de interacción.
* Verificación funcional de las rutas principales del sistema.

## Resultados de validación

| Ruta evaluada                   | Validación aplicada                                                 | Resultado |
| ------------------------------- | ------------------------------------------------------------------- | --------- |
| `/login`                        | Accesibilidad, contraste, formularios, foco y navegación            | Cumple    |
| `/admin/institutional-csp`      | Accesibilidad funcional, estructura visual y navegación             | Cumple    |
| `/admin/schedule-view`          | Visualización de horarios, navegación y comprensión de interfaz     | Cumple    |
| `/admin/reports/sustainability` | Lectura de indicadores, estructura visual y accesibilidad funcional | Cumple    |

## Evidencias disponibles

Las evidencias de validación se encuentran organizadas en la carpeta correspondiente a WCAG dentro de la documentación de calidad integral:

```txt
Doc/06. CIERRE/calidad-integral/04-wcag/evidencias/
```

Evidencias principales:

* `login.jpeg`
* `admin-institutionalcsp.jpeg`
* `admin-schedule-view.jpeg`
* `reportssustainability.jpeg`

## Interpretación técnica

Los resultados obtenidos permiten concluir que las rutas principales evaluadas de OptiAcademic cumplen con los criterios básicos de accesibilidad definidos para la actividad académica. Se verificó que las interfaces presentan una estructura visual comprensible, controles accesibles, navegación funcional y adecuada legibilidad para el usuario.

La validación demuestra que el sistema cuenta con condiciones aceptables de accesibilidad en sus módulos principales, permitiendo su uso en escenarios académicos de prueba y sustentación. Asimismo, se mantiene como oportunidad de mejora la ampliación futura de la validación WCAG hacia todos los módulos administrativos y estudiantiles del sistema.

## Estado final

Validación WCAG realizada.

Estado: Cumple.

No se identificaron incumplimientos críticos en las rutas principales evaluadas.
