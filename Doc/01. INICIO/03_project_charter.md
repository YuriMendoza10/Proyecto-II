# 3. Project Charter – OptiAcademic

## 3.1 Información General

| Campo | Valor |
|------|------|
| Nombre del Proyecto | OptiAcademic |
| Tipo de Proyecto | Desarrollo de Software / Optimización (Enfoque Híbrido) |
| Gerente de Proyecto | Gamarra Moreno Daniel |
| Scrum Master | Mendoza Vilcahuaman Yuri Luigui |

---

## 3.2 Propósito del Proyecto

La institución enfrenta una crisis operativa en la planificación académica debido a la transición hacia currículos flexibles. Actualmente, la generación de horarios es manual, lenta y propensa a errores, lo que genera conflictos de horarios y subutilización de recursos.

El proyecto busca automatizar este proceso mediante un sistema basado en modelos de optimización (CSP), garantizando eficiencia, precisión y escalabilidad.

---

## 3.3 Descripción del Proyecto

OptiAcademic es un aplicativo web inteligente que automatiza la generación de horarios académicos mediante un motor de optimización basado en Satisfacción de Restricciones (CSP).

El sistema procesa variables como:
- Disponibilidad docente  
- Capacidad de aulas  
- Prerrequisitos  
- Créditos académicos  

Generando soluciones óptimas y libres de conflictos en tiempo real.

---

## 3.4 Alcance del Proyecto

- Modelado del problema mediante CSP  
- Desarrollo de plataforma web escalable  
- Gestión de usuarios, aulas y cursos  
- Validación automática de reglas académicas  
- Generación de reportes en PDF y Excel  

---

## 3.5 Beneficios Esperados

- Reducción del tiempo de generación de horarios a ≤ 120 segundos  
- Eliminación de conflictos de horarios (docentes y aulas)  
- Optimización del uso de infraestructura  
- Mejora en la experiencia de matrícula  

---

## 3.6 Requisitos de Alto Nivel

| Requisito | Criterio de Éxito |
|----------|----------------|
| Optimización automática | Generación de horarios sin conflictos en ≤ 120 segundos |
| Rendimiento | Procesamiento de una facultad en ≤ 2 minutos |
| Seguridad | Cifrado de datos y control de acceso por roles |
| Escalabilidad | Soporte ≥ 400 usuarios concurrentes |
| Integridad | Validación correcta de prerrequisitos y créditos |

---

## 3.7 Hitos del Proyecto

- H1: Definición del modelo CSP  
- H2: Desarrollo base (CRUD)  
- H3: Integración del motor de optimización  
- H4: Pruebas (seguridad, estrés, usabilidad)  
- H5: Despliegue final  

---

## 3.8 Riesgos del Proyecto

| Riesgo | Impacto | Mitigación |
|------|--------|-----------|
| Complejidad del CSP | Alto | Optimización de algoritmo |
| Datos inconsistentes | Medio | Limpieza y normalización |
| Retrasos en validación | Medio | Reuniones periódicas |
| Vulnerabilidades | Alto | Auditorías de seguridad |

---

## 3.9 Estimación de Costos

| Rol | Horas | Costo/hora | Total |
|----|------|-----------|------|
| Backend | 120 | S/ 15 | S/ 1800 |
| Frontend | 100 | S/ 15 | S/ 1500 |
| Base de datos | 80 | S/ 15 | S/ 1200 |
| QA | 60 | S/ 15 | S/ 900 |
| **Total** | | | **S/ 5400** |

---

## 3.10 Stakeholders

| Nombre | Rol | Responsabilidad |
|-------|----|---------------|
| Scrum Master | Facilitador | Gestión ágil |
| Equipo Dev | Desarrollo | Implementación |
| Product Owner | Cliente | Validación |

---

## 3.11 Supuestos

- Disponibilidad de datos académicos  
- Equipo con conocimiento técnico  
- Retroalimentación constante del cliente  
- Infraestructura estable  

---

## 3.12 Restricciones

### Generales
- Tiempo limitado por calendario académico  
- Uso de herramientas gratuitas  
- Plataforma web obligatoria  

### Restricciones del Modelo CSP
- Un docente no puede dictar dos cursos simultáneamente  
- Un aula no puede ser asignada a múltiples cursos en el mismo horario  
- Se deben respetar prerrequisitos académicos  
- La capacidad del aula debe ser suficiente  
- No deben existir conflictos en la matrícula  

---

## 3.13 Aprobación

| Nombre | Cargo | Fecha |
|-------|------|------|
| Gamarra Moreno Daniel | Patrocinador | 03/04/2026 |
