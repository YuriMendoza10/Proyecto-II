# Versionado Semántico

OptiAcademic adopta el esquema **MAJOR.MINOR.PATCH** para comunicar el impacto
de cada versión.

| Versión | Criterio |
|---|---|
| `v1.0.0` | PMV funcional y estable para entrega académica |
| `v1.1.0` | Mejoras compatibles o nuevas capacidades |
| `v1.0.1` | Correcciones menores compatibles |
| `v2.0.0` | Cambios incompatibles en contratos o arquitectura |

## Estado Verificado

El comando `git tag` muestra actualmente:

```text
v1.0-entrega-final-rubrica
v1.0-entrega-rubrica
```

**Pendiente crítico: crear y subir el tag semántico `v1.0.0`.** Los tags
existentes evidencian entregas, pero no sustituyen el identificador exacto
solicitado para el PMV.

No debe crearse el tag hasta que el equipo confirme el commit definitivo de
entrega.

```bash
git tag -a v1.0.0 -m "release: PMV OptiAcademic v1.0.0"
git push origin v1.0.0
```
