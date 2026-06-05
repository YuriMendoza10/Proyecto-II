# 2. Actores del sistema

## 2.1 Actores principales

| Actor | Descripción |
|---|---|
| Administrador | Usuario con control general del sistema |
| Coordinador académico | Usuario encargado de gestionar la programación académica |
| Docente | Usuario que dicta cursos y tiene disponibilidad horaria |
| Estudiante | Usuario que visualiza la oferta y genera su horario personal |

## 2.2 Administrador

El administrador tiene acceso a la gestión completa del sistema.

### Responsabilidades

- Gestionar usuarios.
- Gestionar docentes.
- Gestionar estudiantes.
- Gestionar cursos.
- Gestionar aulas.
- Gestionar secciones.
- Ejecutar generación institucional de horarios.
- Publicar horarios.
- Revisar indicadores y calidad del sistema.

## 2.3 Coordinador académico

El coordinador académico apoya la programación institucional.

### Responsabilidades

- Revisar datos académicos.
- Validar secciones.
- Ejecutar diagnóstico CSP.
- Generar horarios institucionales.
- Revisar conflictos.
- Publicar oferta académica.

## 2.4 Docente

El docente participa como recurso académico dentro del sistema.

### Responsabilidades

- Consultar información relacionada a su horario.
- Mantener disponibilidad horaria registrada.
- Dictar cursos asignados.

## 2.5 Estudiante

El estudiante consume la oferta académica publicada y genera su horario personal.

### Responsabilidades

- Iniciar sesión.
- Revisar oferta académica.
- Seleccionar cursos.
- Configurar preferencias.
- Generar alternativas de horario.
- Elegir horario final.
- Exportar horario.

## 2.6 Matriz de permisos por actor

| Funcionalidad | Admin | Coordinador | Docente | Estudiante |
|---|---:|---:|---:|---:|
| Iniciar sesión | Sí | Sí | Sí | Sí |
| Gestionar usuarios | Sí | No | No | No |
| Gestionar docentes | Sí | Sí | No | No |
| Gestionar estudiantes | Sí | Sí | No | No |
| Gestionar cursos | Sí | Sí | No | No |
| Gestionar aulas | Sí | Sí | No | No |
| Gestionar secciones | Sí | Sí | No | No |
| Generar horario institucional | Sí | Sí | No | No |
| Publicar horario | Sí | Sí | No | No |
| Ver oferta académica | Sí | Sí | Sí | Sí |
| Generar horario personal | No | No | No | Sí |
| Guardar horario final | No | No | No | Sí |
| Exportar PDF | No | No | No | Sí |
