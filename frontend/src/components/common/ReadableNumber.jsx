import {
  formatBytes,
  formatCO2,
  formatDecimal,
  formatInteger,
  formatMilliseconds,
  formatPercent,
} from '../../utils/formatters'

const formatters = {
  bytes: formatBytes,
  co2: formatCO2,
  decimal: formatDecimal,
  integer: formatInteger,
  milliseconds: formatMilliseconds,
  percent: formatPercent,
}

export default function ReadableNumber({ value, type = 'integer', digits, className = '' }) {
  const formatter = formatters[type] || formatDecimal
  const displayValue = formatter(value, digits)

  return (
    <span className={`tabular-nums ${className}`.trim()} title={String(value ?? 0)}>
      {displayValue}
    </span>
  )
}
