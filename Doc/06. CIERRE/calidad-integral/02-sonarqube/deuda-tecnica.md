# Deuda tecnica

El analisis actual reporta 194 code smells, 0 bugs y 0 vulnerabilidades. Los hallazgos restantes deben revisarse en SonarQube para priorizar correcciones por severidad e impacto.

| Hallazgo | Archivo | Severidad | Accion aplicada | Estado |
|---|---|---|---|---|
| Comparaciones estrictas entre tipos distintos | `frontend/src/pages/admin/InstitutionalCSPPage.jsx` lineas cercanas a 204 y 208 | Alta | Normalizar valores opcionales con `String()` y `Number()` antes de construir el payload | Corregido y verificado por SonarQube: 0 bugs |
| Code smells restantes | Pendiente de detalle | Media | Refactorizar solo si no rompe funcionalidad | 194 pendientes |
| Security hotspots no revisados | Pendiente de detalle | Pendiente | Revisar manualmente en SonarQube | Pendiente |
| Coverage 17.5 % integrada | Configuracion de coverage y alcance combinado | Media | Mantener LCOV/XML y mejorar cobertura de modulos criticos | En seguimiento |

## Limpieza de bajo riesgo aplicada

- Se retiraron logs de depuracion en frontend.
- Se elimino la impresion en consola de un token de desarrollo.
- Se reforzo accesibilidad de botones de dias en CSP institucional con `aria-pressed`.
- Se ajusto `backend/.coveragerc` para usar rutas relativas sin excluir modulos reales de `app`.
- Se eliminaron imports no usados en componentes y paginas React.
- Se reemplazaron literales repetidos por constantes locales en modelos y servicios.
- Se reemplazaron keys basadas en indice por keys derivadas de datos estables cuando existia identificador suficiente.
- Se simplifico un nested ternary pequeno en `CspDiagnosticResult`.

## Smells pendientes por riesgo de refactor profundo

No se tocaron en esta pasada las funciones de mayor complejidad porque requieren pruebas especificas y refactor progresivo:

- `backend/app/services/demo_preparation_service.py`, complejidad alta.
- `backend/app/services/offering_csp_service.py`, complejidad alta.
- `backend/app/services/offering_service.py`, complejidad alta.
- `backend/app/api/v1/endpoints/schedule_blocks.py`, complejidad alta.
- `backend/app/services/schedule_quality_service.py`, funciones grandes.
- `backend/app/services/student_csp_service.py`, funciones grandes.
- `backend/app/services/csp_diagnostic_service.py`, complejidad alta.
- `frontend/src/pages/admin/InstitutionalCspGeneratorPage.jsx`, complejidad alta.
- `frontend/src/components/SelectorHorarioProfesional.jsx`, complejidad alta.

Estas piezas deben abordarse con pruebas focalizadas antes de dividir funciones o mover logica.

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
