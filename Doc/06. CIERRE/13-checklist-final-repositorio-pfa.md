# Checklist Final del Repositorio PFA

Fecha de revisión documental: 2 de julio de 2026.

| ID | Requisito | Evidencia en el repositorio | Estado | Observación |
|---:|---|---|---|---|
| 1 | Repositorio GitHub activo | Remoto `origin` configurado | Cumple | URL verificable en configuración Git |
| 2 | URL estable | `https://github.com/YuriMendoza10/Proyecto-II.git` | Cumple | Confirmar acceso público antes de entregar |
| 3 | Control de versiones Git | Directorio `.git` e historial | Cumple | Historial disponible |
| 4 | Flujo de trabajo documentado | `Doc/02. PLANIFICACION/flujo-trabajo-git.md` | Cumple | Feature Branch Workflow |
| 5 | Ramas | `git branch -a` | Cumple | Hay ramas locales y remotas |
| 6 | Commits significativos | `git log --oneline --all` | Cumple | Se observan prefijos descriptivos |
| 7 | Pull requests o integración | Merge commit del PR `#1` | Cumple con observación | Revisar PRs adicionales en GitHub |
| 8 | Versionado semántico | `versionado-semantico.md` | Cumple con observación | Política documentada |
| 9 | Tag `v1.0.0` | `git tag` | Pendiente | Existen tags similares, no el exacto |
| 10 | Separación frontend/backend | `frontend/`, `backend/` | Cumple | Estructura verificable |
| 11 | Arquitectura documentada | `arquitectura-sistema.md` | Cumple | Capas y responsabilidades descritas |
| 12 | `.gitignore` | `.gitignore` raíz | Cumple | Ignora entorno, builds y cobertura |
| 13 | Exclusión de archivos innecesarios | Reglas para caché, logs, coverage y `.docker.env` | Cumple | Revisar periódicamente archivos históricos |
| 14 | Código limpio | SonarQube Quality Gate Passed | Cumple con observación | Permanecen 254 code smells documentados |
| 15 | Documentación Markdown | `README.md`, `Doc/**/*.md`, `docs/README.md` | Cumple | Versionable y navegable |
| 16 | Documentación PMBOK | `Doc/01` a `Doc/06` | Cumple | Organizada por fases |
| 17 | README completo | `README.md` | Cumple | Incluye apartados PFA |
| 18 | Nombre del proyecto | Encabezado `OptiAcademic` | Cumple | Visible en README |
| 19 | Tabla de contenido | README raíz | Cumple | Enlaces internos |
| 20 | Integrantes | README raíz | Cumple | Seis integrantes identificados |
| 21 | Imagen del equipo | README raíz y recurso publicado por el equipo | Cumple | Se conserva el enlace existente en GitHub |
| 22 | Problemática | README raíz | Cumple | Contexto académico explicado |
| 23 | Justificación PMV | README raíz | Cumple | Alcance mínimo viable descrito |
| 24 | Tecnologías | README raíz | Cumple | Tabla de stack real |
| 25 | Arquitectura | README y documento técnico | Cumple | Diagrama textual incluido |
| 26 | Instalación | README raíz | Cumple | Requisitos y clonación |
| 27 | Build | README raíz | Cumple | Docker y frontend |
| 28 | Despliegue | README raíz | Cumple | Despliegue local con Compose |
| 29 | Video explicativo | `Doc/05. LANZAMIENTO/video-explicativo.md` | Pendiente | Falta enlace final, máximo 5 minutos |
| 30 | Enlaces a documentación | README, `Doc/README.md`, `docs/README.md` | Cumple | Validar nuevamente al publicar |
| 31 | Historial de commits | `git log --all` | Cumple | Evidencia progresiva |
| 32 | Evolución del PMV | Commits y documentación por fases | Cumple | Desarrollo progresivo verificable |
| 33 | Trabajo colaborativo | `evidencia-desarrollo-colaborativo.md` | Cumple con observación | Autoría nominal exacta requiere validación GitHub |
| 34 | PMV funcional | Evidencias Docker y cierre | Cumple | Estado documentado, no reejecutado aquí |
| 35 | Evidencia de calidad integral | `Doc/06. CIERRE/calidad-integral/` | Cumple | Incluye métricas y capturas |
| 36 | Control y cierre | `Doc/06. CIERRE/` | Cumple | Registros y trazabilidad disponibles |
| 37 | SonarQube | Quality Gate Passed, métricas y captura | Cumple | Coverage global 13.9 % |
| 38 | OWASP | Matriz, mitigaciones, riesgos y evidencias | Cumple con observación | Mantener revisión de riesgos residuales |
| 39 | WCAG | Checklist, hallazgos y capturas | Cumple con observación | Completar validación manual en cada versión |
| 40 | SUS | Resultado 82.19/100 | Cumple con observación | Piloto de ocho participantes |
| 41 | Testing | Vitest, Pytest y Playwright documentados | Cumple con observación | Hay 5 backend y 3 E2E omitidas |
| 42 | Docker | Recuperación y servicios HTTP 200 | Cumple | No usar `down -v` |
| 43 | Swagger | Evidencia HTTP 200 | Cumple | `http://localhost:8000/docs` |
| 44 | Datos recuperados | 226 usuarios, 68 docentes, 155 estudiantes y demás métricas | Cumple | Evidencia fechada en cierre |
| 45 | Seguridad de secretos | `.docker.env` ignorado y contraseñas no documentadas | Cumple | No subir tokens ni archivos de entorno |
| 46 | Licencia académica | README raíz | Cumple con observación | No sustituye licencia OSS formal |

## Pendientes Críticos

1. Crear el tag `v1.0.0` solo después de confirmar el commit final.
2. Grabar y adjuntar el enlace del video de máximo 5 minutos.
3. Confirmar en GitHub la visibilidad pública y los pull requests existentes.

## Comandos de Verificación

```bash
git status
git branch -a
git log --oneline --decorate --graph --all -30
git remote -v
git tag
```
