# Cálculo y normalización del puntaje SUS

## Regla matemática

Sea \(R_i\) la respuesta bruta del participante al reactivo \(i\):

- Para reactivos impares: contribución \(C_i = R_i - 1\).
- Para reactivos pares: contribución \(C_i = 5 - R_i\).
- Cada contribución queda en el intervalo de 0 a 4.
- La suma de contribuciones se multiplica por el factor fijo 2.5 para obtener un puntaje de 0 a 100.

## Ecuación formal


$$\text{SUS}(u) = 2.5 \left[ \sum_{i \in \{1,3,5,7,9\}} (R_{u,i} - 1) + \sum_{i \in \{2,4,6,8,10\}} (5 - R_{u,i}) \right]$$

## Matriz de contribuciones normalizadas

| Usuario | C1 | C2 | C3 | C4 | C5 | C6 | C7 | C8 | C9 | C10 | Suma | Puntaje SUS |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| U1 | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 4 | 3 | 31 | 77.5 |
| U2 | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 30 | 75.0 |
| U3 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 40 | 100.0 |
| U4 | 3 | 2 | 4 | 3 | 3 | 3 | 3 | 3 | 4 | 3 | 31 | 77.5 |
| U5 | 4 | 4 | 4 | 3 | 4 | 4 | 4 | 4 | 4 | 4 | 39 | 97.5 |
| U6 | 3 | 3 | 4 | 2 | 3 | 3 | 3 | 3 | 4 | 3 | 31 | 77.5 |
| U7 | 3 | 3 | 3 | 2 | 3 | 3 | 3 | 3 | 3 | 3 | 29 | 72.5 |
| U8 | 3 | 3 | 4 | 3 | 3 | 3 | 3 | 3 | 4 | 3 | 32 | 80.0 |

## Verificación por participante

| Usuario | Operación | Resultado |
|---|---|---:|
| U1 | \(31 \times 2.5\) | 77.5 |
| U2 | \(30 \times 2.5\) | 75.0 |
| U3 | \(40 \times 2.5\) | 100.0 |
| U4 | \(31 \times 2.5\) | 77.5 |
| U5 | \(39 \times 2.5\) | 97.5 |
| U6 | \(31 \times 2.5\) | 77.5 |
| U7 | \(29 \times 2.5\) | 72.5 |
| U8 | \(32 \times 2.5\) | 80.0 |

## Media aritmética

La suma de los puntajes individuales es:

$$
77.5+75.0+100.0+77.5+97.5+77.5+72.5+80.0=657.5
$$

Por tanto:

$$
\bar{x}=\frac{657.5}{8}=82.1875\approx82.19
$$

El puntaje SUS promedio de la evaluación piloto es **82.19 sobre 100**.

## Nota metodológica

El procedimiento corresponde a una **evaluación piloto académica basada en perfiles vinculados al proyecto**. Las fórmulas, respuestas y contribuciones quedan explícitas para facilitar auditoría, reproducción y escalamiento del estudio.
