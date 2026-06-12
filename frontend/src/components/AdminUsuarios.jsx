// D:\TALLER 2\optiacademic\frontend\src\components\AdminUsuarios.jsx
import { useState, useEffect } from 'react'
import { Search, Edit, Trash2, UserPlus, Shield, Mail, Key } from 'lucide-react'
import toast from 'react-hot-toast' // Asegúrate de tener instalada la librería correspondiente

const API_URL = 'http://localhost:8000/api/v1'

export default function AdminUsuarios({ user }) {
    const [usuarios, setUsuarios] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editando, setEditando] = useState(null)
    const [formData, setFormData] = useState({
        email: '',
        nombre: '',
        apellido: '',
        rol: 'estudiante',
        password: ''
    })

    const token = localStorage.getItem('token')

    useEffect(() => {
        cargarUsuarios()
    }, [])

    const cargarUsuarios = async () => {
        try {
            const res = await fetch(`${API_URL}/admin/usuarios`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (!res.ok) {
                throw new Error(`Error ${res.status}: ${res.statusText}`)
            }

            const data = await res.json()
            // Asegurar que data es un array
            setUsuarios(Array.isArray(data) ? data : [])
            toast.success('Usuarios cargados correctamente')
        } catch (error) {
            console.error('Error:', error)
            setUsuarios([])  // Siempre array vacío en caso de error
            toast.error('Error al cargar usuarios: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const url = editando
                ? `${API_URL}/admin/usuarios/${editando.id}`
                : `${API_URL}/register`
            const method = editando ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                cargarUsuarios()
                setShowModal(false)
                setEditando(null)
                setFormData({ email: '', nombre: '', apellido: '', rol: 'estudiante', password: '' })
                toast.success(editando ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente')
            } else {
                const errorData = await res.json()
                toast.error(`Error: ${errorData.detail || 'No se pudo guardar el usuario'}`)
            }
        } catch (error) {
            console.error('Error:', error)
            toast.error('Error de conexión al guardar el usuario')
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar este usuario?')) {
            try {
                const res = await fetch(`${API_URL}/admin/usuarios/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                })

                if (res.ok) {
                    toast.success('Usuario eliminado exitosamente')
                    cargarUsuarios()
                } else {
                    throw new Error('No se pudo eliminar el usuario')
                }
            } catch (error) {
                console.error('Error:', error)
                toast.error(error.message)
            }
        }
    }

    const roles = [
        { value: 'admin', label: 'Administrador', color: 'bg-red-100 text-red-700' },
        { value: 'coordinador', label: 'Coordinador', color: 'bg-blue-100 text-blue-700' },
        { value: 'docente', label: 'Docente', color: 'bg-purple-100 text-purple-700' },
        { value: 'estudiante', label: 'Estudiante', color: 'bg-green-100 text-green-700' }
    ]

    const usuariosFiltrados = usuarios.filter(u =>
        u.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        u.apellido?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h2>
                    <p className="text-gray-500">Administra los usuarios del sistema</p>
                </div>
                <button
                    onClick={() => {
                        setEditando(null)
                        setFormData({ email: '', nombre: '', apellido: '', rol: 'estudiante', password: '' })
                        setShowModal(true)
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <UserPlus size={18} />
                    Nuevo Usuario
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Buscar por nombre, apellido o email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Tabla de usuarios */}
            {loading ? (
                <div className="text-center py-12">Cargando usuarios...</div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {usuariosFiltrados.map(u => (
                                <tr key={u.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="font-medium text-gray-900">{u.nombre} {u.apellido}</div>
                                            <div className="text-sm text-gray-500">ID: {u.id}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Mail size={14} className="text-gray-400" />
                                            <span>{u.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${roles.find(r => r.value === u.rol)?.color || 'bg-gray-100'
                                            }`}>
                                            {roles.find(r => r.value === u.rol)?.label || u.rol}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {u.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => {
                                                setEditando(u)
                                                setFormData({
                                                    email: u.email,
                                                    nombre: u.nombre,
                                                    apellido: u.apellido,
                                                    rol: u.rol,
                                                    password: ''
                                                })
                                                setShowModal(true)
                                            }}
                                            className="text-blue-600 hover:text-blue-800 mr-3"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(u.id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold mb-4">
                            {editando ? 'Editar Usuario' : 'Nuevo Usuario'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                <input
                                    type="text"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                                <input
                                    type="text"
                                    value={formData.apellido}
                                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                                <select
                                    value={formData.rol}
                                    onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2"
                                >
                                    {roles.map(r => (
                                        <option key={r.value} value={r.value}>{r.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {editando ? 'Nueva contraseña (opcional)' : 'Contraseña'}
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2"
                                    required={!editando}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    {editando ? 'Guardar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}