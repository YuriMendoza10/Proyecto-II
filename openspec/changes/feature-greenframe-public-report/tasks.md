# Tareas: integracion GreenFrame y reporte publico

## 1. Investigacion y preparacion

- [ ] Seleccionar y fijar una version compatible de GreenFrame CLI.
- [ ] Consultar la documentacion oficial de la version seleccionada para confirmar la sintaxis de `.greenframe.yml`, escenarios Playwright y clasificacion de contenedores de base de datos.
- [ ] Identificar la configuracion Docker/Compose local necesaria para levantar frontend React, backend FastAPI y MySQL sin alterar configuracion critica de produccion.
- [ ] Definir la politica de versionado del directorio del reporte y del archivo generado.

## 2. Configuracion GreenFrame y Docker

- [ ] Crear `.greenframe.yml` en la raiz de `optiacademic`.
- [ ] Configurar los servicios reales `frontend`, `backend` y `database` conforme a la infraestructura Docker disponible.
- [ ] Declarar MySQL como contenedor de base de datos si la version de GreenFrame lo soporta.
- [ ] Documentar que la ejecucion full-stack requiere Docker y como preparar los servicios locales de analisis.
- [ ] Verificar que la configuracion no referencia Express, MongoDB ni servicios MERN.

## 3. Escenario Playwright

- [ ] Crear `scenario.js` en la raiz del proyecto con exportacion explicita mediante `module.exports`.
- [ ] Implementar apertura de `http://localhost:5173` y acceso a login.
- [ ] Implementar autenticacion con credenciales de prueba no sensibles o variables de entorno de pruebas.
- [ ] Implementar navegacion a dashboard y a `/admin/environmental-impact` o flujo funcional equivalente.
- [ ] Incorporar una espera de estabilizacion de al menos 10 segundos.
- [ ] Verificar que el escenario funciona en el entorno Docker definido.

## 4. Automatizacion y artefacto de reporte

- [ ] Crear o ajustar el `package.json` raiz para incorporar el script `sustainability:analyze`.
- [ ] Configurar el script para ejecutar `greenframe analyze`.
- [ ] Crear automaticamente `backend/public/assets/` cuando no exista.
- [ ] Persistir la salida legible del analisis en `backend/public/assets/greenframe-latest.txt`.
- [ ] Mantener correctamente el estado de error del comando cuando GreenFrame falle.
- [ ] Confirmar que el reporte no registra tokens ni secretos como `GREENFRAME_SECRET_TOKEN`.
- [ ] Aplicar la politica acordada de `.gitignore` o evidencia versionada para reportes generados.

## 5. Endpoint publico FastAPI

- [ ] Crear el endpoint `GET /api/v1/sustainability` y registrarlo en el router API vigente.
- [ ] Implementar lectura segura y no bloqueante del archivo `backend/public/assets/greenframe-latest.txt`.
- [ ] Devolver `200` con el ultimo reporte cuando el archivo exista.
- [ ] Devolver una respuesta clara y documentada cuando el analisis aun no se haya ejecutado.
- [ ] Mantener el endpoint sin autenticacion y sin exponer configuracion sensible.
- [ ] Verificar que la nueva ruta no modifica el comportamiento de endpoints existentes.

## 6. Frontend futuro

- [ ] Documentar una seccion futura en `/admin/environmental-impact` para consultar y mostrar el reporte GreenFrame.
- [ ] Definir estados previstos de carga, ausencia de reporte y visualizacion de contenido.
- [ ] Mantener esta integracion fuera de la implementacion inicial hasta nueva aprobacion.

## 7. Documentacion

- [ ] Crear `docs/sostenibilidad/02-greenframe-report.md`.
- [ ] Describir objetivo, limites y caracter estimado del analisis GreenFrame.
- [ ] Documentar la adaptacion de la actividad MERN a React + FastAPI + MySQL.
- [ ] Documentar Docker, `.greenframe.yml`, `scenario.js` y `npm run sustainability:analyze`.
- [ ] Documentar el endpoint publico, la ubicacion del reporte y el comportamiento sin analisis previo.
- [ ] Documentar el manejo seguro de credenciales y `GREENFRAME_SECRET_TOKEN`.

## 8. Validacion

- [ ] Ejecutar GreenFrame sobre el escenario completo con Docker y comprobar que produce un reporte.
- [ ] Confirmar que el reporte se guarda en la ruta convenida y es legible.
- [ ] Probar el endpoint publico con reporte presente y ausente.
- [ ] Revisar que no se incorporen `.env`, `venv`, `node_modules` ni secretos al cambio.
- [ ] Probar que la aplicacion actual sigue funcionando sin depender de la ejecucion de GreenFrame.
