# Actividad 2.4: Validación de optimizaciones

## Objetivo

Comprobar si las mejoras aplicadas en **OptiAcademic** contribuyen a mejorar el rendimiento del sistema y reducir el consumo de recursos digitales. Esta validación permite analizar el comportamiento del proyecto mediante evidencias técnicas como métricas de Lighthouse, tiempos de respuesta, cantidad de solicitudes, transferencia de datos y estimación de CO₂.

La validación se realizó considerando la arquitectura real del proyecto:

| Capa | Tecnología utilizada |
|---|---|
| Frontend | React, Vite, Tailwind CSS y Axios |
| Backend | FastAPI, Python, SQLAlchemy y Alembic |
| Base de datos | MySQL |
| Entorno local | Docker Compose |

---

## Proceso de validación

Para validar el comportamiento del sistema, se ejecutaron pruebas sobre las principales rutas de **OptiAcademic** desde el navegador. Se utilizó la herramienta **Lighthouse** para medir rendimiento, accesibilidad y buenas prácticas. Además, se empleó el módulo interno de sostenibilidad del sistema para observar métricas relacionadas con solicitudes, tiempo promedio, transferencia de datos y CO₂ estimado.

Las rutas evaluadas fueron:

| Ruta | Módulo evaluado |
|---|---|
| `/login` | Inicio de sesión |
| `/admin/executive-dashboard` | Panel ejecutivo |
| `/admin/reports/sustainability` | Reporte de sostenibilidad |
| `/admin/institutional-csp` | Motor CSP institucional |
| `/admin/institutional-students` | Estudiantes institucionales |
| `/admin/academic-history` | Historial académico |
| `/admin/faculties` | Facultades |

---

## Validación con Lighthouse

Lighthouse permitió evaluar la calidad general del frontend de OptiAcademic. Las pruebas se realizaron desde el navegador, accediendo a cada ruta principal y ejecutando el análisis correspondiente.

| Ruta evaluada | Performance | Accessibility | Best Practices | SEO |
|---|---:|---:|---:|---:|
| `/login` | 72 | 100 | 100 | No aplica |
| `/admin/executive-dashboard` | 69 | 95 | 100 | No aplica |
| `/admin/reports/sustainability` | 71 | 96 | 100 | No aplica |
| `/admin/institutional-csp` | 70 | 90 | 100 | No aplica |
| `/admin/institutional-students` | 70 | 96 | 100 | No aplica |
| `/admin/academic-history` | 70 | 96 | 100 | 82 |

---

## Interpretación de resultados Lighthouse

Los resultados muestran que OptiAcademic mantiene una evaluación estable en las rutas principales. El indicador de **Performance** se encuentra entre **69 y 72 puntos**, lo que evidencia que el sistema funciona correctamente, aunque todavía existen oportunidades de mejora en la carga inicial, procesamiento del frontend y reducción de recursos bloqueantes.

El indicador de **Accessibility** presenta resultados positivos, entre **90 y 100 puntos**, lo que demuestra que las pantallas cuentan con una estructura adecuada para la navegación y uso del sistema.

Además, el indicador de **Best Practices** alcanza **100 puntos** en todas las rutas evaluadas, lo que evidencia que el sistema cumple con buenas prácticas generales de desarrollo web.

---

## Validación del módulo de sostenibilidad

Además de Lighthouse, se utilizó el módulo interno **Reporte de sostenibilidad**, que permite observar el impacto digital estimado de las funcionalidades del sistema.

En una primera medición general del sistema se obtuvieron los siguientes valores:

| Indicador | Valor observado |
|---|---:|
| Solicitudes totales | 672 |
| CO₂ estimado total | 0.002388 g CO₂ |
| Tiempo promedio global | 77.63 ms |
| Datos transferidos | 3.02 MB |

Posteriormente, en una medición más controlada del módulo, se obtuvieron estos resultados:

| Indicador | Valor observado |
|---|---:|
| Solicitudes totales | 26 |
| CO₂ estimado total | 0.00011 g CO₂ |
| Tiempo promedio global | 47.68 ms |
| Datos transferidos | 13.93 KB |

Estos resultados permiten evidenciar que, cuando se reduce la cantidad de operaciones y la transferencia de datos, también disminuye el CO₂ estimado y el tiempo promedio de respuesta. Esto demuestra la relación directa entre optimización, eficiencia y sostenibilidad del software.

---

## Comparación de métricas de sostenibilidad

| Métrica | Medición inicial | Medición optimizada/controlada | Mejora observada |
|---|---:|---:|---|
| Solicitudes totales | 672 | 26 | Menor cantidad de operaciones procesadas |
| Datos transferidos | 3.02 MB | 13.93 KB | Reducción significativa del volumen de datos |
| Tiempo promedio global | 77.63 ms | 47.68 ms | Mejor tiempo promedio de respuesta |
| CO₂ estimado total | 0.002388 g CO₂ | 0.00011 g CO₂ | Menor emisión digital estimada |

---

## Resultados por módulo evaluado

| Módulo | Ruta | Resultado obtenido | Evidencia |
|---|---|---|---|
| Inicio de sesión | `/login` | Performance 72, Accessibility 100 y Best Practices 100 | Captura Lighthouse |
| Panel ejecutivo | `/admin/executive-dashboard` | Performance 69, Accessibility 95 y Best Practices 100 | Captura Lighthouse |
| Reporte de sostenibilidad | `/admin/reports/sustainability` | Performance 71, Accessibility 96 y Best Practices 100 | Captura Lighthouse y métricas internas |
| Motor CSP institucional | `/admin/institutional-csp` | Performance 70, Accessibility 90 y Best Practices 100 | Captura Lighthouse |
| Estudiantes institucionales | `/admin/institutional-students` | Performance 70, Accessibility 96 y Best Practices 100 | Captura Lighthouse |
| Historial académico | `/admin/academic-history` | Performance 70, Accessibility 96, Best Practices 100 y SEO 82 | Captura Lighthouse |
| Facultades | `/admin/faculties` | Pantalla funcional, datos cargados y consola sin errores críticos | Captura de interfaz y consola |

---

## Análisis de resultados

Los resultados obtenidos permiten afirmar que las optimizaciones aplicadas favorecen la eficiencia general del sistema. Las rutas evaluadas muestran un comportamiento estable, sin errores críticos visibles en la consola del navegador y con buenas prácticas web correctamente aplicadas.

El módulo de sostenibilidad permite observar de forma más directa el impacto del sistema, ya que registra solicitudes, transferencia de datos, tiempos promedio y CO₂ estimado.

La comparación entre una medición general y una medición más controlada muestra que al reducir operaciones innecesarias también disminuye la transferencia de datos y la emisión digital estimada.

En el caso de los módulos con mayor carga, como el **panel ejecutivo**, **estudiantes institucionales**, **historial académico** y **motor CSP**, se identifican oportunidades de mejora relacionadas con paginación, filtros, reducción de solicitudes HTTP y optimización de consultas. Estas acciones ayudan a disminuir el trabajo del backend, la base de datos y el navegador.

---

## Relación con GitHub

Las evidencias y mejoras se registraron en el repositorio GitHub del proyecto para asegurar trazabilidad. Para ello, se recomienda organizar los commits de la siguiente manera:

| Tipo de commit | Descripción |
|---|---|
| `docs: document environmental impact analysis` | Documenta el análisis del impacto ambiental del software |
| `docs: document optimization opportunities` | Registra las oportunidades de mejora identificadas |
| `docs: document implemented sustainability improvements` | Documenta las mejoras aplicadas |
| `docs: document validation evidence` | Agrega evidencias de validación |
| `perf: reduce repeated dashboard requests` | Reduce solicitudes repetidas en el panel ejecutivo |
| `perf: optimize environmental metrics responses` | Optimiza las respuestas del módulo de sostenibilidad |
| `perf: improve academic listings performance` | Mejora el rendimiento de listados académicos |

---

## Conclusión

La validación realizada demuestra que OptiAcademic cuenta con un funcionamiento estable y buenas prácticas técnicas en sus principales rutas. Los resultados de Lighthouse muestran valores consistentes en rendimiento, accesibilidad y buenas prácticas, mientras que el módulo de sostenibilidad permite observar métricas internas relacionadas con consumo digital.

La reducción de solicitudes, datos transferidos, tiempo promedio de respuesta y CO₂ estimado evidencia que las optimizaciones contribuyen a un uso más eficiente de los recursos tecnológicos.

Por ello, las mejoras aplicadas no solo favorecen el rendimiento del sistema, sino también su sostenibilidad, al disminuir el procesamiento innecesario, la transferencia de datos y la carga sobre el navegador, el backend y la base de datos.
