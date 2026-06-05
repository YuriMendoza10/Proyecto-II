# 5. Reglas de negocio

## 5.1 Reglas generales

| Código | Regla de negocio |
|---|---|
| RN-001 | Todo usuario debe tener un rol asignado. |
| RN-002 | Solo usuarios autenticados pueden acceder a módulos protegidos. |
| RN-003 | El administrador tiene permisos completos sobre el sistema. |
| RN-004 | El coordinador puede gestionar información académica y horarios. |
| RN-005 | El estudiante solo puede generar horarios personales desde una oferta publicada. |

## 5.2 Reglas de horario institucional

| Código | Regla de negocio |
|---|---|
| RN-006 | Un horario institucional debe pertenecer a un periodo académico. |
| RN-007 | Un horario debe tener bloques antes de ser publicado. |
| RN-008 | No debe existir cruce de aula en el mismo día y hora. |
| RN-009 | No debe existir cruce de docente en el mismo día y hora. |
| RN-010 | No debe existir cruce de sección en el mismo día y hora. |
| RN-011 | Las clases deben generarse dentro del rango horario permitido. |
| RN-012 | El motor CSP debe considerar disponibilidad docente. |
| RN-013 | El sistema debe permitir generación de lunes a domingo. |

## 5.3 Reglas de horario permitido

| Código | Regla de negocio |
|---|---|
| RN-014 | La hora mínima permitida es 07:00. |
| RN-015 | La hora máxima permitida es 22:00. |
| RN-016 | Los días permitidos son lunes, martes, miércoles, jueves, viernes, sábado y domingo. |
| RN-017 | Los bloques deben tener duración válida según la configuración académica. |

## 5.4 Reglas de publicación

| Código | Regla de negocio |
|---|---|
| RN-018 | Solo un horario válido debe ser publicado. |
| RN-019 | La oferta académica visible para estudiantes debe provenir de horarios publicados. |
| RN-020 | Si no existe oferta publicada, el estudiante no debe generar horario personal. |
| RN-021 | La publicación debe indicar que el horario está activo. |

## 5.5 Reglas del estudiante

| Código | Regla de negocio |
|---|---|
| RN-022 | El estudiante debe generar horarios desde la oferta académica publicada. |
| RN-023 | El estudiante puede seleccionar cursos disponibles en la oferta. |
| RN-024 | El estudiante puede seleccionar docentes preferidos. |
| RN-025 | El estudiante puede seleccionar docentes a evitar. |
| RN-026 | El estudiante puede indicar días no disponibles. |
| RN-027 | El estudiante debe elegir una opción como horario final. |
| RN-028 | El horario final debe quedar marcado como favorito o final. |

## 5.6 Reglas de créditos

| Código | Regla de negocio |
|---|---|
| RN-029 | El mínimo de créditos para un horario estudiantil es 7. |
| RN-030 | El máximo de créditos para un horario estudiantil es 25. |
| RN-031 | El sistema debe evaluar la cercanía al objetivo de créditos del estudiante. |
| RN-032 | Las soluciones fuera del rango permitido deben considerarse no válidas o penalizadas según la configuración. |

## 5.7 Reglas de calidad

| Código | Regla de negocio |
|---|---|
| RN-033 | El sistema debe evitar concentrar excesivamente los bloques en una sola hora. |
| RN-034 | El sistema debe penalizar horarios extremos cuando sea posible. |
| RN-035 | El sistema debe priorizar soluciones sin cruces. |
| RN-036 | El sistema debe mostrar explicación o resumen de calidad para las soluciones estudiantiles. |
