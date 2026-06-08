import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import InstitutionalCspGeneratorPage from '../pages/admin/InstitutionalCspGeneratorPage'
import { mockSchedules } from './msw/handlers'
import { server } from './msw/server'

const API_URL = 'http://127.0.0.1:8000/api/v1'

function renderPage() {
  return render(
    <MemoryRouter>
      <InstitutionalCspGeneratorPage />
    </MemoryRouter>,
  )
}

describe('InstitutionalCspGeneratorPage con MSW', () => {
  it('muestra estado de carga inicial', () => {
    renderPage()
    expect(screen.getByText(/Cargando configuracion institucional/i)).toBeInTheDocument()
  })

  it('muestra lista de horarios generados con respuesta exitosa', async () => {
    renderPage()

    expect(await screen.findByText('Horarios generados')).toBeInTheDocument()
    expect(screen.getByText('ID #10')).toBeInTheDocument()
    expect(screen.getAllByText('Horario institucional 2026-I').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Cargar horario').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Ver bloques').length).toBeGreaterThan(0)
  })

  it('filtra horarios por busqueda de ID', async () => {
    renderPage()

    await screen.findByText('Horarios generados')
    fireEvent.change(screen.getByPlaceholderText(/2026-I/i), { target: { value: '11' } })

    await waitFor(() => {
      expect(screen.getByText('ID #11')).toBeInTheDocument()
      expect(screen.queryByText('ID #10')).not.toBeInTheDocument()
    })
  })

  it('muestra estado vacio cuando no hay horarios generados', async () => {
    server.use(
      http.get(`${API_URL}/institutional-csp/available-schedules`, () => HttpResponse.json([])),
    )

    renderPage()

    expect(await screen.findByText('No hay horarios generados todavia.')).toBeInTheDocument()
    expect(screen.getByText(/Prepare datos, ejecute diagnostico/i)).toBeInTheDocument()
  })

  it('muestra error controlado cuando falla la carga de datos', async () => {
    server.use(
      http.get(`${API_URL}/academic-periods`, () => HttpResponse.json({ detail: 'Error' }, { status: 500 })),
      http.get(`${API_URL}/academic-programs`, () => HttpResponse.json({ detail: 'Error' }, { status: 500 })),
      http.get(`${API_URL}/curriculum-plans`, () => HttpResponse.json({ detail: 'Error' }, { status: 500 })),
      http.get(`${API_URL}/institutional-csp/available-schedules`, () => HttpResponse.json(mockSchedules)),
    )

    renderPage()

    expect(await screen.findByText(/No se pudieron obtener periodos/i)).toBeInTheDocument()
  })
})
