# Semana 13 - Pruebas de software

Esta carpeta documenta la base de pruebas incorporada a OptiAcademic para la Semana 13. El objetivo es demostrar que el sistema cuenta con pruebas unitarias, pruebas de integracion y pruebas end to end sin modificar la logica funcional existente.

## Objetivo

Validar de forma progresiva los modulos principales del sistema y reducir riesgos antes de la entrega final. Las pruebas se enfocan en funciones puras, rutas criticas, componentes reutilizables y flujos visibles para el usuario.

## Herramientas usadas

| Capa | Herramienta | Uso |
|---|---|---|
| Backend | pytest | Pruebas unitarias e integracion de FastAPI |
| Backend | TestClient | Verificacion de rutas HTTP sin levantar servidor externo |
| Frontend | Vitest | Pruebas unitarias de utilidades y componentes React |
| Frontend | Testing Library | Validacion de comportamiento visible para el usuario |
| E2E | Playwright | Pruebas de navegador sobre rutas principales |
| Calidad | Vite build | Verificacion de compilacion del frontend |
| Entorno | Docker Compose | Validacion de configuracion del entorno |

## Modulos evaluados

- Login y acceso inicial.
- Reporte de sostenibilidad.
- Nombres amigables para endpoints tecnicos.
- Formateo de indicadores ambientales.
- Modo claro y modo oscuro.
- Controles de paginacion.
- Rutas protegidas del backend.
- Documentacion Swagger de FastAPI.
- Funciones auxiliares del motor CSP.
- Schemas de estudiantes e historial academico.

## Comandos principales

Desde la raiz del proyecto:

```powershell
npm --prefix frontend run build
npm --prefix frontend run test
npm --prefix frontend run e2e
docker compose --env-file .env.docker.example config --quiet
```

Para backend:

```powershell
cd backend
py -m pytest -v
```

## Contenido

- [01-estrategia-pruebas.md](01-estrategia-pruebas.md)
- [02-casos-prueba-unitarias.md](02-casos-prueba-unitarias.md)
- [03-casos-prueba-integracion.md](03-casos-prueba-integracion.md)
- [04-casos-prueba-e2e.md](04-casos-prueba-e2e.md)
- [05-evidencias-ejecucion.md](05-evidencias-ejecucion.md)
- [06-resultados-pruebas.md](06-resultados-pruebas.md)
- [matriz-casos-prueba.md](matriz-casos-prueba.md)
- [evidencias](evidencias/)

