# Cobertura de pruebas

| Area | Resultado | Interpretacion |
|---|---:|---|
| Frontend coverage | 81.11 % | Supera el 70 % solicitado para frontend. |
| Frontend branches | 65.24 % | Cobertura parcial de ramas; queda margen de mejora. |
| Frontend functions | 68.24 % | Cercano al 70 %, reforzado con pruebas de componentes y MSW. |
| Frontend lines | 81.11 % | Buen nivel de cobertura de lineas. |
| Backend coverage | 51 % | Cobertura global parcial. |
| Backend security core | 95 % documentado previamente | Logica critica de seguridad cubierta. |
| Backend CSP utils | 96 % documentado previamente | Utilidades CSP criticas cubiertas. |
| Backend schedule publication | 82 % documentado previamente | Publicacion segura cubierta en nivel alto. |

## Interpretacion

Frontend supera el minimo del 70 %. Backend no alcanza 70 % global porque incluye servicios grandes, repositorios, motores CSP completos y modulos dependientes de base de datos real. No se excluyeron modulos reales de forma artificial para inflar cobertura.

Para llevar backend a 70 % o mas se recomienda implementar base de datos de prueba aislada, fixtures de integracion y pruebas progresivas sobre repositorios y servicios dependientes de MySQL.
