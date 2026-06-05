import { CheckCircle2, ShieldAlert } from 'lucide-react'

import CspMetricCard from './CspMetricCard'
import CspTechnicalDetails from './CspTechnicalDetails'

export default function CspPreparationResult({ data }) {
    if (!data) return null
    const ok = data.success !== false

    return (
        <section className={`rounded-3xl border p-6 shadow-sm ${ok ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
            <div className="flex items-start gap-3">
                <div className={`rounded-2xl p-3 ${ok ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {ok ? <CheckCircle2 size={24} /> : <ShieldAlert size={24} />}
                </div>
                <div>
                    <h2 className="text-2xl font-black text-slate-900">
                        {ok ? 'Datos demo preparados' : 'Preparacion incompleta'}
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">{data.message}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                        {data.period} | {data.program} | {data.plan}
                    </p>
                </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
                <CspMetricCard label="Ciclos" value={(data.cycles_prepared || []).join(', ') || '-'} tone="neutral" />
                <CspMetricCard label="Ofertas revisadas" value={data.offerings_reviewed ?? '-'} tone="info" />
                <CspMetricCard label="Creadas" value={data.offerings_created ?? 0} tone="success" />
                <CspMetricCard label="Actualizadas" value={data.offerings_updated ?? 0} tone="success" />
                <CspMetricCard label="APPROVED" value={data.offerings_approved ?? 0} tone="success" />
                <CspMetricCard label="Disponibilidades" value={data.teacher_availability_created ?? 0} tone="info" />
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-4">
                <CspMetricCard label="Docentes asignados" value={data.teachers_assigned ?? 0} tone="neutral" />
                <CspMetricCard label="Aulas asignadas" value={data.classrooms_assigned ?? 0} tone="neutral" />
                <CspMetricCard label="Docentes creados" value={data.created_teachers ?? 0} tone="neutral" />
                <CspMetricCard label="Aulas creadas" value={data.created_classrooms ?? 0} tone="neutral" />
            </div>

            <MessageList title="Warnings" items={data.warnings} tone="warning" />
            <MessageList title="Errores" items={data.errors} tone="danger" />
            <CspTechnicalDetails data={data} />
        </section>
    )
}

function MessageList({ title, items = [], tone }) {
    if (!items.length) return null
    const classes = tone === 'danger' ? 'border-red-200 bg-red-50 text-red-700' : 'border-amber-200 bg-amber-50 text-amber-700'
    return (
        <div className={`mt-5 rounded-2xl border p-4 ${classes}`}>
            <p className="font-black">{title}</p>
            <ul className="mt-2 list-disc pl-5 text-sm">
                {items.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
            </ul>
        </div>
    )
}
