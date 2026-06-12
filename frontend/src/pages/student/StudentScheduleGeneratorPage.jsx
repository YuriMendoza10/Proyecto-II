import { useEffect, useMemo, useState } from 'react'
import {
    BookOpen,
    CalendarDays,
    CheckCircle,
    Loader2,
    Save,
    Search,
    Sparkles,
} from 'lucide-react'
import toast from 'react-hot-toast'

import { studentCspService } from '../../services/studentCspService'
import { studentService } from '../../services/studentService'
import { scheduleService } from '../../services/scheduleService'
import { useAuthStore } from '../../stores/authStore'
import StudentFlowGuide from '../../components/student/StudentFlowGuide'

const STORAGE_SELECTED_COURSES_KEY = 'optiacademic_student_selected_course_ids'
const STORAGE_OFFER_CONTEXT_KEY = 'optiacademic_student_offer_context'
const STORAGE_PREFERRED_TEACHERS_KEY = 'optiacademic_student_preferred_teacher_ids'
const STORAGE_AVOIDED_TEACHERS_KEY = 'optiacademic_student_avoided_teacher_ids'

const DAYS = [
    { id: 1, label: 'Lunes', short: 'Lun' },
    { id: 2, label: 'Martes', short: 'Mar' },
    { id: 3, label: 'Miércoles', short: 'Mié' },
    { id: 4, label: 'Jueves', short: 'Jue' },
    { id: 5, label: 'Viernes', short: 'Vie' },
    { id: 6, label: 'Sábado', short: 'Sáb' },
    { id: 7, label: 'Domingo', short: 'Dom' },
]

const TIME_ROWS = [
    '07:00:00',
    '08:40:00',
    '10:20:00',
    '12:00:00',
    '14:00:00',
    '15:40:00',
    '17:20:00',
    '19:00:00',
    '20:40:00',
]

const SHIFT_OPTIONS = [
    { value: 'ANY', label: 'Cualquiera' },
    { value: 'MORNING', label: 'Mañana' },
    { value: 'AFTERNOON', label: 'Tarde' },
    { value: 'NIGHT', label: 'Noche' },
]

export default function StudentScheduleGeneratorPage() {
    const { user } = useAuthStore()

    const isStudentUser = user?.role === 'STUDENT'
    const isAdminOrCoordinator =
        user?.role === 'ADMIN' || user?.role === 'COORDINATOR'

    const [loadingInitialData, setLoadingInitialData] = useState(false)
    const [loadingOfferCourses, setLoadingOfferCourses] = useState(false)
    const [loadingAction, setLoadingAction] = useState(null)

    const [studentProfile, setStudentProfile] = useState(null)
    const [students, setStudents] = useState([])
    const [schedules, setSchedules] = useState([])
    const [offerCourses, setOfferCourses] = useState([])

    const [search, setSearch] = useState('')
    const [preview, setPreview] = useState(null)
    const [savedSchedule, setSavedSchedule] = useState(null)
    const [enrolledCourses, setEnrolledCourses] = useState([])
    const [enrollmentPreview, setEnrollmentPreview] = useState(null)
    const [enrollmentSaving, setEnrollmentSaving] = useState(false)
    const [selectedSolutionIndex, setSelectedSolutionIndex] = useState(0)

    const [form, setForm] = useState({
        student_id: '',
        institutional_schedule_id: '',
        target_credits: 25,
        unavailable_days: [],
        selected_course_ids: [],
        preferred_teacher_ids: [],
        avoided_teacher_ids: [],
        require_all_selected_courses: false,
        preferred_shift: 'ANY',
        max_solutions: 10,
        transfer_tolerance_minutes: 0,
        name: 'Mi horario personalizado',
        is_favorite: true,
    })

    const selectedStudent = useMemo(() => {
        return students.find((student) => Number(student.id) === Number(form.student_id))
    }, [students, form.student_id])

    const selectedInstitutionalSchedule = useMemo(() => {
        return schedules.find(
            (schedule) => Number(schedule.id) === Number(form.institutional_schedule_id)
        )
    }, [schedules, form.institutional_schedule_id])

    const filteredOfferCourses = useMemo(() => {
        const query = search.trim().toLowerCase()

        if (!query) return offerCourses

        return offerCourses.filter((course) => {
            return (
                course.course_code?.toLowerCase().includes(query) ||
                course.course_name?.toLowerCase().includes(query) ||
                String(course.cycle || '').includes(query)
            )
        })
    }, [offerCourses, search])

    const selectedCredits = useMemo(() => {
        return offerCourses
            .filter((course) => form.selected_course_ids.includes(course.course_id))
            .reduce((sum, course) => sum + Number(course.credits || 0), 0)
    }, [offerCourses, form.selected_course_ids])

    const selectedSolution = useMemo(() => {
        if (!preview?.solutions?.length) return null

        return preview.solutions.find(
            (solution) => Number(solution.solution_index) === Number(selectedSolutionIndex)
        )
    }, [preview, selectedSolutionIndex])

    const selectedBlocksBySlot = useMemo(() => {
        const map = {}

        if (!selectedSolution?.blocks) return map

        for (const block of selectedSolution.blocks) {
            const startTime = normalizeTime(block.start_time)
            const key = `${block.day_of_week}-${startTime}`

            if (!map[key]) {
                map[key] = []
            }

            map[key].push({
                ...block,
                start_time: startTime,
                end_time: normalizeTime(block.end_time),
            })
        }

        return map
    }, [selectedSolution])

    function readImportedCourseIds() {
        try {
            const raw = localStorage.getItem(STORAGE_SELECTED_COURSES_KEY)
            const parsed = JSON.parse(raw || '[]')

            if (!Array.isArray(parsed)) return []

            return parsed.map(Number).filter((id) => Number.isInteger(id) && id > 0)
        } catch {
            return []
        }
    }

    function readImportedContext() {
        try {
            const raw = localStorage.getItem(STORAGE_OFFER_CONTEXT_KEY)
            const parsed = JSON.parse(raw || '{}')

            if (!parsed || typeof parsed !== 'object') return null

            return parsed
        } catch {
            return null
        }
    }

    function readImportedTeacherIds(key) {
        try {
            const raw = localStorage.getItem(key)
            const parsed = JSON.parse(raw || '[]')

            if (!Array.isArray(parsed)) return []

            return parsed.map(Number).filter((id) => Number.isInteger(id) && id > 0)
        } catch {
            return []
        }
    }

    const loadInitialData = async () => {
        setLoadingInitialData(true)

        try {
            const schedulesData = scheduleService.getPublishedSchedules
                ? await scheduleService.getPublishedSchedules()
                : scheduleService.getSchedules
                  ? await scheduleService.getSchedules()
                  : scheduleService.getAll
                    ? await scheduleService.getAll()
                    : []

            const scheduleList = extractList(schedulesData)

            const publishedSchedules = scheduleList.filter((schedule) => {
                const status = schedule.status?.value || schedule.status
                return status === 'PUBLISHED' || schedule.is_active
            })

            setSchedules(publishedSchedules)

            const importedContext = readImportedContext()
            const importedCourseIds = readImportedCourseIds()

            const importedPreferredTeacherIds = readImportedTeacherIds(
                STORAGE_PREFERRED_TEACHERS_KEY
            )
            const importedAvoidedTeacherIds = readImportedTeacherIds(
                STORAGE_AVOIDED_TEACHERS_KEY
            )

            let detectedStudent = null

            if (isStudentUser) {
                detectedStudent = await studentCspService.getMyStudentProfile()
                setStudentProfile(detectedStudent)
                setStudents([detectedStudent])
                setEnrolledCourses(await studentCspService.getMyEnrolledCourses())
            }

            if (isAdminOrCoordinator) {
                const studentsData = await studentService.getStudents()
                const studentList = extractList(studentsData)

                setStudents(studentList)

                detectedStudent = studentList[0] || null
            }

            const selectedSchedule =
                publishedSchedules.find((schedule) => {
                    return (
                        Number(schedule.id) ===
                        Number(importedContext?.institutional_schedule_id)
                    )
                }) ||
                publishedSchedules.find((schedule) => {
                    const status = schedule.status?.value || schedule.status
                    return status === 'PUBLISHED'
                }) ||
                publishedSchedules[0] ||
                null

            setForm((current) => ({
                ...current,
                student_id:
                    importedContext?.student_id ||
                    detectedStudent?.id ||
                    current.student_id ||
                    '',
                institutional_schedule_id:
                    importedContext?.institutional_schedule_id ||
                    selectedSchedule?.id ||
                    current.institutional_schedule_id ||
                    '',
                unavailable_days:
                    importedContext?.unavailable_days ||
                    current.unavailable_days ||
                    [],
                selected_course_ids: importedCourseIds,
                preferred_teacher_ids:
                    importedContext?.preferred_teacher_ids ||
                    importedPreferredTeacherIds ||
                    [],
                avoided_teacher_ids:
                    importedContext?.avoided_teacher_ids ||
                    importedAvoidedTeacherIds ||
                    [],
                target_credits:
                    importedContext?.target_credits ||
                    detectedStudent?.max_credits ||
                    current.target_credits ||
                    25,
                require_all_selected_courses: false,
                transfer_tolerance_minutes: 0,
            }))

            if (importedCourseIds.length > 0) {
                toast.success('Cursos seleccionados desde Oferta Académica cargados')
            }
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudieron cargar los datos iniciales'))
        } finally {
            setLoadingInitialData(false)
        }
    }

    const loadOfferCourses = async () => {
        if (!form.student_id || !form.institutional_schedule_id) return

        setLoadingOfferCourses(true)

        try {
            const data = await studentCspService.getOfferCourses({
                student_id: Number(form.student_id),
                institutional_schedule_id: Number(form.institutional_schedule_id),
                unavailable_days: form.unavailable_days,
            })

            const courses = data?.courses || []

            setOfferCourses(courses)

            const validCourseIds = new Set(courses.map((course) => course.course_id))

            setForm((current) => ({
                ...current,
                selected_course_ids: current.selected_course_ids.filter((courseId) =>
                    validCourseIds.has(courseId)
                ),
            }))
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudieron cargar los cursos ofertados'))
        } finally {
            setLoadingOfferCourses(false)
        }
    }

    const toggleUnavailableDay = (dayId) => {
        setPreview(null)

        setForm((current) => {
            const exists = current.unavailable_days.includes(dayId)

            return {
                ...current,
                unavailable_days: exists
                    ? current.unavailable_days.filter((day) => day !== dayId)
                    : [...current.unavailable_days, dayId].sort((a, b) => a - b),
            }
        })
    }

    const toggleCourse = (courseId) => {
        setPreview(null)

        setForm((current) => {
            const exists = current.selected_course_ids.includes(courseId)

            return {
                ...current,
                selected_course_ids: exists
                    ? current.selected_course_ids.filter((id) => id !== courseId)
                    : [...current.selected_course_ids, courseId],
            }
        })
    }

    const selectAllVisibleCourses = () => {
        setPreview(null)

        setForm((current) => ({
            ...current,
            selected_course_ids: filteredOfferCourses.map((course) => course.course_id),
        }))
    }

    const clearSelectedCourses = () => {
        setPreview(null)

        setForm((current) => ({
            ...current,
            selected_course_ids: [],
        }))

        localStorage.removeItem(STORAGE_SELECTED_COURSES_KEY)
        localStorage.removeItem(STORAGE_OFFER_CONTEXT_KEY)
    }

    const buildPreviewPayload = () => {
        return {
            student_id: Number(form.student_id),
            institutional_schedule_id: Number(form.institutional_schedule_id),
            target_credits: Number(form.target_credits || 25),
            unavailable_days: form.unavailable_days,
            selected_course_ids: form.selected_course_ids,
            preferred_teacher_ids: form.preferred_teacher_ids,
            avoided_teacher_ids: form.avoided_teacher_ids,
            require_all_selected_courses: Boolean(form.require_all_selected_courses),
            preferred_shift: form.preferred_shift,
            max_solutions: Number(form.max_solutions || 10),
            transfer_tolerance_minutes: Number(form.transfer_tolerance_minutes || 0),
        }
    }

    const handlePreview = async () => {
        if (!form.student_id) {
            toast.error('No se detectó el estudiante')
            return
        }

        if (!form.institutional_schedule_id) {
            toast.error('Selecciona un horario institucional publicado')
            return
        }

        if (form.selected_course_ids.length === 0) {
            toast.error('Selecciona al menos un curso')
            return
        }

        setLoadingAction('preview')
        setPreview(null)
        setSavedSchedule(null)
        setSelectedSolutionIndex(0)

        try {
            const payload = buildPreviewPayload()
            const data = await studentCspService.previewStudentSchedules(payload)

            setPreview(data)
            setSelectedSolutionIndex(data.best_solution_index || 0)

            toast.success('Opciones de horario generadas correctamente')
        } catch (error) {
            console.error('ERROR STUDENT CSP PREVIEW:', error.response?.data || error)
            toast.error(getErrorMessage(error, 'No se pudo generar el horario'))
        } finally {
            setLoadingAction(null)
        }
    }

    const handleSaveSelected = async () => {
        if (!preview) {
            toast.error('Primero genera opciones de horario')
            return
        }

        setLoadingAction('save')

        try {
            const payload = {
                ...buildPreviewPayload(),
                solution_index: Number(selectedSolutionIndex),
                name: form.name || 'Mi horario personalizado',
                is_favorite: Boolean(form.is_favorite),
            }

            const data = await studentCspService.saveSelectedStudentSchedule(payload)

            setSavedSchedule(data)

            localStorage.removeItem(STORAGE_SELECTED_COURSES_KEY)
            localStorage.removeItem(STORAGE_OFFER_CONTEXT_KEY)
            localStorage.removeItem(STORAGE_PREFERRED_TEACHERS_KEY)
            localStorage.removeItem(STORAGE_AVOIDED_TEACHERS_KEY)

            toast.success('Horario guardado correctamente')
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudo guardar el horario'))
        } finally {
            setLoadingAction(null)
        }
    }

    const handleSaveSolutionAsFinal = async (solutionIndex) => {
        if (!preview) {
            toast.error('Primero genera opciones de horario')
            return
        }

        setSelectedSolutionIndex(Number(solutionIndex))
        setLoadingAction(`save-${solutionIndex}`)

        try {
            const payload = {
                ...buildPreviewPayload(),
                solution_index: Number(solutionIndex),
                name: form.name || `Horario final - Opción ${Number(solutionIndex) + 1}`,
                is_favorite: true,
            }

            const data = await studentCspService.saveSelectedStudentSchedule(payload)

            setSavedSchedule(data)

            localStorage.removeItem(STORAGE_SELECTED_COURSES_KEY)
            localStorage.removeItem(STORAGE_OFFER_CONTEXT_KEY)
            localStorage.removeItem(STORAGE_PREFERRED_TEACHERS_KEY)
            localStorage.removeItem(STORAGE_AVOIDED_TEACHERS_KEY)

            toast.success('Horario elegido como final correctamente')
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudo guardar el horario final'))
        } finally {
            setLoadingAction(null)
        }
    }

    const handleEnrollmentGenerate = async () => {
        setLoadingAction('enrollment-preview')
        try {
            const data = await studentCspService.generateFromEnrollments({ max_solutions: 5 })
            setEnrollmentPreview(data)
            toast.success('Horario generado con tus cursos matriculados')
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudo generar desde matriculas'))
        } finally {
            setLoadingAction(null)
        }
    }

    const handleEnrollmentSave = async (solutionIndex) => {
        setEnrollmentSaving(true)
        try {
            await studentCspService.saveFromEnrollments({
                solution_index: solutionIndex,
                max_solutions: 5,
                name: 'Mi horario con cursos matriculados',
                is_favorite: true,
            })
            toast.success('Horario de matriculas guardado como favorito')
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudo guardar el horario'))
        } finally {
            setEnrollmentSaving(false)
        }
    }

    useEffect(() => {
        loadInitialData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (form.student_id && form.institutional_schedule_id) {
            loadOfferCourses()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        form.student_id,
        form.institutional_schedule_id,
        JSON.stringify(form.unavailable_days),
    ])

    if (loadingInitialData) {
        return (
            <div className="flex justify-center rounded-3xl border border-slate-200 bg-white py-20 text-slate-500">
                <Loader2 className="animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <section className="rounded-3xl bg-slate-900 p-6 text-white shadow-sm">
                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-600">
                            <Sparkles size={28} />
                        </div>

                        <div>
                            <h1 className="text-3xl font-black">
                                Generador de horario
                            </h1>
                            <p className="mt-1 max-w-2xl text-sm text-slate-300">
                                Genera opciones personalizadas según cursos seleccionados, días no disponibles y preferencias.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handlePreview}
                        disabled={loadingAction === 'preview'}
                        className="flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-700 disabled:opacity-60"
                    >
                        {loadingAction === 'preview' ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <Sparkles size={18} />
                        )}
                        Generar opciones
                    </button>
                </div>
            </section>

            <StudentFlowGuide currentStep={preview ? 'compare' : 'generator'} />

            {isStudentUser && (
                <EnrollmentModePanel
                    courses={enrolledCourses}
                    preview={enrollmentPreview}
                    loading={loadingAction === 'enrollment-preview'}
                    saving={enrollmentSaving}
                    onGenerate={handleEnrollmentGenerate}
                    onSave={handleEnrollmentSave}
                />
            )}
            
            <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="space-y-6 xl:col-span-1">
                    <ConfigPanel
                        form={form}
                        setForm={setForm}
                        isStudentUser={isStudentUser}
                        students={students}
                        schedules={schedules}
                        selectedStudent={selectedStudent || studentProfile}
                        selectedInstitutionalSchedule={selectedInstitutionalSchedule}
                        selectedCredits={selectedCredits}
                        offerCourses={offerCourses}
                        toggleUnavailableDay={toggleUnavailableDay}
                    />

                    <CourseSelectionPanel
                        loading={loadingOfferCourses}
                        search={search}
                        setSearch={setSearch}
                        courses={filteredOfferCourses}
                        selectedCourseIds={form.selected_course_ids}
                        onToggleCourse={toggleCourse}
                        onSelectAll={selectAllVisibleCourses}
                        onClear={clearSelectedCourses}
                    />
                </div>

                <div className="space-y-6 xl:col-span-2">
                    {!preview ? (
                        <PreviewEmptyState />
                    ) : (
                        <>
                            <PreviewSummary
                                preview={preview}
                                selectedSolutionIndex={selectedSolutionIndex}
                                setSelectedSolutionIndex={setSelectedSolutionIndex}
                            />

                            <SolutionsComparator
                                solutions={preview.solutions}
                                selectedSolutionIndex={selectedSolutionIndex}
                                setSelectedSolutionIndex={setSelectedSolutionIndex}
                                onSaveFinal={handleSaveSolutionAsFinal}
                                loadingAction={loadingAction}
                            />

                            {selectedSolution && (
                                <>
                                    <SolutionDetail solution={selectedSolution} />

                                    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                                        <div className="border-b border-slate-200 p-5">
                                            <h2 className="text-xl font-black text-slate-900">
                                                Vista semanal
                                            </h2>
                                            <p className="text-sm text-slate-500">
                                                Distribución de la opción seleccionada.
                                            </p>
                                        </div>

                                        <WeeklyGrid blocksBySlot={selectedBlocksBySlot} />
                                    </section>

                                    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                                <label className="mb-2 block text-sm font-bold text-slate-700">
                                                    Nombre del horario
                                                </label>

                                                <input
                                                    value={form.name}
                                                    onChange={(event) =>
                                                        setForm((current) => ({
                                                            ...current,
                                                            name: event.target.value,
                                                        }))
                                                    }
                                                    className="w-full rounded-xl border border-slate-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                />
                                            </div>

                                            <div className="flex items-end">
                                                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700">
                                                    <input
                                                        type="checkbox"
                                                        checked={form.is_favorite}
                                                        onChange={(event) =>
                                                            setForm((current) => ({
                                                                ...current,
                                                                is_favorite:
                                                                    event.target.checked,
                                                            }))
                                                        }
                                                    />
                                                    Guardar como horario elegido
                                                </label>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleSaveSelected}
                                            disabled={loadingAction === 'save'}
                                            className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-60"
                                        >
                                            {loadingAction === 'save' ? (
                                                <Loader2 size={18} className="animate-spin" />
                                            ) : (
                                                <Save size={18} />
                                            )}
                                            Guardar opción seleccionada
                                        </button>

                                        {savedSchedule && (
                                            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                                                <p className="font-black">
                                                    Horario guardado correctamente.
                                                </p>
                                                <p>
                                                    ID generado:{' '}
                                                    {savedSchedule.student_schedule_id}
                                                </p>
                                            </div>
                                        )}
                                    </section>
                                </>
                            )}
                        </>
                    )}
                </div>
            </section>
        </div>
    )
}

function EnrollmentModePanel({ courses, preview, loading, saving, onGenerate, onSave }) {
    return (
        <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Modo real</p>
                    <h2 className="text-xl font-black text-slate-900">Generar horario con mis cursos matriculados</h2>
                    <p className="mt-1 text-sm text-slate-600">{courses.length} cursos asignados en el periodo activo. Solo se usan secciones publicadas.</p>
                </div>
                <button onClick={onGenerate} disabled={loading} className="flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white disabled:opacity-60">
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <BookOpen size={18} />} Generar modo real
                </button>
            </div>
            {preview?.solutions?.length > 0 && (
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                    {preview.solutions.map((solution) => (
                        <div key={solution.solution_index} className="rounded-2xl bg-white p-4 shadow-sm">
                            <p className="font-black">Alternativa {solution.solution_index + 1} - Score {solution.score}</p>
                            <p className="text-sm text-slate-500">{solution.total_courses} cursos, {solution.total_credits} creditos, {solution.blocks.length} bloques</p>
                            <button onClick={() => onSave(solution.solution_index)} disabled={saving} className="mt-3 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Guardar favorito</button>
                        </div>
                    ))}
                </div>
            )}
            <p className="mt-5 border-t border-emerald-200 pt-4 text-sm text-slate-600">Modo exploracion: el configurador inferior conserva la simulacion anterior sobre oferta publicada.</p>
        </section>
    )
}

function ConfigPanel({
    form,
    setForm,
    isStudentUser,
    students,
    schedules,
    selectedStudent,
    selectedInstitutionalSchedule,
    selectedCredits,
    offerCourses,
    toggleUnavailableDay,
}) {
    return (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-xl font-black text-slate-900">
                Configuración
            </h2>

            <div className="space-y-4">
                <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                        Estudiante
                    </label>

                    {isStudentUser ? (
                        <input
                            disabled
                            value={
                                selectedStudent
                                    ? `${selectedStudent.student_code || 'Estudiante'} | ${selectedStudent.career || ''} | Ciclo ${selectedStudent.current_cycle || '-'}`
                                    : form.student_id
                            }
                            className="w-full rounded-xl border border-slate-300 px-3 py-3 disabled:bg-slate-100"
                        />
                    ) : (
                        <select
                            value={form.student_id}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    student_id: event.target.value,
                                }))
                            }
                            className="w-full rounded-xl border border-slate-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="">Selecciona estudiante</option>
                            {students.map((student) => (
                                <option key={student.id} value={student.id}>
                                    #{student.id} - {student.student_code || 'Estudiante'} |{' '}
                                    {student.career}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                        Horario institucional publicado
                    </label>

                    <select
                        value={form.institutional_schedule_id}
                        onChange={(event) =>
                            setForm((current) => ({
                                ...current,
                                institutional_schedule_id: event.target.value,
                            }))
                        }
                        className="w-full rounded-xl border border-slate-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                        <option value="">Selecciona horario</option>
                        {schedules.map((schedule) => (
                            <option key={schedule.id} value={schedule.id}>
                                #{schedule.id} -{' '}
                                {schedule.name ||
                                    schedule.academic_period ||
                                    'Horario publicado'}
                            </option>
                        ))}
                    </select>

                    {selectedInstitutionalSchedule && (
                        <p className="mt-2 text-xs text-slate-500">
                            Oferta base: #{selectedInstitutionalSchedule.id}
                        </p>
                    )}
                </div>

                <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                        Máximo de créditos
                    </label>

                    <input
                        type="number"
                        min="7"
                        max="25"
                        value={form.target_credits}
                        onChange={(event) =>
                            setForm((current) => ({
                                ...current,
                                target_credits: Number(event.target.value),
                            }))
                        }
                        className="w-full rounded-xl border border-slate-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />

                    <p className="mt-2 text-xs text-slate-500">
                        Créditos seleccionados: {selectedCredits} | Cursos ofertados:{' '}
                        {offerCourses.length}
                    </p>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                        Turno preferido
                    </label>

                    <select
                        value={form.preferred_shift}
                        onChange={(event) =>
                            setForm((current) => ({
                                ...current,
                                preferred_shift: event.target.value,
                            }))
                        }
                        className="w-full rounded-xl border border-slate-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                        {SHIFT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="mb-2 block text-sm font-bold text-slate-700">
                            Máx. soluciones
                        </label>

                        <input
                            type="number"
                            min="1"
                            max="50"
                            value={form.max_solutions}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    max_solutions: Number(event.target.value),
                                }))
                            }
                            className="w-full rounded-xl border border-slate-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-bold text-slate-700">
                            Tolerancia
                        </label>

                        <input
                            type="number"
                            min="0"
                            max="30"
                            value={form.transfer_tolerance_minutes}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    transfer_tolerance_minutes: Number(event.target.value),
                                }))
                            }
                            className="w-full rounded-xl border border-slate-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>
                </div>

                <div>
                    <p className="mb-2 text-sm font-bold text-slate-700">
                        Días no disponibles
                    </p>

                    <div className="flex flex-wrap gap-2">
                        {DAYS.map((day) => {
                            const active = form.unavailable_days.includes(day.id)

                            return (
                                <button
                                    key={day.id}
                                    type="button"
                                    onClick={() => toggleUnavailableDay(day.id)}
                                    className={[
                                        'rounded-xl border px-3 py-2 text-sm font-bold transition',
                                        active
                                            ? 'border-red-300 bg-red-50 text-red-700'
                                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                                    ].join(' ')}
                                >
                                    {day.short}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                    <p>
                        <span className="font-bold">Docentes preferidos:</span>{' '}
                        {form.preferred_teacher_ids?.length || 0}
                    </p>

                    <p className="mt-1">
                        <span className="font-bold">Docentes evitados:</span>{' '}
                        {form.avoided_teacher_ids?.length || 0}
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                        Estas preferencias se usan para ordenar mejor las soluciones generadas.
                    </p>
                </div>

                <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4 text-sm text-slate-700">
                    <input
                        type="checkbox"
                        checked={form.require_all_selected_courses}
                        onChange={(event) =>
                            setForm((current) => ({
                                ...current,
                                require_all_selected_courses: event.target.checked,
                            }))
                        }
                    />

                    <span>
                        <span className="font-bold">
                            Exigir todos los cursos seleccionados
                        </span>
                        <br />
                        <span className="text-xs text-slate-500">
                            Si hay cruces de horarios, puede impedir que se genere una solución.
                        </span>
                    </span>
                </label>
            </div>
        </section>
    )
}

function CourseSelectionPanel({
    loading,
    search,
    setSearch,
    courses,
    selectedCourseIds,
    onToggleCourse,
    onSelectAll,
    onClear,
}) {
    return (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-black text-slate-900">
                        Cursos disponibles
                    </h2>
                    <p className="text-sm text-slate-500">
                        Selecciona los cursos que deseas considerar.
                    </p>
                </div>

                {loading && <Loader2 className="animate-spin text-slate-400" />}
            </div>

            <div className="relative mb-4">
                <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar curso..."
                    className="w-full rounded-xl border border-slate-300 py-3 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
                <button
                    onClick={onSelectAll}
                    type="button"
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
                >
                    Seleccionar visibles
                </button>

                <button
                    onClick={onClear}
                    type="button"
                    className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                    Limpiar
                </button>
            </div>

            <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
                {courses.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                        No hay cursos disponibles con los filtros actuales.
                    </div>
                ) : (
                    courses.map((course) => {
                        const selected = selectedCourseIds.includes(course.course_id)

                        return (
                            <button
                                key={course.course_id}
                                type="button"
                                onClick={() => onToggleCourse(course.course_id)}
                                className={[
                                    'w-full rounded-2xl border p-4 text-left transition',
                                    selected
                                        ? 'border-emerald-300 bg-emerald-50'
                                        : 'border-slate-200 bg-white hover:bg-slate-50',
                                ].join(' ')}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="rounded-lg bg-orange-100 px-2 py-1 text-xs font-black text-orange-700">
                                                {course.course_code}
                                            </span>

                                            {selected && (
                                                <span className="rounded-lg bg-emerald-100 px-2 py-1 text-xs font-black text-emerald-700">
                                                    Seleccionado
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="mt-2 font-black text-slate-900">
                                            {course.course_name}
                                        </h3>

                                        <p className="mt-1 text-xs text-slate-500">
                                            Ciclo {course.cycle} | {course.credits} créditos |{' '}
                                            {course.available_sections} sección(es)
                                        </p>
                                    </div>

                                    {selected && (
                                        <CheckCircle
                                            size={22}
                                            className="shrink-0 text-emerald-600"
                                        />
                                    )}
                                </div>
                            </button>
                        )
                    })
                )}
            </div>
        </section>
    )
}

function PreviewEmptyState() {
    return (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
            <CalendarDays size={44} className="mx-auto mb-4 text-slate-400" />
            <h2 className="mb-2 text-xl font-black text-slate-900">
                Aún no generaste opciones
            </h2>
            <p>
                Selecciona cursos y presiona "Generar opciones" para visualizar horarios posibles.
            </p>
        </div>
    )
}

function PreviewSummary({ preview, selectedSolutionIndex, setSelectedSolutionIndex }) {
    return (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                    <h2 className="text-2xl font-black text-slate-900">
                        Opciones generadas
                    </h2>
                    <p className="text-sm text-slate-500">
                        Se evaluaron {preview.evaluated_solutions} solución(es).
                    </p>
                </div>

                <span className="rounded-2xl bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-700">
                    Mejor score: {formatNumber(preview.best_score)}
                </span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <Metric title="Mín. créditos" value={preview.min_credits} />
                <Metric title="Máx. créditos" value={preview.max_credits} />
                <Metric title="Objetivo" value={preview.target_credits} />
                <Metric title="Mejor índice" value={preview.best_solution_index} />
            </div>

            <div className="mt-5">
                <label className="mb-2 block text-sm font-bold text-slate-700">
                    Seleccionar solución
                </label>

                <select
                    value={selectedSolutionIndex}
                    onChange={(event) =>
                        setSelectedSolutionIndex(Number(event.target.value))
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                    {preview.solutions.map((solution) => (
                        <option key={solution.solution_index} value={solution.solution_index}>
                            Opción {solution.solution_index + 1} | Score{' '}
                            {formatNumber(solution.score)} | {solution.total_credits} créditos |{' '}
                            {solution.total_courses} cursos
                        </option>
                    ))}
                </select>
            </div>
        </section>
    )
}

function SolutionsComparator({
    solutions,
    selectedSolutionIndex,
    setSelectedSolutionIndex,
    onSaveFinal,
    loadingAction,
}) {
    if (!solutions?.length) return null

    const bestScore = Math.max(
        ...solutions.map((solution) => Number(solution.score || 0))
    )

    const closestCreditDifference = Math.min(
        ...solutions.map((solution) =>
            Number(solution.explanation?.metrics?.credit_difference ?? 999)
        )
    )

    const fewestUsedDays = Math.min(
        ...solutions.map((solution) =>
            Number(
                solution.explanation?.metrics?.used_days?.length ||
                    solution.used_days?.length ||
                    999
            )
        )
    )

    return (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
                <h2 className="text-2xl font-black text-slate-900">
                    Comparador de opciones generadas
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    Compara las alternativas, revisa cada opción y guarda la mejor como tu horario final.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {solutions.map((solution) => {
                    const metrics = solution.explanation?.metrics || {}

                    const score = Number(solution.score || 0)
                    const totalCredits = Number(solution.total_credits || 0)
                    const targetCredits = Number(metrics.target_credits || 0)
                    const creditDifference = Number(
                        metrics.credit_difference ??
                            Math.abs(targetCredits - totalCredits)
                    )
                    const usedDaysCount = Number(
                        metrics.used_days?.length || solution.used_days?.length || 0
                    )
                    const totalCourses = Number(solution.total_courses || 0)
                    const teacherPreferenceScore = Number(
                        metrics.teacher_preference_score || 0
                    )
                    const weekendScore = Number(metrics.weekend_score || 0)
                    const lateClassesScore = Number(metrics.late_classes_score || 0)

                    const isSelected =
                        Number(selectedSolutionIndex) === Number(solution.solution_index)

                    const isSaving = loadingAction === `save-${solution.solution_index}`

                    const isBestScore = score === bestScore
                    const isClosestCredits = creditDifference === closestCreditDifference
                    const isFewestDays = usedDaysCount === fewestUsedDays

                    const canSaveFinal = totalCredits >= 7 && totalCredits <= 25

                    const status = getComparatorStatus({
                        score,
                        totalCredits,
                        targetCredits,
                        creditDifference,
                        isBestScore,
                        isClosestCredits,
                    })

                    return (
                        <article
                            key={solution.solution_index}
                            className={[
                                'rounded-3xl border p-5 transition',
                                isSelected
                                    ? 'border-orange-300 bg-orange-50 shadow-sm'
                                    : 'border-slate-200 bg-white hover:bg-slate-50',
                            ].join(' ')}
                        >
                            <div className="mb-4 flex items-start justify-between gap-3">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="rounded-xl bg-slate-900 px-3 py-1 text-xs font-black text-white">
                                            Opción {solution.solution_index + 1}
                                        </span>

                                        {isBestScore && (
                                            <span className="rounded-xl bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
                                                Recomendada
                                            </span>
                                        )}

                                        {isClosestCredits && (
                                            <span className="rounded-xl bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">
                                                Más cercana a créditos
                                            </span>
                                        )}

                                        {isFewestDays && (
                                            <span className="rounded-xl bg-purple-100 px-3 py-1 text-xs font-black text-purple-700">
                                                Menos días
                                            </span>
                                        )}

                                        {canSaveFinal ? (
                                            <span className="rounded-xl bg-green-100 px-3 py-1 text-xs font-black text-green-700">
                                                Válida 7-25 créditos
                                            </span>
                                        ) : (
                                            <span className="rounded-xl bg-red-100 px-3 py-1 text-xs font-black text-red-700">
                                                No permitida
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="mt-3 text-lg font-black text-slate-900">
                                        {status.title}
                                    </h3>

                                    <p className="mt-1 text-sm leading-6 text-slate-600">
                                        {status.description}
                                    </p>
                                </div>

                                <div className="text-right">
                                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                                        Score
                                    </p>
                                    <p className="text-2xl font-black text-orange-700">
                                        {formatNumber(score)}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                                <ComparatorMetric
                                    label="Créditos"
                                    value={
                                        targetCredits
                                            ? `${totalCredits}/${targetCredits}`
                                            : totalCredits
                                    }
                                />

                                <ComparatorMetric
                                    label="Diferencia"
                                    value={creditDifference}
                                />

                                <ComparatorMetric
                                    label="Cursos"
                                    value={totalCourses}
                                />

                                <ComparatorMetric
                                    label="Días"
                                    value={usedDaysCount}
                                />
                            </div>

                            <div className="mt-4 space-y-2 text-sm">
                                {teacherPreferenceScore > 0 && (
                                    <p className="rounded-2xl bg-emerald-50 px-3 py-2 font-semibold text-emerald-700">
                                        Incluye docentes preferidos.
                                    </p>
                                )}

                                {teacherPreferenceScore < 0 && (
                                    <p className="rounded-2xl bg-red-50 px-3 py-2 font-semibold text-red-700">
                                        Incluye docentes que prefieres evitar.
                                    </p>
                                )}

                                {weekendScore < 0 && (
                                    <p className="rounded-2xl bg-orange-50 px-3 py-2 font-semibold text-orange-700">
                                        Tiene clases en fin de semana.
                                    </p>
                                )}

                                {lateClassesScore < 0 && (
                                    <p className="rounded-2xl bg-indigo-50 px-3 py-2 font-semibold text-indigo-700">
                                        Tiene clases nocturnas.
                                    </p>
                                )}
                            </div>

                            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setSelectedSolutionIndex(
                                            Number(solution.solution_index)
                                        )
                                    }
                                    className={[
                                        'rounded-2xl px-4 py-3 text-sm font-black transition',
                                        isSelected
                                            ? 'bg-orange-600 text-white hover:bg-orange-700'
                                            : 'bg-slate-900 text-white hover:bg-slate-800',
                                    ].join(' ')}
                                >
                                    {isSelected ? 'Opción seleccionada' : 'Ver esta opción'}
                                </button>

                                <button
                                    type="button"
                                    disabled={!canSaveFinal || isSaving}
                                    onClick={() =>
                                        onSaveFinal(Number(solution.solution_index))
                                    }
                                    className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isSaving ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Loader2 size={17} className="animate-spin" />
                                            Guardando...
                                        </span>
                                    ) : (
                                        'Elegir como mi horario final'
                                    )}
                                </button>
                            </div>
                        </article>
                    )
                })}
            </div>
        </section>
    )
}

function ComparatorMetric({ label, value }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-center">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {label}
            </p>

            <p className="mt-1 text-lg font-black text-slate-900">
                {value}
            </p>
        </div>
    )
}

function getComparatorStatus({
    score,
    totalCredits,
    targetCredits,
    creditDifference,
    isBestScore,
    isClosestCredits,
}) {
    if (totalCredits < 7) {
        return {
            title: 'No recomendable',
            description:
                'Esta opción está por debajo del mínimo institucional de 7 créditos.',
        }
    }

    if (totalCredits > 25) {
        return {
            title: 'No permitida',
            description:
                'Esta opción supera el máximo institucional de 25 créditos.',
        }
    }

    if (isBestScore && isClosestCredits) {
        return {
            title: 'Mejor opción general',
            description:
                'Tiene el mejor puntaje y además se acerca bien al objetivo de créditos.',
        }
    }

    if (isBestScore) {
        return {
            title: 'Mejor equilibrio general',
            description:
                'Tiene el puntaje más alto considerando créditos, docentes, días, huecos y penalizaciones.',
        }
    }

    if (isClosestCredits) {
        return {
            title: 'Más cercana al objetivo de créditos',
            description:
                'Es una buena opción si priorizas acercarte a la carga académica deseada.',
        }
    }

    if (targetCredits && creditDifference <= 3) {
        return {
            title: 'Carga académica cercana',
            description:
                'La cantidad de créditos está cerca del objetivo configurado por el estudiante.',
        }
    }

    if (score >= 75) {
        return {
            title: 'Opción recomendable',
            description:
                'Es una alternativa válida con buen equilibrio general, aunque tiene algunos puntos mejorables.',
        }
    }

    return {
        title: 'Opción válida',
        description:
            'Cumple las restricciones principales, pero no es la mejor según las preferencias configuradas.',
    }
}

function SolutionDetail({ solution }) {
    return (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                    <h2 className="text-xl font-black text-slate-900">
                        Detalle de la opción {solution.solution_index + 1}
                    </h2>

                    <p className="text-sm text-slate-500">
                        {solution.total_courses} cursos | {solution.total_credits} créditos
                    </p>
                </div>

                <span className="rounded-2xl bg-orange-100 px-4 py-2 text-sm font-black text-orange-700">
                    Score {formatNumber(solution.score)}
                </span>
            </div>

            {solution.explanation && (
                <SolutionExplanation explanation={solution.explanation} />
            )}

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-sm">
                    <thead className="bg-slate-100 text-slate-700">
                        <tr>
                            <th className="px-4 py-3 text-left">Curso</th>
                            <th className="px-4 py-3 text-left">Sección</th>
                            <th className="px-4 py-3 text-left">Docente</th>
                            <th className="px-4 py-3 text-left">Día</th>
                            <th className="px-4 py-3 text-left">Hora</th>
                            <th className="px-4 py-3 text-left">Aula</th>
                        </tr>
                    </thead>

                    <tbody>
                        {solution.blocks.map((block, index) => (
                            <tr
                                key={`${block.schedule_block_id}-${index}`}
                                className="border-t border-slate-200"
                            >
                                <td className="px-4 py-3">
                                    <p className="font-bold text-slate-900">
                                        {block.course_name}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {block.course_code} | {block.credits} créditos
                                    </p>
                                </td>

                                <td className="px-4 py-3">
                                    {block.section_code || block.section_id}
                                </td>

                                <td className="px-4 py-3">
                                    <p className="font-bold text-slate-900">
                                        {block.teacher_name || 'Sin docente'}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {block.teacher_code || ''}
                                    </p>
                                </td>

                                <td className="px-4 py-3">
                                    {DAYS.find((day) => day.id === block.day_of_week)?.label ||
                                        block.day_of_week}
                                </td>

                                <td className="px-4 py-3">
                                    {formatShortTime(block.start_time)} -{' '}
                                    {formatShortTime(block.end_time)}
                                </td>

                                <td className="px-4 py-3">
                                    {block.classroom_code || block.classroom_id || '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    )
}

function SolutionExplanation({ explanation }) {
    return (
        <div className="mb-6 rounded-3xl border border-blue-200 bg-blue-50 p-5">
            <div className="mb-4">
                <h3 className="text-lg font-black text-blue-950">
                    ¿Por qué se recomienda esta opción?
                </h3>

                <p className="mt-2 text-sm leading-6 text-blue-900">
                    {explanation.summary}
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <h4 className="mb-3 font-black text-emerald-700">
                        Puntos fuertes
                    </h4>

                    <ul className="space-y-2 text-sm text-slate-700">
                        {(explanation.strengths || []).map((item, index) => (
                            <li key={index} className="flex gap-2">
                                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <h4 className="mb-3 font-black text-orange-700">
                        Observaciones
                    </h4>

                    <ul className="space-y-2 text-sm text-slate-700">
                        {(explanation.warnings || []).map((item, index) => (
                            <li key={index} className="flex gap-2">
                                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-orange-500" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {explanation.metrics && (
                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                    <SmallMetric
                        label="Créditos"
                        value={`${explanation.metrics.total_credits}/${explanation.metrics.target_credits}`}
                    />

                    <SmallMetric
                        label="Diferencia"
                        value={explanation.metrics.credit_difference}
                    />

                    <SmallMetric
                        label="Cursos"
                        value={explanation.metrics.total_courses}
                    />

                    <SmallMetric
                        label="Días usados"
                        value={explanation.metrics.used_days?.length || 0}
                    />
                </div>
            )}
        </div>
    )
}

function SmallMetric({ label, value }) {
    return (
        <div className="rounded-2xl bg-white px-4 py-3 text-center shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {label}
            </p>

            <p className="mt-1 text-lg font-black text-slate-900">
                {value}
            </p>
        </div>
    )
}

function WeeklyGrid({ blocksBySlot }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-sm">
                <thead>
                    <tr className="bg-slate-100 text-slate-700">
                        <th className="w-32 border-r border-slate-200 px-4 py-4 text-left">
                            Hora
                        </th>

                        {DAYS.map((day) => (
                            <th
                                key={day.id}
                                className="border-r border-slate-200 px-4 py-4 text-left"
                            >
                                {day.label}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {TIME_ROWS.map((startTime) => (
                        <tr key={startTime} className="border-t border-slate-200">
                            <td className="border-r border-slate-200 bg-slate-50 px-4 py-4 align-top font-bold text-slate-700">
                                {formatShortTime(startTime)}
                            </td>

                            {DAYS.map((day) => {
                                const key = `${day.id}-${startTime}`
                                const cellBlocks = blocksBySlot[key] || []

                                return (
                                    <td
                                        key={day.id}
                                        className="border-r border-slate-200 px-3 py-3 align-top"
                                    >
                                        {cellBlocks.length === 0 ? (
                                            <div className="h-24 rounded-2xl border border-dashed border-slate-200 bg-slate-50" />
                                        ) : (
                                            <div className="space-y-2">
                                                {cellBlocks.map((block, index) => (
                                                    <StudentBlockCard
                                                        key={`${block.schedule_block_id}-${index}`}
                                                        block={block}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                )
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

function StudentBlockCard({ block }) {
    return (
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
                <span className="rounded-lg bg-orange-100 px-2 py-1 text-xs font-black text-orange-700">
                    {block.course_code || `Curso ${block.course_id}`}
                </span>

                <span className="text-xs font-semibold text-slate-500">
                    {block.classroom_code || `Aula ${block.classroom_id || '-'}`}
                </span>
            </div>

            <h3 className="text-sm font-black leading-snug text-slate-900">
                {block.course_name}
            </h3>

            <p className="mt-1 text-xs text-slate-600">
                Sección {block.section_code || block.section_id}
            </p>

            <p className="mt-1 text-xs text-slate-600">
                Docente: {block.teacher_name || block.teacher_code || 'Sin docente'}
            </p>

            <p className="mt-2 text-sm font-black text-orange-700">
                {formatShortTime(block.start_time)} - {formatShortTime(block.end_time)}
            </p>
        </div>
    )
}

function Metric({ title, value }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold text-slate-500">{title}</p>
            <p className="mt-1 text-xl font-black text-slate-900">{value}</p>
        </div>
    )
}

function extractList(data) {
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.items)) return data.items
    if (Array.isArray(data?.data)) return data.data
    if (Array.isArray(data?.results)) return data.results
    if (Array.isArray(data?.schedules)) return data.schedules
    if (Array.isArray(data?.students)) return data.students
    return []
}

function normalizeTime(value) {
    if (!value) return ''
    if (String(value).length === 5) return `${value}:00`
    return String(value)
}

function formatShortTime(value) {
    if (!value) return '-'
    return String(value).slice(0, 5)
}

function formatNumber(value) {
    if (value === null || value === undefined || value === '') return '-'

    const numberValue = Number(value)

    if (Number.isNaN(numberValue)) return value

    return numberValue.toFixed(2)
}

function getErrorMessage(error, fallback = 'Ocurrió un error') {
    const detail = error.response?.data?.detail

    if (!detail) return fallback

    if (typeof detail === 'string') return detail

    if (Array.isArray(detail)) {
        return detail.map((item) => item.msg || JSON.stringify(item)).join(' | ')
    }

    if (typeof detail === 'object') {
        return detail.msg || JSON.stringify(detail)
    }

    return fallback
}
