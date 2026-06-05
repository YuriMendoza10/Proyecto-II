import { CalendarCheck, GraduationCap, School, Users } from 'lucide-react'

export default function AdminDashboard() {
    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Panel del Administrador
            </h1>

            <p className="text-slate-600 mb-8">
                Gestión general de usuarios, cursos, docentes, aulas y horarios institucionales.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Usuarios" value="Gestión" icon={<Users />} />
                <StatCard title="Docentes" value="Disponibilidad" icon={<GraduationCap />} />
                <StatCard title="Cursos" value="Malla curricular" icon={<School />} />
                <StatCard title="Horarios" value="CSP institucional" icon={<CalendarCheck />} />
            </div>
        </div>
    )
}

function StatCard({ title, value, icon }) {
    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <div className="h-12 w-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                {icon}
            </div>
            <p className="text-sm text-slate-500">{title}</p>
            <h3 className="text-xl font-bold text-slate-900">{value}</h3>
        </div>
    )
}