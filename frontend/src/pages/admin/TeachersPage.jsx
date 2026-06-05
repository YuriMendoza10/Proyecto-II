import { useEffect, useState } from 'react'
import {
    Clock,
    Edit,
    GraduationCap,
    Loader2,
    Plus,
    RefreshCcw,
    Save,
    Trash2,
    X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import PaginationControls from '../../components/common/PaginationControls'
import { teacherService } from '../../services/teacherService'
import { extractList, getErrorMessage } from '../../utils/extractList'

const initialForm = {
    user_id: '',
    teacher_code: '',
    specialty: '',
    max_weekly_hours: 24,
    rating: 4.5,
}

const initialAvailabilityForm = {
    teacher_id: '',
    day_of_week: 1,
    start_time: '07:00:00',
    end_time: '22:00:00',
    is_available: true,
}

const dayLabels = {
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado',
    7: 'Domingo',
}

export default function TeachersPage() {
    const [teachers, setTeachers] = useState([])
    const [form, setForm] = useState(initialForm)
    const [availabilityForm, setAvailabilityForm] = useState(initialAvailabilityForm)
    const [availabilityList, setAvailabilityList] = useState([])
    const [selectedTeacherId, setSelectedTeacherId] = useState('')
    const [editingTeacher, setEditingTeacher] = useState(null)
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [savingAvailability, setSavingAvailability] = useState(false)
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(20)

    const loadTeachers = async (nextPage = page, nextPageSize = pageSize) => {
        setLoading(true)

        try {
            const data = await teacherService.getTeachers({ skip: (nextPage - 1) * nextPageSize, limit: nextPageSize })
            setTeachers(extractList(data))
            setTotal(data.total || 0)
            setPage(nextPage)
            setPageSize(nextPageSize)
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudieron cargar los docentes'))
        } finally {
            setLoading(false)
        }
    }

    const loadAvailability = async (teacherId) => {
        if (!teacherId) return

        try {
            const data = await teacherService.getTeacherAvailability(teacherId)
            setAvailabilityList(extractList(data))
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudo cargar la disponibilidad'))
        }
    }

    useEffect(() => {
        loadTeachers()
    }, [])

    const resetForm = () => {
        setForm(initialForm)
        setEditingTeacher(null)
    }

    const handleEdit = (teacher) => {
        setEditingTeacher(teacher)

        setForm({
            user_id: teacher.user_id || '',
            teacher_code: teacher.teacher_code || '',
            specialty: teacher.specialty || '',
            max_weekly_hours: teacher.max_weekly_hours || 24,
            rating: teacher.rating || 4.5,
        })
    }

    const buildTeacherPayload = () => ({
        user_id: Number(form.user_id),
        teacher_code: form.teacher_code.trim(),
        specialty: form.specialty.trim(),
        max_weekly_hours: Number(form.max_weekly_hours),
        rating: Number(form.rating),
    })

    const handleSubmit = async (event) => {
        event.preventDefault()
        setSaving(true)

        try {
            const payload = buildTeacherPayload()

            if (editingTeacher) {
                await teacherService.updateTeacher(editingTeacher.id, payload)
                toast.success('Docente actualizado correctamente')
            } else {
                await teacherService.createTeacher(payload)
                toast.success('Docente creado correctamente')
            }

            resetForm()
            await loadTeachers()
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudo guardar el docente'))
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (teacher) => {
        const confirmDelete = window.confirm(
            `¿Eliminar el docente ${teacher.teacher_code}?`
        )

        if (!confirmDelete) return

        try {
            await teacherService.deleteTeacher(teacher.id)
            toast.success('Docente eliminado')
            await loadTeachers()
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudo eliminar el docente'))
        }
    }

    const handleSelectTeacher = async (teacherId) => {
        setSelectedTeacherId(teacherId)
        setAvailabilityForm((current) => ({
            ...current,
            teacher_id: teacherId,
        }))

        await loadAvailability(teacherId)
    }

    const handleCreateAvailability = async (event) => {
        event.preventDefault()
        setSavingAvailability(true)

        try {
            await teacherService.createTeacherAvailability({
                teacher_id: Number(availabilityForm.teacher_id),
                day_of_week: Number(availabilityForm.day_of_week),
                start_time: availabilityForm.start_time,
                end_time: availabilityForm.end_time,
                is_available: Boolean(availabilityForm.is_available),
            })

            toast.success('Disponibilidad registrada')
            await loadAvailability(availabilityForm.teacher_id)
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudo registrar la disponibilidad'))
        } finally {
            setSavingAvailability(false)
        }
    }

    const handleDeleteAvailability = async (availabilityId) => {
        const confirmDelete = window.confirm('¿Eliminar esta disponibilidad?')

        if (!confirmDelete) return

        try {
            await teacherService.deleteTeacherAvailability(availabilityId)
            toast.success('Disponibilidad eliminada')
            await loadAvailability(selectedTeacherId)
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudo eliminar la disponibilidad'))
        }
    }

    return (
        <div className="space-y-8">
            <Header
                title="Gestión de Docentes"
                subtitle="Administra perfiles docentes y disponibilidad horaria."
                icon={<GraduationCap size={24} />}
                onRefresh={loadTeachers}
                loading={loading}
            />

            <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6"
                >
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-xl font-bold text-slate-900">
                            {editingTeacher ? 'Editar docente' : 'Nuevo docente'}
                        </h2>

                        {editingTeacher && (
                            <button type="button" onClick={resetForm} className="text-slate-500 hover:text-red-600">
                                <X size={20} />
                            </button>
                        )}
                    </div>

                    <div className="space-y-4">
                        <Input
                            label="ID de usuario"
                            type="number"
                            value={form.user_id}
                            onChange={(value) => setForm({ ...form, user_id: value })}
                            placeholder="Ejemplo: 2"
                        />

                        <Input
                            label="Código docente"
                            value={form.teacher_code}
                            onChange={(value) => setForm({ ...form, teacher_code: value })}
                            placeholder="DOC001"
                        />

                        <Input
                            label="Especialidad"
                            value={form.specialty}
                            onChange={(value) => setForm({ ...form, specialty: value })}
                            placeholder="Programación y Algoritmos"
                        />

                        <Input
                            label="Horas máximas semanales"
                            type="number"
                            value={form.max_weekly_hours}
                            onChange={(value) => setForm({ ...form, max_weekly_hours: value })}
                        />

                        <Input
                            label="Rating"
                            type="number"
                            step="0.1"
                            value={form.rating}
                            onChange={(value) => setForm({ ...form, rating: value })}
                        />

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
                        >
                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            {editingTeacher ? 'Actualizar docente' : 'Crear docente'}
                        </button>
                    </div>
                </form>

                <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 xl:col-span-2">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-xl font-bold text-slate-900">Docentes registrados</h2>
                        <span className="text-sm text-slate-500">Mostrados: {teachers.length} / {total}</span>
                    </div>

                    {loading ? (
                        <LoadingState />
                    ) : (
                        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-100 text-slate-700">
                                    <tr>
                                        <th className="text-left px-4 py-3">Código</th>
                                        <th className="text-left px-4 py-3">Usuario ID</th>
                                        <th className="text-left px-4 py-3">Especialidad</th>
                                        <th className="text-left px-4 py-3">Horas</th>
                                        <th className="text-left px-4 py-3">Rating</th>
                                        <th className="text-right px-4 py-3">Acciones</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {teachers.map((teacher) => (
                                        <tr key={teacher.id} className="border-t border-slate-200">
                                            <td className="px-4 py-3 font-bold text-blue-700">{teacher.teacher_code}</td>
                                            <td className="px-4 py-3">{teacher.user_id}</td>
                                            <td className="px-4 py-3">{teacher.specialty}</td>
                                            <td className="px-4 py-3">{teacher.max_weekly_hours}</td>
                                            <td className="px-4 py-3">{teacher.rating}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    <IconButton onClick={() => handleSelectTeacher(teacher.id)}>
                                                        <Clock size={16} />
                                                    </IconButton>

                                                    <IconButton onClick={() => handleEdit(teacher)}>
                                                        <Edit size={16} />
                                                    </IconButton>

                                                    <IconButton danger onClick={() => handleDelete(teacher)}>
                                                        <Trash2 size={16} />
                                                    </IconButton>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}

                                    {teachers.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-4 py-10 text-center text-slate-500">
                                                No hay docentes registrados.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {!loading && teachers.length > 0 && <PaginationControls page={page} pageSize={pageSize} total={total} onPageChange={(nextPage) => loadTeachers(nextPage)} onPageSizeChange={(nextSize) => loadTeachers(1, nextSize)} />}
                </section>
            </section>

            <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-5">
                    <div className="h-10 w-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
                        <Clock size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            Disponibilidad docente
                        </h2>
                        <p className="text-sm text-slate-500">
                            Selecciona un docente con el botón del reloj para gestionar su disponibilidad.
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={handleCreateAvailability}
                    className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6"
                >
                    <Input
                        label="Teacher ID"
                        type="number"
                        value={availabilityForm.teacher_id}
                        onChange={(value) =>
                            setAvailabilityForm({ ...availabilityForm, teacher_id: value })
                        }
                    />

                    <Select
                        label="Día"
                        value={availabilityForm.day_of_week}
                        onChange={(value) =>
                            setAvailabilityForm({ ...availabilityForm, day_of_week: value })
                        }
                        options={[
                            { value: 1, label: 'Lunes' },
                            { value: 2, label: 'Martes' },
                            { value: 3, label: 'Miércoles' },
                            { value: 4, label: 'Jueves' },
                            { value: 5, label: 'Viernes' },
                            { value: 6, label: 'Sábado' },
                            { value: 7, label: 'Domingo' },
                        ]}
                    />

                    <Input
                        label="Inicio"
                        value={availabilityForm.start_time}
                        onChange={(value) =>
                            setAvailabilityForm({ ...availabilityForm, start_time: value })
                        }
                    />

                    <Input
                        label="Fin"
                        value={availabilityForm.end_time}
                        onChange={(value) =>
                            setAvailabilityForm({ ...availabilityForm, end_time: value })
                        }
                    />

                    <label className="flex items-center gap-3 mt-8">
                        <input
                            type="checkbox"
                            checked={availabilityForm.is_available}
                            onChange={(event) =>
                                setAvailabilityForm({
                                    ...availabilityForm,
                                    is_available: event.target.checked,
                                })
                            }
                            className="h-5 w-5"
                        />
                        <span className="text-sm font-semibold text-slate-700">Disponible</span>
                    </label>

                    <button
                        type="submit"
                        disabled={savingAvailability}
                        className="mt-7 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-500 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                    >
                        {savingAvailability ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                        Agregar
                    </button>
                </form>

                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-100 text-slate-700">
                            <tr>
                                <th className="text-left px-4 py-3">ID</th>
                                <th className="text-left px-4 py-3">Día</th>
                                <th className="text-left px-4 py-3">Inicio</th>
                                <th className="text-left px-4 py-3">Fin</th>
                                <th className="text-left px-4 py-3">Estado</th>
                                <th className="text-right px-4 py-3">Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {availabilityList.map((item) => (
                                <tr key={item.id} className="border-t border-slate-200">
                                    <td className="px-4 py-3">{item.id}</td>
                                    <td className="px-4 py-3">{dayLabels[item.day_of_week]}</td>
                                    <td className="px-4 py-3">{item.start_time}</td>
                                    <td className="px-4 py-3">{item.end_time}</td>
                                    <td className="px-4 py-3">
                                        {item.is_available ? 'Disponible' : 'No disponible'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end">
                                            <IconButton danger onClick={() => handleDeleteAvailability(item.id)}>
                                                <Trash2 size={16} />
                                            </IconButton>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {availabilityList.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-4 py-10 text-center text-slate-500">
                                        No hay disponibilidad cargada para el docente seleccionado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
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

function Input({ label, value, onChange, type = 'text', placeholder = '', step }) {
    return (
        <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
            <input
                type={type}
                step={step}
                value={value}
                placeholder={placeholder}
                onChange={(event) => onChange(event.target.value)}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
            />
        </div>
    )
}

function Select({ label, value, onChange, options }) {
    return (
        <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
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
