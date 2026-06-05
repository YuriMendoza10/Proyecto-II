export default function SectionCard({ title, subtitle, actions, children, className = '' }) {
  return (
    <section className={`rounded-lg border border-slate-200 bg-white shadow-sm ${className}`.trim()}>
      {(title || subtitle || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            {title ? <h2 className="text-lg font-bold text-slate-950">{title}</h2> : null}
            {subtitle ? <p className="mt-1 text-sm leading-5 text-slate-700">{subtitle}</p> : null}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  )
}
