# Flujo de Trabajo Git

## Flujo Elegido

El equipo adopta **Feature Branch Workflow**. Cada cambio relevante se trabaja
en una rama con propósito identificable, se valida y luego se integra en
`main`, que representa la versión estable y revisable del PMV.

Este flujo es adecuado para OptiAcademic porque permite aislar funcionalidades,
correcciones, pruebas y documentación sin bloquear la evolución paralela del
frontend, backend y evidencias académicas.

## Reglas de Trabajo

1. Actualizar `main` antes de iniciar una tarea.
2. Crear una rama corta y descriptiva: `feature/`, `fix/`, `test/` o `docs/`.
3. Realizar commits pequeños, coherentes y descriptivos.
4. Ejecutar validaciones relacionadas antes de integrar.
5. Integrar mediante pull request o una revisión equivalente documentada.
6. Mantener `main` estable y evitar subir secretos o artefactos generados.
7. Eliminar o archivar ramas solo después de confirmar la integración.

## Convención de Commits

Se recomienda Conventional Commits:

| Prefijo | Uso |
|---|---|
| `feat:` | Nueva funcionalidad compatible |
| `fix:` | Corrección de defecto |
| `docs:` | Documentación |
| `test:` | Pruebas o evidencias de prueba |
| `refactor:` | Mejora interna sin cambio funcional |
| `chore:` | Configuración o mantenimiento |
| `release:` | Preparación de versión |

Ejemplo:

```text
docs: completar consigna final del repositorio PFA
```

## Evidencia Local Verificable

| Aspecto | Evidencia | Estado |
|---|---|---|
| Repositorio GitHub | Remoto `origin` apunta a `YuriMendoza10/Proyecto-II.git` | Cumple |
| Ramas | `main`, ramas de integración, corrección y respaldo visibles con `git branch -a` | Cumple |
| Commits | Historial progresivo con prefijos `docs:`, `test:`, `fix:` y `refactor:` | Cumple |
| Pull requests o integración | Merge commit `6db506f` registra la integración del PR `#1` | Cumple con evidencia local |
| Main estable | `main` coincide con `origin/main` al realizar esta revisión | Cumple |
| Documentación Markdown | Estructura por fases en `Doc/` y acceso en `docs/` | Cumple |
| Control de configuración | `.gitignore`, Docker Compose, Alembic y documentación versionada | Cumple |

Las integraciones se validan mediante historial de commits y ramas. Si existen
PRs adicionales en GitHub, deben revisarse desde la interfaz web.

## Comandos de Verificación

```bash
git branch -a
git log --oneline --decorate --graph --all -30
git tag
git remote -v
```
