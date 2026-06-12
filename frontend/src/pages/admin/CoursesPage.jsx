import { useEffect, useState } from 'react'
import {
    BookOpen,
    Edit,
    Loader2,
    Plus,
    Power,
    RefreshCcw,
    Save,
    Trash2,
    X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { courseService } from '../../services/courseService'
import { extractList, getErrorMessage } from '../../utils/extractList'

const initialForm = {
    code: '',
    name: '',
    credits: 3,
    cycle: 1,
    career: 'Ingeniería de Sistemas',
    weekly_hours: 3,
    is_active: true,
}

export default function CoursesPage() {
    const [courses, setCourses] = useState([])
    const [form, setForm] = useState(initialForm)
    const [editingCourse, setEditingCourse] = useState(null)
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)

    const loadCourses = async () => {
        setLoading(true)

        try {
            const data = await courseService.getCourses()
            setCourses(extractList(data))
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudieron cargar los cursos'))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadCourses()
    }, [])

    const handleChange = (name, value) => {
        setForm((current) => ({
            ...current,
            [name]: value,
        }))
    }

    const resetForm = () => {
        setForm(initialForm)
        setEditingCourse(null)
    }

    const handleEdit = (course) => {
        setEditingCourse(course)

        setForm({
            code: course.code || '',
            name: course.name || '',
            credits: course.credits || 3,
            cycle: course.cycle || 1,
            career: course.career || 'Ingeniería de Sistemas',
            weekly_hours: course.weekly_hours || 3,
            is_active: Boolean(course.is_active),
        })
    }

    const buildPayload = () => ({
        code: form.code.trim(),
        name: form.name.trim(),
        credits: Number(form.credits),
        cycle: Number(form.cycle),
        career: form.career.trim(),
        weekly_hours: Number(form.weekly_hours),
        is_active: Boolean(form.is_active),
    })

    const handleSubmit = async (event) => {
        event.preventDefault()
        setSaving(true)

        try {
            const payload = buildPayload()

            if (editingCourse) {
                await courseService.updateCourse(editingCourse.id, payload)
                toast.success('Curso actualizado correctamente')
            } else {
                await courseService.createCourse(payload)
                toast.success('Curso creado correctamente')
            }

            resetForm()
            await loadCourses()
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudo guardar el curso'))
        } finally {
            setSaving(false)
        }
    }

    const handleToggleActive = async (course) => {
        try {
            if (course.is_active) {
                await courseService.deactivateCourse(course.id)
                toast.success('Curso desactivado')
            } else {
                await courseService.activateCourse(course.id)
                toast.success('Curso activado')
            }

            await loadCourses()
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudo cambiar el estado'))
        }
    }

    const handleDelete = async (course) => {
        const confirmDelete = window.confirm(
            `¿Eliminar permanentemente el curso ${course.name}?`
        )

        if (!confirmDelete) return

        try {
            await courseService.deleteCourse(course.id)
            toast.success('Curso eliminado')
            await loadCourses()
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudo eliminar el curso'))
        }
    }

    return (
        <div className="space-y-8">
            <Header
                title="Gestión de Cursos"
                subtitle="Administra cursos, créditos, ciclos y horas semanales."
                icon={<BookOpen size={24} />}
                onRefresh={loadCourses}
                loading={loading}
            />

            <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 xl:col-span-1"
                >
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-xl font-bold text-slate-900">
                            {editingCourse ? 'Editar curso' : 'Nuevo curso'}
                        </h2>

                        {editingCourse && (
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
                            placeholder="IS101"
                        />

                        <Input
                            label="Nombre"
                            value={form.name}
                            onChange={(value) => handleChange('name', value)}
                            placeholder="Comprensión y Producción de Textos 1"
                        />

                        <Input
                            label="Carrera"
                            value={form.career}
                            onChange={(value) => handleChange('career', value)}
                        />

                        <div className="grid grid-cols-3 gap-3">
                            <Input
                                label="Créditos"
                                type="number"
                                value={form.credits}
                                onChange={(value) => handleChange('credits', value)}
                            />

                            <Input
                                label="Ciclo"
                                type="number"
                                value={form.cycle}
                                onChange={(value) => handleChange('cycle', value)}
                            />

                            <Input
                                label="Horas"
                                type="number"
                                value={form.weekly_hours}
                                onChange={(value) => handleChange('weekly_hours', value)}
                            />
                        </div>

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
                                Curso activo
                            </span>
                        </label>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
                        >
                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            {editingCourse ? 'Actualizar curso' : 'Crear curso'}
                        </button>
                    </div>
                </form>

                <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 xl:col-span-2">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-xl font-bold text-slate-900">
                            Cursos registrados
                        </h2>

                        <span className="text-sm text-slate-500">
                            Total: {courses.length}
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
                                        <th className="text-left px-4 py-3">Curso</th>
                                        <th className="text-left px-4 py-3">Ciclo</th>
                                        <th className="text-left px-4 py-3">Créditos</th>
                                        <th className="text-left px-4 py-3">Horas</th>
                                        <th className="text-left px-4 py-3">Estado</th>
                                        <th className="text-right px-4 py-3">Acciones</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {courses.map((course) => (
                                        <tr key={course.id} className="border-t border-slate-200">
                                            <td className="px-4 py-3 font-bold text-blue-700">
                                                {course.code}
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="font-semibold text-slate-900">
                                                    {course.name}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {course.career}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3">{course.cycle}</td>
                                            <td className="px-4 py-3">{course.credits}</td>
                                            <td className="px-4 py-3">{course.weekly_hours}</td>
                                            <td className="px-4 py-3">
                                                <StatusBadge active={course.is_active} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    <IconButton onClick={() => handleEdit(course)}>
                                                        <Edit size={16} />
                                                    </IconButton>

                                                    <IconButton onClick={() => handleToggleActive(course)}>
                                                        <Power size={16} />
                                                    </IconButton>

                                                    <IconButton danger onClick={() => handleDelete(course)}>
                                                        <Trash2 size={16} />
                                                    </IconButton>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}

                                    {courses.length === 0 && (
                                        <tr>
                                            <td colSpan="7" className="px-4 py-10 text-center text-slate-500">
                                                No hay cursos registrados.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
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