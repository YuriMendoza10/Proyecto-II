# Constitution del sistema - OptiAcademic

## Mision

Generar horarios academicos validos, trazables y editables, optimizando el uso de docentes, grupos y salones en una institucion educativa.

## Restricciones duras

1. Un docente no puede aparecer en dos asignaciones simultaneas.
2. Un grupo no puede tener dos cursos en el mismo bloque.
3. Un salon no puede albergar mas de un curso por bloque.
4. La carga total de un docente no puede superar sus horas maximas semanales.
5. Toda sesion debe ocupar bloques consecutivos.
6. La generacion debe respetar la disponibilidad declarada del docente.

## Restricciones blandas

1. Priorizar dias preferidos del curso.
2. Reducir huecos innecesarios en la carga docente.
3. Evitar concentrar demasiadas sesiones del mismo curso en un solo dia.
4. Favorecer una distribucion equilibrada de uso de salones.

## Principios de implementacion

1. Separar interfaz, API y motor de reglas.
2. Validar antes de persistir.
3. Mantener trazabilidad entre documento, prueba y comportamiento.
4. Diseñar el prototipo para crecer sin romper el nucleo del algoritmo.

## Soporte conceptual

El concepto de Google Antigravity se usa aqui como referencia de trabajo ligero y validacion temprana: menos retorica, mas comportamiento observable y medible.
