# Deuda tecnica

## Estado final estable SonarQube

| Metrica | Resultado |
|---|---:|
| Quality Gate | Passed |
| Bugs | 0 |
| Vulnerabilities | 0 |
| Security Hotspots Reviewed | 0.0 % |
| Code Smells | 254 |
| Coverage | 13.9 % |
| Duplications | 4.5 % |
| Lines | 48k |

## Interpretacion

La deuda tecnica restante se concentra en mantenibilidad: complejidad cognitiva, condicionales anidados, duplicaciones menores, codigo comentado o estilos que SonarQube clasifica como code smells. El rating de mantenibilidad se mantiene en A, por lo que no bloquea el Quality Gate.

## Bugs corregidos

Los 2 bugs iniciales se corrigieron mediante normalizacion explicita de tipos en la vista CSP institucional. No se uso comparacion laxa `==`; se normalizaron valores numericos opcionales antes de compararlos o enviarlos al payload.

## Deuda pendiente

| Hallazgo | Riesgo | Accion recomendada | Estado |
|---|---|---|---|
| Security Hotspots sin revisar | Requiere validacion manual | Revisar en SonarQube y documentar si aplica mitigacion | Pendiente |
| Code Smells restantes | Mantenibilidad | Priorizar funciones pequenas y seguras antes de refactors grandes | Pendiente |
| Complejidad en servicios CSP | Riesgo de romper generacion institucional | Refactor progresivo con pruebas focalizadas | Pendiente controlado |
| Coverage integrada 13.9 % | Verificabilidad global | Aumentar pruebas sobre repositorios y servicios con BD de prueba aislada | Pendiente |

No se deben excluir modulos reales ni maquillar configuraciones para mejorar metricas.
