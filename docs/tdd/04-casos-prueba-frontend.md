# 4. Casos de prueba frontend

## CP-FE-001: Renderizar login

| Campo | Descripción |
|---|---|
| Módulo | Login |
| Resultado esperado | Formulario visible con email y contraseña |

## CP-FE-002: Login como administrador

| Campo | Descripción |
|---|---|
| Módulo | Auth frontend |
| Entrada | Credenciales admin |
| Resultado esperado | Redirección al dashboard admin |

## CP-FE-003: Login como estudiante

| Campo | Descripción |
|---|---|
| Módulo | Auth frontend |
| Entrada | Credenciales estudiante |
| Resultado esperado | Redirección al dashboard estudiante |

## CP-FE-004: Vista oferta académica

| Campo | Descripción |
|---|---|
| Módulo | StudentOfferPage |
| Precondición | Horario publicado |
| Resultado esperado | Se muestran cursos y secciones disponibles |

## CP-FE-005: Selección de cursos

| Campo | Descripción |
|---|---|
| Módulo | Oferta estudiante |
| Acción | Seleccionar cursos |
| Resultado esperado | Cursos seleccionados quedan guardados temporalmente |

## CP-FE-006: Generar alternativas

| Campo | Descripción |
|---|---|
| Módulo | StudentScheduleGeneratorPage |
| Acción | Presionar generar |
| Resultado esperado | Se muestran alternativas de horario |

## CP-FE-007: Comparar horarios

| Campo | Descripción |
|---|---|
| Módulo | Comparador |
| Resultado esperado | Se visualizan score, créditos y recomendación |

## CP-FE-008: Guardar horario final

| Campo | Descripción |
|---|---|
| Módulo | Horario final |
| Acción | Elegir una solución |
| Resultado esperado | Horario guardado como final |

## CP-FE-009: Exportar PDF

| Campo | Descripción |
|---|---|
| Módulo | PDF |
| Acción | Presionar exportar PDF |
| Resultado esperado | Se genera archivo PDF del horario |
