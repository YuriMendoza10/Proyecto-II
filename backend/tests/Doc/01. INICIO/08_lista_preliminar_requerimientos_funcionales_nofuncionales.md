# 6. Requerimientos Funcionales y No Funcionales

---

## 6.1 Visión General

OptiAcademic es un sistema web orientado a la generación automática de horarios académicos mediante un motor de optimización basado en Satisfacción de Restricciones (CSP).

El sistema gestiona usuarios, infraestructura, malla curricular y disponibilidad, generando soluciones válidas sin conflictos.

---

## 6.2 Requerimientos Funcionales (SMART)

| ID | Requerimiento | Descripción | Criterio de Aceptación |
|----|--------------|------------|----------------------|
| RF-01 | Gestión de Usuarios | Permite registrar usuarios con roles | Usuario creado y autenticable |
| RF-02 | Autenticación | Valida credenciales | Acceso concedido o denegado correctamente |
| RF-03 | Gestión de Infraestructura | Registra aulas con capacidad | Aula disponible para asignación |
| RF-04 | Gestión de Malla | Registra cursos y prerrequisitos | Cursos válidos para planificación |
| RF-05 | Gestión de Disponibilidad | Registra horarios de docentes | Datos disponibles para CSP |
| RF-06 | Motor CSP | Genera horarios sin conflictos en ≤ 5 segundos | Horario válido generado |
| RF-07 | Validación de Matrícula | Verifica conflictos y prerrequisitos | Rechazo o aprobación correcta |
| RF-08 | Edición de Horarios | Permite modificar horarios | Cambios validados sin conflicto |
| RF-09 | Visualización | Muestra horarios en formato calendario | Vista clara por días/horas |
| RF-10 | Control de Conflictos | Detecta solapamientos | Lista de conflictos generada |
| RF-11 | Reportes | Genera reportes en PDF/Excel | Archivo descargable correcto |

---

## 6.3 Priorización

- **Alta:** RF-06, RF-07, RF-05  
- **Media:** RF-01, RF-02, RF-03  
- **Baja:** RF-09, RF-11  

---

## 6.4 Requerimientos No Funcionales (ARC42)

| Categoría | Requerimiento | Métrica |
|----------|-------------|--------|
| Rendimiento | Generación CSP | ≤ 5 segundos |
| Rendimiento | Tiempo UI | ≤ 1 segundo |
| Seguridad | Cifrado | AES-256 + HTTPS |
| Seguridad | Autenticación | Bloqueo tras 5 intentos |
| Disponibilidad | Uptime | ≥ 99.5% |
| Disponibilidad | Recuperación | ≤ 30 min |
| Usabilidad | Aprendizaje | ≤ 2 horas |
| Usabilidad | Interacción | ≤ 3 clics |
| Escalabilidad | Usuarios | ≥ 1000 concurrentes |
| Mantenibilidad | Código | ≥ 80% cobertura |
| Mantenibilidad | Modularidad | ≤ 20% impacto |

---

## 6.5 Trazabilidad

| Problema | Requerimiento |
|---------|-------------|
| Conflictos de horario | RF-06, RF-10 |
| Lentitud en planificación | RF-06 |
| Errores humanos | RF-07 |
| Mala experiencia | RF-09 |

---

## 6.6 Validación

Los requerimientos cumplen criterios SMART:

- Específicos  
- Medibles  
- Alcanzables  
- Relevantes  
- Temporales  

Y están alineados con el modelo ARC42 para calidad del sistema.
