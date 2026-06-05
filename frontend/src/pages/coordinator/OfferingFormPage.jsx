import { useEffect, useMemo, useState } from 'react'
import { Save, Trash2 } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { academicPeriodService } from '../../services/academicPeriodService'
import { academicProgramService } from '../../services/academicProgramService'
import { curriculumService } from '../../services/curriculumService'
import { teacherService } from '../../services/teacherService'
import { classroomService } from '../../services/classroomService'
import { sectionOfferingService } from '../../services/sectionOfferingService'
import { sectionRequirementService } from '../../services/sectionRequirementService'
import { getErrorMessage } from '../../utils/extractList'

const initial = { academic_period_id: '', academic_program_id: '', curriculum_plan_id: '', curriculum_course_id: '', section_code: 'A', teacher_id: '', classroom_id: '', estimated_students: 40, capacity: 40, modality: 'PRESENTIAL', shift: 'MORNING', status: 'DRAFT', notes: '' }
const requirementInitial = { required_classroom_type: '', required_equipment: '', requires_lab: false, min_capacity: 0, preferred_shift: '', notes: '' }

export default function OfferingFormPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [form, setForm] = useState(initial)
    const [requirement, setRequirement] = useState(requirementInitial)
    const [requirements, setRequirements] = useState([])
    const [catalog, setCatalog] = useState({ periods: [], programs: [], plans: [], teachers: [], classrooms: [] })
    const [courses, setCourses] = useState([])
    const isEdit = Boolean(id)
    const selectedCourse = useMemo(() => courses.find((item) => String(item.id) === String(form.curriculum_course_id)), [courses, form.curriculum_course_id])

    useEffect(() => {
        Promise.all([academicPeriodService.getPeriods(), academicProgramService.getPrograms(), curriculumService.getPlans(), teacherService.getTeachers(), classroomService.getClassrooms({ is_active: true })])
            .then(([periods, programs, plans, teachers, classrooms]) => setCatalog({ periods, programs, plans, teachers: teachers.teachers || [], classrooms: classrooms.classrooms || [] }))
            .catch(() => toast.error('No se pudieron cargar los catalogos de oferta'))
    }, [])
    useEffect(() => {
        if (form.curriculum_plan_id) curriculumService.getPlan(form.curriculum_plan_id).then((plan) => setCourses(plan.courses || []))
    }, [form.curriculum_plan_id])
    useEffect(() => {
        if (id) {
            sectionOfferingService.getOffering(id).then((item) => setForm({ ...item, teacher_id: item.teacher_id || '', classroom_id: item.classroom_id || '', notes: item.notes || '' })).catch(() => toast.error('No se pudo cargar la oferta'))
            sectionRequirementService.getRequirements({ section_offering_id: id }).then((items) => {
                setRequirements(items)
                if (items[0]) setRequirement({
                    required_classroom_type: items[0].required_classroom_type || '',
                    required_equipment: items[0].required_equipment || '',
                    requires_lab: items[0].requires_lab,
                    min_capacity: items[0].min_capacity,
                    preferred_shift: items[0].preferred_shift || '',
                    notes: items[0].notes || '',
                })
            })
        }
    }, [id])

    const save = async (event) => {
        event.preventDefault()
        try {
            const payload = {
                ...form,
                academic_period_id: Number(form.academic_period_id), academic_program_id: Number(form.academic_program_id),
                curriculum_plan_id: Number(form.curriculum_plan_id), curriculum_course_id: Number(form.curriculum_course_id),
                course_id: selectedCourse?.course_id || form.course_id, cycle_number: selectedCourse?.cycle_number || form.cycle_number,
                teacher_id: form.teacher_id ? Number(form.teacher_id) : null, classroom_id: form.classroom_id ? Number(form.classroom_id) : null,
                estimated_students: Number(form.estimated_students), capacity: Number(form.capacity), notes: form.notes || null,
            }
            let item = isEdit ? await sectionOfferingService.updateOffering(id, payload) : await sectionOfferingService.createOffering(payload)
            if (requirement.requires_lab || requirement.required_classroom_type || requirement.required_equipment || Number(requirement.min_capacity) > 0) {
                const normalizedRequirement = {
                    ...requirement,
                    required_classroom_type: requirement.required_classroom_type || null,
                    preferred_shift: requirement.preferred_shift || null, min_capacity: Number(requirement.min_capacity),
                }
                if (requirements[0]) await sectionRequirementService.updateRequirement(requirements[0].id, normalizedRequirement)
                else await sectionRequirementService.createRequirement({ ...normalizedRequirement, section_offering_id: item.id })
            }
            toast.success('Oferta guardada')
            navigate(`/coordinator/offerings/${item.id}`)
        } catch (error) { toast.error(getErrorMessage(error, 'No se pudo guardar la oferta')) }
    }

    return <form onSubmit={save} className="space-y-6">
        <header><h1 className="text-2xl font-bold">{isEdit ? 'Editar oferta' : 'Crear oferta'}</h1><p className="text-slate-500">Asigna seccion, docente, aula, cupos y requisitos tecnicos.</p></header>
        <section className="grid gap-4 rounded-2xl border bg-white p-5 md:grid-cols-3">
            <Select label="Periodo" value={form.academic_period_id} onChange={(value) => setForm({ ...form, academic_period_id: value })} required options={catalog.periods.map((item) => [item.id, item.code])} />
            <Select label="Programa" value={form.academic_program_id} onChange={(value) => setForm({ ...form, academic_program_id: value })} required options={catalog.programs.map((item) => [item.id, item.code])} />
            <Select label="Plan" value={form.curriculum_plan_id} onChange={(value) => setForm({ ...form, curriculum_plan_id: value, curriculum_course_id: '' })} required options={catalog.plans.map((item) => [item.id, item.code])} />
            <Select label="Curso de malla" value={form.curriculum_course_id} onChange={(value) => setForm({ ...form, curriculum_course_id: value })} required options={courses.map((item) => [item.id, `Ciclo ${item.cycle_number} - ${item.course_name}`])} />
            <Field label="Seccion" value={form.section_code} onChange={(value) => setForm({ ...form, section_code: value })} required />
            <Select label="Estado" value={form.status} onChange={(value) => setForm({ ...form, status: value })} options={['DRAFT', 'READY', 'APPROVED', 'PUBLISHED', 'CLOSED'].map((item) => [item, item])} />
            <Select label="Docente" value={form.teacher_id} onChange={(value) => setForm({ ...form, teacher_id: value })} options={catalog.teachers.map((item) => [item.id, item.teacher_code])} optional />
            <Select label="Aula" value={form.classroom_id} onChange={(value) => setForm({ ...form, classroom_id: value })} options={catalog.classrooms.map((item) => [item.id, `${item.code} (${item.capacity})`])} optional />
            <Field label="Cupos estimados" type="number" value={form.estimated_students} onChange={(value) => setForm({ ...form, estimated_students: value })} required />
            <Field label="Capacidad" type="number" value={form.capacity} onChange={(value) => setForm({ ...form, capacity: value })} required />
            <Select label="Modalidad" value={form.modality} onChange={(value) => setForm({ ...form, modality: value })} options={['PRESENTIAL', 'VIRTUAL', 'HYBRID'].map((item) => [item, item])} />
            <Select label="Turno" value={form.shift} onChange={(value) => setForm({ ...form, shift: value })} options={['MORNING', 'AFTERNOON', 'NIGHT', 'FLEXIBLE'].map((item) => [item, item])} />
            <label className="md:col-span-3"><span className="mb-1 block text-sm font-semibold">Notas</span><textarea className="w-full rounded-xl border p-3" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
        </section>
        <section className="grid gap-4 rounded-2xl border bg-white p-5 md:grid-cols-3">
            <h2 className="col-span-full font-bold">Requisito de aula opcional</h2>
            <Select label="Tipo de aula" value={requirement.required_classroom_type} onChange={(value) => setRequirement({ ...requirement, required_classroom_type: value })} options={['THEORY', 'LAB', 'AUDITORIUM', 'VIRTUAL'].map((item) => [item, item])} optional />
            <Field label="Equipamiento" value={requirement.required_equipment} onChange={(value) => setRequirement({ ...requirement, required_equipment: value })} />
            <Field label="Capacidad minima" type="number" value={requirement.min_capacity} onChange={(value) => setRequirement({ ...requirement, min_capacity: value })} />
            <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={requirement.requires_lab} onChange={(e) => setRequirement({ ...requirement, requires_lab: e.target.checked })} /> Requiere laboratorio</label>
            {requirements.map((item) => <div key={item.id} className="col-span-full flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm"><span>{item.required_classroom_type || 'Sin tipo'} | minimo {item.min_capacity} | {item.requires_lab ? 'Laboratorio' : 'Aula regular'}</span><button type="button" className="text-red-600" onClick={async () => { await sectionRequirementService.deleteRequirement(item.id); setRequirements(requirements.filter((value) => value.id !== item.id)); setRequirement(requirementInitial) }}><Trash2 size={16} /></button></div>)}
        </section>
        <button className="flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white"><Save size={18} /> Guardar oferta</button>
    </form>
}

function Field({ label, value, onChange, type = 'text', required }) { return <label><span className="mb-1 block text-sm font-semibold">{label}</span><input className="w-full rounded-xl border p-3" type={type} min={type === 'number' ? 0 : undefined} value={value} onChange={(e) => onChange(e.target.value)} required={required} /></label> }
function Select({ label, value, onChange, options, required, optional }) { return <label><span className="mb-1 block text-sm font-semibold">{label}</span><select className="w-full rounded-xl border p-3" value={value} onChange={(e) => onChange(e.target.value)} required={required}><option value="">{optional ? 'Sin asignar' : 'Seleccionar'}</option>{options.map(([key, text]) => <option key={key} value={key}>{text}</option>)}</select></label> }
