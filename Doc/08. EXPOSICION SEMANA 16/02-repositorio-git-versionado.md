# Parte 2 - Repositorio, Git y Versionado

## Responsable Sugerido

**Mendoza Vilcahuaman Yuri Luigui**

## Criterios de Rúbrica que Cubre

- Gestión del repositorio GitHub y URL estable.
- Control de versiones, ramas y commits significativos.
- Pull requests o integración documentada.
- Feature Branch Workflow.
- Versionado semántico y tag `v1.0.0`.

## Qué Debe Explicar

- Repositorio: <https://github.com/YuriMendoza10/Proyecto-II.git>.
- Git conserva el desarrollo progresivo mediante commits descriptivos.
- Las ramas aíslan funcionalidades, correcciones, pruebas y documentación.
- `main` representa la línea estable después de integración.
- El flujo elegido es Feature Branch Workflow.
- El PMV debe identificarse con SemVer como `v1.0.0`.

> **Pendiente crítico:** el comando `git tag` no muestra todavía el tag exacto
> `v1.0.0`. No afirmar durante la exposición que ya existe.

## Qué Debe Mostrar

1. Repositorio GitHub: commits, ramas y tags.
2. [Flujo de trabajo Git](../02.%20PLANIFICACION/flujo-trabajo-git.md).
3. [Versionado semántico](../02.%20PLANIFICACION/versionado-semantico.md).

Comandos de apoyo:

```bash
git log --oneline --decorate --graph --all -30
git branch -a
git tag
```

## Guion Breve Sugerido

> El proyecto se gestionó en GitHub mediante Git, usando ramas, commits
> descriptivos y un flujo Feature Branch Workflow. Este enfoque permite
> trabajar cambios de funcionalidad, pruebas y documentación de forma aislada,
> para después integrarlos a `main` como rama estable. El historial evidencia
> una evolución progresiva y existe integración documentada mediante pull
> request. También se definió versionado semántico: el PMV corresponde a
> `v1.0.0`, las mejoras compatibles incrementan MINOR y las correcciones PATCH.
> El tag exacto `v1.0.0` permanece pendiente antes de la entrega final.

## Conexión con la Parte 3

> Después de revisar la gestión del repositorio, ahora se explicará cómo está
> organizada técnicamente la arquitectura del sistema.
