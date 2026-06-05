import { useEffect, useState } from 'react'
import {
    AlertTriangle,
    BarChart3,
    BookOpen,
    Building2,
    CalendarDays,
    CheckCircle2,
    GraduationCap,
    Loader2,
    RefreshCw,
    School,
    Users,
} from 'lucide-react'
import toast from 'react-hot-toast'

import { dashboardService } from '../../services/dashboardService'

function MetricCard({ title, value, description, icon: Icon, danger = false }) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className={`mt-2 text-3xl font-bold ${danger ? 'text-red-600' : 'text-gray-900'}`}>
                        {value}
                    </p>
                    {description && (
                        <p className="mt-1 text-xs text-gray-500">{description}</p>
                    )}
                </div>

                <div className={`rounded-xl p-3 ${danger ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                    <Icon size={22} />
                </div>
            </div>
        </div>
    )
}

function StatusBadge({ value }) {
    const normalized = String(value || '').toUpperCase()

    const styles = {
        DRAFT: 'bg-gray-100 text-gray-700',
        GENERATED: 'bg-blue-100 text-blue-700',
        APPROVED: 'bg-purple-100 text-purple-700',
        PUBLISHED: 'bg-green-100 text-green-700',
        ARCHIVED: 'bg-yellow-100 text-yellow-700',
    }

    return (
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[normalized] || 'bg-gray-100 text-gray-700'}`}>
            {normalized || 'SIN ESTADO'}
        </span>
    )
}

function EmptyState({ message }) {
    return (
        <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
            {message}
        </div>
    )
}

export default function AdminDashboardPage() {
    const [summary, setSummary] = useState(null)
    const [scheduleId, setScheduleId] = useState('')
    const [loading, setLoading] = useState(false)

    const loadSummary = async () => {
        try {
            setLoading(true)

            const data = await dashboardService.getAdminSummary(
                scheduleId ? Number(scheduleId) : null
            )

            setSummary(data)
        } catch (error) {
            console.error(error)
            toast.error('No se pudo cargar el dashboard institucional')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadSummary()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const hasCriticalIssues =
        Number(summary?.sections_without_teacher || 0) > 0 ||
        Number(summary?.teachers_without_availability || 0) > 0 ||
        Number(summary?.courses_without_sections || 0) > 0 ||
        Number(summary?.blocks_without_teacher || 0) > 0

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col justify-between gap-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-700 p-6 text-white shadow-sm md:flex-row md:items-center">
                <div>
                    <div className="flex items-center gap-2">
                        <BarChart3 size={28} />
                        <h1 className="text-2xl font-bold">Dashboard institucional</h1>
                    </div>

                    <p className="mt-2 max-w-3xl text-sm text-slate-200">
                        Resumen general del estado académico, disponibilidad de recursos,
                        bloques horarios generados y alertas de calidad.
                    </p>

                    {summary?.schedule_id && (
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                            <span className="text-sm text-slate-200">
                                Horario analizado: #{summary.schedule_id} — {summary.schedule_name}
                            </span>
                            <StatusBadge value={summary.schedule_status} />
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                        type="number"
                        min="1"
                        placeholder="Schedule ID"
                        value={scheduleId}
                        onChange={(event) => setScheduleId(event.target.value)}
                        className="rounded-xl border border-white/20 bg-white px-4 py-2 text-sm text-gray-900 outline-none"
                    />

                    <button
                        onClick={loadSummary}
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:opacity-60"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                        Actualizar
                    </button>
                </div>
            </div>

            {loading && !summary && (
                <div className="flex items-center justify-center rounded-2xl border bg-white p-12 text-gray-500">
                    <Loader2 className="mr-2 animate-spin" />
                    Cargando métricas institucionales...
                </div>
            )}

            {summary && (
                <>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <MetricCard
                            title="Usuarios"
                            value={summary.total_users}
                            description={`${summary.total_active_users} activos`}
                            icon={Users}
                        />

                        <MetricCard
                            title="Docentes"
                            value={summary.total_teachers}
                            description="Registrados en el sistema"
                            icon={School}
                        />

                        <MetricCard
                            title="Estudiantes"
                            value={summary.total_students}
                            description="Perfiles estudiantiles"
                            icon={GraduationCap}
                        />

                        <MetricCard
                            title="Cursos"
                            value={summary.total_courses}
                            description={`${summary.total_sections} secciones registradas`}
                            icon={BookOpen}
                        />

                        <MetricCard
                            title="Aulas"
                            value={summary.total_classrooms}
                            description={`${summary.total_active_classrooms} activas`}
                            icon={Building2}
                        />

                        <MetricCard
                            title="Horarios"
                            value={summary.total_schedules}
                            description="Horarios académicos creados"
                            icon={CalendarDays}
                        />

                        <MetricCard
                            title="Bloques generados"
                            value={summary.total_schedule_blocks}
                            description="Del horario seleccionado"
                            icon={CheckCircle2}
                        />

                        <MetricCard
                            title="Alertas"
                            value={
                                Number(summary.sections_without_teacher || 0) +
                                Number(summary.teachers_without_availability || 0) +
                                Number(summary.courses_without_sections || 0) +
                                Number(summary.blocks_without_teacher || 0)
                            }
                            description={hasCriticalIssues ? 'Requieren revisión' : 'Sin problemas críticos'}
                            icon={AlertTriangle}
                            danger={hasCriticalIssues}
                        />
                    </div>

                    <div className="grid gap-4 lg:grid-cols-4">
                        <MetricCard
                            title="Secciones sin docente"
                            value={summary.sections_without_teacher}
                            description="No deberían publicarse así"
                            icon={AlertTriangle}
                            danger={Number(summary.sections_without_teacher) > 0}
                        />

                        <MetricCard
                            title="Docentes sin disponibilidad"
                            value={summary.teachers_without_availability}
                            description="No pueden ser programados"
                            icon={AlertTriangle}
                            danger={Number(summary.teachers_without_availability) > 0}
                        />

                        <MetricCard
                            title="Cursos sin secciones"
                            value={summary.courses_without_sections}
                            description="No aparecerán en horarios"
                            icon={AlertTriangle}
                            danger={Number(summary.courses_without_sections) > 0}
                        />

                        <MetricCard
                            title="Bloques sin docente"
                            value={summary.blocks_without_teacher}
                            description="Validación del horario seleccionado"
                            icon={AlertTriangle}
                            danger={Number(summary.blocks_without_teacher) > 0}
                        />
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900">
                                Horarios por estado
                            </h2>

                            <div className="mt-4 space-y-3">
                                {summary.schedules_by_status?.length ? (
                                    summary.schedules_by_status.map((item) => (
                                        <div
                                            key={item.status}
                                            className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"
                                        >
                                            <StatusBadge value={item.status} />
                                            <span className="text-lg font-bold text-gray-900">
                                                {item.total}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <EmptyState message="No hay horarios registrados." />
                                )}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900">
                                Carga docente
                            </h2>

                            <div className="mt-4 space-y-3">
                                {summary.teacher_load_top?.length ? (
                                    summary.teacher_load_top.map((teacher) => (
                                        <div
                                            key={teacher.teacher_id}
                                            className="rounded-xl bg-gray-50 px-4 py-3"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {teacher.teacher_name || 'Docente sin nombre'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {teacher.teacher_code || 'Sin código'}
                                                    </p>
                                                </div>

                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-gray-900">
                                                        {teacher.total_hours} h
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {teacher.total_blocks} bloques
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <EmptyState message="No hay bloques generados para calcular carga docente." />
                                )}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900">
                                Uso de aulas
                            </h2>

                            <div className="mt-4 space-y-3">
                                {summary.classroom_usage_top?.length ? (
                                    summary.classroom_usage_top.map((classroom) => (
                                        <div
                                            key={classroom.classroom_id}
                                            className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"
                                        >
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {classroom.classroom_code || 'Sin código'}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {classroom.classroom_name || 'Sin nombre'}
                                                </p>
                                            </div>

                                            <span className="text-lg font-bold text-gray-900">
                                                {classroom.total_blocks}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <EmptyState message="No hay uso de aulas registrado para este horario." />
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}