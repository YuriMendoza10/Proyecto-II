import { CalendarDays, Clock, GraduationCap } from 'lucide-react'

export default function TeacherDashboard() {
    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Panel del Docente
            </h1>

            <p className="text-slate-600 mb-8">
                Consulta de horario asignado, disponibilidad y carga académica.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card title="Mi horario" icon={<CalendarDays />} />
                <Card title="Disponibilidad" icon={<Clock />} />
                <Card title="Cursos asignados" icon={<GraduationCap />} />
            </div>
        </div>
    )
}

function Card({ title, icon }) {
    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <div className="h-12 w-12 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center mb-4">
                {icon}
            </div>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        </div>
    )
}