# 1. Estrategia TDD

## 1.1 ¿Qué es TDD?

TDD significa **Test-Driven Development** o Desarrollo Guiado por Pruebas.

El ciclo TDD se compone de tres pasos:

```text
Red → Green → Refactor
```

| Fase | Descripción |
|---|---|
| Red | Se escribe una prueba que inicialmente falla |
| Green | Se implementa el código mínimo para que la prueba pase |
| Refactor | Se mejora el código sin romper la prueba |

## 1.2 Aplicación en OptiAcademic

En OptiAcademic, TDD se aplica principalmente a:

- Autenticación.
- Endpoints del backend.
- Validaciones de datos.
- Reglas de negocio.
- Motor CSP.
- Generación de horarios.
- Publicación de oferta.
- Flujo estudiante.

## 1.3 Módulos priorizados para pruebas

| Prioridad | Módulo | Justificación |
|---|---|---|
| Alta | Auth | Controla acceso al sistema |
| Alta | CSP institucional | Núcleo del problema de optimización |
| Alta | Publicación de horarios | Determina oferta visible para estudiantes |
| Alta | CSP estudiante | Genera horario personal |
| Media | Cursos, docentes, aulas | Datos base para generación |
| Media | Frontend estudiante | Flujo crítico de usuario |
| Media | Exportación PDF | Función de soporte |

## 1.4 Tipos de pruebas

| Tipo | Aplicación |
|---|---|
| Unitarias | Servicios, validaciones, funciones CSP |
| Integración | Endpoints conectados con base de datos |
| Funcionales | Flujo completo de usuario |
| Manuales guiadas | Validación visual del frontend |
| Regresión | Confirmar que cambios no rompen funciones previas |

## 1.5 Herramientas sugeridas

### Backend

- Pytest.
- TestClient de FastAPI.
- Base de datos de prueba.
- Fixtures de usuarios y datos académicos.

### Frontend

- Vitest.
- React Testing Library.
- Testing manual de flujos críticos.

## 1.6 Criterio de aceptación TDD

Una funcionalidad se considera validada cuando:

1. Existe al menos un caso de prueba definido.
2. El comportamiento esperado está documentado.
3. La prueba se ejecuta correctamente o se valida manualmente.
4. Se registra evidencia del resultado.
