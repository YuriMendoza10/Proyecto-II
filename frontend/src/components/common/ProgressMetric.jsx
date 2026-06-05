import { formatPercent } from '../../utils/formatters'

export default function ProgressMetric({
  label,
  value,
  exactValue,
  max = 100,
  className = '',
}) {
  const numericValue = Number(value) || 0
  const boundedValue = Math.max(0, Math.min(max, numericValue))
  const percentage = max ? (boundedValue / max) * 100 : 0

  return (
    <div className={`min-w-40 ${className}`.trim()}>
      <div className="mb-1 flex items-center justify-between gap-3 text-sm text-slate-800">
        <span className="font-medium">{label}</span>
        <span className="font-semibold tabular-nums">{formatPercent(percentage, 1)}</span>
      </div>
      <div
        aria-label={`${label}: ${formatPercent(percentage, 1)}`}
        aria-valuemax={max}
        aria-valuemin={0}
        aria-valuenow={boundedValue}
        className="h-3 overflow-hidden rounded-full bg-slate-200 ring-1 ring-inset ring-slate-300"
        role="progressbar"
      >
        <div className="h-full rounded-full bg-blue-700" style={{ width: `${percentage}%` }} />
      </div>
      {exactValue ? <p className="mt-1 text-sm text-slate-700">{exactValue}</p> : null}
    </div>
  )
}
