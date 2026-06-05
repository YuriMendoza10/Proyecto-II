# 3. Casos de prueba backend

## CP-BE-001: Login correcto

| Campo | Descripción |
|---|---|
| Módulo | Autenticación |
| Precondición | Usuario registrado y activo |
| Entrada | Email y contraseña válidos |
| Resultado esperado | Token JWT y datos del usuario |

## CP-BE-002: Login incorrecto

| Campo | Descripción |
|---|---|
| Módulo | Autenticación |
| Entrada | Contraseña incorrecta |
| Resultado esperado | Error 401 Unauthorized |

## CP-BE-003: Acceso sin token

| Campo | Descripción |
|---|---|
| Módulo | Seguridad |
| Entrada | Petición a endpoint protegido sin token |
| Resultado esperado | Error 401 o 403 |

## CP-BE-004: Listar cursos

| Campo | Descripción |
|---|---|
| Módulo | Cursos |
| Precondición | Base de datos poblada |
| Resultado esperado | Lista de cursos con código, nombre, ciclo y créditos |

## CP-BE-005: Crear horario base

| Campo | Descripción |
|---|---|
| Módulo | Horarios |
| Entrada | Nombre, periodo académico y tipo |
| Resultado esperado | Horario institucional creado |

## CP-BE-006: Diagnóstico CSP institucional

| Campo | Descripción |
|---|---|
| Módulo | CSP institucional |
| Entrada | schedule_id y periodo académico |
| Resultado esperado | Diagnóstico con secciones programables y problemáticas |

## CP-BE-007: Generar horario institucional

| Campo | Descripción |
|---|---|
| Módulo | CSP institucional |
| Entrada | Configuración CSP |
| Resultado esperado | Una o más soluciones generadas |

## CP-BE-008: Publicar horario sin bloques

| Campo | Descripción |
|---|---|
| Módulo | Publicación |
| Entrada | schedule_id sin bloques |
| Resultado esperado | Error de validación |

## CP-BE-009: Publicar horario con bloques

| Campo | Descripción |
|---|---|
| Módulo | Publicación |
| Entrada | schedule_id con bloques válidos |
| Resultado esperado | Horario publicado correctamente |

## CP-BE-010: Obtener oferta estudiantil

| Campo | Descripción |
|---|---|
| Módulo | Student CSP |
| Precondición | Horario publicado |
| Resultado esperado | Cursos y bloques disponibles para estudiante |
