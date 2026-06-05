# 6. Alineación con la consigna del proyecto

## 6.1 Contexto del proyecto

La consigna solicita una aplicación orientada a la generación óptima de horarios académicos considerando restricciones institucionales, disponibilidad de recursos, asignación docente, distribución de aulas y conflictos.

OptiAcademic cumple este punto porque permite:

- Gestionar cursos.
- Gestionar docentes.
- Gestionar aulas.
- Gestionar secciones.
- Ejecutar motor CSP.
- Validar conflictos.
- Publicar horarios.
- Permitir generación personalizada para estudiantes.

## 6.2 Análisis y validación del problema

La consigna solicita validar requerimientos funcionales y no funcionales, actores, restricciones, dependencias, conflictos e indicadores.

El proyecto lo evidencia mediante:

- `Doc/07. OPTIACADEMIC - SOSTENIBILIDAD Y VALIDACION/requerimientos/03-requerimientos-funcionales.md`
- `Doc/07. OPTIACADEMIC - SOSTENIBILIDAD Y VALIDACION/requerimientos/04-requerimientos-no-funcionales.md`
- `Doc/07. OPTIACADEMIC - SOSTENIBILIDAD Y VALIDACION/requerimientos/02-actores-del-sistema.md`
- `Doc/07. OPTIACADEMIC - SOSTENIBILIDAD Y VALIDACION/requerimientos/05-reglas-de-negocio.md`
- `Doc/07. OPTIACADEMIC - SOSTENIBILIDAD Y VALIDACION/validacion-problema/04-indicadores-exito.md`

## 6.3 Modelado y fundamentación técnica

La consigna solicita representar el problema mediante CSP y optimización combinatoria.

El proyecto cumple porque:

- Modela variables.
- Define dominios.
- Define restricciones duras y blandas.
- Usa backtracking.
- Usa MRV.
- Usa scoring.
- Genera soluciones alternativas.

## 6.4 Desarrollo y actualización del MVP

El MVP actualizado incluye:

- Backend con API REST.
- Frontend React.
- Base de datos MySQL.
- Motor CSP institucional.
- Motor CSP estudiantil.
- Publicación de oferta.
- Dashboard estudiantil.
- Exportación PDF.
- Documentación técnica.

## 6.5 Gestión documental y repositorio

El proyecto usa GitHub como repositorio principal y contiene documentación en la carpeta `Doc`.

Se recomienda mantener commits descriptivos como:

```text
docs: agregar validacion del problema
docs: agregar estrategia tdd
feat: mejorar generacion csp institucional
fix: corregir publicacion de horarios
```

## 6.6 Entregable final

El repositorio final debe contener:

- MVP actualizado.
- Documentación técnica.
- Requerimientos funcionales y no funcionales.
- Evidencias de validación.
- Criterios de aceptación.
- Estrategia TDD.
- Commits organizados.
- TOC sincronizado.

## 6.7 Stack tecnológico del proyecto

El proyecto utiliza una arquitectura full-stack compuesta por React en el frontend, FastAPI en el backend y MySQL como base de datos.

Esta arquitectura es adecuada para el problema porque:

- React permite construir una GUI dinámica y modular.
- FastAPI permite crear una API REST clara, documentada y mantenible.
- MySQL permite representar adecuadamente entidades académicas relacionales.
- Python facilita la implementación del motor CSP y la lógica de optimización.

La consigna no exige de forma obligatoria un stack específico; por ello, el stack implementado se justifica por la naturaleza del problema, el modelado relacional y la necesidad de ejecutar algoritmos de optimización.
