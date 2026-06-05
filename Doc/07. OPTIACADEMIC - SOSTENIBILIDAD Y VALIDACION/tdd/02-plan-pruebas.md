# 2. Plan de pruebas

## 2.1 Objetivo

Validar que el sistema OptiAcademic cumpla sus requerimientos funcionales, no funcionales y reglas de negocio principales.

## 2.2 Alcance

El plan cubre:

- Autenticación.
- Gestión académica.
- Motor CSP institucional.
- Publicación de horarios.
- Oferta académica.
- Motor CSP estudiantil.
- Horario final del estudiante.
- Exportación PDF.

## 2.3 Pruebas por módulo

| Módulo | Tipo de prueba | Prioridad |
|---|---|---|
| Login | Funcional / integración | Alta |
| Usuarios | Integración | Media |
| Cursos | Integración | Media |
| Docentes | Integración | Media |
| Aulas | Integración | Media |
| Secciones | Integración | Media |
| CSP institucional | Unitario / integración | Alta |
| Publicación | Integración | Alta |
| Oferta estudiante | Integración / funcional | Alta |
| CSP estudiante | Unitario / integración | Alta |
| PDF | Manual / funcional | Media |

## 2.4 Ambientes de prueba

| Ambiente | Descripción |
|---|---|
| Local | PC del desarrollador con MySQL local |
| Desarrollo | Proyecto ejecutado desde backend y frontend |
| Base de prueba | Base `optiacademic_db` poblada con seed |

## 2.5 Datos mínimos requeridos

Para ejecutar pruebas se necesita:

- Un usuario administrador.
- Un estudiante.
- Un docente.
- Cursos registrados.
- Secciones registradas.
- Aulas registradas.
- Disponibilidad docente.
- Un horario institucional base.
- Bloques institucionales generados.

## 2.6 Criterios de aprobación

El sistema aprueba la validación si:

- El login funciona por rol.
- El admin genera un horario institucional.
- El horario no tiene cruces críticos.
- El horario se publica correctamente.
- El estudiante ve la oferta.
- El estudiante genera alternativas.
- El estudiante guarda horario final.
- El estudiante exporta PDF.
