# 9. Restricciones del motor CSP

## 9.1 Descripción

El motor CSP de OptiAcademic se encarga de generar horarios válidos respetando restricciones académicas, docentes, aulas y preferencias del estudiante.

## 9.2 CSP institucional

El CSP institucional genera la oferta horaria oficial.

### Variables

Cada variable representa un bloque o asignación que debe ser programada.

```text
Variable = Sección + bloque requerido
```

### Dominio

Cada dominio contiene combinaciones posibles:

```text
Día + hora + aula + docente
```

### Restricciones duras

Las restricciones duras no pueden romperse.

| Código | Restricción |
|---|---|
| CSP-I-001 | Un docente no puede tener dos clases al mismo tiempo. |
| CSP-I-002 | Un aula no puede tener dos clases al mismo tiempo. |
| CSP-I-003 | Una sección no puede tener dos clases al mismo tiempo. |
| CSP-I-004 | El bloque debe estar dentro del rango horario permitido. |
| CSP-I-005 | El docente debe estar disponible en el horario asignado. |
| CSP-I-006 | La sección debe tener bloques suficientes según sus horas semanales. |
| CSP-I-007 | El aula debe existir y estar disponible. |

### Restricciones blandas

Las restricciones blandas ayudan a mejorar la calidad de la solución.

| Código | Restricción |
|---|---|
| CSP-I-008 | Evitar concentración excesiva de bloques a las 07:00. |
| CSP-I-009 | Preferir horarios intermedios. |
| CSP-I-010 | Distribuir bloques entre diferentes días. |
| CSP-I-011 | Evitar sobrecargar un mismo día. |
| CSP-I-012 | Penalizar horarios muy nocturnos cuando sea posible. |

## 9.3 CSP estudiantil

El CSP estudiantil genera horarios personales para el estudiante desde la oferta publicada.

### Variables

Cada variable representa un curso seleccionado por el estudiante.

```text
Variable = Curso seleccionado
```

### Dominio

El dominio se compone de secciones o bloques disponibles en la oferta publicada.

```text
Dominio = Secciones publicadas del curso
```

### Restricciones duras

| Código | Restricción |
|---|---|
| CSP-E-001 | El estudiante no puede tener dos clases al mismo tiempo. |
| CSP-E-002 | El estudiante solo puede elegir cursos de la oferta publicada. |
| CSP-E-003 | El sistema debe respetar días no disponibles del estudiante. |
| CSP-E-004 | El total de créditos debe estar dentro del rango permitido cuando se exige validación estricta. |
| CSP-E-005 | El horario personal debe derivarse de bloques institucionales existentes. |

### Restricciones blandas

| Código | Restricción |
|---|---|
| CSP-E-006 | Preferir docentes seleccionados por el estudiante. |
| CSP-E-007 | Penalizar docentes evitados por el estudiante. |
| CSP-E-008 | Acercarse al objetivo de créditos. |
| CSP-E-009 | Reducir huecos entre clases. |
| CSP-E-010 | Reducir cantidad de días ocupados si el estudiante lo prefiere. |
| CSP-E-011 | Mejorar el score general de la solución. |

## 9.4 Rango horario

```text
Inicio: 07:00
Fin:    22:00
Días:   Lunes a domingo
```

## 9.5 Créditos del estudiante

```text
Mínimo: 7 créditos
Máximo: 25 créditos
```

## 9.6 Scoring

El scoring permite ordenar las soluciones de mejor a peor.

Criterios del scoring:

- Créditos obtenidos.
- Cercanía al objetivo.
- Docentes preferidos.
- Docentes evitados.
- Distribución semanal.
- Huecos entre clases.
- Penalización de horarios extremos.
- Cantidad de conflictos evitados.

## 9.7 Resultado esperado

El motor debe devolver:

- Lista de soluciones.
- Score de cada solución.
- Bloques incluidos.
- Cursos incluidos.
- Créditos totales.
- Explicación o resumen de calidad.
- Recomendación de la mejor solución.
