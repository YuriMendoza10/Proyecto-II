const toneClasses = {
  blue: 'border-blue-200 bg-blue-50 text-blue-800',
  green: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  orange: 'border-orange-200 bg-orange-50 text-orange-900',
  red: 'border-red-200 bg-red-50 text-red-800',
  slate: 'border-slate-200 bg-white text-slate-800',
}

export default function MetricCard({
  title,
  value,
  unit,
  description,
  status,
  icon: Icon,
  tone = 'slate',
}) {
  return (
    <article className={`rounded-lg border p-5 shadow-sm ${toneClasses[tone] || toneClasses.slate}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold">{title}</p>
        {Icon ? <Icon aria-hidden="true" className="h-5 w-5 shrink-0" /> : null}
      </div>
      <p className="mt-3 text-3xl font-bold leading-tight text-slate-950">
        {value}
        {unit ? <span className="ml-1 text-base font-semibold text-slate-700">{unit}</span> : null}
      </p>
      {description ? <p className="mt-2 text-sm leading-5 text-slate-700">{description}</p> : null}
      {status ? <p className="mt-2 text-sm font-semibold text-slate-800">{status}</p> : null}
    </article>
  )
}
