# 1. Introducción

## Nombre del sistema

**OptiAcademic**

## Descripción

OptiAcademic es una aplicación web full-stack para gestionar y optimizar horarios académicos universitarios. Permite generar horarios institucionales usando un motor basado en CSP (*Constraint Satisfaction Problem*) y permite que los estudiantes construyan horarios personales desde una oferta académica publicada.

## Problema que resuelve

La generación manual de horarios puede producir:

- Cruces de docentes.
- Cruces de aulas.
- Cruces de secciones.
- Mala distribución de horarios.
- Uso ineficiente de recursos.
- Dificultad para que el estudiante construya un horario conveniente.

## Objetivo general

Desarrollar un sistema inteligente de gestión y optimización de horarios académicos que permita generar horarios institucionales y horarios personalizados para estudiantes, respetando restricciones académicas, docentes, aulas y disponibilidad.

## Objetivos específicos

- Gestionar cursos, docentes, estudiantes, aulas y secciones.
- Poblar la base de datos con la malla de Ingeniería de Sistemas e Informática.
- Generar horarios institucionales con CSP.
- Validar conflictos de docente, aula y sección.
- Publicar la oferta académica institucional.
- Permitir al estudiante generar y comparar horarios personales.
- Guardar un horario final del estudiante.
- Exportar el horario final en PDF.

## Usuarios principales

| Usuario | Función |
|---|---|
| Administrador | Control total del sistema |
| Coordinador | Gestión académica y publicación |
| Docente | Consulta de información académica |
| Estudiante | Generación y elección de horario personal |
