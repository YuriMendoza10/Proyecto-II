import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { teacherPortalService } from '../../services/teacherPortalService'
import { Header } from './TeacherSchedulePage'

export default function TeacherConflictsPage() {
    const [items, setItems] = useState([])
    useEffect(() => { teacherPortalService.getConflicts().then(setItems).catch(() => toast.error('No se pudieron cargar conflictos.')) }, [])
    return <div className="space-y-5"><Header title="Conflictos asociados" text="Incidencias de oferta, disponibilidad o carga que requieren revision." /><section className="space-y-3">{items.map((item, index) => <article className="flex gap-3 rounded-2xl border bg-white p-5" key={`${item.conflict_type}-${index}`}><AlertTriangle className={item.severity === 'CRITICAL' ? 'text-red-600' : 'text-amber-500'} /><div><p className="font-bold">{item.conflict_type} <span className="rounded-full bg-slate-100 px-2 py-1 text-xs">{item.severity}</span></p><p>{item.course_name}</p><p className="text-sm text-slate-600">{item.message}</p><p className="text-sm text-blue-700">{item.suggested_action}</p></div></article>)}</section>{!items.length && <p className="rounded-2xl border bg-white p-8 text-center text-slate-500">Sin conflictos pendientes.</p>}</div>
}
