import { useEffect, useMemo, useState } from 'react'
import {
    Edit,
    GraduationCap,
    Loader2,
    RefreshCcw,
    Save,
    Search,
    Trash2,
    X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import PaginationControls from '../../components/common/PaginationControls'
import { studentService } from '../../services/studentService'
import { userService } from '../../services/userService'
import { extractList, getErrorMessage } from '../../utils/extractList'

const initialForm = {
    user_id: '',
    student_code: '',
    career: 'Ingeniería de Sistemas',
    current_cycle: 1,
    min_credits: 7,
    max_credits: 25,
}

export default function StudentsPage() {
    const [students, setStudents] = useState([])
    const [users, setUsers] = useState([])
    const [form, setForm] = useState(initialForm)
    const [editingStudent, setEditingStudent] = useState(null)
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(20)

    const studentUsers = useMemo(() => {
        return users.filter((user) => user.role === 'STUDENT')
    }, [users])

    const filteredStudents = useMemo(() => {
        return students.filter((student) => {
            const user = users.find((item) => item.id === student.user_id)

            const text = [
                student.student_code,
                student.career,
                student.current_cycle,
                user?.full_name,
                user?.email,
            ]
                .join(' ')
                .toLowerCase()

            return text.includes(search.toLowerCase())
        })
    }, [students, users, search])

    const loadAll = async (nextPage = page, nextPageSize = pageSize) => {
        setLoading(true)

        try {
            const [studentsData, usersData] = await Promise.all([
                studentService.getStudents({ skip: (nextPage - 1) * nextPageSize, limit: nextPageSize }),
                userService.getUsers({ limit: 500 }),
            ])

            setStudents(extractList(studentsData))
            setUsers(extractList(usersData))
            setTotal(studentsData.total || 0)
            setPage(nextPage)
            setPageSize(nextPageSize)
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudieron cargar los estudiantes'))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadAll()
    }, [])

    const handleChange = (name, value) => {
        setForm((current) => ({
            ...current,
            [name]: value,
        }))
    }

    const resetForm = () => {
        setForm(initialForm)
        setEditingStudent(null)
    }

    const handleEdit = (student) => {
        setEditingStudent(student)

        setForm({
            user_id: student.user_id || '',
            student_code: student.student_code || '',
            career: student.career || 'Ingeniería de Sistemas',
            current_cycle: student.current_cycle || 1,
            min_credits: student.min_credits || 7,
            max_credits: student.max_credits || 25,
        })
    }

    const buildPayload = () => ({
        user_id: Number(form.user_id),
        student_code: form.student_code.trim(),
        career: form.career.trim(),
        current_cycle: Number(form.current_cycle),
        min_credits: Number(form.min_credits),
        max_credits: Number(form.max_credits),
    })

    const validateForm = () => {
        const minCredits = Number(form.min_credits)
        const maxCredits = Number(form.max_credits)
        const currentCycle = Number(form.current_cycle)

        if (!form.user_id) {
            toast.error('Selecciona un usuario estudiante')
            return false
        }

        if (!form.student_code.trim()) {
            toast.error('Ingresa un código de estudiante')
            return false
        }

        if (currentCycle < 1 || currentCycle > 10) {
            toast.error('El ciclo debe estar entre 1 y 10')
            return false
        }

        if (minCredits < 7 || maxCredits > 25) {
            toast.error('Los créditos deben estar entre 7 y 25')
            return false
        }

        if (minCredits > maxCredits) {
            toast.error('Los créditos mínimos no pueden ser mayores que los máximos')
            return false
        }

        return true
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        if (!validateForm()) return

        setSaving(true)

        try {
            const payload = buildPayload()

            if (editingStudent) {
                await studentService.updateStudent(editingStudent.id, payload)
                toast.success('Estudiante actualizado correctamente')
            } else {
                await studentService.createStudent(payload)
                toast.success('Estudiante creado correctamente')
            }

            resetForm()
            await loadAll()
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudo guardar el estudiante'))
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (student) => {
        const confirmDelete = window.confirm(
            `¿Eliminar el perfil del estudiante ${student.student_code}?`
        )

        if (!confirmDelete) return

        try {
            await studentService.deleteStudent(student.id)
            toast.success('Estudiante eliminado')
            await loadAll()
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudo eliminar el estudiante'))
        }
    }

    const getUserLabel = (userId) => {
        const user = users.find((item) => item.id === userId)

        if (!user) return `Usuario ${userId}`

        return `${user.full_name} — ${user.email}`
    }

    const getAvailableStudentUsers = () => {
        const usedUserIds = students
            .filter((student) => student.id !== editingStudent?.id)
            .map((student) => student.user_id)

        return studentUsers.filter((user) => !usedUserIds.includes(user.id))
    }

    return (
        <div className="space-y-8">
            <Header
                title="Gestión de Estudiantes"
                subtitle="Administra perfiles estudiantiles, ciclos y rango de créditos."
                icon={<GraduationCap size={24} />}
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
                            {editingStudent ? 'Editar estudiante' : 'Nuevo estudiante'}
                        </h2>

                        {editingStudent && (
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
                        <Select
                            label="Usuario estudiante"
                            value={form.user_id}
                            onChange={(value) => handleChange('user_id', value)}
                            options={[
                                { value: '', label: 'Seleccionar usuario STUDENT' },
                                ...getAvailableStudentUsers().map((user) => ({
                                    value: user.id,
                                    label: `${user.id} - ${user.full_name} - ${user.email}`,
                                })),
                            ]}
                        />

                        <Input
                            label="Código estudiante"
                            value={form.student_code}
                            onChange={(value) => handleChange('student_code', value)}
                            placeholder="EST001"
                        />

                        <Input
                            label="Carrera"
                            value={form.career}
                            onChange={(value) => handleChange('career', value)}
                            placeholder="Ingeniería de Sistemas"
                        />

                        <Input
                            label="Ciclo actual"
                            type="number"
                            value={form.current_cycle}
                            onChange={(value) => handleChange('current_cycle', value)}
                        />

                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                label="Créditos mín."
                                type="number"
                                value={form.min_credits}
                                onChange={(value) => handleChange('min_credits', value)}
                            />

                            <Input
                                label="Créditos máx."
                                type="number"
                                value={form.max_credits}
                                onChange={(value) => handleChange('max_credits', value)}
                            />
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                            <p className="text-sm text-blue-800 font-semibold">
                                Reglas académicas
                            </p>
                            <p className="text-xs text-blue-700 mt-1">
                                El estudiante debe tener entre 7 y 25 créditos para generar
                                horarios personalizados.
                            </p>
                        </div>

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
                            {editingStudent ? 'Actualizar estudiante' : 'Crear estudiante'}
                        </button>
                    </div>
                </form>

                <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 xl:col-span-2">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">
                                Estudiantes registrados
                            </h2>
                            <p className="text-sm text-slate-500">
                                Mostrados: {filteredStudents.length} / {total}
                            </p>
                        </div>

                        <div className="relative">
                            <Search
                                size={17}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Buscar estudiante..."
                                className="w-full md:w-72 pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
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
                                        <th className="text-left px-4 py-3">Estudiante</th>
                                        <th className="text-left px-4 py-3">Código</th>
                                        <th className="text-left px-4 py-3">Carrera</th>
                                        <th className="text-left px-4 py-3">Ciclo</th>
                                        <th className="text-left px-4 py-3">Créditos</th>
                                        <th className="text-right px-4 py-3">Acciones</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredStudents.map((student) => (
                                        <tr key={student.id} className="border-t border-slate-200">
                                            <td className="px-4 py-3 font-bold">{student.id}</td>

                                            <td className="px-4 py-3">
                                                <p className="font-semibold text-slate-900">
                                                    {getUserLabel(student.user_id)}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    User ID: {student.user_id}
                                                </p>
                                            </td>

                                            <td className="px-4 py-3 font-bold text-blue-700">
                                                {student.student_code}
                                            </td>

                                            <td className="px-4 py-3">{student.career}</td>

                                            <td className="px-4 py-3">{student.current_cycle}</td>

                                            <td className="px-4 py-3">
                                                {student.min_credits} - {student.max_credits}
                                            </td>

                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    <IconButton onClick={() => handleEdit(student)}>
                                                        <Edit size={16} />
                                                    </IconButton>

                                                    <IconButton danger onClick={() => handleDelete(student)}>
                                                        <Trash2 size={16} />
                                                    </IconButton>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}

                                    {filteredStudents.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan="7"
                                                className="px-4 py-10 text-center text-slate-500"
                                            >
                                                No hay estudiantes para mostrar.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {!loading && students.length > 0 && <PaginationControls page={page} pageSize={pageSize} total={total} onPageChange={(nextPage) => loadAll(nextPage)} onPageSizeChange={(nextSize) => loadAll(1, nextSize)} />}
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

function Select({ label, value, onChange, options }) {
    return (
        <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
                {label}
            </label>

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
