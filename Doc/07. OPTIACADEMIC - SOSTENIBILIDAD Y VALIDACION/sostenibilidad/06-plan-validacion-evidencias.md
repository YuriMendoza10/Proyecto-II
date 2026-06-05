# Plan de Validación y Evidencias

## Objetivo

Comparar el comportamiento de **OptiAcademic** antes y después de aplicar las optimizaciones, verificando que las mejoras implementadas aumenten la eficiencia del sistema sin afectar los flujos principales.

La validación debe ejecutarse bajo las mismas condiciones: mismo entorno local, mismos datos demo, mismo navegador y mismo rol de usuario. Esto permite que los resultados obtenidos sean comparables y que las evidencias tengan mayor validez técnica.

---

## Alcance del plan de validación

El plan de validación se enfoca en comprobar tres aspectos principales:

1. Que las pantallas principales sigan funcionando correctamente.
2. Que las optimizaciones reduzcan el consumo innecesario de recursos.
3. Que no se introduzcan errores nuevos en frontend, backend o base de datos.

La validación considera la arquitectura real de OptiAcademic:

| Capa | Tecnología |
|---|---|
| Frontend | React, Vite, Tailwind CSS y Axios |
| Backend | FastAPI, Python, SQLAlchemy y Alembic |
| Base de datos | MySQL |
| Entorno local | Docker Compose |

---

## 1. Medición antes de optimizar

Antes de aplicar las mejoras, se registra una línea base del comportamiento del sistema. Esta medición permite comparar posteriormente si las optimizaciones tuvieron un efecto positivo.

Los aspectos medidos antes de optimizar fueron:

| Indicador | Descripción |
|---|---|
| Tiempo de carga de pantalla | Tiempo aproximado que tarda una vista en mostrarse correctamente |
| Tiempo de respuesta API | Tiempo que tarda FastAPI en responder una solicitud |
| Cantidad de solicitudes HTTP | Número de peticiones realizadas desde el frontend al backend |
| Tamaño de respuestas | Volumen de datos transferidos entre backend y frontend |
| Errores de consola | Advertencias o errores visibles en DevTools |
| Lighthouse Performance | Puntaje de rendimiento obtenido con Lighthouse |
| Lighthouse Accessibility | Puntaje de accesibilidad obtenido con Lighthouse |
| Lighthouse Best Practices | Verificación de buenas prácticas web |
| Ofertas elegibles para CSP | Cantidad de ofertas disponibles para generación institucional |
| Bloques generados | Cantidad de bloques de horario creados por el motor CSP |
| Errores 400 o 500 | Validación de errores de cliente o servidor |

---

## 2. Medición después de optimizar

Después de aplicar las mejoras, se repiten las mismas pruebas bajo las mismas condiciones. Esto permite determinar si el sistema mejoró, se mantuvo estable o presentó regresiones.

En esta segunda medición se registra:

| Elemento | Descripción |
|---|---|
| Diferencia absoluta | Cambio numérico entre la medición antes y después |
| Diferencia porcentual | Porcentaje de mejora o reducción cuando corresponde |
| Funcionalidad validada | Confirmación de que la pantalla o flujo sigue funcionando |
| Evidencia adjunta | Captura, reporte Lighthouse, consola, Network o logs |
| Regresiones detectadas | Errores o comportamientos negativos posteriores a la optimización |
| Conclusión técnica | Interpretación final del resultado obtenido |

---

## 3. Pantallas y módulos evaluados

Las pruebas se aplicaron sobre las rutas y módulos principales del sistema:

| Módulo evaluado | Ruta o referencia |
|---|---|
| Login | `/login` |
| Dashboard administrativo | `/admin/executive-dashboard` |
| Reporte de sostenibilidad | `/admin/reports/sustainability` |
| Generación institucional CSP | `/admin/institutional-csp` |
| Estudiantes institucionales | `/admin/institutional-students` |
| Historial académico | `/admin/academic-history` |
| Facultades | `/admin/faculties` |
| Auditoría | Módulo de auditoría del sistema |
| Notificaciones | Módulo de notificaciones del usuario |

---

## 4. Indicadores de validación

| Indicador | Fuente sugerida | Criterio de evaluación |
|---|---|---|
| Tiempo de carga | Lighthouse o DevTools | Comparar antes y después de optimizar |
| Tiempo de respuesta API | Network, reporte ambiental o logs backend | Priorizar rutas con mayor tiempo de respuesta |
| Solicitudes HTTP | Network en DevTools | Detectar solicitudes repetidas o innecesarias |
| Tamaño de respuesta | Network o reporte de sostenibilidad | Reducir transferencia de datos innecesarios |
| Errores de consola | DevTools | No introducir errores nuevos |
| Lighthouse Performance | Lighthouse | Mejorar o mantener el rendimiento |
| Lighthouse Accessibility | Lighthouse y revisión visual | Mantener navegación, contraste, etiquetas y estructura |
| Lighthouse Best Practices | Lighthouse | Confirmar ausencia de advertencias críticas |
| Bloques generados | Resultado del motor CSP | Confirmar que la generación institucional sigue funcionando |
| Ofertas elegibles | Preview CSP | Validar ofertas en estado READY o APPROVED |
| Errores backend | Logs Docker | No introducir errores internos 500 |

---

## 5. Evidencias requeridas

Para sustentar la validación, se deben adjuntar evidencias técnicas y visuales. Estas evidencias permiten demostrar que las optimizaciones fueron verificadas correctamente.

| Evidencia | Propósito |
|---|---|
| Capturas antes y después | Comparar visualmente el estado del sistema |
| Reportes Lighthouse antes y después | Medir rendimiento, accesibilidad y buenas prácticas |
| Consola sin errores críticos | Confirmar estabilidad del frontend |
| Network en DevTools | Revisar solicitudes HTTP y tamaño de respuestas |
| Swagger o endpoints funcionando | Verificar respuestas correctas del backend |
| Build frontend exitoso | Confirmar que React/Vite compila sin errores |
| Logs backend sin errores 500 | Confirmar estabilidad de FastAPI |
| Resumen CSP | Validar ofertas elegibles y bloques generados |
| Registro del entorno | Documentar navegador, rol, fecha, datos demo y versión evaluada |

---

## 6. Comandos base de validación

Antes de cerrar cada ronda de validación, se ejecutan comandos para comprobar que el sistema compila y que los servicios funcionan correctamente.

```bash
npm --prefix frontend run build
