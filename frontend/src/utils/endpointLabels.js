const ENDPOINT_LABELS = {
  '/api/v1/notifications/me': 'Notificaciones del usuario',
  '/api/v1/data-readiness/report': 'Reporte de preparacion de datos',
  '/api/v1/reports/sustainability': 'Reporte de sostenibilidad',
  '/api/v1/reports/students': 'Reporte de estudiantes',
  '/api/v1/reports/schedules': 'Reporte de horarios',
  '/api/v1/reports/executive-summary': 'Panel ejecutivo',
  '/api/v1/dashboard/admin-summary': 'Panel ejecutivo',
  '/api/v1/audit-logs': 'Auditoria del sistema',
  '/api/v1/classrooms': 'Gestion de aulas',
  '/api/v1/faculties': 'Gestion de facultades',
  '/api/v1/campuses': 'Sede Huancayo',
  '/api/v1/academic-programs': 'Programas academicos',
  '/api/v1/curriculum-plans': 'Planes curriculares',
  '/api/v1/student-academic-history': 'Historial academico estudiantil',
  '/api/v1/institutional-csp/available-schedules': 'Horarios institucionales disponibles',
  '/api/v1/institutional-csp/preview-from-offerings': 'Vista previa de generacion de horarios',
  '/api/v1/institutional-csp/generate-from-offerings': 'Generacion de horario institucional',
  '/api/v1/institutional-csp/save-offering-solution': 'Guardado de solucion de horario',
}

const ENDPOINT_DESCRIPTIONS = {
  '/api/v1/notifications/me': 'Consultas realizadas para revisar notificaciones pendientes.',
  '/api/v1/data-readiness/report': 'Revision de la informacion necesaria para preparar horarios.',
  '/api/v1/reports/sustainability': 'Consulta del resumen de consumo digital estimado.',
  '/api/v1/audit-logs': 'Revision de acciones relevantes registradas en el sistema.',
  '/api/v1/classrooms': 'Consultas relacionadas con aulas y espacios disponibles.',
  '/api/v1/institutional-csp/available-schedules': 'Consulta de horarios institucionales que pueden revisarse o publicarse.',
}

function cleanSegment(segment) {
  return segment
    .replace(/[{}:_-]+/g, ' ')
    .replace(/\b(me|id|v\d+)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function sentenceCase(value) {
  return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : 'Funcionalidad del sistema'
}

export function normalizeEndpoint(endpoint = '') {
  return String(endpoint).split('?')[0].replace(/\/+$/, '')
}

export function getEndpointLabel(endpoint) {
  const normalized = normalizeEndpoint(endpoint)
  if (ENDPOINT_LABELS[normalized]) return ENDPOINT_LABELS[normalized]

  const segments = normalized
    .replace(/^\/api\/v\d+\//, '')
    .split('/')
    .map(cleanSegment)
    .filter(Boolean)

  return sentenceCase(segments.join(' '))
}

export function getEndpointDescription(endpoint) {
  const normalized = normalizeEndpoint(endpoint)
  return ENDPOINT_DESCRIPTIONS[normalized] || 'Actividad registrada durante el uso de esta funcionalidad.'
}

export function replaceEndpointsWithLabels(text = '') {
  return String(text).replace(/\/api\/v\d+\/[A-Za-z0-9_{}./-]+/g, (endpoint) => getEndpointLabel(endpoint))
}
