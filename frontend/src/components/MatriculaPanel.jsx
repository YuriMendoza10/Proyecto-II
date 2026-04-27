// D:\TALLER 2\optiacademic\frontend\src\components\MatriculaPanel.jsx
import { useState, useEffect } from 'react'
import HorarioUniversitario from './HorarioUniversitario'

const API_URL = 'http://localhost:8000/api/v1'

export default function MatriculaPanel({ user, vistaInicial = 'oferta' }) {
    const [horarios, setHorarios] = useState([])
    const [seleccionados, setSeleccionados] = useState([])
    const [miHorario, setMiHorario] = useState(null)
    const [loading, setLoading] = useState(false)
    const [mensaje, setMensaje] = useState(null)
    const [vista, setVista] = useState(vistaInicial) // Usar vistaInicial

    const token = localStorage.getItem('token')

    // Verificar token al inicio
    useEffect(() => {
        if (!token) {
            console.error('No hay token de autenticación')
            setMensaje({ tipo: 'error', text: 'Error de autenticación. Por favor, inicia sesión nuevamente.' })
        }
    }, [])

    // Cargar horarios disponibles
    useEffect(() => {
        if (vista === 'oferta') {
            cargarHorariosDisponibles()
        }
    }, [vista])

    const cargarHorariosDisponibles = async () => {
        if (!token) return

        try {
            const res = await fetch(`${API_URL}/horarios-disponibles?periodo=2025-1`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (res.status === 401) {
                setMensaje({ tipo: 'error', text: 'Sesión expirada. Por favor, inicia sesión nuevamente.' })
                return
            }

            const data = await res.json()
            setHorarios(data)
        } catch (error) {
            console.error('Error cargando horarios:', error)
            setMensaje({ tipo: 'error', text: 'Error al cargar los horarios disponibles' })
        }
    }

    // Cargar mi horario
    const cargarMiHorario = async () => {
        if (!token) return

        setLoading(true)
        try {
            const res = await fetch(`${API_URL}/mi-horario`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (res.status === 401) {
                setMensaje({ tipo: 'error', text: 'Sesión expirada. Por favor, inicia sesión nuevamente.' })
                return
            }

            const data = await res.json()

            // Transformar los datos al formato que espera HorarioUniversitario
            const horarioTransformado = {
                ...data,
                horario: data.horario?.map(h => {
                    const partes = h.franja?.split(' ') || []
                    const dia = partes[0] || 'Lunes'
                    const franjaHoraria = partes.slice(1).join(' ') || '07:30 - 09:00'

                    return {
                        ...h,
                        dia: dia,
                        franja_horaria: franjaHoraria,
                        curso_nombre: h.curso_nombre,
                        curso_id: h.curso_id,
                        aula: h.aula,
                        docente: h.docente,
                        nrc: h.curso_id
                    }
                }) || []
            }
            setMiHorario(horarioTransformado)
            setVista('mi-horario')
        } catch (error) {
            console.error('Error cargando mi horario:', error)
            setMensaje({ tipo: 'error', text: 'Error al cargar tu horario' })
        } finally {
            setLoading(false)
        }
    }

    const toggleSeleccion = (h) => {
        setMensaje(null)

        if (seleccionados.find(s => s.id === h.id)) {
            setSeleccionados(seleccionados.filter(s => s.id !== h.id))
            return
        }

        // Validar cruce de horario
        if (seleccionados.some(s => s.franja === h.franja)) {
            setMensaje({ tipo: 'error', text: `❌ Cruce de horario: ya seleccionaste ${h.franja}` })
            return
        }

        // Validar mismo curso
        if (seleccionados.some(s => s.curso_id === h.curso_id)) {
            setMensaje({ tipo: 'error', text: `❌ Ya seleccionaste este curso` })
            return
        }

        setSeleccionados([...seleccionados, h])
    }

    const confirmarMatricula = async () => {
        if (seleccionados.length === 0) return

        setLoading(true)
        setMensaje(null)

        try {
            const res = await fetch(`${API_URL}/matricular`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ horario_ids: seleccionados.map(s => s.id) })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.detail || 'Error en matrícula')
            }

            setMensaje({ tipo: 'success', text: `✅ ${data.mensaje}: ${data.matriculas_realizadas} cursos inscritos` })
            setSeleccionados([])

            // Recargar horarios
            await cargarHorariosDisponibles()

        } catch (e) {
            setMensaje({ tipo: 'error', text: `❌ ${e.message}` })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
                <button
                    onClick={() => setVista('oferta')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition ${vista === 'oferta'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    📚 Oferta Académica
                </button>
                <button
                    onClick={() => cargarMiHorario()}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition ${vista === 'mi-horario'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    📅 Mi Horario
                </button>
            </div>

            {/* Mensajes */}
            {mensaje && (
                <div className={`p-3 rounded-lg text-sm ${mensaje.tipo === 'error'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-green-50 text-green-700 border border-green-200'
                    }`}>
                    {mensaje.text}
                </div>
            )}

            {/* Vista de Oferta Académica */}
            {vista === 'oferta' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Oferta Académica 2025-1</h2>
                            <p className="text-gray-500 text-sm mt-1">
                                {horarios.length} cursos disponibles · Selecciona tus cursos
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">{seleccionados.length}</div>
                            <div className="text-xs text-gray-500">cursos seleccionados</div>
                        </div>
                    </div>

                    {/* Lista de horarios */}
                    <div className="space-y-3 max-h-96 overflow-auto">
                        {horarios.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                                No hay cursos disponibles para matrícula
                            </div>
                        ) : (
                            horarios.map(h => {
                                const seleccionado = seleccionados.find(s => s.id === h.id)
                                const cruce = seleccionados.some(s => s.franja === h.franja && s.id !== h.id)

                                return (
                                    <div
                                        key={h.id}
                                        onClick={() => toggleSeleccion(h)}
                                        className={`border rounded-lg p-4 cursor-pointer transition ${seleccionado
                                                ? 'border-blue-500 bg-blue-50'
                                                : cruce
                                                    ? 'border-red-200 bg-red-50 opacity-60'
                                                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="font-semibold text-gray-900">
                                                    {h.curso_nombre}
                                                </div>
                                                <div className="text-sm text-gray-500 mt-1">
                                                    🕐 {h.franja} · 🏫 Aula {h.aula_id} · Sección {h.seccion}
                                                </div>
                                                <div className="text-xs text-gray-400 mt-1">
                                                    👨‍🏫 Docente: {h.docente_nombre || 'Por asignar'}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-sm font-medium ${h.cupo_disponible > 5
                                                        ? 'text-green-600'
                                                        : h.cupo_disponible > 0
                                                            ? 'text-orange-600'
                                                            : 'text-red-600'
                                                    }`}>
                                                    {h.cupo_disponible} cupos
                                                </div>
                                                <div className="text-xs text-gray-400">{h.cupo_maximo} total</div>
                                            </div>
                                        </div>
                                        {seleccionado && (
                                            <div className="mt-2 text-xs font-medium text-blue-600">
                                                ✓ Seleccionado
                                            </div>
                                        )}
                                    </div>
                                )
                            })
                        )}
                    </div>

                    {seleccionados.length > 0 && (
                        <div className="mt-6 border-t pt-4">
                            <h4 className="font-medium text-gray-700 mb-3">Resumen de selección:</h4>
                            <div className="space-y-2 mb-4 max-h-48 overflow-auto">
                                {seleccionados.map(s => (
                                    <div key={s.id} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                                        <span>{s.curso_nombre}</span>
                                        <span className="text-gray-500">{s.franja}</span>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={confirmarMatricula}
                                disabled={loading}
                                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition"
                            >
                                {loading ? '⏳ Procesando matrícula...' : '✅ Confirmar Matrícula'}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Vista de Mi Horario */}
            {vista === 'mi-horario' && miHorario && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Horario de {miHorario.estudiante}
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">
                            Periodo {miHorario.periodo} · {miHorario.total_cursos} cursos matriculados
                        </p>
                    </div>

                    {miHorario.horario && miHorario.horario.length > 0 ? (
                        <HorarioUniversitario
                            asignaciones={miHorario.horario}
                            onCursoClick={(curso) => {
                                console.log('Curso seleccionado:', curso)
                            }}
                        />
                    ) : (
                        <div className="text-center py-12 text-gray-400">
                            <div className="text-6xl mb-4">📅</div>
                            <p>No tienes cursos matriculados.</p>
                            <p className="text-sm mt-2">Ve a "Oferta Académica" para inscribirte.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}