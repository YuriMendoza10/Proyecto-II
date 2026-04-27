// D:\TALLER 2\optiacademic\frontend\src\tests\setup.js
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// Limpiar después de cada prueba
afterEach(() => {
    cleanup()
})

// Mock de localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
}
global.localStorage = localStorageMock

// Mock de sessionStorage
const sessionStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
}
global.sessionStorage = sessionStorageMock

// Mock de fetch
global.fetch = vi.fn()

// Mock de console para evitar ruido
console.error = vi.fn()
console.log = vi.fn()
console.warn = vi.fn()