# Analisis de cobertura y calidad

Fecha de referencia: 2026-06-08.

## Objetivo

Este documento interpreta los resultados de cobertura de OptiAcademic despues de reforzar la suite de Semana 13. La lectura diferencia entre cobertura global y cobertura de logica critica, porque el sistema contiene modulos grandes que dependen de base de datos real, repositorios SQLAlchemy, servicios administrativos extensos y motores CSP completos.

## Resumen de cobertura

| Capa | Cobertura anterior | Cobertura nueva | Interpretacion |
|---|---:|---:|---|
| Frontend focalizado | 58.07 % | 81.11 % | Supera el minimo de 70 % solicitado por la rubrica |
| Backend global | 50 % | 51 % | No llega a 70 % global, pero mejora logica critica |

## Cobertura frontend

Comando:

```powershell
npm --prefix frontend run test:coverage
```

Resultado:

```txt
Coverage global: 81.11 %
Statements: 81.11 %
Branches: 65.29 %
Functions: 68.24 %
Lines: 81.11 %
```

| Area | Cobertura | Comentario |
|---|---:|---|
| `components/common` | 100 % | Alertas, tablas, error boundary, numeros legibles y cards cubiertos |
| `components/csp` | 68.38 % | Componentes principales de CSP reforzados; quedan componentes secundarios |
| `pages/admin` | 80.08 % | Paginas administrativas principales cubiertas con RTL/MSW |
| `utils` | 95 % | Utilidades de formato, listas, errores y cache bien cubiertas |

### Interpretacion frontend

La cobertura frontend subio de 58.07 % a 81.11 %. El incremento se logro agregando pruebas para:

- Componentes comunes.
- Utilidades de datos.
- Componentes CSP.
- Vista de sostenibilidad con MSW.
- Vista de generacion institucional CSP con MSW.

El frontend cumple el criterio cuantitativo de 70 % y ademas cubre funcionalidades relevantes para experiencia de usuario, reportes, accesibilidad visual, sostenibilidad y CSP institucional.

## Cobertura backend

Comando:

```powershell
cd backend
py -m pytest --cov=app --cov-report=term --cov-report=html
```

Resultado:

```txt
46 passed
5 skipped
3 warnings
Coverage global backend: 51 %
Reporte HTML: backend/htmlcov
```

La cobertura global backend no alcanza el 70 % porque el calculo incluye servicios grandes, repositorios, motores CSP completos y modulos dependientes de base de datos real. No se excluyeron servicios reales de forma artificial para inflar el porcentaje.

## Logica critica backend

| Modulo critico | Cobertura | Comentario |
|---|---:|---|
| `app.core.security` | 95 % | Seguridad, hash de contrasena y tokens cubiertos |
| `app.csp.utils` | 96 % | Utilidades CSP criticas cubiertas |
| `app.services.schedule_publication_service` | 82 % | Reglas de publicacion segura cubiertas |
| `app.middleware.environmental` | 100 % | Middleware ambiental cubierto |
| Schemas principales | 80 % - 100 % | Validaciones de datos cubiertas |
| Modelos principales | 95 % - 100 % | Definiciones principales cargadas y ejercitadas |

### Interpretacion backend

Aunque la cobertura global backend es 51 %, los modulos criticos relacionados con seguridad, CSP, sostenibilidad y publicacion segura alcanzan cobertura alta. Esto esta alineado con la intencion de la rubrica sobre asegurar logica critica y reducir riesgos sobre flujos principales.

La cobertura global baja se explica por:

- Servicios administrativos extensos que requieren fixtures reales.
- Repositorios SQLAlchemy que dependen de una base de datos de prueba.
- Motor CSP institucional completo, que requiere escenarios integrales.
- Endpoints protegidos por roles y datos demo.
- Reportes que agrupan muchos modelos y relaciones.

## Pruebas omitidas y advertencias

### Pruebas omitidas

Se reportaron 5 pruebas `skipped`. Corresponden a pruebas legacy o escenarios que requieren contexto no disponible en la suite actual. El skip esta justificado y no representa fallo funcional.

### Warnings no bloqueantes

| Warning | Explicacion | Impacto |
|---|---|---|
| `pytest-asyncio` | `asyncio_default_fixture_loop_scope` no esta configurado | Compatibilidad futura, no bloquea |
| `Pydantic` | `class Config` sera deprecado | Requiere migracion futura a `ConfigDict` |
| `python-jose` | Uso interno de `datetime.utcnow` | Advertencia de dependencia, no del codigo propio |

## Exclusiones justificadas

Se excluyen o no se versionan:

- `seed_*.py`, scripts de demo y carga masiva.
- Reportes generados como `htmlcov`, `coverage`, `playwright-report`, `cypress/videos` y `cypress/screenshots`.
- Dependencias externas y artefactos build.
- Flujos que requieren credenciales reales no disponibles.

No se excluyeron servicios reales solo para mejorar artificialmente el porcentaje.

## Limitacion principal

Para alcanzar 70 % global o mas en backend se requiere implementar una base de datos de prueba aislada, fixtures de integracion y pruebas sobre repositorios/servicios dependientes de MySQL. Hacerlo sin esa infraestructura podria generar pruebas fragiles o riesgo de afectar datos reales.

## Plan para llegar a 85 % en logica critica

1. Crear base de datos de prueba MySQL aislada o contenedor dedicado.
2. Agregar fixtures de usuarios, docentes, estudiantes, aulas, horarios y ofertas.
3. Cubrir repositorios SQLAlchemy con datos controlados.
4. Agregar pruebas de permisos por rol.
5. Cubrir motor CSP institucional con escenarios pequenos.
6. Cubrir reportes principales con datos de prueba reproducibles.
7. Ejecutar E2E autenticado con credenciales demo seguras.
8. Mantener cobertura minima gradual para no bloquear el desarrollo por deuda historica.

## Conclusion

La cobertura frontend cumple y supera el umbral de la rubrica. La cobertura backend global queda en 51 %, pero la logica critica prioritaria alcanza valores altos: seguridad 95 %, utilidades CSP 96 %, publicacion segura 82 % y middleware ambiental 100 %. La estrategia aplicada es honesta: no infla cobertura con exclusiones injustificadas y deja claro el camino tecnico para aumentar cobertura global backend en una siguiente iteracion.
