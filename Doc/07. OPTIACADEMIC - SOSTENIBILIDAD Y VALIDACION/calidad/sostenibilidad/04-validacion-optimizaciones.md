# Actividad 2.4: Validacion de optimizaciones

## Objetivo

Comprobar si las mejoras aplicadas realmente optimizaron el sistema y redujeron
el consumo de recursos. Esta validacion permite comparar el estado del proyecto
antes y despues de las optimizaciones usando evidencias tecnicas como tiempos
de carga, rendimiento de la interfaz, respuestas de la API y resultados de
herramientas de medicion.

El proyecto se valida segun su arquitectura real:

- **Frontend:** React, Vite, Tailwind CSS y Axios.
- **Backend:** FastAPI, Python, SQLAlchemy y Alembic.
- **Base de datos:** MySQL.
- **Entorno local:** Docker Compose.

## Proceso de validacion

### 1. Ejecutar pruebas antes de las optimizaciones

Antes de aplicar mejoras, se debe registrar una medicion inicial del sistema.
Esta medicion sirve como linea base para comparar los resultados posteriores.

Acciones:

- Levantar el sistema en el entorno local.
- Iniciar sesion con un usuario demo.
- Navegar por las pantallas principales.
- Registrar tiempos aproximados de carga.
- Revisar si existen errores en consola del navegador.
- Probar endpoints principales desde Swagger o desde la interfaz.
- Guardar capturas de pantalla de los resultados iniciales.

Evidencias sugeridas:

- Captura del login funcionando.
- Captura del dashboard principal.
- Captura de Lighthouse antes de optimizar.
- Captura de la consola del navegador sin errores criticos.
- Captura de Swagger o respuesta correcta de endpoints importantes.

### 2. Ejecutar pruebas despues de las optimizaciones

Luego de aplicar las mejoras, se repiten las mismas pruebas para verificar si
hubo cambios positivos en rendimiento, estabilidad y consumo de recursos.

Acciones:

- Reiniciar el frontend y backend si fue necesario.
- Volver a iniciar sesion con el mismo usuario.
- Navegar por las mismas pantallas evaluadas inicialmente.
- Medir nuevamente tiempos de carga.
- Revisar que no existan errores nuevos.
- Probar los endpoints afectados por las optimizaciones.
- Guardar capturas de pantalla posteriores.

Evidencias sugeridas:

- Captura del sistema despues de optimizar.
- Captura de Lighthouse despues de optimizar.
- Captura de endpoints respondiendo correctamente.
- Captura de pantallas con listados paginados o carga mas rapida.

### 3. Comparar tiempos de carga y rendimiento

La comparacion permite identificar si las mejoras tuvieron impacto real. Para
ello se deben revisar los tiempos antes y despues en pantallas importantes del
sistema.

Pantallas sugeridas para comparar:

- Login.
- Dashboard administrativo.
- Listado de usuarios.
- Listado de docentes.
- Listado de estudiantes.
- Modulo de cursos.
- Modulo de horarios.
- Dashboard o reporte de impacto ambiental y sostenibilidad.

Indicadores a observar:

- Tiempo de carga inicial del frontend.
- Tiempo de respuesta de endpoints FastAPI.
- Cantidad de solicitudes HTTP realizadas.
- Tamano de respuestas descargadas.
- Fluidez al navegar entre pantallas.
- Ausencia de errores en consola o backend.
- Lighthouse Performance.
- Lighthouse Accessibility.
- Lighthouse Best Practices.
- Cantidad de bloques generados cuando se evalua generacion institucional.
- Cantidad de ofertas elegibles cuando se evalua CSP.

### 4. Medir con Lighthouse

Lighthouse permite evaluar la calidad general de la aplicacion web desde el
navegador. Para esta actividad se usa como herramienta de validacion del
frontend React.

Aspectos a medir:

- **Rendimiento:** velocidad de carga, tiempo de interactividad y recursos
  bloqueantes.
- **Accesibilidad:** contraste, etiquetas, estructura semantica y navegacion.
- **Buenas practicas:** seguridad basica, errores del navegador y uso correcto
  de APIs web.
- **Optimizacion web:** peso de recursos, imagenes, JavaScript y experiencia de
  carga.

Procedimiento sugerido:

1. Abrir la aplicacion en `http://localhost:5173`.
2. Iniciar sesion si la pantalla evaluada requiere autenticacion.
3. Abrir DevTools del navegador.
4. Ir a la pestana Lighthouse.
5. Ejecutar el analisis en modo desktop o mobile.
6. Guardar captura del resultado.
7. Repetir el proceso despues de aplicar las optimizaciones.

### 5. Registrar capturas de pantalla

Las capturas funcionan como evidencia visual del proceso. Deben mostrar tanto
el estado inicial como el estado posterior a las mejoras.

Capturas recomendadas:

- Resultado Lighthouse antes de optimizar.
- Resultado Lighthouse despues de optimizar.
- Pantalla principal del sistema funcionando.
- Listados o modulos optimizados.
- Endpoint o Swagger mostrando respuestas correctas.
- Dashboard ambiental si se usa como evidencia de sostenibilidad.

Las capturas pueden almacenarse en una carpeta de evidencias del proyecto o
adjuntarse en el informe final de la actividad.

### 6. Registrar evidencias de mejora

Las evidencias deben demostrar que la optimizacion tuvo un efecto positivo.
Algunas mejoras esperadas son:

- Menor tiempo de carga inicial.
- Menor numero de solicitudes HTTP repetidas.
- Menor peso de recursos descargados.
- Respuestas de API mas rapidas.
- Menor cantidad de datos enviados desde FastAPI.
- Consultas MySQL mas controladas mediante filtros o paginacion.
- Mejor puntuacion en Lighthouse.
- Menor trabajo innecesario en el navegador.

## Plantilla de comparacion

| Pantalla | Antes | Despues | Mejora observada | Evidencia |
| --- | --- | --- | --- | --- |
| Login | Pendiente | Pendiente | Pendiente | Captura / Lighthouse |
| Dashboard administrativo | Pendiente | Pendiente | Pendiente | Captura / Network |
| Listado de usuarios | Pendiente | Pendiente | Paginacion visible | Captura / Network |
| Listado de docentes | Pendiente | Pendiente | Paginacion visible | Captura / Network |
| Listado de estudiantes | Pendiente | Pendiente | Paginacion visible | Captura / Network |
| Modulo de cursos | Pendiente | Pendiente | Pendiente de control visual completo | Captura / Network |
| Modulo de horarios | Pendiente | Pendiente | Pendiente de control visual completo | Captura / Network |
| Impacto ambiental / sostenibilidad | Pendiente | Pendiente | Nombres amigables y detalle tecnico | Captura / Lighthouse |

La siguiente plantilla puede completarse con los valores obtenidos durante la
validacion:

```text
Pantalla o modulo evaluado:
Medicion antes de optimizar:
Medicion despues de optimizar:
Mejora observada:
Evidencia adjunta:
Conclusion:
```

Ejemplo:

```text
Pantalla o modulo evaluado: Dashboard administrativo
Medicion antes de optimizar: carga inicial lenta y varias solicitudes repetidas
Medicion despues de optimizar: menor tiempo de carga y menos solicitudes
Mejora observada: navegacion mas fluida y menor trafico HTTP
Evidencia adjunta: captura Lighthouse antes/despues
Conclusion: la optimizacion redujo carga innecesaria en frontend y backend
```

## Relacion Con GitHub

Cada evidencia debe asociarse con commits claros:

```text
docs: document environmental impact analysis
docs: document optimization opportunities
docs: document implemented sustainability improvements
docs: document validation evidence plan
perf: add pagination to academic listings
perf: reduce repeated dashboard requests
perf: optimize environmental metrics responses
```

## Analisis de resultados

Despues de comparar las mediciones, se debe interpretar si las mejoras
realmente aportaron al rendimiento y a la eficiencia del sistema. No basta con
aplicar cambios; es necesario demostrar que el comportamiento mejoro.

Criterios de analisis:

- Si el tiempo de carga disminuyo, la optimizacion fue positiva.
- Si Lighthouse aumento su puntuacion, la calidad web mejoro.
- Si hay menos solicitudes HTTP, se redujo trafico entre React y FastAPI.
- Si las respuestas son mas pequenas, se redujo transferencia de datos.
- Si los listados usan paginacion, MySQL trabaja con menos registros por
  solicitud.
- Si no aparecen errores nuevos, la mejora no rompio funcionalidades.

## Resultado esperado

Al finalizar esta etapa se debe demostrar, mediante evidencias, que las
optimizaciones mejoraron el rendimiento y la eficiencia del proyecto. La
validacion debe mostrar que el sistema carga mas rapido, realiza menos trabajo
innecesario, consume menos recursos y mantiene su funcionamiento correcto.
