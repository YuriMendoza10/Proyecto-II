import { useEffect, useState } from 'react'
import {
    Edit,
    Layers,
    Loader2,
    RefreshCcw,
    Save,
    Trash2,
    X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { sectionService } from '../../services/sectionService'
import { courseService } from '../../services/courseService'
import { teacherService } from '../../services/teacherService'
import { extractList, getErrorMessage } from '../../utils/extractList'

const initialForm = {
    course_id: '',
    teacher_id: '',
    section_code: 'A',
    max_students: 40,
    enrolled_students: 0,
}

export default function SectionsPage() {
    const [sections, setSections] = useState([])
    const [courses, setCourses] = useState([])
    const [teachers, setTeachers] = useState([])
    const [form, setForm] = useState(initialForm)
    const [editingSection, setEditingSection] = useState(null)
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)

    const loadAll = async () => {
        setLoading(true)

        try {
            const [sectionsData, coursesData, teachersData] = await Promise.all([
                sectionService.getSections(),
                courseService.getCourses(),
                teacherService.getTeachers(),
            ])

            setSections(extractList(sectionsData))
            setCourses(extractList(coursesData))
            setTeachers(extractList(teachersData))
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudieron cargar los datos'))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadAll()
    }, [])

    const resetForm = () => {
        setForm(initialForm)
        setEditingSection(null)
    }

    const handleEdit = (section) => {
        setEditingSection(section)

        setForm({
            course_id: section.course_id || '',
            teacher_id: section.teacher_id || '',
            section_code: section.section_code || 'A',
            max_students: section.max_students || 40,
            enrolled_students: section.enrolled_students || 0,
        })
    }

    const buildPayload = () => ({
        course_id: Number(form.course_id),
        teacher_id: form.teacher_id === '' ? null : Number(form.teacher_id),
        section_code: form.section_code.trim(),
        max_students: Number(form.max_students),
        enrolled_students: Number(form.enrolled_students),
    })

    const handleSubmit = async (event) => {
        event.preventDefault()
        setSaving(true)

        try {
            const payload = buildPayload()

            if (editingSection) {
                await sectionService.updateSection(editingSection.id, payload)
                toast.success('Sección actualizada correctamente')
            } else {
                await sectionService.createSection(payload)
                toast.success('Sección creada correctamente')
            }

            resetForm()
            await loadAll()
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudo guardar la sección'))
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (section) => {
        const confirmDelete = window.confirm(
            `¿Eliminar la sección ${section.section_code}?`
        )

        if (!confirmDelete) return

        try {
            await sectionService.deleteSection(section.id)
            toast.success('Sección eliminada')
            await loadAll()
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudo eliminar la sección'))
        }
    }

    const getCourseName = (courseId) => {
        const course = courses.find((item) => item.id === courseId)
        return course ? `${course.code} - ${course.name}` : `Curso ${courseId}`
    }

    const getTeacherLabel = (teacherId) => {
        if (!teacherId) return 'Sin docente'

        const teacher = teachers.find((item) => item.id === teacherId)
        return teacher ? teacher.teacher_code : `Docente ${teacherId}`
    }

    return (
        <div className="space-y-8">
            <Header
                title="Gestión de Secciones"
                subtitle="Administra secciones, cursos, docentes asignados y cupos."
                icon={<Layers size={24} />}
                onRefresh={loadAll}
                loading={loading}
            />

            <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6"
                >
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-xl font-bold text-slate-900">
                            {editingSection ? 'Editar sección' : 'Nueva sección'}
                        </h2>

                        {editingSection && (
                            <button type="button" onClick={resetForm} className="text-slate-500 hover:text-red-600">
                                <X size={20} />
                            </button>
                        )}
                    </div>

                    <div className="space-y-4">
                        <Select
                            label="Curso"
                            value={form.course_id}
                            onChange={(value) => setForm({ ...form, course_id: value })}
                            options={[
                                { value: '', label: 'Seleccionar curso' },
                                ...courses.map((course) => ({
                                    value: course.id,
                                    label: `${course.code} - ${course.name}`,
                                })),
                            ]}
                        />

                        <Select
                            label="Docente"
                            value={form.teacher_id}
                            onChange={(value) => setForm({ ...form, teacher_id: value })}
                            options={[
                                { value: '', label: 'Sin docente' },
                                ...teachers.map((teacher) => ({
                                    value: teacher.id,
                                    label: `${teacher.teacher_code} - ${teacher.specialty}`,
                                })),
                            ]}
                        />

                        <Input
                            label="Código de sección"
                            value={form.section_code}
                            onChange={(value) => setForm({ ...form, section_code: value })}
                            placeholder="A"
                        />

                        <Input
                            label="Máximo de estudiantes"
                            type="number"
                            value={form.max_students}
                            onChange={(value) => setForm({ ...form, max_students: value })}
                        />

                        <Input
                            label="Estudiantes inscritos"
                            type="number"
                            value={form.enrolled_students}
                            onChange={(value) => setForm({ ...form, enrolled_students: value })}
                        />

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
                        >
                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            {editingSection ? 'Actualizar sección' : 'Crear sección'}
                        </button>
                    </div>
                </form>

                <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 xl:col-span-2">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-xl font-bold text-slate-900">Secciones registradas</h2>
                        <span className="text-sm text-slate-500">Total: {sections.length}</span>
                    </div>

                    {loading ? (
                        <LoadingState />
                    ) : (
                        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-100 text-slate-700">
                                    <tr>
                                        <th className="text-left px-4 py-3">ID</th>
                                        <th className="text-left px-4 py-3">Curso</th>
                                        <th className="text-left px-4 py-3">Sección</th>
                                        <th className="text-left px-4 py-3">Docente</th>
                                        <th className="text-left px-4 py-3">Cupos</th>
                                        <th className="text-right px-4 py-3">Acciones</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {sections.map((section) => (
                                        <tr key={section.id} className="border-t border-slate-200">
                                            <td className="px-4 py-3">{section.id}</td>

                                            <td className="px-4 py-3">
                                                <p className="font-semibold text-slate-900">
                                                    {getCourseName(section.course_id)}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    Course ID: {section.course_id}
                                                </p>
                                            </td>

                                            <td className="px-4 py-3 font-bold text-blue-700">
                                                {section.section_code}
                                            </td>

                                            <td className="px-4 py-3">
                                                {getTeacherLabel(section.teacher_id)}
                                            </td>

                                            <td className="px-4 py-3">
                                                {section.enrolled_students} / {section.max_students}
                                            </td>

                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    <IconButton onClick={() => handleEdit(section)}>
                                                        <Edit size={16} />
                                                    </IconButton>

                                                    <IconButton danger onClick={() => handleDelete(section)}>
                                                        <Trash2 size={16} />
                                                    </IconButton>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}

                                    {sections.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-4 py-10 text-center text-slate-500">
                                                No hay secciones registradas.
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
            <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
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

function Select({ label, value, onChange, options }) {
    return (
        <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
            >
                {options.map((option) => (
                    <option key={`${option.value}-${option.label}`} value={option.value}>
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