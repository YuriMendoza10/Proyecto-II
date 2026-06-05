import { useEffect, useState } from 'react'
import { Filter, Plus, Sparkles, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { academicPeriodService } from '../../services/academicPeriodService'
import { curriculumService } from '../../services/curriculumService'
import { sectionOfferingService } from '../../services/sectionOfferingService'
import { getErrorMessage } from '../../utils/extractList'

const STATUSES = ['', 'DRAFT', 'READY', 'APPROVED', 'PUBLISHED', 'CLOSED']

export default function OfferingsPage() {
    const navigate = useNavigate()
    const [offerings, setOfferings] = useState([])
    const [periods, setPeriods] = useState([])
    const [plans, setPlans] = useState([])
    const [filters, setFilters] = useState({ academic_period_id: '', cycle_number: '', status: '', modality: '', shift: '' })

    const load = async () => {
        try {
            const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value))
            setOfferings(await sectionOfferingService.getOfferings(params))
        } catch (error) { toast.error(getErrorMessage(error, 'No se pudieron cargar las ofertas')) }
    }
    useEffect(() => {
        Promise.all([academicPeriodService.getPeriods(), curriculumService.getPlans()])
            .then(([periodData, planData]) => { setPeriods(periodData); setPlans(planData) })
            .catch(() => toast.error('No se pudieron cargar los catalogos'))
    }, [])
    useEffect(() => {
        let active = true
        const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value))
        sectionOfferingService.getOfferings(params)
            .then((items) => { if (active) setOfferings(items) })
            .catch((error) => toast.error(getErrorMessage(error, 'No se pudieron cargar las ofertas')))
        return () => { active = false }
    }, [filters])

    const bulk = async () => {
        const periodId = Number(filters.academic_period_id || periods.find((item) => item.status === 'ACTIVE')?.id)
        const planId = plans[0]?.id
        if (!periodId || !planId) return toast.error('Seleccione periodo y asegure un plan curricular')
        try {
            const result = await sectionOfferingService.bulkFromCurriculum({
                academic_period_id: periodId, curriculum_plan_id: planId, cycles: [1, 2, 3],
                default_section_code: 'A', default_modality: 'PRESENTIAL',
                default_shift: 'MORNING', default_capacity: 40, include_electives: true,
            })
            toast.success(`${result.created} ofertas creadas; ${result.skipped_existing} existentes`)
            await load()
        } catch (error) { toast.error(getErrorMessage(error, 'No se pudo crear la oferta masiva')) }
    }

    return <div className="space-y-5">
        <header className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div><h1 className="text-2xl font-bold">Ofertas por periodo</h1><p className="text-slate-500">Secciones abiertas desde la malla curricular.</p></div>
            <div className="flex gap-2">
                <button onClick={() => navigate('/coordinator/csp')} className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white"><Sparkles size={17} /> Generar horario desde ofertas</button>
                <button onClick={bulk} className="rounded-xl border bg-white px-4 py-2 font-semibold">Crear ciclos 1-3</button>
                <button onClick={() => navigate('/coordinator/offerings/create')} className="flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 font-semibold text-white"><Plus size={17} /> Nueva oferta</button>
            </div>
        </header>
        <section className="flex flex-wrap gap-3 rounded-2xl border bg-white p-4">
            <Filter className="mt-3 text-slate-400" />
            <select className="rounded-xl border p-3" value={filters.academic_period_id} onChange={(e) => setFilters({ ...filters, academic_period_id: e.target.value })}><option value="">Todos los periodos</option>{periods.map((item) => <option key={item.id} value={item.id}>{item.code}</option>)}</select>
            <select className="rounded-xl border p-3" value={filters.cycle_number} onChange={(e) => setFilters({ ...filters, cycle_number: e.target.value })}><option value="">Todos los ciclos</option>{Array.from({ length: 10 }, (_, index) => <option key={index + 1}>{index + 1}</option>)}</select>
            <select className="rounded-xl border p-3" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>{STATUSES.map((value) => <option key={value} value={value}>{value || 'Todos los estados'}</option>)}</select>
        </section>
        <section className="overflow-x-auto rounded-2xl border bg-white">
            <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left"><tr><th className="p-4">Ciclo</th><th>Curso / seccion</th><th>Docente</th><th>Aula</th><th>Cupos</th><th>Modalidad / turno</th><th>Estado</th><th /></tr></thead>
                <tbody>{offerings.map((item) => <tr key={item.id} className="border-t">
                    <td className="p-4">{item.cycle_number}</td>
                    <td><button className="font-semibold text-blue-700" onClick={() => navigate(`/coordinator/offerings/${item.id}`)}>{item.course_name}</button><p className="text-xs text-slate-500">Seccion {item.section_code}</p></td>
                    <td>{item.teacher_name || 'Pendiente'}</td><td>{item.classroom_code || 'Pendiente'}</td>
                    <td>{item.estimated_students} / {item.capacity}</td><td>{item.modality}<br /><span className="text-xs">{item.shift}</span></td>
                    <td><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold">{item.status}</span></td>
                    <td className="space-x-3 pr-4 text-right"><button className="text-xs font-semibold text-blue-600" onClick={() => navigate('/coordinator/conflicts')}>Conflictos</button><button className="text-red-600" onClick={async () => { await sectionOfferingService.deleteOffering(item.id); await load() }}><Trash2 size={16} /></button></td>
                </tr>)}</tbody>
            </table>
            {!offerings.length && <p className="p-8 text-center text-slate-500">No existen ofertas para los filtros seleccionados.</p>}
        </section>
    </div>
}
