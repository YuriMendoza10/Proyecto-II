# 12. Validaciones y calidad

## Validaciones institucionales

El sistema valida:

- Cruce de aula.
- Cruce de docente.
- Cruce de sección.
- Disponibilidad docente.
- Rango horario permitido.
- Existencia de bloques.
- Estado de publicación.

## Validaciones estudiante

- Cursos dentro de oferta publicada.
- Sin cruces.
- Créditos entre 7 y 25.
- Respeto de días no disponibles.
- Preferencias de docentes.

## SQL para distribución horaria

```sql
SELECT 
    start_time,
    COUNT(*) AS total_bloques
FROM schedule_blocks
WHERE schedule_id = 1
GROUP BY start_time
ORDER BY start_time;
```

## SQL para cruces de aula

```sql
SELECT 
    classroom_id,
    day_of_week,
    start_time,
    COUNT(*) AS total
FROM schedule_blocks
WHERE schedule_id = 1
GROUP BY classroom_id, day_of_week, start_time
HAVING COUNT(*) > 1;
```

## Validaciones Fase 11

- Los estudiantes institucionales conservan `career`, `cycle`, `student_code`
  y `user_id` cuando corresponda al esquema legacy.
- Las nuevas relaciones hacia programa, plan y sede son nullable para permitir
  un backfill progresivo.
- El historial académico separa cursos aprobados, desaprobados, en progreso,
  retirados y pendientes de revisión.
- La combinación estudiante, curso, período e intento evita duplicados
  evidentes.

```sql
SELECT status, COUNT(*) AS total
FROM student_academic_history
GROUP BY status;
```

## Accesibilidad Web

La validación frontend incluye:

- foco visible al navegar con teclado;
- enlace para saltar al contenido principal;
- modo claro, modo oscuro y escala de texto persistentes;
- reducción de movimiento cuando el sistema operativo la solicita;
- etiquetas visibles en formularios prioritarios;
- mensajes de carga y error anunciables;
- estados representados con texto, icono y color;
- tablas institucionales con caption y encabezados semánticos.

Referencia ampliada: [Accesibilidad web](accesibilidad-web.md).

Para tablas y paneles tambien se valida:

- tipografia de datos de al menos tamano `text-sm`;
- encabezados de tabla semanticos y captions descriptivos;
- unidades visibles en metricas ambientales y operativas;
- barras de progreso acompanadas por porcentaje textual;
- scroll horizontal controlado en tablas extensas.

La validacion de lenguaje visual comprueba ademas que:

- las rutas `/api/v1/...` no aparezcan como titulo principal de una metrica;
- cada ruta tecnica tenga un nombre funcional comprensible;
- el endpoint original permanezca disponible solo en un detalle colapsable;
- los modos claro y oscuro mantengan contraste suficiente en tablas, cards e
  inputs.

## Optimizacion Tecnica Frontend

Los listados prioritarios usan paginacion visible y cargas acotadas. El
historial academico dispone de una ruta paginada aditiva para conservar el
contrato legacy. Los catalogos estables de facultades, sedes, programas,
periodos y planes curriculares reutilizan respuestas recientes y deduplican
solicitudes concurrentes; las mutaciones invalidan la cache.

La guia operativa para registrar resultados antes y despues esta en
[Validacion Lighthouse](sostenibilidad/07-validacion-lighthouse.md).

La validacion de optimizaciones debe cubrir login, dashboard administrativo,
usuarios, docentes, estudiantes, cursos, horarios e impacto ambiental. Para
cada pantalla se registran tiempo de carga, tiempo de respuesta FastAPI,
solicitudes HTTP, tamano de respuestas, fluidez, errores de consola, errores
backend y resultados Lighthouse en Performance, Accessibility y Best
Practices.
