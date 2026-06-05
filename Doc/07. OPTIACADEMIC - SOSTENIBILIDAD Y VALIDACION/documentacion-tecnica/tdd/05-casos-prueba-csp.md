# 5. Casos de prueba del motor CSP

## CP-CSP-001: Evitar cruce de docente

| Campo | Descripción |
|---|---|
| Objetivo | Validar que un docente no sea asignado a dos secciones al mismo tiempo |
| Entrada | Dos secciones con el mismo docente |
| Resultado esperado | Las secciones se asignan en horarios distintos |

## CP-CSP-002: Evitar cruce de aula

| Campo | Descripción |
|---|---|
| Objetivo | Validar que un aula no sea usada simultáneamente |
| Entrada | Dos secciones con dominio común de aula |
| Resultado esperado | Las secciones usan horarios o aulas diferentes |

## CP-CSP-003: Evitar cruce de sección

| Campo | Descripción |
|---|---|
| Objetivo | Validar que una sección no tenga dos bloques simultáneos |
| Entrada | Sección con varios bloques |
| Resultado esperado | Bloques en horarios diferentes |

## CP-CSP-004: Respetar disponibilidad docente

| Campo | Descripción |
|---|---|
| Objetivo | Validar que el docente solo sea asignado en horarios disponibles |
| Entrada | Docente con disponibilidad limitada |
| Resultado esperado | Bloques dentro de disponibilidad |

## CP-CSP-005: Generar al menos una solución

| Campo | Descripción |
|---|---|
| Objetivo | Validar generación con datos suficientes |
| Entrada | Cursos, secciones, docentes, aulas y disponibilidad |
| Resultado esperado | Al menos una solución generada |

## CP-CSP-006: Detectar sección sin dominio

| Campo | Descripción |
|---|---|
| Objetivo | Detectar secciones imposibles de programar |
| Entrada | Sección sin docente disponible |
| Resultado esperado | Diagnóstico con problema identificado |

## CP-CSP-007: Evitar cruces del estudiante

| Campo | Descripción |
|---|---|
| Objetivo | Validar horario personal sin clases simultáneas |
| Entrada | Cursos seleccionados con secciones publicadas |
| Resultado esperado | Alternativas sin cruces |

## CP-CSP-008: Respetar días no disponibles

| Campo | Descripción |
|---|---|
| Objetivo | Validar preferencias del estudiante |
| Entrada | Estudiante marca un día no disponible |
| Resultado esperado | Soluciones sin bloques en ese día |

## CP-CSP-009: Respetar rango de créditos

| Campo | Descripción |
|---|---|
| Objetivo | Validar carga académica |
| Entrada | Cursos seleccionados por estudiante |
| Resultado esperado | Solución entre 7 y 25 créditos o advertencia |

## CP-CSP-010: Recomendar mejor solución

| Campo | Descripción |
|---|---|
| Objetivo | Validar scoring |
| Entrada | Varias soluciones |
| Resultado esperado | Solución con mayor score marcada como recomendada |
