import { AlertTriangle, CheckCircle2, Clock3, Info, XCircle } from 'lucide-react'

const statuses = {
    ACTIVE: ['Activo', 'bg-emerald-50 text-emerald-900 border-emerald-700', CheckCircle2],
    INACTIVE: ['Inactivo', 'bg-slate-100 text-slate-900 border-slate-600', XCircle],
    PUBLISHED: ['Publicado', 'bg-emerald-50 text-emerald-900 border-emerald-700', CheckCircle2],
    APPROVED: ['Aprobado', 'bg-blue-50 text-blue-900 border-blue-700', CheckCircle2],
    ENROLLED: ['Matriculado', 'bg-emerald-50 text-emerald-900 border-emerald-700', CheckCircle2],
    RESERVED: ['Reserva', 'bg-amber-50 text-amber-950 border-amber-700', Clock3],
    GRADUATED: ['Graduado', 'bg-indigo-50 text-indigo-950 border-indigo-700', CheckCircle2],
    WITHDRAWN: ['Retirado', 'bg-slate-100 text-slate-900 border-slate-600', XCircle],
    SUSPENDED: ['Suspendido', 'bg-red-50 text-red-950 border-red-700', XCircle],
    FAILED: ['Desaprobado', 'bg-red-50 text-red-950 border-red-700', XCircle],
    IN_PROGRESS: ['En progreso', 'bg-amber-50 text-amber-950 border-amber-700', Clock3],
    PENDING_REVIEW: ['Revisión pendiente', 'bg-indigo-50 text-indigo-950 border-indigo-700', Clock3],
    READY: ['Listo', 'bg-indigo-50 text-indigo-950 border-indigo-700', CheckCircle2],
    DRAFT: ['Borrador', 'bg-slate-100 text-slate-900 border-slate-600', Info],
    PENDING: ['Pendiente', 'bg-amber-50 text-amber-950 border-amber-700', Clock3],
    REJECTED: ['Rechazado', 'bg-red-50 text-red-950 border-red-700', XCircle],
    OVERLOADED: ['Sobrecargado', 'bg-red-50 text-red-950 border-red-700', AlertTriangle],
    WARNING: ['Advertencia', 'bg-amber-50 text-amber-950 border-amber-700', AlertTriangle],
    ERROR: ['Error', 'bg-red-50 text-red-950 border-red-700', XCircle],
    SUCCESS: ['Éxito', 'bg-emerald-50 text-emerald-900 border-emerald-700', CheckCircle2],
    INFO: ['Información', 'bg-blue-50 text-blue-900 border-blue-700', Info],
    NORMAL: ['Normal', 'bg-emerald-50 text-emerald-900 border-emerald-700', CheckCircle2],
}

export default function StatusBadge({ value }) {
    const [label, className, Icon] = statuses[value] || [value || 'Sin estado', 'bg-slate-50 text-slate-900 border-slate-600', Info]
    return (
        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${className}`}>
            <Icon size={13} aria-hidden="true" />
            {label}
        </span>
    )
}
