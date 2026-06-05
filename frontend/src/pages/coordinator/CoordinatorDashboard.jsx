import { useEffect, useState } from 'react'
import { AlertTriangle, BookOpen, Building2, ClipboardCheck, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { coordinatorDashboardService } from '../../services/coordinatorDashboardService'
import { offeringConflictService } from '../../services/offeringConflictService'
import { getErrorMessage } from '../../utils/extractList'

export default function CoordinatorDashboard() {
    const navigate = useNavigate()
    const [data, setData] = useState(null)

    const load = async () => {
        try {
            setData(await coordinatorDashboardService.getDashboard())
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudo cargar el panel de oferta'))
        }
    }

    useEffect(() => {
        let active = true
        coordinatorDashboardService.getDashboard()
            .then((value) => { if (active) setData(value) })
            .catch((error) => toast.error(getErrorMessage(error, 'No se pudo cargar el panel de oferta')))
        return () => { active = false }
    }, [])

    const analyze = async () => {
        if (!data?.active_period_id) return toast.error('No existe un periodo activo')
        try {
            const result = await offeringConflictService.analyze({ academic_period_id: data.active_period_id })
            toast.success(`${result.conflicts_created} conflictos detectados`)
            await load()
            navigate('/coordinator/conflicts')
        } catch (error) {
            toast.error(getErrorMessage(error, 'No fue posible analizar conflictos'))
        }
    }

    return <div className="space-y-6">
        <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
                <p className="text-sm font-bold text-orange-600">Periodo activo: {data?.active_period_code || 'Sin configurar'}</p>
                <h1 className="text-3xl font-bold text-slate-900">Oferta academica</h1>
                <p className="text-slate-500">Define secciones, recursos y valida la oferta antes de publicarla.</p>
            </div>
            <div className="flex gap-3">
                <button onClick={() => navigate('/coordinator/offerings')} className="rounded-xl bg-orange-600 px-4 py-3 font-semibold text-white">Gestionar oferta</button>
                <button onClick={analyze} className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold">Analizar conflictos</button>
            </div>
        </header>
        <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
            <Metric icon={<BookOpen />} title="Ofertas" value={data?.total_offerings || 0} />
            <Metric icon={<ClipboardCheck />} title="Listas" value={data?.offerings_by_status?.READY || 0} />
            <Metric icon={<AlertTriangle />} title="Incompletas" value={data?.offerings_by_status?.DRAFT || 0} />
            <Metric icon={<Users />} title="Docentes pendientes" value={data?.offerings_without_teacher || 0} />
            <Metric icon={<Building2 />} title="Aulas pendientes" value={data?.offerings_without_classroom || 0} />
            <Metric icon={<AlertTriangle />} title="Criticos" value={data?.critical_conflicts || 0} danger />
        </section>
        <section className="rounded-2xl border bg-white p-5">
            <h2 className="mb-4 text-lg font-bold">Cursos ofertados por ciclo</h2>
            <div className="flex flex-wrap gap-3">
                {Object.entries(data?.courses_by_cycle || {}).map(([cycle, count]) => (
                    <div key={cycle} className="rounded-xl bg-slate-50 px-5 py-3">
                        <p className="text-xs text-slate-500">Ciclo {cycle}</p><p className="text-xl font-bold">{count}</p>
                    </div>
                ))}
                {!Object.keys(data?.courses_by_cycle || {}).length && <p className="text-slate-500">Aun no hay ofertas creadas.</p>}
            </div>
        </section>
    </div>
}

function Metric({ icon, title, value, danger }) {
    return <div className="rounded-2xl border bg-white p-4">
        <div className={danger ? 'text-red-600' : 'text-orange-600'}>{icon}</div>
        <p className="mt-3 text-xs text-slate-500">{title}</p><p className="text-2xl font-bold">{value}</p>
    </div>
}
