import { useEffect, useMemo, useState } from 'react'
import {
    CalendarDays,
    CheckCircle,
    ClipboardCheck,
    Loader2,
    PlayCircle,
    RefreshCw,
    Rocket,
} from 'lucide-react'
import toast from 'react-hot-toast'

import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import LoadingState from '../../components/common/LoadingState'
import PageHeader from '../../components/common/PageHeader'
import StatusBadge from '../../components/common/StatusBadge'
import CspDiagnosticResult from '../../components/csp/CspDiagnosticResult'
import CspGenerationResult from '../../components/csp/CspGenerationResult'
import CspPreparationResult from '../../components/csp/CspPreparationResult'
import CspPreviewResult from '../../components/csp/CspPreviewResult'
import CspPublicationResult from '../../components/csp/CspPublicationResult'
import { useAuthStore } from '../../stores/authStore'
import { academicPeriodService } from '../../services/academicPeriodService'
import { academicProgramService } from '../../services/academicProgramService'
import { adminDemoService } from '../../services/adminDemoService'
import { curriculumService } from '../../services/curriculumService'
import { institutionalCspService } from '../../services/institutionalCspService'
import { offeringCspService } from '../../services/offeringCspService'
import { scheduleService } from '../../services/scheduleService'
import { normalizeApiError, safeArray } from '../../utils/safeData'

const CREATE_NEW = 'new'

const DEFAULT_CSP_CONFIG = {
    use_academic_slots: true,
    academic_slots: null,
    start_hour: '07:00:00',
    end_hour: '22:00:00',
    default_block_duration_minutes: 90,
    min_block_duration_minutes: 60,
    transfer_tolerance_minutes: 10,
    days: [1, 2, 3, 4, 5, 6, 7],
    avoid_duplicate_section_blocks: true,
    max_solutions: 3,
    clear_existing_blocks: false,
}

export default function InstitutionalCspGeneratorPage() {
    const { user } = useAuthStore()
    const [periods, setPeriods] = useState([])
    const [programs, setPrograms] = useState([])
    const [plans, setPlans] = useState([])
    const [availableSchedules, setAvailableSchedules] = useState([])
    const [selectedScheduleId, setSelectedScheduleId] = useState(CREATE_NEW)
    const [selectedPeriodId, setSelectedPeriodId] = useState('')
    const [selectedProgramId, setSelectedProgramId] = useState('')
    const [selectedPlanId, setSelectedPlanId] = useState('')
    const [selectedCycles, setSelectedCycles] = useState([1])
    const [scheduleName, setScheduleName] = useState('Horario institucional 2026-I')
    const [generationSource, setGenerationSource] = useState('OFFERINGS')
    const [prepareAllCycles, setPrepareAllCycles] = useState(true)
    const [preparation, setPreparation] = useState(null)
    const [diagnostic, setDiagnostic] = useState(null)
    const [preview, setPreview] = useState(null)
    const [generation, setGeneration] = useState(null)
    const [savedSchedule, setSavedSchedule] = useState(null)
    const [publication, setPublication] = useState(null)
    const [publicationError, setPublicationError] = useState(null)
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState(false)
    const [loadingAction, setLoadingAction] = useState(null)

    const selectedPeriod = periods.find((item) => String(item.id) === String(selectedPeriodId))
    const selectedProgram = programs.find((item) => String(item.id) === String(selectedProgramId))
    const selectedPlan = plans.find((item) => String(item.id) === String(selectedPlanId))
    const selectedSchedule = availableSchedules.find((item) => String(item.id) === String(selectedScheduleId))
    const filteredPlans = plans.filter((plan) => !selectedProgramId || String(plan.program_id) === String(selectedProgramId))
    const cycleOptions = Array.from({ length: Number(selectedPlan?.total_cycles || 10) }, (_, index) => index + 1)
    const isCreatingNew = selectedScheduleId === CREATE_NEW
    const isModernSource = generationSource === 'OFFERINGS'
    const publishableSchedule = savedSchedule || (!isCreatingNew && selectedSchedule?.blocks_count > 0 ? selectedSchedule : null)
    const publishableStatus = publishableSchedule?.status || selectedSchedule?.status
    const publishDisabledReason = isModernSource && !publishableSchedule
        ? 'Primero genere y guarde una solucion antes de publicar.'
        : !isModernSource && (isCreatingNew || !selectedSchedule?.id)
            ? 'Seleccione un horario existente antes de publicar.'
            : publishableStatus === 'PUBLISHED'
                ? 'Este horario ya esta publicado.'
                : ''

    const canRunCsp = Boolean(selectedPeriod && selectedProgram && selectedPlan)
    const canGenerateModern = !isModernSource || preview?.can_generate === true

    const loadData = async () => {
        setLoading(true)
        setLoadError(false)
        try {
            const [periodData, programData, planData, schedulesData] = await Promise.all([
                academicPeriodService.getPeriods(),
                academicProgramService.getPrograms(),
                curriculumService.getPlans(),
                institutionalCspService.availableSchedules(),
            ])

            const nextPeriods = unwrap(periodData)
            const nextPrograms = unwrap(programData)
            const nextPlans = unwrap(planData)
            const nextSchedules = safeArray(schedulesData)

            const activePeriod = nextPeriods.find((item) => item.is_active) || nextPeriods[0]
            const isiProgram = nextPrograms.find((item) => item.code === 'ISI' || item.name?.includes('Sistemas')) || nextPrograms[0]
            const activePlan = nextPlans.find((item) => item.status === 'ACTIVE' && (!isiProgram || item.program_id === isiProgram.id)) || nextPlans.find((item) => item.status === 'ACTIVE') || nextPlans[0]

            setPeriods(nextPeriods)
            setPrograms(nextPrograms)
            setPlans(nextPlans)
            setAvailableSchedules(nextSchedules)
            setSelectedPeriodId((current) => current || activePeriod?.id || '')
            setSelectedProgramId((current) => current || isiProgram?.id || '')
            setSelectedPlanId((current) => current || activePlan?.id || '')
            setScheduleName(defaultScheduleName(activePeriod, isiProgram))

            const preferredSchedule = nextSchedules.find((item) => item.status === 'DRAFT') || nextSchedules[0]
            setSelectedScheduleId((current) => current === CREATE_NEW && preferredSchedule ? String(preferredSchedule.id) : current || CREATE_NEW)
        } catch (error) {
            setLoadError(true)
            toast.error(normalizeApiError(error, 'No se pudieron cargar los datos institucionales.'))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    useEffect(() => {
        if (!selectedProgramId) return
        const nextPlan = filteredPlans.find((item) => String(item.id) === String(selectedPlanId))
            || filteredPlans.find((item) => item.status === 'ACTIVE')
            || filteredPlans[0]
        if (nextPlan && String(nextPlan.id) !== String(selectedPlanId)) {
            setSelectedPlanId(nextPlan.id)
        }
    }, [selectedProgramId, plans])

    useEffect(() => {
        if (!selectedPlan) return
        setSelectedCycles((current) => current.filter((cycle) => cycle <= Number(selectedPlan.total_cycles || 10)))
    }, [selectedPlanId])

    const selectedScheduleDetails = useMemo(() => selectedSchedule || null, [selectedSchedule])

    const ensureSchedule = async () => {
        if (!isCreatingNew && selectedSchedule?.id) {
            return selectedSchedule.id
        }

        if (!selectedPeriod || !selectedProgram || !selectedPlan) {
            throw new Error('Primero registre o seleccione periodo, programa y plan curricular.')
        }

        const payload = {
            name: scheduleName || defaultScheduleName(selectedPeriod, selectedProgram),
            academic_period: selectedPeriod.code || selectedPeriod.name,
            source_type: 'COURSE_SECTIONS',
            academic_period_id: Number(selectedPeriod.id),
            academic_program_id: Number(selectedProgram.id),
            curriculum_plan_id: Number(selectedPlan.id),
            schedule_type: 'INSTITUTIONAL',
            status: 'DRAFT',
            is_active: true,
        }
        const created = await scheduleService.createSchedule(payload)
        toast.success(`Horario creado: ${created.name}`)
        await loadData()
        setSelectedScheduleId(String(created.id))
        return created.id
    }

    const buildCspPayload = async () => {
        const scheduleId = await ensureSchedule()
        if (!scheduleId || Number(scheduleId) <= 0) {
            throw new Error('Seleccione un horario institucional valido.')
        }

        return {
            schedule_id: Number(scheduleId),
            academic_period: selectedPeriod?.code || selectedPeriod?.name || '2026-I',
            cycle_filter: selectedCycles,
            career_filter: selectedProgram?.name || undefined,
            ...DEFAULT_CSP_CONFIG,
        }
    }

    const buildOfferingPayload = () => ({
        academic_period_id: Number(selectedPeriodId),
        academic_program_id: selectedProgramId ? Number(selectedProgramId) : null,
        curriculum_plan_id: selectedPlanId ? Number(selectedPlanId) : null,
        cycles: prepareAllCycles ? 'all' : selectedCycles,
        strategy: 'BALANCED',
        max_solutions: 3,
        allow_ready: true,
        include_approved_only: false,
        respect_teacher_availability: true,
        respect_classroom_capacity: true,
        respect_classroom_requirements: true,
        avoid_same_cycle_conflicts: true,
    })

    const runAction = async (action, callback) => {
        if (!canRunCsp) {
            toast.error('Primero registre un periodo academico, programa y plan curricular.')
            return
        }

        setLoadingAction(action)
        try {
            const payload = isModernSource ? buildOfferingPayload() : await buildCspPayload()
            const data = await callback(payload)
            if (action === 'diagnose') setDiagnostic(data)
            if (action === 'preview') setPreview(data)
            if (action === 'generate') setGeneration(data)
            toast.success(actionMessage(action, data))
        } catch (error) {
            toast.error(readCspError(error, isModernSource))
        } finally {
            setLoadingAction(null)
        }
    }

    const handleSaveOfferingSolution = async (solutionIndex) => {
        setLoadingAction(`save-${solutionIndex}`)
        try {
            const data = await offeringCspService.saveSolution({
                ...buildOfferingPayload(),
                solution_index: Number(solutionIndex || 0),
                schedule_name: scheduleName || defaultScheduleName(selectedPeriod, selectedProgram),
            })
            setSavedSchedule({
                id: data.schedule_id,
                blocks_count: data.total_blocks,
                status: data.schedule_status,
                label: `Horario guardado #${data.schedule_id} - ${data.total_blocks} bloques`,
            })
            setPublication(null)
            setPublicationError(null)
            toast.success(`Horario DRAFT #${data.schedule_id} guardado correctamente.`)
            await loadData()
        } catch (error) {
            toast.error(readCspError(error, true))
        } finally {
            setLoadingAction(null)
        }
    }

    const handlePrepareDemo = async () => {
        if (!canRunCsp) {
            toast.error('Seleccione periodo, programa y plan antes de preparar la demo.')
            return
        }
        setLoadingAction('prepare')
        try {
            const data = await adminDemoService.prepareInstitutionalCsp({
                academic_period_id: Number(selectedPeriodId),
                academic_program_id: Number(selectedProgramId),
                curriculum_plan_id: Number(selectedPlanId),
                cycles: prepareAllCycles ? 'all' : selectedCycles,
                status_target: 'APPROVED',
                create_missing_offerings: true,
                create_missing_teachers: true,
                create_missing_classrooms: true,
                fix_existing_offerings: true,
            })
            setPreparation(data)
            toast.success(data.message || 'Datos demo preparados.')
            await loadData()
            const previewData = await offeringCspService.preview(buildOfferingPayload())
            setPreview(previewData)
        } catch (error) {
            toast.error(readCspError(error, true))
        } finally {
            setLoadingAction(null)
        }
    }

    const handlePublish = async () => {
        const scheduleToPublish = publishableSchedule
        if (!scheduleToPublish?.id) {
            toast.error(publishDisabledReason || 'Primero genere y guarde una solucion antes de publicar.')
            return
        }
        if (scheduleToPublish.blocks_count <= 0) {
            toast.error('Este horario no tiene bloques. Genere y guarde una solucion primero.')
            return
        }

        setLoadingAction('publish')
        try {
            const response = await scheduleService.publishSchedule(scheduleToPublish.id)
            setPublication(response)
            setPublicationError(null)
            toast.success('Horario publicado. Se notifico a docentes y estudiantes afectados.')
            await loadData()
        } catch (error) {
            const normalized = normalizeApiError(error, 'No se pudo publicar el horario.')
            setPublication(null)
            setPublicationError(error.response?.data?.detail || { message: normalized })
            toast.error(normalized)
        } finally {
            setLoadingAction(null)
        }
    }

    if (loading) return <LoadingState title="Cargando configuracion institucional..." />
    if (loadError) return <ErrorState onRetry={loadData} message="No se pudieron obtener periodos, planes u horarios." />

    return (
        <div className="space-y-8">
            <PageHeader
                eyebrow="Generacion institucional"
                title="Motor CSP Institucional"
                description="Selecciona periodo, carrera, plan y horario con datos detectados automaticamente. No necesitas escribir IDs internos."
                actions={(
                    <div className="flex flex-wrap gap-2">
                        {user?.role === 'ADMIN' && (
                            <button
                                onClick={handlePrepareDemo}
                                disabled={loadingAction === 'prepare'}
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                            >
                                {loadingAction === 'prepare' ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                Preparar datos demo completo
                            </button>
                        )}
                        <button onClick={loadData} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold text-slate-700">
                            <RefreshCw size={16} /> Recargar datos
                        </button>
                    </div>
                )}
            />

            {(!periods.length || !programs.length || !plans.length) && (
                <EmptyState
                    title="Primero registre un periodo academico y un plan curricular."
                    text="La generacion institucional necesita dominio academico base antes de ejecutar CSP."
                />
            )}

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="space-y-6 xl:col-span-1">
                    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-slate-900">
                            <Rocket className="text-orange-600" /> Datos detectados
                        </h2>

                        <div className="space-y-4">
                            <SelectField label="Periodo academico" value={selectedPeriodId} onChange={setSelectedPeriodId}>
                                {periods.map((period) => (
                                    <option key={period.id} value={period.id}>
                                        {period.code || period.name} {period.is_active ? '- Activo' : `- ${period.status || 'Planificado'}`}
                                    </option>
                                ))}
                            </SelectField>

                            <SelectField label="Programa academico" value={selectedProgramId} onChange={setSelectedProgramId}>
                                {programs.map((program) => (
                                    <option key={program.id} value={program.id}>
                                        {program.name} ({program.code})
                                    </option>
                                ))}
                            </SelectField>

                            <SelectField label="Plan curricular" value={selectedPlanId} onChange={setSelectedPlanId}>
                                {filteredPlans.map((plan) => (
                                    <option key={plan.id} value={plan.id}>
                                        {plan.code} - {plan.status}
                                    </option>
                                ))}
                            </SelectField>

                            {isCreatingNew && (
                                <Field
                                    label="Nombre del nuevo horario"
                                    value={scheduleName}
                                    onChange={setScheduleName}
                                />
                            )}
                        </div>
                    </section>

                    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-xl font-black text-slate-900">Ciclos a generar</h2>
                        <label className="mb-4 flex cursor-pointer items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
                            <input type="checkbox" checked={prepareAllCycles} onChange={(event) => setPrepareAllCycles(event.target.checked)} />
                            Preparar/generar todos los ciclos del plan
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {cycleOptions.map((cycle) => (
                                <label key={cycle} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold ${selectedCycles.includes(cycle) ? 'border-orange-300 bg-orange-50 text-orange-700' : 'border-slate-200 text-slate-600'}`}>
                                    <input
                                        type="checkbox"
                                        checked={selectedCycles.includes(cycle)}
                                        onChange={() => toggleCycle(cycle, selectedCycles, setSelectedCycles)}
                                    />
                                    Ciclo {cycle}
                                </label>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="space-y-6 xl:col-span-2">
                    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-xl font-black text-slate-900">Horario institucional</h2>
                        <select
                            value={selectedScheduleId}
                            onChange={(event) => {
                setSelectedScheduleId(event.target.value)
                setSavedSchedule(null)
                                setDiagnostic(null)
                                setPreview(null)
                                setGeneration(null)
                                setPublication(null)
                                setPublicationError(null)
                            }}
                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        >
                            <option value={CREATE_NEW}>Crear nuevo horario</option>
                            {availableSchedules.map((item) => (
                                <option key={item.id} value={item.id}>{item.label}</option>
                            ))}
                        </select>

                        {!availableSchedules.length && (
                            <div className="mt-4">
                                <EmptyState
                                    title="No hay horarios institucionales todavia."
                                    text="Puedes crear uno nuevo generando una solucion."
                                />
                            </div>
                        )}

                        {selectedScheduleDetails && (
                            <ScheduleDetails schedule={selectedScheduleDetails} />
                        )}
                        {savedSchedule && (
                            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
                                Solucion guardada: {savedSchedule.label}. Ya puedes publicar con validacion segura.
                            </div>
                        )}
                    </section>

                    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-xl font-black text-slate-900">Acciones CSP</h2>
                        <div className="mb-5 grid gap-3 md:grid-cols-2">
                            <label className={`cursor-pointer rounded-2xl border p-4 ${isModernSource ? 'border-orange-300 bg-orange-50' : 'border-slate-200 bg-slate-50'}`}>
                                <input
                                    type="radio"
                                    name="generationSource"
                                    value="OFFERINGS"
                                    checked={isModernSource}
                                    onChange={() => setGenerationSource('OFFERINGS')}
                                    className="mr-2"
                                />
                                <span className="font-black text-slate-900">Oferta academica moderna</span>
                                <p className="mt-1 text-xs text-slate-500">Recomendado: usa section_offerings READY/APPROVED.</p>
                            </label>
                            <label className={`cursor-pointer rounded-2xl border p-4 ${!isModernSource ? 'border-slate-400 bg-slate-100' : 'border-slate-200 bg-slate-50'}`}>
                                <input
                                    type="radio"
                                    name="generationSource"
                                    value="LEGACY"
                                    checked={!isModernSource}
                                    onChange={() => setGenerationSource('LEGACY')}
                                    className="mr-2"
                                />
                                <span className="font-black text-slate-900">Generador clasico legacy</span>
                                <p className="mt-1 text-xs text-slate-500">Usa course_sections y filtros historicos.</p>
                            </label>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <ActionButton icon={ClipboardCheck} title="Diagnosticar" loading={loadingAction === 'diagnose'} disabled={!canRunCsp} onClick={() => runAction('diagnose', isModernSource ? offeringCspService.preview : institutionalCspService.diagnoseDomains)} />
                            <ActionButton icon={PlayCircle} title="Vista previa" loading={loadingAction === 'preview'} disabled={!canRunCsp} onClick={() => runAction('preview', isModernSource ? offeringCspService.preview : institutionalCspService.previewInstitutionalSchedule)} />
                            <ActionButton icon={CalendarDays} title="Generar horario" loading={loadingAction === 'generate'} disabled={!canRunCsp || !canGenerateModern} onClick={() => runAction('generate', isModernSource ? offeringCspService.generate : institutionalCspService.generateInstitutionalSchedule)} helper={!canGenerateModern ? 'Ejecute Vista previa o prepare datos demo.' : ''} />
                            <ActionButton icon={CheckCircle} title="Publicar" loading={loadingAction === 'publish'} disabled={Boolean(publishDisabledReason)} onClick={handlePublish} helper={publishDisabledReason} />
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                            <Metric label="Ofertas elegibles" value={diagnostic?.eligible_offerings || diagnostic?.domains?.sections || diagnostic?.summary?.sections || '-'} />
                            <Metric label="READY/APPROVED" value={diagnostic ? `${diagnostic.ready_offerings ?? '-'} / ${diagnostic.approved_offerings ?? '-'}` : '-'} />
                            <Metric label="Bloques generados" value={generation?.total_blocks || generation?.generated_blocks || generation?.solutions?.[0]?.blocks?.length || '-'} />
                        </div>

                    </section>
                </div>
            </section>

            {preparation && <CspPreparationResult data={preparation} />}
            {diagnostic && (
                <CspDiagnosticResult
                    data={diagnostic}
                    scheduleLabel={selectedSchedule?.label || (isCreatingNew ? 'Nuevo horario' : selectedSchedule?.name)}
                />
            )}
            {preview && <CspPreviewResult data={preview} />}
            {generation && (
                <CspGenerationResult
                    data={generation}
                    onSaveSolution={isModernSource ? handleSaveOfferingSolution : undefined}
                    savingSolutionIndex={typeof loadingAction === 'string' && loadingAction.startsWith('save-') ? Number(loadingAction.replace('save-', '')) : null}
                />
            )}
            {(publication || publicationError) && <CspPublicationResult data={publication} error={publicationError} />}
        </div>
    )
}

function SelectField({ label, value, onChange, children }) {
    return (
        <div>
            <label className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</label>
            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            >
                {children}
            </select>
        </div>
    )
}

function Field({ label, value, onChange }) {
    return (
        <div>
            <label className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</label>
            <input
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
        </div>
    )
}

function ScheduleDetails({ schedule }) {
    return (
        <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-slate-900">{schedule.name}</h3>
                <StatusBadge value={schedule.status} />
                <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-500">
                    ID interno #{schedule.id}
                </span>
            </div>
            <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                <Info label="Periodo" value={schedule.academic_period_code} />
                <Info label="Programa" value={schedule.academic_program_name || '-'} />
                <Info label="Plan" value={schedule.curriculum_plan_code || '-'} />
                <Info label="Fuente" value={schedule.source_type} />
                <Info label="Bloques" value={schedule.blocks_count} />
                <Info label="Score" value={schedule.quality_score ?? '-'} />
                <Info label="Actualizado" value={formatDate(schedule.updated_at)} />
            </dl>
        </div>
    )
}

function Info({ label, value }) {
    return <div><dt className="text-xs font-bold uppercase text-slate-400">{label}</dt><dd className="font-semibold text-slate-700">{value}</dd></div>
}

function ActionButton({ icon: Icon, title, loading, disabled, onClick, helper }) {
    return (
        <button
            type="button"
            title={helper || title}
            disabled={disabled || loading}
            onClick={onClick}
            className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-center transition hover:border-orange-300 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
            {loading ? <Loader2 size={26} className="animate-spin text-orange-600" /> : <Icon size={26} className="text-orange-600" />}
            <span className="text-sm font-black text-slate-800">{title}</span>
            {helper && <span className="text-xs font-semibold text-slate-500">{helper}</span>}
        </button>
    )
}

function Metric({ label, value }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-black text-slate-900">{value}</p>
        </div>
    )
}

function unwrap(value) {
    return Array.isArray(value) ? value : value?.items || value?.periods || value?.programs || value?.plans || value?.schedules || []
}

function toggleCycle(cycle, selectedCycles, setSelectedCycles) {
    setSelectedCycles((current) => {
        if (current.includes(cycle)) {
            const next = current.filter((item) => item !== cycle)
            return next.length ? next : current
        }
        return [...current, cycle].sort((a, b) => a - b)
    })
}

function defaultScheduleName(period, program) {
    return `${program?.code || 'ISI'} ${period?.code || '2026-I'} - Horario institucional`
}

function formatDate(value) {
    if (!value) return '-'
    return new Date(value).toLocaleString('es-PE')
}

function actionMessage(action, data) {
    if (action === 'diagnose') return data?.success === false ? 'Diagnostico con observaciones criticas' : 'Diagnostico CSP completado'
    if (action === 'preview') return 'Vista previa generada correctamente'
    return 'Horario institucional generado correctamente'
}

function readCspError(error, modernMode) {
    const raw = normalizeApiError(error, 'No se pudo completar la accion CSP.')
    if (raw.includes('No hay secciones para programar')) {
        return 'No se encontraron secciones en el generador clasico. Para la planificacion actual usa la fuente "Oferta academica moderna" o revisa que existan ofertas READY/APPROVED para el periodo y ciclos seleccionados.'
    }
    if (modernMode && (raw.includes('READY') || raw.includes('APPROVED') || raw.includes('ofertas'))) {
        return 'No hay ofertas READY o APPROVED para los ciclos seleccionados. Revise la Oferta academica antes de generar.'
    }
    return raw
}
