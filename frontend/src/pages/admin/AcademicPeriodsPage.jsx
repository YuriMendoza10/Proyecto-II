import { useEffect, useState } from 'react'
import { CalendarDays, Save, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { academicPeriodService } from '../../services/academicPeriodService'
import { useAuthStore } from '../../stores/authStore'
import { getErrorMessage } from '../../utils/extractList'

const initialForm = {
    code: '2026-I',
    name: 'Periodo Académico 2026-I',
    start_date: '',
    end_date: '',
    status: 'PLANNED',
    is_active: true,
}

export default function AcademicPeriodsPage() {
    const { user } = useAuthStore()
    const isAdmin = user?.role === 'ADMIN'
    const [periods, setPeriods] = useState([])
    const [form, setForm] = useState(initialForm)
    const [editingId, setEditingId] = useState(null)

    const load = async () => {
        try {
            setPeriods(await academicPeriodService.getPeriods())
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudieron cargar los periodos'))
        }
    }

    useEffect(() => {
        let active = true
        academicPeriodService.getPeriods()
            .then((data) => { if (active) setPeriods(data) })
            .catch((error) => toast.error(getErrorMessage(error, 'No se pudieron cargar los periodos')))
        return () => { active = false }
    }, [])

    const submit = async (event) => {
        event.preventDefault()
        const payload = {
            ...form,
            start_date: form.start_date || null,
            end_date: form.end_date || null,
        }
        try {
            if (editingId) await academicPeriodService.updatePeriod(editingId, payload)
            else await academicPeriodService.createPeriod(payload)
            toast.success('Periodo guardado')
            setForm(initialForm)
            setEditingId(null)
            await load()
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudo guardar el periodo'))
        }
    }

    return (
        <div className="space-y-6">
            <Header icon={<CalendarDays />} title="Periodos académicos" text="Administra ventanas académicas y su estado operativo." />
            {isAdmin && (
                <form onSubmit={submit} className="grid gap-3 rounded-2xl border bg-white p-5 md:grid-cols-6">
                    <Input value={form.code} onChange={(value) => setForm({ ...form, code: value })} placeholder="Código" />
                    <Input value={form.name} onChange={(value) => setForm({ ...form, name: value })} placeholder="Nombre" wide />
                    <input className="rounded-xl border border-slate-200 px-3 py-2" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                    <input className="rounded-xl border border-slate-200 px-3 py-2" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
                    <select className="rounded-xl border border-slate-200 px-3 py-2" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                        <option>PLANNED</option><option>ACTIVE</option><option>CLOSED</option>
                    </select>
                    <button className="flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2 font-semibold text-white"><Save size={16} /> Guardar</button>
                </form>
            )}
            <section className="overflow-hidden rounded-2xl border bg-white">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-left"><tr><th className="p-4">Código</th><th>Nombre</th><th>Fechas</th><th>Estado</th>{isAdmin && <th />}</tr></thead>
                    <tbody>{periods.map((item) => (
                        <tr key={item.id} className="border-t">
                            <td className="p-4 font-semibold">{item.code}</td><td>{item.name}</td>
                            <td>{item.start_date || '-'} / {item.end_date || '-'}</td>
                            <td><Badge text={item.status} /></td>
                            {isAdmin && <td className="space-x-2 text-right pr-4">
                                <button onClick={() => { setEditingId(item.id); setForm({ ...item, start_date: item.start_date || '', end_date: item.end_date || '' }) }} className="text-blue-600">Editar</button>
                                <button onClick={async () => { await academicPeriodService.deletePeriod(item.id); await load() }} className="text-red-600"><Trash2 size={16} /></button>
                            </td>}
                        </tr>
                    ))}</tbody>
                </table>
            </section>
        </div>
    )
}

function Header({ icon, title, text }) { return <header className="flex items-center gap-4"><div className="rounded-xl bg-orange-100 p-3 text-orange-600">{icon}</div><div><h1 className="text-2xl font-bold">{title}</h1><p className="text-slate-500">{text}</p></div></header> }
function Input({ value, onChange, placeholder }) { return <input className="rounded-xl border border-slate-200 px-3 py-2" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required /> }
function Badge({ text }) { return <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{text}</span> }
