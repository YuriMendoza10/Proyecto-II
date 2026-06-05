# Diseno tecnico: GreenFrame con reporte publico

## Contexto

OptiAcademic esta compuesto por:

| Capa | Tecnologia real |
| --- | --- |
| Frontend | React + Vite + Tailwind CSS |
| Backend | FastAPI + Python + SQLAlchemy + Alembic |
| Persistencia | MySQL |

GreenFrame se ejecutara como herramienta externa de analisis ambiental sobre un escenario de navegador. Aunque la consigna de referencia menciona Express, MongoDB y Docker Compose para MERN, esta integracion utilizara los servicios reales de OptiAcademic y no reemplazara su arquitectura.

## Objetivo tecnico

Medir un flujo critico de usuario en una ejecucion full-stack controlada, conservar el ultimo reporte textual generado y permitir consultarlo mediante un endpoint publico del backend.

Flujo previsto:

```text
Desarrollador ejecuta npm run sustainability:analyze
  -> GreenFrame inicia o utiliza el entorno Docker configurado
  -> scenario.js ejecuta el flujo Playwright sobre React
  -> React consume FastAPI y FastAPI opera contra MySQL
  -> GreenFrame calcula y emite el reporte del analisis
  -> la salida legible se guarda en backend/public/assets/greenframe-latest.txt
  -> GET /api/v1/sustainability publica el ultimo reporte disponible
```

## Configuracion GreenFrame

Se creara `.greenframe.yml` en la raiz del proyecto. La configuracion debera reflejar los servicios reales usados durante el escenario:

- `frontend`: aplicacion React/Vite accesible desde el navegador del escenario.
- `backend`: API FastAPI que atiende el flujo medido.
- `database`: MySQL requerido por las operaciones realizadas.

Si la version seleccionada de GreenFrame permite clasificar contenedores por tipo, MySQL se declarara como contenedor de base de datos para que la interpretacion del analisis diferencie la persistencia del servicio de aplicacion.

El analisis full-stack dependera de Docker. Cuando la infraestructura local use Docker Compose, la configuracion debera apuntar a los nombres reales de servicio y redes que se definan para OptiAcademic; no se copiaran nombres de contenedores de la actividad MERN.

### Decisiones pendientes de implementacion

- Confirmar la version de GreenFrame CLI que se utilizara y la sintaxis exacta soportada por `.greenframe.yml`.
- Crear o reutilizar la configuracion Docker/Compose local que levante React, FastAPI y MySQL para analisis.
- Definir si el frontend se ejecuta en modo Vite de desarrollo o como build servido dentro del contenedor de analisis.

## Escenario Playwright

Se creara `scenario.js` en la raiz del proyecto, siguiendo el contrato de escenarios requerido por GreenFrame y exportando la funcion explicitamente:

```javascript
module.exports = async function scenario(page) {
    // Flujo de prueba.
}
```

El flujo propuesto sera:

1. Abrir `http://localhost:5173`.
2. Navegar o confirmar la pantalla de login.
3. Autenticarse como usuario de prueba con rol `ADMIN` o `STUDENT`.
4. Esperar la carga del dashboard asociado al rol.
5. Navegar a `/admin/environmental-impact` si se usa un administrador, o a una pantalla funcional equivalente si se usa un estudiante.
6. Esperar al menos 10 segundos para estabilizar mediciones y permitir que se complete la actividad representativa.

Las credenciales no se escribiran como secretos reales en el archivo. La implementacion utilizara credenciales seed de demostracion no sensibles o variables de entorno especificas para pruebas, documentando cuales son necesarias sin versionar sus valores privados.

## Automatizacion y reporte persistido

Actualmente no se debe asumir que exista un `package.json` raiz funcional. La implementacion debera crear uno o ampliar el que corresponda en la raiz de `optiacademic` para proporcionar:

```json
{
  "scripts": {
    "sustainability:analyze": "..."
  }
}
```

El script ejecutara `greenframe analyze` y escribira su salida legible en:

```text
backend/public/assets/greenframe-latest.txt
```

Antes del analisis, el flujo automatizado garantizara que `backend/public/assets/` exista. La estrategia de comando debera:

- Conservar el codigo de salida de GreenFrame cuando el analisis falle.
- Guardar salida legible para lectura humana y para el endpoint FastAPI.
- Evitar incluir `GREENFRAME_SECRET_TOKEN` u otros secretos en el archivo generado.

La carpeta y su convencion de ruta pueden versionarse. El equipo debera decidir si el archivo `greenframe-latest.txt` generado se mantiene fuera de Git mediante `.gitignore` o si se versionan exclusivamente reportes de evidencia seleccionados.

## Endpoint FastAPI publico

Se agregara un router o endpoint compatible con la estructura de `app/api/v1/api.py`:

```http
GET /api/v1/sustainability
```

Caracteristicas:

- No exigira autenticacion.
- Resolvera de manera segura la ruta esperada dentro de `backend/public/assets/`.
- Leera `greenframe-latest.txt` sin bloquear innecesariamente el event loop; se preferira lectura asincrona disponible o ejecucion segura fuera del camino bloqueante.
- Si existe el archivo, respondera `200` con el reporte en texto plano o en un JSON simple que conserve el contenido textual.
- Si el archivo no existe, respondera claramente que aun no se ha ejecutado un analisis GreenFrame, con un codigo documentado (`200` informativo o `404`, a decidir durante implementacion).
- No devolvera variables de entorno ni valores como `GREENFRAME_SECRET_TOKEN`.

El endpoint sera adicional y no modificara contratos ni logica de negocio de rutas existentes.

## Integracion frontend futura

En una fase posterior, `/admin/environmental-impact` podra incorporar una seccion "Ultimo reporte GreenFrame" que consulte `GET /api/v1/sustainability` y presente:

- Fecha del ultimo analisis, si se almacena en el reporte.
- Contenido textual del reporte o indicadores parseados.
- Estado vacio cuando aun no exista un analisis.
- Enlace conceptual entre metricas HTTP internas y la medicion de escenario full-stack.

Esta especificacion no implementa esa pantalla ni modifica el dashboard React actual.

## Documentacion

Se creara `docs/sostenibilidad/02-greenframe-report.md` para documentar:

- Objetivo y alcance de GreenFrame.
- Adaptacion a React + FastAPI + MySQL.
- Dependencia de Docker para el analisis full-stack.
- Funcion de `.greenframe.yml` y `scenario.js`.
- Ejecucion mediante `npm run sustainability:analyze`.
- Ubicacion y tratamiento del reporte generado.
- Consulta del endpoint publico y comportamiento cuando no existe reporte.
- Manejo de secretos y restricciones del proyecto.

## Riesgos y mitigaciones

| Riesgo | Mitigacion |
| --- | --- |
| La sintaxis GreenFrame cambia segun version. | Fijar version CLI y validar `.greenframe.yml` contra documentacion oficial antes de implementar. |
| El escenario contiene credenciales sensibles. | Usar datos de demostracion o variables de entorno de pruebas sin versionar secretos. |
| La salida captura tokens o informacion privada. | Revisar el comando y sanitizar/documentar la salida antes de exponerla publicamente. |
| Docker no reproduce el stack real. | Nombrar y configurar servicios reales de React, FastAPI y MySQL. |
| El endpoint falla si no se genero reporte. | Responder con estado controlado y mensaje claro de ausencia de analisis. |
| Un reporte generado se versiona accidentalmente. | Definir politica de Git para artefactos antes de ejecutar el analisis. |

## Verificacion esperada

- Validar que GreenFrame reconoce la configuracion Docker del stack real.
- Ejecutar el escenario con credenciales de prueba y confirmar el flujo elegido.
- Confirmar que `npm run sustainability:analyze` crea o actualiza el reporte legible.
- Comprobar que el reporte no contiene secretos.
- Probar `GET /api/v1/sustainability` con reporte existente y sin reporte existente.
- Confirmar que rutas preexistentes y el dashboard ambiental actual no cambian su comportamiento.
