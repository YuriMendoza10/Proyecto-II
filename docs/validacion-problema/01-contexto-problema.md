# 1. Contexto y definición del problema

## 1.1 Contexto del proyecto

El sistema **OptiAcademic** se desarrolla como una aplicación web orientada a la generación óptima de horarios académicos universitarios. El problema se ubica dentro del proceso mayor de **planificación académica institucional**, donde se deben coordinar cursos, secciones, docentes, aulas, días y franjas horarias.

Este proceso es crítico porque una mala planificación puede generar cruces de horarios, sobrecarga docente, mala distribución de aulas, conflictos entre secciones y dificultades para que los estudiantes organicen su carga académica.

## 1.2 Proceso mayor donde se aplica la optimización

El proceso mayor identificado es:

```text
Planificación académica institucional
```

Dentro de este proceso se realizan actividades como:

1. Definir cursos disponibles por periodo académico.
2. Crear secciones por curso.
3. Asignar docentes a secciones.
4. Registrar disponibilidad docente.
5. Registrar aulas y capacidades.
6. Generar bloques de horario.
7. Validar conflictos.
8. Publicar oferta académica.
9. Permitir que los estudiantes generen horarios personales.

La optimización contribuye a este proceso porque permite tomar decisiones más consistentes sobre la asignación de recursos académicos.

## 1.3 Problema principal

La generación manual de horarios académicos es una tarea compleja debido a la alta interdependencia entre variables.

Una decisión como asignar una sección a un día y hora específica puede afectar:

- La disponibilidad del docente.
- El uso del aula.
- La programación de otras secciones.
- La oferta disponible para estudiantes.
- La distribución de bloques durante la semana.

Por ello, el problema se clasifica como un problema de **optimización combinatoria** y **satisfacción de restricciones**.

## 1.4 Problemas específicos identificados

- Cruce de docentes en un mismo horario.
- Cruce de aulas en un mismo horario.
- Cruce de secciones.
- Aulas con capacidad o tipo no adecuado.
- Docentes sin disponibilidad en ciertas franjas.
- Concentración excesiva de clases en una misma hora.
- Dificultad para generar varias alternativas válidas.
- Dificultad para que el estudiante elija un horario sin cruces.
- Falta de trazabilidad entre horario institucional y horario personal del estudiante.

## 1.5 Justificación de la solución

El sistema web permite centralizar los datos académicos y ejecutar un motor CSP que genera horarios válidos tomando en cuenta restricciones críticas.

La solución aporta valor porque:

- Reduce errores manuales.
- Mejora el uso de recursos.
- Aumenta la velocidad de generación de horarios.
- Permite visualizar resultados.
- Facilita la toma de decisiones académicas.
- Permite al estudiante generar horarios personales a partir de una oferta publicada.
