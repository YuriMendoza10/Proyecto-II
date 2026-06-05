import { useEffect, useState } from 'react'
import { Bell, CheckCheck, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

import { notificationService } from '../../services/notificationService'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import LoadingState from '../../components/common/LoadingState'
import StatusBadge from '../../components/common/StatusBadge'
import { safeArray } from '../../utils/safeData'

export default function NotificationPage() {
    const [items, setItems] = useState([])
    const [filter, setFilter] = useState('')
    const [type, setType] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    const load = async (readValue = filter, typeValue = type) => {
        const params = {}
        if (readValue !== '') params.is_read = readValue === 'read'
        if (typeValue) params.notification_type = typeValue
        setError(false)
        setLoading(true)
        try {
            const data = await notificationService.listMine(params)
            setItems(safeArray(data.notifications))
        } catch (requestError) {
            setError(true)
            throw requestError
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        notificationService.listMine({})
            .then((data) => setItems(safeArray(data.notifications)))
            .catch(() => setError(true))
            .finally(() => setLoading(false))
    }, [])

    const markAll = async () => {
        await notificationService.markAllRead()
        await load()
        toast.success('Notificaciones marcadas como leidas.')
    }
    const markOne = async (id) => {
        await notificationService.markRead(id)
        await load()
    }
    const remove = async (id) => {
        await notificationService.remove(id)
        await load()
    }

    return <div className="space-y-6">
        <header className="flex flex-col justify-between gap-4 rounded-2xl border bg-white p-6 md:flex-row md:items-center">
            <div>
                <h1 className="flex items-center gap-3 text-3xl font-bold"><Bell className="text-orange-600" /> Notificaciones</h1>
                <p className="mt-2 text-slate-700">Avisos internos relacionados con tus horarios y operaciones.</p>
            </div>
            <button onClick={markAll} className="flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 font-semibold text-white"><CheckCheck size={18} /> Marcar todas leidas</button>
        </header>
        <section className="flex flex-wrap gap-3 rounded-2xl border bg-white p-4">
            <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700">Estado de lectura<select value={filter} onChange={(event) => { setFilter(event.target.value); load(event.target.value, type) }} className="rounded-xl border px-4 py-2">
                <option value="">Todas</option><option value="unread">No leidas</option><option value="read">Leidas</option>
            </select></label>
            <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700">Tipo de notificación<select value={type} onChange={(event) => { setType(event.target.value); load(filter, event.target.value) }} className="rounded-xl border px-4 py-2">
                <option value="">Todos los tipos</option>
                {['INFO', 'SUCCESS', 'WARNING', 'ERROR', 'SCHEDULE_PUBLISHED', 'CHANGE_REQUEST', 'OFFERING_UPDATED', 'CSP_GENERATED', 'REPORT_READY'].map((value) => <option key={value}>{value}</option>)}
            </select></label>
        </section>
        <section className="space-y-3">
            {loading && <LoadingState title="Cargando notificaciones..." />}
            {error && !loading && <ErrorState onRetry={() => load().catch(() => toast.error('No se pudieron cargar las notificaciones.'))} />}
            {!loading && !error && items.map((item) => <article key={item.id} className={`flex justify-between gap-4 rounded-2xl border bg-white p-5 ${item.is_read ? '' : 'border-orange-200'}`}>
                <div>
                    <div className="flex items-center gap-2"><StatusBadge value={item.notification_type} />{!item.is_read && <span className="text-sm font-bold text-orange-800">No leída</span>}</div>
                    <h2 className="mt-3 font-bold text-slate-900">{item.title}</h2>
                    <p className="mt-1 text-sm text-slate-600">{item.message}</p>
                    <p className="mt-2 text-sm text-slate-700">{new Date(item.created_at).toLocaleString('es-PE')}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                    {!item.is_read && <button onClick={() => markOne(item.id)} className="rounded-lg border p-2 text-emerald-700" aria-label={`Marcar como leída: ${item.title}`}><CheckCheck size={17} aria-hidden="true" /></button>}
                    <button onClick={() => remove(item.id)} className="rounded-lg border p-2 text-red-700" aria-label={`Eliminar notificación: ${item.title}`}><Trash2 size={17} aria-hidden="true" /></button>
                </div>
            </article>)}
            {!loading && !error && !items.length && <EmptyState title="No hay notificaciones para mostrar." />}
        </section>
    </div>
}
