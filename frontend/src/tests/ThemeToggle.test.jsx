import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import ThemeToggle from '../components/common/ThemeToggle'

describe('ThemeToggle', () => {
  it('renderiza el boton de tema', () => {
    render(<ThemeToggle />)

    expect(screen.getByRole('button', { name: /cambiar a modo oscuro/i })).toBeInTheDocument()
  })

  it('cambia a modo oscuro, actualiza localStorage y aplica clase dark', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)

    await user.click(screen.getByRole('button', { name: /cambiar a modo oscuro/i }))

    expect(localStorage.setItem).toHaveBeenCalledWith('optiacademic_theme', 'dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
})
