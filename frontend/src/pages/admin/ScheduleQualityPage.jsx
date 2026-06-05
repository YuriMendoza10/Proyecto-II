import { useEffect, useState } from 'react'
import {
    AlertTriangle,
    CheckCircle2,
    ClipboardCheck,
    Clock,
    Loader2,
    RefreshCw,
    ShieldAlert,
    ShieldCheck,
    XCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'

import { scheduleQualityService } from '../../services/scheduleQualityService'
import { institutionalCspService } from '../../services/institutionalCspService'

const dayOptions = [
    { value: 1, label: 'Lun' },
    { value: 2, label: 'Mar' },
    { value: 3, label: 'Mié' },
    { value: 4, label: 'Jue' },
    { value: 5, label: 'Vie' },
    { value: 6, label: 'Sáb' },
    { value: 7, label: 'Dom' },
]

function parseNumberList(value) {
    if (!value.trim()) return []

    return value
        .split(',')
        .map((item) => Number(item.trim()))
        .filter((item) => !Number.isNaN(item) && item > 0)
}

function StatusCard({ report }) {
    const status = report?.summary?.quality_status

    if (status === 'OK') {
        return (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-green-800">
                <div className="flex items-center gap-3">
                    <ShieldCheck size={28} />
                    <div>
                        <h2 className="text-lg font-bold">Horario publicable</h2>
                        <p className="text-sm">
                            No se encontraron errores críticos en el alcance validado.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    if (status === 'WARNING') {
        return (
            <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5 text-yellow-800">
                <div className="flex items-center gap-3">
                    <AlertTriangle size={28} />
                    <div>
                        <h2 className="text-lg font-bold">Horario con observaciones</h2>
                        <p className="text-sm">
                            El horario no tiene errores críticos, pero tiene advertencias que conviene revisar.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
            <div className="flex items-center gap-3">
                <ShieldAlert size={28} />
                <div>
                    <h2 className="text-lg font-bold">Horario no publicable</h2>
                    <p className="text-sm">
                        Se encontraron errores críticos que deben corregirse antes de publicar.
                    </p>
                </div>
            </div>
        </div>
    )
}

function Metric({ title, value, icon: Icon, danger = false }) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className={`mt-2 text-3xl font-bold ${danger ? 'text-red-600' : 'text-gray-900'}`}>
                        {value}
                    </p>
                </div>

                <div className={`rounded-xl p-3 ${danger ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                    <Icon size={22} />
                </div>
            </div>
        </div>
    )
}

function SeverityBadge({ severity }) {
    const styles = {
        CRITICAL: 'bg-red-100 text-red-700',
        WARNING: 'bg-yellow-100 text-yellow-700',
        INFO: 'bg-blue-100 text-blue-700',
    }

    const labels = {
        CRITICAL: 'Crítico',
        WARNING: 'Advertencia',
        INFO: 'Info',
    }

    return (
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[severity] || styles.INFO}`}>
            {labels[severity] || severity}
        </span>
    )
}

export default function ScheduleQualityPage() {
    const [scheduleId, setScheduleId] = useState('')
    const [availableSchedules, setAvailableSchedules] = useState([])
    const [schedulesLoading, setSchedulesLoading] = useState(false)
    const [schedulesError, setSchedulesError] = useState('')
    const [careerFilter, setCareerFilter] = useState('Ingeniería de Sistemas')
    const [cycleFilterText, setCycleFilterText] = useState('1')
    const [courseIdsText, setCourseIdsText] = useState('')
    const [allowedDays, setAllowedDays] = useState([1, 2, 3, 4, 5])
    const [startHour, setStartHour] = useState('07:00:00')
    const [endHour, setEndHour] = useState('22:00:00')

    const [loading, setLoading] = useState(false)
    const [report, setReport] = useState(null)

    const loadAvailableSchedules = async () => {
        setSchedulesLoading(true)
        setSchedulesError('')
        try {
            const data = await institutionalCspService.availableSchedules()
            const schedules = Array.isArray(data) ? data : []
            setAvailableSchedules(schedules)
            setScheduleId((current) => {
                if (current && schedules.some((schedule) => String(schedule.id) === String(current))) {
                    return current
                }
                const preferred = schedules.find((schedule) => schedule.status === 'DRAFT') || schedules[0]
                return preferred ? String(preferred.id) : ''
            })
        } catch (error) {
            setSchedulesError('No se pudieron cargar los horarios institucionales.')
        } finally {
            setSchedulesLoading(false)
        }
    }

    useEffect(() => {
        loadAvailableSchedules()
    }, [])

    const toggleDay = (day) => {
        setAllowedDays((current) => {
            if (current.includes(day)) {
                return current.filter((item) => item !== day)
            }

            return [...current, day].sort()
        })
    }

    const loadReport = async () => {
        if (!scheduleId) {
            toast.error('Seleccione un horario institucional disponible.')
            return
        }

        try {
            setLoading(true)

            const data = await scheduleQualityService.getReport({
                scheduleId: Number(scheduleId),
                careerFilter,
                cycleFilter: parseNumberList(cycleFilterText),
                courseIds: parseNumberList(courseIdsText),
                allowedDays,
                startHour,
                endHour,
            })

            setReport(data)
        } catch (error) {
            console.error(error)
            toast.error('No se pudo generar el reporte de calidad')
        } finally {
            setLoading(false)
        }
    }

    const criticalIssues = report?.issues?.filter((issue) => issue.severity === 'CRITICAL') || []
    const warningIssues = report?.issues?.filter((issue) => issue.severity === 'WARNING') || []
    const infoIssues = report?.issues?.filter((issue) => issue.severity === 'INFO') || []

    return (
        <div className="space-y-6 p-6">
            <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                    <div>
                        <div className="flex items-center gap-3">
                            <ClipboardCheck size={30} />
                            <h1 className="text-2xl font-bold">
                                Reporte de calidad del horario
                            </h1>
                        </div>

                        <p className="mt-2 max-w-3xl text-sm text-slate-300">
                            Valida cruces, disponibilidad docente, aulas, bloques incompletos
                            y condiciones mínimas antes de publicar un horario institucional.
                        </p>
                    </div>

                    <button
                        onClick={loadReport}
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-100 disabled:opacity-60"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
                        Validar horario
                    </button>
                </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900">
                    Alcance de validación
                </h2>

                <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <label className="text-sm font-semibold text-gray-700">
                            Horario institucional
                        </label>
                        <select
                            value={scheduleId}
                            onChange={(event) => setScheduleId(event.target.value)}
                            className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500"
                        >
                            <option value="">Seleccione un horario</option>
                            {availableSchedules.map((schedule) => (
                                <option key={schedule.id} value={String(schedule.id)}>
                                    {schedule.label || `${schedule.name} - ${schedule.status}`}
                                </option>
                            ))}
                        </select>
                        {schedulesLoading && (
                            <p className="mt-2 text-xs font-semibold text-gray-500">Cargando horarios...</p>
                        )}
                        {schedulesError && (
                            <button
                                type="button"
                                onClick={loadAvailableSchedules}
                                className="mt-2 text-xs font-bold text-blue-700 underline"
                            >
                                Reintentar carga de horarios
                            </button>
                        )}
                        {!schedulesLoading && !schedulesError && availableSchedules.length === 0 && (
                            <p className="mt-2 text-xs text-gray-500">No hay horarios institucionales disponibles.</p>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-gray-700">
                            Carrera
                        </label>
                        <input
                            value={careerFilter}
                            onChange={(event) => setCareerFilter(event.target.value)}
                            className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-gray-700">
                            Ciclos
                        </label>
                        <input
                            placeholder="Ejemplo: 1,2,3"
                            value={cycleFilterText}
                            onChange={(event) => setCycleFilterText(event.target.value)}
                            className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-gray-700">
                            IDs de cursos
                        </label>
                        <input
                            placeholder="Opcional: 1,2,3"
                            value={courseIdsText}
                            onChange={(event) => setCourseIdsText(event.target.value)}
                            className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-gray-700">
                            Hora inicio
                        </label>
                        <input
                            value={startHour}
                            onChange={(event) => setStartHour(event.target.value)}
                            className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-gray-700">
                            Hora fin
                        </label>
                        <input
                            value={endHour}
                            onChange={(event) => setEndHour(event.target.value)}
                            className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="text-sm font-semibold text-gray-700">
                            Días permitidos
                        </label>

                        <div className="mt-2 flex flex-wrap gap-2">
                            {dayOptions.map((day) => (
                                <button
                                    key={day.value}
                                    type="button"
                                    onClick={() => toggleDay(day.value)}
                                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${allowedDays.includes(day.value)
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {day.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {report && (
                <>
                    <StatusCard report={report} />

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Metric
                            title="Total incidencias"
                            value={report.summary.total_issues}
                            icon={ClipboardCheck}
                            danger={report.summary.total_issues > 0}
                        />

                        <Metric
                            title="Críticas"
                            value={report.summary.critical_issues}
                            icon={XCircle}
                            danger={report.summary.critical_issues > 0}
                        />

                        <Metric
                            title="Advertencias"
                            value={report.summary.warning_issues}
                            icon={AlertTriangle}
                            danger={false}
                        />

                        <Metric
                            title="Publicable"
                            value={report.summary.publishable ? 'Sí' : 'No'}
                            icon={report.summary.publishable ? CheckCircle2 : ShieldAlert}
                            danger={!report.summary.publishable}
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Metric
                            title="Bloques"
                            value={report.stats.total_blocks}
                            icon={Clock}
                        />

                        <Metric
                            title="Secciones evaluadas"
                            value={report.stats.total_sections_scope}
                            icon={ClipboardCheck}
                        />

                        <Metric
                            title="Secciones programadas"
                            value={report.stats.scheduled_sections}
                            icon={CheckCircle2}
                        />

                        <Metric
                            title="Secciones sin bloques"
                            value={report.stats.sections_without_blocks}
                            icon={AlertTriangle}
                            danger={report.stats.sections_without_blocks > 0}
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <Metric
                            title="Cruces de aula"
                            value={report.stats.classroom_conflicts}
                            icon={XCircle}
                            danger={report.stats.classroom_conflicts > 0}
                        />

                        <Metric
                            title="Cruces de docente"
                            value={report.stats.teacher_conflicts}
                            icon={XCircle}
                            danger={report.stats.teacher_conflicts > 0}
                        />

                        <Metric
                            title="Cruces de sección"
                            value={report.stats.section_conflicts}
                            icon={XCircle}
                            danger={report.stats.section_conflicts > 0}
                        />
                    </div>

                    <IssueSection
                        title="Errores críticos"
                        issues={criticalIssues}
                        emptyMessage="No hay errores críticos."
                    />

                    <IssueSection
                        title="Advertencias"
                        issues={warningIssues}
                        emptyMessage="No hay advertencias."
                    />

                    <IssueSection
                        title="Información"
                        issues={infoIssues}
                        emptyMessage="No hay incidencias informativas."
                    />
                </>
            )}
        </div>
    )
}

function IssueSection({ title, issues, emptyMessage }) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>

            <div className="mt-4 space-y-3">
                {issues.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                        {emptyMessage}
                    </div>
                ) : (
                    issues.map((issue, index) => (
                        <div
                            key={`${issue.code}-${issue.entity_id}-${issue.related_entity_id}-${index}`}
                            className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                        >
                            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <SeverityBadge severity={issue.severity} />
                                        <span className="text-xs font-semibold text-gray-500">
                                            {issue.code}
                                        </span>
                                    </div>

                                    <h3 className="mt-2 text-sm font-bold text-gray-900">
                                        {issue.title}
                                    </h3>

                                    <p className="mt-1 text-sm text-gray-600">
                                        {issue.detail}
                                    </p>

                                    {issue.context && (
                                        <div className="mt-2 grid gap-1 text-xs text-gray-500 sm:grid-cols-2 lg:grid-cols-3">
                                            {issue.context.course_code && (
                                                <span>Curso: {issue.context.course_code}</span>
                                            )}

                                            {issue.context.section_code && (
                                                <span>Sección: {issue.context.section_code}</span>
                                            )}

                                            {issue.context.teacher_name && (
                                                <span>Docente: {issue.context.teacher_name}</span>
                                            )}

                                            {issue.context.classroom_code && (
                                                <span>Aula: {issue.context.classroom_code}</span>
                                            )}

                                            {issue.context.day_of_week && (
                                                <span>Día: {issue.context.day_of_week}</span>
                                            )}

                                            {issue.context.start_time && issue.context.end_time && (
                                                <span>
                                                    Hora: {issue.context.start_time} - {issue.context.end_time}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
