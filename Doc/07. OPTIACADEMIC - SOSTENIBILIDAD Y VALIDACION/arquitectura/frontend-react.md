# 10. Frontend React

## Tecnologías

- React.
- Vite.
- Tailwind CSS.
- Axios.
- Zustand.
- lucide-react.
- react-hot-toast.
- html2pdf.js.

## Estructura

```text
frontend/src/
├── api/
├── components/
├── pages/
├── services/
├── stores/
└── utils/
```

## Servicios importantes

| Servicio | Función |
|---|---|
| `authService.js` | Login |
| `scheduleService.js` | Horarios |
| `institutionalCspService.js` | CSP institucional |
| `studentCspService.js` | CSP estudiante |
| `scheduleBlockService.js` | Bloques |

## Pantallas principales

| Pantalla | Función |
|---|---|
| `InstitutionalCSPPage.jsx` | Generación CSP institucional |
| `InstitutionalScheduleViewPage.jsx` | Visualización semanal institucional |
| `StudentOfferPage.jsx` | Oferta académica |
| `StudentScheduleGeneratorPage.jsx` | Generador personal |
| `MySavedSchedulesPage.jsx` | Horario final y PDF |
| `StudentDashboard.jsx` | Dashboard estudiante |

## Diseño

El frontend usa tarjetas, métricas, acordeones, tablas con scroll interno y guías visuales para mejorar la experiencia del usuario.
