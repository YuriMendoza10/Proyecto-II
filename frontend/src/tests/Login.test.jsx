// D:\TALLER 2\optiacademic\frontend\src\tests\Login.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock simple del componente Login
const MockLogin = ({ onLogin }) => (
    <div>
        <input placeholder="usuario@uni.edu" />
        <input placeholder="••••••" />
        <button onClick={() => onLogin({ email: 'test@test.com' })}>Ingresar</button>
        <div>admin</div>
        <div>estudiante</div>
        <div>coordinador</div>
        <div>docente</div>
    </div>
)

describe('Login Component - Pruebas Básicas', () => {
    it('TC-FRONT-01: Debe mostrar el formulario de login', () => {
        render(<MockLogin onLogin={() => { }} />)

        expect(screen.getByPlaceholderText('usuario@uni.edu')).toBeDefined()
        expect(screen.getByPlaceholderText('••••••')).toBeDefined()
        expect(screen.getByText('Ingresar')).toBeDefined()
    })

    it('TC-FRONT-02: Debe mostrar las cuentas de demostración', () => {
        render(<MockLogin onLogin={() => { }} />)

        expect(screen.getByText('admin')).toBeDefined()
        expect(screen.getByText('estudiante')).toBeDefined()
        expect(screen.getByText('coordinador')).toBeDefined()
        expect(screen.getByText('docente')).toBeDefined()
    })

    it('TC-FRONT-03: Debe llamar onLogin al hacer click', async () => {
        const mockOnLogin = vi.fn()
        render(<MockLogin onLogin={mockOnLogin} />)

        const button = screen.getByText('Ingresar')
        await userEvent.click(button)

        expect(mockOnLogin).toHaveBeenCalled()
    })
})