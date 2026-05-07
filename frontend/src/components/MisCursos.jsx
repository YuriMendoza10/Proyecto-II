// D:\TALLER 2\optiacademic\frontend\src\components\MisCursos.jsx
import { useState, useEffect } from 'react'
import { Calendar, Clock, Users, BookOpen, CheckCircle, AlertCircle, XCircle, RefreshCw, FileText, Trash2 } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

const API_URL = 'http://localhost:8000/api/v1'

export default function MisCursos({ user }) {
    const [cursosMatriculados, setCursosMatriculados] = useState([])
    const [loading, setLoading] = useState(true)
    const [showRetiroModal, setShowRetiroModal] = useState(false)
    const [cursoSeleccionado, setCursoSeleccionado] = useState(null)
    const [justificacion, setJustificacion] = useState('')
    const [fechaInicio, setFechaInicio] = useState('')
    const [fechaLimite, setFechaLimite] = useState('')

    const token = localStorage.getItem('token')
    const headers = { 'Authorization': `Bearer ${token}` }

    useEffect(() => {
        cargarMisCursos()
        cargarFechas()
    }, [])

    const cargarMisCursos = async () => {
        try {
            const res = await fetch(`${API_URL}/mi-horario`, { headers })
            const data = await res.json()
            setCursosMatriculados(data.horario || [])
        } catch (error) {
            toast.error('Error al cargar tus cursos')
        } finally {
            setLoading(false)
        }
    }

    const cargarFechas = async () => {
        // Simular fechas del semestre
        const hoy = new Date()
        const inicio = new Date(hoy)
        inicio.setDate(hoy.getDate() - 5) // Inicio hace 5 días
        const limite = new Date(hoy)
        limite.setDate(hoy.getDate() + 10) // Límite en 10 días

        setFechaInicio(inicio.toLocaleDateString('es-PE'))
        setFechaLimite(limite.toLocaleDateString('es-PE'))
    }

    const puedeRetirar = () => {
        const hoy = new Date()
        const limite = new Date()
        limite.setDate(hoy.getDate() + 10)
        return hoy <= limite
    }

    const handleRetiro = async () => {
        if (!justificacion) {
            toast.error('Debes ingresar una justificación')
            return
        }

        setLoading(true)
        try {
            // Simular solicitud de retiro
            await new Promise(resolve => setTimeout(resolve, 1000))
            toast.success(`Solicitud de retiro enviada para ${cursoSeleccionado.curso_nombre}`)
            setShowRetiroModal(false)
            setJustificacion('')
            setCursoSeleccionado(null)
            await cargarMisCursos()
        } catch (error) {
            toast.error('Error al procesar el retiro')
        } finally {
            setLoading(false)
        }
    }

    const handleSolicitarCambio = async (curso) => {
        toast.loading('Enviando solicitud...')
        try {
            await new Promise(resolve => setTimeout(resolve, 1000))
            toast.dismiss()
            toast.success(`Solicitud de cambio para ${curso.curso_nombre} enviada al coordinador`)
        } catch (error) {
            toast.dismiss()
            toast.error('Error al enviar la solicitud')
        }
    }

    const getEstadoPlazo = () => {
        const hoy = new Date()
        const limite = new Date()
        limite.setDate(hoy.getDate() + 10)

        if (hoy > limite) {
            return { texto: 'Plazo vencido', color: 'text-red-600', bg: 'bg-red-100' }
        }
        const diasRestantes = Math.ceil((limite - hoy) / (1000 * 60 * 60 * 24))
        return { texto: `${diasRestantes} días restantes`, color: 'text-green-600', bg: 'bg-green-100' }
    }

    const plazo = getEstadoPlazo()
    const puede = puedeRetirar()

    if (loading) {
        return <div className="flex justify-center items-center h-64"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
    }

    return (
        <div className="space-y-6">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
                <h1 className="text-2xl font-bold">Mis Cursos Matriculados</h1>
                <p className="text-blue-100 mt-1">Semestre {new Date().getFullYear()}-1</p>
            </div>

            {/* Información de plazos */}
            <div className="bg-white rounded-xl shadow-sm border p-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="font-semibold text-gray-800">📅 Plazos para retiro de cursos</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Periodo de retiro: {fechaInicio} - {fechaLimite}
                        </p>
                    </div>
                    <div className={`${plazo.bg} ${plazo.color} px-4 py-2 rounded-lg font-medium`}>
                        {plazo.texto}
                    </div>
                </div>
            </div>

            {/* Lista de cursos */}
            <div className="space-y-4">
                {cursosMatriculados.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        No tienes cursos matriculados en este semestre
                    </div>
                ) : (
                    cursosMatriculados.map((curso, idx) => (
                        <div key={idx} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition p-5">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap mb-2">
                                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{curso.curso_codigo}</span>
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                            {curso.seccion || 'Sección A'}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-gray-800 text-lg">{curso.curso_nombre}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Clock size={16} className="text-gray-400" />
                                            <span>{curso.franja}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users size={16} className="text-gray-400" />
                                            <span>Aula: {curso.aula}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <BookOpen size={16} className="text-gray-400" />
                                            <span>Docente: {curso.docente}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {puede ? (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setCursoSeleccionado(curso)
                                                    setShowRetiroModal(true)
                                                }}
                                                className="px-4 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition flex items-center gap-2"
                                            >
                                                <Trash2 size={16} />
                                                Retirar curso
                                            </button>
                                            <button
                                                onClick={() => handleSolicitarCambio(curso)}
                                                className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition flex items-center gap-2"
                                            >
                                                <RefreshCw size={16} />
                                                Solicitar cambio
                                            </button>
                                        </>
                                    ) : (
                                        <div className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm flex items-center gap-2">
                                            <AlertCircle size={16} />
                                            Plazo vencido
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal de retiro */}
            {showRetiroModal && cursoSeleccionado && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowRetiroModal(false)}>
                    <div className="bg-white rounded-xl max-w-md w-full p-6 mx-4" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-4">Retirar curso</h3>
                        <p className="text-gray-600 mb-4">
                            ¿Estás seguro de que deseas retirarte de <strong>{cursoSeleccionado.curso_nombre}</strong>?
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Justificación (obligatoria)
                            </label>
                            <textarea
                                value={justificacion}
                                onChange={(e) => setJustificacion(e.target.value)}
                                rows={3}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                placeholder="Motivo del retiro..."
                            />
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setShowRetiroModal(false)} className="flex-1 px-4 py-2 border rounded-lg">
                                Cancelar
                            </button>
                            <button onClick={handleRetiro} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                                Confirmar retiro
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}