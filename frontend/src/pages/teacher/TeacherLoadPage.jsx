import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { teacherPortalService } from '../../services/teacherPortalService'
import { Header } from './TeacherSchedulePage'

export default function TeacherLoadPage() {
    const [data, setData] = useState(null)
    useEffect(() => { teacherPortalService.getLoad().then(setData).catch(() => toast.error('No se pudo cargar la carga academica.')) }, [])
    if (!data) return null
    const width = Math.min(100, Number(data.load_percentage))
    return <div className="space-y-5"><Header title="Mi carga academica" text="Calculo sobre bloques publicados del periodo activo." />
        <section className="rounded-2xl border bg-white p-6"><div className="flex justify-between"><p className="text-4xl font-bold">{data.assigned_weekly_hours} h</p><span className="rounded-xl bg-slate-100 px-4 py-2 font-bold">{data.status}</span></div><p className="mt-2 text-slate-500">Maximo semanal: {data.max_weekly_hours} h | {data.load_percentage}%</p><div className="mt-4 h-4 rounded-full bg-slate-100"><div className="h-full rounded-full bg-orange-600" style={{ width: `${width}%` }} /></div></section>
        <section className="grid gap-5 md:grid-cols-2"><Breakdown title="Horas por dia" entries={data.hours_by_day} prefix="Dia " /><Breakdown title="Horas por curso" entries={data.hours_by_course} /></section>
    </div>
}
function Breakdown({ title, entries, prefix = '' }) { return <div className="rounded-2xl border bg-white p-5"><h2 className="mb-3 font-bold">{title}</h2>{Object.entries(entries).map(([key, value]) => <p key={key} className="flex justify-between border-t py-2 text-sm"><span>{prefix}{key}</span><strong>{value} h</strong></p>)}</div> }
