import { useEffect, useState } from 'react'
import {
    Building2,
    Edit,
    Loader2,
    Power,
    RefreshCcw,
    Save,
    Trash2,
    X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import PaginationControls from '../../components/common/PaginationControls'
import { classroomService } from '../../services/classroomService'
import { extractList, getErrorMessage } from '../../utils/extractList'

const initialForm = {
    code: '',
    name: '',
    capacity: 40,
    classroom_type: 'THEORY',
    campus: 'Principal',
    building: 'Pabellón A',
    floor: '1',
    has_projector: true,
    has_computers: false,
    is_active: true,
}

export default function ClassroomsPage() {
    const [classrooms, setClassrooms] = useState([])
    const [form, setForm] = useState(initialForm)
    const [editingClassroom, setEditingClassroom] = useState(null)
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(20)

    const loadClassrooms = async (nextPage = page, nextPageSize = pageSize) => {
        setLoading(true)

        try {
            const data = await classroomService.getClassrooms({ skip: (nextPage - 1) * nextPageSize, limit: nextPageSize })
            setClassrooms(extractList(data))
            setTotal(data.total || 0)
            setPage(nextPage)
            setPageSize(nextPageSize)
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudieron cargar las aulas'))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadClassrooms()
    }, [])

    const handleChange = (name, value) => {
        setForm((current) => ({
            ...current,
            [name]: value,
        }))
    }

    const resetForm = () => {
        setForm(initialForm)
        setEditingClassroom(null)
    }

    const handleEdit = (classroom) => {
        setEditingClassroom(classroom)

        setForm({
            code: classroom.code || '',
            name: classroom.name || '',
            capacity: classroom.capacity || 40,
            classroom_type: classroom.classroom_type || 'THEORY',
            campus: classroom.campus || 'Principal',
            building: classroom.building || '',
            floor: classroom.floor || '',
            has_projector: Boolean(classroom.has_projector),
            has_computers: Boolean(classroom.has_computers),
            is_active: Boolean(classroom.is_active),
        })
    }

    const buildPayload = () => ({
        code: form.code.trim(),
        name: form.name.trim(),
        capacity: Number(form.capacity),
        classroom_type: form.classroom_type,
        campus: form.campus.trim(),
        building: form.building.trim(),
        floor: form.floor.trim(),
        has_projector: Boolean(form.has_projector),
        has_computers: Boolean(form.has_computers),
        is_active: Boolean(form.is_active),
    })

    const handleSubmit = async (event) => {
        event.preventDefault()
        setSaving(true)

        try {
            const payload = buildPayload()

            if (editingClassroom) {
                await classroomService.updateClassroom(editingClassroom.id, payload)
                toast.success('Aula actualizada correctamente')
            } else {
                await classroomService.createClassroom(payload)
                toast.success('Aula creada correctamente')
            }

            resetForm()
            await loadClassrooms()
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudo guardar el aula'))
        } finally {
            setSaving(false)
        }
    }

    const handleToggleActive = async (classroom) => {
        try {
            if (classroom.is_active) {
                await classroomService.deactivateClassroom(classroom.id)
                toast.success('Aula desactivada')
            } else {
                await classroomService.activateClassroom(classroom.id)
                toast.success('Aula activada')
            }

            await loadClassrooms()
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudo cambiar el estado'))
        }
    }

    const handleDelete = async (classroom) => {
        const confirmDelete = window.confirm(
            `¿Eliminar permanentemente el aula ${classroom.name}?`
        )

        if (!confirmDelete) return

        try {
            await classroomService.deleteClassroom(classroom.id)
            toast.success('Aula eliminada')
            await loadClassrooms()
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudo eliminar el aula'))
        }
    }

    return (
        <div className="space-y-8">
            <Header
                title="Gestión de Aulas"
                subtitle="Administra aulas, laboratorios, capacidad y recursos."
                icon={<Building2 size={24} />}
                onRefresh={loadClassrooms}
                loading={loading}
            />

            <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 xl:col-span-1"
                >
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-xl font-bold text-slate-900">
                            {editingClassroom ? 'Editar aula' : 'Nueva aula'}
                        </h2>

                        {editingClassroom && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="text-slate-500 hover:text-red-600"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>

                    <div className="space-y-4">
                        <Input
                            label="Código"
                            value={form.code}
                            onChange={(value) => handleChange('code', value)}
                            placeholder="A101"
                        />

                        <Input
                            label="Nombre"
                            value={form.name}
                            onChange={(value) => handleChange('name', value)}
                            placeholder="Aula 101"
                        />

                        <Input
                            label="Capacidad"
                            type="number"
                            value={form.capacity}
                            onChange={(value) => handleChange('capacity', value)}
                        />

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Tipo de aula
                            </label>

                            <select
                                value={form.classroom_type}
                                onChange={(event) =>
                                    handleChange('classroom_type', event.target.value)
                                }
                                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="THEORY">Teoría</option>
                                <option value="LAB">Laboratorio</option>
                                <option value="AUDITORIUM">Auditorio</option>
                                <option value="VIRTUAL">Virtual</option>
                            </select>
                        </div>

                        <Input
                            label="Campus"
                            value={form.campus}
                            onChange={(value) => handleChange('campus', value)}
                        />

                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                label="Pabellón"
                                value={form.building}
                                onChange={(value) => handleChange('building', value)}
                            />

                            <Input
                                label="Piso"
                                value={form.floor}
                                onChange={(value) => handleChange('floor', value)}
                            />
                        </div>

                        <Checkbox
                            label="Tiene proyector"
                            checked={form.has_projector}
                            onChange={(value) => handleChange('has_projector', value)}
                        />

                        <Checkbox
                            label="Tiene computadoras"
                            checked={form.has_computers}
                            onChange={(value) => handleChange('has_computers', value)}
                        />

                        <Checkbox
                            label="Aula activa"
                            checked={form.is_active}
                            onChange={(value) => handleChange('is_active', value)}
                        />

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
                        >
                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            {editingClassroom ? 'Actualizar aula' : 'Crear aula'}
                        </button>
                    </div>
                </form>

                <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 xl:col-span-2">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-xl font-bold text-slate-900">
                            Aulas registradas
                        </h2>

                        <span className="text-sm text-slate-500">
                            Mostrados: {classrooms.length} / {total}
                        </span>
                    </div>

                    {loading ? (
                        <LoadingState />
                    ) : (
                        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-100 text-slate-700">
                                    <tr>
                                        <th className="text-left px-4 py-3">Código</th>
                                        <th className="text-left px-4 py-3">Aula</th>
                                        <th className="text-left px-4 py-3">Tipo</th>
                                        <th className="text-left px-4 py-3">Capacidad</th>
                                        <th className="text-left px-4 py-3">Recursos</th>
                                        <th className="text-left px-4 py-3">Estado</th>
                                        <th className="text-right px-4 py-3">Acciones</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {classrooms.map((classroom) => (
                                        <tr key={classroom.id} className="border-t border-slate-200">
                                            <td className="px-4 py-3 font-bold text-blue-700">
                                                {classroom.code}
                                            </td>

                                            <td className="px-4 py-3">
                                                <p className="font-semibold text-slate-900">
                                                    {classroom.name}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {classroom.campus} | {classroom.building} | Piso {classroom.floor}
                                                </p>
                                            </td>

                                            <td className="px-4 py-3">{classroom.classroom_type}</td>
                                            <td className="px-4 py-3">{classroom.capacity}</td>

                                            <td className="px-4 py-3">
                                                <div className="flex flex-col text-xs text-slate-600">
                                                    <span>
                                                        Proyector: {classroom.has_projector ? 'Sí' : 'No'}
                                                    </span>
                                                    <span>
                                                        PCs: {classroom.has_computers ? 'Sí' : 'No'}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-4 py-3">
                                                <StatusBadge active={classroom.is_active} />
                                            </td>

                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    <IconButton onClick={() => handleEdit(classroom)}>
                                                        <Edit size={16} />
                                                    </IconButton>

                                                    <IconButton onClick={() => handleToggleActive(classroom)}>
                                                        <Power size={16} />
                                                    </IconButton>

                                                    <IconButton danger onClick={() => handleDelete(classroom)}>
                                                        <Trash2 size={16} />
                                                    </IconButton>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}

                                    {classrooms.length === 0 && (
                                        <tr>
                                            <td colSpan="7" className="px-4 py-10 text-center text-slate-500">
                                                No hay aulas registradas.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {!loading && classrooms.length > 0 && <PaginationControls page={page} pageSize={pageSize} total={total} onPageChange={(nextPage) => loadClassrooms(nextPage)} onPageSizeChange={(nextSize) => loadClassrooms(1, nextSize)} />}
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

function Input({ label, value, onChange, type = 'text', placeholder = '' }) {
    return (
        <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
                {label}
            </label>

            <input
                type={type}
                value={value}
                placeholder={placeholder}
                onChange={(event) => onChange(event.target.value)}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
            />
        </div>
    )
}

function Checkbox({ label, checked, onChange }) {
    return (
        <label className="flex items-center gap-3 cursor-pointer">
            <input
                type="checkbox"
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
                className="h-5 w-5"
            />

            <span className="text-sm font-semibold text-slate-700">{label}</span>
        </label>
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

function IconButton({ children, onClick, danger = false }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                'h-9 w-9 rounded-xl flex items-center justify-center border transition',
                danger
                    ? 'border-red-200 text-red-600 hover:bg-red-50'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-100',
            ].join(' ')}
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
