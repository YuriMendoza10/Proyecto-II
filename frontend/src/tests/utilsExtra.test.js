import { describe, expect, it } from 'vitest'
import { extractList, getErrorMessage } from '../utils/extractList'
import { normalizeApiError, safeArray, safeObject } from '../utils/safeData'

describe('extractList', () => {
  it('extrae listas desde formatos comunes de API', () => {
    expect(extractList(null)).toEqual([])
    expect(extractList([{ id: 1 }])).toEqual([{ id: 1 }])
    expect(extractList({ items: [1] })).toEqual([1])
    expect(extractList({ results: [2] })).toEqual([2])
    expect(extractList({ data: [3] })).toEqual([3])
    expect(extractList({ records: [4] })).toEqual([4])
    expect(extractList({ users: ['u'] })).toEqual(['u'])
    expect(extractList({ academic_schedules: ['h'] })).toEqual(['h'])
    expect(extractList({ unknown: [] })).toEqual([])
  })

  it('normaliza mensajes de error de FastAPI', () => {
    expect(getErrorMessage({}, 'Fallback')).toBe('Fallback')
    expect(getErrorMessage({ response: { data: { detail: 'Credenciales invalidas' } } })).toBe('Credenciales invalidas')
    expect(getErrorMessage({ response: { data: { detail: [{ msg: 'Campo requerido' }] } } })).toBe('Campo requerido')
    expect(getErrorMessage({ response: { data: { detail: { msg: 'No autorizado' } } } })).toBe('No autorizado')
    expect(getErrorMessage({ response: { data: { detail: { code: 1 } } } })).toBe('{"code":1}')
  })
})

describe('safeData', () => {
  it('safeArray maneja arrays, items, data y valores nulos', () => {
    expect(safeArray([1, 2])).toEqual([1, 2])
    expect(safeArray({ items: ['a'] })).toEqual(['a'])
    expect(safeArray({ data: ['b'] })).toEqual(['b'])
    expect(safeArray(undefined)).toEqual([])
  })

  it('safeObject evita arrays y valores primitivos', () => {
    expect(safeObject({ ok: true })).toEqual({ ok: true })
    expect(safeObject([1])).toEqual({})
    expect(safeObject(null)).toEqual({})
    expect(safeObject('texto')).toEqual({})
  })

  it('normalizeApiError prioriza detail, message y fallback', () => {
    expect(normalizeApiError({ response: { data: { detail: 'Error detallado' } } })).toBe('Error detallado')
    expect(normalizeApiError({ response: { data: { detail: { message: 'Error objeto' } } } })).toBe('Error objeto')
    expect(normalizeApiError({ message: 'Error JS' })).toBe('Error JS')
    expect(normalizeApiError({}, 'Fallback')).toBe('Fallback')
  })
})
