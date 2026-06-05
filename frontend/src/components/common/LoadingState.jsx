import { Loader2 } from 'lucide-react'

export default function LoadingState({ title = 'Cargando vista...', text = 'Estamos preparando la informacion.' }) {
    return (
        <div className="rounded-2xl border bg-white p-10 text-center text-slate-700 shadow-sm" role="status" aria-live="polite">
            <Loader2 className="mx-auto mb-3 animate-spin text-orange-700" size={28} aria-hidden="true" />
            <p className="font-semibold text-slate-700">{title}</p>
            <p className="mt-1 text-sm">{text}</p>
        </div>
    )
}
