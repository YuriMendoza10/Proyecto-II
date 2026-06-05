# 14. Mantenimiento y Git

## Repositorio

```text
https://github.com/ArweNMera/AcademiC.git
```

Rama principal:

```text
main
```

## Comandos básicos

```powershell
git status
git add .
git commit -m "mensaje del cambio"
git push
```

## No subir

- `venv/`
- `node_modules/`
- `.env`
- Bases de datos locales.
- Archivos temporales.

## Flujo recomendado

```text
1. Programar cambio.
2. Probar backend.
3. Probar frontend.
4. Revisar git status.
5. Commit.
6. Push a main.
```

## Commit sugerido para esta documentación

```powershell
git add docs
git commit -m "docs: agregar documentación completa del proyecto"
git push
```
