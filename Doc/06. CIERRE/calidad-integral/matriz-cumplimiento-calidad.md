# Matriz de cumplimiento de calidad integral

| Criterio | Evidencia | Ubicacion | Estado | Observacion |
|---|---|---|---|---|
| Repositorio GitHub | Repositorio publico, codigo fuente, README principal y estructura `Doc/` | `README.md`, `Doc/` | Cumple | Verificar que la rama final este actualizada en GitHub. |
| Documentacion tecnica | Calidad integral, sostenibilidad, pruebas y entregables organizados | `Doc/06. CIERRE/`, `Doc/07. OPTIACADEMIC - SOSTENIBILIDAD Y VALIDACION/` | Cumple | Documentacion centralizada en `Doc/`. |
| SonarQube | Quality Gate Passed, Bugs 0, Vulnerabilities 0, Code Smells 254, Coverage 13.9 %, Duplications 4.5 % | `02-sonarqube/` | Cumple | Security Hotspots Reviewed queda en 0.0 % y requiere revision manual. |
| OWASP Top 10 2025 | Matriz OWASP, mitigaciones, riesgo residual, 9 pruebas de seguridad aprobadas, npm audit y pip-audit documentados | `03-owasp/` | Cumple con observaciones | Dependencias con vulnerabilidades quedan como riesgo residual controlado. |
| WCAG | Checklist de contraste, teclado, foco, labels, tablas, modo claro/oscuro y rutas principales | `04-wcag/` | Pendiente de capturas reales | Falta adjuntar Lighthouse Accessibility y evidencia manual de teclado. |
| Evaluación SUS | Instrumento contextualizado, protocolo controlado, muestra heterogénea de 8 participantes, base de respuestas, cálculo auditable, interpretación cuantitativa y plan de mejora UX | `Doc/06. CIERRE/calidad-integral/05-sus/` | Cumple en evaluación piloto | Puntaje promedio de 82.19/100, nivel de aceptabilidad alto y resultado apto para validación académica/piloto. Se documentan siete acciones de mejora para reducir la curva de aprendizaje en gestión y docencia. |
| Testing automatizado | Frontend 51 passed y 81.11 %; backend 46 passed, 5 skipped y 51 %; Playwright 6 passed, 3 skipped | `06-testing/`, `../semana-13-pruebas/` | Cumple | Cypress configurado, pendiente si el binario local falla por entorno. |
| Evidencias tecnicas | Guia de capturas para SonarQube, OWASP, WCAG, SUS, testing y GitHub | `07-evidencias/` | En proceso | Agregar capturas reales con los nombres sugeridos. |
| Presentacion tecnica | Resumen general, matrices y resultados listos para sustentar | `resumen-general-calidad-integral.md` | Pendiente | Preparar diapositivas finales con capturas reales. |
