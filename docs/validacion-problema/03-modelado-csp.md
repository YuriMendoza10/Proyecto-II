# 3. Modelado CSP del problema

## 3.1 Enfoque formal

El problema de generación de horarios académicos se modela como un **Problema de Satisfacción de Restricciones (CSP)**.

Un CSP se define por:

```text
CSP = (X, D, C)
```

Donde:

- `X` es el conjunto de variables.
- `D` es el conjunto de dominios.
- `C` es el conjunto de restricciones.

## 3.2 Variables del CSP institucional

En el caso institucional, las variables representan secciones o bloques académicos que deben ser programados.

Ejemplo:

```text
X1 = Sección SIS101-A, bloque 1
X2 = Sección SIS101-A, bloque 2
X3 = Sección SIS204-B, bloque 1
```

Cada variable necesita recibir una asignación válida.

## 3.3 Dominios del CSP institucional

El dominio de cada variable está formado por combinaciones posibles:

```text
D = Día + Hora + Aula + Docente
```

Ejemplo:

```text
Lunes, 08:40, Aula 301, Docente 15
Martes, 10:20, Laboratorio 2, Docente 15
```

## 3.4 Restricciones del CSP institucional

### Restricciones duras

Las restricciones duras deben cumplirse obligatoriamente.

| Código | Restricción |
|---|---|
| C1 | Un docente no puede tener dos clases al mismo tiempo |
| C2 | Un aula no puede tener dos clases al mismo tiempo |
| C3 | Una sección no puede tener dos bloques simultáneos |
| C4 | El docente debe estar disponible |
| C5 | La hora debe estar dentro del rango académico |
| C6 | El aula debe existir y estar habilitada |

### Restricciones blandas

Las restricciones blandas mejoran la calidad de la solución.

| Código | Restricción |
|---|---|
| B1 | Evitar horarios extremos |
| B2 | Distribuir bloques entre varios días |
| B3 | Evitar concentración excesiva a las 07:00 |
| B4 | Favorecer horarios intermedios |
| B5 | Balancear carga semanal |

## 3.5 CSP estudiantil

El CSP estudiantil se aplica después de publicar el horario institucional.

### Variables

Las variables representan cursos seleccionados por el estudiante.

```text
X1 = Curso seleccionado 1
X2 = Curso seleccionado 2
X3 = Curso seleccionado 3
```

### Dominios

Los dominios son secciones publicadas disponibles para cada curso.

```text
D = Secciones publicadas del curso
```

### Restricciones estudiantiles

| Código | Restricción |
|---|---|
| E1 | No debe existir cruce entre clases del estudiante |
| E2 | Solo se deben usar bloques de la oferta publicada |
| E3 | Se deben respetar días no disponibles |
| E4 | Se debe considerar el rango de créditos 7 a 25 |
| E5 | Se deben considerar preferencias de docentes |

## 3.6 Criterios de evaluación

Las soluciones se evalúan mediante un score.

Criterios considerados:

- Ausencia de conflictos.
- Cantidad de créditos.
- Cercanía al objetivo de créditos.
- Distribución de bloques.
- Preferencia docente.
- Penalización de docentes evitados.
- Penalización de horarios extremos.
- Balance semanal.

## 3.7 Impacto de las restricciones en el comportamiento del sistema

Las restricciones reducen el espacio de búsqueda y determinan qué soluciones son válidas.

Ejemplo:

- Si un docente no está disponible en la mañana, se eliminan todas las combinaciones de mañana para ese docente.
- Si un aula ya está ocupada a una hora, no se puede usar para otra sección.
- Si el estudiante marca el sábado como no disponible, se eliminan los bloques de sábado de sus soluciones.

## 3.8 Conclusión técnica

El modelo CSP es adecuado porque permite representar formalmente un problema altamente combinatorio, validar restricciones y generar soluciones que pueden ser evaluadas por calidad.
