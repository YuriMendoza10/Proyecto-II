import { useEffect, useState } from 'react'
import {
    AlertTriangle,
    CalendarDays,
    CheckCircle,
    ClipboardCheck,
    Database,
    Eye,
    FileSearch,
    Layers,
    Loader2,
    PlayCircle,
    RefreshCw,
    School,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

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
    const navigate = useNavigate()
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
    const [scheduleSearch, setScheduleSearch] = useState('')
    const [scheduleStatusFilter, setScheduleStatusFilter] = useState('ALL')
    const [schedulePeriodFilter, setSchedulePeriodFilter] = useState('ALL')
    const [expandedScheduleId, setExpandedScheduleId] = useState(null)

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
    const selectedScheduleDetails = selectedSchedule || null
    const currentSchedule = savedSchedule || selectedScheduleDetails
    const scheduleBlocks = Number(currentSchedule?.blocks_count ?? generation?.total_blocks ?? generation?.generated_blocks ?? generation?.solutions?.[0]?.blocks?.length ?? 0)
    const scheduleScore = currentSchedule?.quality_score ?? generation?.best_score ?? generation?.score_total ?? generation?.score ?? preview?.best_score ?? 0
    const preparationSummary = buildPreparationSummary({
        preparation,
        diagnostic,
        preview,
        generation,
        selectedCycles,
        prepareAllCycles,
        cycleOptions,
        scheduleBlocks,
    })
    const hasOperationalData = Boolean(preparation || diagnostic || preview || generation)
    const hasCriticalMissingData = hasOperationalData && (Number(preparationSummary.availability) === 0
        || Number(preparationSummary.teachersAssigned) === 0
        || Number(preparationSummary.classroomsAssigned) === 0)
    const schedulePeriodOptions = uniqueSchedulePeriods(availableSchedules)
    const filteredGeneratedSchedules = filterGeneratedSchedules(
        availableSchedules,
        scheduleSearch,
        scheduleStatusFilter,
        schedulePeriodFilter,
    )

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

    const handleSelectGeneratedSchedule = (schedule) => {
        setSelectedScheduleId(String(schedule.id))
        setSavedSchedule(null)
        setDiagnostic(null)
        setPreview(null)
        setGeneration(null)
        setPublication(null)
        setPublicationError(null)
        setExpandedScheduleId(schedule.id)
        toast.success(`Horario #${schedule.id} cargado en el flujo CSP.`)
    }

    const handlePublishGeneratedSchedule = async (schedule) => {
        if (!schedule?.id) return
        if (schedule.status === 'PUBLISHED') {
            toast('Este horario ya esta publicado.')
            return
        }
        if (Number(schedule.blocks_count || 0) <= 0) {
            toast.error('Este horario aun no tiene bloques generados.')
            return
        }

        setLoadingAction(`publish-list-${schedule.id}`)
        try {
            const response = await scheduleService.publishSchedule(schedule.id)
            setPublication(response)
            setPublicationError(null)
            toast.success(`Horario #${schedule.id} publicado correctamente.`)
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
        <div className="space-y-6">
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

            <section className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.4fr)]">
                <SelectedScheduleCard
                    schedule={currentSchedule}
                    scheduleName={scheduleName}
                    selectedPeriod={selectedPeriod}
                    selectedProgram={selectedProgram}
                    selectedPlan={selectedPlan}
                    isCreatingNew={isCreatingNew}
                    blocks={scheduleBlocks}
                    score={scheduleScore}
                />
                <PreparationSummaryPanel
                    summary={preparationSummary}
                    hasCriticalMissingData={hasCriticalMissingData}
                />
            </section>

            <GeneratedSchedulesSection
                schedules={filteredGeneratedSchedules}
                allSchedules={availableSchedules}
                selectedScheduleId={selectedScheduleId}
                expandedScheduleId={expandedScheduleId}
                search={scheduleSearch}
                statusFilter={scheduleStatusFilter}
                periodFilter={schedulePeriodFilter}
                periodOptions={schedulePeriodOptions}
                loadingAction={loadingAction}
                onSearchChange={setScheduleSearch}
                onStatusFilterChange={setScheduleStatusFilter}
                onPeriodFilterChange={setSchedulePeriodFilter}
                onToggleDetail={(id) => setExpandedScheduleId((current) => current === id ? null : id)}
                onLoadSchedule={handleSelectGeneratedSchedule}
                onViewBlocks={(schedule) => navigate(`/admin/schedule-view?schedule_id=${schedule.id}`)}
                onPublishSchedule={handlePublishGeneratedSchedule}
            />

            <section className="sticky top-3 z-20 rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-lg shadow-slate-200/60 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 dark:shadow-black/20">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                        <p className="text-xs font-black uppercase tracking-wide text-orange-600 dark:text-orange-300">Acciones del flujo CSP</p>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                            Diagnostique, revise vista previa y genere el horario sin perder de vista el resumen superior.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap">
                        <CompactActionButton icon={ClipboardCheck} title="Diagnosticar" loading={loadingAction === 'diagnose'} disabled={!canRunCsp} onClick={() => runAction('diagnose', isModernSource ? offeringCspService.preview : institutionalCspService.diagnoseDomains)} />
                        <CompactActionButton icon={PlayCircle} title="Vista previa" loading={loadingAction === 'preview'} disabled={!canRunCsp} onClick={() => runAction('preview', isModernSource ? offeringCspService.preview : institutionalCspService.previewInstitutionalSchedule)} />
                        <CompactActionButton icon={CalendarDays} title="Generar" loading={loadingAction === 'generate'} disabled={!canRunCsp || !canGenerateModern} onClick={() => runAction('generate', isModernSource ? offeringCspService.generate : institutionalCspService.generateInstitutionalSchedule)} />
                        <CompactActionButton icon={CheckCircle} title="Publicar" loading={loadingAction === 'publish'} disabled={Boolean(publishDisabledReason)} onClick={handlePublish} />
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="space-y-6 xl:col-span-1">
                    <StepSection
                        step="Paso 1"
                        title="Seleccionar datos"
                        icon={School}
                        description="Periodo, programa, plan curricular y ciclos a generar."
                    >

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
                    </StepSection>

                    <StepSection
                        step="Paso 1"
                        title="Ciclos a generar"
                        icon={Layers}
                        description="Puede trabajar todos los ciclos del plan o elegir ciclos puntuales."
                    >
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
                    </StepSection>
                </div>

                <div className="space-y-6 xl:col-span-2">
                    <StepSection
                        step="Paso 2"
                        title="Preparar datos demo"
                        icon={Database}
                        description="Seleccione el horario y use la preparacion demo o recargue los datos institucionales."
                        actions={(
                            <div className="flex flex-wrap gap-2">
                                {user?.role === 'ADMIN' && (
                                    <button
                                        onClick={handlePrepareDemo}
                                        disabled={loadingAction === 'prepare'}
                                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black text-white hover:bg-emerald-700 disabled:opacity-60"
                                    >
                                        {loadingAction === 'prepare' ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
                                        Preparar datos demo completo
                                    </button>
                                )}
                                <button onClick={loadData} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800">
                                    <RefreshCw size={15} /> Recargar datos
                                </button>
                            </div>
                        )}
                    >
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
                        <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-300">
                            Tambien puede seleccionar un horario desde la lista superior de horarios generados, sin conocer el ID manualmente.
                        </p>

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
                    </StepSection>

                    <StepSection
                        step="Pasos 3, 4 y 5"
                        title="Diagnostico, vista previa, generacion y publicacion"
                        icon={FileSearch}
                        description="Los botones mantienen el flujo actual: diagnosticar, previsualizar, generar y publicar solo cuando corresponde."
                    >
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

                    </StepSection>
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

function StepSection({ step, title, description, icon: Icon, actions, children }) {
    return (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-200">
                        <Icon size={21} aria-hidden="true" />
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase tracking-wide text-orange-600 dark:text-orange-300">{step}</p>
                        <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">{title}</h2>
                        {description && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{description}</p>}
                    </div>
                </div>
                {actions && <div className="shrink-0">{actions}</div>}
            </div>
            {children}
        </section>
    )
}

function SelectedScheduleCard({ schedule, scheduleName, selectedPeriod, selectedProgram, selectedPlan, isCreatingNew, blocks, score }) {
    const scheduleId = schedule?.id
    const hasBlocks = Number(blocks || 0) > 0
    const status = schedule?.status || 'DRAFT'
    const title = scheduleId
        ? hasBlocks
            ? `Horario generado con ID #${scheduleId}`
            : `Horario seleccionado con ID #${scheduleId}, pendiente de generacion`
        : 'Nuevo horario pendiente de crear'

    return (
        <article className="rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 to-white p-5 shadow-sm dark:border-orange-800 dark:from-slate-900 dark:to-slate-950">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                    <p className="text-xs font-black uppercase tracking-wide text-orange-700 dark:text-orange-300">Horario seleccionado</p>
                    <h2 className="mt-1 text-xl font-black text-slate-950 dark:text-white">{title}</h2>
                    <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">{schedule?.name || scheduleName}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <StatusBadge value={status} />
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${hasBlocks ? 'border-emerald-700 bg-emerald-50 text-emerald-900' : 'border-amber-700 bg-amber-50 text-amber-950'}`}>
                        {hasBlocks ? 'Horario generado' : 'Sin bloques generados'}
                    </span>
                </div>
            </div>

            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-3">
                <Info label="ID" value={scheduleId ? `#${scheduleId}` : isCreatingNew ? 'Nuevo' : '-'} />
                <Info label="Periodo" value={schedule?.academic_period_code || selectedPeriod?.code || selectedPeriod?.name || '-'} />
                <Info label="Programa" value={schedule?.academic_program_name || selectedProgram?.name || '-'} />
                <Info label="Plan curricular" value={schedule?.curriculum_plan_code || selectedPlan?.code || '-'} />
                <Info label="Bloques generados" value={blocks || 0} />
                <Info label="Score" value={formatScore(score)} />
                <Info label="Actualizado" value={formatDate(schedule?.updated_at)} />
            </dl>
        </article>
    )
}

function PreparationSummaryPanel({ summary, hasCriticalMissingData }) {
    const cards = [
        ['Ciclos seleccionados', summary.cycles, 'neutral'],
        ['Ofertas revisadas', summary.offeringsReviewed, 'info'],
        ['Ofertas elegibles', summary.eligibleOfferings, 'success'],
        ['READY/APPROVED', summary.readyApproved, 'success'],
        ['Docentes asignados', summary.teachersAssigned, Number(summary.teachersAssigned) ? 'success' : 'warning'],
        ['Aulas asignadas', summary.classroomsAssigned, Number(summary.classroomsAssigned) ? 'success' : 'warning'],
        ['Disponibilidades', summary.availability, Number(summary.availability) ? 'success' : 'warning'],
        ['Bloques generados', summary.blocksGenerated, Number(summary.blocksGenerated) ? 'success' : 'neutral'],
        ['Advertencias', summary.warnings, Number(summary.warnings) ? 'warning' : 'success'],
    ]

    return (
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                    <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-300">Resumen de preparacion</p>
                    <h2 className="text-xl font-black text-slate-950 dark:text-white">Estado del flujo CSP</h2>
                </div>
                <span className={`w-fit rounded-full border px-3 py-1.5 text-xs font-black ${hasCriticalMissingData ? 'border-amber-700 bg-amber-50 text-amber-950' : 'border-emerald-700 bg-emerald-50 text-emerald-900'}`}>
                    {hasCriticalMissingData ? 'Con datos faltantes' : 'Listo para revisar'}
                </span>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {cards.map(([label, value, tone]) => <SummaryMetric key={label} label={label} value={value} tone={tone} />)}
            </div>

            {hasCriticalMissingData && (
                <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100" role="alert">
                    <div className="flex gap-2">
                        <AlertTriangle className="mt-0.5 shrink-0" size={18} aria-hidden="true" />
                        <div>
                            <p className="font-black">No se puede generar un horario completo porque faltan docentes, aulas o disponibilidades.</p>
                            <p className="mt-1 font-semibold">Asigne docentes, aulas y disponibilidad antes de generar la vista previa.</p>
                        </div>
                    </div>
                </div>
            )}
        </article>
    )
}

function GeneratedSchedulesSection({
    schedules,
    allSchedules,
    selectedScheduleId,
    expandedScheduleId,
    search,
    statusFilter,
    periodFilter,
    periodOptions,
    loadingAction,
    onSearchChange,
    onStatusFilterChange,
    onPeriodFilterChange,
    onToggleDetail,
    onLoadSchedule,
    onViewBlocks,
    onPublishSchedule,
}) {
    return (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <p className="text-xs font-black uppercase tracking-wide text-blue-600 dark:text-blue-300">Horarios generados</p>
                    <h2 className="text-xl font-black text-slate-950 dark:text-white">Lista de horarios institucionales disponibles</h2>
                    <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
                        Seleccione un horario sin escribir su ID. La lista usa el endpoint institucional existente.
                    </p>
                </div>
                <span className="w-fit rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-black text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100">
                    {allSchedules.length} horario(s)
                </span>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
                <label className="block">
                    <span className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-300">Buscar por nombre o ID</span>
                    <input
                        value={search}
                        onChange={(event) => onSearchChange(event.target.value)}
                        placeholder="Ej. 10, 2026-I, ISI..."
                        className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                    />
                </label>
                <label className="block">
                    <span className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-300">Estado</span>
                    <select
                        value={statusFilter}
                        onChange={(event) => onStatusFilterChange(event.target.value)}
                        className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                    >
                        <option value="ALL">Todos</option>
                        <option value="DRAFT">Borrador</option>
                        <option value="READY">Listo</option>
                        <option value="PUBLISHED">Publicado</option>
                    </select>
                </label>
                <label className="block">
                    <span className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-300">Periodo</span>
                    <select
                        value={periodFilter}
                        onChange={(event) => onPeriodFilterChange(event.target.value)}
                        className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                    >
                        <option value="ALL">Todos</option>
                        {periodOptions.map((period) => <option key={period} value={period}>{period}</option>)}
                    </select>
                </label>
            </div>

            {!allSchedules.length ? (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-6 dark:border-slate-700">
                    <EmptyState
                        title="No hay horarios generados todavia."
                        text="Prepare datos, ejecute diagnostico y genere un horario para verlo en esta lista."
                    />
                </div>
            ) : !schedules.length ? (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-6 dark:border-slate-700">
                    <EmptyState
                        title="No hay horarios con los filtros actuales."
                        text="Cambie el nombre, estado o periodo para ver otros horarios disponibles."
                    />
                </div>
            ) : (
                <div className="mt-5 max-h-[520px] overflow-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                    <table className="w-full min-w-[980px] text-sm">
                        <caption className="sr-only">Horarios institucionales generados o disponibles para cargar en el flujo CSP</caption>
                        <thead className="sticky top-0 bg-slate-50 text-left text-xs font-black uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                            <tr>
                                <th scope="col" className="px-4 py-3">Horario</th>
                                <th scope="col" className="px-4 py-3">Periodo</th>
                                <th scope="col" className="px-4 py-3">Programa / Plan</th>
                                <th scope="col" className="px-4 py-3">Estado</th>
                                <th scope="col" className="px-4 py-3">Bloques</th>
                                <th scope="col" className="px-4 py-3">Score</th>
                                <th scope="col" className="px-4 py-3">Actualizado</th>
                                <th scope="col" className="px-4 py-3">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schedules.map((schedule) => {
                                const selected = String(selectedScheduleId) === String(schedule.id)
                                const expanded = expandedScheduleId === schedule.id
                                const blocksCount = Number(schedule.blocks_count || 0)
                                const canPublish = schedule.status !== 'PUBLISHED' && blocksCount > 0

                                return (
                                    <tr key={schedule.id} className={`border-t border-slate-100 align-top dark:border-slate-800 ${selected ? 'bg-orange-50 dark:bg-orange-950/30' : 'bg-white dark:bg-slate-900'}`}>
                                        <td className="px-4 py-3">
                                            <p className="font-black text-slate-950 dark:text-white">ID #{schedule.id}</p>
                                            <p className="mt-0.5 max-w-[260px] truncate font-semibold text-slate-700 dark:text-slate-200" title={schedule.name}>
                                                {schedule.name || 'Horario institucional'}
                                            </p>
                                            {selected && <p className="mt-1 text-xs font-black text-orange-700 dark:text-orange-300">Seleccionado actualmente</p>}
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">{schedule.academic_period_code || '-'}</td>
                                        <td className="px-4 py-3">
                                            <p className="font-semibold text-slate-800 dark:text-slate-100">{schedule.academic_program_name || '-'}</p>
                                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{schedule.curriculum_plan_code || '-'}</p>
                                        </td>
                                        <td className="px-4 py-3"><StatusBadge value={schedule.status} /></td>
                                        <td className="px-4 py-3">
                                            <span className={`rounded-full border px-2.5 py-1 text-xs font-black ${blocksCount ? 'border-emerald-700 bg-emerald-50 text-emerald-900' : 'border-amber-700 bg-amber-50 text-amber-950'}`}>
                                                {blocksCount ? `${blocksCount} bloque(s)` : 'Sin bloques'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-black text-slate-800 dark:text-slate-100">{formatScore(schedule.quality_score)}</td>
                                        <td className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300">{formatDate(schedule.updated_at)}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-2">
                                                <SmallActionButton onClick={() => onToggleDetail(schedule.id)} icon={Eye}>
                                                    {expanded ? 'Ocultar' : 'Ver detalle'}
                                                </SmallActionButton>
                                                <SmallActionButton onClick={() => onLoadSchedule(schedule)}>
                                                    Cargar horario
                                                </SmallActionButton>
                                                <SmallActionButton onClick={() => onViewBlocks(schedule)} disabled={!blocksCount}>
                                                    Ver bloques
                                                </SmallActionButton>
                                                <SmallActionButton
                                                    onClick={() => onPublishSchedule(schedule)}
                                                    disabled={!canPublish || loadingAction === `publish-list-${schedule.id}`}
                                                >
                                                    {loadingAction === `publish-list-${schedule.id}` ? 'Publicando...' : 'Publicar'}
                                                </SmallActionButton>
                                            </div>
                                            {expanded && (
                                                <dl className="mt-3 grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-800">
                                                    <Info label="Fuente" value={schedule.source_type || '-'} />
                                                    <Info label="ID periodo" value={schedule.academic_period_id || '-'} />
                                                    <Info label="ID programa" value={schedule.academic_program_id || '-'} />
                                                    <Info label="ID plan" value={schedule.curriculum_plan_id || '-'} />
                                                    <Info label="Creado" value={formatDate(schedule.created_at)} />
                                                </dl>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    )
}

function SmallActionButton({ children, onClick, disabled, icon: Icon }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-black text-slate-700 transition hover:border-orange-400 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800"
        >
            {Icon && <Icon size={13} aria-hidden="true" />}
            {children}
        </button>
    )
}

function SummaryMetric({ label, value, tone }) {
    const tones = {
        info: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100',
        success: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100',
        warning: 'border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100',
        neutral: 'border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100',
    }
    return (
        <div className={`rounded-2xl border p-3 ${tones[tone] || tones.neutral}`}>
            <p className="text-[11px] font-black uppercase tracking-wide opacity-75">{label}</p>
            <p className="mt-1 text-xl font-black">{value ?? '-'}</p>
        </div>
    )
}

function CompactActionButton({ icon: Icon, title, loading, disabled, onClick }) {
    return (
        <button
            type="button"
            disabled={disabled || loading}
            onClick={onClick}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-800 transition hover:border-orange-400 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800"
        >
            {loading ? <Loader2 size={17} className="animate-spin text-orange-600" /> : <Icon size={17} className="text-orange-600" />}
            {title}
        </button>
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
    return <div><dt className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">{label}</dt><dd className="font-semibold text-slate-800 dark:text-slate-100">{value}</dd></div>
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

function buildPreparationSummary({ preparation, diagnostic, preview, generation, selectedCycles, prepareAllCycles, cycleOptions, scheduleBlocks }) {
    const ready = firstValue(
        diagnostic?.ready_offerings,
        preview?.ready_offerings,
        generation?.ready_offerings,
    )
    const approved = firstValue(
        preparation?.offerings_approved,
        diagnostic?.approved_offerings,
        preview?.approved_offerings,
        generation?.approved_offerings,
    )

    return {
        cycles: prepareAllCycles ? `${cycleOptions.length} ciclos` : selectedCycles.join(', '),
        offeringsReviewed: firstValue(
            preparation?.offerings_reviewed,
            diagnostic?.total_offerings,
            diagnostic?.total_sections_checked,
            preview?.total_offerings,
            generation?.total_offerings,
            '-',
        ),
        eligibleOfferings: firstValue(
            diagnostic?.eligible_offerings,
            diagnostic?.programmable_sections,
            diagnostic?.summary?.eligible_offerings,
            preview?.eligible_offerings,
            preview?.sections_count,
            generation?.eligible_offerings,
            '-',
        ),
        readyApproved: `${ready ?? '-'} / ${approved ?? '-'}`,
        teachersAssigned: firstValue(
            preparation?.teachers_assigned,
            diagnostic?.teachers_assigned,
            diagnostic?.summary?.teachers_assigned,
            preview?.teachers_assigned,
            generation?.teachers_assigned,
            0,
        ),
        classroomsAssigned: firstValue(
            preparation?.classrooms_assigned,
            diagnostic?.classrooms_assigned,
            diagnostic?.summary?.classrooms_assigned,
            preview?.classrooms_assigned,
            generation?.classrooms_assigned,
            0,
        ),
        availability: firstValue(
            preparation?.teacher_availability_created,
            diagnostic?.teacher_availability_records,
            diagnostic?.availability_records,
            diagnostic?.summary?.teacher_availability_records,
            preview?.teacher_availability_records,
            generation?.teacher_availability_records,
            0,
        ),
        blocksGenerated: firstValue(
            scheduleBlocks,
            generation?.total_blocks,
            generation?.generated_blocks,
            generation?.solutions?.[0]?.blocks?.length,
            preview?.total_blocks,
            0,
        ),
        warnings: countCspIssues(preparation) + countCspIssues(diagnostic) + countCspIssues(preview) + countCspIssues(generation),
    }
}

function firstValue(...values) {
    return values.find((value) => value !== undefined && value !== null && value !== '')
}

function countCspIssues(data) {
    if (!data) return 0
    const diagnostics = asArray(data.diagnostics).reduce((count, item) => count + asArray(item.reasons).length, 0)
    const problematic = Array.isArray(data.problematic_sections) ? data.problematic_sections.length : Number(data.problematic_sections_count ?? data.problematic_sections ?? 0)
    return asArray(data.warnings).length
        + asArray(data.soft_warnings).length
        + asArray(data.errors).length
        + asArray(data.issues).length
        + asArray(data.conflicts).length
        + asArray(data.hard_conflicts).length
        + asArray(data.not_eligible_by_cycle).length
        + diagnostics
        + (Number.isFinite(problematic) ? problematic : 0)
}

function asArray(value) {
    return Array.isArray(value) ? value : []
}

function formatScore(value) {
    const number = Number(value)
    if (!Number.isFinite(number)) return value ?? '-'
    return number.toFixed(2)
}

function uniqueSchedulePeriods(schedules) {
    return Array.from(new Set(
        schedules
            .map((schedule) => schedule.academic_period_code)
            .filter(Boolean),
    )).sort((a, b) => String(a).localeCompare(String(b)))
}

function filterGeneratedSchedules(schedules, search, statusFilter, periodFilter) {
    const query = String(search || '').trim().toLowerCase()
    return schedules.filter((schedule) => {
        if (statusFilter !== 'ALL' && schedule.status !== statusFilter) return false
        if (periodFilter !== 'ALL' && schedule.academic_period_code !== periodFilter) return false
        if (!query) return true
        const text = [
            schedule.id,
            schedule.name,
            schedule.label,
            schedule.academic_period_code,
            schedule.academic_program_name,
            schedule.curriculum_plan_code,
            schedule.status,
        ].filter(Boolean).join(' ').toLowerCase()
        return text.includes(query)
    })
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
