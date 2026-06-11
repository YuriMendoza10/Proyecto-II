# Matriz de casos de prueba

Estados usados:

- Aprobado.
- Aprobado con observacion.
- Skip justificado.
- Pendiente.

| ID | Tipo | Modulo | Caso de prueba | Entrada | Resultado esperado | Estado | Evidencia |
|---|---|---|---|---|---|---|---|
| PU-FE-01 | Unitaria frontend | endpointLabels | Traduce endpoints tecnicos a nombres amigables | Rutas `/api/v1/...` | Etiquetas comprensibles para usuarios | Aprobado | `frontend/src/tests/endpointLabels.test.js` |
| PU-FE-02 | Unitaria frontend | formatters | Formatea indicadores | CO2, porcentajes, bytes, ms | Valores legibles con unidades | Aprobado | `frontend/src/tests/formatters.test.js` |
| PU-FE-03 | Unitaria frontend | utilsExtra | Normaliza listas, datos seguros y errores | Arrays, objetos, `null`, errores API | Respuestas estables sin romper UI | Aprobado | `frontend/src/tests/utilsExtra.test.js` |
| PC-FE-01 | Componente frontend | Login | Renderiza formulario de login | Pantalla `/login` | Campos y accion disponibles | Aprobado | `frontend/src/tests/Login.test.jsx` |
| PC-FE-02 | Componente frontend | Dashboard | Renderiza dashboard principal | Datos simulados | Vista principal sin errores | Aprobado | `frontend/src/tests/Dashboard.test.jsx` |
| PC-FE-03 | Componente frontend | MatriculaPanel | Renderiza panel academico/matricula | Datos academicos simulados | Panel visible y estable | Aprobado | `frontend/src/tests/MatriculaPanel.test.jsx` |
| PC-FE-04 | Componente frontend | ThemeToggle | Cambia modo claro/oscuro | Click de usuario | Clase/estado de tema aplicado | Aprobado | `frontend/src/tests/ThemeToggle.test.jsx` |
| PC-FE-05 | Componente frontend | PaginationControls | Controla avance, retroceso y limites | Click siguiente/anterior | Callbacks correctos y limites respetados | Aprobado | `frontend/src/tests/PaginationControls.test.jsx` |
| PC-FE-06 | Componente frontend | Common components extra | Refuerza alertas, tablas, error boundary, numeros y cards | Estados carga/error/vacio | Componentes comunes estables | Aprobado | `frontend/src/tests/commonComponentsExtra.test.jsx` |
| PC-FE-07 | Componente frontend | CSP components extra | Valida advertencias y resultados CSP | Sin aula, sin docente, sin disponibilidad, bloques | Filtros y estados CSP funcionan | Aprobado | `frontend/src/tests/cspComponentsExtra.test.jsx` |
| MSW-FE-01 | Componente con mock API | SustainabilityReport | Simula API de sostenibilidad | Respuestas MSW | Carga, exito, vacio y error controlado | Aprobado | `frontend/src/tests/SustainabilityReport.msw.test.jsx` |
| MSW-FE-02 | Componente con mock API | Institutional CSP | Simula `available-schedules` | Horarios generados simulados | Lista, busqueda, filtros y errores controlados | Aprobado | `frontend/src/tests/InstitutionalCspGeneratorPage.msw.test.jsx` |
| PU-BE-01 | Unitaria backend | security core | Valida hash, verificacion y JWT | Contrasena, token valido/invalido | Seguridad base funcionando | Aprobado | `backend/tests/test_security_core.py` |
| PU-BE-02 | Unitaria backend | CSP utils extra | Valida tiempos, solapamientos y slots | Bloques horarios simulados | Utilidades CSP correctas | Aprobado | `backend/tests/test_csp_utils_extra.py` |
| PU-BE-03 | Unitaria backend | environmental service | Valida calculo CO2 y persistencia simulada | Bytes, metricas, error commit | CO2 correcto y rollback ante error | Aprobado | `backend/tests/test_environmental_service.py` |
| PU-BE-04 | Unitaria backend | schedule publication service | Valida publicacion segura | Horario sin bloques, readiness critico, calidad valida | Bloqueo o publicacion segun regla | Aprobado | `backend/tests/test_schedule_publication_service.py` |
| PU-BE-05 | Unitaria backend | student academic history service | Valida serializacion y resumen academico | Registros mockeados | Conteos, creditos y 404 correctos | Aprobado | `backend/tests/test_student_academic_history_service.py` |
| PU-BE-06 | Unitaria backend | report service | Valida helpers de reportes y GreenFrame | Periodos, archivo GreenFrame | Periodo, contenido y errores correctos | Aprobado | `backend/tests/test_report_service.py` |
| PI-BE-01 | Integracion backend | FastAPI docs | `/docs` responde 200 | GET `/docs` | Swagger disponible | Aprobado | `backend/tests/test_semana13_integration_api.py` |
| PI-BE-02 | Integracion backend | Login invalido | Login invalido responde controlado | Credenciales invalidas | 401/controlado, no 500 | Aprobado | `backend/tests/test_semana13_integration_api.py` |
| PI-BE-03 | Integracion backend | Ruta protegida sin token | Bloquea acceso sin token | GET protegido sin token | 401 o 403 | Aprobado | `backend/tests/test_semana13_integration_api.py` |
| PI-BE-04 | Integracion backend | Environmental summary | Endpoint ambiental sin token no rompe | GET sin token | Bloqueo controlado, no 500 | Aprobado | `backend/tests/test_semana13_integration_api.py` |
| PI-BE-05 | Integracion backend | Academic history page | Historial paginado sin token no rompe | GET sin token | Bloqueo controlado, no 500 | Aprobado | `backend/tests/test_semana13_integration_api.py` |
| E2E-01 | E2E | Login | Login carga correctamente | Abrir `/login` | Formulario visible | Aprobado | `frontend/e2e/login.spec.js` |
| E2E-02 | E2E | Login invalido | Login invalido no permite acceso | Credenciales invalidas | No ingresa al dashboard | Aprobado | `frontend/e2e/login.spec.js` |
| E2E-03 | E2E | Tema visual | Modo claro/oscuro se puede cambiar | Click en control de tema | Tema aplicado | Aprobado | `frontend/e2e/theme.spec.js` |
| E2E-04 | E2E | Sostenibilidad autenticada | Reporte de sostenibilidad carga con sesion | Credenciales demo | Metricas principales visibles | Skip justificado | `frontend/e2e/sustainability.spec.js` |
| E2E-05 | E2E | Dashboard autenticado | Dashboard admin carga con sesion | Credenciales demo | Panel visible | Skip justificado | `frontend/e2e/navigation.spec.js` |
| E2E-06 | E2E | CSP institucional autenticado | CSP carga con sesion admin | Credenciales demo | Pantalla visible | Skip justificado | `frontend/e2e/institutional-csp.spec.js` |
| AC-01 | Aceptacion | Login | Login carga correctamente | Cypress abre `/login` | Formulario visible | Pendiente | `frontend/cypress/e2e/acceptance-login.cy.js` |
| AC-02 | Aceptacion | Login invalido | Login invalido no permite acceso | Credenciales invalidas | Acceso rechazado | Pendiente | `frontend/cypress/e2e/acceptance-login.cy.js` |
| AC-03 | Aceptacion | CSP institucional | Pantalla CSP muestra elementos principales | Credenciales Cypress | Horarios generados visibles | Pendiente | `frontend/cypress/e2e/acceptance-csp.cy.js` |
| COV-FE-01 | Cobertura | Frontend | Coverage frontend y LCOV | `npm --prefix frontend run test` | 81.11 % y `frontend/coverage/lcov.info` | Aprobado | `frontend/coverage` |
| COV-BE-01 | Cobertura | Backend global | Coverage backend XML/HTML | `py -m pytest --cov=app --cov-report=xml:coverage.xml --cov-report=html --cov-report=term` | 51 % global y `backend/coverage.xml` | Aprobado con observacion | `backend/htmlcov`, `backend/coverage.xml` |
| COV-BE-02 | Cobertura critica | `app.core.security` | Logica de seguridad | Pytest coverage | 95 % | Aprobado | `backend/htmlcov` |
| COV-BE-03 | Cobertura critica | `app.csp.utils` | Utilidades CSP | Pytest coverage | 96 % | Aprobado | `backend/htmlcov` |
| COV-BE-04 | Cobertura critica | `schedule_publication_service` | Publicacion segura | Pytest coverage | 82 % | Aprobado | `backend/htmlcov` |
| GIT-01 | Calidad repositorio | Diff check | Verifica espacios conflictivos | `git diff --check` | Sin errores criticos | Aprobado | Consola Git |
