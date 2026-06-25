# Registro de supuestos

## Introducción

Este documento registra supuestos aceptados durante el desarrollo y cierre del proyecto, así como su validación al finalizar.

| ID | Supuesto | Área | Impacto si no se cumple | Validación durante el proyecto | Estado final |
|---|---|---|---|---|---|
| SUP-01 | Docker Desktop estará disponible para la demo | Infraestructura | La app no podrá levantarse localmente | Docker verificado con servicios activos | Validado |
| SUP-02 | `.docker.env` estará presente localmente y no se subirá a Git | Configuración | Backend no conectará o se expondrán secretos | `.docker.env` local alineado e ignorado | Validado |
| SUP-03 | El volumen MySQL conservará datos existentes | Datos | Pérdida de usuarios, horarios y bloques | Datos recuperados sin seed | Validado |
| SUP-04 | El branch principal de entrega será `main` | Git | Confusión de revisión | Rama actual revisada previamente como `main` | Validado |
| SUP-05 | El repositorio GitHub estará disponible | Gestión | No se podrá revisar historial | Pendiente de verificación final en GitHub | En seguimiento |
| SUP-06 | SonarQube local será aceptado como evidencia académica | Calidad | Evidencia incompleta | Quality Gate Passed documentado | Validado |
| SUP-07 | Los reportes de cobertura se generarán antes del scanner | Testing/calidad | Coverage no será reconocido | LCOV/XML documentados | Validado |
| SUP-08 | Participantes SUS podrán evaluar la aplicación | UX | No habría métrica de usabilidad | Piloto académico N=8 | Validado como piloto |
| SUP-09 | Pruebas E2E requerirán credenciales configuradas | Testing | Skips en rutas privadas | Skips documentados | Validado |
| SUP-10 | Herramientas open source son suficientes | Costos | Necesidad de licencias | Stack open source operativo | Validado |
| SUP-11 | Sistema evaluado en entorno local controlado | Demo | Diferencias con producción | Docker local validado | Validado |
| SUP-12 | Markdown será formato oficial de entrega | Documentación | Dificultad de trazabilidad | Documentos en `Doc/` | Validado |

## Conclusión

Los supuestos esenciales fueron validados para el entorno académico local. Los supuestos vinculados a GitHub y evidencias visuales deben revisarse antes de la sustentación final.
