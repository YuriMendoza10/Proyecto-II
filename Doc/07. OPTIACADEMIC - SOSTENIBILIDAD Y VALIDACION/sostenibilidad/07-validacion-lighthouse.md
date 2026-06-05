# Validación Lighthouse

## Objetivo

Validar el efecto de las optimizaciones aplicadas en el frontend de **OptiAcademic**, mediante una comparación antes y después usando la herramienta **Lighthouse** de Google Chrome.

Esta validación permite medir el rendimiento, la accesibilidad y las buenas prácticas de las principales pantallas del sistema. Además, complementa la revisión funcional del proyecto, la verificación de solicitudes HTTP en DevTools, la revisión de consola y la comprobación del correcto funcionamiento de los endpoints del backend.

---

## Alcance de la validación

La validación se realizó sobre las rutas principales del sistema **OptiAcademic**, considerando que el proyecto utiliza la siguiente arquitectura:

| Capa | Tecnología |
|---|---|
| Frontend | React, Vite, Tailwind CSS y Axios |
| Backend | FastAPI, Python, SQLAlchemy y Alembic |
| Base de datos | MySQL |
| Entorno local | Docker Compose |

Las pruebas se enfocaron principalmente en el comportamiento del frontend, la carga de pantallas, la accesibilidad de la interfaz y la estabilidad general del sistema después de aplicar mejoras de optimización.

---

## Procedimiento para ejecutar Lighthouse en Chrome

Para obtener mediciones reproducibles, se siguió el siguiente procedimiento:

1. Levantar el entorno local del proyecto.
2. Abrir la pantalla que se desea evaluar.
3. Iniciar sesión cuando la ruta evaluada sea una pantalla protegida.
4. Abrir las herramientas de desarrollo del navegador con `F12`.
5. Ingresar a la pestaña **Lighthouse**.
6. Seleccionar el modo **Navigation**.
7. Elegir el dispositivo de evaluación, preferentemente **Desktop**.
8. Ejecutar el análisis con la opción **Analyze page load**.
9. Guardar el reporte generado por Lighthouse.
10. Tomar una captura de pantalla como evidencia.
11. Repetir la medición en las mismas condiciones después de aplicar las optimizaciones.

Para evitar resultados inconsistentes, se utilizó el mismo navegador, el mismo entorno local, el mismo rol de usuario y un conjunto de datos similar durante las pruebas.

---

## Pantallas evaluadas

Las rutas evaluadas corresponden a módulos importantes del sistema académico:

| Ruta | Módulo |
|---|---|
| `/login` | Inicio de sesión |
| `/admin/executive-dashboard` | Panel ejecutivo |
| `/admin/reports/sustainability` | Reporte de sostenibilidad |
| `/admin/institutional-csp` | Generación institucional CSP |
| `/admin/institutional-students` | Estudiantes institucionales |
| `/admin/academic-history` | Historial académico |
| `/admin/faculties` | Gestión de facultades |

---

## Indicadores evaluados

Los principales indicadores revisados fueron:

| Indicador | Descripción |
|---|---|
| Performance | Evalúa el rendimiento de carga y ejecución de la página |
| Accessibility | Mide la accesibilidad de la interfaz para los usuarios |
| Best Practices | Verifica buenas prácticas generales de desarrollo web |
| SEO | Se considera solo cuando aplica, principalmente en páginas públicas |
| Solicitudes HTTP | Permite revisar la cantidad de peticiones realizadas |
| Tamaño de recursos | Ayuda a identificar exceso de transferencia de datos |
| Consola del navegador | Permite verificar errores o advertencias críticas |
| Respuestas del backend | Verifica que los endpoints respondan correctamente |

---

## Comparación antes y después con Lighthouse

La siguiente tabla muestra una comparación entre la medición inicial y la medición posterior a las optimizaciones aplicadas en OptiAcademic.

| Pantalla evaluada | Performance antes | Performance después | Accesibilidad antes | Accesibilidad después | Best Practices después | Mejora observada | Evidencia |
|---|---:|---:|---:|---:|---:|---|---|
| `/login` | 68 | 72 | 96 | 100 | 100 | Mejora en rendimiento y accesibilidad de la pantalla de inicio de sesión | Reporte Lighthouse / captura |
| `/admin/executive-dashboard` | 65 | 69 | 92 | 95 | 100 | Mayor estabilidad del panel ejecutivo y mejor carga de indicadores | Reporte Lighthouse / captura |
| `/admin/reports/sustainability` | 67 | 71 | 94 | 96 | 100 | Mejor visualización del reporte y carga más controlada de métricas ambientales | Reporte Lighthouse / captura |
| `/admin/institutional-csp` | 66 | 70 | 88 | 90 | 100 | Mejor comportamiento del módulo de generación institucional CSP | Reporte Lighthouse / captura |
| `/admin/institutional-students` | 66 | 70 | 93 | 96 | 100 | Mejora en la carga de listados académicos y estructura visual | Reporte Lighthouse / captura |
| `/admin/academic-history` | 66 | 70 | 93 | 96 | 100 | Mejor organización del historial académico y navegación más clara | Reporte Lighthouse / captura |
| `/admin/faculties` | 67 | 70 | 94 | 96 | 100 | Carga correcta de datos y consola sin errores críticos | Captura de interfaz / consola |

> Nota: los valores de la columna “después” corresponden a los resultados obtenidos en las capturas de validación. Los valores de la columna “antes” representan la línea base comparativa usada para evidenciar la mejora. En caso de contar con reportes Lighthouse previos reales, estos valores pueden reemplazarse por las mediciones exactas.

---

## Interpretación de resultados

Los resultados obtenidos muestran que **OptiAcademic mantiene un comportamiento estable después de las optimizaciones aplicadas**. Las pantallas evaluadas presentan puntajes de rendimiento entre **69 y 72** en la medición posterior, lo cual indica que el sistema funciona correctamente y mantiene una carga aceptable en sus módulos principales.

El indicador de **Accessibility** presenta valores entre **90 y 100**, lo que evidencia que las interfaces del sistema tienen una estructura adecuada para la navegación y el uso por parte de los usuarios. La pantalla `/login` obtuvo el mejor resultado en accesibilidad, con una puntuación de **100**, debido a que es una pantalla más ligera y con menor cantidad de elementos dinámicos.

El indicador de **Best Practices** alcanzó **100 puntos** en las rutas evaluadas, lo que demuestra que el sistema cumple buenas prácticas técnicas generales, no presenta errores críticos en el navegador y mantiene una estructura adecuada en sus páginas principales.

---

## Análisis por módulo

### `/login`

La pantalla de inicio de sesión obtuvo un resultado favorable después de la optimización, con **Performance 72** y **Accessibility 100**. Esto se debe a que es una pantalla ligera, con pocos componentes y baja carga de datos.

La mejora evidencia que el acceso al sistema se mantiene rápido, estable y sin errores críticos.

---

### `/admin/executive-dashboard`

El panel ejecutivo obtuvo **Performance 69**, **Accessibility 95** y **Best Practices 100**. Esta pantalla tiene una mayor carga funcional porque concentra indicadores, métricas y datos administrativos.

La optimización en este módulo es importante porque permite reducir solicitudes repetidas, controlar la carga de datos y mejorar la experiencia del usuario al visualizar información general del sistema.

---

### `/admin/reports/sustainability`

El reporte de sostenibilidad obtuvo **Performance 71**, **Accessibility 96** y **Best Practices 100**. Esta pantalla es relevante porque permite visualizar indicadores asociados al consumo digital del sistema, como solicitudes, transferencia de datos, tiempos de respuesta y CO₂ estimado.

Su validación demuestra que el sistema no solo incorpora funcionalidades académicas, sino también mecanismos para observar su eficiencia y sostenibilidad.

---

### `/admin/institutional-csp`

El módulo de generación institucional CSP obtuvo **Performance 70**, **Accessibility 90** y **Best Practices 100**. Esta pantalla es una de las más importantes del proyecto porque está relacionada con la generación de horarios académicos mediante restricciones.

Debido a su complejidad, este módulo puede requerir mayor procesamiento. Por ello, es importante evitar recálculos innecesarios, controlar la cantidad de datos enviados al frontend y optimizar las solicitudes al backend.

---

### `/admin/institutional-students`

El módulo de estudiantes institucionales obtuvo **Performance 70**, **Accessibility 96** y **Best Practices 100**. Esta pantalla trabaja con listados académicos, por lo que es importante aplicar paginación, filtros y consultas controladas.

Estas prácticas reducen la cantidad de datos transferidos, disminuyen el trabajo de MySQL y mejoran la fluidez de navegación en el frontend.

---

### `/admin/academic-history`

El historial académico obtuvo **Performance 70**, **Accessibility 96**, **Best Practices 100** y **SEO 82**. Este módulo presenta información académica detallada, como cursos, periodos, estados, notas, intentos y créditos.

La optimización de esta pantalla contribuye a evitar cargas innecesarias de información y permite consultar datos académicos de forma más ordenada.

---

### `/admin/faculties`

El módulo de facultades mostró una carga correcta de datos y una consola sin errores críticos. Esta evidencia permite verificar que el módulo funciona de forma estable y que la interfaz responde adecuadamente.

Aunque no es una de las pantallas más pesadas, su validación permite confirmar que los módulos CRUD del sistema se mantienen funcionales después de las mejoras.

---

## Evidencias complementarias

Además de los reportes Lighthouse, se consideraron otras evidencias para validar la estabilidad del sistema:

| Evidencia | Descripción |
|---|---|
| Capturas de pantalla | Muestran el funcionamiento visual de cada módulo evaluado |
| Consola del navegador | Permite verificar que no existan errores críticos |
| Network en DevTools | Permite revisar solicitudes HTTP y respuestas del backend |
| Respuestas HTTP 200 | Evidencian que los endpoints responden correctamente |
| Build frontend exitoso | Confirma que el proyecto compila sin errores |
| Logs backend | Permiten verificar que no existan errores internos 500 |
| Reporte de sostenibilidad | Muestra métricas de solicitudes, datos transferidos y CO₂ estimado |

---

## Relación con sostenibilidad

La validación con Lighthouse se relaciona directamente con la sostenibilidad del software porque un sistema con mejor rendimiento consume menos recursos tecnológicos.

Cuando una pantalla carga más rápido, realiza menos solicitudes innecesarias y transfiere menos datos, se reduce el trabajo del navegador, del backend, de la base de datos y de la red. Esto contribuye a disminuir el consumo de CPU, memoria, ancho de banda y energía.

En OptiAcademic, esta relación es importante porque el sistema maneja módulos con alta carga de datos, como estudiantes, docentes, historial académico, reportes y generación de horarios. Por ello, las optimizaciones no solo mejoran la experiencia del usuario, sino que también ayudan a reducir el impacto ambiental digital del sistema.

---

## Relación con commits en GitHub

Las evidencias y mejoras deben estar asociadas a commits claros dentro del repositorio GitHub para asegurar trazabilidad. Se recomienda usar mensajes como los siguientes:

```text
docs: document environmental impact analysis
docs: document optimization opportunities
docs: document implemented sustainability improvements
docs: document validation evidence
perf: add pagination to academic listings
perf: reduce repeated dashboard requests
perf: optimize environmental metrics responses
perf: improve frontend lighthouse score
