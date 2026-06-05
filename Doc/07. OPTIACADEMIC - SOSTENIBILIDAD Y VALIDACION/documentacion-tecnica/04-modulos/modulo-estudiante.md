# 8. Módulo estudiante

## Descripción

Permite al estudiante generar su horario personal a partir de la oferta académica publicada.

## Flujo

```text
1. Iniciar sesión.
2. Ver oferta académica.
3. Seleccionar cursos.
4. Preferir o evitar docentes.
5. Configurar días no disponibles.
6. Generar alternativas.
7. Comparar opciones.
8. Elegir horario final.
9. Exportar PDF.
```

## Rutas

| Ruta | Función |
|---|---|
| `/student` | Dashboard |
| `/student/offer` | Oferta académica |
| `/student/schedule-generator` | Generador personal |
| `/student/my-schedules` | Horario final |

## Reglas de créditos

```text
Mínimo: 7 créditos
Máximo: 25 créditos
```

## Comparador

Muestra:

- Score.
- Créditos.
- Diferencia con objetivo.
- Cursos.
- Días usados.
- Advertencias.
- Fortalezas.

## Horario final

El estudiante guarda una solución como horario final. Este horario se muestra en el dashboard y puede exportarse a PDF.
