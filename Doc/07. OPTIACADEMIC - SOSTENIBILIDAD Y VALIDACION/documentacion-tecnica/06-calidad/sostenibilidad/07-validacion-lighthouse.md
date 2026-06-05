# Validacion Lighthouse

## Objetivo

Medir el efecto de las optimizaciones frontend de `OptiAcademic` con una
comparacion reproducible antes y despues. La validacion complementa el build,
las pruebas funcionales y la revision de solicitudes HTTP en DevTools.

## Como Ejecutar Lighthouse En Chrome

1. Levantar el entorno y abrir la pantalla que se desea evaluar.
2. Abrir DevTools con `F12`.
3. Elegir la pestana **Lighthouse**.
4. Seleccionar modo **Navigation** y dispositivo **Desktop** o **Mobile**.
5. Ejecutar el analisis con **Analyze page load**.
6. Guardar el reporte y una captura con fecha, rol y datos demo utilizados.
7. Repetir la medicion con las mismas condiciones despues de optimizar.

Las pantallas protegidas deben evaluarse despues de iniciar sesion con el rol
correspondiente. Para evitar mediciones inconsistentes, usar el mismo navegador,
red y conjunto de datos en cada ronda.

## Pantallas A Evaluar

1. `/login`
2. `/admin/executive-dashboard`
3. `/admin/users`
4. `/admin/teachers`
5. `/admin/students`
6. `/admin/courses`
7. `/admin/schedules`
8. `/admin/reports/sustainability`

## Indicadores

- Performance.
- Accessibility.
- Best Practices.
- SEO, cuando aplique a una pantalla publica como `/login`.
- tiempo de carga inicial;
- tiempo de respuesta de endpoints FastAPI;
- cantidad de solicitudes HTTP observadas en Network;
- tamano de respuestas descargadas;
- fluidez al navegar;
- errores de consola;
- errores en backend.

## Plantilla Antes Y Despues

| Pantalla | Performance antes | Performance despues | Accesibilidad antes | Accesibilidad despues | Evidencia |
| --- | ---: | ---: | ---: | ---: | --- |
| `/login` | Pendiente | Pendiente | Pendiente | Pendiente | Reporte / captura |
| `/admin/executive-dashboard` | Pendiente | Pendiente | Pendiente | Pendiente | Reporte / captura |
| `/admin/users` | Pendiente | Pendiente | Pendiente | Pendiente | Reporte / captura |
| `/admin/teachers` | Pendiente | Pendiente | Pendiente | Pendiente | Reporte / captura |
| `/admin/students` | Pendiente | Pendiente | Pendiente | Pendiente | Reporte / captura |
| `/admin/courses` | Pendiente | Pendiente | Pendiente | Pendiente | Reporte / captura |
| `/admin/schedules` | Pendiente | Pendiente | Pendiente | Pendiente | Reporte / captura |
| `/admin/reports/sustainability` | Pendiente | Pendiente | Pendiente | Pendiente | Reporte / captura |

## Evidencias Complementarias

- capturas antes y despues en modo claro y oscuro;
- consola sin errores nuevos;
- build frontend exitoso;
- rutas HTTP con respuesta `200`;
- endpoints criticos funcionando;
- comparacion del numero de solicitudes HTTP;
- paginacion visible en listados grandes;
- logs backend sin errores `500`.

## Relacion Con Commits GitHub

```text
docs: document environmental impact analysis
docs: document optimization opportunities
docs: document implemented sustainability improvements
docs: document validation evidence plan
perf: add pagination to academic listings
perf: reduce repeated dashboard requests
perf: optimize environmental metrics responses
```

## Interpretacion

La ronda es satisfactoria cuando baja o se mantiene controlado el tiempo de
carga, disminuyen solicitudes duplicadas, mejora o se conserva la
accesibilidad y no aparecen errores nuevos. Una mejora puntual no compensa una
regresion funcional en login, generacion institucional, reportes o datos
academicos.
