import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { scheduleChangeRequestService } from '../../services/scheduleChangeRequestService'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import LoadingState from '../../components/common/LoadingState'
import StatusBadge from '../../components/common/StatusBadge'
import { safeArray } from '../../utils/safeData'

export default function CoordinatorChangeRequestsPage() {
    const [items, setItems] = useState([])
    const [status, setStatus] = useState('')
    const [responses, setResponses] = useState({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const load = async (nextStatus = status) => {
        setLoading(true)
        setError(false)
        try {
            setItems(safeArray(await scheduleChangeRequestService.listForCoordinator(nextStatus ? { status: nextStatus } : {})))
        } catch (requestError) {
            setError(true)
            throw requestError
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => { load().catch(() => toast.error('No se pudieron cargar las solicitudes.')) }, [])
    const resolve = async (id, nextStatus) => {
        const response = responses[id] || (nextStatus === 'APPROVED' ? 'Solicitud aprobada para coordinacion posterior.' : 'Solicitud rechazada por coordinacion.')
        await scheduleChangeRequestService.resolve(id, { status: nextStatus, coordinator_response: response }); await load(); toast.success('Solicitud resuelta. El docente fue notificado.')
    }
    return <div className="space-y-5"><header className="flex justify-between"><div><h1 className="text-2xl font-bold">Solicitudes docentes</h1><p className="text-slate-500">Resolver solicitudes sin alterar automaticamente horarios publicados.</p></div><select className="rounded-xl border p-3" value={status} onChange={(e) => { setStatus(e.target.value); load(e.target.value) }}><option value="">Todos</option><option>PENDING</option><option>APPROVED</option><option>REJECTED</option><option>CANCELLED</option></select></header>
        {loading && <LoadingState title="Cargando solicitudes docentes..." />}
        {error && !loading && <ErrorState onRetry={() => load().catch(() => toast.error('No se pudieron cargar las solicitudes.'))} />}
        {!loading && !error && items.map((item) => <article key={item.id} className="rounded-2xl border bg-white p-5"><p className="font-bold">{item.teacher_name || 'Docente'} | {item.request_type} | <StatusBadge value={item.status} /></p><p className="text-sm">{item.course_name || 'Solicitud general'} - Seccion {item.section_code || '-'}</p><p className="mt-2 text-sm text-slate-600">{item.reason}</p>{item.status === 'PENDING' && <><textarea className="mt-3 w-full rounded-xl border p-3" placeholder="Respuesta de coordinacion" value={responses[item.id] || ''} onChange={(e) => setResponses({ ...responses, [item.id]: e.target.value })} /><div className="mt-3 flex gap-2"><button onClick={() => resolve(item.id, 'APPROVED')} className="rounded-lg bg-emerald-600 px-4 py-2 font-bold text-white">Aprobar</button><button onClick={() => resolve(item.id, 'REJECTED')} className="rounded-lg bg-red-600 px-4 py-2 font-bold text-white">Rechazar</button></div></>}</article>)}
        {!loading && !error && !items.length && <EmptyState title="No hay solicitudes docentes para revisar." />}
    </div>
}
