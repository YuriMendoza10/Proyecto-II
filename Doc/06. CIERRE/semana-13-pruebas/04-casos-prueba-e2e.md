# Casos de prueba end to end

Las pruebas e2e se ubican en:

- `frontend/e2e/login.spec.js`
- `frontend/e2e/theme.spec.js`
- `frontend/e2e/sustainability.spec.js`
- `frontend/e2e/navigation.spec.js`

## Casos cubiertos

| ID | Flujo | Resultado esperado |
|---|---|---|
| E2E-01 | Abrir `/login` | La pantalla carga y muestra campos de acceso |
| E2E-02 | Login invalido | No permite ingresar al dashboard |
| E2E-03 | Modo claro/oscuro | El usuario puede cambiar el tema visual |
| E2E-04 | Reporte de sostenibilidad | Carga con sesion valida y muestra metricas principales |
| E2E-05 | Dashboard administrativo | Carga con sesion valida |
| E2E-06 | CSP institucional | Carga con sesion valida |

## Credenciales

Las pruebas autenticadas usan variables de entorno:

```powershell
$env:E2E_ADMIN_EMAIL="correo-demo"
$env:E2E_ADMIN_PASSWORD="clave-demo"
```

Si no existen estas variables, las pruebas autenticadas se marcan como `skip` para no introducir credenciales reales en el repositorio.

## Comando

El entorno frontend debe estar corriendo antes de ejecutar Playwright:

```powershell
npm --prefix frontend run dev -- --host 127.0.0.1
$env:E2E_BASE_URL="http://127.0.0.1:5173"
npm --prefix frontend run e2e
```

