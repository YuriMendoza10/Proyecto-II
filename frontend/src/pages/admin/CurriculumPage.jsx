import { useEffect, useMemo, useState } from 'react'
import { BookOpen, Check, Star, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { curriculumService } from '../../services/curriculumService'
import { getErrorMessage } from '../../utils/extractList'

const COURSE_TYPES = ['REQUIRED', 'GENERAL_ELECTIVE', 'SPECIALTY_ELECTIVE', 'GENERAL', 'SPECIALTY']

export default function CurriculumPage() {
    const [plans, setPlans] = useState([])
    const [planId, setPlanId] = useState('')
    const [detail, setDetail] = useState(null)
    const [cycle, setCycle] = useState('')
    const [type, setType] = useState('')
    const [prerequisiteForm, setPrerequisiteForm] = useState({ curriculum_course_id: '', prerequisite_course_id: '', prerequisite_type: 'RECOMMENDED' })
    const [electiveForm, setElectiveForm] = useState({ id: null, mention_name: '', course_name: '', credits: 3, area: 'IA_DATA', description: '', is_active: true })

    const loadDetail = async (id) => { if (id) setDetail(await curriculumService.getPlan(id)) }

    useEffect(() => {
        let active = true
        curriculumService.getPlans()
            .then((data) => {
                if (!active) return
                setPlans(data)
                if (data[0]) setPlanId(String(data[0].id))
            })
            .catch(() => toast.error('No se pudieron cargar los planes'))
        return () => { active = false }
    }, [])
    useEffect(() => {
        let active = true
        if (planId) {
            curriculumService.getPlan(planId)
                .then((data) => { if (active) setDetail(data) })
                .catch(() => toast.error('No se pudo cargar la malla'))
        }
        return () => { active = false }
    }, [planId])

    const visibleCourses = useMemo(() => (detail?.courses || []).filter((course) => (!cycle || String(course.cycle_number) === cycle) && (!type || course.course_type === type)), [detail, cycle, type])
    const cycles = useMemo(() => Array.from({ length: detail?.total_cycles || 0 }, (_, i) => i + 1), [detail])

    const updateCourse = async (course, payload) => {
        try { await curriculumService.updateCurriculumCourse(course.id, payload); await loadDetail(planId); toast.success('Curso actualizado') }
        catch (error) { toast.error(getErrorMessage(error, 'No se pudo actualizar')) }
    }
    const addPrerequisite = async (event) => {
        event.preventDefault()
        try {
            await curriculumService.createPrerequisite({ ...prerequisiteForm, curriculum_course_id: Number(prerequisiteForm.curriculum_course_id), prerequisite_course_id: Number(prerequisiteForm.prerequisite_course_id) })
            await loadDetail(planId); toast.success('Prerrequisito registrado')
        } catch (error) { toast.error(getErrorMessage(error, 'No se pudo agregar el prerrequisito')) }
    }
    const saveElective = async (event) => {
        event.preventDefault()
        const payload = {
            curriculum_plan_id: Number(planId),
            mention_name: electiveForm.mention_name,
            course_name: electiveForm.course_name,
            credits: Number(electiveForm.credits),
            area: electiveForm.area,
            description: electiveForm.description || null,
            is_active: electiveForm.is_active,
        }
        try {
            if (electiveForm.id) await curriculumService.updateElective(electiveForm.id, payload)
            else await curriculumService.createElective(payload)
            setElectiveForm({ id: null, mention_name: '', course_name: '', credits: 3, area: 'IA_DATA', description: '', is_active: true })
            await loadDetail(planId)
            toast.success('Electivo guardado')
        } catch (error) { toast.error(getErrorMessage(error, 'No se pudo guardar el electivo')) }
    }

    return <div className="space-y-6">
        <header className="flex items-center gap-4"><div className="rounded-xl bg-orange-100 p-3 text-orange-600"><BookOpen /></div><div><h1 className="text-2xl font-bold">Malla curricular</h1><p className="text-slate-500">Cursos, electivos sugeridos y prerrequisitos editables.</p></div></header>
        <div className="flex flex-wrap gap-3 rounded-2xl border bg-white p-4">
            <select className="rounded-xl border p-3" value={planId} onChange={(e) => setPlanId(e.target.value)}>{plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.code}</option>)}</select>
            <select className="rounded-xl border p-3" value={cycle} onChange={(e) => setCycle(e.target.value)}><option value="">Todos los ciclos</option>{cycles.map((value) => <option key={value} value={value}>Ciclo {value}</option>)}</select>
            <select className="rounded-xl border p-3" value={type} onChange={(e) => setType(e.target.value)}><option value="">Todos los tipos</option>{COURSE_TYPES.map((value) => <option key={value}>{value}</option>)}</select>
        </div>
        {detail && <section className="rounded-2xl border bg-white p-5"><p className="text-sm font-semibold text-orange-600">{detail.program?.name} | {detail.code}</p><h2 className="text-xl font-bold">{detail.name}</h2><p className="text-sm text-slate-500">{detail.total_cycles} ciclos | {detail.total_credits} créditos declarados</p><p className="mt-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{detail.source_note}</p></section>}
        <div className="space-y-5">{cycles.map((number) => {
            const items = visibleCourses.filter((course) => course.cycle_number === number)
            if (!items.length) return null
            const credits = items.reduce((sum, item) => sum + item.credits, 0)
            return <section key={number} className="overflow-hidden rounded-2xl border bg-white">
                <div className="flex justify-between bg-slate-50 px-5 py-3 font-bold"><span>Ciclo {String(number).padStart(2, '0')}</span><span>{credits} créditos</span></div>
                <div className="divide-y">{items.map((course) => <article key={course.id} className="grid gap-3 p-4 md:grid-cols-[1fr_180px_130px]">
                    <div><p className="font-semibold">{course.course_name} <span className="text-sm text-slate-400">({course.credits} cr.)</span></p><p className="text-xs text-slate-500">{course.course_code} {course.is_suggested_elective && <span className="ml-2 rounded bg-amber-100 px-2 py-1 text-amber-800">Electivo sugerido</span>}</p>
                    {course.prerequisites.map((prerequisite) => <span key={prerequisite.id} className="mr-2 mt-2 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700">{prerequisite.prerequisite_type}: {prerequisite.prerequisite_course_name}<button onClick={async () => { await curriculumService.deletePrerequisite(prerequisite.id); await loadDetail(planId) }}><Trash2 size={12} /></button></span>)}</div>
                    <select className="rounded-lg border px-2 py-1 text-sm" value={course.course_type} onChange={(e) => updateCourse(course, { course_type: e.target.value })}>{COURSE_TYPES.map((value) => <option key={value}>{value}</option>)}</select>
                    <button className={`flex items-center justify-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold ${course.is_suggested_elective ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`} onClick={() => updateCourse(course, { is_suggested_elective: !course.is_suggested_elective })}><Star size={13} /> Sugerido</button>
                </article>)}</div>
            </section>
        })}</div>
        {detail && <form onSubmit={addPrerequisite} className="grid gap-3 rounded-2xl border bg-white p-5 md:grid-cols-4">
            <h2 className="col-span-full font-bold">Agregar prerrequisito editable</h2>
            <select className="rounded-xl border p-3" required value={prerequisiteForm.curriculum_course_id} onChange={(e) => setPrerequisiteForm({ ...prerequisiteForm, curriculum_course_id: e.target.value })}><option value="">Curso destino</option>{detail.courses.map((item) => <option key={item.id} value={item.id}>{item.course_name}</option>)}</select>
            <select className="rounded-xl border p-3" required value={prerequisiteForm.prerequisite_course_id} onChange={(e) => setPrerequisiteForm({ ...prerequisiteForm, prerequisite_course_id: e.target.value })}><option value="">Curso previo</option>{detail.courses.map((item) => <option key={item.id} value={item.id}>{item.course_name}</option>)}</select>
            <select className="rounded-xl border p-3" value={prerequisiteForm.prerequisite_type} onChange={(e) => setPrerequisiteForm({ ...prerequisiteForm, prerequisite_type: e.target.value })}><option>RECOMMENDED</option><option>REQUIRED</option><option>CO_REQUIRED</option></select>
            <button className="flex items-center justify-center gap-2 rounded-xl bg-orange-600 font-semibold text-white"><Check size={17} /> Agregar</button>
        </form>}
        {detail && <section className="space-y-4 rounded-2xl border bg-white p-5">
            <h2 className="text-lg font-bold">Banco de electivos alternativos</h2>
            <p className="text-sm text-slate-500">Sugerencias editables; no constituyen una lista oficial confirmada.</p>
            <form onSubmit={saveElective} className="grid gap-3 rounded-xl bg-slate-50 p-4 md:grid-cols-3">
                <input className="rounded-xl border p-3" placeholder="Mención" required value={electiveForm.mention_name} onChange={(e) => setElectiveForm({ ...electiveForm, mention_name: e.target.value })} />
                <input className="rounded-xl border p-3" placeholder="Curso electivo" required value={electiveForm.course_name} onChange={(e) => setElectiveForm({ ...electiveForm, course_name: e.target.value })} />
                <select className="rounded-xl border p-3" value={electiveForm.area} onChange={(e) => setElectiveForm({ ...electiveForm, area: e.target.value })}><option>IA_DATA</option><option>CYBERSECURITY</option><option>DEVOPS</option><option>MANAGEMENT</option></select>
                <input className="rounded-xl border p-3" type="number" min="1" value={electiveForm.credits} onChange={(e) => setElectiveForm({ ...electiveForm, credits: e.target.value })} />
                <input className="rounded-xl border p-3" placeholder="Descripción opcional" value={electiveForm.description} onChange={(e) => setElectiveForm({ ...electiveForm, description: e.target.value })} />
                <button className="rounded-xl bg-orange-600 p-3 font-semibold text-white">{electiveForm.id ? 'Actualizar electivo' : 'Agregar electivo'}</button>
            </form>
            <div className="grid gap-3 md:grid-cols-2">{detail.elective_bank_courses.map((item) => <div key={item.id} className="rounded-xl border p-4"><p className="text-xs font-bold text-orange-600">{item.mention_name}</p><p className="font-semibold">{item.course_name} | {item.credits} cr.</p><p className="text-xs text-slate-500">{item.area} | {item.is_active ? 'Activo' : 'Inactivo'}</p><div className="mt-2 flex gap-3 text-xs text-blue-600"><button onClick={() => setElectiveForm(item)}>Editar</button><button onClick={async () => { await curriculumService.updateElective(item.id, { is_active: !item.is_active }); await loadDetail(planId) }}>{item.is_active ? 'Desactivar' : 'Activar'}</button><button className="text-red-600" onClick={async () => { await curriculumService.deleteElective(item.id); await loadDetail(planId) }}>Eliminar</button></div></div>)}</div>
        </section>}
    </div>
}
