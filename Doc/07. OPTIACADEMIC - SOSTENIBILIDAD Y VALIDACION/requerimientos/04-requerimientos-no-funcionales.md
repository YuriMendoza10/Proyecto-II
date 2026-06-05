# 4. Requerimientos no funcionales

Los requerimientos no funcionales describen atributos de calidad que debe cumplir el sistema.

## 4.1 Rendimiento

| Código | Requerimiento no funcional | Prioridad |
|---|---|---|
| RNF-001 | El sistema debe responder a consultas comunes en menos de 3 segundos en ambiente local. | Media |
| RNF-002 | El motor CSP debe controlar tiempo máximo de ejecución para evitar bloqueos. | Alta |
| RNF-003 | El frontend debe cargar las páginas principales sin demoras excesivas. | Media |
| RNF-004 | Las consultas de horarios deben estar optimizadas mediante filtros por periodo y schedule_id. | Alta |

## 4.2 Seguridad

| Código | Requerimiento no funcional | Prioridad |
|---|---|---|
| RNF-005 | Las contraseñas deben almacenarse cifradas. | Alta |
| RNF-006 | El sistema debe usar JWT para proteger endpoints privados. | Alta |
| RNF-007 | El sistema debe validar roles antes de ejecutar acciones sensibles. | Alta |
| RNF-008 | El archivo `.env` no debe subirse al repositorio. | Alta |
| RNF-009 | El sistema debe evitar exponer información sensible en respuestas públicas. | Alta |

## 4.3 Usabilidad

| Código | Requerimiento no funcional | Prioridad |
|---|---|---|
| RNF-010 | La interfaz debe ser clara y fácil de usar. | Alta |
| RNF-011 | El sistema debe mostrar mensajes de éxito y error comprensibles. | Alta |
| RNF-012 | Las pantallas de diagnóstico deben evitar saturar visualmente al usuario. | Media |
| RNF-013 | El estudiante debe entender el flujo: oferta, generación, comparación y horario final. | Alta |
| RNF-014 | El sistema debe tener navegación separada por rol. | Alta |

## 4.4 Mantenibilidad

| Código | Requerimiento no funcional | Prioridad |
|---|---|---|
| RNF-015 | El backend debe estar organizado por endpoints, services, repositories, schemas y models. | Alta |
| RNF-016 | El frontend debe estar organizado por pages, components, services, stores y utils. | Alta |
| RNF-017 | La lógica CSP debe estar separada de los endpoints. | Alta |
| RNF-018 | La documentación debe mantenerse en la carpeta `docs`. | Media |
| RNF-019 | Los cambios deben versionarse usando Git. | Alta |

## 4.5 Escalabilidad

| Código | Requerimiento no funcional | Prioridad |
|---|---|---|
| RNF-020 | El sistema debe permitir agregar nuevas carreras en el futuro. | Media |
| RNF-021 | El sistema debe permitir agregar más ciclos académicos si fuera necesario. | Media |
| RNF-022 | El sistema debe permitir aumentar la cantidad de docentes, aulas y secciones. | Alta |
| RNF-023 | El motor CSP debe permitir configurar cantidad máxima de soluciones. | Alta |

## 4.6 Disponibilidad

| Código | Requerimiento no funcional | Prioridad |
|---|---|---|
| RNF-024 | El sistema debe poder ejecutarse localmente para desarrollo y exposición. | Alta |
| RNF-025 | El frontend y backend deben poder ejecutarse de forma independiente. | Alta |
| RNF-026 | El sistema debe poder reiniciarse sin pérdida de código ni configuración versionada. | Alta |

## 4.7 Compatibilidad

| Código | Requerimiento no funcional | Prioridad |
|---|---|---|
| RNF-027 | El frontend debe ejecutarse correctamente en navegadores modernos. | Alta |
| RNF-028 | El backend debe ejecutarse en Python 3.11 o versión compatible. | Alta |
| RNF-029 | El sistema debe funcionar con MySQL. | Alta |
| RNF-030 | El proyecto debe poder ejecutarse en Windows usando PowerShell. | Media |

## 4.8 Portabilidad

| Código | Requerimiento no funcional | Prioridad |
|---|---|---|
| RNF-031 | El proyecto debe poder clonarse desde GitHub y ejecutarse con instrucciones documentadas. | Alta |
| RNF-032 | Las dependencias deben estar declaradas en `requirements.txt` y `package.json`. | Alta |
| RNF-033 | La configuración sensible debe manejarse mediante variables de entorno. | Alta |

## 4.9 Calidad de datos

| Código | Requerimiento no funcional | Prioridad |
|---|---|---|
| RNF-034 | Los datos académicos deben tener relaciones consistentes. | Alta |
| RNF-035 | Las secciones deben estar asociadas a cursos válidos. | Alta |
| RNF-036 | Los bloques generados deben estar asociados a horarios institucionales válidos. | Alta |
| RNF-037 | Los horarios estudiantiles deben derivarse de bloques publicados. | Alta |
