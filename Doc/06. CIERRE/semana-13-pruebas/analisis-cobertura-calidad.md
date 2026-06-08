# Analisis de cobertura y calidad

Fecha de referencia: 2026-06-07.

## Contexto

OptiAcademic ya tenia una base funcional amplia: autenticacion, reportes, estudiantes, historial academico, CSP institucional, sostenibilidad, auditoria y notificaciones. La cobertura global inicial no debe interpretarse como una medida absoluta de calidad final, porque el repositorio tambien contiene seeds, scripts de preparacion, utilidades legacy y servicios que dependen de base de datos real.

La Semana 13 refuerza la cobertura con dos miradas:

- Cobertura global completa: muestra el estado general del backend y frontend.
- Cobertura focalizada: mide modulos criticos y componentes que forman parte de la entrega.

## Resultado backend

Comando:

```powershell
cd backend
py -m pytest --cov=app --cov-report=term --cov-report=html
```

Resultado observado:

- 23 pruebas pasaron.
- 5 pruebas quedaron omitidas por dependencias legacy o credenciales/contexto.
- Cobertura global backend: 50 %.
- Reporte HTML generado en `backend/htmlcov`.

Modulos con buena cobertura o validacion directa:

- `app.middleware.environmental`
- Schemas Pydantic principales.
- Modelos SQLAlchemy.
- Rutas de integracion basicas con TestClient.
- Funciones auxiliares de CSP y sostenibilidad.

Modulos con cobertura pendiente:

- Servicios extensos que dependen de base de datos.
- Motor CSP institucional completo.
- Repositorios con consultas SQLAlchemy reales.
- Rutas administrativas con autenticacion y permisos.

## Resultado frontend

Comando:

```powershell
npm --prefix frontend run test:coverage
```

Resultado observado:

- 33 pruebas pasaron.
- Cobertura focalizada frontend: 58.07 %.
- Reporte HTML generado en `frontend/coverage`.

Modulos con buena cobertura:

- `endpointLabels`.
- `formatters`.
- `ThemeToggle`.
- `PaginationControls`.
- `EnvironmentalImpactPage`.
- `InstitutionalCspGeneratorPage` con MSW.

Modulos pendientes:

- Componentes CSP secundarios que solo se renderizan en estados especificos.
- Algunos componentes comunes no ejercitados directamente.
- Flujos autenticados completos sin credenciales demo.

## Exclusiones justificadas

Se excluyen o no se priorizan en esta fase:

- `seed_*.py`, scripts de demo y carga masiva.
- Reportes generados (`htmlcov`, `coverage`, `playwright-report`, `cypress/videos`, `cypress/screenshots`).
- Dependencias externas y artefactos build.
- Flujos que requieren credenciales reales no disponibles en el entorno local.

## Riesgos pendientes

- Aumentar pruebas de servicios con base de datos de prueba aislada.
- Agregar credenciales demo controladas para ejecutar E2E autenticado.
- Corregir deuda de lint legacy antes de exigir lint global como gate.
- Resolver vulnerabilidades reportadas por `npm audit` despues de instalar dependencias de testing.
- Validar Cypress en otra estacion si el binario local vuelve a fallar al iniciar.

## Plan de mejora

1. Crear base de datos de prueba MySQL o SQLite compatible para repositorios.
2. Cubrir servicios criticos de CSP institucional con fixtures pequenas.
3. Agregar pruebas de permisos por rol.
4. Ejecutar Cypress con credenciales demo institucionales.
5. Incorporar cobertura minima como criterio gradual, no como bloqueo inmediato.
