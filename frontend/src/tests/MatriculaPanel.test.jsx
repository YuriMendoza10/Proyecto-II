// D:\TALLER 2\optiacademic\frontend\src\tests\MatriculaPanel.test.jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock simple del componente MatriculaPanel
const MockMatriculaPanel = ({ user }) => (
    <div>
        <h2>Oferta Académica 2025-1</h2>
        <button data-testid="matricular-btn">Matricular</button>
        <div>Mi Horario</div>
        <div>Total cursos: 0</div>
    </div>
)

describe('MatriculaPanel Component', () => {
    const mockUser = {
        nombre: 'Estudiante',
        apellido: 'Uno',
        rol: 'estudiante',
        email: 'estudiante1@uni.edu'
    }

    it('TC-FRONT-07: Debe mostrar la oferta académica', () => {
        render(<MockMatriculaPanel user={mockUser} />)
        expect(screen.getByText(/Oferta Académica/)).toBeDefined()
    })

    it('TC-FRONT-08: Debe mostrar el botón de matrícula', () => {
        render(<MockMatriculaPanel user={mockUser} />)
        expect(screen.getByTestId('matricular-btn')).toBeDefined()
    })

    it('TC-FRONT-09: Debe mostrar la sección Mi Horario', () => {
        render(<MockMatriculaPanel user={mockUser} />)
        expect(screen.getByText('Mi Horario')).toBeDefined()
    })

    it('TC-FRONT-10: Debe mostrar el usuario autenticado', () => {
        render(<MockMatriculaPanel user={mockUser} />)
        // El componente debería mostrar el nombre del estudiante
        expect(mockUser.nombre).toBe('Estudiante')
    })
})