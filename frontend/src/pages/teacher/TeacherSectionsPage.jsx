import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { teacherPortalService } from '../../services/teacherPortalService'
import { Header } from './TeacherSchedulePage'

export default function TeacherSectionsPage() {
    const [items, setItems] = useState([])
    useEffect(() => { teacherPortalService.getSections().then(setItems).catch(() => toast.error('No se pudieron cargar las secciones.')) }, [])
    return <div className="space-y-5"><Header title="Mis cursos y secciones" text="Oferta academica asignada en el periodo activo." /><section className="overflow-x-auto rounded-2xl border bg-white"><table className="min-w-full text-sm"><thead className="bg-slate-50 text-left"><tr><th className="p-4">Curso</th><th>Seccion</th><th>Ciclo</th><th>Aula</th><th>Estimados</th><th>Modalidad</th><th>Turno</th><th>Periodo</th><th>Estado</th></tr></thead><tbody>{items.map((item) => <tr key={item.section_offering_id} className="border-t"><td className="p-4 font-semibold">{item.course_name}<p className="text-xs text-slate-500">{item.course_code}</p></td><td>{item.section_code}</td><td>{item.cycle_number}</td><td>{item.classroom || '-'}</td><td>{item.estimated_students}</td><td>{item.modality}</td><td>{item.shift}</td><td>{item.academic_period}</td><td>{item.status}</td></tr>)}</tbody></table>{!items.length && <p className="p-8 text-center text-slate-500">No hay secciones asignadas.</p>}</section></div>
}
