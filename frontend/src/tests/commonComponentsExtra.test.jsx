import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import AccessibleAlert from '../components/common/AccessibleAlert'
import DataTable from '../components/common/DataTable'
import ErrorBoundary from '../components/common/ErrorBoundary'
import ReadableNumber from '../components/common/ReadableNumber'
import SectionCard from '../components/common/SectionCard'

let shouldThrow = true

function MaybeBrokenChild() {
  if (shouldThrow) throw new Error('Vista rota para prueba')
  return <p>Vista recuperada</p>
}

describe('componentes comunes adicionales', () => {
  it('AccessibleAlert usa roles accesibles segun severidad', () => {
    const { rerender } = render(<AccessibleAlert type="error" title="Error" message="No se pudo cargar" />)

    expect(screen.getByRole('alert')).toHaveTextContent('No se pudo cargar')

    rerender(<AccessibleAlert type="success" title="Listo" message="Operacion completa" />)
    expect(screen.getByRole('status')).toHaveTextContent('Operacion completa')
  })

  it('DataTable renderiza filas, encabezados y valores vacios', () => {
    render(
      <DataTable
        caption="Tabla de prueba"
        columns={[
          { key: 'name', label: 'Nombre' },
          { key: 'status', label: 'Estado', render: (row) => row.status.toUpperCase() },
          { key: 'missing', label: 'Pendiente' },
        ]}
        rows={[{ id: 1, name: 'Horario 2026-I', status: 'draft' }]}
      />
    )

    expect(screen.getByRole('columnheader', { name: 'Nombre' })).toBeInTheDocument()
    expect(screen.getByText('Horario 2026-I')).toBeInTheDocument()
    expect(screen.getByText('DRAFT')).toBeInTheDocument()
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('DataTable muestra estados de carga, error y vacio', () => {
    const { rerender } = render(<DataTable columns={[]} loading />)
    expect(screen.getByText(/Cargando vista/i)).toBeInTheDocument()

    rerender(<DataTable columns={[]} error="Error de API" />)
    expect(screen.getByText('Error de API')).toBeInTheDocument()

    rerender(<DataTable columns={[]} rows={[]} emptyTitle="Sin registros" emptyMessage="No hay filas" />)
    expect(screen.getByText('Sin registros')).toBeInTheDocument()
    expect(screen.getByText(/Cuando existan registros/i)).toBeInTheDocument()
  })

  it('ErrorBoundary captura errores y permite reintentar', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { rerender } = render(
      <MemoryRouter>
        <ErrorBoundary>
          <MaybeBrokenChild />
        </ErrorBoundary>
      </MemoryRouter>
    )

    expect(screen.getByText(/Ocurrio un error/i)).toBeInTheDocument()
    shouldThrow = false
    fireEvent.click(screen.getByRole('button', { name: /Reintentar/i }))

    expect(screen.getByText('Vista recuperada')).toBeInTheDocument()
    shouldThrow = true
    consoleSpy.mockRestore()
  })

  it('ReadableNumber formatea valores y conserva valor original en title', () => {
    render(
      <div>
        <ReadableNumber value={0.0000297237} type="co2" />
        <ReadableNumber value={1536} type="bytes" />
        <ReadableNumber value={null} type="unknown" digits={2} />
      </div>
    )

    expect(screen.getByTitle('0.0000297237')).toHaveTextContent('g CO₂')
    expect(screen.getByTitle('1536')).toHaveTextContent('KB')
    expect(screen.getByTitle('0')).toBeInTheDocument()
  })

  it('SectionCard renderiza titulo, subtitulo, acciones y contenido', () => {
    render(
      <SectionCard title="Reporte" subtitle="Resumen visible" actions={<button>Recargar</button>}>
        <p>Contenido principal</p>
      </SectionCard>
    )

    expect(screen.getByRole('heading', { name: 'Reporte' })).toBeInTheDocument()
    expect(screen.getByText('Resumen visible')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Recargar' })).toBeInTheDocument()
    expect(screen.getByText('Contenido principal')).toBeInTheDocument()
  })
})
