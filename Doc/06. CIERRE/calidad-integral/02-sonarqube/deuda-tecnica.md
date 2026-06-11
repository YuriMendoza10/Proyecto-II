# Deuda tecnica

El analisis inicial reporto 254 code smells y 2 bugs. Estos hallazgos deben revisarse en SonarQube para priorizar correcciones por severidad e impacto.

| Hallazgo | Archivo | Severidad | Accion aplicada | Estado |
|---|---|---|---|---|
| Comparaciones estrictas entre tipos distintos | `frontend/src/pages/admin/InstitutionalCSPPage.jsx` lineas cercanas a 204 y 208 | Alta | Normalizar valores opcionales con `String()` y `Number()` antes de construir el payload | Corregido, pendiente segunda ejecucion SonarQube |
| Code smells | Pendiente de detalle | Pendiente | Refactorizar solo si no rompe funcionalidad | Pendiente |
| Security hotspots no revisados | Pendiente de detalle | Pendiente | Revisar manualmente en SonarQube | Pendiente |
| Coverage 13.9 % integrada | Configuracion de coverage y alcance combinado | Media | Generar LCOV/XML y configurar Sonar sin excluir logica real | Preparado |

## Mitigacion de bugs

Los 2 bugs correspondian a comparaciones estrictas entre valores de distinto tipo. La correccion evita usar `==` y aplica normalizacion segura:

- `String(value).trim()` para detectar valores vacios.
- `Number(value)` para enviar campos numericos opcionales al payload CSP.
- `null` cuando el campo opcional queda vacio.

## Criterios de priorizacion

1. Vulnerabilidades o hotspots de seguridad.
2. Bugs en flujos de login, CSP, publicacion y reportes.
3. Code smells en servicios compartidos.
4. Duplicacion en componentes o endpoints.
5. Deuda tecnica que afecte mantenibilidad.

No aplicar refactors masivos antes de la entrega si pueden romper funcionalidad.
