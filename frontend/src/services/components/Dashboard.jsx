// D:\TALLER 2\optiacademic\frontend\src\components\Dashboard.jsx
import { useState, useEffect } from 'react'
import HorarioUniversitario from './HorarioUniversitario'

const API_URL = 'http://localhost:8000/api/v1'

export default function Dashboard({ user }) {
    const [activeTab, setActiveTab] = useState('generar')
    const [cursos, setCursos] = useState([])
    const [docentes, setDocentes] = useState([])
    const [aulas, setAulas] = useState([])
    const [programas, setProgramas] = useState([])
    const [resultado, setResultado] = useState(null)
    const [errorMsg, setErrorMsg] = useState(null)
    const [filtroPrograma, setFiltroPrograma] = useState('')
    const [filtroSemestre, setFiltroSemestre] = useState('')
    const [generando, setGenerando] = useState(false)
    const [estadisticas, setEstadisticas] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [modalCurso, setModalCurso] = useState(null)

    const token = localStorage.getItem('token')

    useEffect(() => {
        cargarDatos()
        cargarEstadisticas()
    }, [])

    const cargarDatos = async () => {
        const headers = { 'Authorization': `Bearer ${token}` }
        try {
            const [c, d, a, p] = await Promise.all([
                fetch(`${API_URL}/cursos`, { headers }).then(r => r.json()),
                fetch(`${API_URL}/docentes`, { headers }).then(r => r.json()),
                fetch(`${API_URL}/aulas`, { headers }).then(r => r.json()),
                fetch(`${API_URL}/programas`, { headers }).then(r => r.json()),
            ])
            setCursos(c)
            setDocentes(d)
            setAulas(a)
            setProgramas(p)
        } catch (error) {
            console.error('Error cargando datos:', error)
        }
    }

    const cargarEstadisticas = async () => {
        const headers = { 'Authorization': `Bearer ${token}` }
        try {
            const ocupacion = await fetch(`${API_URL}/reportes/ocupacion`, { headers }).then(r => r.json())
            setEstadisticas(ocupacion)
        } catch (error) {
            console.error('Error cargando estadísticas:', error)
        }
    }

    const cursosFiltrados = cursos.filter(c => {
        if (filtroPrograma && c.programa_id !== parseInt(filtroPrograma)) return false
        if (filtroSemestre && c.semestre !== parseInt(filtroSemestre)) return false
        return true
    })

    const generarHorario = async () => {
        if (cursosFiltrados.length === 0) {
            setErrorMsg('No hay cursos para generar horario con los filtros actuales')
            setTimeout(() => setErrorMsg(null), 3000)
            return
        }

        setGenerando(true)
        setErrorMsg(null)
        setResultado(null)

        const payload = {
            cursos: cursosFiltrados.map(c => ({
                id: c.codigo,
                nombre: c.nombre,
                docente_id: docentes.find(d => d.id === c.docente_id)?.codigo || 'DOC001',
                max_estudiantes: c.max_estudiantes,
                tipo: c.tipo,
                semestre: c.semestre,
                horas_teoria: c.horas_teoria || c.horas_semanales,
                horas_laboratorio: c.horas_laboratorio || 0,
                horas_practica: c.horas_practica || 0,
                minutos_por_hora: c.minutos_por_hora || 90
            })),
            aulas: aulas.map(a => ({
                id: a.codigo,
                capacidad: a.capacidad,
                tipo: a.tipo,
                recursos: a.recursos || []
            })),
            docentes: docentes.map(d => ({
                id: d.codigo,
                nombre: `${d.nombre} ${d.apellido}`,
                disponibilidad: d.disponibilidad || []
            }))
        }

        try {
            const res = await fetch(`${API_URL}/generar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.detail || 'Error del servidor')
            setResultado(data)

            // Mostrar notificación de éxito
            showNotification('Horario generado exitosamente', 'success')
        } catch (e) {
            console.error('Error:', e)
            setErrorMsg(e.message)
            showNotification(e.message, 'error')
        } finally {
            setGenerando(false)
        }
    }

    const showNotification = (message, type) => {
        const notification = document.createElement('div')
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-500 ${type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`
        notification.innerText = message
        document.body.appendChild(notification)
        setTimeout(() => notification.remove(), 3000)
    }

    const semestres = [...new Set(cursos.map(c => c.semestre))].sort((a, b) => a - b)

    const totalCreditos = cursosFiltrados.reduce((sum, c) => sum + c.creditos, 0)
    const totalHorasTeoria = cursosFiltrados.reduce((sum, c) => sum + (c.horas_teoria || c.horas_semanales), 0)
    const totalHorasLab = cursosFiltrados.reduce((sum, c) => sum + (c.horas_laboratorio || 0), 0)
    const totalHorasPrac = cursosFiltrados.reduce((sum, c) => sum + (c.horas_practica || 0), 0)

    // Agrupar cursos por semestre para visualización
    const cursosPorSemestre = {}
    cursos.forEach(c => {
        if (!cursosPorSemestre[c.semestre]) cursosPorSemestre[c.semestre] = []
        cursosPorSemestre[c.semestre].push(c)
    })

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header con bienvenida */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold">Bienvenido, {user?.nombre} {user?.apellido}</h1>
                        <p className="text-blue-100 mt-1">Sistema de Planificación y Matrícula Universitaria</p>
                    </div>
                    <div className="bg-white/20 rounded-lg px-3 py-1 text-sm">
                        Rol: {user?.rol}
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    titulo="Cursos Registrados"
                    valor={cursos.length}
                    icono="📚"
                    color="bg-blue-500"
                    descripcion={`${cursosFiltrados.length} filtrados`}
                />
                <StatCard
                    titulo="Docentes"
                    valor={docentes.length}
                    icono="👨‍🏫"
                    color="bg-purple-500"
                    descripcion="Activos"
                />
                <StatCard
                    titulo="Aulas Disponibles"
                    valor={aulas.length}
                    icono="🏫"
                    color="bg-green-500"
                    descripcion={`${aulas.filter(a => a.activa).length} activas`}
                />
                <StatCard
                    titulo="Programas"
                    valor={programas.length}
                    icono="🎓"
                    color="bg-orange-500"
                    descripcion="Académicos"
                />
            </div>

            {/* Tabs personalizados */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-1 p-2">
                        <TabButton
                            active={activeTab === 'generar'}
                            onClick={() => setActiveTab('generar')}
                            icon="⚡"
                            label="Generar Horario"
                        />
                        <TabButton
                            active={activeTab === 'cursos'}
                            onClick={() => setActiveTab('cursos')}
                            icon="📖"
                            label="Cursos"
                        />
                        <TabButton
                            active={activeTab === 'estadisticas'}
                            onClick={() => setActiveTab('estadisticas')}
                            icon="📊"
                            label="Estadísticas"
                        />
                        <TabButton
                            active={activeTab === 'configuracion'}
                            onClick={() => setActiveTab('configuracion')}
                            icon="⚙️"
                            label="Configuración"
                        />
                    </nav>
                </div>

                <div className="p-6">
                    {/* Panel Generar Horario */}
                    {activeTab === 'generar' && (
                        <div className="space-y-6">
                            {/* Panel de filtros mejorado */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-700 mb-3">🔍 Filtros de Búsqueda</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">Programa Académico</label>
                                        <select
                                            value={filtroPrograma}
                                            onChange={(e) => setFiltroPrograma(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Todos los programas</option>
                                            {programas.map(p => (
                                                <option key={p.id} value={p.id}>{p.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">Semestre</label>
                                        <select
                                            value={filtroSemestre}
                                            onChange={(e) => setFiltroSemestre(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Todos los semestres</option>
                                            {semestres.map(s => (
                                                <option key={s} value={s}>Semestre {s}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex items-end">
                                        <button
                                            onClick={generarHorario}
                                            disabled={generando}
                                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2"
                                        >
                                            {generando ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    Generando...
                                                </>
                                            ) : (
                                                <>
                                                    🚀 Generar Horario
                                                    <span className="bg-white/20 rounded-full px-2 py-0.5 text-xs">
                                                        {cursosFiltrados.length} cursos
                                                    </span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Resumen de selección */}
                            {cursosFiltrados.length > 0 && (
                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-700 mb-3">📋 Resumen de la Selección</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                        <SummaryCard label="Cursos" value={cursosFiltrados.length} icon="📖" color="blue" />
                                        <SummaryCard label="Créditos" value={totalCreditos} icon="⭐" color="yellow" />
                                        <SummaryCard label="Horas Teoría" value={totalHorasTeoria} icon="📝" color="green" />
                                        <SummaryCard label="Horas Laboratorio" value={totalHorasLab} icon="💻" color="purple" />
                                        <SummaryCard label="Horas Práctica" value={totalHorasPrac} icon="🔧" color="orange" />
                                    </div>
                                </div>
                            )}

                            {errorMsg && (
                                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg animate-shake">
                                    ❌ {errorMsg}
                                </div>
                            )}

                            {resultado && (
                                <>
                                    {/* Métricas del resultado */}
                                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                                        <h3 className="font-semibold text-gray-700 mb-3">📈 Métricas de Optimización</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <MetricCard
                                                label="Cursos Asignados"
                                                value={resultado.estadisticas?.total_asignados || 0}
                                                total={cursosFiltrados.length}
                                                color="green"
                                            />
                                            <MetricCard
                                                label="Sin Asignar"
                                                value={resultado.estadisticas?.total_no_asignados || 0}
                                                total={cursosFiltrados.length}
                                                color="red"
                                            />
                                            <MetricCard
                                                label="Tiempo de Cómputo"
                                                value={`${resultado.estadisticas?.tiempo_ms || 0} ms`}
                                                icon="⏱️"
                                                color="blue"
                                            />
                                            <MetricCard
                                                label="Eficiencia"
                                                value={resultado.estadisticas?.total_no_asignados === 0 ? '100%' : 'Parcial'}
                                                icon={resultado.estadisticas?.total_no_asignados === 0 ? '✅' : '⚠️'}
                                                color={resultado.estadisticas?.total_no_asignados === 0 ? 'green' : 'yellow'}
                                            />
                                        </div>
                                    </div>

                                    {/* Horario generado */}
                                    {resultado.horario_generado && resultado.horario_generado.length > 0 && (
                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="font-bold text-lg text-gray-800">📅 Horario Generado</h3>
                                                <button
                                                    onClick={() => {
                                                        showNotification('Horario exportado a PDF', 'success')
                                                    }}
                                                    className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg transition"
                                                >
                                                    📄 Exportar
                                                </button>
                                            </div>
                                            <HorarioUniversitario
                                                asignaciones={resultado.horario_generado}
                                                onCursoClick={(curso) => {
                                                    setModalCurso(curso)
                                                    setShowModal(true)
                                                }}
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* Panel Cursos */}
                    {activeTab === 'cursos' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-800">📖 Catálogo de Cursos</h2>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Buscar curso..."
                                        className="border border-gray-300 rounded-lg px-4 py-2 pl-10 text-sm focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="absolute left-3 top-2.5">🔍</span>
                                </div>
                            </div>

                            {Object.keys(cursosPorSemestre).sort().map(semestre => (
                                <div key={semestre} className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 font-semibold">
                                        Semestre {semestre}
                                        <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                            {cursosPorSemestre[semestre].length} cursos
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
                                        {cursosPorSemestre[semestre].map(curso => (
                                            <CursoCard
                                                key={curso.id}
                                                curso={curso}
                                                onClick={() => {
                                                    setModalCurso(curso)
                                                    setShowModal(true)
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Panel Estadísticas */}
                    {activeTab === 'estadisticas' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-800">📊 Estadísticas Institucionales</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-700 mb-3">Distribución de Cursos por Semestre</h3>
                                    <div className="space-y-2">
                                        {Object.keys(cursosPorSemestre).sort().map(semestre => {
                                            const count = cursosPorSemestre[semestre].length
                                            const porcentaje = (count / cursos.length * 100).toFixed(1)
                                            return (
                                                <div key={semestre}>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span>Semestre {semestre}</span>
                                                        <span>{count} cursos ({porcentaje}%)</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                                            style={{ width: `${porcentaje}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-700 mb-3">Tipos de Curso</h3>
                                    <div className="space-y-2">
                                        {['teoria', 'laboratorio', 'taller', 'practica'].map(tipo => {
                                            const count = cursos.filter(c => c.tipo === tipo).length
                                            const porcentaje = cursos.length ? (count / cursos.length * 100).toFixed(1) : 0
                                            return (
                                                <div key={tipo}>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="capitalize">{tipo}</span>
                                                        <span>{count} cursos ({porcentaje}%)</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                                                            style={{ width: `${porcentaje}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-700 mb-3">Resumen General</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between py-2 border-b">
                                            <span>Total Cursos:</span>
                                            <span className="font-bold">{cursos.length}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b">
                                            <span>Total Docentes:</span>
                                            <span className="font-bold">{docentes.length}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b">
                                            <span>Total Aulas:</span>
                                            <span className="font-bold">{aulas.length}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b">
                                            <span>Créditos Totales:</span>
                                            <span className="font-bold">{cursos.reduce((sum, c) => sum + c.creditos, 0)}</span>
                                        </div>
                                    </div>
                                </div>

                                {estadisticas && (
                                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                                        <h3 className="font-semibold text-gray-700 mb-3">Ocupación de Aulas</h3>
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-blue-600">
                                                {estadisticas.porcentaje_ocupacion_general || 0}%
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">Tasa de ocupación general</p>
                                        </div>
                                        <div className="mt-4">
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div
                                                    className="bg-green-600 h-3 rounded-full transition-all duration-500"
                                                    style={{ width: `${estadisticas.porcentaje_ocupacion_general || 0}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Panel Configuración */}
                    {activeTab === 'configuracion' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-800">⚙️ Configuración del Sistema</h2>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Información</h3>
                                <p className="text-sm text-yellow-700">
                                    Los parámetros de configuración se están desarrollando. Próximamente podrás ajustar:
                                </p>
                                <ul className="list-disc list-inside text-sm text-yellow-700 mt-2 space-y-1">
                                    <li>Franjas horarias</li>
                                    <li>Días de clase</li>
                                    <li>Límites de carga académica</li>
                                    <li>Preferencias de asignación</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de detalles del curso */}
            {showModal && modalCurso && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-xl max-w-md w-full mx-4 transform transition-all animate-slideUp" onClick={e => e.stopPropagation()}>
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-gray-900">Detalles del Curso</h3>
                                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">
                                    ×
                                </button>
                            </div>
                            <div className="space-y-3">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Código</label>
                                    <p className="text-gray-900 font-mono">{modalCurso.codigo || modalCurso.curso_id}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Nombre</label>
                                    <p className="text-gray-900 font-semibold">{modalCurso.nombre || modalCurso.curso_nombre}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <label className="text-xs font-semibold text-gray-500 uppercase">Créditos</label>
                                        <p className="text-gray-900">{modalCurso.creditos || '-'}</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <label className="text-xs font-semibold text-gray-500 uppercase">Semestre</label>
                                        <p className="text-gray-900">{modalCurso.semestre || '-'}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                                        <label className="text-xs font-semibold text-gray-500 uppercase">Teoría</label>
                                        <p className="text-gray-900 font-bold">{modalCurso.horas_teoria || modalCurso.horas_semanales || 0}h</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                                        <label className="text-xs font-semibold text-gray-500 uppercase">Laboratorio</label>
                                        <p className="text-gray-900 font-bold">{modalCurso.horas_laboratorio || 0}h</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                                        <label className="text-xs font-semibold text-gray-500 uppercase">Práctica</label>
                                        <p className="text-gray-900 font-bold">{modalCurso.horas_practica || 0}h</p>
                                    </div>
                                </div>
                                {modalCurso.docente_nombre && (
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <label className="text-xs font-semibold text-gray-500 uppercase">Docente</label>
                                        <p className="text-gray-900">{modalCurso.docente_nombre}</p>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// Componentes auxiliares
function StatCard({ titulo, valor, icono, color, descripcion }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-sm">{titulo}</p>
                    <p className="text-2xl font-bold text-gray-800">{valor}</p>
                    {descripcion && <p className="text-xs text-gray-400 mt-1">{descripcion}</p>}
                </div>
                <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-white text-xl`}>
                    {icono}
                </div>
            </div>
        </div>
    )
}

function TabButton({ active, onClick, icon, label }) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${active
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
        >
            <span>{icon}</span>
            <span>{label}</span>
        </button>
    )
}

function SummaryCard({ label, value, icon, color }) {
    const colors = {
        blue: 'bg-blue-50 border-blue-200',
        yellow: 'bg-yellow-50 border-yellow-200',
        green: 'bg-green-50 border-green-200',
        purple: 'bg-purple-50 border-purple-200',
        orange: 'bg-orange-50 border-orange-200',
    }

    return (
        <div className={`rounded-lg p-3 text-center ${colors[color]}`}>
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-xl font-bold">{value}</div>
            <div className="text-xs text-gray-600">{label}</div>
        </div>
    )
}

function MetricCard({ label, value, total, icon, color }) {
    const colors = {
        green: 'text-green-600',
        red: 'text-red-600',
        blue: 'text-blue-600',
        yellow: 'text-yellow-600',
    }

    return (
        <div className="text-center">
            <div className={`text-2xl font-bold ${colors[color]}`}>
                {icon && <span className="mr-1">{icon}</span>}
                {value}
                {total && <span className="text-sm text-gray-500">/{total}</span>}
            </div>
            <div className="text-sm text-gray-600">{label}</div>
        </div>
    )
}

function CursoCard({ curso, onClick }) {
    const tipoColors = {
        teoria: 'bg-blue-100 text-blue-700',
        laboratorio: 'bg-purple-100 text-purple-700',
        taller: 'bg-orange-100 text-orange-700',
        practica: 'bg-green-100 text-green-700',
    }

    return (
        <div
            onClick={onClick}
            className="border border-gray-200 rounded-lg p-3 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
        >
            <div className="flex justify-between items-start mb-2">
                <span className="font-mono text-xs text-gray-500">{curso.codigo}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${tipoColors[curso.tipo] || 'bg-gray-100'}`}>
                    {curso.tipo}
                </span>
            </div>
            <h4 className="font-semibold text-gray-800 text-sm mb-2 line-clamp-2">{curso.nombre}</h4>
            <div className="flex justify-between text-xs text-gray-500">
                <span>⭐ {curso.creditos} créditos</span>
                <span>📖 Semestre {curso.semestre}</span>
            </div>
        </div>
    )
}