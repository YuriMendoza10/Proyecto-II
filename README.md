# 🚀 Nombre del Proyecto: Implementación de un Aplicativo Web Inteligente para la Planificación y Automatización de Horarios Académicos mediante Modelado de Restricciones y Arquitectura Escalable.

Breve descripción del proyecto (qué hace y para quién es).

Desarrollo e implementación de un aplicativo web inteligente denominado OptiAcademic, diseñado para la automatización y optimización de horarios académicos. El sistema integra un motor de búsqueda basado en Satisfacción de Restricciones que procesa variables complejas (disponibilidad, créditos, prerrequisitos y capacidad física) para generar cronogramas óptimos y libres de conflictos en tiempo real. 

## 📑 Tabla de Contenidos

- [👥 Integrantes del equipo](#-integrantes-del-equipo)
- [⚠️ Problemática abordada](#-problemática-abordada)
- [📌 Justificación del PMV](#-justificación-del-pmv)
- [📌 Descripción](#-descripción)
- [🛠 Tecnologías](#-tecnologías)
- [⚙️ Instalación](docs/installation.md)
- [▶️ Uso](docs/usage.md)
- [🏗 Arquitectura](docs/architecture.md)
- [🔌 API](docs/api.md)
- [🤝 Contribución](docs/contributing.md)
- [❓ FAQ](docs/faq.md)

---

## 👥 Integrantes del equipo

 -  Mendoza Vilcahuaman Yuri Luigui
 -  Cajamarca Areche Reynaldo Elias
 -  Torres Inche Ulises Yerko
 -  Yarasca Batalla Jairo Ronald
 -  Riveros Sumalabe Fredy
 -  Zacarias Lopez Lenning Andree


## ⚠️ Problemática abordada

La planificación de horarios académicos en instituciones de educación superior es un problema de optimización combinatoria de alta complejidad. Actualmente, el proceso se realiza de forma manual o mediante herramientas genéricas (Excel,hojas), lo que genera las siguientes deficiencias:

  Conflictos Logísticos: Presencia de cruces de horarios para docentes y solapamiento de aulas, afectando la integridad de la programación académica.
  
  Ineficiencia Operativa: Los procesos de validación manual pueden tomar semanas, mientras que el 72% de los estudiantes manifiesta insatisfacción debido a la rigidez de los horarios y cruces en materias obligatorias.
  
  Subutilización de Infraestructura: Una asignación ineficiente resulta en una mejora pendiente del 60% en la ocupación de aulas.
  
  Barreras en el Egreso: La mala planificación de vacantes y horarios obliga al 30% de los estudiantes a retrasar su progreso académico por falta de secciones viables.

## 📌 Justificación del PMV

El MVP de OptiAcademic se centra en resolver el "núcleo del dolor": la generación de horarios sin conflictos lógicos. Es viable y estratégico por las siguientes razones:

  Enfoque en el Core Algorítmico: Prioriza el motor de Satisfacción de Restricciones (CSP) sobre funciones administrativas secundarias, permitiendo validar la eficacia de la optimización en menos de 120 segundos.
  
  Reducción de Riesgos: Permite probar la lógica de las mallas curriculares complejas en un entorno controlado antes de una implementación institucional masiva.
  
  Valor Inmediato: Automatiza la validación de cruces de horarios, eliminando el error humano que afecta al 72% de los estudiantes y liberando al personal administrativo de tareas manuales repetitivas.
  
  Escalabilidad Ágil: Establece una arquitectura modular que facilita la integración futura de nuevos módulos (gestión de pagos, asistencia, etc.) basados en datos reales de uso.

---

## 📌 Descripción

OptiAcademic es una plataforma web de ingeniería de software diseñada para la automatización y optimización de horarios académicos en instituciones de educación superior. El sistema reemplaza la planificación manual tradicional por un motor de decisión inteligente que garantiza la integridad de los datos y la eficiencia operativa.

  🧩 Problema que Resuelve
  El proyecto aborda el desafío de la Optimización Combinatoria en la gestión educativa. El proceso manual actual genera:
  
  Conflictos de colisión: Cruces de horarios para docentes y duplicidad en el uso de aulas físicas.
  
  Ineficiencia Temporal: Procesos administrativos que toman semanas de validación manual.
  
  Insatisfacción Estudiantil: Un 72% de alumnos afectados por horarios inconsistentes que retrasan su progreso académico.
  
  Opacidad de Datos: Dificultad para visualizar la disponibilidad real de la infraestructura en tiempo real.
  
  🚀 Alcance del Sistema
  El sistema se despliega como un Producto Mínimo Viable (MVP) enfocado en las funciones críticas de optimización:
  
  Motor de Optimización (CSP): Implementación de lógica basada en Satisfacción de Restricciones para generar cronogramas con "Conflicto Cero".
  
  Gestión de Entidades Maestras: Control centralizado de Mallas Curriculares, Infraestructura (Aulas/Laboratorios) y Staff Docente.
  
  Matriz de Disponibilidad: Interfaz interactiva para que los docentes registren sus restricciones de tiempo.
  
  Editor y Validador Manual: Herramienta que permite ajustes humanos supervisados con validación lógica instantánea (impide guardar si existe un cruce).
  
  Visualización y Reportes: Dashboards interactivos y exportación de cronogramas finales en formatos estructurados (PDF/Excel).

---

## 🛠 Tecnologías

- Lenguaje:Python 3.12
- Framework:Bootstrap 5, Django 5.0
- Base de datos: MySQL 
- Otros: Python-Constraint(Satisfacción de Restricciones (CSP) , ReportLab ,GitHub

---

## 📷 Capturas (Opcional)

Agregar imágenes o GIFs del sistema.

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT.
