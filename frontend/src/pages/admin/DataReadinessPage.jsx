import { useEffect, useState } from 'react'
import {
    AlertTriangle,
    CheckCircle2,
    ClipboardList,
    Loader2,
    RefreshCw,
    ShieldAlert,
    ShieldCheck,
} from 'lucide-react'
import toast from 'react-hot-toast'

import { dataReadinessService } from '../../services/dataReadinessService'

function StatusBanner({ summary }) {
    if (!summary) return null

    if (summary.status === 'READY') {
        return (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-green-800">
                <div className="flex items-center gap-3">
                    <ShieldCheck size={30} />
                    <div>
                        <h2 className="text-lg font-bold">
                            Datos listos para generar horarios
                        </h2>
                        <p className="text-sm">
                            No se encontraron problemas críticos en la preparación de datos.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    if (summary.status === 'WARNING') {
        return (
            <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5 text-yellow-800">
                <div className="flex items-center gap-3">
                    <AlertTriangle size={30} />
                    <div>
                        <h2 className="text-lg font-bold">
                            Datos con advertencias
                        </h2>
                        <p className="text-sm">
                            Se puede continuar, pero conviene revisar las observaciones.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
            <div className="flex items-center gap-3">
                <ShieldAlert size={30} />
                <div>
                    <h2 className="text-lg font-bold">
                        Datos no listos para generar horarios
                    </h2>
                    <p className="text-sm">
                        Existen problemas críticos que deben corregirse antes de ejecutar el CSP institucional.
                    </p>
                </div>
            </div>
        </div>
    )
}

function MetricCard({ title, value, danger = false }) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className={`mt-2 text-3xl font-bold ${danger ? 'text-red-600' : 'text-gray-900'}`}>
                {value}
            </p>
        </div>
    )
}

function SeverityBadge({ severity }) {
    const styles = {
        OK: 'bg-green-100 text-green-700',
        INFO: 'bg-blue-100 text-blue-700',
        WARNING: 'bg-yellow-100 text-yellow-700',
        CRITICAL: 'bg-red-100 text-red-700',
    }

    const labels = {
        OK: 'Correcto',
        INFO: 'Info',
        WARNING: 'Advertencia',
        CRITICAL: 'Crítico',
    }

    return (
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[severity] || styles.INFO}`}>
            {labels[severity] || severity}
        </span>
    )
}

function AffectedItemCard({ item, checkCode }) {
    const getMainTitle = () => {
        if (item.course_name) return item.course_name
        if (item.teacher_name) return item.teacher_name
        if (item.student_name) return item.student_name
        if (item.name) return item.name
        if (item.code) return item.code
        return 'Registro afectado'
    }

    const getSubtitle = () => {
        if (item.course_code && item.section_code) {
            return `${item.course_code} · Sección ${item.section_code}`
        }

        if (item.teacher_code) {
            return `Docente ${item.teacher_code}`
        }

        if (item.student_code) {
            return `Estudiante ${item.student_code}`
        }

        if (item.academic_period) {
            return `Periodo ${item.academic_period}`
        }

        if (item.code) {
            return item.code
        }

        return checkCode
    }

    const details = []

    if (item.section_id) details.push(['Sección ID', item.section_id])
    if (item.course_id) details.push(['Curso ID', item.course_id])
    if (item.teacher_id) details.push(['Docente ID', item.teacher_id])
    if (item.student_id) details.push(['Estudiante ID', item.student_id])
    if (item.schedule_id) details.push(['Horario ID', item.schedule_id])
    if (item.career) details.push(['Carrera', item.career])
    if (item.cycle) details.push(['Ciclo', item.cycle])
    if (item.current_cycle) details.push(['Ciclo actual', item.current_cycle])
    if (item.email) details.push(['Correo', item.email])
    if (item.status) details.push(['Estado', item.status])
    if (item.weekly_hours !== undefined && item.weekly_hours !== null) {
        details.push(['Horas semanales', item.weekly_hours])
    }
    if (item.min_credits && item.max_credits) {
        details.push(['Créditos', `${item.min_credits} - ${item.max_credits}`])
    }

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-3">
                <h4 className="line-clamp-2 text-sm font-bold text-gray-900">
                    {getMainTitle()}
                </h4>
                <p className="mt-1 text-xs font-medium text-gray-500">
                    {getSubtitle()}
                </p>
            </div>

            <div className="space-y-2">
                {details.slice(0, 6).map(([label, value]) => (
                    <div
                        key={label}
                        className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 px-3 py-2"
                    >
                        <span className="text-xs font-medium text-gray-500">
                            {label}
                        </span>
                        <span className="text-right text-xs font-bold text-gray-800">
                            {String(value)}
                        </span>
                    </div>
                ))}
            </div>

            {item.reasons?.length > 0 && (
                <div className="mt-3 rounded-xl bg-red-50 p-3">
                    <p className="mb-2 text-xs font-bold text-red-700">
                        Motivos
                    </p>

                    <div className="flex flex-wrap gap-2">
                        {item.reasons.map((reason) => (
                            <span
                                key={reason}
                                className="rounded-full bg-red-100 px-2 py-1 text-[11px] font-semibold text-red-700"
                            >
                                {reason}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

function CheckCard({ check }) {
    const icon =
        check.severity === 'OK'
            ? <CheckCircle2 size={22} className="text-green-600" />
            : <AlertTriangle size={22} className={check.severity === 'CRITICAL' ? 'text-red-600' : 'text-yellow-600'} />

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div className="flex gap-3">
                    <div className="mt-1">{icon}</div>

                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-gray-900">
                                {check.title}
                            </h3>
                            <SeverityBadge severity={check.severity} />
                        </div>

                        <p className="mt-1 text-sm text-gray-600">
                            {check.message}
                        </p>

                        <p className="mt-2 text-xs text-gray-500">
                            Código: {check.code}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center sm:min-w-[180px]">
                    <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="text-lg font-bold text-gray-900">{check.total}</p>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs text-gray-500">Afectados</p>
                        <p className={`text-lg font-bold ${check.affected > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {check.affected}
                        </p>
                    </div>
                </div>
            </div>

            {check.items?.length > 0 && (
                <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                        <div>
                            <p className="text-sm font-bold text-gray-800">
                                Registros que requieren atención
                            </p>
                            <p className="text-xs text-gray-500">
                                Se muestran los primeros {Math.min(check.items.length, 8)} registros afectados.
                            </p>
                        </div>

                        <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-600 shadow-sm">
                            {check.affected} afectado(s)
                        </span>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {check.items.slice(0, 8).map((item, index) => (
                            <AffectedItemCard
                                key={`${check.code}-${index}`}
                                item={item}
                                checkCode={check.code}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default function DataReadinessPage() {
    const [careerFilter, setCareerFilter] = useState('Ingeniería de Sistemas')
    const [academicPeriod, setAcademicPeriod] = useState('2026-1')
    const [loading, setLoading] = useState(false)
    const [report, setReport] = useState(null)

    const loadReport = async () => {
        try {
            setLoading(true)

            const data = await dataReadinessService.getReport({
                careerFilter,
                academicPeriod,
            })

            setReport(data)
        } catch (error) {
            console.error(error)
            toast.error('No se pudo cargar el reporte de preparación de datos')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadReport()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="space-y-6 p-6">
            <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                    <div>
                        <div className="flex items-center gap-3">
                            <ClipboardList size={30} />
                            <h1 className="text-2xl font-bold">
                                Preparación de datos
                            </h1>
                        </div>

                        <p className="mt-2 max-w-3xl text-sm text-slate-300">
                            Verifica si la información base está lista para generar horarios institucionales:
                            cursos, secciones, docentes, aulas, disponibilidades y horarios.
                        </p>
                    </div>

                    <button
                        onClick={loadReport}
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-100 disabled:opacity-60"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
                        Actualizar
                    </button>
                </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900">
                    Alcance del análisis
                </h2>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
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
                            Periodo académico
                        </label>
                        <input
                            value={academicPeriod}
                            onChange={(event) => setAcademicPeriod(event.target.value)}
                            className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500"
                        />
                    </div>
                </div>
            </div>

            {loading && !report && (
                <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-gray-500">
                    <Loader2 className="mx-auto mb-3 animate-spin" />
                    Cargando preparación de datos...
                </div>
            )}

            {report && (
                <>
                    <StatusBanner summary={report.summary} />

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <MetricCard
                            title="Total validaciones"
                            value={report.summary.total_checks}
                        />

                        <MetricCard
                            title="Validaciones correctas"
                            value={report.summary.passed_checks}
                        />

                        <MetricCard
                            title="Advertencias"
                            value={report.summary.warning_checks}
                            danger={report.summary.warning_checks > 0}
                        />

                        <MetricCard
                            title="Críticos"
                            value={report.summary.critical_checks}
                            danger={report.summary.critical_checks > 0}
                        />
                    </div>

                    <div className="space-y-4">
                        {report.checks.map((check) => (
                            <CheckCard key={check.code} check={check} />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}