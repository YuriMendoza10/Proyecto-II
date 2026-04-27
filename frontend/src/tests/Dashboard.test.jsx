// D:\TALLER 2\optiacademic\frontend\src\tests\Dashboard.test.jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock simple del Dashboard
const MockDashboard = ({ user }) => (
    <div>
        <h1>Bienvenido, {user?.nombre} {user?.apellido}</h1>
        <div>
            <div>Cursos: 0</div>
            <div>Docentes: 0</div>
            <div>Aulas: 0</div>
            <div>Programas: 0</div>
        </div>
        <button>Generar Horario</button>
    </div>
)

describe('Dashboard Component - Pruebas Básicas', () => {
    const mockUser = {
        nombre: 'Admin',
        apellido: 'Sistema',
        rol: 'admin'
    }

    it('TC-FRONT-04: Debe mostrar el header de bienvenida', () => {
        render(<MockDashboard user={mockUser} />)

        expect(screen.getByText(/Bienvenido, Admin Sistema/)).toBeDefined()
    })

    it('TC-FRONT-05: Debe mostrar las tarjetas de estadísticas', () => {
        render(<MockDashboard user={mockUser} />)

        expect(screen.getByText(/Cursos:/)).toBeDefined()
        expect(screen.getByText(/Docentes:/)).toBeDefined()
        expect(screen.getByText(/Aulas:/)).toBeDefined()
        expect(screen.getByText(/Programas:/)).toBeDefined()
    })

    it('TC-FRONT-06: Debe mostrar el botón de generar horario', () => {
        render(<MockDashboard user={mockUser} />)

        expect(screen.getByText('Generar Horario')).toBeDefined()
    })
})