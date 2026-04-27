# Especificación Técnica (Spec) - Motor CSP

## 1. Definición de Entradas (Inputs)
- **Aulas:** Lista de objetos con ID, nombre y capacidad.
- **Cursos:** Lista de objetos con código, nombre y horas requeridas.
- **Dominios:** Combinación de [Día, Hora, Aula].

## 2. Definición de Salidas (Outputs)
- **Mapa de Asignación:** JSON que relaciona cada ID de Curso con una terna [Día, Hora, Aula].
- **Estatus:** "Exitoso" o "Fallo por inconsistencia" (si no hay suficientes aulas).

## 3. Casos de Prueba Verificables
- **Caso A:** 2 cursos y 1 aula disponible -> El sistema debe arrojar error o asignar en horarios diferentes.
- **Caso B:** Carga de 10 cursos de Sistemas -> El sistema debe generar la tabla completa en < 2 segundos.
