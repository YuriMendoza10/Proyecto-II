import { useEffect, useMemo, useState } from 'react'
import {
    Edit,
    Loader2,
    Power,
    RefreshCcw,
    Save,
    Search,
    UserPlus,
    Users,
    X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import PaginationControls from '../../components/common/PaginationControls'
import { userService } from '../../services/userService'
import { extractList, getErrorMessage } from '../../utils/extractList'

const initialForm = {
    full_name: '',
    email: '',
    role: 'TEACHER',
    password: '',
    is_active: true,
}

const roleLabels = {
    ADMIN: 'Administrador',
    COORDINATOR: 'Coordinador',
    TEACHER: 'Docente',
    STUDENT: 'Estudiante',
}

const quickRoles = [
    {
        role: 'TEACHER',
        label: 'Nuevo docente',
        emailPrefix: 'docente',
        name: 'Nuevo Docente',
        password: 'docente123',
    },
    {
        role: 'STUDENT',
        label: 'Nuevo estudiante',
        emailPrefix: 'estudiante',
        name: 'Nuevo Estudiante',
        password: 'estudiante123',
    },
    {
        role: 'COORDINATOR',
        label: 'Nuevo coordinador',
        emailPrefix: 'coordinador',
        name: 'Nuevo Coordinador',
        password: 'coordinador123',
    },
]

export default function UsersPage() {
    const [users, setUsers] = useState([])
    const [form, setForm] = useState(initialForm)
    const [editingUser, setEditingUser] = useState(null)
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState('')
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(20)

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const matchesSearch =
                user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
                user.email?.toLowerCase().includes(search.toLowerCase())

            const matchesRole = roleFilter ? user.role === roleFilter : true

            return matchesSearch && matchesRole
        })
    }, [users, search, roleFilter])

    const loadUsers = async (nextPage = page, nextPageSize = pageSize) => {
        setLoading(true)

        try {
            const data = await userService.getUsers({ skip: (nextPage - 1) * nextPageSize, limit: nextPageSize })
            setUsers(extractList(data))
            setTotal(data.total || 0)
            setPage(nextPage)
            setPageSize(nextPageSize)
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudieron cargar los usuarios'))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadUsers()
    }, [])

    const handleChange = (name, value) => {
        setForm((current) => ({
            ...current,
            [name]: value,
        }))
    }

    const resetForm = () => {
        setForm(initialForm)
        setEditingUser(null)
    }

    const handleEdit = (user) => {
        setEditingUser(user)

        setForm({
            full_name: user.full_name || '',
            email: user.email || '',
            role: user.role || 'TEACHER',
            password: '',
            is_active: Boolean(user.is_active),
        })
    }

    const buildCreatePayload = () => ({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        role: form.role,
        password: form.password,
        is_active: Boolean(form.is_active),
    })

    const buildUpdatePayload = () => {
        const payload = {
            full_name: form.full_name.trim(),
            email: form.email.trim(),
            role: form.role,
            is_active: Boolean(form.is_active),
        }

        if (form.password.trim()) {
            payload.password = form.password
        }

        return payload
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setSaving(true)

        try {
            if (editingUser) {
                await userService.updateUser(editingUser.id, buildUpdatePayload())
                toast.success('Usuario actualizado correctamente')
            } else {
                await userService.createUser(buildCreatePayload())
                toast.success('Usuario creado correctamente')
            }

            resetForm()
            await loadUsers()
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudo guardar el usuario'))
        } finally {
            setSaving(false)
        }
    }

    const handleToggleActive = async (user) => {
        try {
            if (user.is_active) {
                await userService.deactivateUser(user.id)
                toast.success('Usuario desactivado')
            } else {
                await userService.activateUser(user.id)
                toast.success('Usuario activado')
            }

            await loadUsers()
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudo cambiar el estado'))
        }
    }

    const handleQuickRole = (template) => {
        const timestamp = Date.now().toString().slice(-5)

        setEditingUser(null)
        setForm({
            full_name: `${template.name} ${timestamp}`,
            email: `${template.emailPrefix}${timestamp}@optiacademic.com`,
            role: template.role,
            password: template.password,
            is_active: true,
        })
    }

    return (
        <div className="space-y-8">
            <Header
                title="Gestión de Usuarios"
                subtitle="Administra cuentas, roles y accesos del sistema."
                icon={<Users size={24} />}
                onRefresh={loadUsers}
                loading={loading}
            />

            <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6"
                >
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-xl font-bold text-slate-900">
                            {editingUser ? 'Editar usuario' : 'Nuevo usuario'}
                        </h2>

                        {editingUser && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="text-slate-500 hover:text-red-600"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>

                    {!editingUser && (
                        <div className="grid grid-cols-1 gap-2 mb-5">
                            {quickRoles.map((template) => (
                                <button
                                    key={template.role}
                                    type="button"
                                    onClick={() => handleQuickRole(template)}
                                    className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-left"
                                >
                                    <span className="font-semibold text-slate-700">
                                        {template.label}
                                    </span>
                                    <UserPlus size={18} className="text-blue-600" />
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="space-y-4">
                        <Input
                            label="Nombre completo"
                            value={form.full_name}
                            onChange={(value) => handleChange('full_name', value)}
                            placeholder="Carlos Ramírez Torres"
                        />

                        <Input
                            label="Correo"
                            type="email"
                            value={form.email}
                            onChange={(value) => handleChange('email', value)}
                            placeholder="usuario@optiacademic.com"
                        />

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Rol
                            </label>

                            <select
                                value={form.role}
                                onChange={(event) => handleChange('role', event.target.value)}
                                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="ADMIN">Administrador</option>
                                <option value="COORDINATOR">Coordinador</option>
                                <option value="TEACHER">Docente</option>
                                <option value="STUDENT">Estudiante</option>
                            </select>
                        </div>

                        <Input
                            label={editingUser ? 'Nueva contraseña opcional' : 'Contraseña'}
                            type="password"
                            value={form.password}
                            onChange={(value) => handleChange('password', value)}
                            placeholder={editingUser ? 'Dejar vacío para no cambiar' : '********'}
                            required={!editingUser}
                        />

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.is_active}
                                onChange={(event) =>
                                    handleChange('is_active', event.target.checked)
                                }
                                className="h-5 w-5"
                            />
                            <span className="text-sm font-semibold text-slate-700">
                                Usuario activo
                            </span>
                        </label>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
                        >
                            {saving ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <Save size={18} />
                            )}
                            {editingUser ? 'Actualizar usuario' : 'Crear usuario'}
                        </button>
                    </div>
                </form>

                <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 xl:col-span-2">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">
                                Usuarios registrados
                            </h2>
                            <p className="text-sm text-slate-500">
                                Mostrados: {filteredUsers.length} / {total}
                            </p>
                        </div>

                        <div className="flex flex-col md:flex-row gap-3">
                            <div className="relative">
                                <Search
                                    size={17}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />
                                <input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Buscar..."
                                    className="w-full md:w-64 pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <select
                                value={roleFilter}
                                onChange={(event) => setRoleFilter(event.target.value)}
                                className="border border-slate-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Todos los roles</option>
                                <option value="ADMIN">Admin</option>
                                <option value="COORDINATOR">Coordinador</option>
                                <option value="TEACHER">Docente</option>
                                <option value="STUDENT">Estudiante</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <LoadingState />
                    ) : (
                        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-100 text-slate-700">
                                    <tr>
                                        <th className="text-left px-4 py-3">ID</th>
                                        <th className="text-left px-4 py-3">Usuario</th>
                                        <th className="text-left px-4 py-3">Rol</th>
                                        <th className="text-left px-4 py-3">Estado</th>
                                        <th className="text-right px-4 py-3">Acciones</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="border-t border-slate-200">
                                            <td className="px-4 py-3 font-bold">{user.id}</td>

                                            <td className="px-4 py-3">
                                                <p className="font-semibold text-slate-900">
                                                    {user.full_name}
                                                </p>
                                                <p className="text-xs text-slate-500">{user.email}</p>
                                            </td>

                                            <td className="px-4 py-3">
                                                <RoleBadge role={user.role} />
                                            </td>

                                            <td className="px-4 py-3">
                                                <StatusBadge active={user.is_active} />
                                            </td>

                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    <IconButton onClick={() => handleEdit(user)}>
                                                        <Edit size={16} />
                                                    </IconButton>

                                                    <IconButton onClick={() => handleToggleActive(user)}>
                                                        <Power size={16} />
                                                    </IconButton>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}

                                    {filteredUsers.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan="5"
                                                className="px-4 py-10 text-center text-slate-500"
                                            >
                                                No hay usuarios para mostrar.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {!loading && users.length > 0 && <PaginationControls page={page} pageSize={pageSize} total={total} onPageChange={(nextPage) => loadUsers(nextPage)} onPageSizeChange={(nextSize) => loadUsers(1, nextSize)} />}
                </section>
            </section>
        </div>
    )
}

function Header({ title, subtitle, icon, onRefresh, loading }) {
    return (
        <section className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center">
                    {icon}
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
                    <p className="text-slate-600">{subtitle}</p>
                </div>
            </div>

            <button
                onClick={onRefresh}
                disabled={loading}
                className="bg-white border border-slate-200 px-4 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-slate-50"
            >
                <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
                Recargar
            </button>
        </section>
    )
}

function Input({
    label,
    value,
    onChange,
    type = 'text',
    placeholder = '',
    required = true,
}) {
    return (
        <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
                {label}
            </label>

            <input
                type={type}
                value={value}
                placeholder={placeholder}
                required={required}
                onChange={(event) => onChange(event.target.value)}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
    )
}

function RoleBadge({ role }) {
    const styles = {
        ADMIN: 'bg-red-100 text-red-700',
        COORDINATOR: 'bg-blue-100 text-blue-700',
        TEACHER: 'bg-violet-100 text-violet-700',
        STUDENT: 'bg-orange-100 text-orange-700',
    }

    return (
        <span
            className={[
                'px-3 py-1 rounded-full text-xs font-bold',
                styles[role] || 'bg-slate-100 text-slate-700',
            ].join(' ')}
        >
            {roleLabels[role] || role}
        </span>
    )
}

function StatusBadge({ active }) {
    return (
        <span
            className={[
                'px-3 py-1 rounded-full text-xs font-bold',
                active
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-red-100 text-red-700',
            ].join(' ')}
        >
            {active ? 'Activo' : 'Inactivo'}
        </span>
    )
}

function IconButton({ children, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="h-9 w-9 rounded-xl flex items-center justify-center border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
        >
            {children}
        </button>
    )
}

function LoadingState() {
    return (
        <div className="py-16 flex justify-center text-slate-500">
            <Loader2 className="animate-spin" />
        </div>
    )
}
