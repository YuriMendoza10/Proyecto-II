# Cobertura de pruebas

| Area | Resultado | Interpretacion |
|---|---:|---|
| Frontend coverage | 81.11 % | Supera 70 % |
| Frontend branches | 65.24 % | Mejorable, pero suficiente como base inicial |
| Frontend functions | 68.24 % | Cercano al 70 %, con rutas pendientes |
| Backend coverage | 51 % | Global parcial, logica critica alta |
| Security core | 95 % | Critico cubierto |
| CSP utils | 96 % | Critico cubierto |
| Environmental middleware | 100 % | Critico cubierto |
| Publication service | 82 % | Cercano al 85 % |

## Reportes requeridos por SonarQube

Frontend:

```powershell
npm --prefix frontend run test
Test-Path frontend\coverage\lcov.info
```

Backend:

```powershell
cd backend
py -m pytest --cov=app --cov-report=xml:coverage.xml --cov-report=html --cov-report=term
cd ..
Test-Path backend\coverage.xml
```

## Interpretacion backend

Backend no llega a 70 % global porque incluye servicios grandes, repositorios, motor CSP completo y modulos dependientes de MySQL real. No se excluyeron modulos reales artificialmente para inflar cobertura.

Para subir backend a 70 % o mas se requiere:

- Base de datos de prueba aislada.
- Fixtures reproducibles.
- Pruebas de repositorios SQLAlchemy.
- Escenarios integrales por rol.
- Datos controlados para reportes y CSP institucional.
