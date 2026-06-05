import { useState } from 'react'
import { History, Search } from 'lucide-react'
import toast from 'react-hot-toast'

import { traceabilityService } from '../../services/traceabilityService'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import LoadingState from '../../components/common/LoadingState'
import StatusBadge from '../../components/common/StatusBadge'
import { safeArray } from '../../utils/safeData'
import { replaceEndpointsWithLabels } from '../../utils/endpointLabels'

export default function TraceabilityPage() {
    const [mode, setMode] = useState('schedule')
    const [id, setId] = useState('')
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)

    const search = async () => {
        if (!id) return toast.error('Ingresa un identificador.')
        setLoading(true)
        setError(false)
        try {
            const value = mode === 'schedule'
                ? await traceabilityService.getScheduleTrace(Number(id))
                : await traceabilityService.getChangeRequestTrace(Number(id))
            setData(value)
        } catch {
            setError(true)
            toast.error('No se pudo consultar la trazabilidad.')
        } finally {
            setLoading(false)
        }
    }
    const changes = Array.isArray(data) ? data : safeArray(data?.changes)
    const publications = Array.isArray(data) ? [] : safeArray(data?.publications)

    return <div className="space-y-6">
        <header className="rounded-2xl border bg-white p-6">
            <h1 className="flex items-center gap-3 text-3xl font-bold"><History className="text-orange-600" /> Trazabilidad</h1>
            <p className="mt-2 text-slate-500">Historial de publicaciones y decisiones sobre solicitudes docentes.</p>
        </header>
        <section className="flex flex-wrap items-end gap-3 rounded-2xl border bg-white p-5">
            <label className="text-sm font-semibold text-slate-800">Tipo de consulta<select value={mode} onChange={(event) => { setMode(event.target.value); setData(null) }} className="mt-1 block rounded-xl border border-slate-300 p-3">
                <option value="schedule">Horario</option><option value="request">Solicitud de cambio</option>
            </select></label>
            <label className="text-sm font-semibold text-slate-800">Identificador<input type="number" min="1" value={id} onChange={(event) => setId(event.target.value)} placeholder={mode === 'schedule' ? 'ID de horario' : 'ID de solicitud'} className="mt-1 block rounded-xl border border-slate-300 p-3" /></label>
            <button onClick={search} className="flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white"><Search size={18} /> Consultar</button>
        </section>
        {loading && <LoadingState title="Consultando trazabilidad..." />}
        {error && !loading && <ErrorState onRetry={search} />}
        {data && !loading && !error && <section className="space-y-4">
            {publications.map((item) => <article key={`publication-${item.id}`} className="rounded-2xl border border-emerald-100 bg-white p-5">
                <p className="text-sm font-bold text-emerald-800">PUBLICACIÓN</p>
                <p className="mt-2 font-semibold"><StatusBadge value={item.previous_status} /> <span className="mx-2">a</span> <StatusBadge value={item.new_status} /></p>
                <p className="mt-1 text-sm text-slate-600">{item.publication_notes}</p>
                <p className="mt-3 text-sm text-slate-700">Docentes: {item.affected_teachers_count} | Estudiantes: {item.affected_students_count} | Secciones: {item.affected_sections_count}</p>
            </article>)}
            {changes.map((item) => <article key={`change-${item.id}`} className="rounded-2xl border bg-white p-5">
                <StatusBadge value={item.change_type} />
                <p className="mt-2 text-sm text-slate-700">{replaceEndpointsWithLabels(item.description)}</p>
                <p className="mt-2 text-sm text-slate-700">{new Date(item.created_at).toLocaleString('es-PE')}</p>
            </article>)}
            {!publications.length && !changes.length && <EmptyState title="Sin eventos registrados para este identificador." />}
        </section>}
    </div>
}
