# Mitigaciones OWASP

## Mitigaciones verificadas por pruebas

| Riesgo | Mitigacion | Evidencia |
|---|---|---|
| Contrasenas inseguras | Hash y verificacion de contrasena | `test_password_hash_and_verify_roundtrip` |
| Token invalido | Rechazo de token invalido | `test_decode_access_token_returns_none_for_invalid_token` |
| Login invalido | Error controlado ante credenciales incorrectas | `test_invalid_login_returns_controlled_error` |
| Acceso sin token | Ruta protegida bloquea acceso | `test_protected_route_without_token_is_blocked` |
| Error interno en endpoints sensibles | Endpoints ambientales e historial no devuelven 500 sin token | Pruebas de integracion Semana 13 |

## Mitigaciones planificadas

| Hallazgo | Accion recomendada | Momento sugerido |
|---|---|---|
| 4 vulnerabilidades moderadas frontend | Evaluar upgrade de Cypress y dependencias asociadas | Rama separada despues de sustentacion |
| 19 vulnerabilidades backend | Actualizar paquetes con matriz de compatibilidad | Rama separada con regresion completa |
| Security Hotspots 0.0 % reviewed | Revisar manualmente en SonarQube | Antes de entrega final si hay tiempo |

No se deben aplicar fixes forzados sin pruebas de regresion.
