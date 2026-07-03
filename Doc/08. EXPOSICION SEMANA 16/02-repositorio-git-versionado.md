# Parte 2 - Repositorio, Git y Versionado

## Responsable

Mendoza Vilcahuaman Yuri Luigui.

## Objetivo de esta parte

Demostrar que el proyecto cuenta con un repositorio estable, control de
versiones, flujo de ramas e identificación semántica del PMV.

## Resumen de lo que se hizo

El repositorio oficial compartido con el docente es
<https://github.com/YuriMendoza10/Proyecto-II.git>. El equipo utilizó Git para
registrar el desarrollo progresivo mediante ramas y commits descriptivos.

Se documentó Feature Branch Workflow para organizar funcionalidades,
correcciones, pruebas y documentación antes de integrarlas en `main`. También
se definió el uso de versionado semántico `MAJOR.MINOR.PATCH`, identificando el
PMV esperado como `v1.0.0`.

## Qué criterio de la rúbrica cumple

- Gestión del repositorio GitHub y URL estable.
- Control de versiones Git.
- Uso de ramas.
- Commits significativos.
- Pull requests o integración documentada.
- Flujo de trabajo definido.
- Versionado semántico.
- Tag `v1.0.0`.

## Evidencia resumida

El historial local y remoto contiene ramas, commits progresivos e integración
documentada. Los documentos de planificación explican el flujo de trabajo y
los criterios de SemVer.

Los comandos `git tag` y `git ls-remote --tags origin` confirman que el tag
exacto `v1.0.0` existe localmente y está publicado en GitHub. El PMV cuenta con
la identificación semántica solicitada.

## Dónde está la evidencia completa

- Repositorio GitHub, pestañas Commits, Branches, Pull requests y Tags.
- `Doc/02. PLANIFICACION/flujo-trabajo-git.md`.
- `Doc/02. PLANIFICACION/versionado-semantico.md`.
- Comandos `git log --oneline --all`, `git branch -a` y `git tag`.

## Cómo explicarlo al docente

> En esta parte mostramos que el proyecto se gestionó con Git y GitHub en un
> repositorio estable compartido con el docente. Se utilizaron ramas y commits
> descriptivos para evidenciar el desarrollo progresivo, aplicando Feature
> Branch Workflow para integrar cambios revisados hacia `main`. Esto se
> evidencia en el historial, las ramas y la integración documentada, además de
> los archivos de planificación. También definimos versionado semántico para
> identificar el PMV como `v1.0.0`. Con esto cumplimos la gestión del
> repositorio, control de versiones y flujo de trabajo. El comando `git tag`
> confirma que `v1.0.0` existe localmente y también está publicado en GitHub.

## Qué mostrar durante la exposición

- Página principal del repositorio GitHub.
- Historial de commits y ramas.
- Tags disponibles.
- `flujo-trabajo-git.md`.
- `versionado-semantico.md`.

## Transición a la siguiente parte

> Después de revisar la gestión del repositorio, ahora se explicará cómo está
> organizada técnicamente la arquitectura del sistema.
