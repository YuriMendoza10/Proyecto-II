# spec.md — OptiAcademic

Especificación Formal del Sistema | Versión 1.0 — MVP

---

## 1. Descripción General del Sistema

OptiAcademic es una aplicación web de tres capas (React Frontend, FastAPI Backend, MySQL) que implementa un motor de optimización CSP para la generación automática de horarios académicos. El sistema expone una API RESTful que los clientes consumen para gestionar el ciclo completo: desde la definición de entidades maestras hasta la confirmación de matrícula individual del estudiante.

---

## 2. Entradas del Sistema

### 2.1 Entidades Maestras (Inputs Permanentes)

| Entidad | Campos Clave | Responsable |
|---|---|---|
| **Docente** | `id, nombre, email, especialidad, disponibilidad[]` | Administrador |
| **Aula** | `id, codigo, capacidad, tipo (teoria/lab/taller)` | Administrador |
| **Curso** | `id, codigo, nombre, creditos, semestre, tipo, horas_semanales, prerrequisitos[]` | Coordinador |
| **Malla Curricular** | `id, carrera, ciclo, cursos[], version` | Coordinador |
| **Periodo Académico** | `id, nombre (ej: 2025-1), fecha_inicio, fecha_fin, activo` | Administrador |

### 2.2 Inputs del Motor CSP

Para ejecutar la generación automática de horarios, el motor requiere:

| Parámetro de Entrada | Descripción |
|---|---|
| Lista de cursos a programar | Conjunto de cursos activos para el periodo, con sus características. |
| Disponibilidad docente | Matriz de disponibilidad por franja: `disponible / no_disponible`. |
| Catálogo de aulas | Lista de aulas con capacidad y tipo disponibles en el periodo. |
| Restricciones duras activas | HC-01 a HC-08 definidos en `constitution.md`. |
| Pesos de restricciones blandas | Valores numéricos (0–10) para SC-01 a SC-05. |

### 2.3 Inputs de Matrícula del Estudiante

| Campo | Tipo / Validación |
|---|---|
| `estudiante_id` | Integer. Requerido. Debe existir en la BD y tener sesión activa. |
| `horario_ids[]` | Array de integers. Mínimo 1 elemento. Cada ID debe existir en horarios del periodo activo. |
| `periodo_id` | Integer. Requerido. Debe ser el periodo académico activo. |

---

## 3. Salidas del Sistema

### 3.1 Salidas del Motor CSP

| Salida | Descripción |
|---|---|
| **Horario Generado** | Asignación completa: `{curso_id, docente_id, aula_id, dia, franja_inicio, franja_fin, periodo_id}` |
| **Score de Optimización** | Float 0–100. Mide qué tan bien se satisfacen las restricciones blandas. |
| **Reporte de Conflictos** | Lista de restricciones duras que no pudieron satisfacerse (si el resultado es UNSAT). |
| **Tiempo de Procesamiento** | Milisegundos que tomó el algoritmo. Debe ser `<= 2000ms`. |

### 3.2 Salidas del Módulo de Matrícula

| Endpoint | Respuesta Exitosa (HTTP 200) |
|---|---|
| `POST /api/v1/matricular` | `{matriculas_realizadas: int, cursos: [{curso_id, curso_nombre, franja, aula, docente, creditos}], total_creditos: int}` |
| `GET /api/v1/mi-horario` | Array de `{matricula_id, curso_id, curso_codigo, curso_nombre, creditos, franja, aula, docente, seccion}` |
| `GET /api/v1/cursos` | Array de `{id, codigo, nombre, creditos, semestre, tipo, horas_semanales, max_estudiantes}` |
| `GET /api/v1/exportar/mi-horario-pdf` | Blob PDF con el horario semanal del estudiante autenticado. |

---

## 4. Reglas de Negocio Detalladas

### 4.1 Reglas del Proceso de Matrícula

| ID Regla | Descripción | Error si se viola |
|---|---|---|
| **RN-MAT-01** | El total de créditos seleccionados debe estar entre 7 y 25 (inclusivo). | `HTTP 400: 'Creditos fuera de rango permitido'` |
| **RN-MAT-02** | No se permite matrícula en un curso que ya está en el horario activo del estudiante. | `HTTP 400: 'Ya matriculado en este curso'` |
| **RN-MAT-03** | No se puede matricular en dos cursos con la misma franja horaria. | `HTTP 400: 'Conflicto de horario detectado'` |
| **RN-MAT-04** | El curso debe estar en la oferta del periodo académico activo. | `HTTP 404: 'Curso no disponible en periodo activo'` |
| **RN-MAT-05** | El estudiante debe haber aprobado todos los prerrequisitos del curso. | `HTTP 403: 'Prerrequisitos no cumplidos: [lista]'` |
| **RN-MAT-06** | El cupo del curso no puede estar lleno. | `HTTP 409: 'Cupo agotado para este curso'` |

### 4.2 Reglas del Motor CSP

| ID Regla | Descripción | Comportamiento |
|---|---|---|
| **RN-CSP-01** | Variables: cada curso a programar es una variable. | Dominio inicial = todas las combinaciones `[dia, franja, aula, docente]` posibles. |
| **RN-CSP-02** | Aplicar Arc-Consistency (AC-3) antes de backtracking. | Reduce el dominio eliminando valores que violan HC-01 a HC-08. |
| **RN-CSP-03** | Usar heurística MRV (Minimum Remaining Values) para selección de variable. | El curso con menor número de asignaciones posibles se procesa primero. |
| **RN-CSP-04** | Si el algoritmo alcanza timeout (2000ms), retorna la solución parcial más óptima encontrada. | Incluye reporte de cursos no asignados con flag `timeout: true`. |

---

## 5. Casos Límite (Edge Cases)

### 5.1 Casos Límite de Matrícula

| Caso | Escenario | Comportamiento Esperado |
|---|---|---|
| **EC-MAT-01** | Estudiante intenta confirmar con exactamente 7 créditos. | ✅ Permitido. Es el mínimo válido. |
| **EC-MAT-02** | Estudiante intenta confirmar con exactamente 25 créditos. | ✅ Permitido. Es el máximo válido. |
| **EC-MAT-03** | Estudiante intenta confirmar con 26 créditos. | ❌ Bloqueado. Error RN-MAT-01. |
| **EC-MAT-04** | Dos estudiantes intentan matricularse en el último cupo disponible simultáneamente. | El primero en commit de BD confirma. El segundo recibe `HTTP 409`. |
| **EC-MAT-05** | Estudiante sin SIS101 aprobado intenta cursar SIS201 (prerrequisito: SIS101). | ❌ Bloqueado por HC-05 / RN-MAT-05. |
| **EC-MAT-06** | Matrícula fuera del periodo activo. | ❌ `HTTP 403: 'El periodo de matrícula no está activo'`. |

### 5.2 Casos Límite del Motor CSP

| Caso | Escenario | Comportamiento Esperado |
|---|---|---|
| **EC-CSP-01** | No hay docentes disponibles para un curso en ninguna franja. | El curso queda sin asignar. Se reporta como UNSAT parcial con razón explícita. |
| **EC-CSP-02** | Todas las aulas tipo laboratorio están ocupadas. | El curso de laboratorio queda sin asignar. No se asigna a aula tipo teoría. |
| **EC-CSP-03** | La malla tiene más cursos que franjas disponibles. | El algoritmo genera el máximo posible sin violar restricciones duras y reporta los excluidos. |
| **EC-CSP-04** | Docente marca disponibilidad 0 para toda la semana. | El sistema alerta al Coordinador. El docente no puede ser asignado. |
| **EC-CSP-05** | El motor supera 2000ms de procesamiento. | Se retorna la mejor solución parcial encontrada con `timeout: true`. |

---

## 6. Flujos Principales del Sistema

### 6.1 Flujo: Generación Automática de Horarios (Admin / Coordinador)

1. Administrador activa el periodo académico en el sistema.
2. Coordinador carga/verifica la malla curricular para el periodo.
3. Docentes registran su disponibilidad semanal a través del módulo de disponibilidad.
4. Coordinador inicia la generación desde el panel de administración.
5. El backend valida que existan suficientes recursos (aulas, docentes) para los cursos.
6. El motor CSP ejecuta **AC-3 + Backtracking con MRV**.
7. Si `score >= 80%`: el horario se persiste automáticamente. Si `score < 80%`: se presenta al Coordinador para ajuste manual.
8. El horario queda disponible para la matrícula estudiantil.

### 6.2 Flujo: Matrícula del Estudiante

1. Estudiante se autentica (JWT).
2. El sistema carga la oferta académica del periodo activo (`GET /api/v1/cursos`).
3. El frontend filtra cursos ya matriculados y valida prerrequisitos en tiempo real.
4. Estudiante selecciona cursos. El frontend detecta conflictos de horario instantáneamente.
5. Estudiante hace clic en **"Confirmar Matrícula"**. El frontend valida: créditos en `[7, 25]`, cero conflictos.
6. `POST /api/v1/matricular`: el backend re-valida todas las reglas RN-MAT-01 a RN-MAT-06.
7. Si exitoso: respuesta con resumen. El estudiante puede exportar su horario en PDF.

---

## 7. Requisitos No Funcionales

| ID | Descripción | Métrica |
|---|---|---|
| **RNF-01** Rendimiento | Motor CSP genera horario completo. | `<= 2,000 ms` para malla estándar (30 cursos). |
| **RNF-02** Latencia API | Endpoints REST responden bajo carga normal. | `<= 500 ms` por request. |
| **RNF-03** Concurrencia | Múltiples matrículas simultáneas sin deadlocks. | 50 usuarios concurrentes sin errores de concurrencia. |
| **RNF-04** Eficiencia | El algoritmo no satura CPU ni desborda memoria. | CPU `< 80%`, RAM `< 512MB` durante generación. |
| **RNF-05** Confiabilidad | Desarrollo guiado por pruebas (TDD). | Cobertura de pruebas `>= 80%` en lógica de negocio crítica. |
| **RNF-06** Seguridad | Autenticación y autorización por roles. | JWT con expiración 24h. RBAC por actor. |
| **RNF-07** Usabilidad | El estudiante completa la matrícula sin asistencia. | `<= 5 pasos` para confirmar matrícula desde login. |

---

## 8. Coherencia entre Spec y Arquitectura

| Componente | Tecnología | Especificaciones que Implementa |
|---|---|---|
| **Frontend SPA** | React + Vite + Tailwind CSS | Flujo 6.2, RNF-07, validación en tiempo real de HC-04 / HC-06 |
| **API REST** | FastAPI (Python) | Endpoints sección 3.2, validación RN-MAT-01 a RN-MAT-06 |
| **Motor CSP** | Python (constraint library) | HC-01 a HC-08, SC-01 a SC-05, RN-CSP-01 a RN-CSP-04 |
| **Base de Datos** | MySQL + SQLAlchemy | Integridad referencial, concurrencia RNF-03, auditoría |
| **Autenticación** | JWT (python-jose) | RNF-06, sesión activa (RN-MAT-01) |
| **Exportación PDF** | ReportLab / WeasyPrint | `GET /api/v1/exportar/mi-horario-pdf` |

