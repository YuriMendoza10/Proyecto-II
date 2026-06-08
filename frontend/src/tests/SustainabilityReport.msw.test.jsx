import { render, screen } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import EnvironmentalImpactPage from '../pages/admin/EnvironmentalImpactPage'
import { environmentalSummary } from './msw/handlers'
import { server } from './msw/server'

const API_URL = 'http://127.0.0.1:8000/api/v1'

describe('EnvironmentalImpactPage con MSW', () => {
  it('muestra estado de carga inicial', () => {
    const { container } = render(<EnvironmentalImpactPage />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('muestra reporte de sostenibilidad con datos simulados', async () => {
    render(<EnvironmentalImpactPage />)

    expect(await screen.findByText('Impacto ambiental')).toBeInTheDocument()
    expect(screen.getAllByText('Notificaciones del usuario').length).toBeGreaterThan(0)
    expect(screen.getByText('Solicitudes totales')).toBeInTheDocument()
    expect(screen.getAllByText(/Consumo estimado por funcionalidad/i).length).toBeGreaterThan(0)
  })

  it('muestra estados vacios cuando no hay ranking ni metricas recientes', async () => {
    server.use(
      http.get(`${API_URL}/environmental-impact/summary`, () => HttpResponse.json(environmentalSummary)),
      http.get(`${API_URL}/environmental-impact/metrics`, () => HttpResponse.json([])),
      http.get(`${API_URL}/environmental-impact/ranking`, () => HttpResponse.json([])),
    )

    render(<EnvironmentalImpactPage />)

    expect(await screen.findByText('Sin funcionalidades medidas aun')).toBeInTheDocument()
    expect(screen.getByText('No hay metricas recientes')).toBeInTheDocument()
  })

  it('muestra error controlado cuando falla la API ambiental', async () => {
    server.use(
      http.get(`${API_URL}/environmental-impact/summary`, () => HttpResponse.json({ detail: 'Error' }, { status: 500 })),
    )

    render(<EnvironmentalImpactPage />)

    expect(await screen.findByText('No se pudieron cargar las metricas')).toBeInTheDocument()
  })
})
