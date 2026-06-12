// D:\TALLER 2\optiacademic\frontend\src\components\MisSolicitudes.jsx
import { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, Clock, XCircle, Send, RefreshCw, FileText } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

const API_URL = 'http://localhost:8000/api/v1'

export default function MisSolicitudes({ user }) {
    const [solicitudesRetiro, setSolicitudesRetiro] = useState([])
    const [solicitudesCambio, setSolicitudesCambio] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('retiros')
    const [showModal, setShowModal] = useState(false)
    const [modalType, setModalType] = useState('retiro')
    const [selectedMatricula, setSelectedMatricula] = useState(null)
    const [justificacion, setJustificacion] = useState('')
    const [horariosDisponibles, setHorariosDisponibles] = useState([])
    const [selectedHorarioId, setSelectedHorarioId] = useState(null)
    const [misMatriculas, setMisMatriculas] = useState([])

    const token = localStorage.getItem('token')
    const headers = { 'Authorization': `Bearer ${token}` }

    useEffect(() => {
        cargarDatos()
    }, [])

    const cargarDatos = async () => {
        setLoading(true)
        try {
            await Promise.all([
                cargarSolicitudesRetiro(),
                cargarSolicitudesCambio(),
                cargarMisMatriculas(),
                cargarHorariosDisponibles()
            ])
        } catch (error) {
            console.error('Error:', error)
            toast.error('Error al cargar datos')
        } finally {
            setLoading(false)
        }
    }

    const cargarSolicitudesRetiro = async () => {
        const res = await fetch(`${API_URL}/mis-solicitudes-retiro`, { headers })
        const data = await res.json()
        setSolicitudesRetiro(Array.isArray(data) ? data : [])
    }

    const cargarSolicitudesCambio = async () => {
        const res = await fetch(`${API_URL}/mis-solicitudes-cambio`, { headers })
        const data = await res.json()
        setSolicitudesCambio(Array.isArray(data) ? data : [])
    }

    const cargarMisMatriculas = async () => {
        const res = await fetch(`${API_URL}/mi-horario`, { headers })
        const data = await res.json()
        setMisMatriculas(data.horario || [])
    }

    const cargarHorariosDisponibles = async () => {
        const res = await fetch(`${API_URL}/horarios-disponibles`, { headers })
        const data = await res.json()
        setHorariosDisponibles(data || [])
    }

    const solicitarRetiro = async () => {
        if (!selectedMatricula || !justificacion.trim()) {
            toast.error('Debes ingresar una justificación')
            return
        }

        setLoading(true)
        try {
            const res = await fetch(`${API_URL}/solicitar-retiro?matricula_id=${selectedMatricula.matricula_id}&justificacion=${encodeURIComponent(justificacion)}`, {
                method: 'POST',
                headers
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.detail || 'Error al solicitar retiro')

            toast.success('Solicitud de retiro enviada correctamente')
            setShowModal(false)
            setJustificacion('')
            setSelectedMatricula(null)
            await cargarSolicitudesRetiro()
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const solicitarCambio = async () => {
        if (!selectedMatricula || !selectedHorarioId || !justificacion.trim()) {
            toast.error('Completa todos los campos')
            return
        }

        setLoading(true)
        try {
            const res = await fetch(`${API_URL}/solicitar-cambio?matricula_id=${selectedMatricula.matricula_id}&horario_deseado_id=${selectedHorarioId}&justificacion=${encodeURIComponent(justificacion)}`, {
                method: 'POST',
                headers
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.detail || 'Error al solicitar cambio')

            toast.success('Solicitud de cambio enviada correctamente')
            setShowModal(false)
            setJustificacion('')
            setSelectedMatricula(null)
            setSelectedHorarioId(null)
            await cargarSolicitudesCambio()
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const getEstadoBadge = (estado) => {
        switch (estado) {
            case 'pendiente':
                return <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs"><Clock size={12} /> Pendiente</span>
            case 'aprobado':
                return <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs"><CheckCircle size={12} /> Aprobado</span>
            case 'rechazado':
                return <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs"><XCircle size={12} /> Rechazado</span>
            default:
                return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{estado}</span>
        }
    }

    if (loading) {
        return <div className="flex justify-center items-center h-64"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
    }

    return (
        <div className="space-y-6">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
                <h1 className="text-2xl font-bold">Mis Solicitudes</h1>
                <p className="text-purple-100 mt-1">Solicitudes de retiro y cambio de cursos</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b">
                <button onClick={() => setActiveTab('retiros')} className={`px-4 py-2 text-sm font-medium border-b-2 transition ${activeTab === 'retiros' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500'}`}>
                    📋 Solicitudes de Retiro
                </button>
                <button onClick={() => setActiveTab('cambios')} className={`px-4 py-2 text-sm font-medium border-b-2 transition ${activeTab === 'cambios' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500'}`}>
                    🔄 Solicitudes de Cambio
                </button>
                <button onClick={() => setActiveTab('nueva')} className={`px-4 py-2 text-sm font-medium border-b-2 transition ${activeTab === 'nueva' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500'}`}>
                    ✨ Nueva Solicitud
                </button>
            </div>

            {/* Mis Cursos para solicitar */}
            {activeTab === 'nueva' && (
                <div className="space-y-4">
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h2 className="text-xl font-bold mb-4">Mis Cursos Matriculados</h2>
                        {misMatriculas.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No tienes cursos matriculados</p>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {misMatriculas.map((curso, idx) => (
                                    <div key={idx} className="border rounded-lg p-4 hover:shadow-md transition">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-semibold text-lg">{curso.curso_nombre}</div>
                                                <div className="text-sm text-gray-500">Código: {curso.curso_codigo}</div>
                                                <div className="text-sm text-gray-500">Horario: {curso.franja}</div>
                                                <div className="text-sm text-gray-500">Aula: {curso.aula} | Docente: {curso.docente}</div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setModalType('retiro')
                                                        setSelectedMatricula(curso)
                                                        setJustificacion('')
                                                        setShowModal(true)
                                                    }}
                                                    className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                                                >
                                                    Solicitar Retiro
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setModalType('cambio')
                                                        setSelectedMatricula(curso)
                                                        setJustificacion('')
                                                        setSelectedHorarioId(null)
                                                        setShowModal(true)
                                                    }}
                                                    className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                                                >
                                                    Solicitar Cambio
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Lista de solicitudes de retiro */}
            {activeTab === 'retiros' && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h2 className="text-xl font-bold mb-4">Mis Solicitudes de Retiro</h2>
                    {solicitudesRetiro.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No tienes solicitudes de retiro</p>
                    ) : (
                        <div className="space-y-4">
                            {solicitudesRetiro.map((sol, idx) => (
                                <div key={idx} className="border rounded-lg p-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="font-semibold">{sol.curso}</div>
                                            <div className="text-sm text-gray-500 mt-1">Justificación: {sol.justificacion}</div>
                                            <div className="text-xs text-gray-400 mt-1">Fecha: {new Date(sol.fecha_solicitud).toLocaleDateString()}</div>
                                        </div>
                                        <div>{getEstadoBadge(sol.estado)}</div>
                                    </div>
                                    {sol.motivo_rechazo && (
                                        <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-600">
                                            Motivo de rechazo: {sol.motivo_rechazo}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Lista de solicitudes de cambio */}
            {activeTab === 'cambios' && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h2 className="text-xl font-bold mb-4">Mis Solicitudes de Cambio</h2>
                    {solicitudesCambio.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No tienes solicitudes de cambio</p>
                    ) : (
                        <div className="space-y-4">
                            {solicitudesCambio.map((sol, idx) => (
                                <div key={idx} className="border rounded-lg p-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="font-semibold">Horario actual: {sol.horario_actual}</div>
                                            <div className="font-semibold text-blue-600">Horario deseado: {sol.horario_deseado}</div>
                                            <div className="text-sm text-gray-500 mt-1">Justificación: {sol.justificacion}</div>
                                            <div className="text-xs text-gray-400 mt-1">Fecha: {new Date(sol.fecha_solicitud).toLocaleDateString()}</div>
                                        </div>
                                        <div>{getEstadoBadge(sol.estado)}</div>
                                    </div>
                                    {sol.motivo_rechazo && (
                                        <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-600">
                                            Motivo de rechazo: {sol.motivo_rechazo}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Modal para nueva solicitud */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-xl max-w-md w-full p-6 mx-4" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-4">
                            {modalType === 'retiro' ? 'Solicitar Retiro' : 'Solicitar Cambio'}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Curso: <span className="font-semibold">{selectedMatricula?.curso_nombre}</span>
                        </p>

                        {modalType === 'cambio' && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Horario deseado
                                </label>
                                <select
                                    value={selectedHorarioId || ''}
                                    onChange={(e) => setSelectedHorarioId(parseInt(e.target.value))}
                                    className="w-full border rounded-lg px-3 py-2"
                                >
                                    <option value="">Selecciona un horario</option>
                                    {horariosDisponibles
                                        .filter(h => h.curso_id !== selectedMatricula?.id)
                                        .map(h => (
                                            <option key={h.id} value={h.id}>
                                                {h.curso_nombre} - {h.franja} (Cupos: {h.cupo_disponible})
                                            </option>
                                        ))}
                                </select>
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Justificación *
                            </label>
                            <textarea
                                value={justificacion}
                                onChange={(e) => setJustificacion(e.target.value)}
                                rows={4}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                placeholder="Explica el motivo de tu solicitud..."
                                required
                            />
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancelar</button>
                            <button
                                onClick={modalType === 'retiro' ? solicitarRetiro : solicitarCambio}
                                disabled={loading || !justificacion.trim() || (modalType === 'cambio' && !selectedHorarioId)}
                                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                            >
                                {loading ? 'Enviando...' : 'Enviar Solicitud'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}