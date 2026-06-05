import { useEffect, useState } from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { academicPeriodService } from '../../services/academicPeriodService'
import { academicProgramService } from '../../services/academicProgramService'
import { curriculumService } from '../../services/curriculumService'
import { offeringCspService } from '../../services/offeringCspService'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import LoadingState from '../../components/common/LoadingState'
import CspGenerationResult from '../../components/csp/CspGenerationResult'

export default function CoordinatorCspPage() {
    const [periods, setPeriods] = useState([])
    const [programs, setPrograms] = useState([])
    const [plans, setPlans] = useState([])
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)
    const [initialError, setInitialError] = useState(false)
    const [saving, setSaving] = useState(null)
    const [form, setForm] = useState({
        academic_period_id: '',
        academic_program_id: '',
        curriculum_plan_id: '',
        cycles: '1',
        strategy: 'BALANCED',
        max_solutions: 3,
        allow_ready: true,
        include_approved_only: false,
        avoid_same_cycle_conflicts: true,
    })

    useEffect(() => {
        Promise.all([
            academicPeriodService.getPeriods(),
            academicProgramService.getPrograms(),
            curriculumService.getPlans(),
        ]).then(([periodData, programData, planData]) => {
            const nextPeriods = unwrap(periodData)
            const nextPrograms = unwrap(programData)
            const nextPlans = unwrap(planData)
            setPeriods(nextPeriods)
            setPrograms(nextPrograms)
            setPlans(nextPlans)
            setForm((current) => ({
                ...current,
                academic_period_id: current.academic_period_id || nextPeriods.find((item) => item.is_active)?.id || nextPeriods[0]?.id || '',
                academic_program_id: current.academic_program_id || nextPrograms[0]?.id || '',
                curriculum_plan_id: current.curriculum_plan_id || nextPlans[0]?.id || '',
            }))
        }).catch(() => { setInitialError(true); toast.error('No se pudo cargar el dominio academico.') })
            .finally(() => setInitialLoading(false))
    }, [])

    const payload = () => ({
        ...form,
        academic_period_id: Number(form.academic_period_id),
        academic_program_id: form.academic_program_id ? Number(form.academic_program_id) : null,
        curriculum_plan_id: form.curriculum_plan_id ? Number(form.curriculum_plan_id) : null,
        cycles: form.cycles.split(',').map((item) => Number(item.trim())).filter(Boolean),
        max_solutions: Number(form.max_solutions),
        respect_teacher_availability: true,
        respect_classroom_capacity: true,
        respect_classroom_requirements: true,
    })

    const generate = async () => {
        setLoading(true)
        try {
            const data = await offeringCspService.generate(payload())
            setResult(data)
            toast.success('Soluciones generadas. Generacion registrada en auditoria.')
        } catch (error) {
            toast.error(readError(error))
        } finally {
            setLoading(false)
        }
    }

    const save = async (solutionIndex) => {
        setSaving(solutionIndex)
        try {
            const data = await offeringCspService.saveSolution({
                ...payload(),
                solution_index: solutionIndex,
                schedule_name: `Horario ISI desde ofertas - opcion ${solutionIndex + 1}`,
            })
            toast.success(`Horario DRAFT #${data.schedule_id} guardado y registrado en auditoria.`)
        } catch (error) {
            toast.error(readError(error))
        } finally {
            setSaving(null)
        }
    }

    return <div className="space-y-6">
        <section className="rounded-3xl bg-slate-900 p-6 text-white">
            <h1 className="flex items-center gap-3 text-2xl font-bold"><Sparkles /> CSP desde oferta academica</h1>
            <p className="mt-2 text-slate-300">Genera horarios institucionales a partir de secciones READY o APPROVED y los guarda en DRAFT.</p>
        </section>
        {initialLoading && <LoadingState title="Cargando dominio academico..." />}
        {initialError && !initialLoading && <ErrorState onRetry={() => window.location.reload()} />}
        {!initialLoading && !initialError && !periods.length && <EmptyState title="No hay periodos disponibles para generar CSP." />}
        <section className="grid gap-4 rounded-3xl bg-white p-6 shadow-sm md:grid-cols-3">
            <Select label="Periodo" value={form.academic_period_id} onChange={(value) => setForm({ ...form, academic_period_id: value })} items={periods} />
            <Select label="Programa" value={form.academic_program_id} onChange={(value) => setForm({ ...form, academic_program_id: value })} items={programs} />
            <Select label="Plan" value={form.curriculum_plan_id} onChange={(value) => setForm({ ...form, curriculum_plan_id: value })} items={plans} />
            <Field label="Ciclos (coma)" value={form.cycles} onChange={(value) => setForm({ ...form, cycles: value })} />
            <label className="text-sm font-semibold text-slate-700">Estrategia<select className="mt-2 w-full rounded-xl border p-3" value={form.strategy} onChange={(event) => setForm({ ...form, strategy: event.target.value })}><option value="COMPACT">Compacto</option><option value="BALANCED">Balanceado</option><option value="SPREAD">Distribuido</option></select></label>
            <Field label="Soluciones" type="number" value={form.max_solutions} onChange={(value) => setForm({ ...form, max_solutions: value })} />
            <button onClick={generate} disabled={loading} className="col-span-full flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white">
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />} Generar desde oferta academica
            </button>
        </section>
        {result && (
            <CspGenerationResult
                data={result}
                onSaveSolution={save}
                savingSolutionIndex={saving}
            />
        )}
    </div>
}

function Select({ label, value, onChange, items }) {
    return <label className="text-sm font-semibold text-slate-700">{label}<select className="mt-2 w-full rounded-xl border p-3" value={value} onChange={(event) => onChange(event.target.value)}>{items.map((item) => <option key={item.id} value={item.id}>{item.code || item.name}</option>)}</select></label>
}
function Field({ label, value, onChange, type = 'text' }) {
    return <label className="text-sm font-semibold text-slate-700">{label}<input className="mt-2 w-full rounded-xl border p-3" type={type} value={value} onChange={(event) => onChange(event.target.value)} /></label>
}
function unwrap(value) { return Array.isArray(value) ? value : value?.items || value?.periods || value?.programs || value?.plans || [] }
function readError(error) { const detail = error.response?.data?.detail; return typeof detail === 'string' ? detail : detail?.message || 'No se pudo completar la operacion.' }
