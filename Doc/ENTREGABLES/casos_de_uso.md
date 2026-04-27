# CASOS DE USO – SISTEMA OPTIACADEMIC

## 1. Actores del sistema

- **Administrador académico**: Responsable de la configuración y validación de horarios.
- **Docente**: Registra su disponibilidad académica.
- **Estudiante**: Realiza matrícula y consulta su horario.
- **Sistema (Aplicación web)**: Procesa, valida y gestiona la información académica.

---

## CU-01: Configurar información académica

**Actor:** Administrador académico  
**Objetivo:** Registrar y preparar la información base del sistema  

### Precondición
Administrador autenticado

### Flujo principal
1. El administrador inicia sesión  
2. Registra cursos (nombre, créditos, prerrequisitos)  
3. Registra aulas (capacidad, tipo)  
4. Define horarios base y reglas académicas  
5. El sistema valida:
   - Consistencia de datos  
   - Relaciones entre cursos  
   - Integridad de la información  
6. El sistema almacena la información  

### Resultado
Datos académicos válidos preparados para la generación de horarios  

---

## CU-02: Registrar disponibilidad docente

**Actor:** Docente  
**Objetivo:** Registrar horarios disponibles para dictado  

### Precondición
Docente autenticado  

### Flujo principal
1. El docente accede al sistema  
2. Registra días y horas disponibles  
3. El sistema valida:
   - Duplicidad de horarios  
   - Formato correcto  
4. El sistema almacena la disponibilidad  

### Resultado
Disponibilidad docente registrada y validada  

---

## CU-03: Registrar matrícula

**Actor:** Estudiante  
**Objetivo:** Seleccionar cursos académicos  

### Precondición
Estudiante autenticado  

### Flujo principal
1. El estudiante inicia sesión  
2. Visualiza la oferta académica  
3. Selecciona cursos  
4. El sistema valida:
   - Prerrequisitos  
   - Coherencia académica  
5. El sistema registra la matrícula  
6. El sistema consolida la demanda  

### Resultado
Demanda académica registrada correctamente  

---

## CU-04: Generar horarios

**Actor:** Administrador académico  
**Objetivo:** Generar horarios académicos sin conflictos  

### Precondición
Información académica registrada  

### Flujo principal
1. El administrador solicita generar horarios  
2. El sistema recopila:
   - Cursos  
   - Aulas  
   - Disponibilidad docente  
   - Matrícula  
3. El sistema procesa la información  
4. El sistema valida:
   - Ausencia de cruces de horario  
   - Capacidad de aulas  
   - Disponibilidad docente  
5. El sistema genera una propuesta de horarios  
6. El sistema muestra los resultados  

### Resultado
Horarios generados correctamente sin conflictos  

---

## CU-05: Validar y ajustar horarios

**Actor:** Administrador académico  
**Objetivo:** Revisar y optimizar horarios generados  

### Precondición
Horarios generados  

### Flujo principal
1. El administrador visualiza los horarios  
2. Identifica conflictos o mejoras  
3. Realiza modificaciones manuales  
4. El sistema valida:
   - Conflictos de horario  
   - Consistencia de cambios  
5. El sistema guarda los ajustes  

### Resultado
Horario final validado y optimizado  

---

## CU-06: Consultar horarios

**Actor:** Estudiante / Docente  
**Objetivo:** Visualizar horarios asignados  

### Precondición
Usuario autenticado  

### Flujo principal
1. El usuario inicia sesión  
2. Solicita visualizar su horario  
3. El sistema procesa la solicitud  
4. El sistema muestra el horario en formato calendario  

### Resultado
Horario accesible y visualizado correctamente  

---

## 2. Cobertura funcional del sistema

Los casos de uso definidos cubren:

- Configuración del sistema académico  
- Registro de disponibilidad docente  
- Proceso de matrícula estudiantil  
- Generación automatizada de horarios  
- Validación y ajuste manual  
- Consulta de información académica  

Estos procesos representan el flujo completo del sistema desde la configuración inicial hasta la interacción final del usuario.

---
