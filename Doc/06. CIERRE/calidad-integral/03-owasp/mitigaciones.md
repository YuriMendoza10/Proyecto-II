# Mitigaciones OWASP

## Mitigaciones implementadas o verificables

| Riesgo | Mitigacion | Evidencia sugerida | Estado |
|---|---|---|---|
| Acceso sin autenticacion | Rutas protegidas mediante JWT y usuario actual | Prueba de ruta protegida sin token | Cumple parcialmente |
| Token invalido | Rechazo de token invalido en pruebas de seguridad | `test_security_core.py` | Cumple parcialmente |
| Login invalido | Error controlado sin exponer informacion sensible | Prueba de login invalido | Cumple parcialmente |
| Inyeccion SQL | Uso de SQLAlchemy y parametros tipados | Revision tecnica y pruebas negativas | Cumple parcialmente |
| Entrada invalida | Schemas Pydantic en backend | Pruebas de schemas y endpoints | Cumple parcialmente |
| Credenciales expuestas | `.env` ignorado por Git y ejemplos separados | Revision de `.gitignore` y busqueda de secretos | Cumple parcialmente |
| Trazabilidad insuficiente | Audit logs y trazabilidad del sistema | Captura de auditoria/trazabilidad | Pendiente de captura |

## Mitigaciones propuestas

- Ejecutar `npm audit` y documentar resultados.
- Ejecutar `pip-audit` sobre `backend/requirements.txt`.
- Agregar pruebas negativas para filtros de reportes.
- Agregar pruebas de permisos por rol en endpoints administrativos.
- Revisar CORS y configuracion de debug antes de despliegue real.
- Revisar payloads para evitar exposicion innecesaria de datos personales.

## Comandos

```powershell
cd backend
py -m pytest tests/test_security_core.py -v
cd ..
```

```powershell
npm --prefix frontend audit
```

```powershell
py -m pip install pip-audit
py -m pip_audit -r backend/requirements.txt
```
