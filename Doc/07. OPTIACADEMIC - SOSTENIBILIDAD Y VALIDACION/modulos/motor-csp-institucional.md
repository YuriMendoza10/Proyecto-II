# 7. Motor CSP institucional

## Concepto

CSP significa **Constraint Satisfaction Problem**. En OptiAcademic se usa para asignar horarios respetando restricciones.

## Variables

Cada variable representa un bloque de una sección que debe programarse.

## Dominios

Cada dominio contiene combinaciones posibles de:

```text
Día + hora + aula + docente
```

## Restricciones

El motor evita:

- Cruce de aula.
- Cruce de docente.
- Cruce de sección.
- Horarios fuera de disponibilidad.
- Bloques fuera del rango 07:00 a 22:00.
- Duplicidad de bloques no permitida.

## Estrategias

| Estrategia | Uso |
|---|---|
| MRV | Prioriza variables con menos opciones |
| Backtracking | Búsqueda de solución |
| Scoring | Evalúa calidad |
| Distribución horaria | Evita saturar una sola hora |
| Diversidad | Permite soluciones alternativas |

## Orden horario preferido

```text
10:20
15:40
08:40
17:20
12:00
14:00
19:00
07:00
20:40
```

## Endpoints

```text
POST /api/v1/csp-diagnostics/institutional/domains
POST /api/v1/institutional-csp/preview
POST /api/v1/institutional-csp/generate
POST /api/v1/institutional-csp/generate-selected
```
