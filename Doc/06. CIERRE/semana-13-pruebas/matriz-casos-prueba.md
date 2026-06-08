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

