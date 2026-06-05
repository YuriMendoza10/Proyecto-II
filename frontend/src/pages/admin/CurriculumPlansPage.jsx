import { useEffect, useState } from 'react'
import { ClipboardList, Save, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { academicProgramService } from '../../services/academicProgramService'
import { curriculumService } from '../../services/curriculumService'
import { useAuthStore } from '../../stores/authStore'
import { getErrorMessage } from '../../utils/extractList'

const initialForm = {
    program_id: '',
    code: 'ISI-UC-2026',
    name: 'Plan Curricular Ingeniería de Sistemas e Informática',
    effective_year: 2026,
    total_cycles: 10,
    total_credits: 221,
    status: 'DRAFT',
    source_note: 'Malla base proporcionada por usuario; electivos sugeridos editables',
}

export default function CurriculumPlansPage() {
    const { user } = useAuthStore()
    const isAdmin = user?.role === 'ADMIN'
    const [plans, setPlans] = useState([])
    const [programs, setPrograms] = useState([])
    const [form, setForm] = useState(initialForm)
    const [editingId, setEditingId] = useState(null)

    const load = async () => {
        const [programData, planData] = await Promise.all([
            academicProgramService.getPrograms(),
            curriculumService.getPlans(),
        ])
        setPrograms(programData)
        setPlans(planData)
        if (!form.program_id && programData[0]) setForm((current) => ({ ...current, program_id: programData[0].id }))
    }

    useEffect(() => {
        let active = true
        Promise.all([academicProgramService.getPrograms(), curriculumService.getPlans()])
            .then(([programData, planData]) => {
                if (!active) return
                setPrograms(programData)
                setPlans(planData)
                if (programData[0]) {
                    setForm((current) => (
                        current.program_id ? current : { ...current, program_id: programData[0].id }
                    ))
                }
            })
            .catch(() => toast.error('No se pudieron cargar los planes'))
        return () => { active = false }
    }, [])

    const save = async (event) => {
        event.preventDefault()
        const payload = { ...form, program_id: Number(form.program_id), effective_year: Number(form.effective_year), total_cycles: Number(form.total_cycles), total_credits: Number(form.total_credits) }
        try {
            if (editingId) await curriculumService.updatePlan(editingId, payload)
            else await curriculumService.createPlan(payload)
            setEditingId(null); setForm({ ...initialForm, program_id: programs[0]?.id || '' }); await load()
            toast.success('Plan curricular guardado')
        } catch (error) { toast.error(getErrorMessage(error, 'No se pudo guardar el plan')) }
    }

    return <div className="space-y-6">
        <header className="flex items-center gap-4"><div className="rounded-xl bg-orange-100 p-3 text-orange-600"><ClipboardList /></div><div><h1 className="text-2xl font-bold">Planes curriculares</h1><p className="text-slate-500">Versiones de la malla por programa académico.</p></div></header>
        {isAdmin && <form onSubmit={save} className="grid gap-3 rounded-2xl border bg-white p-5 md:grid-cols-3">
            <select className="rounded-xl border p-3" value={form.program_id} onChange={(e) => setForm({ ...form, program_id: e.target.value })} required>{programs.map((p) => <option key={p.id} value={p.id}>{p.code} - {p.name}</option>)}</select>
            <Field value={form.code} onChange={(v) => setForm({ ...form, code: v })} label="Código" />
            <Field value={form.name} onChange={(v) => setForm({ ...form, name: v })} label="Nombre" />
            <Field type="number" value={form.effective_year} onChange={(v) => setForm({ ...form, effective_year: v })} label="Año" />
            <Field type="number" value={form.total_cycles} onChange={(v) => setForm({ ...form, total_cycles: v })} label="Ciclos" />
            <Field type="number" value={form.total_credits} onChange={(v) => setForm({ ...form, total_credits: v })} label="Créditos" />
            <select className="rounded-xl border p-3" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>DRAFT</option><option>ACTIVE</option><option>INACTIVE</option></select>
            <textarea className="rounded-xl border p-3 md:col-span-2" value={form.source_note} onChange={(e) => setForm({ ...form, source_note: e.target.value })} />
            <button className="flex items-center justify-center gap-2 rounded-xl bg-orange-600 p-3 font-semibold text-white"><Save size={17} /> Guardar</button>
        </form>}
        <div className="space-y-3">{plans.map((plan) => <article key={plan.id} className="flex items-center justify-between rounded-2xl border bg-white p-5">
            <div><span className="text-xs font-bold text-orange-600">{plan.code} | {plan.status}</span><h2 className="font-bold">{plan.name}</h2><p className="text-sm text-slate-500">{plan.total_cycles} ciclos | {plan.total_credits} créditos | {plan.effective_year}</p></div>
            {isAdmin && <div className="flex gap-3"><button className="text-blue-600" onClick={() => { setEditingId(plan.id); setForm(plan) }}>Editar</button><button className="text-red-600" onClick={async () => { await curriculumService.deletePlan(plan.id); await load() }}><Trash2 size={17} /></button></div>}
        </article>)}</div>
    </div>
}

function Field({ label, value, onChange, type = 'text' }) {
    return <input aria-label={label} placeholder={label} className="rounded-xl border p-3" type={type} value={value} onChange={(event) => onChange(event.target.value)} required />
}
