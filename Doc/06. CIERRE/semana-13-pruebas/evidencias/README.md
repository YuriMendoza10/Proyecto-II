# Evidencias de ejecución de pruebas - Semana 13

Este documento presenta las evidencias obtenidas durante la ejecución de pruebas del proyecto **OptiAcademic** para la Semana 13.

La validación realizada comprende:

- Pruebas unitarias del frontend.
- Pruebas unitarias e integración del backend.
- Pruebas end to end, e2e.
- Validación de compilación del frontend.
- Interpretación de resultados obtenidos.
- Observaciones y pendientes detectados.

---

## 1. Objetivo de la evidencia

El objetivo de esta evidencia es demostrar que el sistema **OptiAcademic** cuenta con una base funcional de pruebas automatizadas que permite verificar el correcto comportamiento de componentes, utilidades, endpoints y flujos principales de la aplicación.

Estas pruebas ayudan a reducir riesgos antes de continuar con nuevas funcionalidades, ya que permiten detectar errores en etapas tempranas del desarrollo.

---

## 2. Tipos de pruebas ejecutadas

Durante la Semana 13 se ejecutaron los siguientes tipos de pruebas:

| Tipo de prueba | Herramienta | Propósito |
|---|---|---|
| Build de frontend | Vite | Verificar que el frontend compile correctamente para producción |
| Pruebas unitarias frontend | Vitest | Validar componentes y utilidades del frontend |
| Pruebas backend | Pytest | Validar schemas, lógica CSP, sostenibilidad e integración API |
| Pruebas e2e | Playwright | Simular flujos reales desde el navegador |

---

## 3. Evidencia 1: Build del frontend

### Comando ejecutado

```powershell
npm --prefix frontend run build
```

### Resultado obtenido

```txt
✓ built in 1.02s
```

### Descripción

Esta validación verifica que el frontend desarrollado con **React + Vite** puede compilarse correctamente para un entorno de producción.

El proceso de build revisa que los archivos del frontend puedan transformarse, empaquetarse y optimizarse sin errores críticos.

Durante esta ejecución se generaron archivos dentro de la carpeta `dist/`, incluyendo archivos JavaScript, CSS y assets optimizados.

### ¿Por qué sale así?

El resultado muestra una lista de archivos generados, su tamaño original y su tamaño comprimido con gzip. Esto ocurre porque Vite genera los paquetes finales del frontend y muestra cuánto ocuparán aproximadamente en producción.

Ejemplo:

```txt
dist/assets/react-B6wKNi_J.js  262.18 kB │ gzip: 85.02 kB
dist/assets/pdf-C4sOwt0F.js    935.93 kB │ gzip: 265.64 kB
```

Esto indica que el sistema fue empaquetado correctamente y que los archivos pueden ser servidos en un entorno productivo.

### Interpretación

El build exitoso indica que:

- No existen errores críticos de sintaxis.
- No existen importaciones rotas.
- No hay componentes mal referenciados.
- La configuración de Vite funciona correctamente.
- El frontend puede desplegarse como versión de producción.

### Estado

**Aprobado.**

---

## 4. Evidencia 2: Pruebas unitarias del frontend

### Comando ejecutado

```powershell
npm --prefix frontend run test
```

### Resultado obtenido

```txt
Test Files  7 passed (7)
Tests       24 passed (24)
```

### Descripción

Esta prueba ejecuta la suite de pruebas unitarias del frontend mediante **Vitest**.

Las pruebas unitarias permiten validar componentes, funciones auxiliares y comportamientos específicos sin necesidad de ejecutar todo el sistema completo.

### Archivos de prueba ejecutados

```txt
src/tests/endpointLabels.test.js
src/tests/formatters.test.js
src/tests/Dashboard.test.jsx
src/tests/MatriculaPanel.test.jsx
src/tests/Login.test.jsx
src/tests/ThemeToggle.test.jsx
src/tests/PaginationControls.test.jsx
```

### Componentes y utilidades evaluadas

Se validaron los siguientes elementos:

- `endpointLabels`
- `formatters`
- `Dashboard`
- `MatriculaPanel`
- `Login`
- `ThemeToggle`
- `PaginationControls`

### ¿Qué valida cada grupo de pruebas?

#### `endpointLabels.test.js`

Valida que las rutas técnicas del sistema se muestren con nombres amigables para el usuario.

Por ejemplo:

```txt
/api/v1/notifications/me → Notificaciones del usuario
/api/v1/data-readiness/report → Reporte de preparación de datos
/api/v1/reports/sustainability → Reporte de sostenibilidad
```

Esto ayuda a que los reportes y vistas administrativas sean más comprensibles.

#### `formatters.test.js`

Valida funciones de formato usadas en la interfaz.

Se verifican formatos como:

- Porcentajes.
- CO₂ estimado.
- Milisegundos.
- Bytes o kilobytes.
- Valores nulos o indefinidos.

Esto evita que la interfaz muestre valores técnicos mal formateados o errores visuales.

#### `Login.test.jsx`

Valida que la pantalla de inicio de sesión se renderice correctamente.

Se comprueba que existan elementos básicos como:

- Campo de usuario o correo.
- Campo de contraseña.
- Botón de inicio de sesión.

#### `Dashboard.test.jsx`

Valida que el dashboard pueda renderizar elementos principales sin fallar.

Esto ayuda a detectar errores visuales o de renderizado en una de las pantallas principales del sistema.

#### `MatriculaPanel.test.jsx`

Valida que el panel relacionado con matrícula se muestre correctamente y soporte casos básicos.

Esto es importante porque OptiAcademic contempla flujos académicos relacionados con estudiantes, matrícula y horarios.

#### `ThemeToggle.test.jsx`

Valida el funcionamiento del cambio de tema claro/oscuro.

Se comprueba que el componente pueda cambiar de estado y mantener una experiencia visual estable.

#### `PaginationControls.test.jsx`

Valida el componente de paginación.

Se revisa que:

- Muestre la página actual.
- Permita avanzar.
- Permita retroceder.
- Deshabilite botones cuando corresponde.

Esto es importante porque la paginación ayuda a reducir carga de datos y mejora el rendimiento.

### ¿Por qué sale `24 passed`?

El resultado `24 passed` significa que las 24 pruebas unitarias definidas se ejecutaron correctamente sin fallos.

### Interpretación

El resultado confirma que los componentes y utilidades principales del frontend funcionan correctamente en los casos evaluados.

### Estado

**Aprobado.**

---

## 5. Evidencia 3: Pruebas end to end, e2e

### Comando ejecutado

```powershell
npm --prefix frontend run e2e
```

### Resultado obtenido

```txt
4 passed
2 skipped
```

### Descripción

Esta prueba ejecuta casos **end to end** mediante **Playwright**.

Las pruebas e2e simulan el comportamiento de un usuario real desde el navegador. A diferencia de las pruebas unitarias, estas pruebas validan flujos completos de interacción.

### Casos ejecutados

```txt
E2E-01 login carga correctamente
E2E-02 login inválido no permite acceso
E2E-03 modo claro oscuro se puede cambiar en login
E2E-05 login no muestra pantalla blanca
E2E-04 reporte de sostenibilidad carga con sesión válida
E2E-06 rutas administrativas cargan con sesión válida
```

### Pruebas aprobadas

Las siguientes pruebas pasaron correctamente:

```txt
E2E-01 login carga correctamente
E2E-02 login inválido no permite acceso
E2E-03 modo claro oscuro se puede cambiar en login
E2E-05 login no muestra pantalla blanca
```

Estas pruebas validan que:

- La pantalla `/login` carga correctamente.
- El sistema no permite ingresar con credenciales inválidas.
- El modo claro/oscuro puede cambiarse desde la interfaz.
- La pantalla de login no queda en blanco ni presenta errores críticos visibles.

### Pruebas omitidas

Las siguientes pruebas quedaron omitidas:

```txt
E2E-04 reporte de sostenibilidad carga con sesión válida
E2E-06 rutas administrativas cargan con sesión válida
```

### ¿Por qué salen como `skipped`?

Estas pruebas requieren una sesión administrativa válida. Para ejecutarlas se necesitan credenciales demo configuradas mediante variables de entorno:

```txt
E2E_ADMIN_EMAIL
E2E_ADMIN_PASSWORD
```

No se colocaron credenciales reales dentro del código por seguridad. Por esa razón, Playwright omite esas pruebas de forma controlada.

### Interpretación

El resultado `4 passed, 2 skipped` no indica un error. Significa que las pruebas públicas se ejecutaron correctamente y que las pruebas autenticadas quedaron preparadas para ejecutarse cuando existan credenciales demo seguras.

### Estado

**Aprobado con observación.**

---

## 6. Evidencia 4: Pruebas del backend

### Comando ejecutado

```powershell
cd backend
py -m pytest -v
```

### Resultado obtenido

```txt
23 passed
5 skipped
```

### Descripción

Esta prueba ejecuta la suite de pruebas del backend mediante **Pytest**.

Las pruebas del backend validan comportamiento de lógica interna, schemas, motor CSP y endpoints principales de integración.

### Pruebas backend ejecutadas

Entre las pruebas ejecutadas se encuentran:

```txt
tests/test_csp.py
tests/test_csp_engine.py
tests/test_semana13_integration_api.py
tests/test_semana13_schemas.py
tests/test_semana13_sustainability_logic.py
```

### Módulos evaluados

Se evaluaron los siguientes módulos o comportamientos:

- Motor CSP básico.
- Asignación de cursos.
- Conflictos de docente.
- Conflictos de aula.
- Capacidad de aula.
- Rendimiento escalable básico.
- Schemas de estudiantes.
- Schemas de historial académico.
- Cálculo de CO₂.
- Detección de solapamiento de bloques.
- Generación de bloques horarios.
- Endpoint `/docs`.
- Endpoint raíz `/`.
- Login inválido.
- Rutas protegidas sin token.
- Endpoints críticos sin error 500.

---

## 7. Detalle de pruebas backend aprobadas

### Motor CSP

Se ejecutaron pruebas relacionadas con el motor de generación de horarios.

Casos validados:

```txt
test_asignacion_exitosa
test_conflicto_docente
test_aula_insuficiente
test_conflicto_aula
test_rendimiento_escalable
test_asignacion_curso_unico
test_sin_cursos
```

Estas pruebas validan que el motor CSP pueda generar asignaciones y detectar conflictos básicos.

### Integración API

Se ejecutaron pruebas de integración sobre endpoints principales.

Casos validados:

```txt
test_docs_endpoint_responds_200
test_root_endpoint_responds_without_database
test_invalid_login_returns_controlled_error
test_protected_route_without_token_is_blocked
test_environmental_summary_without_token_does_not_return_500
test_student_academic_history_page_without_token_does_not_return_500
```

Estas pruebas verifican que los endpoints respondan de forma controlada y que no generen errores internos tipo 500 en casos críticos.

### Schemas

Se validaron schemas relacionados con estudiantes e historial académico.

Casos validados:

```txt
test_student_schema_accepts_valid_institutional_data
test_student_schema_rejects_invalid_credit_range
test_academic_history_schema_accepts_approved_record
test_academic_history_schema_rejects_grade_outside_scale
```

Estas pruebas verifican que los datos académicos sean aceptados o rechazados correctamente según sus reglas.

### Sostenibilidad y lógica auxiliar

Se validaron funciones relacionadas con cálculo de CO₂ y bloques CSP.

Casos validados:

```txt
test_calculate_co2_returns_zero_for_empty_response
test_calculate_co2_uses_positive_bytes
test_calculate_co2_ignores_negative_bytes
test_csp_overlap_detects_conflicting_time_blocks
test_csp_overlap_allows_adjacent_time_blocks
test_csp_generates_expected_time_slots
```

Estas pruebas permiten validar parte de la lógica de sostenibilidad y detección de conflictos horarios.

---

## 8. Pruebas omitidas del backend

### Resultado

```txt
5 skipped
```

### Explicación

Las 5 pruebas omitidas corresponden a pruebas legacy, es decir, pruebas creadas para una estructura anterior del backend.

Estas pruebas apuntaban a rutas o archivos antiguos y fueron omitidas de forma justificada para evitar que afecten la suite actual.

### Interpretación

El resultado `skipped` no representa un fallo funcional. Significa que esas pruebas no se ejecutan porque ya no corresponden directamente a la arquitectura actual del proyecto.

### Estado

**Aprobado con observación.**

---

## 9. Cobertura de pruebas backend

### Resultado obtenido

```txt
Coverage: 32 %
```

### Descripción

El reporte de cobertura indica qué porcentaje del código backend fue ejecutado durante las pruebas.

En esta ejecución se obtuvo una cobertura inicial aproximada del 32 %.

### Interpretación

Una cobertura del 32 % representa una base inicial de pruebas funcional. No significa que todo el sistema esté completamente probado, sino que ya existe una primera capa de validación sobre módulos importantes.

### Mejora futura

Se recomienda ampliar la cobertura progresivamente en futuras iteraciones, especialmente en:

- Servicios académicos.
- Repositorios.
- Motor CSP institucional completo.
- Reportes.
- Autenticación avanzada.
- Gestión de usuarios.
- Historial académico.
- Flujo completo de matrícula.

### Estado

**Base inicial aceptable para Semana 13.**

---

## 10. Advertencias no bloqueantes

Durante la ejecución de pruebas backend se observaron algunas advertencias.

### Advertencia de pytest-asyncio

```txt
PytestDeprecationWarning: The configuration option "asyncio_default_fixture_loop_scope" is unset.
```

### Explicación

Esta advertencia indica que en futuras versiones de `pytest-asyncio` será recomendable definir explícitamente el alcance del event loop para fixtures asíncronas.

Actualmente no afecta la ejecución de las pruebas.

### Advertencia de Pydantic

```txt
PydanticDeprecatedSince20: Support for class-based config is deprecated.
```

### Explicación

Esta advertencia indica que algunas configuraciones tipo `class Config` serán removidas en versiones futuras de Pydantic.

Actualmente no afecta el funcionamiento del backend, pero se recomienda migrar progresivamente a `ConfigDict`.

### Estado

**Advertencias no bloqueantes.**

---

## 11. Resumen general de resultados

| Validación | Comando | Resultado | Estado |
|---|---|---|---|
| Build frontend | `npm --prefix frontend run build` | Compilación exitosa | Aprobado |
| Pruebas unitarias frontend | `npm --prefix frontend run test` | 24 passed | Aprobado |
| Pruebas e2e | `npm --prefix frontend run e2e` | 4 passed, 2 skipped | Aprobado con observación |
| Pruebas backend | `py -m pytest -v` | 23 passed, 5 skipped | Aprobado con observación |
| Cobertura backend | `py -m pytest -v` | 32 % | Base inicial |

---

## 12. Relación con Semana 13

La Semana 13 solicita trabajar pruebas unitarias, de integración y e2e.

La evidencia presentada cumple con esos tres tipos de pruebas:

### Pruebas unitarias

Se evidencian en:

```txt
npm --prefix frontend run test
py -m pytest -v
```

Estas pruebas validan componentes, utilidades, schemas y funciones específicas del sistema.

### Pruebas de integración

Se evidencian en:

```txt
tests/test_semana13_integration_api.py
```

Estas pruebas validan la respuesta de endpoints del backend, incluyendo `/docs`, login inválido y rutas protegidas.

### Pruebas e2e

Se evidencian en:

```txt
npm --prefix frontend run e2e
```

Estas pruebas simulan acciones reales del usuario desde un navegador mediante Playwright.

---

## 13. Importancia de las pruebas realizadas

Las pruebas implementadas aportan al proyecto porque:

- Permiten detectar errores antes de la entrega.
- Validan que los componentes principales se rendericen correctamente.
- Verifican que el backend responda sin errores internos críticos.
- Comprueban flujos visibles desde el navegador.
- Reducen riesgos al continuar desarrollando nuevas funcionalidades.
- Ayudan a mantener estabilidad en login, dashboard, reportes, sostenibilidad y CSP.
- Permiten sustentar académicamente la calidad del sistema.

---

## 14. Limitaciones encontradas

Durante la validación se identificaron algunas limitaciones:

1. Las pruebas e2e autenticadas requieren credenciales demo configuradas mediante variables de entorno.
2. Existen pruebas legacy omitidas porque pertenecen a una versión anterior del backend.
3. La cobertura backend es inicial y debe ampliarse en futuras iteraciones.
4. Existen advertencias de compatibilidad futura relacionadas con `pytest-asyncio` y Pydantic.
5. El lint global del frontend presenta deuda previa en archivos antiguos, aunque las pruebas nuevas funcionan correctamente.

---

## 15. Recomendaciones futuras

Se recomienda continuar fortaleciendo la suite de pruebas con las siguientes acciones:

- Crear credenciales demo seguras para ejecutar e2e autenticados.
- Aumentar la cobertura del backend sobre servicios y repositorios.
- Agregar pruebas sobre el flujo completo de matrícula.
- Agregar pruebas sobre generación institucional CSP completa.
- Corregir progresivamente la deuda del lint global.
- Migrar configuraciones antiguas de Pydantic hacia `ConfigDict`.
- Configurar explícitamente `asyncio_default_fixture_loop_scope`.
- Integrar pruebas en un flujo CI/CD de GitHub Actions.

---

## 16. Conclusión final

Los resultados obtenidos demuestran que OptiAcademic cuenta con una base funcional de pruebas automatizadas para la Semana 13.

Resultados finales:

```txt
Frontend build: exitoso
Frontend unit tests: 24 pruebas pasaron
Backend tests: 23 pruebas pasaron, 5 omitidas justificadas
E2E: 4 pruebas pasaron, 2 omitidas por credenciales
Coverage backend: 32 %
```

Estas evidencias permiten sustentar que el sistema mantiene un comportamiento estable después de la implementación de pruebas unitarias, pruebas de integración y pruebas end to end.

La base implementada no busca cubrir la totalidad del sistema, sino establecer una primera capa de aseguramiento de calidad que pueda ampliarse progresivamente en futuras iteraciones del proyecto.