// D:\TALLER 2\optiacademic\frontend\src\tests\setup.js
import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import React from 'react'
import { server } from './msw/server'
import { invalidateCache } from '../utils/serviceCache'

globalThis.React = React

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))

// Limpiar después de cada prueba
afterEach(() => {
    cleanup()
    vi.clearAllMocks()
    server.resetHandlers()
    invalidateCache('academic-periods', 'academic-programs', 'curriculum-plans')
    document.documentElement.classList.remove('dark', 'dark-theme')
})

afterAll(() => server.close())

// Mock de localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
}
globalThis.localStorage = localStorageMock

// Mock de sessionStorage
const sessionStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
}
globalThis.sessionStorage = sessionStorageMock

// Mock de fetch
globalThis.fetch = vi.fn()

// Mock de console para evitar ruido
console.error = vi.fn()
console.log = vi.fn()
console.warn = vi.fn()
