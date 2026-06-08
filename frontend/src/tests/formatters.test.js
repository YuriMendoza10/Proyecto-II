import { describe, expect, it } from 'vitest'

import { formatBytes, formatCO2, formatMilliseconds, formatPercent } from '../utils/formatters'

describe('formatters', () => {
  it('formatea porcentajes con espacio de unidad', () => {
    expect(formatPercent(6)).toBe('6 %')
  })

  it('formatea CO2 con seis decimales', () => {
    expect(formatCO2(0.0000297237)).toContain('0.000030')
  })

  it('formatea milisegundos', () => {
    expect(formatMilliseconds(8.36)).toBe('8.36 ms')
  })

  it('formatea bytes a KB', () => {
    expect(formatBytes(39403.52)).toBe('38.48 KB')
  })

  it('maneja valores nulos sin romper', () => {
    expect(formatCO2(null)).toContain('0.000000')
    expect(formatBytes(undefined)).toBe('0 B')
  })
})
