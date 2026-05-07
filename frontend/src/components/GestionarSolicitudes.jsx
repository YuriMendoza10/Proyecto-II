// D:\TALLER 2\optiacademic\frontend\src\components\GestionarSolicitudes.jsx
import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, Eye, RefreshCw } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

const API_URL = 'http://localhost:8000/api/v1'

export default function GestionarSolicitudes({ user }) {
    const [solicitudesRetiro, setSolicitudesRetiro] = useState([])
    const [solicitudesCambio, setSolicitudesCambio] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('retiros')
    const [showModal, setShowModal] = useState(false)
    const [selectedSolicitud, setSelectedSolicitud] = useState(null)
    const [motivoRechazo, setMotivoRechazo] = useState('')
    const [accion, setAccion] = useState('')

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
                cargarSolicitudesCambio()
            ])
        } catch (error) {
            toast.error('Error al cargar datos')
        } finally {
            setLoading(false)
        }
    }

    const cargarSolicitudesRetiro = async () => {
        const res = await fetch(`${API_URL}/solicitudes-retiro`, { headers })
        const data = await res.json()
        setSolicitudesRetiro(Array.isArray(data) ? data : [])
    }

    const cargarSolicitudesCambio = async () => {
        const res = await fetch(`${API_URL}/solicitudes-cambio`, { headers })
        const data = await res.json()
        setSolicitudesCambio(Array.isArray(data) ? data : [])
    }

    const resolverSolicitud = async () => {
        if (accion === 'rechazar' && !motivoRechazo.trim()) {
            toast.error('Debes ingresar un motivo de rechazo')
            return
        }

        setLoading(true)
        try {
            const endpoint = selectedSolicitud.tipo === 'retiro'
                ? `${API_URL}/solicitud-retiro/${selectedSolicitud.id}?accion=${accion}`
                : `${API_URL}/solicitud-cambio/${selectedSolicitud.id}?accion=${accion}`

            let body = {}
            if (accion === 'rechazar') {
                body = { motivo_rechazo: motivoRechazo }
            }

            const res = await fetch(endpoint, {
                method: 'PUT',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.detail || 'Error al procesar')

            toast.success(data.mensaje)
            setShowModal(false)
            setSelectedSolicitud(null)
            setMotivoRechazo('')
            await cargarDatos()
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

            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
                <h1 className="text-2xl font-bold">Gestión de Solicitudes</h1>
                <p className="text-blue-100 mt-1">Aprobar o rechazar solicitudes de estudiantes</p>
            </div>

            <div className="flex gap-2 border-b">
                <button onClick={() => setActiveTab('retiros')} className={`px-4 py-2 text-sm font-medium border-b-2 transition ${activeTab === 'retiros' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>
                    📋 Retiros ({solicitudesRetiro.filter(s => s.estado === 'pendiente').length})
                </button>
                <button onClick={() => setActiveTab('cambios')} className={`px-4 py-2 text-sm font-medium border-b-2 transition ${activeTab === 'cambios' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>
                    🔄 Cambios ({solicitudesCambio.filter(s => s.estado === 'pendiente').length})
                </button>
            </div>

            {activeTab === 'retiros' && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h2 className="text-xl font-bold mb-4">Solicitudes de Retiro</h2>
                    {solicitudesRetiro.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No hay solicitudes de retiro</p>
                    ) : (
                        <div className="space-y-4">
                            {solicitudesRetiro.map((sol, idx) => (
                                <div key={idx} className="border rounded-lg p-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="font-semibold">Estudiante: {sol.estudiante}</div>
                                            <div className="text-gray-600">Curso: {sol.curso}</div>
                                            <div className="text-sm text-gray-500">Horario: {sol.horario}</div>
                                            <div className="text-sm text-gray-500 mt-2">Justificación: {sol.justificacion}</div>
                                            <div className="text-xs text-gray-400 mt-1">Fecha: {new Date(sol.fecha_solicitud).toLocaleString()}</div>
                                        </div>
                                        <div className="text-right">
                                            <div>{getEstadoBadge(sol.estado)}</div>
                                            {sol.estado === 'pendiente' && (
                                                <div className="flex gap-2 mt-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedSolicitud({ ...sol, tipo: 'retiro' })
                                                            setAccion('aprobar')
                                                            setShowModal(true)
                                                        }}
                                                        className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                                                    >
                                                        Aprobar
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedSolicitud({ ...sol, tipo: 'retiro' })
                                                            setAccion('rechazar')
                                                            setShowModal(true)
                                                        }}
                                                        className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                                                    >
                                                        Rechazar
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'cambios' && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h2 className="text-xl font-bold mb-4">Solicitudes de Cambio</h2>
                    {solicitudesCambio.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No hay solicitudes de cambio</p>
                    ) : (
                        <div className="space-y-4">
                            {solicitudesCambio.map((sol, idx) => (
                                <div key={idx} className="border rounded-lg p-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="font-semibold">Estudiante: {sol.estudiante}</div>
                                            <div className="text-gray-600">Curso: {sol.curso}</div>
                                            <div className="text-sm text-gray-500">Horario actual: {sol.horario_actual}</div>
                                            <div className="text-sm text-blue-600">Horario deseado: {sol.horario_deseado}</div>
                                            <div className="text-sm text-gray-500 mt-2">Justificación: {sol.justificacion}</div>
                                            <div className="text-xs text-gray-400 mt-1">Fecha: {new Date(sol.fecha_solicitud).toLocaleString()}</div>
                                        </div>
                                        <div className="text-right">
                                            <div>{getEstadoBadge(sol.estado)}</div>
                                            {sol.estado === 'pendiente' && (
                                                <div className="flex gap-2 mt-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedSolicitud({ ...sol, tipo: 'cambio' })
                                                            setAccion('aprobar')
                                                            setShowModal(true)
                                                        }}
                                                        className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                                                    >
                                                        Aprobar
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedSolicitud({ ...sol, tipo: 'cambio' })
                                                            setAccion('rechazar')
                                                            setShowModal(true)
                                                        }}
                                                        className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                                                    >
                                                        Rechazar
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Modal de confirmación */}
            {showModal && selectedSolicitud && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-xl max-w-md w-full p-6 mx-4" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-4">
                            {accion === 'aprobar' ? 'Aprobar Solicitud' : 'Rechazar Solicitud'}
                        </h3>

                        {accion === 'rechazar' && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Motivo de rechazo *
                                </label>
                                <textarea
                                    value={motivoRechazo}
                                    onChange={(e) => setMotivoRechazo(e.target.value)}
                                    rows={3}
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                    placeholder="Explica el motivo del rechazo..."
                                />
                            </div>
                        )}

                        <p className="text-gray-600 mb-4">
                            ¿Estás seguro de que deseas {accion === 'aprobar' ? 'aprobar' : 'rechazar'} esta solicitud?
                        </p>

                        <div className="flex gap-3">
                            <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancelar</button>
                            <button onClick={resolverSolicitud} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}