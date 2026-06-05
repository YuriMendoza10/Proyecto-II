# 6. Evidencias de prueba

## 6.1 Checklist de validación local

| Validación | Estado |
|---|---|
| Backend ejecuta correctamente | Pendiente / Aprobado |
| Frontend ejecuta correctamente | Pendiente / Aprobado |
| MySQL conectado | Pendiente / Aprobado |
| Alembic ejecutado | Pendiente / Aprobado |
| Seed ejecutado | Pendiente / Aprobado |
| Admin puede iniciar sesión | Pendiente / Aprobado |
| Estudiante puede iniciar sesión | Pendiente / Aprobado |
| Diagnóstico CSP funciona | Pendiente / Aprobado |
| Horario institucional se genera | Pendiente / Aprobado |
| Horario institucional se publica | Pendiente / Aprobado |
| Estudiante ve oferta publicada | Pendiente / Aprobado |
| Estudiante genera alternativas | Pendiente / Aprobado |
| Estudiante guarda horario final | Pendiente / Aprobado |
| Estudiante exporta PDF | Pendiente / Aprobado |

## 6.2 Evidencia sugerida

Para sustentar la validación se recomienda guardar capturas de:

1. Swagger funcionando.
2. Login admin.
3. Dashboard admin.
4. Diagnóstico CSP.
5. Horario institucional generado.
6. Publicación exitosa.
7. Login estudiante.
8. Oferta académica.
9. Alternativas generadas.
10. Horario final.
11. PDF exportado.
12. Commits en GitHub.

## 6.3 Comandos de evidencia

```powershell
git log --oneline --decorate -10
git status
```

## 6.4 Resultado esperado final

El sistema debe demostrar el flujo completo:

```text
Admin genera y publica horario institucional
→ Estudiante visualiza oferta
→ Estudiante genera alternativas
→ Estudiante elige horario final
→ Estudiante exporta PDF
```
