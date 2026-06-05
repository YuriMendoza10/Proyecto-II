# 7. Historias de usuario

## 7.1 Administrador

### HU-001: Iniciar sesión como administrador

Como administrador, quiero iniciar sesión en el sistema para acceder a las funciones de gestión académica.

**Criterios de aceptación:**

- El sistema debe validar mis credenciales.
- El sistema debe reconocer mi rol.
- El sistema debe redirigirme al panel administrativo.

---

### HU-002: Gestionar usuarios

Como administrador, quiero registrar y administrar usuarios para controlar quién accede al sistema.

**Criterios de aceptación:**

- Puedo crear usuarios.
- Puedo listar usuarios.
- Puedo asignar roles.
- Puedo actualizar información.

---

### HU-003: Generar horario institucional

Como administrador, quiero generar un horario institucional para organizar cursos, docentes y aulas.

**Criterios de aceptación:**

- Puedo configurar parámetros de generación.
- El sistema ejecuta diagnóstico.
- El sistema genera soluciones válidas.
- El sistema muestra resultados.

---

### HU-004: Publicar horario

Como administrador, quiero publicar un horario institucional para que los estudiantes puedan usarlo.

**Criterios de aceptación:**

- El sistema valida que el horario tenga bloques.
- El sistema cambia el estado a publicado.
- El estudiante puede ver la oferta publicada.

---

## 7.2 Coordinador académico

### HU-005: Revisar diagnóstico CSP

Como coordinador, quiero revisar el diagnóstico CSP para identificar problemas antes de generar horarios.

**Criterios de aceptación:**

- El sistema muestra secciones programables.
- El sistema muestra secciones con problemas.
- El sistema muestra razones claras.
- La vista no debe estar saturada visualmente.

---

### HU-006: Validar calidad de horario

Como coordinador, quiero revisar la calidad del horario generado para decidir si debe publicarse.

**Criterios de aceptación:**

- El sistema muestra métricas.
- El sistema permite revisar bloques.
- El sistema permite detectar conflictos.

---

## 7.3 Estudiante

### HU-007: Ver oferta académica

Como estudiante, quiero ver la oferta académica publicada para saber qué cursos puedo seleccionar.

**Criterios de aceptación:**

- Solo veo horarios publicados.
- Veo cursos disponibles.
- Veo docentes, aulas y horarios.
- Puedo seleccionar cursos.

---

### HU-008: Configurar preferencias

Como estudiante, quiero configurar mis preferencias para que el sistema genere un horario más conveniente.

**Criterios de aceptación:**

- Puedo seleccionar días no disponibles.
- Puedo seleccionar docentes preferidos.
- Puedo seleccionar docentes a evitar.
- Puedo definir objetivo de créditos.

---

### HU-009: Generar alternativas

Como estudiante, quiero generar alternativas de horario para elegir la que mejor se adapte a mí.

**Criterios de aceptación:**

- El sistema genera más de una opción si es posible.
- Las opciones no deben tener cruces.
- Cada opción debe mostrar score.
- Cada opción debe mostrar cursos y créditos.

---

### HU-010: Elegir horario final

Como estudiante, quiero elegir una alternativa como mi horario final para consultarla posteriormente.

**Criterios de aceptación:**

- Puedo seleccionar una solución.
- El sistema guarda la solución.
- El sistema la marca como final.
- La puedo ver en mi dashboard.

---

### HU-011: Exportar horario

Como estudiante, quiero exportar mi horario final a PDF para guardarlo o imprimirlo.

**Criterios de aceptación:**

- El sistema genera un PDF.
- El PDF muestra cursos, aulas, docentes y horarios.
- El PDF tiene formato claro.

---

## 7.4 Docente

### HU-012: Consultar horario asignado

Como docente, quiero consultar mis horarios asignados para conocer mis clases.

**Criterios de aceptación:**

- El sistema debe mostrar cursos asignados.
- El sistema debe mostrar día y hora.
- El sistema debe mostrar aula.
