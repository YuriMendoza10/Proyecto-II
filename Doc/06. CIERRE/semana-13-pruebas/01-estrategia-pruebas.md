# Estrategia de pruebas

## Enfoque

La estrategia de Semana 13 prioriza pruebas pequenas, mantenibles y seguras. No se modificaron endpoints, modelos, migraciones ni rutas productivas para facilitar las pruebas.

## Niveles de prueba

| Nivel | Objetivo | Alcance |
|---|---|---|
| Unitarias | Validar funciones, schemas y componentes aislados | Utilidades de frontend, schemas Pydantic, calculos ambientales y CSP |
| Integracion | Validar comunicacion HTTP controlada | FastAPI TestClient sobre rutas criticas |
| End to end | Validar flujos visibles en navegador | Login, tema visual, sostenibilidad y navegacion principal |

## Criterios de seleccion

- Evitar escritura sobre base de datos real.
- Usar mocks cuando la prueba requiera autenticacion o dependencias externas.
- Marcar como `skip` los escenarios que dependen de credenciales demo no disponibles.
- Mantener pruebas explicables para revision academica.
- Conservar pruebas existentes sin eliminarlas.

## Riesgos cubiertos

- Pantalla blanca en rutas publicas.
- Formateo incorrecto de indicadores ambientales.
- Exposicion de endpoints tecnicos como texto principal.
- Cambio de tema sin persistencia.
- Rutas protegidas accesibles sin token.
- Errores 500 en rutas criticas consultadas sin autenticacion.

