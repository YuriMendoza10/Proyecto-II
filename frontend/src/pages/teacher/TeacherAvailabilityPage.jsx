import { useEffect, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { teacherAvailabilityService } from '../../services/teacherAvailabilityService'
import { Header } from './TeacherSchedulePage'

const initial = { day_of_week: 1, start_time: '07:00', end_time: '13:30', is_available: true }

export default function TeacherAvailabilityPage() {
    const [items, setItems] = useState([])
    const [form, setForm] = useState(initial)
    const [editingId, setEditingId] = useState(null)
    const load = async () => { const data = await teacherAvailabilityService.listMine(); setItems(data.availabilities || []) }
    useEffect(() => {
        teacherAvailabilityService.listMine()
            .then((data) => setItems(data.availabilities || []))
            .catch(() => toast.error('No se pudo cargar la disponibilidad.'))
    }, [])
    const submit = async (event) => {
        event.preventDefault()
        try {
            if (editingId) await teacherAvailabilityService.updateMine(editingId, form)
            else await teacherAvailabilityService.createMine(form)
            setForm(initial); setEditingId(null); await load(); toast.success('Disponibilidad actualizada.')
        } catch { toast.error('No se pudo guardar la disponibilidad.') }
    }
    return <div className="space-y-5"><Header title="Mi disponibilidad" text="Administra solamente tus propias franjas disponibles." />
        <form onSubmit={submit} className="grid gap-3 rounded-2xl border bg-white p-5 md:grid-cols-5">
            <Field label="Día"><select className="rounded-xl border p-3" value={form.day_of_week} onChange={(e) => setForm({ ...form, day_of_week: Number(e.target.value) })}>{['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'].map((day, index) => <option key={day} value={index + 1}>{day}</option>)}</select></Field>
            <Field label="Hora inicial"><input className="rounded-xl border p-3" type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} /></Field>
            <Field label="Hora final"><input className="rounded-xl border p-3" type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} /></Field>
            <label className="flex items-center gap-2 rounded-xl border p-3"><input type="checkbox" checked={form.is_available} onChange={(e) => setForm({ ...form, is_available: e.target.checked })} /> Disponible</label>
            <button className="flex items-center justify-center gap-2 rounded-xl bg-orange-600 font-bold text-white"><Plus size={17} /> {editingId ? 'Actualizar' : 'Agregar'}</button>
        </form>
        <section className="space-y-3" aria-label="Franjas de disponibilidad">{items.map((item) => <article key={item.id} className="flex justify-between rounded-2xl border bg-white p-4"><p><strong>Dia {item.day_of_week}</strong> | {short(item.start_time)} - {short(item.end_time)} | {item.is_available ? 'Disponible' : 'No disponible'}</p><div className="flex gap-2"><button onClick={() => { setEditingId(item.id); setForm({ day_of_week: item.day_of_week, start_time: short(item.start_time), end_time: short(item.end_time), is_available: item.is_available }) }} className="rounded-lg border p-2" aria-label={`Editar disponibilidad del día ${item.day_of_week}`}><Pencil size={16} aria-hidden="true" /></button><button onClick={async () => { await teacherAvailabilityService.deleteMine(item.id); await load() }} className="rounded-lg border p-2 text-red-700" aria-label={`Eliminar disponibilidad del día ${item.day_of_week}`}><Trash2 size={16} aria-hidden="true" /></button></div></article>)}</section>
    </div>
}
function short(value) { return String(value).slice(0, 5) }
function Field({ label, children }) { return <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700">{label}{children}</label> }
