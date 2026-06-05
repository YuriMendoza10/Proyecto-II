# Actividad 2.1: Sensibilizacion sobre impacto ambiental del software

## Objetivo

Comprender como las aplicaciones web y los sistemas informaticos pueden
generar impacto ambiental cuando consumen mas recursos tecnologicos de los
necesarios. Esta actividad permite reconocer que las decisiones de desarrollo,
arquitectura, despliegue y optimizacion influyen en el consumo de energia, el
uso de servidores, la transferencia de datos y la huella de carbono digital.

## Material revisado

Para desarrollar la sensibilizacion se consideran los siguientes recursos
proporcionados en clase y ubicados en `D:\AcademiC\Recursos`:

- Audio `El_costo_fisico_del_mundo_digital.m4a`, con una duracion aproximada
  de 27 minutos y 51 segundos.
- Video `Viaje_Full-Stack_Sostenible.mp4`, con una duracion aproximada de
  7 minutos y 41 segundos.
- Infografia `Sostenibilidad y eficiencia web movil.png`, enfocada en consumo
  energetico por framework y comparacion entre estrategias CSR y SSR.
- Diapositivas `Green_Engineering_Blueprint.pdf`, usadas como material
  complementario sobre eficiencia y sostenibilidad web.
- Archivo `MegaBlog.zip`, que contiene un proyecto de referencia tipo blog
  full-stack para relacionar los conceptos con una aplicacion web desarrollada
  en clase.

Estos materiales ayudan a entender que el software no es un producto
intangible sin consecuencias fisicas. Cada consulta, imagen, archivo, proceso
de servidor o transferencia de datos requiere infraestructura tecnologica que
consume electricidad y recursos.

## Ideas principales del material

Los recursos revisados refuerzan que el mundo digital tambien tiene un costo
fisico. Las aplicaciones dependen de dispositivos, redes, servidores,
almacenamiento y centros de datos que consumen energia. Por ello, una
aplicacion web no solo debe evaluarse por si funciona, sino tambien por cuanto
pesa, cuantas solicitudes realiza, cuanto procesamiento exige y que tan
eficiente es al entregar informacion.

La infografia compara frameworks y estrategias de renderizado. En el material
se observa que Vue registra un consumo promedio de 47.95 mWh, React 49.90 mWh
y Angular 50.75 mWh. Tambien se compara Client-Side Rendering con Server-Side
Rendering: CSR aparece con 48.73 mWh y SSR con 49.40 mWh. Aunque las
diferencias energeticas totales son pequenas, el material resalta que el tamano
de la aplicacion, el almacenamiento y la distribucion del esfuerzo entre cliente
y servidor influyen en la eficiencia.

El archivo `MegaBlog.zip` sirve como referencia del proyecto trabajado en clase:
un blog full-stack con frontend React, backend Express y autenticacion JWT. En
su documentacion se plantea como proyecto MERN, aunque el paquete entregado usa
persistencia ligera en archivos JSON. Esta diferencia permite entender que los
impactos ambientales no dependen solo de una tecnologia especifica como
MongoDB, sino de cualquier capa que gestione datos, solicitudes y procesamiento.

## Analisis general

El desarrollo de software consume recursos desde varias capas. En el frontend,
una interfaz pesada puede descargar demasiados archivos JavaScript, imagenes
sin optimizar, fuentes externas y estilos innecesarios. En el backend, una API
mal disenada puede ejecutar consultas repetidas, procesos costosos o respuestas
con mas informacion de la necesaria. En la base de datos, las consultas sin
indices o con estructuras poco eficientes aumentan el tiempo de procesamiento.

Aunque una sola solicitud parezca pequena, el impacto crece cuando la
aplicacion tiene muchos usuarios, se despliega en servidores permanentes o
realiza tareas de forma repetitiva. Por eso, optimizar el rendimiento tambien
es una practica de sostenibilidad: menos bytes transferidos, menos tiempo de
CPU, menos memoria y menos trabajo de red implican menor consumo energetico.

## Impactos ambientales identificados

| Impacto | Descripcion | Consecuencia ambiental |
| --- | --- | --- |
| Uso de servidores | Las aplicaciones web necesitan servidores activos para responder solicitudes, ejecutar procesos y almacenar informacion. | Mayor consumo electrico en centros de datos y equipos de red. |
| Consumo energetico | Cada operacion de CPU, memoria, disco y red requiere energia. | Aumento indirecto de emisiones si la energia proviene de fuentes no renovables. |
| Transferencia excesiva de datos | Enviar respuestas grandes o archivos innecesarios incrementa el trafico de red. | Mayor uso de infraestructura de telecomunicaciones y dispositivos cliente. |
| Imagenes pesadas | Imagenes sin compresion o en formatos inadecuados hacen que la pagina cargue mas datos. | Mas tiempo de carga, mas ancho de banda y mas energia consumida. |
| Consultas ineficientes | Consultas sin filtros, sin indices o con recorridos innecesarios aumentan el trabajo de la base de datos. | Mayor uso de CPU y memoria en el servidor de datos. |
| Exceso de solicitudes HTTP | Muchas llamadas pequenas o repetidas saturan la API y aumentan el trafico. | Mas carga en servidor, red y navegador. |
| Codigo frontend innecesario | Librerias grandes o componentes no usados aumentan el tamano del bundle. | Mayor descarga inicial y mayor consumo en el dispositivo del usuario. |
| Procesos repetitivos | Tareas programadas o validaciones duplicadas consumen recursos sin aportar valor real. | Mayor uso de computo y energia a lo largo del tiempo. |

## Relacion con el proyecto de clase y OptiAcademic

El material de clase incluye un proyecto de referencia tipo blog full-stack
llamado `MegaBlog`. En ese caso, los impactos ambientales pueden relacionarse
con el uso de React en el cliente, Express en el backend y una capa de
persistencia para usuarios, publicaciones y comentarios. Si el blog cargara
todas las publicaciones sin paginacion, ejecutara analisis NLP de forma
repetida o enviara respuestas demasiado grandes, aumentaria el consumo de CPU,
memoria, red y almacenamiento.

El proyecto `MegaBlog` y su referencia MERN son material de clase. No describen
la arquitectura principal de `OptiAcademic`. El sistema academico real no usa
MongoDB ni Express: usa React, Vite, Tailwind CSS y Axios en el frontend;
FastAPI, Python, SQLAlchemy y Alembic en el backend; MySQL para persistencia; y
Docker Compose para el entorno local. Por ello, la relacion con sostenibilidad
se adapta de la siguiente manera:

- **MySQL:** consultas sin filtros, tablas sin indices adecuados o lectura de
  demasiados registros pueden aumentar el trabajo de la base de datos. Por
  ejemplo, listar todos los estudiantes cuando solo se necesita una pagina de
  resultados.
- **FastAPI:** endpoints que devuelven demasiada informacion o ejecutan logica
  repetida consumen mas CPU y memoria en el backend. Por ejemplo, enviar campos
  que el frontend no usa en una pantalla especifica.
- **React:** componentes que hacen demasiadas peticiones o cargan recursos
  pesados aumentan el trabajo del navegador. Por ejemplo, consultar la API en
  cada render sin controlar correctamente las dependencias de `useEffect`.
- **Docker Compose:** mantener contenedores activos sin necesidad durante el
  desarrollo consume recursos locales. Por ejemplo, dejar backend, frontend y
  base de datos ejecutandose cuando no se estan utilizando.

Si el sistema no controla estos aspectos, puede consumir mas ancho de banda,
mas procesamiento y mas energia. Esto afecta tanto el rendimiento percibido por
el usuario como el impacto ambiental de la aplicacion.

## Ejemplos aplicados al sistema academico

En un sistema academico como el desarrollado en clase, existen varios puntos
donde la sostenibilidad puede considerarse desde el diseno:

- En el modulo de login, evitar solicitudes repetidas para validar la sesion.
- En los listados de estudiantes, docentes, cursos u horarios, usar paginacion
  y filtros para no transferir datos innecesarios.
- En el frontend, reducir imagenes decorativas pesadas y reutilizar componentes.
- En la API, devolver solo los campos necesarios para cada pantalla.
- En la base de datos, agregar indices a campos usados con frecuencia, como
  correo, rol, codigo de curso o periodo academico.
- En los reportes, calcular metricas bajo demanda controlada o mediante
  consultas optimizadas.
- En los horarios, evitar recalcular soluciones completas si solo se cambio un
  dato pequeno.

Los modulos reales considerados incluyen login, dashboard administrativo,
generacion institucional, preparacion demo completa, estudiantes
institucionales, historial academico, reportes, sostenibilidad, auditoria,
trazabilidad y notificaciones.

Estas acciones ayudan a que el sistema sea mas rapido, estable y eficiente.
Tambien reducen el consumo de recursos de servidor, base de datos y navegador.

## Buenas practicas propuestas

Para reducir el impacto ambiental de una aplicacion web se proponen las
siguientes buenas practicas:

- Optimizar imagenes usando formatos adecuados y tamanos proporcionales al uso.
- Minificar y dividir el codigo frontend para cargar solo lo necesario.
- Aplicar paginacion, filtros y busquedas eficientes en los listados.
- Evitar solicitudes HTTP duplicadas o innecesarias.
- Implementar cache cuando los datos no cambian constantemente.
- Usar indices en la base de datos para consultas frecuentes.
- Medir el peso de las respuestas de la API.
- Revisar el tiempo de respuesta de endpoints criticos.
- Evitar dependencias externas que no aporten valor funcional.
- Apagar servicios de desarrollo cuando no se esten utilizando.

## Reflexion

La sostenibilidad en software no depende solo del hardware o del proveedor de
nube. Tambien depende de como se programa, como se consulta la informacion,
como se disena la interfaz y como se despliega la aplicacion. Un sistema poco
optimizado puede parecer funcional, pero consumir mas energia de la necesaria y
generar una huella ambiental mayor.

En cambio, un sistema eficiente reduce tiempos de carga, mejora la experiencia
del usuario y disminuye el uso de recursos tecnologicos. Por ello, el
rendimiento y la sostenibilidad deben considerarse desde las primeras etapas
del desarrollo.

## Resultado esperado

Al finalizar esta actividad se comprende que un software poco optimizado puede
afectar el rendimiento del sistema y aumentar el consumo de recursos
tecnologicos y energeticos. Tambien se reconoce que buenas practicas como
optimizar imagenes, reducir solicitudes HTTP, mejorar consultas y controlar el
tamano de las respuestas contribuyen a construir aplicaciones web mas
sostenibles.
