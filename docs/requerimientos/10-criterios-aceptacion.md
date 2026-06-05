# 10. Criterios de aceptación

## 10.1 Criterios generales

| Código | Criterio de aceptación |
|---|---|
| CA-001 | El sistema debe poder ejecutarse localmente con backend, frontend y base de datos. |
| CA-002 | El usuario debe poder iniciar sesión correctamente. |
| CA-003 | El sistema debe redirigir al usuario según su rol. |
| CA-004 | El sistema debe impedir acceso a rutas no autorizadas. |
| CA-005 | La documentación debe estar disponible en la carpeta `docs`. |

## 10.2 Criterios del módulo administrador

| Código | Criterio de aceptación |
|---|---|
| CA-006 | El administrador puede visualizar el dashboard. |
| CA-007 | El administrador puede listar cursos, docentes, estudiantes y aulas. |
| CA-008 | El administrador puede generar diagnóstico CSP. |
| CA-009 | El administrador puede generar soluciones institucionales. |
| CA-010 | El administrador puede guardar una solución institucional. |
| CA-011 | El administrador puede publicar un horario institucional. |

## 10.3 Criterios del motor CSP institucional

| Código | Criterio de aceptación |
|---|---|
| CA-012 | El diagnóstico CSP debe devolver secciones programables y problemáticas. |
| CA-013 | El sistema debe mostrar razones de problemas cuando existan. |
| CA-014 | El motor no debe generar cruces de docente. |
| CA-015 | El motor no debe generar cruces de aula. |
| CA-016 | El motor no debe generar cruces de sección. |
| CA-017 | El horario generado debe estar dentro del rango 07:00 a 22:00. |
| CA-018 | El sistema debe evitar concentrar todos los bloques en una sola hora. |

## 10.4 Criterios de publicación

| Código | Criterio de aceptación |
|---|---|
| CA-019 | No se debe publicar un horario sin bloques. |
| CA-020 | Un horario publicado debe ser visible para estudiantes. |
| CA-021 | Un horario no publicado no debe ser usado para generar horarios estudiantiles. |
| CA-022 | La oferta publicada debe mostrar cursos, secciones, docentes, aulas y horarios. |

## 10.5 Criterios del módulo estudiante

| Código | Criterio de aceptación |
|---|---|
| CA-023 | El estudiante puede ver la oferta académica publicada. |
| CA-024 | El estudiante puede seleccionar cursos. |
| CA-025 | El estudiante puede configurar días no disponibles. |
| CA-026 | El estudiante puede generar alternativas de horario. |
| CA-027 | Las alternativas no deben tener cruces. |
| CA-028 | Las alternativas deben mostrar créditos. |
| CA-029 | Las alternativas deben mostrar score. |
| CA-030 | El estudiante puede elegir una opción como horario final. |
| CA-031 | El estudiante puede consultar su horario final. |
| CA-032 | El estudiante puede exportar el horario final a PDF. |

## 10.6 Criterios de datos

| Código | Criterio de aceptación |
|---|---|
| CA-033 | La base de datos debe contener cursos de Ingeniería de Sistemas. |
| CA-034 | Los cursos deben tener ciclo y créditos. |
| CA-035 | Las secciones deben estar asociadas a cursos. |
| CA-036 | Los bloques deben estar asociados a secciones. |
| CA-037 | Los horarios estudiantiles deben estar asociados a estudiantes. |

## 10.7 Criterio final de aceptación del sistema

El sistema se considera aceptado cuando permite demostrar el siguiente flujo completo:

```text
Administrador inicia sesión
→ Genera horario institucional
→ Revisa diagnóstico
→ Guarda solución
→ Publica horario
→ Estudiante inicia sesión
→ Visualiza oferta publicada
→ Selecciona cursos
→ Genera alternativas
→ Elige horario final
→ Exporta PDF
```
