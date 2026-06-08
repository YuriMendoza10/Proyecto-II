// D:\TALLER 2\optiacademic\frontend\src\tests\setup.js
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import React from 'react'

globalThis.React = React

// Limpiar después de cada prueba
afterEach(() => {
    cleanup()
    vi.clearAllMocks()
    document.documentElement.classList.remove('dark', 'dark-theme')
})

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
