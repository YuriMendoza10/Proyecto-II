# Validacion manual WCAG

## Objetivo

Verificar que OptiAcademic sea usable por teclado, tenga foco visible, mensajes claros y componentes legibles en modo claro y oscuro.

## Procedimiento

1. Abrir la ruta a evaluar.
2. Usar `Tab` para avanzar por los controles.
3. Usar `Shift + Tab` para retroceder.
4. Usar `Enter` para activar enlaces o botones.
5. Usar `Space` en botones, toggles o controles aplicables.
6. Confirmar que el foco visible no se pierde.
7. Revisar que los formularios tengan etiquetas.
8. Revisar que los mensajes de error sean comprensibles.
9. Revisar tablas, badges y tarjetas en modo claro y oscuro.
10. Ejecutar Lighthouse Accessibility y guardar captura.

## Rutas sugeridas

- `/login`
- `/admin/dashboard`
- `/admin/institutional-csp`
- `/admin/schedule-view`
- `/admin/reports/sustainability`
- `/admin/students`
- `/admin/teachers`

## Evidencia esperada

- Captura de Lighthouse Accessibility.
- Captura de navegacion por teclado.
- Captura de foco visible.
- Captura de modo claro y modo oscuro.
- Checklist WCAG completado.
