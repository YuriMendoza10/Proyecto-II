# Riesgo residual

| Area | Riesgo residual | Impacto | Accion recomendada |
|---|---|---|---|
| Autorizacion por rol | No todos los endpoints tienen pruebas especificas por rol | Acceso indebido si una ruta queda mal protegida | Agregar pruebas de permisos ADMIN, COORDINATOR, TEACHER y STUDENT |
| Dependencias | Falta evidencia de `npm audit` y `pip-audit` | Vulnerabilidades conocidas no detectadas | Ejecutar auditorias y registrar capturas |
| Configuracion productiva | CORS, debug y variables dependen del entorno final | Exposicion por configuracion incorrecta | Revisar antes de despliegue |
| Datos sensibles | Algunos reportes pueden devolver campos extensos | Exposicion innecesaria | Revisar serializacion y payloads |
| Validacion negativa | Faltan mas casos de entradas maliciosas | Errores 500 o validacion incompleta | Agregar pruebas de payloads invalidos |

## Interpretacion

El riesgo residual es controlable, pero no debe marcarse como cerrado sin evidencias reales de auditoria. La prioridad siguiente es capturar pruebas de seguridad, auditorias de dependencias y permisos por rol.
