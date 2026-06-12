// D:\TALLER 2\optiacademic\frontend\src\components\Dashboard.jsx
import { useState, useEffect, useCallback } from 'react'
import HorarioUniversitario from './HorarioUniversitario'
import toast, { Toaster } from 'react-hot-toast'
import api from '../api'

// const API_URL = 'http://localhost:8000/api/v1'

// ─── Paleta y estilos globales ──────────────────────────────────────────────
const COLORS = {
    primary: '#1d4ed8',
    primaryLight: '#3b82f6',
    primaryDark: '#1e3a8a',
    success: '#059669',
    danger: '#dc2626',
    warning: '#d97706',
    purple: '#7c3aed',
    gray50: '#f8fafc',
    gray100: '#f1f5f9',
    gray200: '#e2e8f0',
    gray600: '#475569',
    gray800: '#1e293b',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const buildPayload = (cursosFiltrados, docentes, aulas) => ({
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
        minutos_por_hora: c.minutos_por_hora || 90,
    })),
    aulas: aulas.map(a => ({
        id: a.codigo,
        capacidad: a.capacidad,
        tipo: a.tipo,
        recursos: a.recursos || [],
    })),
    docentes: docentes.map(d => ({
        id: d.codigo,
        nombre: `${d.nombre} ${d.apellido}`,
        disponibilidad: d.disponibilidad || [],
    })),
})

// ─── Toast wrapper (usa react-hot-toast) ─────────────────────────────────────
const showToast = (message, type = 'success') => {
    if (type === 'success') toast.success(message)
    else toast.error(message)
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function Dashboard({ user }) {
    const [activeTab, setActiveTab] = useState('generar')
    const [cursos, setCursos] = useState([])
    const [docentes, setDocentes] = useState([])
    const [aulas, setAulas] = useState([])
    const [programas, setProgramas] = useState([])
    const [estadisticas, setEstadisticas] = useState(null)

    // Modo simple
    const [resultado, setResultado] = useState(null)

    // Modo múltiples soluciones
    const [soluciones, setSoluciones] = useState([])
    const [solucionSeleccionada, setSolucionSeleccionada] = useState(null)
    const [modoMultiple, setModoMultiple] = useState(false)

    const [errorMsg, setErrorMsg] = useState(null)
    const [filtroPrograma, setFiltroPrograma] = useState('')
    const [filtroSemestre, setFiltroSemestre] = useState('')
    const [busquedaCurso, setBusquedaCurso] = useState('')
    const [generando, setGenerando] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [modalCurso, setModalCurso] = useState(null)

    // ── Carga de datos ────────────────────────────────────────────────────────
    useEffect(() => {
        const cargar = async () => {
            try {
                const [c, d, a, p] = await Promise.all([
                    api.get('/cursos').then(r => r.data),
                    api.get('/docentes').then(r => r.data),
                    api.get('/aulas').then(r => r.data),
                    api.get('/programas').then(r => r.data),
                ])
                setCursos(Array.isArray(c) ? c : [])
                setDocentes(Array.isArray(d) ? d : [])
                setAulas(Array.isArray(a) ? a : [])
                setProgramas(Array.isArray(p) ? p : [])
            } catch (err) {
                console.error('Error cargando datos:', err)
            }
        }
        const cargarStats = async () => {
            try {
                const res = await api.get('/reportes/ocupacion')
                setEstadisticas(res.data)
            } catch (err) { console.error(err) }
        }
        cargar()
        cargarStats()
    }, [])

    // ── Filtros ───────────────────────────────────────────────────────────────
    const cursosFiltrados = cursos.filter(c => {
        if (filtroPrograma && c.programa_id !== parseInt(filtroPrograma)) return false
        if (filtroSemestre && c.semestre !== parseInt(filtroSemestre)) return false
        return true
    })

    const cursosBuscados = cursos.filter(c =>
        c.nombre?.toLowerCase().includes(busquedaCurso.toLowerCase()) ||
        c.codigo?.toLowerCase().includes(busquedaCurso.toLowerCase())
    )

    const semestres = [...new Set(cursos.map(c => c.semestre))].sort((a, b) => a - b)
    const totalCreditos = cursosFiltrados.reduce((s, c) => s + c.creditos, 0)
    const totalHorasTeoria = cursosFiltrados.reduce((s, c) => s + (c.horas_teoria || c.horas_semanales || 0), 0)
    const totalHorasLab = cursosFiltrados.reduce((s, c) => s + (c.horas_laboratorio || 0), 0)
    const totalHorasPrac = cursosFiltrados.reduce((s, c) => s + (c.horas_practica || 0), 0)

    const cursosPorSemestre = cursos.reduce((acc, c) => {
        if (!acc[c.semestre]) acc[c.semestre] = []
        acc[c.semestre].push(c)
        return acc
    }, {})

    // ── Generar horario simple ────────────────────────────────────────────────
    const generarHorario = async () => {
        if (cursosFiltrados.length === 0) {
            setErrorMsg('No hay cursos para generar horario con los filtros actuales')
            setTimeout(() => setErrorMsg(null), 3000)
            return
        }
        setGenerando(true)
        setErrorMsg(null)
        setResultado(null)
        setSoluciones([])
        setSolucionSeleccionada(null)

        try {
            const res = await api.post('/generar', buildPayload(cursosFiltrados, docentes, aulas))
            const data = res.data
            setResultado(data)
            showToast('Horario generado exitosamente')
        } catch (e) {
            const msg = e.response?.data?.detail || e.message
            setErrorMsg(msg)
            showToast(msg, 'error')
        } finally {
            setGenerando(false)
        }
    }

    // ── Generar múltiples horarios ────────────────────────────────────────────
    const generarMultiplesHorarios = async () => {
        if (cursosFiltrados.length === 0) {
            setErrorMsg('No hay cursos para generar horarios con los filtros actuales')
            setTimeout(() => setErrorMsg(null), 3000)
            return
        }
        setGenerando(true)
        setErrorMsg(null)
        setResultado(null)
        setSoluciones([])
        setSolucionSeleccionada(null)

        try {
            const res = await api.post('/generar', buildPayload(cursosFiltrados, docentes, aulas))
            const data = res.data
            const sols = data.soluciones || []
            setSoluciones(sols)
            const mejor = data.mejor_solucion || (sols.length > 0 ? sols[0] : null)
            setSolucionSeleccionada(mejor)
            showToast(`${sols.length} opciones de horario generadas`)
        } catch (e) {
            const msg = e.response?.data?.detail || e.message
            setErrorMsg(msg)
            showToast(msg, 'error')
        } finally {
            setGenerando(false)
        }
    }

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6">
            <Toaster position="top-right" />
            
            {/* ── Header ── */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Bienvenido, {user?.nombre} {user?.apellido}
                        </h1>
                        <p className="text-blue-100 text-sm mt-1">
                            Sistema de Planificación y Matrícula Universitaria
                        </p>
                    </div>
                    <span className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium capitalize">
                        {user?.rol}
                    </span>
                </div>
            </div>

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard titulo="Cursos" valor={cursos.length} icono="📚" color="bg-blue-500" descripcion={`${cursosFiltrados.length} en vista`} />
                <StatCard titulo="Docentes" valor={docentes.length} icono="👨‍🏫" color="bg-violet-500" descripcion="Activos" />
                <StatCard titulo="Aulas" valor={aulas.length} icono="🏫" color="bg-emerald-500" descripcion={`${aulas.filter(a => a.activa).length} disponibles`} />
                <StatCard titulo="Programas" valor={programas.length} icono="🎓" color="bg-amber-500" descripcion="Académicos" />
            </div>

            {/* ── Tabs ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <nav className="flex gap-1 p-2 border-b border-gray-100 bg-gray-50/60">
                    {[
                        { id: 'generar', icon: '⚡', label: 'Generar Horario' },
                        { id: 'cursos', icon: '📖', label: 'Cursos' },
                        { id: 'estadisticas', icon: '📊', label: 'Estadísticas' },
                        { id: 'configuracion', icon: '⚙️', label: 'Configuración' },
                    ].map(t => (
                        <TabButton key={t.id} active={activeTab === t.id} onClick={() => setActiveTab(t.id)} icon={t.icon} label={t.label} />
                    ))}
                </nav>

                <div className="p-6">

                    {/* ════════ TAB: GENERAR ════════ */}
                    {activeTab === 'generar' && (
                        <div className="space-y-6">

                            {/* Filtros */}
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                <h3 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide">🔍 Filtros</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Programa Académico</label>
                                        <select
                                            value={filtroPrograma}
                                            onChange={e => setFiltroPrograma(e.target.value)}
                                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                        >
                                            <option value="">Todos los programas</option>
                                            {programas.map(p => (
                                                <option key={p.id} value={p.id}>{p.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Semestre</label>
                                        <select
                                            value={filtroSemestre}
                                            onChange={e => setFiltroSemestre(e.target.value)}
                                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                        >
                                            <option value="">Todos los semestres</option>
                                            {semestres.map(s => (
                                                <option key={s} value={s}>Semestre {s}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Resumen selección */}
                            {cursosFiltrados.length > 0 && (
                                <div className="border border-slate-200 rounded-xl p-4 bg-white">
                                    <h3 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide">📋 Resumen de selección</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                        <SummaryCard label="Cursos" value={cursosFiltrados.length} icon="📖" color="blue" />
                                        <SummaryCard label="Créditos" value={totalCreditos} icon="⭐" color="yellow" />
                                        <SummaryCard label="Teoría" value={`${totalHorasTeoria}h`} icon="📝" color="green" />
                                        <SummaryCard label="Lab." value={`${totalHorasLab}h`} icon="💻" color="purple" />
                                        <SummaryCard label="Práctica" value={`${totalHorasPrac}h`} icon="🔧" color="orange" />
                                    </div>
                                </div>
                            )}

                            {/* Botones de generación */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                {/* Selector de modo */}
                                <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1 flex-shrink-0">
                                    <button
                                        onClick={() => setModoMultiple(false)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${!modoMultiple ? 'bg-white shadow text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        1 Horario
                                    </button>
                                    <button
                                        onClick={() => setModoMultiple(true)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${modoMultiple ? 'bg-white shadow text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        5 Opciones
                                    </button>
                                </div>

                                <button
                                    onClick={modoMultiple ? generarMultiplesHorarios : generarHorario}
                                    disabled={generando || cursosFiltrados.length === 0}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed
                                               text-white font-semibold py-2.5 px-6 rounded-xl transition-all duration-150 shadow-sm flex items-center justify-center gap-2"
                                >
                                    {generando ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                            </svg>
                                            Generando…
                                        </>
                                    ) : (
                                        <>⚡ {modoMultiple ? 'Generar 5 Opciones de Horario' : 'Generar Horario'}</>
                                    )}
                                </button>
                            </div>

                            {/* Error */}
                            {errorMsg && (
                                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-start gap-2">
                                    <span className="text-base flex-shrink-0">❌</span>
                                    {errorMsg}
                                </div>
                            )}

                            {/* ── Resultado: horario simple ── */}
                            {resultado && !modoMultiple && (
                                <div className="space-y-5">
                                    {/* Métricas */}
                                    <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-100 rounded-xl p-4">
                                        <h3 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide">📈 Métricas de Optimización</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <MetricCard label="Asignados" value={resultado.estadisticas?.total_asignados || 0} total={cursosFiltrados.length} color="green" />
                                            <MetricCard label="Sin Asignar" value={resultado.estadisticas?.total_no_asignados || 0} total={cursosFiltrados.length} color="red" />
                                            <MetricCard label="Tiempo" value={`${resultado.estadisticas?.tiempo_ms || 0} ms`} icon="⏱️" color="blue" />
                                            <MetricCard
                                                label="Eficiencia"
                                                value={resultado.estadisticas?.total_no_asignados === 0 ? '100%' : 'Parcial'}
                                                icon={resultado.estadisticas?.total_no_asignados === 0 ? '✅' : '⚠️'}
                                                color={resultado.estadisticas?.total_no_asignados === 0 ? 'green' : 'yellow'}
                                            />
                                        </div>
                                    </div>

                                    {/* Horario visual */}
                                    {resultado.horario_generado?.length > 0 && (
                                        <div>
                                            <div className="flex gap-2 mb-4">
                                                <button
                                                    onClick={async () => {
                                                        window.open(`${API_URL}/exportar/horario-pdf?periodo=2025-1`, '_blank')
                                                        showToast('Descargando PDF...')
                                                    }}
                                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                                >
                                                    📄 Exportar PDF
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        window.open(`${API_URL}/exportar/horario-excel?periodo=2025-1`, '_blank')
                                                        showToast('Descargando Excel...')
                                                    }}
                                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                                >
                                                    📊 Exportar Excel
                                                </button>
                                            </div>
                                            <HorarioUniversitario
                                                asignaciones={resultado.horario_generado}
                                                onCursoClick={curso => { setModalCurso(curso); setShowModal(true) }}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── Resultado: múltiples soluciones ── */}
                            {soluciones.length > 0 && modoMultiple && (
                                <div className="space-y-5">
                                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                                        <h3 className="font-bold text-lg text-slate-800 mb-4">
                                            🎯 Opciones de Horario
                                            <span className="ml-2 text-sm font-normal text-slate-500">({soluciones.length} disponibles)</span>
                                        </h3>

                                        {/* Tabs de soluciones */}
                                        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
                                            {soluciones.map((sol, idx) => {
                                                const puntuacion = sol.estadisticas?.puntuacion ?? 0
                                                const isBest = sol === (soluciones.reduce((best, s) =>
                                                    (s.estadisticas?.puntuacion ?? 0) > (best.estadisticas?.puntuacion ?? 0) ? s : best, soluciones[0]))
                                                return (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setSolucionSeleccionada(sol)}
                                                        className={`relative flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 border ${solucionSeleccionada === sol
                                                            ? 'bg-blue-600 text-white border-blue-600 shadow'
                                                            : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                                                            }`}
                                                    >
                                                        {isBest && (
                                                            <span className="absolute -top-2 -right-2 bg-amber-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">★</span>
                                                        )}
                                                        Opción {idx + 1}
                                                        <span className={`ml-2 text-xs ${solucionSeleccionada === sol ? 'text-blue-200' : 'text-slate-400'}`}>
                                                            {puntuacion}%
                                                        </span>
                                                    </button>
                                                )
                                            })}
                                        </div>

                                        {/* Detalle de solución seleccionada */}
                                        {solucionSeleccionada && (
                                            <>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                                                    <SolucionMetric
                                                        label="Asignados"
                                                        value={solucionSeleccionada.estadisticas?.total_asignados ?? '—'}
                                                        color="emerald"
                                                        icon="✅"
                                                    />
                                                    <SolucionMetric
                                                        label="Calidad"
                                                        value={`${solucionSeleccionada.estadisticas?.puntuacion ?? 0}%`}
                                                        color="amber"
                                                        icon="⭐"
                                                    />
                                                    <SolucionMetric
                                                        label="Tiempo"
                                                        value={`${solucionSeleccionada.estadisticas?.tiempo_ms ?? 0} ms`}
                                                        color="blue"
                                                        icon="⏱️"
                                                    />
                                                    <SolucionMetric
                                                        label="Sin asignar"
                                                        value={solucionSeleccionada.estadisticas?.total_no_asignados ?? '—'}
                                                        color="red"
                                                        icon="⚠️"
                                                    />
                                                </div>

                                                {/* Distribución por días */}
                                                {solucionSeleccionada.estadisticas?.distribucion_dias && (
                                                    <div className="mb-5 flex flex-wrap gap-2">
                                                        {Object.entries(solucionSeleccionada.estadisticas.distribucion_dias).map(([dia, count]) => (
                                                            <span key={dia} className="bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1 rounded-full">
                                                                📅 {dia}: {count} clases
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Horario visual */}
                                                {solucionSeleccionada.horario_generado?.length > 0 && (
                                                    <HorarioUniversitario
                                                        asignaciones={solucionSeleccionada.horario_generado}
                                                        onCursoClick={curso => { setModalCurso(curso); setShowModal(true) }}
                                                    />
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ════════ TAB: CURSOS ════════ */}
                    {activeTab === 'cursos' && (
                        <div className="space-y-5">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <h2 className="text-xl font-bold text-slate-800">📖 Catálogo de Cursos</h2>
                                <div className="relative w-full sm:w-auto">
                                    <input
                                        type="text"
                                        placeholder="Buscar por nombre o código…"
                                        value={busquedaCurso}
                                        onChange={e => setBusquedaCurso(e.target.value)}
                                        className="border border-slate-300 rounded-xl px-4 py-2 pl-9 text-sm focus:ring-2 focus:ring-blue-500 w-full sm:w-64 bg-white"
                                    />
                                    <span className="absolute left-3 top-2.5 text-slate-400 text-sm">🔍</span>
                                </div>
                            </div>

                            {Object.keys(
                                busquedaCurso
                                    ? cursosBuscados.reduce((acc, c) => { (acc[c.semestre] = acc[c.semestre] || []).push(c); return acc }, {})
                                    : cursosPorSemestre
                            ).sort((a, b) => a - b).map(semestre => {
                                const lista = busquedaCurso
                                    ? cursosBuscados.filter(c => c.semestre === parseInt(semestre))
                                    : cursosPorSemestre[semestre]
                                return (
                                    <div key={semestre} className="border border-slate-200 rounded-xl overflow-hidden">
                                        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center gap-2">
                                            <span className="font-semibold text-slate-700 text-sm">Semestre {semestre}</span>
                                            <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                                                {lista.length} cursos
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
                                            {lista.map(curso => (
                                                <CursoCard key={curso.id} curso={curso} onClick={() => { setModalCurso(curso); setShowModal(true) }} />
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}

                            {busquedaCurso && cursosBuscados.length === 0 && (
                                <div className="text-center py-12 text-slate-400">
                                    <div className="text-4xl mb-2">🔍</div>
                                    <p>No se encontraron cursos para "{busquedaCurso}"</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ════════ TAB: ESTADÍSTICAS ════════ */}
                    {activeTab === 'estadisticas' && (
                        <div className="space-y-5">
                            <h2 className="text-xl font-bold text-slate-800">📊 Estadísticas Institucionales</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <ChartCard titulo="Cursos por Semestre">
                                    {Object.keys(cursosPorSemestre).sort().map(sem => {
                                        const count = cursosPorSemestre[sem].length
                                        const pct = ((count / cursos.length) * 100).toFixed(1)
                                        return (
                                            <BarRow key={sem} label={`Semestre ${sem}`} value={count} pct={pct} color="bg-blue-500" />
                                        )
                                    })}
                                </ChartCard>

                                <ChartCard titulo="Tipos de Curso">
                                    {['teoria', 'laboratorio', 'taller', 'practica'].map(tipo => {
                                        const count = cursos.filter(c => c.tipo === tipo).length
                                        const pct = cursos.length ? ((count / cursos.length) * 100).toFixed(1) : 0
                                        return (
                                            <BarRow key={tipo} label={tipo.charAt(0).toUpperCase() + tipo.slice(1)} value={count} pct={pct} color="bg-violet-500" />
                                        )
                                    })}
                                </ChartCard>

                                <ChartCard titulo="Resumen General">
                                    {[
                                        { label: 'Total Cursos', value: cursos.length },
                                        { label: 'Total Docentes', value: docentes.length },
                                        { label: 'Total Aulas', value: aulas.length },
                                        { label: 'Créditos Totales', value: cursos.reduce((s, c) => s + c.creditos, 0) },
                                        { label: 'Aulas Activas', value: aulas.filter(a => a.activa).length },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0 text-sm">
                                            <span className="text-slate-600">{label}</span>
                                            <span className="font-bold text-slate-800">{value}</span>
                                        </div>
                                    ))}
                                </ChartCard>

                                {estadisticas && (
                                    <ChartCard titulo="Ocupación de Aulas">
                                        <div className="text-center py-4">
                                            <div className="text-4xl font-black text-blue-600">
                                                {estadisticas.porcentaje_ocupacion_general || 0}%
                                            </div>
                                            <p className="text-sm text-slate-500 mt-1 mb-4">Tasa de ocupación general</p>
                                            <div className="w-full bg-slate-200 rounded-full h-3">
                                                <div
                                                    className="bg-emerald-500 h-3 rounded-full transition-all duration-700"
                                                    style={{ width: `${estadisticas.porcentaje_ocupacion_general || 0}%` }}
                                                />
                                            </div>
                                        </div>
                                        {estadisticas.docentes_con_mas_cursos?.length > 0 && (
                                            <div className="mt-4">
                                                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Top Docentes</p>
                                                {estadisticas.docentes_con_mas_cursos.slice(0, 3).map(([nombre, count]) => (
                                                    <div key={nombre} className="flex justify-between text-sm py-1">
                                                        <span className="text-slate-600 truncate">{nombre}</span>
                                                        <span className="font-bold text-slate-800 ml-2">{count} cursos</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </ChartCard>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ════════ TAB: CONFIGURACIÓN ════════ */}
                    {activeTab === 'configuracion' && (
                        <div className="space-y-5">
                            <h2 className="text-xl font-bold text-slate-800">⚙️ Configuración del Sistema</h2>
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                                <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                                    <span>⚠️</span> En desarrollo
                                </h3>
                                <p className="text-sm text-amber-700 mb-3">Próximamente podrás ajustar:</p>
                                <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
                                    <li>Franjas horarias disponibles</li>
                                    <li>Días de clase y receso</li>
                                    <li>Límites de carga académica por docente</li>
                                    <li>Preferencias de asignación del motor CSP</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Modal detalles de curso ── */}
            {showModal && modalCurso && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="bg-white rounded-2xl max-w-md w-full mx-4 shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-5">
                                <h3 className="text-xl font-bold text-slate-900">Detalles del Curso</h3>
                                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
                            </div>

                            <div className="space-y-3">
                                <ModalField label="Código" value={modalCurso.codigo || modalCurso.curso_id} mono />
                                <ModalField label="Nombre" value={modalCurso.nombre || modalCurso.curso_nombre} bold />

                                <div className="grid grid-cols-2 gap-3">
                                    <ModalField label="Créditos" value={modalCurso.creditos ?? '—'} />
                                    <ModalField label="Semestre" value={modalCurso.semestre ?? '—'} />
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <ModalField label="Teoría" value={`${modalCurso.horas_teoria || modalCurso.horas_semanales || 0}h`} center />
                                    <ModalField label="Laboratorio" value={`${modalCurso.horas_laboratorio || 0}h`} center />
                                    <ModalField label="Práctica" value={`${modalCurso.horas_practica || 0}h`} center />
                                </div>

                                {modalCurso.docente_nombre && (
                                    <ModalField label="Docente" value={modalCurso.docente_nombre} />
                                )}
                                {modalCurso.aula_id && (
                                    <ModalField label="Aula" value={modalCurso.aula_id} mono />
                                )}
                                {modalCurso.franja && (
                                    <ModalField label="Franja" value={modalCurso.franja} />
                                )}
                            </div>

                            <button
                                onClick={() => setShowModal(false)}
                                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition"
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

// ─── Componentes auxiliares ──────────────────────────────────────────────────

function StatCard({ titulo, valor, icono, color, descripcion }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">{titulo}</p>
                    <p className="text-2xl font-black text-slate-800 mt-0.5">{valor}</p>
                    {descripcion && <p className="text-xs text-slate-400 mt-0.5">{descripcion}</p>}
                </div>
                <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center text-white text-xl shadow-sm`}>
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
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${active ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
                }`}
        >
            <span>{icon}</span><span>{label}</span>
        </button>
    )
}

function SummaryCard({ label, value, icon, color }) {
    const bg = {
        blue: 'bg-blue-50 border-blue-100',
        yellow: 'bg-amber-50 border-amber-100',
        green: 'bg-emerald-50 border-emerald-100',
        purple: 'bg-violet-50 border-violet-100',
        orange: 'bg-orange-50 border-orange-100',
    }
    return (
        <div className={`border rounded-xl p-3 text-center ${bg[color]}`}>
            <div className="text-xl mb-1">{icon}</div>
            <div className="text-lg font-black text-slate-800">{value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
        </div>
    )
}

function MetricCard({ label, value, total, icon, color }) {
    const cls = { green: 'text-emerald-600', red: 'text-red-500', blue: 'text-blue-600', yellow: 'text-amber-500' }
    return (
        <div className="text-center">
            <div className={`text-xl font-black ${cls[color]}`}>
                {icon && <span className="mr-1">{icon}</span>}
                {value}
                {total !== undefined && <span className="text-sm font-normal text-slate-400">/{total}</span>}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
        </div>
    )
}

function SolucionMetric({ label, value, color, icon }) {
    const bg = { emerald: 'bg-emerald-50', amber: 'bg-amber-50', blue: 'bg-blue-50', red: 'bg-red-50' }
    const txt = { emerald: 'text-emerald-700', amber: 'text-amber-700', blue: 'text-blue-700', red: 'text-red-600' }
    return (
        <div className={`${bg[color]} rounded-xl p-3 text-center`}>
            <div className="text-base mb-0.5">{icon}</div>
            <div className={`text-lg font-black ${txt[color]}`}>{value}</div>
            <div className="text-xs text-slate-500">{label}</div>
        </div>
    )
}

function ChartCard({ titulo, children }) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="font-semibold text-slate-700 mb-4 text-sm uppercase tracking-wide">{titulo}</h3>
            <div className="space-y-3">{children}</div>
        </div>
    )
}

function BarRow({ label, value, pct, color }) {
    return (
        <div>
            <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600">{label}</span>
                <span className="text-slate-500 font-medium">{value} ({pct}%)</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
                <div className={`${color} h-2 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    )
}

function CursoCard({ curso, onClick }) {
    const tipos = {
        teoria: 'bg-blue-100 text-blue-700',
        laboratorio: 'bg-violet-100 text-violet-700',
        taller: 'bg-orange-100 text-orange-700',
        practica: 'bg-emerald-100 text-emerald-700',
    }
    return (
        <div
            onClick={onClick}
            className="border border-slate-200 rounded-xl p-3.5 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
        >
            <div className="flex justify-between items-start mb-2">
                <span className="font-mono text-xs text-slate-400 group-hover:text-blue-500 transition-colors">{curso.codigo}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${tipos[curso.tipo] || 'bg-slate-100 text-slate-600'}`}>
                    {curso.tipo}
                </span>
            </div>
            <h4 className="font-semibold text-slate-800 text-sm mb-2 line-clamp-2">{curso.nombre}</h4>
            <div className="flex justify-between text-xs text-slate-400">
                <span>⭐ {curso.creditos} créditos</span>
                <span>Sem. {curso.semestre}</span>
            </div>
        </div>
    )
}

function ModalField({ label, value, mono, bold, center }) {
    return (
        <div className={`bg-slate-50 p-3 rounded-xl ${center ? 'text-center' : ''}`}>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-0.5">{label}</label>
            <p className={`text-slate-800 ${mono ? 'font-mono text-sm' : ''} ${bold ? 'font-semibold' : ''}`}>{value}</p>
        </div>
    )
}