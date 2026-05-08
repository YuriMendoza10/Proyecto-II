# constitution.md — OptiAcademic

> Sistema de Generación Óptima de Horarios Académicos en Entornos de Currículo Flexible

---

## 1. Identidad y Propósito del Sistema

OptiAcademic es un sistema web inteligente orientado a resolver el problema de la generación óptima de horarios académicos en instituciones de educación superior con currículo flexible. Su núcleo es un motor algorítmico basado en **Satisfacción de Restricciones (CSP)** que procesa múltiples variables —disponibilidad docente, capacidad de aulas, créditos, prerrequisitos— para garantizar horarios libres de conflictos.

| Campo | Descripción |
|---|---|
| **Misión** | Automatizar la generación de horarios académicos eliminando conflictos logísticos mediante optimización formal (CSP). |
| **Visión** | Ser la plataforma de referencia para la gestión curricular flexible en universidades latinoamericanas. |
| **Dominio** | Gestión académica universitaria con currículo por créditos. |
| **Stack** | FastAPI (Python) + React (Vite) + MySQL |

---

## 2. Actores del Sistema

| Actor | Responsabilidad Principal | Permisos Clave |
|---|---|---|
| **Estudiante** | Consultar oferta académica, seleccionar y confirmar matrícula | Leer cursos, crear/ver matrícula propia |
| **Docente** | Registrar disponibilidad horaria, consultar asignaciones | Leer/actualizar disponibilidad propia |
| **Coordinador** | Diseñar mallas curriculares, validar horarios generados | CRUD mallas, validar horarios |
| **Administrador** | Gestionar entidades maestras (aulas, docentes, periodos) | CRUD total sobre entidades maestras |

---

## 3. Principios Rectores del Sistema

### 3.1 Conflicto Cero
El sistema **NUNCA** debe generar ni permitir guardar un horario con conflictos. Un conflicto se define como cualquier situación donde dos eventos comparten simultáneamente un recurso único (docente, aula, o estudiante en un mismo grupo).

### 3.2 Transparencia Algorítmica
Toda decisión del motor CSP debe ser trazable. El sistema debe poder explicar por qué una combinación de horario fue rechazada o aceptada.

### 3.3 Respeto a la Autonomía Estudiantil
Dentro de los límites establecidos (mínimo **7 créditos**, máximo **25 créditos** por semestre), el estudiante tiene plena libertad de composición de su carga académica.

### 3.4 Rendimiento Garantizado
El motor algorítmico debe procesar y generar un horario completo para una malla estándar en un máximo de **2 segundos**. El sistema debe responder a cualquier solicitud de la interfaz en menos de **500ms** bajo carga normal.

### 3.5 Validación en Tiempo Real
Cualquier cambio manual sobre un horario ya generado es validado instantáneamente por el backend antes de ser persistido. El frontend bloquea visualmente la confirmación si existen conflictos detectados.

### 3.6 Integridad Curricular
El sistema hace cumplir la estructura de la malla curricular. Los prerrequisitos son una **restricción dura**: ningún estudiante puede matricularse en un curso si no ha aprobado sus prerrequisitos.

---

## 4. Restricciones del Sistema

### 4.1 Restricciones Duras (Hard Constraints)

Las restricciones duras son **inviolables**. Cualquier solución que las incumpla es inválida y debe ser rechazada automáticamente por el motor CSP.

| ID | Descripción |
|---|---|
| **HC-01** | Un docente no puede estar asignado a dos cursos en la misma franja horaria. |
| **HC-02** | Un aula no puede albergar dos cursos simultáneamente. |
| **HC-03** | El número de estudiantes matriculados no puede exceder la capacidad del aula. |
| **HC-04** | Un estudiante no puede estar matriculado en dos cursos con la misma franja horaria. |
| **HC-05** | No se puede matricular en un curso sin haber aprobado sus prerrequisitos. |
| **HC-06** | El total de créditos por semestre no puede ser menor a 7 ni mayor a 25. |
| **HC-07** | Las franjas horarias válidas son exclusivamente las definidas en el catálogo del sistema (07:30 – 20:40, bloques de 1.5h). |
| **HC-08** | Un curso no puede asignarse a un docente en una franja que el docente marcó como no disponible. |

### 4.2 Restricciones Blandas (Soft Constraints)

Las restricciones blandas son **preferencias** que el sistema intenta satisfacer para optimizar la calidad del horario, pero su incumplimiento no invalida la solución.

| ID | Descripción | Peso / Prioridad |
|---|---|---|
| **SC-01** | Minimizar los 'huecos' (horas libres entre clases) en el horario del estudiante. | Alta |
| **SC-02** | Distribuir la carga académica uniformemente a lo largo de la semana. | Media |
| **SC-03** | Preferir asignación de laboratorios en las últimas franjas del día. | Baja |
| **SC-04** | Evitar que un docente tenga más de 3 cursos consecutivos sin descanso. | Media |
| **SC-05** | Agrupar cursos del mismo semestre en días contiguos cuando sea posible. | Baja |

---

## 5. Reglas de Negocio Globales

1. El **periodo académico activo** define el contexto de toda operación. No se puede matricular ni generar horarios fuera del periodo vigente.
2. Los cursos tienen tipos (`teoría`, `laboratorio`, `taller`, `práctica`) que determinan los recursos físicos requeridos. Un laboratorio solo puede asignarse a aulas tipo laboratorio.
3. La malla curricular es **inmutable** durante un periodo académico activo. Solo el Coordinador puede modificarla antes del inicio del periodo.
4. Toda acción crítica genera un **registro de auditoría** con timestamp y usuario responsable.
5. El sistema opera bajo autenticación **JWT**. Los tokens expiran en 24 horas y no son renovables automáticamente.

---

## 6. Definición de Términos Clave

| Término | Definición |
|---|---|
| **Franja Horaria** | Bloque de tiempo de 1h 30min. El sistema opera con 8 franjas diarias entre 07:30 y 20:40, de lunes a sábado. |
| **Conflicto** | Situación en que dos eventos académicos compiten por un recurso único (docente, aula, cupo estudiantil) en la misma franja. |
| **CSP** | Problema de Satisfacción de Restricciones. Formalismo matemático que modela el problema de horarios como variables, dominios y restricciones. |
| **Poda (Pruning)** | Técnica algorítmica que descarta ramas del árbol de búsqueda que violan restricciones, reduciendo el espacio de búsqueda. |
| **Malla Curricular** | Conjunto estructurado de cursos con créditos, prerrequisitos y niveles que define el plan de estudios de una carrera. |
| **Periodo Académico** | Semestre o ciclo con fechas de inicio y fin dentro del cual se generan horarios y se realizan matrículas. |
