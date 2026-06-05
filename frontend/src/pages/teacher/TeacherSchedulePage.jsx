import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { teacherPortalService } from '../../services/teacherPortalService'
import LoadingState from '../../components/common/LoadingState'
import ErrorState from '../../components/common/ErrorState'
import EmptyState from '../../components/common/EmptyState'
import StatusBadge from '../../components/common/StatusBadge'
import { safeArray } from '../../utils/safeData'

export default function TeacherSchedulePage() {
    const [data, setData] = useState({ blocks: [] })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    useEffect(() => {
        teacherPortalService.getSchedule()
            .then(setData)
            .catch(() => { setError(true); toast.error('No se pudo cargar el horario.') })
            .finally(() => setLoading(false))
    }, [])
    const blocks = safeArray(data.blocks)
    return <div className="space-y-5"><Header title="Mi horario publicado" text={data.message || 'Clases asignadas en horario institucional publicado.'} />
        {loading && <LoadingState title="Cargando horario publicado..." />}
        {error && !loading && <ErrorState onRetry={() => window.location.reload()} />}
        {!loading && !error && <section className="overflow-x-auto rounded-2xl border bg-white"><table className="min-w-full text-sm"><thead className="bg-slate-50 text-left"><tr><th className="p-4">Dia</th><th>Hora</th><th>Curso</th><th>Seccion</th><th>Aula</th><th>Modalidad</th><th>Turno</th><th>Estado</th></tr></thead><tbody>{blocks.map((item) => <tr className="border-t" key={item.schedule_block_id}><td className="p-4">Dia {item.day_of_week}</td><td>{time(item.start_time)} - {time(item.end_time)}</td><td className="font-semibold">{item.course_name}<p className="text-xs text-slate-500">{item.course_code}</p></td><td>{item.section_code}</td><td>{item.classroom || 'Virtual'}</td><td>{item.modality}</td><td>{item.shift}</td><td><StatusBadge value={item.status} /></td></tr>)}</tbody></table>{!blocks.length && <div className="p-6"><EmptyState title="Sin bloques publicados asignados." /></div>}</section>}</div>
}
export function Header({ title, text }) { return <header><h1 className="text-2xl font-bold">{title}</h1><p className="text-slate-500">{text}</p></header> }
function time(value) { return String(value || '').slice(0, 5) }
