import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import CspGenerationResult from '../components/csp/CspGenerationResult'
import CspIssueList from '../components/csp/CspIssueList'
import CspPreviewResult from '../components/csp/CspPreviewResult'

describe('CspIssueList', () => {
  it('muestra estado vacio cuando no hay advertencias', () => {
    render(<CspIssueList data={{ warnings: [] }} emptyText="Sin bloqueos" />)

    expect(screen.getByText('Sin bloqueos')).toBeInTheDocument()
  })

  it('normaliza advertencias sin aula, docente y disponibilidad y permite filtrar', () => {
    render(
      <CspIssueList
        data={{
          warnings: [
            { section_code: 'A', course_name: 'Algoritmos', message: 'Seccion A no tiene aula asignada.' },
            { section_code: 'B', course_name: 'Calculo', message: 'Seccion B no tiene docente asignado.' },
            { section_code: 'C', course_name: 'Fisica', message: 'No hay disponibilidad registrada.' },
          ],
          conflicts: [{ section: 'D', course: 'Base de datos', severity: 'CRITICAL', message: 'Conflicto de horario detectado.' }],
        }}
      />
    )

    expect(screen.getByText(/Advertencias detectadas: 4/i)).toBeInTheDocument()
    expect(screen.getByText(/1 sin aula asignada/i)).toBeInTheDocument()
    expect(screen.getByText(/1 sin docente asignado/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Sin docente' }))
    expect(screen.getByText('Calculo')).toBeInTheDocument()
    expect(screen.queryByText('Algoritmos')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Alta severidad' }))
    expect(screen.getByText('Base de datos')).toBeInTheDocument()
    expect(screen.queryByText('Calculo')).not.toBeInTheDocument()
  })
})

describe('CspPreviewResult', () => {
  it('no renderiza nada si no hay datos', () => {
    const { container } = render(<CspPreviewResult data={null} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('explica causas cuando no hay secciones listas', () => {
    render(<CspPreviewResult data={{ total_offerings: 5, warnings: ['Seccion A no tiene aula asignada.'] }} />)

    expect(screen.getByText(/No hay secciones listas para previsualizar/i)).toBeInTheDocument()
    expect(screen.getByText(/no hay docentes asignados/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Seccion A no tiene aula asignada/i).length).toBeGreaterThan(0)
  })

  it('muestra bloques de vista previa con horarios legibles', () => {
    render(
      <CspPreviewResult
        data={{
          blocks: [
            {
              section_id: 1,
              day_name: 'Lunes',
              start_time: '08:00:00',
              end_time: '09:30:00',
              course_name: 'Algoritmos',
              section_code: 'A',
              classroom_code: 'LAB-1',
            },
          ],
        }}
      />
    )

    expect(screen.getByText('Con datos')).toBeInTheDocument()
    expect(screen.getByText('Lunes')).toBeInTheDocument()
    expect(screen.getByText('08:00 - 09:30')).toBeInTheDocument()
    expect(screen.getByText('LAB-1')).toBeInTheDocument()
  })
})

describe('CspGenerationResult', () => {
  it('muestra estado vacio cuando no hay soluciones generadas', () => {
    render(<CspGenerationResult data={{ message: 'Sin datos suficientes' }} />)

    expect(screen.getByText('Sin soluciones generadas')).toBeInTheDocument()
    expect(screen.getByText(/No hay soluciones para guardar/i)).toBeInTheDocument()
  })

  it('muestra soluciones y ejecuta callback de guardar', () => {
    const onSaveSolution = vi.fn()
    render(
      <CspGenerationResult
        onSaveSolution={onSaveSolution}
        savingSolutionIndex={1}
        data={{
          generated_blocks: 2,
          best_score: 91.5,
          strategy: 'greedy',
          solutions: [
            {
              solution_index: 1,
              score_total: 91.5,
              blocks: [
                {
                  day_name: 'Martes',
                  start_time: '10:00:00',
                  end_time: '11:30:00',
                  course_name: 'Programacion',
                  section_code: 'A',
                  classroom_code: 'LAB-2',
                },
              ],
            },
          ],
        }}
      />
    )

    expect(screen.getByText('Generacion completada')).toBeInTheDocument()
    expect(screen.getByText('greedy')).toBeInTheDocument()
    const section = screen.getByText(/Solucion 2/i).closest('article')
    expect(within(section).getByText('Programacion')).toBeInTheDocument()
    const button = screen.getByRole('button', { name: /Guardando/i })
    expect(button).toBeDisabled()
  })
})
