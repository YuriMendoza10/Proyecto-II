import { useEffect, useState } from 'react'
import { MapPin, Pencil, Save, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'

import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import LoadingState from '../../components/common/LoadingState'
import PageHeader from '../../components/common/PageHeader'
import StatusBadge from '../../components/common/StatusBadge'
import { campusService } from '../../services/campusService'
import { getErrorMessage } from '../../utils/extractList'

const initialForm = { name: 'Sede Huancayo', city: 'Huancayo', address: '', is_active: true }

export default function CampusesPage() {
    const [items, setItems] = useState([])
    const [form, setForm] = useState(initialForm)
    const [editingId, setEditingId] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const load = async () => {
        setLoading(true)
        setError('')
        try {
            setItems(await campusService.getCampuses())
        } catch (requestError) {
            setError(getErrorMessage(requestError, 'No se pudo cargar la sede Huancayo.'))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        let active = true
        campusService.getCampuses()
            .then((data) => { if (active) setItems(data) })
            .catch((requestError) => { if (active) setError(getErrorMessage(requestError, 'No se pudo cargar la sede Huancayo.')) })
            .finally(() => { if (active) setLoading(false) })
        return () => { active = false }
    }, [])

    const reset = () => {
        setEditingId(null)
        setForm(initialForm)
    }

    const submit = async (event) => {
        event.preventDefault()
        const payload = { ...form, address: form.address || null }
        try {
            if (editingId) await campusService.updateCampus(editingId, payload)
            else await campusService.createCampus(payload)
            toast.success('Sede guardada')
            reset()
            await load()
        } catch (requestError) {
            toast.error(getErrorMessage(requestError, 'No se pudo guardar la sede.'))
        }
    }

    const remove = async (id) => {
        try {
            await campusService.deleteCampus(id)
            toast.success('Sede eliminada')
            await load()
        } catch (requestError) {
            toast.error(getErrorMessage(requestError, 'No se pudo eliminar la sede.'))
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader eyebrow="Institucional" title="Sede Huancayo" description="Base territorial unica para la planificacion academica institucional." />

            <form onSubmit={submit} aria-label="Registrar o editar sede" className="grid gap-3 rounded-2xl border bg-white p-5 shadow-sm lg:grid-cols-[1fr_180px_1.5fr_auto]">
                <Field label="Nombre de sede" required><input className="rounded-xl border border-slate-300 px-3 py-2" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></Field>
                <Field label="Ciudad" required><input className="rounded-xl border border-slate-300 px-3 py-2" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} required /></Field>
                <Field label="Dirección"><input className="rounded-xl border border-slate-300 px-3 py-2" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} /></Field>
                <div className="flex gap-2">
                    <button className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 font-semibold text-white"><Save size={16} /> Guardar</button>
                    {editingId && <button type="button" onClick={reset} className="rounded-xl border border-slate-300 p-2 text-slate-700" aria-label="Cancelar edición"><X size={18} aria-hidden="true" /></button>}
                </div>
            </form>

            {loading && <LoadingState title="Cargando sede..." />}
            {!loading && error && <ErrorState message={error} onRetry={load} />}
            {!loading && !error && items.length === 0 && <EmptyState title="No hay sedes registradas" text="Registra Sede Huancayo para iniciar la base institucional." />}
            {!loading && !error && items.length > 0 && (
                <div className="grid gap-4 lg:grid-cols-2">
                    {items.map((item) => <article key={item.id} className="rounded-2xl border bg-white p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-4"><div className="flex gap-3"><div className="rounded-xl bg-orange-50 p-3 text-orange-600"><MapPin size={20} /></div><div><h2 className="font-bold text-slate-900">{item.name}</h2><p className="text-sm text-slate-700">{item.city}</p><p className="mt-1 text-sm text-slate-700">{item.address || 'Direccion pendiente de registro'}</p></div></div><StatusBadge value={item.is_active ? 'ACTIVE' : 'INACTIVE'} /></div>
                        <div className="mt-4 flex justify-end gap-2 border-t pt-3"><button onClick={() => { setEditingId(item.id); setForm({ name: item.name, city: item.city, address: item.address || '', is_active: item.is_active }) }} className="rounded-lg p-2 text-blue-700 hover:bg-blue-50" aria-label={`Editar sede ${item.name}`}><Pencil size={16} aria-hidden="true" /></button><button onClick={() => remove(item.id)} className="rounded-lg p-2 text-red-700 hover:bg-red-50" aria-label={`Eliminar sede ${item.name}`}><Trash2 size={16} aria-hidden="true" /></button></div>
                    </article>)}
                </div>
            )}
        </div>
    )
}

function Field({ label, required, children }) {
    return <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700">{label}{required && <span className="text-xs text-slate-600">Obligatorio</span>}{children}</label>
}
