# Arquitectura del Sistema - OptiAcademic

## Objetivo
OptiAcademic es un sistema web inteligente para la planificación, generación, validación y publicación de horarios académicos mediante optimización basada en restricciones (CSP).

## Arquitectura General

### Frontend
- React
- Vite
- Tailwind CSS
- Axios

### Backend
- FastAPI
- Python
- SQLAlchemy
- Alembic

### Base de Datos
- MySQL

### Infraestructura
- Docker Compose

## Flujo de Funcionamiento

1. El usuario inicia sesión.
2. Gestiona cursos, docentes, aulas y estudiantes.
3. Se preparan las ofertas académicas.
4. El motor CSP genera horarios optimizados.
5. El usuario valida y publica los horarios.
6. El sistema genera reportes y auditorías.

## Roles
- Administrador
- Coordinador
- Docente
- Estudiante

## Beneficios
- Reduce conflictos de horarios.
- Optimiza recursos institucionales.
- Centraliza la gestión académica.
- Mejora la trazabilidad de decisiones.
