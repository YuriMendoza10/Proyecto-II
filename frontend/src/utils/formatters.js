const numberValue = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export const formatInteger = (value) =>
  numberValue(value).toLocaleString('en-US', { maximumFractionDigits: 0 })

export const formatDecimal = (value, digits = 2) =>
  numberValue(value).toLocaleString('en-US', {
    maximumFractionDigits: digits,
    minimumFractionDigits: Math.min(digits, 2),
  })

export const formatPercent = (value, digits = 0) => `${formatDecimal(value, digits)} %`

export const formatCO2 = (value) => `${numberValue(value).toFixed(6)} g CO₂`

export const formatMilliseconds = (value) => `${formatDecimal(value, 2)} ms`

export const formatBytes = (value) => {
  const bytes = numberValue(value)
  if (Math.abs(bytes) >= 1024 * 1024) return `${formatDecimal(bytes / (1024 * 1024), 2)} MB`
  if (Math.abs(bytes) >= 1024) return `${formatDecimal(bytes / 1024, 2)} KB`
  return `${formatInteger(bytes)} B`
}

export const formatDateTime = (value) => {
  if (!value) return 'Sin fecha'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('es-PE')
}
