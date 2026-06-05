import { useEffect, useState } from 'react'
import { AlertTriangle, BookOpen, CalendarDays, Clock, MessageSquare } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { teacherPortalService } from '../../services/teacherPortalService'
import LoadingState from '../../components/common/LoadingState'
import ErrorState from '../../components/common/ErrorState'
import EmptyState from '../../components/common/EmptyState'
import { safeArray } from '../../utils/safeData'

export default function TeacherDashboardPage() {
    const [data, setData] = useState(null)
    const [error, setError] = useState(false)
    useEffect(() => {
        teacherPortalService.getDashboard().then(setData).catch(() => { setError(true); toast.error('No se pudo cargar el panel docente.') })
    }, [])
    if (error) return <ErrorState onRetry={() => window.location.reload()} />
    if (!data) return <LoadingState title="Cargando panel docente..." />
    const cards = [
        ['Cursos asignados', data.total_courses, <BookOpen key="courses" />],
        ['Secciones', data.total_sections, <CalendarDays key="sections" />],
        ['Horas semanales', data.total_weekly_hours, <Clock key="hours" />],
        ['Clases de hoy', data.today_classes, <CalendarDays key="today" />],
        ['Conflictos', data.pending_conflicts, <AlertTriangle key="conflicts" />],
        ['Solicitudes', data.pending_change_requests, <MessageSquare key="requests" />],
    ]
    return <div className="space-y-6">
        <header className="rounded-3xl bg-slate-900 p-6 text-white"><h1 className="text-3xl font-bold">Panel docente</h1><p className="mt-2 text-slate-300">{data.teacher_name} | Periodo {data.active_period || 'sin periodo activo'}</p></header>
        <section className="grid gap-4 md:grid-cols-3">{cards.map(([title, value, icon]) => <article key={title} className="rounded-2xl border bg-white p-5"><div className="mb-3 text-orange-600">{icon}</div><p className="text-sm text-slate-500">{title}</p><p className="text-3xl font-bold">{value}</p></article>)}</section>
        <section className="rounded-2xl border bg-white p-5">
            <div className="mb-4 flex justify-between"><h2 className="text-xl font-bold">Proximas clases</h2><div className="flex gap-2"><Link className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-bold text-white" to="/teacher/schedule">Ver mi horario</Link><Link className="rounded-xl border px-4 py-2 text-sm font-bold" to="/teacher/availability">Actualizar disponibilidad</Link></div></div>
            {safeArray(data.upcoming_classes).map((item) => <p key={item.schedule_block_id} className="border-t py-3 text-sm"><strong>{item.course_name}</strong> - Seccion {item.section_code} | Dia {item.day_of_week}, {shortTime(item.start_time)} - {shortTime(item.end_time)} | {item.classroom || 'Virtual'}</p>)}
            {!safeArray(data.upcoming_classes).length && <EmptyState title="No existe horario publicado asignado." />}
        </section>
    </div>
}
function shortTime(value) { return String(value || '').slice(0, 5) }
