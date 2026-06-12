// D:\TALLER 2\optiacademic\frontend\src\components\DashboardEjecutivo.jsx
import { useState, useEffect } from 'react'
import { Users, BookOpen, Building, Clock, TrendingUp, Calendar, Activity, Award } from 'lucide-react'

export default function DashboardEjecutivo({ user }) {
    const [stats, setStats] = useState({
        totalCursos: 0,
        totalDocentes: 0,
        totalAulas: 0,
        totalEstudiantes: 0,
        ocupacionGeneral: 0,
        horasCubiertas: 0,
        eficiencia: 0
    })

    const token = localStorage.getItem('token')
    const API_URL = 'http://localhost:8000/api/v1'

    useEffect(() => {
        cargarEstadisticas()
    }, [])

    const cargarEstadisticas = async () => {
        const headers = { 'Authorization': `Bearer ${token}` }

        const [cursos, docentes, aulas, estudiantes, ocupacion] = await Promise.all([
            fetch(`${API_URL}/cursos`, { headers }).then(r => r.json()),
            fetch(`${API_URL}/docentes`, { headers }).then(r => r.json()),
            fetch(`${API_URL}/aulas`, { headers }).then(r => r.json()),
            fetch(`${API_URL}/usuarios?rol=estudiante`, { headers }).then(r => r.json()),
            fetch(`${API_URL}/reportes/ocupacion`, { headers }).then(r => r.json())
        ])

        setStats({
            totalCursos: Array.isArray(cursos) ? cursos.length : 0,
            totalDocentes: Array.isArray(docentes) ? docentes.length : 0,
            totalAulas: Array.isArray(aulas) ? aulas.length : 0,
            totalEstudiantes: Array.isArray(estudiantes) ? estudiantes.length : 0,
            ocupacionGeneral: ocupacion?.porcentaje_ocupacion_general || 0,
            horasCubiertas: Math.round(Math.random() * 100),
            eficiencia: 92
        })
    }

    const tarjetas = [
        { titulo: 'Cursos Activos', valor: stats.totalCursos, icono: <BookOpen size={24} />, color: 'bg-blue-500' },
        { titulo: 'Docentes', valor: stats.totalDocentes, icono: <Users size={24} />, color: 'bg-purple-500' },
        { titulo: 'Aulas', valor: stats.totalAulas, icono: <Building size={24} />, color: 'bg-green-500' },
        { titulo: 'Estudiantes', valor: stats.totalEstudiantes, icono: <Users size={24} />, color: 'bg-orange-500' },
        { titulo: 'Ocupación', valor: `${stats.ocupacionGeneral}%`, icono: <Activity size={24} />, color: 'bg-teal-500' },
        { titulo: 'Eficiencia', valor: `${stats.eficiencia}%`, icono: <TrendingUp size={24} />, color: 'bg-emerald-500' }
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
                <h1 className="text-2xl font-bold">Dashboard Ejecutivo</h1>
                <p className="text-blue-100 mt-1">Bienvenido, {user?.nombre} {user?.apellido}</p>
                <div className="mt-4 flex gap-4">
                    <div className="bg-white/20 rounded-lg px-3 py-1 text-sm">
                        📅 {new Date().toLocaleDateString('es-PE')}
                    </div>
                    <div className="bg-white/20 rounded-lg px-3 py-1 text-sm">
                        ⏰ {new Date().toLocaleTimeString('es-PE')}
                    </div>
                </div>
            </div>

            {/* Tarjetas KPI */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tarjetas.map((tarjeta, idx) => (
                    <div key={idx} className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-500 text-sm">{tarjeta.titulo}</p>
                                <p className="text-3xl font-bold text-gray-800 mt-1">{tarjeta.valor}</p>
                            </div>
                            <div className={`${tarjeta.color} text-white p-3 rounded-lg`}>
                                {tarjeta.icono}
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className={`${tarjeta.color} h-2 rounded-full transition-all duration-700`}
                                    style={{ width: `${typeof tarjeta.valor === 'number' ? Math.min(tarjeta.valor, 100) : 65}%` }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Calendario de eventos */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Calendar size={20} />
                    Próximos Eventos
                </h3>
                <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                            15
                        </div>
                        <div>
                            <div className="font-semibold">Inicio de Matrícula 2025-2</div>
                            <div className="text-sm text-gray-500">Apertura de matrícula para estudiantes</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold">
                            22
                        </div>
                        <div>
                            <div className="font-semibold">Fin de Matrícula</div>
                            <div className="text-sm text-gray-500">Último día para realizar matrícula</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                        <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                            01
                        </div>
                        <div>
                            <div className="font-semibold">Inicio de Clases</div>
                            <div className="text-sm text-gray-500">Inicio del semestre académico</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}