# SonarQube

Esta seccion documenta el analisis estatico de OptiAcademic con SonarQube.

## Resultado final estable

| Metrica | Resultado |
|---|---:|
| Quality Gate | Passed |
| Bugs | 0 |
| Vulnerabilities | 0 |
| Security Hotspots Reviewed | 0.0 % |
| Code Smells | 254 |
| Coverage SonarQube | 13.9 % |
| Duplications | 4.5 % |
| Lines | 48k |

## Interpretacion

El proyecto paso el Quality Gate, no presenta bugs abiertos ni vulnerabilidades directas en SonarQube. La mantenibilidad se mantiene en rating A y la duplicacion es baja. La cobertura integrada de SonarQube fue reconocida, aunque difiere de los reportes especificos de Vitest y Pytest porque SonarQube calcula sobre el conjunto combinado del codigo analizado.

Security Hotspots Reviewed queda pendiente de revision manual desde la interfaz de SonarQube como parte del analisis OWASP.

## Archivos de esta seccion

- [analisis-sonarqube.md](analisis-sonarqube.md)
- [metricas-antes-despues.md](metricas-antes-despues.md)
- [deuda-tecnica.md](deuda-tecnica.md)
- [evidencias](evidencias/)
