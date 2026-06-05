# 7. Decisión sobre el stack técnico

## 7.1 Stack implementado en el MVP

El MVP OptiAcademic implementa una arquitectura web full-stack con las siguientes tecnologías:

```text
React + FastAPI + MySQL
```

| Capa | Tecnología usada |
|---|---|
| Frontend | React + Vite |
| Backend | FastAPI + Python |
| Base de datos | MySQL |
| ORM | SQLAlchemy |
| Motor de optimización | CSP en Python |

## 7.2 Justificación técnica

El problema desarrollado tiene una naturaleza altamente relacional y algorítmica. Por ello, el stack seleccionado se ajusta a las necesidades del sistema.

Se eligió **React** porque permite construir una interfaz modular y dinámica para distintos tipos de usuario: administrador, coordinador, docente y estudiante.

Se eligió **FastAPI** porque permite construir una API REST rápida, documentada y organizada, con validación de datos mediante Pydantic.

Se eligió **MySQL** porque el dominio académico tiene entidades fuertemente relacionadas, como cursos, secciones, docentes, aulas, horarios y estudiantes.

Se eligió **Python** para el backend porque facilita la implementación del motor CSP, la validación de restricciones y el cálculo de soluciones de horarios.

## 7.3 Comparación de alternativas técnicas

| Criterio | React + FastAPI + MySQL | Alternativas posibles |
|---|---|---|
| Interfaz web | React permite componentes reutilizables | Vue, Angular |
| API REST | FastAPI ofrece documentación automática | Express, Django REST |
| Base de datos | MySQL favorece relaciones académicas | PostgreSQL, MongoDB |
| Motor CSP | Python facilita lógica algorítmica | Node.js, Java |
| Validación de datos | Pydantic integrado | Joi, Yup, validaciones manuales |
| Documentación API | Swagger automático | Documentación manual o librerías externas |

## 7.4 Ventajas del stack seleccionado

- Separación clara entre frontend y backend.
- API REST documentada con Swagger.
- Buen soporte para modelos relacionales.
- Facilidad para implementar restricciones.
- Facilidad para crear scripts de carga de datos.
- Mantenibilidad mediante capas: endpoints, services, repositories, schemas y models.
- Interfaz moderna mediante React y Tailwind CSS.

## 7.5 Riesgos y mitigación

| Riesgo | Mitigación |
|---|---|
| Dependencia de MySQL local | Documentar configuración `.env` y creación de base de datos |
| Complejidad del motor CSP | Separar la lógica CSP en módulos propios |
| Datos insuficientes para generar horarios | Usar diagnóstico CSP y scripts seed |
| Confusión en ejecución local | Documentar pasos de instalación y credenciales |
| Cambios futuros en reglas académicas | Mantener reglas en servicios y documentación actualizada |

## 7.6 Conclusión

El stack React + FastAPI + MySQL es coherente con el problema de generación óptima de horarios académicos. Permite implementar una solución web funcional, con una base relacional sólida y un motor de optimización desarrollado en Python.

La decisión técnica se fundamenta en la naturaleza del problema, que requiere modelar entidades relacionadas y ejecutar reglas de asignación complejas.
