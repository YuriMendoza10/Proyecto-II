import { describe, expect, it } from 'vitest'

import { getEndpointLabel } from '../utils/endpointLabels'

describe('endpointLabels', () => {
  it('traduce notificaciones del usuario', () => {
    expect(getEndpointLabel('/api/v1/notifications/me')).toBe('Notificaciones del usuario')
  })

  it('traduce reporte de preparacion de datos', () => {
    expect(getEndpointLabel('/api/v1/data-readiness/report')).toBe('Reporte de preparacion de datos')
  })

  it('traduce reporte de sostenibilidad', () => {
    expect(getEndpointLabel('/api/v1/reports/sustainability')).toBe('Reporte de sostenibilidad')
  })

  it('genera una etiqueta legible para rutas no mapeadas', () => {
    expect(getEndpointLabel('/api/v1/student-academic-history')).toBe('Historial academico estudiantil')
    expect(getEndpointLabel('/api/v1/custom-module/summary')).toBe('Custom module summary')
  })
})
