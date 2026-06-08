# Matriz de casos de prueba

| ID | Tipo | Modulo | Caso de prueba | Entrada | Resultado esperado | Estado | Evidencia |
|---|---|---|---|---|---|---|---|
| PU-01 | Unitaria | endpointLabels | Traduce rutas tecnicas a nombres amigables | `/api/v1/notifications/me` | `Notificaciones del usuario` | Implementado | `frontend/src/tests/endpointLabels.test.js` |
| PU-02 | Unitaria | formatters | Formatea CO2 correctamente | `0.0000297237` | Valor legible con `g CO2` | Implementado | `frontend/src/tests/formatters.test.js` |
| PU-03 | Unitaria | formatters | Formatea porcentajes correctamente | `6` | `6 %` | Implementado | `frontend/src/tests/formatters.test.js` |
| PU-04 | Unitaria | ThemeToggle | Cambia entre modo claro y oscuro | Click del usuario | Clase `dark` aplicada o retirada | Implementado | `frontend/src/tests/ThemeToggle.test.jsx` |
| PU-05 | Unitaria | PaginationControls | Controla avance y retroceso de paginas | Click en siguiente/anterior | Llama callbacks correctos | Implementado | `frontend/src/tests/PaginationControls.test.jsx` |
| PI-01 | Integracion | Backend | `/docs` responde 200 | GET `/docs` | Swagger disponible | Implementado | `backend/tests/test_semana13_integration_api.py` |
| PI-02 | Integracion | Login | Login invalido responde error controlado | Credenciales invalidas | 401 controlado, no 500 | Implementado | `backend/tests/test_semana13_integration_api.py` |
| PI-03 | Integracion | Seguridad | Ruta protegida sin token bloquea acceso | GET sin token | 401 o 403 | Implementado | `backend/tests/test_semana13_integration_api.py` |
| PI-04 | Integracion | Sostenibilidad | Reporte ambiental responde sin 500 | GET sin token | Bloqueo controlado, no 500 | Implementado | `backend/tests/test_semana13_integration_api.py` |
| PI-05 | Integracion | Historial academico | Endpoint paginado responde estructura esperada si existe | GET sin token | Bloqueo controlado, no 500 | Implementado | `backend/tests/test_semana13_integration_api.py` |
| E2E-01 | E2E | Login | Login carga correctamente | Abrir `/login` | Formulario visible | Implementado | `frontend/e2e/login.spec.js` |
| E2E-02 | E2E | Login | Login invalido no permite acceso | Credenciales invalidas | Permanece en login o muestra error | Implementado | `frontend/e2e/login.spec.js` |
| E2E-03 | E2E | Tema visual | Modo claro/oscuro se puede cambiar | Click en control de tema | Tema aplicado en documento | Implementado | `frontend/e2e/theme.spec.js` |
| E2E-04 | E2E | Sostenibilidad | Reporte de sostenibilidad carga con sesion valida | Credenciales demo | Muestra metricas principales | Skip por credenciales | `frontend/e2e/sustainability.spec.js` |
| E2E-05 | E2E | Dashboard | Dashboard administrativo carga con sesion valida | Credenciales demo | Panel visible | Skip por credenciales | `frontend/e2e/navigation.spec.js` |
| E2E-06 | E2E | CSP institucional | CSP institucional carga con sesion valida | Credenciales demo | Pantalla visible | Skip por credenciales | `frontend/e2e/navigation.spec.js` |
| MSW-01 | Componente | CSP institucional | Muestra carga, exito, busqueda, vacio y error con API simulada | Respuestas MSW para catalogos y horarios | La pagina no llama backend real y renderiza estados controlados | Aprobado | `frontend/src/tests/InstitutionalCspGeneratorPage.msw.test.jsx` |
| MSW-02 | Componente | Sostenibilidad | Muestra carga, reporte, vacio y error con API simulada | Respuestas MSW de impacto ambiental | El reporte ambiental es entendible y tolera errores | Aprobado | `frontend/src/tests/SustainabilityReport.msw.test.jsx` |
| AC-01 | Aceptacion | Login | Login carga correctamente | Abrir `/login` | Formulario visible | Implementado | `frontend/cypress/e2e/acceptance-login.cy.js` |
| AC-02 | Aceptacion | Login | Login invalido no permite acceso | Credenciales invalidas | Usuario permanece sin sesion | Implementado | `frontend/cypress/e2e/acceptance-login.cy.js` |
| AC-03 | Aceptacion | CSP institucional | Pantalla CSP muestra elementos principales con sesion | `CYPRESS_ADMIN_EMAIL` y `CYPRESS_ADMIN_PASSWORD` | Muestra `Horarios generados` y acciones principales | Skip por credenciales | `frontend/cypress/e2e/acceptance-csp.cy.js` |
| AC-04 | Aceptacion | CSP institucional | Omite pruebas autenticadas si no hay credenciales | Variables ausentes | Skip explicado sin credenciales reales | Implementado | `frontend/cypress/e2e/acceptance-csp.cy.js` |
| AC-05 | Aceptacion | Seguridad UX | Navegacion protegida sin sesion es controlada | Abrir `/admin/institutional-csp` sin token | No hay pantalla blanca | Implementado | `frontend/cypress/e2e/acceptance-csp.cy.js` |
| E2E-07 | E2E | CSP institucional | Login carga antes de validar CSP | Abrir `/login` | Formulario visible | Aprobado | `frontend/e2e/institutional-csp.spec.js` |
| E2E-08 | E2E | CSP institucional | Login invalido no permite acceso al CSP | Credenciales invalidas | No ingresa a `/admin/institutional-csp` | Aprobado | `frontend/e2e/institutional-csp.spec.js` |
| E2E-09 | E2E | CSP institucional | Lista de horarios generados con sesion admin | Credenciales E2E | Muestra busqueda, cargar horario y ver bloques | Skip por credenciales | `frontend/e2e/institutional-csp.spec.js` |
| CV-01 | Cobertura | Backend | Reporte de cobertura pytest-cov | `py -m pytest --cov=app` | Reporte terminal y HTML | Aprobado | `backend/htmlcov` |
| CV-02 | Cobertura | Frontend | Reporte de cobertura Vitest V8 | `npm --prefix frontend run test:coverage` | Reporte terminal y HTML | Aprobado | `frontend/coverage` |
| CV-03 | Calidad | Build | Frontend compila para produccion | `npm --prefix frontend run build` | Build exitoso | Aprobado | `Doc/06. CIERRE/semana-13-pruebas/06-resultados-pruebas.md` |

