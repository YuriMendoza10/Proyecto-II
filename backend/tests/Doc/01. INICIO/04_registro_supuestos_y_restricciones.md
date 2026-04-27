# 4. Registro de Supuestos y Restricciones del Proyecto

---

## 4.1 Supuestos

| Código | Supuesto | Impacto | Justificación |
|-------|---------|--------|--------------|
| SUP-01 | La institución proporcionará la data académica en formatos procesables (CSV, JSON, Excel) | Alto | El sistema depende de datos estructurados para ejecutar el modelo CSP |
| SUP-02 | El motor CSP podrá procesar las restricciones en tiempos aceptables | Muy Alto | Es crítico para cumplir los requisitos de rendimiento del sistema |
| SUP-03 | El equipo mantendrá disponibilidad durante los Sprints | Medio | Asegura cumplimiento del cronograma |
| SUP-04 | Los requerimientos iniciales no sufrirán cambios radicales | Medio | Permite estabilidad en el desarrollo del núcleo del sistema |

---

## 4.2 Restricciones del Proyecto

### 4.2.1 Restricciones Generales

| Código | Restricción | Categoría |
|-------|------------|----------|
| RES-01 | El proyecto debe ser entregado antes de la semana 16 | Tiempo |
| RES-02 | Uso exclusivo de herramientas gratuitas u open source | Costo |
| RES-03 | Cumplimiento de ISO/IEC 25010 | Calidad |
| RES-04 | El sistema debe ser web | Alcance |
| RES-05 | Cumplir reglamento académico | Legal |

---

## 4.2.2 Restricciones Técnicas (Sistema)

- El sistema debe soportar al menos 400 usuarios concurrentes  
- El tiempo de respuesta no debe exceder 2 minutos  
- Debe garantizar seguridad mediante autenticación y cifrado  
- La arquitectura debe ser escalable  

---

## 4.2.3 Restricciones del Modelo de Optimización (CSP)

### Restricciones duras (Hard Constraints)

- Un docente no puede dictar dos cursos en el mismo horario  
- Un aula no puede ser asignada a más de un curso simultáneamente  
- Se deben respetar los prerrequisitos académicos  
- La capacidad del aula debe ser mayor o igual al número de estudiantes  
- No deben existir conflictos en la matrícula de un estudiante  

---

### Restricciones blandas (Soft Constraints)

- Minimizar huecos en horarios de docentes  
- Maximizar uso eficiente de aulas  
- Priorizar horarios continuos para estudiantes  
- Balancear carga académica  

---

## 4.2.4 Restricciones Operativas

- Disponibilidad limitada de docentes  
- Variabilidad en la matrícula  
- Cambios en reglas académicas  

---

## 4.2.5 Restricciones de Negocio

- Optimizar uso de recursos físicos  
- Reducir tiempos administrativos  
- Mejorar experiencia del usuario  

---

## 4.3 Análisis

Las restricciones identificadas evidencian que el problema no es trivial, ya que involucra múltiples variables interdependientes y condiciones que deben cumplirse simultáneamente.

Esto justifica el uso de modelos de optimización como CSP y el enfoque híbrido definido en el proyecto.
