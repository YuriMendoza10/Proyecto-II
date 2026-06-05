import { useEffect, useState } from 'react'
import { Download, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'

import { auditLogService } from '../../services/auditLogService'
import DataTable from '../../components/common/DataTable'
import PaginationControls from '../../components/common/PaginationControls'
import StatusBadge from '../../components/common/StatusBadge'
import { safeArray } from '../../utils/safeData'
import { replaceEndpointsWithLabels } from '../../utils/endpointLabels'
import { formatDateTime } from '../../utils/formatters'

export default function AuditLogsPage() {
    const [logs, setLogs] = useState([])
    const [total, setTotal] = useState(0)
    const [filters, setFilters] = useState({ action: '', entity_type: '', user_id: '' })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(20)

    const params = (nextPage = page, nextPageSize = pageSize) => ({ ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value)), offset: (nextPage - 1) * nextPageSize, limit: nextPageSize })
    const load = async (nextPage = page, nextPageSize = pageSize) => {
        setLoading(true)
        setError(false)
        try {
            const data = await auditLogService.list(params(nextPage, nextPageSize))
            setLogs(safeArray(data.logs))
            setTotal(data.total || 0)
            setPage(nextPage)
            setPageSize(nextPageSize)
        } catch (requestError) {
            setError(true)
            throw requestError
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        let active = true
        auditLogService.list({ limit: 20, offset: 0 })
            .then((data) => {
                if (!active) return
                setLogs(safeArray(data.logs))
                setTotal(data.total || 0)
            })
            .catch(() => {
                if (!active) return
                setError(true)
                toast.error('No se pudo cargar la auditoria.')
            })
            .finally(() => { if (active) setLoading(false) })
        return () => { active = false }
    }, [])

    const exportCsv = async () => {
        await auditLogService.exportCsv(params())
        toast.success('Exportacion registrada en auditoria.')
        await load()
    }

    return <div className="space-y-6">
        <header className="flex flex-col justify-between gap-4 rounded-2xl border bg-white p-6 lg:flex-row lg:items-center">
            <div><h1 className="flex items-center gap-3 text-3xl font-bold"><ShieldCheck className="text-orange-600" /> Auditoria</h1><p className="mt-2 text-slate-500">Acciones sensibles registradas para control administrativo.</p></div>
            <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 font-semibold text-white"><Download size={18} /> Exportar CSV</button>
        </header>
        <section className="grid gap-3 rounded-2xl border bg-white p-4 md:grid-cols-4">
            <label className="text-sm font-semibold text-slate-800">ID de usuario<input placeholder="Ej. 12" value={filters.user_id} onChange={(e) => setFilters({ ...filters, user_id: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 p-3" /></label>
            <label className="text-sm font-semibold text-slate-800">Acción<select value={filters.action} onChange={(e) => setFilters({ ...filters, action: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 p-3">
                <option value="">Todas las acciones</option>
                {['LOGIN', 'PUBLISH', 'GENERATE_CSP', 'SAVE_SOLUTION', 'EXPORT_REPORT', 'CREATE', 'UPDATE', 'APPROVE', 'REJECT', 'DELETE'].map((value) => <option key={value}>{value}</option>)}
            </select></label>
            <label className="text-sm font-semibold text-slate-800">Entidad<input placeholder="Ej. schedule" value={filters.entity_type} onChange={(e) => setFilters({ ...filters, entity_type: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 p-3" /></label>
            <button onClick={() => load(1).catch(() => toast.error('No se pudo filtrar.'))} className="self-end rounded-xl border border-slate-300 px-4 py-3 font-semibold">Aplicar filtros</button>
        </section>
        <p className="text-sm font-medium text-slate-700">{total} registros encontrados</p>
        <section className="overflow-hidden rounded-2xl border bg-white">
            <DataTable
                caption="Registro cronológico de acciones sensibles de auditoría"
                columns={[
                    { key: 'created_at', label: 'Fecha y hora', render: (item) => formatDateTime(item.created_at) },
                    { key: 'user_id', label: 'Usuario', render: (item) => item.user_id || '—' },
                    { key: 'user_role', label: 'Rol', render: (item) => item.user_role || '—' },
                    { key: 'action', label: 'Acción', render: (item) => <StatusBadge value={item.action} /> },
                    { key: 'entity_type', label: 'Entidad', render: (item) => `${item.entity_type}${item.entity_id ? ` #${item.entity_id}` : ''}` },
                    { key: 'description', label: 'Descripción', className: 'max-w-sm', render: (item) => replaceEndpointsWithLabels(item.description) },
                ]}
                rows={logs}
                loading={loading}
                error={error ? 'No se pudo cargar la auditoría.' : null}
                emptyTitle="No hay registros de auditoría."
            />
            {!loading && !error && logs.length > 0 && <PaginationControls page={page} pageSize={pageSize} total={total} onPageChange={(nextPage) => load(nextPage)} onPageSizeChange={(nextSize) => load(1, nextSize)} />}
        </section>
    </div>
}
