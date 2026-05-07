// D:\TALLER 2\optiacademic\frontend\src\components\AdminAulas.jsx
import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Users, Search } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

const API_URL = 'http://localhost:8000/api/v1'

export default function AdminAulas({ user }) {
    const [aulas, setAulas] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editando, setEditando] = useState(null)
    const [formData, setFormData] = useState({
        codigo: '',
        nombre: '',
        capacidad: 30,
        tipo: 'teoria',
        edificio: 'Principal',
        piso: 1
    })

    const token = localStorage.getItem('token')

    useEffect(() => {
        cargarAulas()
    }, [])

    const cargarAulas = async () => {
        try {
            const res = await fetch(`${API_URL}/aulas`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            setAulas(await res.json())
        } catch (error) {
            toast.error('Error al cargar aulas')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const url = editando ? `${API_URL}/aulas/${editando.id}` : `${API_URL}/aulas`
            const method = editando ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                toast.success(editando ? 'Aula actualizada' : 'Aula creada')
                cargarAulas()
                setShowModal(false)
                setEditando(null)
                setFormData({ codigo: '', nombre: '', capacidad: 30, tipo: 'teoria', edificio: 'Principal', piso: 1 })
            }
        } catch (error) {
            toast.error('Error al guardar')
        }
    }

    const aulasFiltradas = aulas.filter(a =>
        a.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        a.codigo?.toLowerCase().includes(search.toLowerCase())
    )

    const tipos = [
        { value: 'teoria', label: 'Teoría', color: 'bg-blue-100 text-blue-700' },
        { value: 'laboratorio', label: 'Laboratorio', color: 'bg-purple-100 text-purple-700' },
        { value: 'taller', label: 'Taller', color: 'bg-orange-100 text-orange-700' }
    ]

    return (
        <div className="space-y-6">
            <Toaster position="top-right" />

            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Gestión de Aulas</h2>
                    <p className="text-gray-500">Administra las aulas disponibles</p>
                </div>
                <button onClick={() => { setEditando(null); setShowModal(true) }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <Plus size={18} /> Nueva Aula
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" placeholder="Buscar aula..." value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg" />
            </div>

            {loading ? (
                <div className="text-center py-12">Cargando...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {aulasFiltradas.map(aula => (
                        <div key={aula.id} className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="font-mono text-sm text-gray-500">{aula.codigo}</span>
                                    <h3 className="font-bold text-lg">{aula.nombre}</h3>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${tipos.find(t => t.value === aula.tipo)?.color
                                    }`}>
                                    {tipos.find(t => t.value === aula.tipo)?.label}
                                </span>
                            </div>
                            <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1"><Users size={16} /> {aula.capacidad} personas</div>
                                <div>📍 {aula.edificio} - Piso {aula.piso}</div>
                            </div>
                            <div className="mt-4 flex justify-end gap-2 pt-3 border-t">
                                <button onClick={() => { setEditando(aula); setFormData(aula); setShowModal(true) }}
                                    className="text-blue-600"><Edit size={18} /></button>
                                <button className="text-red-600"><Trash2 size={18} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold mb-4">{editando ? 'Editar Aula' : 'Nueva Aula'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input type="text" placeholder="Código" value={formData.codigo}
                                onChange={e => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                                className="w-full border rounded-lg px-3 py-2" required />
                            <input type="text" placeholder="Nombre" value={formData.nombre}
                                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2" required />
                            <input type="number" placeholder="Capacidad" value={formData.capacidad}
                                onChange={e => setFormData({ ...formData, capacidad: parseInt(e.target.value) })}
                                className="w-full border rounded-lg px-3 py-2" required />
                            <select value={formData.tipo} onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2">
                                {tipos.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                            <input type="text" placeholder="Edificio" value={formData.edificio}
                                onChange={e => setFormData({ ...formData, edificio: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2" />
                            <input type="number" placeholder="Piso" value={formData.piso}
                                onChange={e => setFormData({ ...formData, piso: parseInt(e.target.value) })}
                                className="w-full border rounded-lg px-3 py-2" />
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}