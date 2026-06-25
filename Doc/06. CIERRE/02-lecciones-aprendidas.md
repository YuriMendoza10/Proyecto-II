# Informe final de lecciones aprendidas

## Introducción

Este documento registra aprendizajes obtenidos durante el desarrollo, control y cierre de OptiAcademic. Su propósito es convertir experiencias técnicas y de gestión en conocimiento reutilizable para futuros proyectos académicos de Ingeniería de Sistemas.

## Metodología de retrospectiva

La retrospectiva se elaboró a partir de:

- Incidentes técnicos registrados.
- Resultados de pruebas.
- Evidencias de Docker, SonarQube, OWASP, WCAG, SUS y testing.
- Revisión documental.
- Ajustes realizados durante las fases iterativas.

## Qué salió bien

- La arquitectura React + FastAPI + MySQL se mantuvo funcional.
- Docker Compose permitió recuperar el entorno sin borrar datos.
- Se consolidaron pruebas frontend/backend.
- SonarQube alcanzó Quality Gate Passed.
- La documentación se centralizó en `Doc/`.
- La evaluación SUS obtuvo 82.19 en piloto académico.

## Qué no salió bien

- Las credenciales Docker/MySQL quedaron desalineadas tras reinicio del entorno.
- Hubo confusión entre comandos ejecutados desde raíz y desde backend.
- La cobertura integrada de SonarQube fue menor que las coberturas específicas.
- Las pruebas E2E autenticadas dependen de variables no siempre configuradas.
- Las evidencias estuvieron dispersas y requirieron reorganización.

## Acciones correctivas aplicadas

- Se alineó `.docker.env` con el volumen MySQL existente.
- Se documentó la recuperación Docker.
- Se separaron fuentes y pruebas en SonarQube.
- Se generaron reportes de cobertura frontend y backend.
- Se documentó riesgo residual de dependencias.
- Se consolidaron evidencias de calidad integral.

## Tabla de lecciones aprendidas

| ID | Área | Situación | Impacto | Aprendizaje | Acción recomendada | Estado |
|---|---|---|---|---|---|---|
| LA-01 | Docker | Uso potencial de `down -v` | Riesgo de pérdida total de datos | Nunca borrar volúmenes sin respaldo | Usar `stop` o `up -d` | Aplicada |
| LA-02 | Configuración | `.docker.env` no coincidía con MySQL | Backend no conectaba | Las credenciales deben documentarse localmente | Mantener `.docker.env` actualizado y fuera de Git | Aplicada |
| LA-03 | SonarQube | Scanner falló por configuración/token | Retraso en evidencias | Separar fuentes, pruebas y reportes | Validar `sonar-project.properties` antes del scanner | Aplicada |
| LA-04 | Cobertura | SonarQube y coverage local difieren | Interpretación confusa | Reportar ambas métricas con explicación | Generar LCOV/XML antes del scanner | Aplicada |
| LA-05 | Evidencias | Capturas y documentos dispersos | Baja trazabilidad | La evidencia debe tener índice y ruta fija | Centralizar en `Doc/06. CIERRE/` | Aplicada |
| LA-06 | Seguridad | npm audit y pip-audit detectaron dependencias | Riesgo residual | No aplicar fixes forzados sin regresión | Actualizar en rama separada | En seguimiento |
| LA-07 | SUS | Muestra piloto limitada | Generalización parcial | Declarar nota metodológica | Ampliar muestra en laboratorio | En seguimiento |
| LA-08 | E2E | Credenciales no configuradas | Skips en pruebas autenticadas | Separar flujos públicos y autenticados | Documentar variables `E2E_*` | Aplicada |
| LA-09 | Git | Cambios de paquetes y evidencias pueden mezclarse | Riesgo de commit sucio | Revisar `git status` antes de cerrar | Commits temáticos | En seguimiento |
| LA-10 | CSP | Complejidad algorítmica alta | Riesgo de refactor | Refactorizar con pruebas focalizadas | Planificar mejoras graduales | En seguimiento |

## Oportunidades de mejora

- Automatizar verificación Docker y healthchecks.
- Ampliar pruebas de integración con base de datos aislada.
- Configurar pipeline CI/CD.
- Ejecutar Lighthouse y WCAG con capturas reales.
- Revisar Security Hotspots en SonarQube.

## Recomendaciones para futuros proyectos

1. Definir desde el inicio una matriz de evidencias.
2. Mantener archivos `.env` de ejemplo y `.env` reales separados.
3. Documentar comandos de arranque y recuperación.
4. Usar Markdown como bitácora viva de decisiones.
5. Evitar refactors amplios sin pruebas de regresión.
