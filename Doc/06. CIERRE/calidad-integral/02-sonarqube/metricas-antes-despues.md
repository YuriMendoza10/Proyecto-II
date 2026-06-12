# Metricas antes y despues

| Metrica | Resultado inicial | Resultado final estable | Interpretacion |
|---|---:|---:|---|
| Quality Gate | Failed | Passed | Se corrigio el estado de calidad hasta pasar la compuerta. |
| Bugs | 2 | 0 | Se eliminaron bugs detectados por SonarQube. |
| Vulnerabilities | 0 | 0 | No se detectan vulnerabilidades directas. |
| Code Smells | 254 | 254 | Se mantiene rating A y se documenta deuda tecnica restante. |
| Coverage | 13.9 % | 13.9 % | SonarQube reconoce cobertura integrada. |
| Duplications | 4.5 % | 4.5 % | Duplicacion baja. |

## Aclaracion

Hubo intentos posteriores de reduccion de smells, pero para la evidencia final estable se conserva el analisis Passed con 0 bugs y 0 vulnerabilities. No se inventan resultados posteriores. Si se vuelve a ejecutar SonarQube, esta tabla debe actualizarse solo con capturas reales.
