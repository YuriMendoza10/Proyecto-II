import { useEffect, useState } from 'react'
import { Eye, Pencil, Save, X } from 'lucide-react'
import toast from 'react-hot-toast'

import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import LoadingState from '../../components/common/LoadingState'
import PageHeader from '../../components/common/PageHeader'
import PaginationControls from '../../components/common/PaginationControls'
import StatusBadge from '../../components/common/StatusBadge'
import { academicProgramService } from '../../services/academicProgramService'
import { curriculumService } from '../../services/curriculumService'
import { institutionalStudentService } from '../../services/institutionalStudentService'
import { extractList, getErrorMessage } from '../../utils/extractList'

const emptyFilters = { academic_program_id: '', current_cycle: '', enrollment_status: '' }

export default function InstitutionalStudentsPage() {
    const [students, setStudents] = useState([])
    const [programs, setPrograms] = useState([])
    const [plans, setPlans] = useState([])
    const [filters, setFilters] = useState(emptyFilters)
    const [editing, setEditing] = useState(null)
    const [summary, setSummary] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(20)

    const load = async (nextFilters = filters, nextPage = page, nextPageSize = pageSize) => {
        setLoading(true)
        setError('')
        try {
            const params = { ...Object.fromEntries(Object.entries(nextFilters).filter(([, value]) => value !== '')), skip: (nextPage - 1) * nextPageSize, limit: nextPageSize }
            const data = await institutionalStudentService.getStudents(params)
            setStudents(extractList(data))
            setTotal(data.total || 0)
            setPage(nextPage)
            setPageSize(nextPageSize)
        } catch (requestError) {
            setError(getErrorMessage(requestError, 'No se pudieron cargar los estudiantes institucionales.'))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        let active = true
        Promise.all([
            institutionalStudentService.getStudents(),
            academicProgramService.getPrograms(),
            curriculumService.getPlans(),
        ]).then(([studentData, programData, planData]) => {
            if (!active) return
            setStudents(extractList(studentData))
            setTotal(studentData.total || 0)
            setPrograms(extractList(programData))
            setPlans(extractList(planData))
        }).catch((requestError) => {
            if (active) setError(getErrorMessage(requestError, 'No se pudieron cargar los estudiantes institucionales.'))
        }).finally(() => {
            if (active) setLoading(false)
        })
        return () => { active = false }
    }, [])

    const filteredPlans = plans.filter(
        (plan) => !editing?.academic_program_id || Number(plan.program_id) === Number(editing.academic_program_id),
    )

    const submit = async (event) => {
        event.preventDefault()
        try {
            await institutionalStudentService.updateStudent(editing.id, {
                academic_program_id: Number(editing.academic_program_id) || null,
                curriculum_plan_id: Number(editing.curriculum_plan_id) || null,
                current_cycle: Number(editing.current_cycle),
                enrollment_status: editing.enrollment_status,
                max_credits_allowed: Number(editing.max_credits_allowed),
                is_active: editing.is_active,
            })
            toast.success('Datos institucionales actualizados')
            setEditing(null)
            await load()
        } catch (requestError) {
            toast.error(getErrorMessage(requestError, 'No se pudo actualizar el estudiante.'))
        }
    }

    const showSummary = async (id) => {
        try {
            setSummary(await institutionalStudentService.getAcademicSummary(id))
        } catch (requestError) {
            toast.error(getErrorMessage(requestError, 'No se pudo cargar el resumen academico.'))
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader eyebrow="Institucional" title="Estudiantes institucionales" description="Perfiles matriculados vinculados a sede, carrera, plan curricular y ciclo actual." />
            <form onSubmit={(event) => { event.preventDefault(); load(filters, 1) }} className="grid gap-3 rounded-lg border bg-white p-4 shadow-sm md:grid-cols-4">
                <Field label="Carrera"><select className="rounded-lg border px-3 py-2" value={filters.academic_program_id} onChange={(event) => setFilters({ ...filters, academic_program_id: event.target.value })}><option value="">Todas las carreras</option>{programs.map((program) => <option key={program.id} value={program.id}>{program.name}</option>)}</select></Field>
                <Field label="Ciclo actual"><select className="rounded-lg border px-3 py-2" value={filters.current_cycle} onChange={(event) => setFilters({ ...filters, current_cycle: event.target.value })}><option value="">Todos los ciclos</option>{Array.from({ length: 10 }, (_, index) => <option key={index + 1} value={index + 1}>Ciclo {index + 1}</option>)}</select></Field>
                <Field label="Estado de matrícula"><select className="rounded-lg border px-3 py-2" value={filters.enrollment_status} onChange={(event) => setFilters({ ...filters, enrollment_status: event.target.value })}><option value="">Todos los estados</option>{['ENROLLED', 'RESERVED', 'GRADUATED', 'WITHDRAWN', 'SUSPENDED'].map((value) => <option key={value}>{value}</option>)}</select></Field>
                <button className="rounded-lg bg-orange-600 px-4 py-2 font-semibold text-white">Filtrar</button>
            </form>

            {summary && <div className="grid gap-3 rounded-lg border bg-white p-4 shadow-sm md:grid-cols-5"><div><p className="text-sm font-medium text-slate-700">Estudiante</p><p className="font-semibold">{summary.student_name}</p></div><Metric label="Aprobados" value={summary.approved_courses} /><Metric label="Desaprobados" value={summary.failed_courses} /><Metric label="En progreso" value={summary.in_progress_courses} /><Metric label="Creditos aprobados" value={summary.approved_credits} /></div>}
            {editing && <form onSubmit={submit} aria-label={`Editar datos institucionales de ${editing.student_name || editing.student_code}`} className="grid gap-3 rounded-lg border border-orange-300 bg-white p-4 shadow-sm md:grid-cols-4"><Field label="Carrera"><select className="rounded-lg border px-3 py-2" value={editing.academic_program_id || ''} onChange={(event) => setEditing({ ...editing, academic_program_id: event.target.value, curriculum_plan_id: '' })}>{programs.map((program) => <option key={program.id} value={program.id}>{program.name}</option>)}</select></Field><Field label="Plan curricular"><select className="rounded-lg border px-3 py-2" value={editing.curriculum_plan_id || ''} onChange={(event) => setEditing({ ...editing, curriculum_plan_id: event.target.value })}>{filteredPlans.map((plan) => <option key={plan.id} value={plan.id}>{plan.code}</option>)}</select></Field><Field label="Ciclo actual"><input className="rounded-lg border px-3 py-2" type="number" min="1" max="10" value={editing.current_cycle} onChange={(event) => setEditing({ ...editing, current_cycle: event.target.value })} /></Field><div className="flex items-end gap-2"><button className="rounded-lg bg-orange-600 p-2 text-white" aria-label="Guardar cambios"><Save size={18} aria-hidden="true" /></button><button type="button" onClick={() => setEditing(null)} className="rounded-lg border p-2" aria-label="Cancelar edición"><X size={18} aria-hidden="true" /></button></div></form>}

            {loading && <LoadingState title="Cargando estudiantes..." />}
            {!loading && error && <ErrorState message={error} onRetry={() => load()} />}
            {!loading && !error && students.length === 0 && <EmptyState title="No hay estudiantes institucionales" text="Ejecuta el seed demo o registra perfiles institucionales." />}
            {!loading && !error && students.length > 0 && <div className="overflow-x-auto rounded-lg border bg-white shadow-sm"><table className="w-full text-left text-sm"><caption className="sr-only">Estudiantes vinculados a la base institucional Huancayo</caption><thead className="bg-slate-100 text-sm font-bold text-slate-800"><tr>{['Código', 'Estudiante', 'Carrera', 'Plan', 'Ciclo', 'Matrícula', 'Créditos', 'Activo', 'Acciones'].map((heading) => <th key={heading} scope="col" className="px-4 py-3">{heading}</th>)}</tr></thead><tbody>{students.map((student) => <tr key={student.id} className="border-t hover:bg-blue-50"><td className="px-4 py-3 font-semibold">{student.student_code}</td><td className="px-4 py-3">{student.student_name || '-'}</td><td className="px-4 py-3">{student.academic_program_name || student.career}</td><td className="px-4 py-3">{student.curriculum_plan_code || '-'}</td><td className="px-4 py-3">{student.current_cycle}</td><td className="px-4 py-3"><StatusBadge value={student.enrollment_status} /></td><td className="px-4 py-3">{student.max_credits_allowed ?? student.max_credits}</td><td className="px-4 py-3"><StatusBadge value={student.is_active ? 'ACTIVE' : 'INACTIVE'} /></td><td className="px-4 py-3"><div className="flex gap-1"><button onClick={() => showSummary(student.id)} className="rounded-lg p-2 text-blue-700 hover:bg-blue-50" aria-label={`Ver resumen académico de ${student.student_name || student.student_code}`}><Eye size={16} aria-hidden="true" /></button><button onClick={() => setEditing(student)} className="rounded-lg p-2 text-orange-700 hover:bg-orange-50" aria-label={`Editar datos institucionales de ${student.student_name || student.student_code}`}><Pencil size={16} aria-hidden="true" /></button></div></td></tr>)}</tbody></table></div>}
            {!loading && !error && students.length > 0 && <PaginationControls page={page} pageSize={pageSize} total={total} onPageChange={(nextPage) => load(filters, nextPage)} onPageSizeChange={(nextSize) => load(filters, 1, nextSize)} />}
        </div>
    )
}

function Metric({ label, value }) {
    return <div><p className="text-sm font-medium text-slate-700">{label}</p><p className="text-xl font-bold text-slate-900">{value}</p></div>
}

function Field({ label, children }) {
    return <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700">{label}{children}</label>
}
