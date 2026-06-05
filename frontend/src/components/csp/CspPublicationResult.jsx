import { CheckCircle2, ShieldAlert } from 'lucide-react'

import CspIssueList from './CspIssueList'
import CspMetricCard from './CspMetricCard'
import CspTechnicalDetails from './CspTechnicalDetails'

export default function CspPublicationResult({ data, error }) {
    if (!data && !error) return null

    const ok = Boolean(data) && !error
    const payload = data || error

    return (
        <section className={`rounded-3xl border p-6 shadow-sm ${ok ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
            <div className="flex items-start gap-3">
                <div className={`rounded-2xl p-3 ${ok ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {ok ? <CheckCircle2 size={24} /> : <ShieldAlert size={24} />}
                </div>
                <div>
                    <h2 className="text-2xl font-black text-slate-900">
                        {ok ? 'Horario publicado correctamente' : 'No se pudo publicar el horario'}
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                        {payload?.message || payload?.detail || (ok ? 'La publicacion validada finalizo correctamente.' : 'El servidor rechazo la operacion o encontro conflictos criticos.')}
                    </p>
                </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
                <CspMetricCard label="Horario" value={payload?.schedule_id || payload?.academic_schedule_id || '-'} tone={ok ? 'success' : 'danger'} />
                <CspMetricCard label="Estado" value={payload?.new_status || payload?.status || '-'} tone={ok ? 'success' : 'warning'} />
                <CspMetricCard label="Bloques" value={payload?.published_blocks || payload?.blocks_count || payload?.total_blocks || '-'} tone="info" />
                <CspMetricCard label="Docentes notificados" value={payload?.affected_teachers_count || payload?.teachers_notified || '-'} tone="neutral" />
                <CspMetricCard label="Estudiantes notificados" value={payload?.affected_students_count || payload?.students_notified || '-'} tone="neutral" />
                <CspMetricCard label="Ofertas actualizadas" value={payload?.affected_sections_count || payload?.offerings_updated || '-'} tone="neutral" />
            </div>

            {!ok && (
                <div className="mt-6 rounded-3xl bg-white p-5">
                    <h3 className="mb-3 text-lg font-black text-slate-900">Bloqueos detectados</h3>
                    <CspIssueList data={payload} emptyText="No se recibio una lista estructurada de bloqueos." />
                </div>
            )}

            <CspTechnicalDetails data={payload} />
        </section>
    )
}
