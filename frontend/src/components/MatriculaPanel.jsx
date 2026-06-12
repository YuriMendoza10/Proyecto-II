// D:\TALLER 2\optiacademic\frontend\src\components\MatriculaPanel.jsx
import HorarioSemanal from './HorarioSemanal'
import ResumenMatricula from './ResumenMatricula'
import { useState, useEffect, useMemo, useCallback } from 'react'
import {
    Clock, Users, BookOpen, CheckCircle, AlertCircle,
    Award, BarChart3, AlertTriangle, Zap
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const CONFIG = {
    CREDITOS_MIN: 7,
    CREDITOS_MAX: 25,
    SEMESTRE_ACTUAL: 3,
    CICLO_ACTUAL: '2025-1',
    HORAS_MAX_SEMANA: 30,
    PRERREQUISITOS: {
        'SIS201': ['SIS101'],
        'SIS202': ['SIS102'],
        'SIS301': ['SIS201'],
        'SIS303': ['SIS104'],
        'SIS304': ['SIS203'],
        'SIS305': ['SIS102'],
    }
}

const HORARIOS_SIMULADOS = {
    'SIS101': [{ dia: 'Lunes', hora: '07:30-09:00' }],
    'SIS102': [{ dia: 'Martes', hora: '09:10-10:40' }],
    'SIS103': [{ dia: 'Miércoles', hora: '10:50-12:20' }],
    'SIS104': [{ dia: 'Jueves', hora: '12:30-14:00' }],
    'SIS105': [{ dia: 'Viernes', hora: '14:10-15:40' }],
    'SIS201': [{ dia: 'Lunes', hora: '09:10-10:40' }],
    'SIS202': [{ dia: 'Martes', hora: '10:50-12:20' }],
    'SIS203': [{ dia: 'Miércoles', hora: '12:30-14:00' }],
    'SIS204': [{ dia: 'Jueves', hora: '14:10-15:40' }],
    'SIS301': [{ dia: 'Viernes', hora: '07:30-09:00' }],
}

export default function MatriculaPanel({ user, vistaInicial = 'oferta' }) {
    const navigate = useNavigate()

    const [cursos, setCursos] = useState([])
    const [cursosSeleccionados, setCursosSeleccionados] = useState([])
    const [cursosAprobados] = useState(['SIS101', 'SIS102', 'SIS103', 'SIS104'])
    const [miHorario, setMiHorario] = useState(null)
    const [loading, setLoading] = useState(true)
    const [vista, setVista] = useState(vistaInicial)
    const [filtroSemestre, setFiltroSemestre] = useState('')
    const [filtroTipo, setFiltroTipo] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [conflictosHorarios, setConflictosHorarios] = useState([])
    const [recomendaciones, setRecomendaciones] = useState([])
    const [horariosDisponibles, setHorariosDisponibles] = useState([])
    const [ultimaMatricula, setUltimaMatricula] = useState(null)
    const [mostrarResumen, setMostrarResumen] = useState(false)

    // ── Carga de cursos ──────────────────────────────────────────────────────
    const cargarDatos = useCallback(async () => {
        try {
            const [resCursos, resHorarios] = await Promise.all([
                api.get('/cursos'),
                api.get('/horarios-disponibles')
            ])
            setCursos(Array.isArray(resCursos.data) ? resCursos.data : [])
            setHorariosDisponibles(Array.isArray(resHorarios.data) ? resHorarios.data : [])
        } catch {
            toast.error('Error al cargar datos')
        } finally {
            setLoading(false)
        }
    }, [])

    // ── Carga del horario personal ───────────────────────────────────────────
    // FIX PRINCIPAL: El API devuelve el array directamente, no dentro de data.horario
    const cargarMiHorario = useCallback(async () => {
        try {
            const res = await api.get('/mi-horario')
            const data = res.data

            // Detecta si el API devuelve el array directo o anidado en .horario
            const horarioArray = Array.isArray(data)
                ? data
                : Array.isArray(data?.horario)
                    ? data.horario
                    : []

            const totalCreditos = horarioArray.reduce((s, c) => s + (c.creditos ?? 0), 0)

            setMiHorario({
                estudiante: data?.estudiante ?? user?.nombre,
                email: data?.email ?? user?.email,
                periodo: data?.periodo ?? CONFIG.CICLO_ACTUAL,
                total_cursos: horarioArray.length,
                total_creditos: totalCreditos,
                horario: horarioArray,
            })
        } catch (error) {
            console.error('Error cargando mi horario:', error)
            setMiHorario({ horario: [], total_cursos: 0, total_creditos: 0 })
        }
    }, [user])

    // ── Efectos ──────────────────────────────────────────────────────────────
    useEffect(() => {
        cargarDatos()
        cargarMiHorario()
    }, [cargarDatos, cargarMiHorario])

    useEffect(() => {
        if (vista === 'mi-horario') cargarMiHorario()
    }, [vista, cargarMiHorario])

    // ── Prerrequisitos ───────────────────────────────────────────────────────
    const verificarPrerrequisitos = useCallback((curso) => {
        const reqs = CONFIG.PRERREQUISITOS[curso.codigo]
        if (!reqs) return { cumple: true, faltantes: [], mensaje: null }
        const faltantes = reqs.filter(pre => !cursosAprobados.includes(pre))
        return {
            cumple: faltantes.length === 0,
            faltantes,
            mensaje: faltantes.length > 0 ? `Falta aprobar: ${faltantes.join(', ')}` : null
        }
    }, [cursosAprobados])

    // ── Conflictos de horario ────────────────────────────────────────────────
    const calcularConflictos = useCallback((seleccionados) => {
        const conflictos = []
        const ocupados = new Map()

        seleccionados.forEach(curso => {
            const horario = horariosDisponibles.find(h => h.curso_id === curso.id)
            if (horario && horario.franja) {
                const key = horario.franja
                if (ocupados.has(key)) {
                    conflictos.push({ curso1: ocupados.get(key), curso2: curso.codigo, horario: key })
                } else {
                    ocupados.set(key, curso.codigo)
                }
            } else {
                const franjas = HORARIOS_SIMULADOS[curso.codigo] ?? [{ dia: 'Lunes', hora: '08:00-10:00' }]
                franjas.forEach(({ dia, hora }) => {
                    const key = `${dia}_${hora}`
                    if (ocupados.has(key)) {
                        conflictos.push({ curso1: ocupados.get(key), curso2: curso.codigo, horario: `${dia} ${hora}` })
                    } else {
                        ocupados.set(key, curso.codigo)
                    }
                })
            }
        })
        return conflictos
    }, [horariosDisponibles])

    // ── Recomendaciones ──────────────────────────────────────────────────────
    const calcularRecomendaciones = useCallback((seleccionados, todosLosCursos) => {
        const creditosActuales = seleccionados.reduce((s, c) => s + c.creditos, 0)
        if (creditosActuales >= CONFIG.CREDITOS_MIN) return []

        const creditosFaltantes = CONFIG.CREDITOS_MIN - creditosActuales
        const disponibles = todosLosCursos
            .filter(c => !seleccionados.find(s => s.id === c.id))
            .sort((a, b) => a.creditos - b.creditos)

        const recomendados = []
        for (const curso of disponibles) {
            if (curso.creditos <= creditosFaltantes && verificarPrerrequisitos(curso).cumple) {
                recomendados.push({ ...curso, razon: `Te faltan ${creditosFaltantes} créditos. Este curso aporta ${curso.creditos}.` })
                break
            }
        }
        return recomendados
    }, [verificarPrerrequisitos])

    useEffect(() => {
        setConflictosHorarios(calcularConflictos(cursosSeleccionados))
        setRecomendaciones(calcularRecomendaciones(cursosSeleccionados, cursos))
    }, [cursosSeleccionados, cursos, calcularConflictos, calcularRecomendaciones])

    // ── Carga académica ──────────────────────────────────────────────────────
    const cargaAcademica = useMemo(() => {
        const horasTotales = cursosSeleccionados.reduce((s, c) => s + (c.horas_semanales ?? 4), 0)
        const creditosTeoria = cursosSeleccionados.filter(c => c.tipo === 'teoria').reduce((s, c) => s + c.creditos, 0)
        const creditosLab = cursosSeleccionados.filter(c => c.tipo === 'laboratorio').reduce((s, c) => s + c.creditos, 0)
        const creditosTaller = cursosSeleccionados.filter(c => c.tipo === 'taller').reduce((s, c) => s + c.creditos, 0)
        const creditosPractica = cursosSeleccionados.filter(c => c.tipo === 'practica').reduce((s, c) => s + c.creditos, 0)

        let nivelCarga = 'media'; let colorCarga = 'text-yellow-600'
        if (horasTotales <= 15) { nivelCarga = 'liviana'; colorCarga = 'text-green-600' }
        else if (horasTotales >= 25) { nivelCarga = 'pesada'; colorCarga = 'text-red-600' }

        return { horasTotales, porcentajeCarga: (horasTotales / CONFIG.HORAS_MAX_SEMANA) * 100, creditosTeoria, creditosLab, creditosTaller, creditosPractica, nivelCarga, colorCarga }
    }, [cursosSeleccionados])

    const creditosSeleccionados = useMemo(
        () => cursosSeleccionados.reduce((s, c) => s + c.creditos, 0),
        [cursosSeleccionados]
    )

    // ── Cursos disponibles ───────────────────────────────────────────────────
    const cursosDisponibles = useMemo(() => {
        const matriculadosIds = miHorario?.horario?.map(h => h.curso_id ?? h.curso_codigo) ?? []
        let lista = cursos.filter(c =>
            !matriculadosIds.includes(c.codigo) &&
            c.semestre <= CONFIG.SEMESTRE_ACTUAL + 1
        )
        if (filtroSemestre) lista = lista.filter(c => c.semestre === parseInt(filtroSemestre))
        if (filtroTipo) lista = lista.filter(c => c.tipo === filtroTipo)
        if (searchTerm) lista = lista.filter(c =>
            c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.codigo.toLowerCase().includes(searchTerm.toLowerCase())
        )
        return lista
    }, [cursos, miHorario, filtroSemestre, filtroTipo, searchTerm])

    const semestres = useMemo(() => [...new Set(cursos.map(c => c.semestre))].sort(), [cursos])
    const creditosCursados = miHorario?.total_creditos ?? 0

    // ── Validación ───────────────────────────────────────────────────────────
    const validarSeleccion = () => {
        if (creditosSeleccionados < CONFIG.CREDITOS_MIN) {
            toast.error(`Debes seleccionar al menos ${CONFIG.CREDITOS_MIN} créditos (actual: ${creditosSeleccionados})`)
            return false
        }
        if (creditosSeleccionados > CONFIG.CREDITOS_MAX) {
            toast.error(`Máximo ${CONFIG.CREDITOS_MAX} créditos por semestre (actual: ${creditosSeleccionados})`)
            return false
        }
        if (conflictosHorarios.length > 0) {
            toast.error('Hay conflictos de horario entre los cursos seleccionados')
            return false
        }
        return true
    }

    // ── Acciones ─────────────────────────────────────────────────────────────
    const toggleCurso = (curso) => {
        const yaSeleccionado = cursosSeleccionados.find(c => c.id === curso.id)
        if (yaSeleccionado) {
            setCursosSeleccionados(prev => prev.filter(c => c.id !== curso.id))
            return
        }
        const pre = verificarPrerrequisitos(curso)
        if (!pre.cumple) {
            toast.error(`No cumples con los prerrequisitos: ${pre.mensaje}`)
            return
        }
        if (creditosSeleccionados + curso.creditos > CONFIG.CREDITOS_MAX) {
            toast.error(`No puedes superar ${CONFIG.CREDITOS_MAX} créditos`)
            return
        }
        setCursosSeleccionados(prev => [...prev, curso])
        toast.success(`${curso.nombre} agregado`)
    }

    const confirmarMatricula = async () => {
        if (!validarSeleccion()) return
        setLoading(true)
        try {
            const res = await api.post('/matricular', {
                horario_ids: cursosSeleccionados.map(c => c.id)
            })
            const data = res.data

            setUltimaMatricula({
                cursos: data.cursos || cursosSeleccionados,
                total_cursos: data.matriculas_realizadas,
                total_creditos: creditosSeleccionados,
                fecha: new Date().toLocaleString()
            })
            setMostrarResumen(true)
            toast.success(`¡Matrícula exitosa! ${data.matriculas_realizadas} cursos inscritos (${creditosSeleccionados} créditos)`)
            setCursosSeleccionados([])
            await cargarMiHorario()
            setVista('mi-horario')
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
            setShowConfirmModal(false)
        }
    }

    // ── Render ────────────────────────────────────────────────────────────────
    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
    )

    return (
        <div className="space-y-6">
            <Toaster position="top-right" />

            {/* Resumen de matrícula */}
            {mostrarResumen && ultimaMatricula && (
                <ResumenMatricula
                    matricula={ultimaMatricula}
                    onCerrar={() => { setMostrarResumen(false); setUltimaMatricula(null) }}
                    onVerHorario={() => { setMostrarResumen(false); navigate('/mi-horario') }}
                />
            )}

            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-6 text-white">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold">Matrícula {CONFIG.CICLO_ACTUAL}</h1>
                        <p className="text-green-100 mt-1">{user?.nombre} {user?.apellido}</p>
                        <p className="text-green-100 text-sm">Código: {user?.id ?? '20240001'}</p>
                    </div>
                    <div className="bg-white/20 rounded-lg px-4 py-2 text-center">
                        <div className="text-2xl font-bold">{creditosCursados}</div>
                        <div className="text-xs">Créditos cursados</div>
                    </div>
                </div>
                <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                        <span>Progreso académico</span>
                        <span>{creditosCursados} / 120 créditos</span>
                    </div>
                    <div className="w-full bg-white/30 rounded-full h-2">
                        <div className="bg-white h-2 rounded-full" style={{ width: `${Math.min((creditosCursados / 120) * 100, 100)}%` }} />
                    </div>
                </div>
            </div>

            {/* Stats rápidos */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className={`bg-white rounded-xl p-3 shadow-sm border ${creditosSeleccionados > 0 && (creditosSeleccionados < CONFIG.CREDITOS_MIN || creditosSeleccionados > CONFIG.CREDITOS_MAX) ? 'border-red-300 bg-red-50' : ''}`}>
                    <div className="flex items-center gap-2 text-blue-600"><BookOpen size={18} /> Créditos selec.</div>
                    <div className="text-2xl font-bold">{creditosSeleccionados}</div>
                    <div className="text-xs text-gray-500">Mín {CONFIG.CREDITOS_MIN} | Máx {CONFIG.CREDITOS_MAX}</div>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm border">
                    <div className="flex items-center gap-2 text-green-600"><CheckCircle size={18} /> Cursos selec.</div>
                    <div className="text-2xl font-bold">{cursosSeleccionados.length}</div>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm border">
                    <div className="flex items-center gap-2 text-purple-600"><Clock size={18} /> Horas/semana</div>
                    <div className="text-2xl font-bold">{cargaAcademica.horasTotales}h</div>
                    <div className="text-xs text-gray-500">Máx {CONFIG.HORAS_MAX_SEMANA}h</div>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm border">
                    <div className="flex items-center gap-2 text-orange-600"><AlertTriangle size={18} /> Conflictos</div>
                    <div className="text-2xl font-bold">{conflictosHorarios.length}</div>
                    <div className="text-xs text-gray-500">Horarios</div>
                </div>
            </div>

            {/* Dashboard carga académica */}
            {cursosSeleccionados.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border p-4">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><BarChart3 size={18} /> Dashboard de Carga Académica</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <div className="text-sm text-gray-600 mb-2">Distribución por tipo</div>
                            <div className="space-y-2">
                                {[
                                    { label: 'Teoría', val: cargaAcademica.creditosTeoria, color: 'bg-blue-600' },
                                    { label: 'Laboratorio', val: cargaAcademica.creditosLab, color: 'bg-purple-600' },
                                    { label: 'Taller', val: cargaAcademica.creditosTaller, color: 'bg-orange-600' },
                                    { label: 'Práctica', val: cargaAcademica.creditosPractica, color: 'bg-green-600' },
                                ].map(({ label, val, color }) => (
                                    <div key={label}>
                                        <div className="flex justify-between text-xs"><span>{label}</span><span>{val} créditos</span></div>
                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                            <div className={`${color} h-1.5 rounded-full`} style={{ width: creditosSeleccionados ? `${(val / creditosSeleccionados) * 100}%` : '0%' }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm text-gray-600 mb-2">Carga horaria semanal</div>
                            <div className={`text-3xl font-bold ${cargaAcademica.colorCarga}`}>{cargaAcademica.horasTotales}h</div>
                            <div className="text-xs text-gray-500">de {CONFIG.HORAS_MAX_SEMANA}h disponibles</div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                <div className={`h-2 rounded-full ${cargaAcademica.nivelCarga === 'liviana' ? 'bg-green-600' : cargaAcademica.nivelCarga === 'pesada' ? 'bg-red-600' : 'bg-yellow-600'}`} style={{ width: `${Math.min(cargaAcademica.porcentajeCarga, 100)}%` }} />
                            </div>
                            <div className={`mt-2 text-sm font-medium ${cargaAcademica.colorCarga}`}>Carga {cargaAcademica.nivelCarga}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Alertas */}
            {conflictosHorarios.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-red-700 mb-2"><AlertCircle size={18} /> Conflictos de horario</div>
                    <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                        {conflictosHorarios.map((c, i) => (
                            <li key={i}>{c.curso1} y {c.curso2} coinciden en {c.horario}</li>
                        ))}
                    </ul>
                </div>
            )}
            {recomendaciones.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-blue-700 mb-2"><Zap size={18} /> Recomendaciones</div>
                    {recomendaciones.map((rec, i) => (
                        <div key={i} className="text-sm text-blue-600">📌 {rec.nombre} — {rec.razon}</div>
                    ))}
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 border-b">
                {[
                    { id: 'oferta', label: '📚 Oferta Académica' },
                    { id: 'mi-horario', label: '📅 Mi Horario' },
                    { id: 'resumen', label: '📋 Resumen' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setVista(tab.id)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition ${vista === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── VISTA: OFERTA ─────────────────────────────────────────────── */}
            {vista === 'oferta' && (
                <div className="space-y-4">
                    <div className="bg-white rounded-xl shadow-sm border p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div>
                                <label className="text-xs font-medium text-gray-500">Semestre</label>
                                <select value={filtroSemestre} onChange={e => setFiltroSemestre(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                                    <option value="">Todos</option>
                                    {semestres.map(s => <option key={s} value={s}>Semestre {s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500">Tipo</label>
                                <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                                    <option value="">Todos</option>
                                    <option value="teoria">Teoría</option>
                                    <option value="laboratorio">Laboratorio</option>
                                    <option value="taller">Taller</option>
                                    <option value="practica">Práctica</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-xs font-medium text-gray-500">Buscar</label>
                                <input type="text" placeholder="Nombre o código..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 max-h-[500px] overflow-auto">
                        {cursosDisponibles.length === 0
                            ? <div className="text-center py-12 text-gray-400">No hay cursos disponibles</div>
                            : cursosDisponibles.map(curso => {
                                const seleccionado = !!cursosSeleccionados.find(c => c.id === curso.id)
                                const pre = verificarPrerrequisitos(curso)
                                const puedeAgregar = !seleccionado && pre.cumple && (creditosSeleccionados + curso.creditos <= CONFIG.CREDITOS_MAX)

                                return (
                                    <div key={curso.id} className={`bg-white rounded-xl border p-4 transition-all ${seleccionado ? 'border-blue-500 bg-blue-50' : !pre.cumple ? 'border-gray-200 bg-gray-50 opacity-70' : 'border-gray-200 hover:shadow-md'}`}>
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{curso.codigo}</span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${curso.tipo === 'teoria' ? 'bg-blue-100 text-blue-700' : curso.tipo === 'laboratorio' ? 'bg-purple-100 text-purple-700' : curso.tipo === 'taller' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>{curso.tipo}</span>
                                                    <span className="text-xs text-gray-500">Semestre {curso.semestre}</span>
                                                    {!pre.cumple && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full flex items-center gap-1"><AlertTriangle size={12} />Prerrequisitos</span>}
                                                </div>
                                                <h3 className="font-semibold text-gray-800 mt-1">{curso.nombre}</h3>
                                                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1"><Award size={14} /> {curso.creditos} créditos</span>
                                                    <span className="flex items-center gap-1"><Clock size={14} /> {curso.horas_semanales}h/sem</span>
                                                    <span className="flex items-center gap-1"><Users size={14} /> {curso.max_estudiantes} cupos</span>
                                                </div>
                                                {!pre.cumple && <div className="mt-2 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} />{pre.mensaje}</div>}
                                            </div>
                                            <button
                                                onClick={() => toggleCurso(curso)}
                                                disabled={!puedeAgregar && !seleccionado}
                                                className={`ml-4 px-4 py-2 rounded-lg text-sm font-medium transition ${seleccionado ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'}`}
                                            >
                                                {seleccionado ? 'Quitar' : `Agregar (${curso.creditos} cr)`}
                                            </button>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>

                    {cursosSeleccionados.length > 0 && (
                        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-40">
                            <div className="max-w-7xl mx-auto flex justify-between items-center">
                                <div>
                                    <span className="font-semibold">{cursosSeleccionados.length} cursos</span>
                                    <span className="ml-3 text-sm text-gray-500">{creditosSeleccionados} / {CONFIG.CREDITOS_MAX} créditos</span>
                                    {creditosSeleccionados < CONFIG.CREDITOS_MIN && <span className="ml-3 text-xs text-red-500">⚠️ Mínimo {CONFIG.CREDITOS_MIN}</span>}
                                    {conflictosHorarios.length > 0 && <span className="ml-3 text-xs text-red-500">⚠️ {conflictosHorarios.length} conflicto(s)</span>}
                                </div>
                                <button
                                    onClick={() => setShowConfirmModal(true)}
                                    disabled={creditosSeleccionados < CONFIG.CREDITOS_MIN || creditosSeleccionados > CONFIG.CREDITOS_MAX || conflictosHorarios.length > 0}
                                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                                >
                                    Confirmar Matrícula
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── VISTA: MI HORARIO ─────────────────────────────────────────── */}
            {vista === 'mi-horario' && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Mi Horario</h2>
                            <p className="text-sm text-gray-500 mt-1">Consulta tus clases programadas</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={cargarMiHorario}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                            >
                                🔄 Recargar
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        const res = await api.get('/exportar/mi-horario-pdf', { responseType: 'blob' })
                                        const url = window.URL.createObjectURL(new Blob([res.data]))
                                        const link = document.createElement('a')
                                        link.href = url
                                        link.setAttribute('download', 'mi_horario.pdf')
                                        document.body.appendChild(link)
                                        link.click()
                                        link.parentNode.removeChild(link)
                                    } catch {
                                        toast.error('Error al exportar PDF')
                                    }
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                            >
                                📄 Exportar PDF
                            </button>
                        </div>
                    </div>

                    {!miHorario ? (
                        <div className="text-center py-16 text-gray-500">Cargando horario...</div>
                    ) : miHorario.total_cursos === 0 ? (
                        <div className="text-center py-16">
                            <div className="text-7xl mb-4">📅</div>
                            <p className="text-gray-500 text-lg">No tienes cursos matriculados actualmente.</p>
                            <button onClick={() => setVista('oferta')} className="mt-4 text-blue-600 hover:text-blue-700 font-medium">
                                Ir a Oferta Académica →
                            </button>
                        </div>
                    ) : (
                        <HorarioSemanal
                            horario={miHorario.horario}
                            onCursoClick={(curso) => console.log('Curso clickeado:', curso)}
                        />
                    )}

                    {miHorario?.total_cursos > 0 && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg flex flex-wrap justify-between items-center gap-4">
                            <div>
                                <span className="text-sm text-gray-500">Total de cursos</span>
                                <span className="ml-2 text-xl font-bold text-blue-600">{miHorario.total_cursos}</span>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500">Total de créditos</span>
                                <span className="ml-2 text-xl font-bold text-green-600">{miHorario.total_creditos}</span>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500">Carga horaria semanal</span>
                                <span className="ml-2 text-xl font-bold text-purple-600">
                                    {miHorario.horario?.reduce((sum, c) => sum + (c.horas_semanales ?? 3), 0) || 0}h
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── VISTA: RESUMEN ────────────────────────────────────────────── */}
            {vista === 'resumen' && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h2 className="text-xl font-bold mb-4">Resumen de Matrícula</h2>
                    {cursosSeleccionados.length === 0
                        ? <div className="text-center py-12 text-gray-400">No hay cursos seleccionados</div>
                        : (
                            <>
                                <div className="space-y-3 mb-6">
                                    {cursosSeleccionados.map(curso => (
                                        <div key={curso.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <span className="font-mono text-xs text-gray-500">{curso.codigo}</span>
                                                <div className="font-medium">{curso.nombre}</div>
                                                <div className="text-xs text-gray-500">{curso.tipo} • {curso.horas_semanales}h/sem</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold">{curso.creditos} créditos</div>
                                                <button onClick={() => toggleCurso(curso)} className="text-xs text-red-500 mt-1 hover:text-red-700">Quitar</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t pt-4 flex justify-between items-center">
                                    <div>
                                        <div className="text-sm text-gray-500">Total cursos</div>
                                        <div className="text-2xl font-bold">{cursosSeleccionados.length}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500">Total créditos</div>
                                        <div className="text-2xl font-bold text-blue-600">{creditosSeleccionados}</div>
                                        <div className="text-xs text-gray-400">Mín {CONFIG.CREDITOS_MIN} | Máx {CONFIG.CREDITOS_MAX}</div>
                                    </div>
                                    <button
                                        onClick={() => setShowConfirmModal(true)}
                                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                                        disabled={creditosSeleccionados < CONFIG.CREDITOS_MIN || conflictosHorarios.length > 0}
                                    >
                                        Confirmar
                                    </button>
                                </div>
                            </>
                        )
                    }
                </div>
            )}

            {/* Modal de confirmación */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowConfirmModal(false)}>
                    <div className="bg-white rounded-xl max-w-md w-full p-6 mx-4" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-4">Confirmar Matrícula</h3>
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between py-2 border-b"><span>Cursos:</span><span className="font-bold">{cursosSeleccionados.length}</span></div>
                            <div className="flex justify-between py-2 border-b"><span>Créditos:</span><span className="font-bold text-blue-600">{creditosSeleccionados}</span></div>
                            <div className="flex justify-between py-2 border-b"><span>Horas semanales:</span><span className="font-bold">{cargaAcademica.horasTotales}h</span></div>
                            {conflictosHorarios.length > 0 && <div className="text-red-500 text-sm">⚠️ Hay {conflictosHorarios.length} conflicto(s) de horario</div>}
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setShowConfirmModal(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancelar</button>
                            <button
                                onClick={confirmarMatricula}
                                disabled={conflictosHorarios.length > 0 || loading}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                                {loading ? 'Matriculando...' : 'Confirmar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {cursosSeleccionados.length > 0 && <div className="h-20" />}
        </div>
    )
}