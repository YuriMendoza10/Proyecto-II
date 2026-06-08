import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import PaginationControls from '../components/common/PaginationControls'

describe('PaginationControls', () => {
  it('muestra pagina actual y total de registros', () => {
    render(<PaginationControls page={2} pageSize={20} total={45} onPageChange={() => {}} onPageSizeChange={() => {}} />)

    expect(screen.getByText(/Mostrando/i)).toBeInTheDocument()
    expect(screen.getByText(/Página 2 de 3/i)).toBeInTheDocument()
  })

  it('permite avanzar y retroceder pagina', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(<PaginationControls page={2} pageSize={20} total={45} onPageChange={onPageChange} onPageSizeChange={() => {}} />)

    await user.click(screen.getByRole('button', { name: /pagina anterior/i }))
    await user.click(screen.getByRole('button', { name: /pagina siguiente/i }))

    expect(onPageChange).toHaveBeenNthCalledWith(1, 1)
    expect(onPageChange).toHaveBeenNthCalledWith(2, 3)
  })

  it('deshabilita botones en primera y ultima pagina', () => {
    const { rerender } = render(<PaginationControls page={1} pageSize={20} total={20} onPageChange={() => {}} onPageSizeChange={() => {}} />)
    expect(screen.getByRole('button', { name: /pagina anterior/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /pagina siguiente/i })).toBeDisabled()

    rerender(<PaginationControls page={3} pageSize={20} total={45} onPageChange={() => {}} onPageSizeChange={() => {}} />)
    expect(screen.getByRole('button', { name: /pagina siguiente/i })).toBeDisabled()
  })
})
