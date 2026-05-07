// D:\TALLER 2\optiacademic\frontend\src\components\SelectorHorarioProfesional.jsx
import { useState, useEffect } from 'react'
import { Calendar, Clock, Users, BookOpen, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, Star, TrendingUp, Award, Sun, Moon, Cloud } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

import api from '../api'

// const API_URL = 'http://localhost:8000/api/v1' // Se usará axios instance

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const TURNOS = [
    { id: 'mañana', label: '🌅 Mañana', horas: '07:00 - 13:30', color: 'bg-yellow-100 text-yellow-700' },
    { id: 'tarde', label: '☀️ Tarde', horas: '14:00 - 18:50', color: 'bg-orange-100 text-orange-700' },
    { id: 'noche', label: '🌙 Noche', horas: '19:00 - 22:10', color: 'bg-blue-100 text-blue-700' }
]

const COLORS = [
    'bg-blue-100 border-blue-500 text-blue-800',
    'bg-green-100 border-green-500 text-green-800',
    'bg-purple-100 border-purple-500 text-purple-800',
    'bg-pink-100 border-pink-500 text-pink-800',
    'bg-indigo-100 border-indigo-500 text-indigo-800',
    'bg-teal-100 border-teal-500 text-teal-800',
    'bg-rose-100 border-rose-500 text-rose-800',
    'bg-amber-100 border-amber-500 text-amber-800',
]

export default function SelectorHorarioProfesional({ user }) {
    const [semestres, setSemestres] = useState([])
    const [semestreSeleccionado, setSemestreSeleccionado] = useState(null)
    const [soluciones, setSoluciones] = useState([])
    const [solucionSeleccionada, setSolucionSeleccionada] = useState(null)
    const [cargando, setCargando] = useState(false)
    const [turnoPreferido, setTurnoPreferido] = useState(null)
    const [numSoluciones, setNumSoluciones] = useState(5)
    const [mostrarComparacion, setMostrarComparacion] = useState(false)

    useEffect(() => {
        cargarSemestres()
    }, [])

    const cargarSemestres = async () => {
        try {
            const res = await api.get('/cursos')
            const cursos = res.data
            const semestresUnicos = [...new Set(cursos.map(c => c.semestre))].sort()
            setSemestres(semestresUnicos)
            if (semestresUnicos.length > 0) {
                setSemestreSeleccionado(semestresUnicos[0])
            }
        } catch (error) {
            toast.error('Error al cargar semestres')
        }
    }

    const generarHorarios = async () => {
        if (!semestreSeleccionado) {
            toast.error('Selecciona un semestre')
            return
        }

        setCargando(true)
        setSoluciones([])
        setSolucionSeleccionada(null)

        try {
            const res = await api.post('/generar-horarios-avanzado', {
                semestre: semestreSeleccionado,
                num_soluciones: numSoluciones,
                turno_preferido: turnoPreferido
            })

            const data = res.data

            setSoluciones(data.soluciones || [])
            if (data.mejor_solucion) {
                setSolucionSeleccionada(data.mejor_solucion)
            }
            toast.success(`${data.total_soluciones} opciones de horario generadas`)
        } catch (error) {
            toast.error(error.message)
        } finally {
            setCargando(false)
        }
    }

    // --- NUEVA FUNCIÓN DE MATRÍCULA (2 PASOS) ---
    const handleMatricular = async (solucion) => {
        setCargando(true)
        try {
            const resGuardar = await api.post('/guardar-solucion-horario', {
                semestre: semestreSeleccionado,
                horario_generado: solucion.horario_generado
            })

            let idsReales = resGuardar.data.horario_ids

            console.log('IDs originales:', idsReales)

            // 🔥 Obtener los horarios de cada ID
            const horariosRes = await api.get('/horarios-disponibles')
            const todosHorarios = horariosRes.data

            // Crear mapa de horario -> ID (solo uno por horario)
            const horarioUnico = new Map()

            for (const id of idsReales) {
                const horario = todosHorarios.find(h => h.id === id)
                if (horario && !horarioUnico.has(horario.franja)) {
                    horarioUnico.set(horario.franja, id)
                }
            }

            const idsSinCruces = Array.from(horarioUnico.values())
            console.log('IDs sin cruce de horario:', idsSinCruces)

            if (idsSinCruces.length === 0) {
                toast.error('No hay cursos con horarios disponibles')
                setCargando(false)
                return
            }

            const resMatricula = await api.post('/matricular', {
                horario_ids: idsSinCruces
            })

            toast.success(`✅ Matrícula exitosa! ${resMatricula.data.matriculas_realizadas} cursos inscritos`)

            setTimeout(() => {
                window.location.href = '/mi-horario'
            }, 1500)

        } catch (error) {
            console.error('Error:', error)
            toast.error(error.response?.data?.detail || error.message)
        } finally {
            setCargando(false)
        }
    }
    const getColorForCurso = (index) => {
        return COLORS[index % COLORS.length]
    }

    const renderHorarioTabla = (horario) => {
        const matriz = {}
        DIAS.forEach(dia => { matriz[dia] = {} })

        const franjas = [
            '07:00-08:30', '08:40-10:10', '10:20-11:50', '12:00-13:30',
            '14:00-15:30', '15:40-17:10', '17:20-18:50', '19:00-20:30', '20:40-22:10'
        ]

        franjas.forEach(f => { DIAS.forEach(dia => { matriz[dia][f] = null }) })

        horario.forEach((curso, idx) => {
            const dia = curso.dia
            const horaInicio = curso.franja_inicio
            const franjaKey = `${horaInicio}-${curso.franja_fin}`
            if (matriz[dia] && matriz[dia][franjaKey] !== undefined) {
                matriz[dia][franjaKey] = { ...curso, colorIndex: idx }
            }
        })

        return (
            <div className="overflow-x-auto">
                <table className="min-w-[1000px] border-collapse">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-2 border text-left text-sm font-medium">Hora</th>
                            {DIAS.map(dia => (
                                <th key={dia} className="p-2 border text-left text-sm font-medium min-w-[120px]">{dia}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {franjas.map(franja => (
                            <tr key={franja} className="border-b">
                                <td className="p-2 border text-xs font-medium bg-gray-50">{franja}</td>
                                {DIAS.map(dia => {
                                    const curso = matriz[dia]?.[franja]
                                    if (curso) {
                                        const color = getColorForCurso(curso.colorIndex)
                                        return (
                                            <td key={dia} className="p-1 border align-top">
                                                <div className={`p-1 rounded text-xs ${color.split(' ')[0]} border-l-4 ${color.split(' ')[1]}`}>
                                                    <div className="font-bold">{curso.curso_id}</div>
                                                    <div className="text-[10px] truncate">{curso.curso_nombre?.substring(0, 20)}</div>
                                                    <div className="text-[9px] text-gray-500">Aula: {curso.aula_id}</div>
                                                </div>
                                            </td>
                                        )
                                    }
                                    return <td key={dia} className="p-1 border bg-white/50"></td>
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    }

    const renderTarjetaHorario = (solucion, index) => {
        const stats = solucion.estadisticas
        const puntuacion = solucion.puntuacion || 0
        const esMejor = index === 0

        return (
            <div
                key={index}
                className={`border rounded-xl p-4 cursor-pointer transition-all ${solucionSeleccionada === solucion ? 'border-blue-500 bg-blue-50 shadow-md' : 'hover:shadow-md'}`}
                onClick={() => setSolucionSeleccionada(solucion)}
            >
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center flex-wrap gap-2">
                        <span className="font-bold text-lg">Opción {index + 1}</span>
                        {esMejor && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                                <Star size={12} /> Mejor opción
                            </span>
                        )}
                        {solucion.estrategia && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${solucion.estrategia === 'mañana' ? 'bg-yellow-100 text-yellow-700' :
                                solucion.estrategia === 'tarde' ? 'bg-orange-100 text-orange-700' :
                                    solucion.estrategia === 'noche' ? 'bg-blue-100 text-blue-700' :
                                        'bg-gray-100 text-gray-700'
                                }`}>
                                {solucion.estrategia === 'mañana' ? '🌅 Prioridad Mañana' :
                                    solucion.estrategia === 'tarde' ? '☀️ Prioridad Tarde' :
                                        solucion.estrategia === 'noche' ? '🌙 Prioridad Noche' :
                                            '⚖️ Balanceado'}
                            </span>
                        )}
                    </div>
                    <div className={`text-right px-3 py-1 rounded-full text-sm font-bold ${puntuacion >= 80 ? 'bg-green-100 text-green-700' : puntuacion >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                        {puntuacion}% calidad
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.total_asignados}</div>
                        <div className="text-xs text-gray-500">Cursos asignados</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.total_no_asignados}</div>
                        <div className="text-xs text-gray-500">Sin asignar</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">{Object.keys(stats.distribucion_dias || {}).filter(d => stats.distribucion_dias[d] > 0).length}</div>
                        <div className="text-xs text-gray-500">Días ocupados</div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                    {Object.entries(stats.distribucion_turnos || {}).map(([turno, count]) => {
                        if (count === 0) return null
                        const turnoInfo = TURNOS.find(t => t.id === turno)
                        return (
                            <span key={turno} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${turnoInfo?.color}`}>
                                {turno === 'mañana' ? <Sun size={10} /> : turno === 'tarde' ? <Cloud size={10} /> : <Moon size={10} />}
                                {turno}: {count} cursos
                            </span>
                        )
                    })}
                </div>

                <div className="flex justify-between items-center pt-2 border-t">
                    <div className="text-xs text-gray-500">
                        {Object.entries(stats.distribucion_dias || {}).map(([dia, count]) => count > 0 && `${dia}: ${count}`).filter(Boolean).join(' · ')}
                    </div>
                    {/* BOTÓN ACTUALIZADO EN TARJETA */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            handleMatricular(solucion)
                        }}
                        className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
                        disabled={cargando}
                    >
                        Matricular en esta opción
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
                <h1 className="text-2xl font-bold">Generador Inteligente de Horarios</h1>
                <p className="text-blue-100 mt-1">Genera múltiples opciones y elige la que mejor se adapte a ti</p>
            </div>

            {/* Panel de control */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Semestre</label>
                        <select
                            value={semestreSeleccionado || ''}
                            onChange={(e) => setSemestreSeleccionado(parseInt(e.target.value))}
                            className="w-full border rounded-lg px-3 py-2"
                        >
                            <option value="">Seleccionar semestre</option>
                            {semestres.map(s => (
                                <option key={s} value={s}>Semestre {s}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Turno preferido</label>
                        <select
                            value={turnoPreferido || ''}
                            onChange={(e) => setTurnoPreferido(e.target.value || null)}
                            className="w-full border rounded-lg px-3 py-2"
                        >
                            <option value="">Sin preferencia</option>
                            {TURNOS.map(t => (
                                <option key={t.id} value={t.id}>{t.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Opciones a generar</label>
                        <select
                            value={numSoluciones}
                            onChange={(e) => setNumSoluciones(parseInt(e.target.value))}
                            className="w-full border rounded-lg px-3 py-2"
                        >
                            <option value={3}>3 opciones</option>
                            <option value={5}>5 opciones</option>
                            <option value={10}>10 opciones</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={generarHorarios}
                            disabled={cargando || !semestreSeleccionado}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
                        >
                            {cargando ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Procesando...
                                </>
                            ) : (
                                <>🎲 Generar Horarios</>
                            )}
                        </button>
                    </div>
                </div>

                {turnoPreferido && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                        📌 Preferencia activa: Turno {TURNOS.find(t => t.id === turnoPreferido)?.label}
                    </div>
                )}
            </div>

            {/* Resultados */}
            {soluciones.length > 0 && (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">🎯 Opciones de Horario ({soluciones.length} disponibles)</h2>
                            <button
                                onClick={() => setMostrarComparacion(!mostrarComparacion)}
                                className="text-sm bg-gray-100 px-3 py-1 rounded-lg hover:bg-gray-200"
                            >
                                {mostrarComparacion ? '📋 Vista de tarjetas' : '📊 Comparar'}
                            </button>
                        </div>

                        {mostrarComparacion ? (
                            <div className="space-y-4">
                                {soluciones.map((sol, idx) => renderTarjetaHorario(sol, idx))}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {solucionSeleccionada && (
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex justify-between items-center mb-3">
                                            <h3 className="font-semibold text-gray-800">📊 Análisis de la opción seleccionada</h3>
                                            {solucionSeleccionada.estrategia && (
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${solucionSeleccionada.estrategia === 'mañana' ? 'bg-yellow-100 text-yellow-700' :
                                                    solucionSeleccionada.estrategia === 'tarde' ? 'bg-orange-100 text-orange-700' :
                                                        solucionSeleccionada.estrategia === 'noche' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {solucionSeleccionada.estrategia === 'mañana' ? '🌅 Prioridad Mañana' :
                                                        solucionSeleccionada.estrategia === 'tarde' ? '☀️ Prioridad Tarde' :
                                                            solucionSeleccionada.estrategia === 'noche' ? '🌙 Prioridad Noche' :
                                                                '⚖️ Balanceado'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-green-600">{solucionSeleccionada.estadisticas.total_asignados}</div>
                                                <div className="text-xs text-gray-500">Cursos asignados</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-blue-600">{solucionSeleccionada.puntuacion || 0}%</div>
                                                <div className="text-xs text-gray-500">Calidad</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-purple-600">{Object.keys(solucionSeleccionada.estadisticas.distribucion_dias || {}).filter(d => solucionSeleccionada.estadisticas.distribucion_dias[d] > 0).length}</div>
                                                <div className="text-xs text-gray-500">Días</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-orange-600">
                                                    {Object.entries(solucionSeleccionada.estadisticas.distribucion_turnos || {}).map(([t, c]) => c > 0 && `${t}:${c}`).filter(Boolean).join(' ')}
                                                </div>
                                                <div className="text-xs text-gray-500">Distribución turnos</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {solucionSeleccionada && renderHorarioTabla(solucionSeleccionada.horario_generado)}

                                {/* BOTÓN ACTUALIZADO EN VISTA PRINCIPAL */}
                                {solucionSeleccionada && (
                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => handleMatricular(solucionSeleccionada)}
                                            disabled={cargando}
                                            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {cargando ? (
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <CheckCircle size={20} />
                                            )}
                                            Matricular en esta opción
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {semestres.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                    <p className="text-yellow-800">No hay cursos disponibles. Contacta al administrador.</p>
                </div>
            )}
        </div>
    )
}