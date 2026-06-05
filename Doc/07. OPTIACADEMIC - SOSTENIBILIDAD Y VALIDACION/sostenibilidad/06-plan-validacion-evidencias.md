# Plan De Validacion Y Evidencias

## Objetivo

Comparar el comportamiento de `OptiAcademic` antes y despues de cada
optimizacion sin romper flujos existentes. La medicion debe repetirse sobre el
mismo entorno, datos demo y rol de usuario.

## 1. Medir Antes De Optimizar

- tiempo de carga de la pantalla;
- tiempo de respuesta API;
- cantidad de solicitudes HTTP;
- tamano de las respuestas;
- errores de consola;
- score Lighthouse;
- accesibilidad Lighthouse;
- ofertas elegibles para CSP;
- cantidad de bloques generados;
- errores `400` y `500` observados.

## 2. Medir Despues De Optimizar

Repetir exactamente las mismas mediciones y registrar:

- diferencia absoluta y porcentual cuando corresponda;
- funcionalidad validada;
- evidencia adjunta;
- regresiones detectadas;
- conclusion tecnica.

## 3. Pantallas Evaluadas

1. Login.
2. Dashboard administrativo.
3. Listado de usuarios.
4. Listado de docentes.
5. Listado de estudiantes.
6. Modulo de cursos.
7. Modulo de horarios.
8. Dashboard o reporte de impacto ambiental y sostenibilidad.
9. Generacion institucional.
10. Auditoria.
11. Notificaciones.

## 4. Indicadores

| Indicador | Fuente sugerida | Criterio |
| --- | --- | --- |
| Tiempo de carga | Lighthouse o DevTools | Comparar antes y despues. |
| Tiempo de respuesta API | Network, dashboard ambiental o logs | Priorizar rutas lentas. |
| Solicitudes HTTP | Network | Detectar duplicados. |
| Tamano de respuesta | Network o dashboard ambiental | Reducir bytes innecesarios. |
| Errores de consola | DevTools | No introducir errores nuevos. |
| Lighthouse Performance | Lighthouse | Registrar rendimiento antes y despues. |
| Lighthouse Accessibility | Lighthouse y revision manual | Mantener foco, labels y contraste. |
| Lighthouse Best Practices | Lighthouse | Confirmar que no aparecen advertencias nuevas. |
| Bloques generados | Resultado CSP | Confirmar capacidad del flujo. |
| Ofertas elegibles | Preview CSP | Validar `READY` y `APPROVED`. |
| Errores backend | Logs Docker | No introducir errores `500`. |

## 5. Evidencias

- capturas antes y despues;
- Lighthouse antes y despues;
- consola sin errores nuevos;
- Swagger o endpoints funcionando;
- build frontend exitoso;
- logs backend sin errores `500`;
- resumen CSP con ofertas elegibles y bloques generados;
- registro del entorno y datos demo utilizados.

## Comandos Base

```powershell
npm --prefix frontend run build
docker compose --env-file .env.docker.example config --quiet
docker compose --env-file .env.docker.example up --build -d
docker compose --env-file .env.docker.example logs --tail 200 backend
```

## Plantilla Comparativa

| Modulo | Antes | Despues | Mejora observada | Evidencia |
| --- | --- | --- | --- | --- |
| Login | Pendiente | Pendiente | Pendiente | Captura / Lighthouse |
| Dashboard administrativo | Pendiente | Pendiente | Pendiente | Captura / Network |
| Listado de usuarios | Pendiente | Pendiente | Paginacion visible | Captura / Network |
| Listado de docentes | Pendiente | Pendiente | Paginacion visible | Captura / Network |
| Listado de estudiantes | Pendiente | Pendiente | Paginacion visible | Captura / Network |
| Modulo de cursos | Pendiente | Pendiente | Pendiente de control visual completo | Captura / Network |
| Modulo de horarios | Pendiente | Pendiente | Pendiente de control visual completo | Captura / Network |
| Impacto ambiental / sostenibilidad | Pendiente | Pendiente | Nombres amigables y detalle tecnico | Dashboard ambiental / Lighthouse |
| Generacion institucional | Pendiente | Pendiente | Pendiente | Preview, bloques y logs |
| Auditoria | Pendiente | Pendiente | Pendiente | Captura / Network |
| Notificaciones | Pendiente | Pendiente | Pendiente | Captura / Network |

## Cierre De Cada Ronda

1. Guardar evidencias.
2. Documentar resultados.
3. Ejecutar build.
4. Revisar logs backend.
5. Confirmar que login, generacion, reportes, auditoria y notificaciones siguen
   funcionando.
6. Separar propuestas futuras de mejoras efectivamente implementadas.

La ejecucion detallada y la plantilla por pantalla estan disponibles en
[Validacion Lighthouse](07-validacion-lighthouse.md).
