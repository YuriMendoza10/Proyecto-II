import { Inbox } from 'lucide-react'

export default function EmptyState({ title = 'Sin datos para mostrar', text = 'Cuando existan registros apareceran aqui.' }) {
    return (
        <div className="rounded-2xl border border-dashed border-slate-400 bg-white p-10 text-center text-slate-700" role="status">
            <Inbox className="mx-auto mb-3 text-slate-600" size={28} aria-hidden="true" />
            <p className="font-semibold text-slate-700">{title}</p>
            <p className="mt-1 text-sm">{text}</p>
        </div>
    )
}
