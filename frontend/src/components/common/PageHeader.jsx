export default function PageHeader({ eyebrow, title, description, actions }) {
    return (
        <header className="flex flex-col justify-between gap-4 rounded-2xl border bg-white p-6 shadow-sm lg:flex-row lg:items-center">
            <div>
                {eyebrow && <p className="text-xs font-bold uppercase tracking-widest text-orange-600">{eyebrow}</p>}
                <h1 className="mt-1 text-3xl font-bold text-slate-900">{title}</h1>
                {description && <p className="mt-2 max-w-3xl text-sm text-slate-700">{description}</p>}
            </div>
            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </header>
    )
}
