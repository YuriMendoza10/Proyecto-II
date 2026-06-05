import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { academicPeriodService } from '../../services/academicPeriodService'
import { offeringConflictService } from '../../services/offeringConflictService'
import { getErrorMessage } from '../../utils/extractList'

export default function OfferingConflictsPage() {
    const [periodId, setPeriodId] = useState('')
    const [periods, setPeriods] = useState([])
    const [conflicts, setConflicts] = useState([])
    const load = async (id = periodId) => {
        if (!id) return
        try { setConflicts(await offeringConflictService.getConflicts({ academic_period_id: id })) }
        catch (error) { toast.error(getErrorMessage(error, 'No se pudieron cargar los conflictos')) }
    }
    useEffect(() => {
        academicPeriodService.getPeriods().then((items) => {
            setPeriods(items)
            const active = items.find((item) => item.status === 'ACTIVE') || items[0]
            if (active) {
                setPeriodId(String(active.id))
                offeringConflictService.getConflicts({ academic_period_id: active.id })
                    .then(setConflicts)
                    .catch((error) => toast.error(getErrorMessage(error, 'No se pudieron cargar los conflictos')))
            }
        })
    }, [])
    const analyze = async () => {
        try { const result = await offeringConflictService.analyze({ academic_period_id: Number(periodId) }); setConflicts(result.conflicts); toast.success(`${result.conflicts_created} conflictos encontrados`) }
        catch (error) { toast.error(getErrorMessage(error, 'No se pudo analizar')) }
    }
    return <div className="space-y-5">
        <header className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div><h1 className="text-2xl font-bold">Conflictos de oferta</h1><p className="text-slate-500">Validaciones previas a aprobacion y publicacion.</p></div>
            <div className="flex gap-2"><select className="rounded-xl border p-3" value={periodId} onChange={(e) => { setPeriodId(e.target.value); load(e.target.value) }}>{periods.map((item) => <option key={item.id} value={item.id}>{item.code}</option>)}</select><button onClick={analyze} className="rounded-xl bg-orange-600 px-4 font-semibold text-white">Analizar</button></div>
        </header>
        <section className="space-y-3">{conflicts.map((item) => <article key={item.id} className="flex flex-col justify-between gap-4 rounded-2xl border bg-white p-4 md:flex-row md:items-center">
            <div className="flex gap-3"><AlertTriangle className={item.severity === 'CRITICAL' ? 'text-red-600' : 'text-amber-500'} /><div><p className="font-bold">{item.conflict_type} <span className="ml-2 rounded-full bg-slate-100 px-2 py-1 text-xs">{item.severity}</span></p><p>{item.offering_display_name}</p><p className="text-sm text-slate-600">{item.message}</p><p className="text-xs text-blue-700">{item.suggested_action}</p></div></div>
            {item.is_resolved ? <span className="text-sm font-bold text-green-600">Resuelto</span> : <button onClick={async () => { await offeringConflictService.resolve(item.id); await load() }} className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold"><CheckCircle size={16} /> Resolver</button>}
        </article>)}</section>
        {!conflicts.length && <p className="rounded-2xl border bg-white p-8 text-center text-slate-500">No se han detectado conflictos para este periodo.</p>}
    </div>
}
