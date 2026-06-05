# 2. Análisis y validación del problema

## 2.1 Actores involucrados

| Actor | Participación en el problema |
|---|---|
| Administrador | Gestiona datos y genera horarios institucionales |
| Coordinador académico | Valida oferta, secciones y publicación del horario |
| Docente | Representa un recurso con disponibilidad limitada |
| Estudiante | Consume la oferta publicada y genera su horario personal |
| Aula | Recurso físico limitado |
| Curso | Unidad académica que debe programarse |
| Sección | Grupo específico que debe recibir asignación horaria |

## 2.2 Restricciones críticas identificadas

| Restricción | Descripción | Tipo |
|---|---|---|
| Cruce de docente | Un docente no puede dictar dos clases simultáneas | Dura |
| Cruce de aula | Un aula no puede ser usada por dos secciones simultáneamente | Dura |
| Cruce de sección | Una sección no puede tener dos bloques al mismo tiempo | Dura |
| Disponibilidad docente | El docente solo debe ser programado cuando está disponible | Dura |
| Rango horario | Las clases deben estar entre 07:00 y 22:00 | Dura |
| Días permitidos | El sistema permite programación de lunes a domingo | Dura |
| Créditos del estudiante | El horario personal debe estar entre 7 y 25 créditos | Dura / blanda según configuración |
| Docente preferido | Se favorece la elección de docentes preferidos por el estudiante | Blanda |
| Docente evitado | Se penalizan opciones con docentes evitados | Blanda |
| Distribución horaria | Se busca evitar concentración excesiva en una sola hora | Blanda |

## 2.3 Dependencias del sistema

El problema tiene dependencias directas entre entidades:

```text
Curso → Sección → Docente → Disponibilidad
Curso → Sección → Bloque de horario
Bloque de horario → Aula
Horario institucional → Oferta académica
Oferta académica → Horario personal del estudiante
```

Si una entidad no está correctamente registrada, el motor CSP puede no generar soluciones válidas.

## 2.4 Posibles conflictos asociados a la asignación de horarios

| Conflicto | Ejemplo |
|---|---|
| Docente duplicado | El mismo docente asignado lunes 08:00 en dos aulas distintas |
| Aula duplicada | Dos secciones ocupan el mismo laboratorio al mismo tiempo |
| Sección duplicada | La misma sección tiene dos clases simultáneas |
| Falta de disponibilidad | Un docente es asignado fuera de su horario disponible |
| Sin dominio CSP | Una sección no tiene combinaciones válidas de día, hora y aula |
| Sobrecarga horaria | Muchas clases concentradas en una misma franja |
| Oferta no publicada | El estudiante intenta generar horario sin oferta oficial |

## 2.5 Validación documental y técnica

La validación del problema se realiza mediante:

- Revisión de requerimientos funcionales.
- Revisión de requerimientos no funcionales.
- Identificación de actores.
- Identificación de reglas de negocio.
- Modelado mediante CSP.
- Validación de restricciones.
- Prueba del flujo institucional.
- Prueba del flujo estudiantil.
- Revisión de resultados en interfaz gráfica.

## 2.6 Conclusión del análisis

El problema de generación de horarios académicos requiere un enfoque sistemático porque involucra múltiples variables dependientes. El uso de CSP permite formalizar las restricciones y generar soluciones válidas con mayor consistencia que un proceso manual.
