import { useEffect, useState } from 'react'
import { GraduationCap, Save, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { academicProgramService } from '../../services/academicProgramService'
import { useAuthStore } from '../../stores/authStore'
import { getErrorMessage } from '../../utils/extractList'

const initialForm = {
    code: 'ISI',
    name: 'Ingeniería de Sistemas e Informática',
    university: 'Universidad Continental',
    faculty: '',
    modality: '',
    status: 'ACTIVE',
}

export default function AcademicProgramsPage() {
    const { user } = useAuthStore()
    const isAdmin = user?.role === 'ADMIN'
    const [programs, setPrograms] = useState([])
    const [form, setForm] = useState(initialForm)
    const [editingId, setEditingId] = useState(null)
    const load = async () => setPrograms(await academicProgramService.getPrograms())

    useEffect(() => {
        let active = true
        academicProgramService.getPrograms()
            .then((data) => { if (active) setPrograms(data) })
            .catch(() => toast.error('No se pudieron cargar las carreras'))
        return () => { active = false }
    }, [])

    const submit = async (event) => {
        event.preventDefault()
        try {
            const payload = { ...form, faculty: form.faculty || null, modality: form.modality || null }
            if (editingId) await academicProgramService.updateProgram(editingId, payload)
            else await academicProgramService.createProgram(payload)
            setEditingId(null); setForm(initialForm); await load(); toast.success('Carrera guardada')
        } catch (error) { toast.error(getErrorMessage(error, 'No se pudo guardar')) }
    }

    return <div className="space-y-6">
        <header className="flex items-center gap-4"><div className="rounded-xl bg-orange-100 p-3 text-orange-600"><GraduationCap /></div><div><h1 className="text-2xl font-bold">Programas académicos</h1><p className="text-slate-500">Carreras y unidades responsables del plan curricular.</p></div></header>
        {isAdmin && <form onSubmit={submit} className="grid gap-3 rounded-2xl border bg-white p-5 md:grid-cols-3">
            {['code', 'name', 'university', 'faculty', 'modality'].map((field) => <input key={field} className="rounded-xl border border-slate-200 px-3 py-2" value={form[field]} placeholder={field} required={['code', 'name', 'university'].includes(field)} onChange={(e) => setForm({ ...form, [field]: e.target.value })} />)}
            <select className="rounded-xl border border-slate-200 px-3 py-2" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>ACTIVE</option><option>INACTIVE</option></select>
            <button className="flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2 font-semibold text-white"><Save size={16} /> Guardar</button>
        </form>}
        <div className="grid gap-4">{programs.map((program) => <article key={program.id} className="flex items-center justify-between rounded-2xl border bg-white p-5">
            <div><p className="text-xs font-bold text-orange-600">{program.code} | {program.status}</p><h2 className="text-lg font-bold">{program.name}</h2><p className="text-sm text-slate-500">{program.university}</p></div>
            {isAdmin && <div className="flex gap-3"><button className="text-blue-600" onClick={() => { setEditingId(program.id); setForm({ ...program, faculty: program.faculty || '', modality: program.modality || '' }) }}>Editar</button><button className="text-red-600" onClick={async () => { await academicProgramService.deleteProgram(program.id); await load() }}><Trash2 size={17} /></button></div>}
        </article>)}</div>
    </div>
}
