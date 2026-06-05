import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { scheduleChangeRequestService } from '../../services/scheduleChangeRequestService'
import { teacherPortalService } from '../../services/teacherPortalService'
import { Header } from './TeacherSchedulePage'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import LoadingState from '../../components/common/LoadingState'
import StatusBadge from '../../components/common/StatusBadge'
import { safeArray } from '../../utils/safeData'

export default function TeacherChangeRequestsPage() {
    const [items, setItems] = useState([])
    const [blocks, setBlocks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [form, setForm] = useState({ schedule_block_id: '', request_type: 'CHANGE_TIME', requested_day_of_week: 1, requested_start_time: '07:00', requested_end_time: '08:30', reason: '' })
    const load = async () => {
        setLoading(true)
        setError(false)
        try {
            setItems(safeArray(await scheduleChangeRequestService.listMine()))
            const schedule = await teacherPortalService.getSchedule()
            setBlocks(safeArray(schedule.blocks))
        } catch (requestError) {
            setError(true)
            throw requestError
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => { load().catch(() => toast.error('No se pudieron cargar solicitudes.')) }, [])
    const submit = async (event) => {
        event.preventDefault()
        try { await scheduleChangeRequestService.createMine({ ...form, schedule_block_id: form.schedule_block_id ? Number(form.schedule_block_id) : null, requested_day_of_week: Number(form.requested_day_of_week) }); setForm({ ...form, reason: '' }); await load(); toast.success('Solicitud registrada.') }
        catch (error) { toast.error(error.response?.data?.detail || 'No se pudo registrar la solicitud.') }
    }
    return <div className="space-y-5"><Header title="Solicitudes de cambio" text="La coordinacion revisa tu solicitud; no modifica automaticamente el horario." />
        <form onSubmit={submit} className="grid gap-3 rounded-2xl border bg-white p-5 md:grid-cols-3">
            <select required className="rounded-xl border p-3" value={form.schedule_block_id} onChange={(e) => setForm({ ...form, schedule_block_id: e.target.value })}><option value="">Selecciona clase publicada</option>{blocks.map((block) => <option key={block.schedule_block_id} value={block.schedule_block_id}>{block.course_name} - Dia {block.day_of_week} {String(block.start_time).slice(0, 5)}</option>)}</select>
            <select className="rounded-xl border p-3" value={form.request_type} onChange={(e) => setForm({ ...form, request_type: e.target.value })}><option>CHANGE_TIME</option><option>CHANGE_CLASSROOM</option><option>SWAP_SECTION</option><option>AVAILABILITY_CONFLICT</option><option>OTHER</option></select>
            <input className="rounded-xl border p-3" type="number" min="1" max="7" value={form.requested_day_of_week} onChange={(e) => setForm({ ...form, requested_day_of_week: e.target.value })} />
            <input className="rounded-xl border p-3" type="time" value={form.requested_start_time} onChange={(e) => setForm({ ...form, requested_start_time: e.target.value })} />
            <input className="rounded-xl border p-3" type="time" value={form.requested_end_time} onChange={(e) => setForm({ ...form, requested_end_time: e.target.value })} />
            <input required minLength="5" className="rounded-xl border p-3" placeholder="Motivo" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
            <button className="rounded-xl bg-orange-600 px-4 py-3 font-bold text-white md:col-span-3">Enviar solicitud</button>
        </form>
        <section className="space-y-3">
            {loading && <LoadingState title="Cargando solicitudes..." />}
            {error && !loading && <ErrorState onRetry={() => load().catch(() => toast.error('No se pudieron cargar solicitudes.'))} />}
            {!loading && !error && items.map((item) => <article key={item.id} className="rounded-2xl border bg-white p-4"><div className="flex justify-between"><p className="font-bold">{item.request_type} - {item.course_name || 'General'}</p><StatusBadge value={item.status} /></div><p className="text-sm text-slate-600">{item.reason}</p>{item.coordinator_response && <p className="mt-2 text-sm text-blue-700">Respuesta: {item.coordinator_response}</p>}{item.status === 'PENDING' && <button className="mt-3 rounded-lg border px-3 py-2 text-sm font-bold text-red-600" onClick={async () => { await scheduleChangeRequestService.cancelMine(item.id); await load() }}>Cancelar</button>}</article>)}
            {!loading && !error && !items.length && <EmptyState title="No tienes solicitudes registradas." />}
        </section>
    </div>
}
