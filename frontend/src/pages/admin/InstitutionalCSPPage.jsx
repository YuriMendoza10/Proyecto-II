import { useEffect, useMemo, useRef, useState } from 'react'
import {
    AlertTriangle,
    CalendarSearch,
    CheckCircle,
    ClipboardCheck,
    Eye,
    Loader2,
    Save,
    Send,
    ShieldCheck,
    SlidersHorizontal,
    Sparkles,
    Wand2,
} from 'lucide-react'
import toast from 'react-hot-toast'

import { cspService } from '../../services/cspService'
import { institutionalCspService } from '../../services/institutionalCspService'
import { scheduleService } from '../../services/scheduleService'
import { schedulePublicationService } from '../../services/schedulePublicationService'

const DAYS = [
    { id: 1, label: 'Lun' },
    { id: 2, label: 'Mar' },
    { id: 3, label: 'Mié' },
    { id: 4, label: 'Jue' },
    { id: 5, label: 'Vie' },
    { id: 6, label: 'Sáb' },
    { id: 7, label: 'Dom' },
]

const dayNames = {
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado',
    7: 'Domingo',
}

const CREATE_NEW = 'new'

const toOptionalNumber = (value) => {
    if (value === null || value === undefined) return null
    const normalizedValue = String(value).trim()
    return normalizedValue === '' ? null : Number(normalizedValue)
}

export default function InstitutionalCSPPage() {
    const [loadingAction, setLoadingAction] = useState(null)
    const solutionsRef = useRef(null)

    const [form, setForm] = useState({
        schedule_id: null,
        academic_period: '2026-I',
        max_solutions: 3,

        use_academic_slots: true,
        academic_slots: null,

        start_hour: '07:00:00',
        end_hour: '22:00:00',

        default_block_duration_minutes: 90,
        min_block_duration_minutes: 60,
        transfer_tolerance_minutes: 10,

        days: [1, 2, 3, 4, 5],

        clear_existing_blocks: true,
        avoid_duplicate_section_blocks: true,

        diversity_strategy: 'MIXED',
        random_seed: 42,

        career_filter: 'Ingeniería de Sistemas',
        cycle_filter: [1],
        course_ids: [],
        max_sections_to_schedule: 20,

        distribution_strategy: 'BALANCED',
        avoid_same_section_same_day: true,
        max_blocks_per_day: '',
    })

    const [diagnostic, setDiagnostic] = useState(null)
    const [preview, setPreview] = useState(null)
    const [generated, setGenerated] = useState(null)
    const [selectedSolutionIndex, setSelectedSolutionIndex] = useState(0)
    const [availableSchedules, setAvailableSchedules] = useState([])
    const [selectedScheduleId, setSelectedScheduleId] = useState(CREATE_NEW)
    const [schedulesLoading, setSchedulesLoading] = useState(false)
    const [schedulesError, setSchedulesError] = useState('')

    // Nuevos estados para el diagnóstico compacto
    const [diagnosticFilter, setDiagnosticFilter] = useState('problems')
    const [expandedDiagnosticId, setExpandedDiagnosticId] = useState(null)

    const selectedSolution = useMemo(() => {
        if (!preview?.solutions) return null
        return preview.solutions.find(
            (solution) => solution.solution_index === Number(selectedSolutionIndex)
        )
    }, [preview, selectedSolutionIndex])

    const selectedSchedule = useMemo(() => {
        if (selectedScheduleId === CREATE_NEW) return null
        return availableSchedules.find((schedule) => String(schedule.id) === String(selectedScheduleId)) || null
    }, [availableSchedules, selectedScheduleId])

    const loadAvailableSchedules = async () => {
        setSchedulesLoading(true)
        setSchedulesError('')
        try {
            const data = await institutionalCspService.availableSchedules()
            const schedules = Array.isArray(data) ? data : []
            setAvailableSchedules(schedules)
            setSelectedScheduleId((current) => {
                if (current !== CREATE_NEW && schedules.some((item) => String(item.id) === String(current))) {
                    return current
                }
                const preferred = schedules.find((item) => item.status === 'DRAFT') || schedules[0]
                return preferred ? String(preferred.id) : CREATE_NEW
            })
        } catch (error) {
            setSchedulesError('No se pudieron cargar los horarios institucionales disponibles.')
        } finally {
            setSchedulesLoading(false)
        }
    }

    useEffect(() => {
        loadAvailableSchedules()
    }, [])

    useEffect(() => {
        if (selectedSchedule) {
            setForm((current) => ({
                ...current,
                schedule_id: selectedSchedule.id,
                academic_period: selectedSchedule.academic_period_code || current.academic_period,
                career_filter: selectedSchedule.academic_program_name || current.career_filter,
            }))
            return
        }
        setForm((current) => ({ ...current, schedule_id: null }))
    }, [selectedSchedule])

    const scrollToSolutions = () => {
        solutionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    const updateForm = (name, value) => {
        setForm((current) => ({
            ...current,
            [name]: value,
        }))
    }

    const toggleDay = (day) => {
        setForm((current) => {
            const exists = current.days.includes(day)
            const days = exists
                ? current.days.filter((item) => item !== day)
                : [...current.days, day].sort((a, b) => a - b)
            return { ...current, days }
        })
    }

    const ensureSchedule = async () => {
        if (selectedScheduleId !== CREATE_NEW) {
            const scheduleId = Number(selectedScheduleId)
            if (!Number.isFinite(scheduleId) || scheduleId <= 0) {
                throw new Error('Seleccione un horario institucional valido.')
            }
            return scheduleId
        }

        const created = await scheduleService.createSchedule({
            name: `Horario institucional ${form.academic_period || 'periodo'} - CSP`,
            academic_period: form.academic_period || '2026-I',
            source_type: 'COURSE_SECTIONS',
            schedule_type: 'INSTITUTIONAL',
            status: 'DRAFT',
            is_active: true,
        })
        toast.success(`Horario creado: ${created.name}`)
        await loadAvailableSchedules()
        setSelectedScheduleId(String(created.id))
        setForm((current) => ({ ...current, schedule_id: created.id }))
        return created.id
    }

    const buildPayload = async () => {
        const scheduleId = await ensureSchedule()
        if (!scheduleId || Number(scheduleId) <= 0) {
            throw new Error('Seleccione un horario institucional valido.')
        }

        return {
        ...form,
        schedule_id: Number(scheduleId),
        max_solutions: Number(form.max_solutions),
        default_block_duration_minutes: Number(form.default_block_duration_minutes),
        min_block_duration_minutes: Number(form.min_block_duration_minutes),
        transfer_tolerance_minutes: Number(form.transfer_tolerance_minutes),
        random_seed: toOptionalNumber(form.random_seed),
        max_sections_to_schedule: toOptionalNumber(form.max_sections_to_schedule),
        max_blocks_per_day: toOptionalNumber(form.max_blocks_per_day),
        }
    }

    const handleDiagnose = async () => {
        setLoadingAction('diagnose')
        try {
            const data = await cspService.diagnoseInstitutionalDomains(await buildPayload())
            setDiagnostic(data)
            toast.success('Diagnóstico CSP completado')
        } catch (error) {
            showError(error, 'No se pudo ejecutar el diagnóstico CSP')
        } finally {
            setLoadingAction(null)
        }
    }

    const handlePreview = async () => {
        setLoadingAction('preview')
        try {
            const data = await cspService.previewInstitutionalSchedule(await buildPayload())
            setPreview(data)
            setSelectedSolutionIndex(data.best_solution_index)
            toast.success('Preview generado correctamente')
            setTimeout(() => scrollToSolutions(), 200)
        } catch (error) {
            showError(error, 'No se pudo generar el preview CSP')
        } finally {
            setLoadingAction(null)
        }
    }

    const handleGenerateBest = async () => {
        setLoadingAction('generate')
        try {
            const data = await cspService.generateInstitutionalSchedule(await buildPayload())
            setGenerated(data)
            toast.success('Horario generado y guardado correctamente')
        } catch (error) {
            showError(error, 'No se pudo generar y guardar el horario')
        } finally {
            setLoadingAction(null)
        }
    }

    const handleGenerateSelected = async () => {
        setLoadingAction('generate-selected')
        try {
            const payload = {
                ...(await buildPayload()),
                solution_index: Number(selectedSolutionIndex),
            }
            const data = await cspService.generateSelectedInstitutionalSchedule(payload)
            setGenerated(data)
            toast.success(`Solución ${selectedSolutionIndex} guardada correctamente`)
        } catch (error) {
            showError(error, 'No se pudo guardar la solución seleccionada')
        } finally {
            setLoadingAction(null)
        }
    }

    const handlePublishSchedule = async () => {
        if (selectedScheduleId === CREATE_NEW || !selectedScheduleId) {
            toast.error('Seleccione un horario existente o guarde primero una solucion generada.')
            return
        }
        const confirmed = window.confirm(
            'Antes de publicar se ejecutará una validación de calidad. ¿Deseas continuar?'
        )
        if (!confirmed) return
        try {
            setLoadingAction('publish')
            const response = await schedulePublicationService.publishSafely({
                scheduleId: Number(selectedScheduleId),
                careerFilter: form.career_filter || '',
                cycleFilter: form.cycle_filter || [],
                courseIds: form.course_ids || [],
                allowedDays: form.days || [1, 2, 3, 4, 5, 6, 7],
                startHour: form.start_hour || '07:00:00',
                endHour: form.end_hour || '22:00:00',
            })
            toast.success(response.message || 'Horario publicado correctamente')
            setGenerated((current) => ({
                ...(current || {}),
                schedule_id: response.schedule_id,
                status: response.new_status,
            }))
        } catch (error) {
            const detail = error.response?.data?.detail
            if (typeof detail === 'object' && detail?.message) {
                toast.error(detail.message)
            } else {
                toast.error('No se pudo publicar el horario')
            }
        } finally {
            setLoadingAction(null)
        }
    }

    return (
        <div className="space-y-8">
            {/* Cabecera principal */}
            <section className="rounded-3xl bg-slate-900 p-6 text-white shadow-sm">
                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white">
                            <Sparkles size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">
                                Generación de horario institucional
                            </h1>
                            <p className="mt-1 text-sm text-slate-300">
                                Diagnostica, previsualiza, genera y publica horarios académicos usando el motor CSP.
                            </p>
                        </div>
                    </div>
                    <div className="grid gap-2 text-sm sm:grid-cols-3">
                        <QuickStep icon={<ClipboardCheck size={17} />} title="1. Diagnóstico" />
                        <QuickStep icon={<Eye size={17} />} title="2. Preview" />
                        <QuickStep icon={<ShieldCheck size={17} />} title="3. Publicación validada" />
                    </div>
                </div>
            </section>

            {/* Formulario de configuración */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            Configuración de generación
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Define el alcance, las restricciones y la forma de distribución del horario.
                        </p>
                    </div>
                    <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700">
                        {selectedSchedule ? `Horario seleccionado: ${selectedSchedule.status}` : 'Crear nuevo horario'}
                    </div>
                </div>

                {/* Campos principales */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
                    <Select
                        label="Horario institucional"
                        value={selectedScheduleId}
                        onChange={setSelectedScheduleId}
                        options={[
                            { value: CREATE_NEW, label: 'Crear nuevo horario' },
                            ...availableSchedules.map((schedule) => ({
                                value: String(schedule.id),
                                label: schedule.label || `${schedule.name} - ${schedule.status}`,
                            })),
                        ]}
                    />
                    <Input label="Periodo académico" value={form.academic_period} onChange={(value) => updateForm('academic_period', value)} />
                    <Input label="Máx. soluciones" type="number" value={form.max_solutions} onChange={(value) => updateForm('max_solutions', value)} />
                    <Input label="Semilla" type="number" value={form.random_seed ?? ''} onChange={(value) => updateForm('random_seed', value)} />
                    <Input label="Hora inicio" value={form.start_hour} onChange={(value) => updateForm('start_hour', value)} />
                    <Input label="Hora fin" value={form.end_hour} onChange={(value) => updateForm('end_hour', value)} />
                    <Input label="Bloque base min." type="number" value={form.default_block_duration_minutes} onChange={(value) => updateForm('default_block_duration_minutes', value)} />
                    <Input label="Bloque mínimo min." type="number" value={form.min_block_duration_minutes} onChange={(value) => updateForm('min_block_duration_minutes', value)} />
                    <Input label="Tolerancia min." type="number" value={form.transfer_tolerance_minutes} onChange={(value) => updateForm('transfer_tolerance_minutes', value)} />
                    <Select label="Estrategia de diversidad" value={form.diversity_strategy} onChange={(value) => updateForm('diversity_strategy', value)} options={[
                        { value: 'ORDERED', label: 'ORDERED' },
                        { value: 'SHUFFLE', label: 'SHUFFLE' },
                        { value: 'ROTATE', label: 'ROTATE' },
                        { value: 'MIXED', label: 'MIXED' },
                    ]} />
                    <Checkbox label="Usar franjas académicas" checked={form.use_academic_slots} onChange={(value) => updateForm('use_academic_slots', value)} />
                    <Checkbox label="Limpiar bloques antes de guardar" checked={form.clear_existing_blocks} onChange={(value) => updateForm('clear_existing_blocks', value)} />
                    <Checkbox label="Evitar secciones duplicadas" checked={form.avoid_duplicate_section_blocks} onChange={(value) => updateForm('avoid_duplicate_section_blocks', value)} />
                </div>

                {schedulesLoading && (
                    <p className="mt-3 text-sm font-semibold text-slate-500">Cargando horarios institucionales...</p>
                )}
                {schedulesError && (
                    <div className="mt-3 flex flex-wrap items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                        <span>{schedulesError}</span>
                        <button type="button" onClick={loadAvailableSchedules} className="rounded-xl bg-amber-600 px-3 py-1 text-white">
                            Reintentar
                        </button>
                    </div>
                )}
                {!schedulesLoading && !schedulesError && availableSchedules.length === 0 && (
                    <p className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        No hay horarios institucionales todavia. Puedes crear uno nuevo generando una solucion.
                    </p>
                )}
                {selectedSchedule && (
                    <div className="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 md:grid-cols-4">
                        <ScheduleDetail label="Nombre" value={selectedSchedule.name} />
                        <ScheduleDetail label="Periodo" value={selectedSchedule.academic_period_code || '-'} />
                        <ScheduleDetail label="Programa" value={selectedSchedule.academic_program_name || '-'} />
                        <ScheduleDetail label="Bloques" value={selectedSchedule.blocks_count ?? 0} />
                        <ScheduleDetail label="Fuente" value={selectedSchedule.source_type || '-'} />
                        <ScheduleDetail label="Score" value={selectedSchedule.quality_score ?? '-'} />
                        <ScheduleDetail label="Actualizado" value={formatDate(selectedSchedule.updated_at)} />
                        <ScheduleDetail label="ID interno" value={selectedSchedule.id} subtle />
                    </div>
                )}

                {/* Alcance académico */}
                <div className="mt-6 border-t border-slate-200 pt-6">
                    <div className="mb-4">
                        <h3 className="text-lg font-bold text-slate-900">Alcance académico</h3>
                        <p className="text-sm text-slate-500">Limita la generación por carrera, ciclos, cursos o cantidad máxima de secciones.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
                        <Input label="Carrera" value={form.career_filter} onChange={(value) => updateForm('career_filter', value)} />
                        <Input label="Ciclos a generar" value={form.cycle_filter.join(',')} onChange={(value) => updateForm('cycle_filter', value.split(',').map(item => Number(item.trim())).filter(n => !isNaN(n) && n > 0))} />
                        <Input label="IDs de cursos específicos" value={form.course_ids.join(',')} onChange={(value) => updateForm('course_ids', value.split(',').map(item => Number(item.trim())).filter(n => !isNaN(n) && n > 0))} />
                        <Input label="Máx. secciones a programar" type="number" value={form.max_sections_to_schedule ?? ''} onChange={(value) => updateForm('max_sections_to_schedule', value === '' ? null : Number(value))} />
                    </div>
                </div>

                {/* Distribución inteligente */}
                <div className="mt-6 border-t border-slate-200 pt-6">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                            <SlidersHorizontal size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Distribución inteligente</h3>
                            <p className="text-sm text-slate-500">Controla cómo se reparten los bloques durante la semana.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                        <Select label="Estrategia de distribución" value={form.distribution_strategy} onChange={(value) => updateForm('distribution_strategy', value)} options={[
                            { value: 'BALANCED', label: 'BALANCED — Balanceado' },
                            { value: 'SPREAD', label: 'SPREAD — Más distribuido' },
                            { value: 'COMPACT', label: 'COMPACT — Más compacto' },
                        ]} />
                        <Input label="Máx. bloques por día" type="number" value={form.max_blocks_per_day ?? ''} onChange={(value) => updateForm('max_blocks_per_day', value)} />
                        <Checkbox label="Evitar repetir sección el mismo día" checked={form.avoid_same_section_same_day} onChange={(value) => updateForm('avoid_same_section_same_day', value)} />
                    </div>
                </div>

                {/* Días permitidos */}
                <div className="mt-6">
                    <p className="mb-3 block text-sm font-semibold text-slate-700">Días permitidos</p>
                    <div className="flex flex-wrap gap-2">
                        {DAYS.map((day) => (
                            <button key={day.id} type="button" onClick={() => toggleDay(day.id)} className={[
                                'rounded-xl border px-4 py-2 text-sm font-semibold transition',
                                form.days.includes(day.id) ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-100',
                            ].join(' ')}>
                                {day.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Botones de acción (sin el de guardar solución, ahora está dentro del sticky) */}
                <div className="mt-8 flex flex-wrap gap-3">
                    <ActionButton icon={<ClipboardCheck size={18} />} loading={loadingAction === 'diagnose'} onClick={handleDiagnose}>Diagnosticar datos CSP</ActionButton>
                    <ActionButton icon={<Eye size={18} />} loading={loadingAction === 'preview'} onClick={handlePreview}>Previsualizar soluciones</ActionButton>
                    <ActionButton icon={<Wand2 size={18} />} loading={loadingAction === 'generate'} onClick={handleGenerateBest} variant="success">Generar y guardar horario</ActionButton>
                    <ActionButton icon={<Send size={18} />} loading={loadingAction === 'publish'} onClick={handlePublishSchedule} variant="success">Publicar horario validado</ActionButton>
                </div>
            </section>

            {/* Resumen compacto de soluciones (solo cuando hay preview) */}
            {preview?.solutions?.length > 0 && (
                <section className="rounded-3xl border border-orange-200 bg-orange-50 p-5 shadow-sm">
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                        <div>
                            <p className="text-sm font-black uppercase tracking-wide text-orange-700">Soluciones CSP disponibles</p>
                            <h2 className="mt-1 text-2xl font-black text-slate-900">Se generaron {preview.solutions.length} alternativa(s)</h2>
                            <p className="mt-1 text-sm text-slate-600">Puedes revisar las soluciones sin bajar hasta el final de la página.</p>
                        </div>
                        <button type="button" onClick={scrollToSolutions} className="rounded-2xl bg-orange-600 px-5 py-3 text-sm font-black text-white transition hover:bg-orange-700">
                            Ver soluciones
                        </button>
                    </div>
                </section>
            )}

            {/* NUEVO PANEL DE DIAGNÓSTICO COMPACTO */}
            {diagnostic && (
                <CompactDiagnosticPanel
                    diagnostic={diagnostic}
                    filter={diagnosticFilter}
                    setFilter={setDiagnosticFilter}
                    expandedId={expandedDiagnosticId}
                    setExpandedId={setExpandedDiagnosticId}
                />
            )}

            {/* Panel de preview con ref y diseño sticky */}
            {preview && (
                <section ref={solutionsRef} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="sticky top-4 z-10 mb-5 rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur">
                        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                            <div>
                                <p className="text-sm font-black uppercase tracking-wide text-orange-700">Resultados del motor CSP</p>
                                <h2 className="mt-1 text-2xl font-black text-slate-900">Soluciones generadas</h2>
                                <p className="mt-1 text-sm text-slate-500">Selecciona una alternativa y guárdala como horario institucional.</p>
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Elegir solución</label>
                                    <select value={selectedSolutionIndex} onChange={(e) => setSelectedSolutionIndex(Number(e.target.value))} className="mt-1 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 sm:w-80">
                                        {preview.solutions.map((solution) => (
                                            <option key={solution.solution_index} value={solution.solution_index}>
                                                Solución {solution.solution_index} — Score {solution.score} — {solution.total_blocks} bloques
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <button type="button" onClick={handleGenerateSelected} disabled={loadingAction === 'generate-selected'} className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60">
                                    {loadingAction === 'generate-selected' ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    {loadingAction === 'generate-selected' ? 'Guardando...' : 'Guardar solución seleccionada'}
                                </button>
                            </div>
                        </div>
                    </div>
                    <SelectedSolutionPreview solution={selectedSolution} />
                </section>
            )}

            {/* Panel de resultado generado */}
            {generated && <GeneratedPanel generated={generated} />}
        </div>
    )
}

// --------------------------------------------------------------
// Componentes auxiliares (comunes)
// --------------------------------------------------------------

function QuickStep({ icon, title }) {
    return (
        <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200">
            {icon}
            <span className="font-semibold">{title}</span>
        </div>
    )
}

function ScheduleDetail({ label, value, subtle = false }) {
    return (
        <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
            <p className={`mt-1 font-black ${subtle ? 'text-slate-500' : 'text-slate-900'}`}>
                {value ?? '-'}
            </p>
        </div>
    )
}

function Input({ label, value, onChange, type = 'text' }) {
    return (
        <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
            <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
    )
}

function Select({ label, value, onChange, options }) {
    return (
        <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
            <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    )
}

function Checkbox({ label, checked, onChange }) {
    return (
        <label className="mt-8 flex cursor-pointer items-center gap-3">
            <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5 rounded border-slate-300" />
            <span className="text-sm font-semibold text-slate-700">{label}</span>
        </label>
    )
}

function ActionButton({ children, icon, loading, onClick, variant = 'primary', disabled = false }) {
    const variants = {
        primary: 'bg-blue-600 hover:bg-blue-700',
        success: 'bg-emerald-600 hover:bg-emerald-700',
        dark: 'bg-slate-900 hover:bg-slate-800',
    }
    return (
        <button type="button" onClick={onClick} disabled={loading || disabled} className={`flex items-center gap-2 rounded-xl px-5 py-3 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]}`}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : icon}
            {children}
        </button>
    )
}

// --------------------------------------------------------------
// Componente de diagnóstico compacto (nuevo)
// --------------------------------------------------------------
function CompactDiagnosticPanel({
    diagnostic,
    filter,
    setFilter,
    expandedId,
    setExpandedId,
}) {
    const diagnostics = Array.isArray(diagnostic?.diagnostics)
        ? diagnostic.diagnostics
        : []

    const total = diagnostics.length

    const problematic = diagnostics.filter((item) => {
        return item.is_programmable === false || item.reasons?.length > 0
    })

    const programmable = diagnostics.filter((item) => {
        return item.is_programmable === true
    })

    const filteredDiagnostics = diagnostics.filter((item) => {
        if (filter === 'problems') {
            return item.is_programmable === false || item.reasons?.length > 0
        }
        if (filter === 'programmable') {
            return item.is_programmable === true
        }
        return true
    })

    return (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                    <p className="text-sm font-black uppercase tracking-wide text-orange-700">
                        Diagnóstico CSP institucional
                    </p>
                    <h2 className="mt-1 text-2xl font-black text-slate-900">
                        Estado de secciones analizadas
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Revisa los problemas sin ocupar toda la pantalla. Abre solo la sección que necesites analizar.
                    </p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <MiniDiagnosticMetric label="Total" value={total} />
                    <MiniDiagnosticMetric label="Programables" value={programmable.length} />
                    <MiniDiagnosticMetric label="Con problemas" value={problematic.length} danger />
                </div>
            </div>

            <div className="mb-5 flex flex-wrap gap-2">
                <DiagnosticFilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
                    Todos
                </DiagnosticFilterButton>
                <DiagnosticFilterButton active={filter === 'problems'} onClick={() => setFilter('problems')}>
                    Con problemas
                </DiagnosticFilterButton>
                <DiagnosticFilterButton active={filter === 'programmable'} onClick={() => setFilter('programmable')}>
                    Programables
                </DiagnosticFilterButton>
            </div>

            {filteredDiagnostics.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                    No hay registros para este filtro.
                </div>
            ) : (
                <div className="max-h-[560px] space-y-3 overflow-y-auto pr-2">
                    {filteredDiagnostics.map((item) => {
                        const itemId = `${item.section_id}-${item.section_code}`
                        const isExpanded = expandedId === itemId
                        const hasProblems = item.is_programmable === false || item.reasons?.length > 0
                        return (
                            <DiagnosticAccordionItem
                                key={itemId}
                                item={item}
                                itemId={itemId}
                                expanded={isExpanded}
                                hasProblems={hasProblems}
                                onToggle={() => setExpandedId(isExpanded ? null : itemId)}
                            />
                        )
                    })}
                </div>
            )}
        </section>
    )
}

function DiagnosticAccordionItem({
    item,
    itemId,
    expanded,
    hasProblems,
    onToggle,
}) {
    return (
        <article
            className={[
                'rounded-3xl border bg-white transition',
                hasProblems ? 'border-red-200' : 'border-emerald-200',
            ].join(' ')}
        >
            <button
                type="button"
                onClick={onToggle}
                className="flex w-full flex-col gap-3 p-5 text-left lg:flex-row lg:items-center lg:justify-between"
            >
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-black text-slate-900">
                            {item.course_name || `Curso ${item.course_id}`}
                        </h3>
                        <span className="text-sm font-bold text-slate-500">
                            — Sección {item.section_code || item.section_id}
                        </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                        Docente: {item.teacher_code || item.teacher_id || 'Sin docente'} | Opciones: {item.valid_domain_options ?? 0}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {hasProblems ? (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">
                            Con problemas
                        </span>
                    ) : (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
                            Programable
                        </span>
                    )}
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                        {expanded ? 'Ocultar' : 'Ver detalle'}
                    </span>
                </div>
            </button>

            {expanded && (
                <div className="border-t border-slate-200 px-5 pb-5 pt-4">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                        <DiagnosticDetailMetric label="Section ID" value={item.section_id} />
                        <DiagnosticDetailMetric label="Curso ID" value={item.course_id} />
                        <DiagnosticDetailMetric label="Horas semanales" value={item.weekly_hours ?? '-'} />
                        <DiagnosticDetailMetric label="Máx. estudiantes" value={item.max_students ?? '-'} />
                    </div>
                    {item.required_blocks?.length > 0 && (
                        <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Bloques requeridos</p>
                            <p className="mt-1 text-sm font-black text-slate-800">
                                {item.required_blocks.join(' min, ')} min
                            </p>
                        </div>
                    )}
                    {item.reasons?.length > 0 ? (
                        <div className="mt-4 space-y-2">
                            {item.reasons.map((reason, idx) => (
                                <div key={`${itemId}-reason-${idx}`} className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                                    ⚠ {reason}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                            Esta sección tiene opciones válidas para ser programada.
                        </div>
                    )}
                </div>
            )}
        </article>
    )
}

function MiniDiagnosticMetric({ label, value, danger = false }) {
    return (
        <div className={`min-w-28 rounded-2xl border px-4 py-3 text-center ${danger ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50'}`}>
            <p className={`text-xs font-bold uppercase tracking-wide ${danger ? 'text-red-500' : 'text-slate-500'}`}>
                {label}
            </p>
            <p className={`mt-1 text-2xl font-black ${danger ? 'text-red-700' : 'text-slate-900'}`}>
                {value}
            </p>
        </div>
    )
}

function DiagnosticDetailMetric({ label, value }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-1 text-lg font-black text-slate-900">{value}</p>
        </div>
    )
}

function DiagnosticFilterButton({ active, onClick, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-2xl px-4 py-2 text-sm font-black transition ${active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
        >
            {children}
        </button>
    )
}

// --------------------------------------------------------------
// Resto de componentes (GeneratedPanel, Metric, Badge, etc.)
// --------------------------------------------------------------
function GeneratedPanel({ generated }) {
    return (
        <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
                <CheckCircle className="text-emerald-700" />
                <div>
                    <h2 className="text-xl font-bold text-emerald-900">Horario institucional generado correctamente</h2>
                    <p className="text-sm text-emerald-700">{generated.message}</p>
                </div>
            </div>
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-5">
                <Metric title="Score" value={generated.score ?? '-'} />
                <Metric title="Solución elegida" value={generated.selected_solution_index ?? '-'} />
                <Metric title="Bloques guardados" value={generated.generated_blocks ?? '-'} />
                <Metric title="Horario ID" value={generated.schedule_id ?? '-'} />
                <Metric title="Secciones consideradas" value={generated.sections_considered || 0} />
            </div>
            <div className="mb-6 flex flex-wrap gap-3">
                <a href="/admin/schedule-view" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700">
                    <CalendarSearch size={17} /> Ver horario
                </a>
                <a href="/admin/schedule-quality" className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800">
                    <ClipboardCheck size={17} /> Ver calidad
                </a>
                <a href="/admin/data-readiness" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
                    <ShieldCheck size={17} /> Preparación de datos
                </a>
            </div>
            <ScheduleBlocksTable blocks={generated.blocks} title="Bloques guardados" />
        </section>
    )
}

function Metric({ title, value }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">{title}</p>
            <p className="text-xl font-bold text-slate-900">{value}</p>
        </div>
    )
}

function ScheduleBlocksTable({ blocks, title = "Bloques" }) {
    if (!blocks || blocks.length === 0) {
        return <div className="rounded-2xl bg-slate-50 p-6 text-center text-slate-500">No hay bloques para mostrar.</div>
    }
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
                <h3 className="text-lg font-black text-slate-900">{title}</h3>
                <p className="text-sm text-slate-500">La tabla tiene scroll interno para evitar bajar demasiado.</p>
            </div>
            <div className="max-h-[520px] overflow-auto">
                <table className="w-full min-w-[900px] text-sm">
                    <caption className="sr-only">{title}: bloques de horario con sección, curso, docente, aula y duración.</caption>
                    <thead className="sticky top-0 z-10 bg-slate-100 font-bold text-slate-800">
                        <tr>
                            <th className="px-4 py-3 text-left" scope="col">Día</th>
                            <th className="px-4 py-3 text-left" scope="col">Hora</th>
                            <th className="px-4 py-3 text-left" scope="col">Sección</th>
                            <th className="px-4 py-3 text-left" scope="col">Curso ID</th>
                            <th className="px-4 py-3 text-left" scope="col">Docente ID</th>
                            <th className="px-4 py-3 text-left" scope="col">Aula ID</th>
                            <th className="px-4 py-3 text-left" scope="col">Duración</th>
                        </tr>
                    </thead>
                    <tbody>
                        {blocks.map((block, idx) => (
                            <tr key={`${block.section_id}-${block.day_of_week}-${block.start_time}-${idx}`} className="border-t border-slate-200 hover:bg-blue-50">
                                <td className="px-4 py-3">{dayNames[block.day_of_week] || block.day_of_week}</td>
                                <td className="px-4 py-3">{formatTime(block.start_time)} - {formatTime(block.end_time)}</td>
                                <td className="px-4 py-3">{block.section_id}</td>
                                <td className="px-4 py-3">{block.course_id}</td>
                                <td className="px-4 py-3">{block.teacher_id || 'Sin docente'}</td>
                                <td className="px-4 py-3">{block.classroom_id || 'Sin aula'}</td>
                                <td className="px-4 py-3">{block.duration_minutes} min</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function SelectedSolutionPreview({ solution }) {
    if (!solution) return null
    const blocks = solution.blocks || []
    const uniqueDays = new Set(blocks.map(b => b.day_of_week)).size
    const uniqueTeachers = new Set(blocks.map(b => b.teacher_id).filter(Boolean)).size

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <SolutionMetric label="Score" value={solution.score ?? '-'} />
                <SolutionMetric label="Bloques" value={blocks.length} />
                <SolutionMetric label="Días usados" value={uniqueDays} />
                <SolutionMetric label="Docentes" value={uniqueTeachers} />
            </div>
            <ScheduleBlocksTable blocks={blocks} title="Vista rápida de la solución seleccionada" />
        </div>
    )
}

function SolutionMetric({ label, value }) {
    return (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-1 text-3xl font-black text-slate-900">{value}</p>
        </div>
    )
}

function formatTime(value) {
    if (!value) return ''
    return String(value).slice(0, 5)
}

function formatDate(value) {
    if (!value) return '-'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '-'
    return date.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })
}

function showError(error, fallback) {
    const detail = error.response?.data?.detail
    if (!detail) return toast.error(fallback)
    if (Array.isArray(detail)) return toast.error(detail[0]?.msg || fallback)
    if (typeof detail === 'object') return toast.error(detail.message || detail.msg || fallback)
    toast.error(detail || fallback)
}
