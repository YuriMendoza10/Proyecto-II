import { useEffect, useState } from 'react'
import { Building2, Pencil, Save, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'

import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import LoadingState from '../../components/common/LoadingState'
import PageHeader from '../../components/common/PageHeader'
import StatusBadge from '../../components/common/StatusBadge'
import { facultyService } from '../../services/facultyService'
import { getErrorMessage } from '../../utils/extractList'

const initialForm = { code: '', name: '', description: '', is_active: true }

export default function FacultiesPage() {
    const [items, setItems] = useState([])
    const [form, setForm] = useState(initialForm)
    const [editingId, setEditingId] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const load = async () => {
        setLoading(true)
        setError('')
        try {
            setItems(await facultyService.getFaculties())
        } catch (requestError) {
            setError(getErrorMessage(requestError, 'No se pudieron cargar las facultades.'))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        let active = true
        facultyService.getFaculties()
            .then((data) => { if (active) setItems(data) })
            .catch((requestError) => { if (active) setError(getErrorMessage(requestError, 'No se pudieron cargar las facultades.')) })
            .finally(() => { if (active) setLoading(false) })
        return () => { active = false }
    }, [])

    const reset = () => {
        setEditingId(null)
        setForm(initialForm)
    }

    const submit = async (event) => {
        event.preventDefault()
        const payload = { ...form, description: form.description || null }
        try {
            if (editingId) await facultyService.updateFaculty(editingId, payload)
            else await facultyService.createFaculty(payload)
            toast.success('Facultad guardada')
            reset()
            await load()
        } catch (requestError) {
            toast.error(getErrorMessage(requestError, 'No se pudo guardar la facultad.'))
        }
    }

    const remove = async (id) => {
        try {
            await facultyService.deleteFaculty(id)
            toast.success('Facultad eliminada')
            await load()
        } catch (requestError) {
            toast.error(getErrorMessage(requestError, 'No se pudo eliminar la facultad.'))
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader eyebrow="Institucional" title="Facultades" description="Unidades academicas disponibles en la sede Huancayo." />

            <form onSubmit={submit} aria-label="Registrar o editar facultad" className="grid gap-3 rounded-2xl border bg-white p-5 shadow-sm lg:grid-cols-[160px_1fr_1.5fr_auto]">
                <Field label="Código de facultad" required><input className="rounded-xl border border-slate-300 px-3 py-2" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} required /></Field>
                <Field label="Nombre de facultad" required><input className="rounded-xl border border-slate-300 px-3 py-2" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></Field>
                <Field label="Descripción"><input className="rounded-xl border border-slate-300 px-3 py-2" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></Field>
                <div className="flex gap-2">
                    <button className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 font-semibold text-white"><Save size={16} /> Guardar</button>
                    {editingId && <button type="button" onClick={reset} className="rounded-xl border border-slate-300 p-2 text-slate-700" aria-label="Cancelar edición"><X size={18} aria-hidden="true" /></button>}
                </div>
            </form>

            {loading && <LoadingState title="Cargando facultades..." />}
            {!loading && error && <ErrorState message={error} onRetry={load} />}
            {!loading && !error && items.length === 0 && <EmptyState title="No hay facultades registradas" text="Agrega la primera facultad institucional." />}
            {!loading && !error && items.length > 0 && (
                <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                    <table className="w-full text-left text-sm">
                        <caption className="sr-only">Facultades registradas para la sede Huancayo</caption>
                        <thead className="bg-slate-100 text-sm font-bold text-slate-800"><tr><th scope="col" className="px-5 py-3">Facultad</th><th scope="col" className="px-5 py-3">Código</th><th scope="col" className="px-5 py-3">Estado</th><th scope="col" className="px-5 py-3 text-right">Acciones</th></tr></thead>
                        <tbody>{items.map((item) => <tr key={item.id} className="border-t">
                            <td className="px-5 py-4"><div className="flex items-center gap-3"><Building2 className="text-orange-600" size={18} /><div><p className="font-semibold text-slate-900">{item.name}</p><p className="text-sm text-slate-700">{item.description || 'Sin descripcion'}</p></div></div></td>
                            <td className="px-5 py-4 font-semibold text-slate-700">{item.code}</td>
                            <td className="px-5 py-4"><StatusBadge value={item.is_active ? 'ACTIVE' : 'INACTIVE'} /></td>
                            <td className="px-5 py-4"><div className="flex justify-end gap-2"><button onClick={() => { setEditingId(item.id); setForm({ code: item.code, name: item.name, description: item.description || '', is_active: item.is_active }) }} className="rounded-lg p-2 text-blue-700 hover:bg-blue-50" aria-label={`Editar facultad ${item.name}`}><Pencil size={16} aria-hidden="true" /></button><button onClick={() => remove(item.id)} className="rounded-lg p-2 text-red-700 hover:bg-red-50" aria-label={`Eliminar facultad ${item.name}`}><Trash2 size={16} aria-hidden="true" /></button></div></td>
                        </tr>)}</tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

function Field({ label, required, children }) {
    return <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700">{label}{required && <span className="text-xs text-slate-600">Obligatorio</span>}{children}</label>
}
