# Metricas antes y despues

| Metrica | Antes | Despues | Variacion | Interpretacion |
|---|---:|---:|---:|---|
| Quality Gate | Failed | Passed | Mejora | La compuerta actual pasa despues de corregir bugs criticos |
| Bugs | 2 | 0 | -2 | Bugs en comparaciones estrictas de `InstitutionalCSPPage.jsx` corregidos con normalizacion explicita |
| Vulnerabilities | 0 | 0 | 0 | No se reportan vulnerabilidades directas |
| Code Smells | 254 | 194 | -60 | Se redujo deuda de mantenibilidad sin refactors agresivos |
| Coverage | 13.9 % | 17.5 % | +3.6 pp | Cobertura integrada de SonarQube sobre frontend/backend analizados |
| Duplications | 4.5 % | 2.5 % | -2.0 pp | Se redujo duplicacion reportada |
| Security Hotspots Reviewed | 0.0 % | 0.0 % | 0 | Requiere revision manual desde la interfaz de SonarQube |
| Lines | 48k | 41k | -7k | Tamano aproximado analizado por SonarQube |
| Technical Debt | Pendiente | Pendiente | Pendiente | Completar con dashboard real |

## Nota

Los valores actuales provienen del dashboard SonarQube indicado para `optic2`. Las siguientes mejoras deben registrarse solo despues de una nueva ejecucion con capturas reales.

## Cambios preparados para proxima ejecucion

- Imports no usados eliminados.
- Logs de depuracion retirados.
- Literales repetidos reemplazados por constantes locales.
- Configuracion de cobertura backend ajustada con `relative_files = True`.
- Algunos keys con indices reemplazados por keys estables.

El resultado final de SonarQube queda pendiente hasta reejecutar el scanner con token local.
