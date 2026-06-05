import { useEffect, useState } from 'react'
import { AlertTriangle, BarChart3, BookOpen, Building2, CalendarDays, ClipboardCheck, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

import { reportService } from '../../services/reportService'
import { useAuthStore } from '../../stores/authStore'
import LoadingState from '../../components/common/LoadingState'
import EmptyState from '../../components/common/EmptyState'
import MetricCard from '../../components/common/MetricCard'
import SectionCard from '../../components/common/SectionCard'
import { formatCO2, formatInteger } from '../../utils/formatters'

export default function ExecutiveDashboardPage() {
    const [data, setData] = useState(null)
    const [support, setSupport] = useState(null)
    const [loading, setLoading] = useState(true)
    const [periodId, setPeriodId] = useState('')
    const { user } = useAuthStore()
    const base = user?.role === 'COORDINATOR' ? '/coordinator/reports' : '/admin/reports'

    const load = async (selectedPeriod = '') => {
        const params = selectedPeriod ? { academic_period_id: Number(selectedPeriod) } : {}
        setLoading(true)
        try {
            const [summary, loadReport, rooms, students, sustainability] = await Promise.all([
                reportService.getExecutiveSummary(params),
                reportService.getTeacherLoadReport(params),
                reportService.getClassroomUsageReport(params),
                reportService.getStudentsReport(params),
                reportService.getSustainabilityReport(),
            ])
            setData(summary)
            setSupport({ load: loadReport, rooms, students, sustainability })
        } catch {
            toast.error('No se pudo cargar el panel ejecutivo')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        let active = true
        Promise.all([
            reportService.getExecutiveSummary(),
            reportService.getTeacherLoadReport(),
            reportService.getClassroomUsageReport(),
            reportService.getStudentsReport(),
            reportService.getSustainabilityReport(),
        ])
            .then(([summary, load, rooms, students, sustainability]) => {
                if (active) {
                    setData(summary)
                    setSupport({ load, rooms, students, sustainability })
                }
            })
            .catch(() => toast.error('No se pudo cargar el panel ejecutivo'))
            .finally(() => { if (active) setLoading(false) })
        return () => { active = false }
    }, [])

    if (loading) {
        return <LoadingState title="Cargando indicadores ejecutivos..." />
    }
    if (!data) {
        return <EmptyState title="No hay datos disponibles para el panel ejecutivo." />
    }

    const cards = [
        ['Periodo activo', data.active_period?.code || '-', CalendarDays],
        ['Ofertas academicas', data.total_offerings, BookOpen],
        ['Horarios publicados', data.total_published_schedules, ClipboardCheck],
        ['Docentes activos', data.active_teachers, Users],
        ['Estudiantes asignados', data.students_with_enrollments, Users],
        ['Aulas activas', data.active_classrooms, Building2],
        ['Conflictos criticos', data.critical_conflicts, AlertTriangle],
        ['Solicitudes pendientes', data.pending_change_requests, ClipboardCheck],
    ]
    const topTeachers = [...(support?.load?.teachers || [])]
        .sort((a, b) => b.assigned_weekly_hours - a.assigned_weekly_hours)
        .slice(0, 5)
    const usedRooms = [...(support?.rooms?.classrooms || [])]
        .sort((a, b) => b.used_hours - a.used_hours)
        .slice(0, 5)
    const sustainabilityMetrics = support?.sustainability?.environmental_metrics || {}

    return <div className="space-y-6">
        <header className="rounded-3xl bg-gradient-to-r from-slate-950 to-orange-700 p-7 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-200">Analitica institucional</p>
            <div className="mt-3 flex items-center gap-3">
                <BarChart3 size={30} />
                <h1 className="text-3xl font-bold">Panel ejecutivo</h1>
            </div>
            <p className="mt-3 max-w-3xl text-sm text-slate-100">
                Seguimiento del periodo, oferta, recursos, estudiantes, incidencias y sostenibilidad en una sola vista.
            </p>
            <div className="mt-5 flex max-w-sm gap-2">
                <label htmlFor="executive-period-id" className="sr-only">ID del período activo</label>
                <input
                    id="executive-period-id"
                    type="number"
                    min="1"
                    value={periodId}
                    onChange={(event) => setPeriodId(event.target.value)}
                    placeholder="ID periodo activo"
                    className="min-w-0 flex-1 rounded-xl bg-white px-3 py-2 text-sm text-slate-800"
                />
                <button onClick={() => load(periodId)} className="rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/25">
                    Aplicar
                </button>
            </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map(([label, value, Icon]) => (
                <MetricCard
                    key={label}
                    title={label}
                    value={typeof value === 'number' ? formatInteger(value) : value}
                    description="Indicador consolidado del periodo"
                    icon={Icon}
                    tone={label.includes('Conflictos') ? 'red' : 'orange'}
                />
            ))}
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
            <Panel title="Estados de oferta">
                {Object.entries(data.offerings_by_status || {}).map(([status, total]) => (
                    <Line key={status} label={status} value={total} />
                ))}
            </Panel>
            <Panel title="Horarios institucionales">
                {Object.entries(data.schedules_by_status || {}).map(([status, total]) => (
                    <Line key={status} label={status} value={total} />
                ))}
            </Panel>
            <Panel title="Sostenibilidad">
                <Line label="Solicitudes analizadas" value={sustainabilityMetrics.total_requests || 0} />
                <Line label="CO₂ estimado total" value={formatCO2(sustainabilityMetrics.total_co2)} />
                <p className="mt-4 text-sm text-slate-700">{support?.sustainability?.message || 'Sin reporte ambiental disponible.'}</p>
            </Panel>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
            <Panel title="Carga docente destacada">
                {topTeachers.map((teacher) => (
                    <Line key={teacher.teacher_id} label={teacher.teacher_name} value={`${teacher.assigned_weekly_hours} h`} />
                ))}
            </Panel>
            <Panel title="Uso de aulas">
                {usedRooms.map((room) => (
                    <Line key={room.classroom_id} label={room.classroom_code} value={`${room.used_hours} h`} />
                ))}
            </Panel>
        </section>

        <section className="rounded-2xl border bg-white p-5">
            <h2 className="text-lg font-bold text-slate-900">Accesos rapidos</h2>
            <div className="mt-4 flex flex-wrap gap-3">
                {[
                    ['Carga docente', 'teacher-load'],
                    ['Uso de aulas', 'classroom-usage'],
                    ['Ofertas', 'offerings'],
                    ['Conflictos', 'conflicts'],
                    ['Horarios', 'schedules'],
                    ['Solicitudes', 'change-requests'],
                ].map(([label, path]) => (
                    <Link key={path} to={`${base}/${path}`} className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-orange-100 hover:text-orange-700">
                        {label}
                    </Link>
                ))}
                {user?.role === 'ADMIN' && (
                    <>
                        <Link to="/admin/reports/students" className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">Estudiantes</Link>
                        <Link to="/admin/reports/sustainability" className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">Sostenibilidad</Link>
                    </>
                )}
            </div>
        </section>
    </div>
}

function Panel({ title, children }) {
    return <SectionCard title={title}>
        <div className="space-y-3 p-5">{children}</div>
    </SectionCard>
}

function Line({ label, value }) {
    return <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5 text-sm">
        <span className="font-medium text-slate-800">{label}</span>
        <span className="font-bold text-slate-900">{value}</span>
    </div>
}
