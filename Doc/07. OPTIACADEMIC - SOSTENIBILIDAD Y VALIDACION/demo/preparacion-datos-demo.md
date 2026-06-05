# Preparación de Datos Demo

OptiAcademic incluye una preparación demo completa para que la generación
institucional de horarios funcione sin entrar manualmente a MySQL durante la
presentación.

## Flujo Recomendado

1. Iniciar sesión como administrador.
2. Ir a **Horarios → Generación institucional**.
3. Seleccionar la fuente **Oferta académica moderna**.
4. Presionar **Preparar datos demo completo**.
5. Ejecutar **Vista previa**.
6. Generar horario.
7. Guardar la solución.
8. Publicar mediante el flujo seguro.

## Qué Prepara El Sistema

- Período académico activo.
- Programa y plan curricular activos.
- Ofertas académicas por ciclo.
- Docentes demo activos si faltan.
- Aulas demo activas si faltan.
- Disponibilidad docente básica.
- Estado de ofertas en `APPROVED` para generación.

## Comando Alternativo Para Desarrollo

```powershell
docker compose --env-file .env.docker.example exec backend python seed_uc_isi_offerings_ready_demo.py
```

Este comando es idempotente y puede ejecutarse varias veces sin duplicar datos
críticos.

## Nota Para Sustentación

Durante la presentación no es necesario ejecutar consultas SQL ni modificar
datos directamente. La pantalla de generación institucional prepara y valida
la información desde la interfaz.
