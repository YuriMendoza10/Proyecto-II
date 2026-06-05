# 5. Roles y permisos

## Roles

| Rol | Descripción |
|---|---|
| `ADMIN` | Control total del sistema |
| `COORDINATOR` | Gestión académica y publicación |
| `TEACHER` | Docente |
| `STUDENT` | Estudiante |

## Autenticación

El sistema usa JWT.

```text
Login
→ Validación de credenciales
→ Generación de token
→ Consumo de endpoints protegidos
```

## Matriz de permisos

| Funcionalidad | Admin | Coordinador | Docente | Estudiante |
|---|---:|---:|---:|---:|
| Gestionar usuarios | Sí | Parcial | No | No |
| Gestionar docentes | Sí | Sí | No | No |
| Gestionar estudiantes | Sí | Sí | No | No |
| Gestionar cursos | Sí | Sí | No | No |
| Gestionar aulas | Sí | Sí | No | No |
| Generar horario institucional | Sí | Sí | No | No |
| Publicar horario | Sí | Sí | No | No |
| Ver oferta académica | Sí | Sí | Sí | Sí |
| Generar horario personal | No | No | No | Sí |
| Exportar PDF | No | No | No | Sí |
