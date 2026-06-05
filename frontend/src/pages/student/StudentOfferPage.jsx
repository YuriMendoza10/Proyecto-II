import { useEffect, useMemo, useState } from 'react'
import StudentFlowGuide from '../../components/student/StudentFlowGuide'
import { useNavigate } from 'react-router-dom'
import {
    Ban,
    BookOpen,
    CheckCircle,
    GraduationCap,
    Loader2,
    RefreshCcw,
    Search,
    Sparkles,
    Star,
    UserRound,
    Users,
    XCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'

import { studentCspService } from '../../services/studentCspService'
import { scheduleService } from '../../services/scheduleService'

const DAYS = {
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado',
    7: 'Domingo',
}

const DAY_OPTIONS = [
    { id: 1, label: 'Lunes' },
    { id: 2, label: 'Martes' },
    { id: 3, label: 'Miércoles' },
    { id: 4, label: 'Jueves' },
    { id: 5, label: 'Viernes' },
    { id: 6, label: 'Sábado' },
    { id: 7, label: 'Domingo' },
]

const STORAGE_SELECTED_COURSES_KEY = 'optiacademic_student_selected_course_ids'
const STORAGE_OFFER_CONTEXT_KEY = 'optiacademic_student_offer_context'
const STORAGE_PREFERRED_TEACHERS_KEY = 'optiacademic_student_preferred_teacher_ids'
const STORAGE_AVOIDED_TEACHERS_KEY = 'optiacademic_student_avoided_teacher_ids'

export default function StudentOfferPage() {
    const navigate = useNavigate()

    const [activeTab, setActiveTab] = useState('COURSES')
    const [studentProfile, setStudentProfile] = useState(null)
    const [institutionalSchedules, setInstitutionalSchedules] = useState([])
    const [offerDetail, setOfferDetail] = useState(null)
    const [publishedSectionOfferings, setPublishedSectionOfferings] = useState([])

    const [form, setForm] = useState({
        student_id: '',
        institutional_schedule_id: '',
        unavailable_days: [],
    })

    const [search, setSearch] = useState('')
    const [selectedDay, setSelectedDay] = useState('ALL')
    const [selectedCourseIds, setSelectedCourseIds] = useState([])
    const [preferredTeacherIds, setPreferredTeacherIds] = useState([])
    const [avoidedTeacherIds, setAvoidedTeacherIds] = useState([])

    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)

    const filteredCourses = useMemo(() => {
        const courses = offerDetail?.courses || []

        return courses
            .map((course) => {
                const filteredSections = (course.sections || []).filter((section) => {
                    const query = search.trim().toLowerCase()

                    const matchesSearch =
                        !query ||
                        course.course_code?.toLowerCase().includes(query) ||
                        course.course_name?.toLowerCase().includes(query) ||
                        section.section_code?.toLowerCase().includes(query) ||
                        section.teacher_name?.toLowerCase().includes(query) ||
                        section.teacher_code?.toLowerCase().includes(query) ||
                        section.teacher_specialty?.toLowerCase().includes(query)

                    const matchesDay =
                        selectedDay === 'ALL' ||
                        section.blocks?.some(
                            (block) => Number(block.day_of_week) === Number(selectedDay)
                        )

                    return matchesSearch && matchesDay
                })

                return {
                    ...course,
                    sections: filteredSections,
                }
            })
            .filter((course) => course.sections.length > 0)
    }, [offerDetail, search, selectedDay])

    const teacherGroups = useMemo(() => {
        const map = new Map()
        const courses = offerDetail?.courses || []
        const query = search.trim().toLowerCase()

        for (const course of courses) {
            for (const section of course.sections || []) {
                const matchesDay =
                    selectedDay === 'ALL' ||
                    section.blocks?.some(
                        (block) => Number(block.day_of_week) === Number(selectedDay)
                    )

                const matchesSearch =
                    !query ||
                    section.teacher_name?.toLowerCase().includes(query) ||
                    section.teacher_code?.toLowerCase().includes(query) ||
                    section.teacher_specialty?.toLowerCase().includes(query) ||
                    course.course_code?.toLowerCase().includes(query) ||
                    course.course_name?.toLowerCase().includes(query) ||
                    section.section_code?.toLowerCase().includes(query)

                if (!matchesDay || !matchesSearch) continue

                const teacherKey = section.teacher_id || `NO_TEACHER_${section.section_id}`

                if (!map.has(teacherKey)) {
                    map.set(teacherKey, {
                        teacher_id: section.teacher_id,
                        teacher_code: section.teacher_code,
                        teacher_name: section.teacher_name || 'Sin docente asignado',
                        teacher_specialty: section.teacher_specialty,
                        teacher_rating: section.teacher_rating,
                        teacher_availability: section.teacher_availability || [],
                        assignments: [],
                    })
                }

                map.get(teacherKey).assignments.push({
                    course_id: course.course_id,
                    course_code: course.course_code,
                    course_name: course.course_name,
                    credits: course.credits,
                    cycle: course.cycle,
                    section_id: section.section_id,
                    section_code: section.section_code,
                    blocks: section.blocks || [],
                })
            }
        }

        return Array.from(map.values()).sort((a, b) => {
            return String(a.teacher_name).localeCompare(String(b.teacher_name))
        })
    }, [offerDetail, search, selectedDay])

    const totalVisibleSections = useMemo(() => {
        return filteredCourses.reduce(
            (total, course) => total + course.sections.length,
            0
        )
    }, [filteredCourses])

    const selectedCredits = useMemo(() => {
        const courses = offerDetail?.courses || []

        return courses
            .filter((course) => selectedCourseIds.includes(Number(course.course_id)))
            .reduce((total, course) => total + Number(course.credits || 0), 0)
    }, [offerDetail, selectedCourseIds])

    const loadInitialData = async () => {
        setInitialLoading(true)

        try {
            const schedulesData = scheduleService.getPublishedSchedules
                ? await scheduleService.getPublishedSchedules()
                : scheduleService.getSchedules
                  ? await scheduleService.getSchedules()
                  : scheduleService.getAll
                    ? await scheduleService.getAll()
                    : []

            const schedulesList = extractList(schedulesData)

            const publishedSchedules = schedulesList.filter((schedule) => {
                const status = schedule.status?.value || schedule.status
                return status === 'PUBLISHED' || schedule.is_active
            })

            setInstitutionalSchedules(publishedSchedules)

            const profile = await studentCspService.getMyStudentProfile()
            setStudentProfile(profile)
            setPublishedSectionOfferings(await studentCspService.getMyPublishedSections())

            const selectedSchedule =
                publishedSchedules.find((schedule) => {
                    const status = schedule.status?.value || schedule.status
                    return status === 'PUBLISHED'
                }) ||
                publishedSchedules[0] ||
                null

            setForm((current) => ({
                ...current,
                student_id: profile?.id || '',
                institutional_schedule_id:
                    selectedSchedule?.id || current.institutional_schedule_id || '',
            }))

            setSelectedCourseIds(readNumberArrayFromStorage(STORAGE_SELECTED_COURSES_KEY))
            setPreferredTeacherIds(readNumberArrayFromStorage(STORAGE_PREFERRED_TEACHERS_KEY))
            setAvoidedTeacherIds(readNumberArrayFromStorage(STORAGE_AVOIDED_TEACHERS_KEY))
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudo cargar la información inicial'))
        } finally {
            setInitialLoading(false)
        }
    }

    const loadOfferDetail = async () => {
        if (!form.student_id || !form.institutional_schedule_id) {
            toast.error('Selecciona un horario institucional publicado')
            return
        }

        setLoading(true)

        try {
            const data = await studentCspService.getOfferDetail({
                student_id: Number(form.student_id),
                institutional_schedule_id: Number(form.institutional_schedule_id),
                unavailable_days: form.unavailable_days,
            })

            setOfferDetail(data)

            const validCourseIds = new Set(
                (data?.courses || []).map((course) => Number(course.course_id))
            )

            const validTeacherIds = new Set()

            for (const course of data?.courses || []) {
                for (const section of course.sections || []) {
                    if (section.teacher_id) {
                        validTeacherIds.add(Number(section.teacher_id))
                    }
                }
            }

            setSelectedCourseIds((current) =>
                current.filter((courseId) => validCourseIds.has(Number(courseId)))
            )

            setPreferredTeacherIds((current) =>
                current.filter((teacherId) => validTeacherIds.has(Number(teacherId)))
            )

            setAvoidedTeacherIds((current) =>
                current.filter((teacherId) => validTeacherIds.has(Number(teacherId)))
            )
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudo cargar la oferta académica'))
        } finally {
            setLoading(false)
        }
    }

    const toggleUnavailableDay = (dayId) => {
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

    const toggleSelectedCourse = (courseId) => {
        const id = Number(courseId)

        setSelectedCourseIds((current) => {
            const exists = current.includes(id)

            if (exists) {
                return current.filter((item) => item !== id)
            }

            return [...current, id]
        })
    }

    const selectAllVisibleCourses = () => {
        const ids = filteredCourses.map((course) => Number(course.course_id))
        setSelectedCourseIds(ids)
    }

    const clearSelectedCourses = () => {
        setSelectedCourseIds([])
        localStorage.removeItem(STORAGE_SELECTED_COURSES_KEY)
    }

    const preferTeacher = (teacherId) => {
        if (!teacherId) {
            toast.error('Este docente no tiene ID válido')
            return
        }

        const id = Number(teacherId)

        setAvoidedTeacherIds((current) => current.filter((item) => Number(item) !== id))

        setPreferredTeacherIds((current) => {
            if (current.includes(id)) return current
            return [...current, id]
        })

        toast.success('Docente marcado como preferido')
    }

    const avoidTeacher = (teacherId) => {
        if (!teacherId) {
            toast.error('Este docente no tiene ID válido')
            return
        }

        const id = Number(teacherId)

        setPreferredTeacherIds((current) => current.filter((item) => Number(item) !== id))

        setAvoidedTeacherIds((current) => {
            if (current.includes(id)) return current
            return [...current, id]
        })

        toast.success('Docente marcado como evitado')
    }

    const clearTeacherPreference = (teacherId) => {
        const id = Number(teacherId)

        setPreferredTeacherIds((current) => current.filter((item) => Number(item) !== id))
        setAvoidedTeacherIds((current) => current.filter((item) => Number(item) !== id))

        toast.success('Preferencia de docente eliminada')
    }

    const clearAllTeacherPreferences = () => {
        setPreferredTeacherIds([])
        setAvoidedTeacherIds([])
        localStorage.removeItem(STORAGE_PREFERRED_TEACHERS_KEY)
        localStorage.removeItem(STORAGE_AVOIDED_TEACHERS_KEY)
        toast.success('Preferencias de docentes limpiadas')
    }

    const handleGenerateWithSelection = () => {
        if (!form.student_id || !form.institutional_schedule_id) {
            toast.error('Primero carga una oferta académica')
            return
        }

        if (selectedCourseIds.length === 0) {
            toast.error('Selecciona al menos un curso')
            return
        }

        localStorage.setItem(
            STORAGE_SELECTED_COURSES_KEY,
            JSON.stringify(selectedCourseIds)
        )

        localStorage.setItem(
            STORAGE_PREFERRED_TEACHERS_KEY,
            JSON.stringify(preferredTeacherIds)
        )

        localStorage.setItem(
            STORAGE_AVOIDED_TEACHERS_KEY,
            JSON.stringify(avoidedTeacherIds)
        )

        localStorage.setItem(
            STORAGE_OFFER_CONTEXT_KEY,
            JSON.stringify({
                student_id: Number(form.student_id),
                institutional_schedule_id: Number(form.institutional_schedule_id),
                unavailable_days: form.unavailable_days,
                target_credits: selectedCredits || studentProfile?.max_credits || 25,
                preferred_teacher_ids: preferredTeacherIds,
                avoided_teacher_ids: avoidedTeacherIds,
            })
        )

        toast.success('Selección enviada al generador')
        navigate('/student/schedule-generator')
    }

    useEffect(() => {
        loadInitialData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (form.student_id && form.institutional_schedule_id) {
            loadOfferDetail()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.student_id, form.institutional_schedule_id, form.unavailable_days.join(',')])

    useEffect(() => {
        localStorage.setItem(
            STORAGE_PREFERRED_TEACHERS_KEY,
            JSON.stringify(preferredTeacherIds)
        )
    }, [preferredTeacherIds])

    useEffect(() => {
        localStorage.setItem(
            STORAGE_AVOIDED_TEACHERS_KEY,
            JSON.stringify(avoidedTeacherIds)
        )
    }, [avoidedTeacherIds])

    if (initialLoading) {
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
                            <BookOpen size={28} />
                        </div>

                        <div>
                            <h1 className="text-3xl font-black">
                                Oferta académica
                            </h1>
                            <p className="mt-1 max-w-2xl text-sm text-slate-300">
                                Revisa cursos y docentes por separado antes de generar tu horario.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={loadOfferDetail}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-bold text-slate-100 transition hover:bg-slate-700 disabled:opacity-60"
                    >
                        <RefreshCcw
                            size={18}
                            className={loading ? 'animate-spin' : ''}
                        />
                        Recargar oferta
                    </button>
                </div>
            </section>

            <StudentFlowGuide currentStep="offer" />

            {publishedSectionOfferings.length > 0 && (
                <section className="rounded-3xl border border-emerald-200 bg-white p-5 shadow-sm">
                    <div className="mb-4">
                        <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Oferta oficial publicada</p>
                        <h2 className="text-xl font-black text-slate-900">Secciones de tus cursos asignados</h2>
                        <p className="text-sm text-slate-500">Solo se muestran cursos matriculados o asignados con secciones publicadas del periodo activo.</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-50 text-left">
                                <tr><th className="p-3">Curso</th><th>Seccion</th><th>Docente</th><th>Cupos</th><th>Modalidad</th><th>Turno</th></tr>
                            </thead>
                            <tbody>
                                {publishedSectionOfferings.map((offering) => (
                                    <tr key={offering.section_offering_id} className="border-t">
                                        <td className="p-3 font-semibold">{offering.course_name}</td>
                                        <td>{offering.section_code}</td>
                                        <td>{offering.teacher_name || 'Por asignar'}</td>
                                        <td>{offering.estimated_students} / {offering.capacity}</td>
                                        <td>{offering.modality}</td>
                                        <td>{offering.shift}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div>
                        <label htmlFor="student-offer-search" className="mb-2 block text-sm font-bold text-slate-700">
                            Estudiante
                        </label>

                        <input
                            type="text"
                            value={
                                studentProfile
                                    ? `${studentProfile.student_code || 'Estudiante'} | ${studentProfile.career || ''} | Ciclo ${studentProfile.current_cycle || '-'}`
                                    : form.student_id
                            }
                            disabled
                            className="w-full rounded-xl border border-slate-300 px-3 py-3 disabled:bg-slate-100"
                        />

                        {studentProfile && (
                            <p className="mt-2 text-xs text-slate-500">
                                ID estudiante: {studentProfile.id}
                            </p>
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
                            <option value="">Selecciona un horario</option>

                            {institutionalSchedules.map((schedule) => (
                                <option key={schedule.id} value={schedule.id}>
                                    #{schedule.id} -{' '}
                                    {schedule.name ||
                                        schedule.academic_period ||
                                        'Horario publicado'}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-bold text-slate-700">
                            Buscar
                        </label>

                        <div className="relative">
                            <Search
                                size={17}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                id="student-offer-search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Curso, docente, sección..."
                                className="w-full rounded-xl border border-slate-300 py-3 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-5">
                    <p className="mb-2 text-sm font-bold text-slate-700">
                        Días que no deseas considerar
                    </p>

                    <div className="flex flex-wrap gap-2">
                        {DAY_OPTIONS.map((day) => {
                            const active = form.unavailable_days.includes(day.id)

                            return (
                                <button
                                    key={day.id}
                                    type="button"
                                    onClick={() => toggleUnavailableDay(day.id)}
                                    aria-pressed={active}
                                    className={[
                                        'rounded-xl border px-3 py-2 text-sm font-bold transition',
                                        active
                                            ? 'border-red-300 bg-red-50 text-red-700'
                                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                                    ].join(' ')}
                                >
                                    {day.label}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div className="mt-5">
                    <p className="mb-2 text-sm font-bold text-slate-700">
                        Filtrar por día con clases
                    </p>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => setSelectedDay('ALL')}
                            aria-pressed={selectedDay === 'ALL'}
                            className={[
                                'rounded-xl border px-3 py-2 text-sm font-bold transition',
                                selectedDay === 'ALL'
                                    ? 'border-orange-300 bg-orange-50 text-orange-700'
                                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                            ].join(' ')}
                        >
                            Todos
                        </button>

                        {DAY_OPTIONS.map((day) => (
                            <button
                                key={day.id}
                                type="button"
                                onClick={() => setSelectedDay(day.id)}
                                aria-pressed={Number(selectedDay) === day.id}
                                className={[
                                    'rounded-xl border px-3 py-2 text-sm font-bold transition',
                                    Number(selectedDay) === day.id
                                        ? 'border-orange-300 bg-orange-50 text-orange-700'
                                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                                ].join(' ')}
                            >
                                {day.label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {offerDetail && (
                <section className="grid grid-cols-1 gap-5 md:grid-cols-5">
                    <MetricCard
                        title="Cursos"
                        value={filteredCourses.length}
                        icon={<BookOpen size={24} />}
                    />
                    <MetricCard
                        title="Docentes"
                        value={teacherGroups.length}
                        icon={<Users size={24} />}
                    />
                    <MetricCard
                        title="Secciones"
                        value={totalVisibleSections}
                        icon={<GraduationCap size={24} />}
                    />
                    <MetricCard
                        title="Preferidos"
                        value={preferredTeacherIds.length}
                        icon={<Star size={24} />}
                    />
                    <MetricCard
                        title="Evitados"
                        value={avoidedTeacherIds.length}
                        icon={<Ban size={24} />}
                    />
                </section>
            )}

            {offerDetail && (
                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                        <div className="flex flex-wrap gap-2">
                            <TabButton
                                active={activeTab === 'COURSES'}
                                onClick={() => setActiveTab('COURSES')}
                                icon={<BookOpen size={18} />}
                            >
                                Cursos
                            </TabButton>

                            <TabButton
                                active={activeTab === 'TEACHERS'}
                                onClick={() => setActiveTab('TEACHERS')}
                                icon={<UserRound size={18} />}
                            >
                                Docentes
                            </TabButton>
                        </div>

                        <div className="flex flex-col gap-3 md:flex-row md:items-center">
                            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                                <span className="font-bold">
                                    Cursos seleccionados:
                                </span>{' '}
                                {selectedCourseIds.length} |{' '}
                                <span className="font-bold">Créditos:</span>{' '}
                                {selectedCredits} |{' '}
                                <span className="font-bold">Docentes preferidos:</span>{' '}
                                {preferredTeacherIds.length} |{' '}
                                <span className="font-bold">Evitados:</span>{' '}
                                {avoidedTeacherIds.length}
                            </div>

                            <button
                                onClick={handleGenerateWithSelection}
                                disabled={selectedCourseIds.length === 0}
                                className="flex items-center justify-center gap-2 rounded-2xl bg-orange-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-700 disabled:bg-slate-400"
                            >
                                <Sparkles size={18} />
                                Generar con selección
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {loading ? (
                <div className="flex justify-center rounded-3xl border border-slate-200 bg-white py-20 text-slate-500">
                    <Loader2 className="animate-spin" />
                </div>
            ) : !offerDetail ? (
                <EmptyOfferState />
            ) : activeTab === 'COURSES' ? (
                <section className="space-y-6">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={selectAllVisibleCourses}
                            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
                        >
                            Seleccionar cursos visibles
                        </button>

                        <button
                            onClick={clearSelectedCourses}
                            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                        >
                            Limpiar cursos
                        </button>
                    </div>

                    {filteredCourses.length === 0 ? (
                        <EmptyFilteredState />
                    ) : (
                        filteredCourses.map((course) => (
                            <CourseOfferCard
                                key={course.course_id}
                                course={course}
                                selected={selectedCourseIds.includes(Number(course.course_id))}
                                onToggle={() => toggleSelectedCourse(course.course_id)}
                            />
                        ))
                    )}
                </section>
            ) : (
                <section className="space-y-6">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={clearAllTeacherPreferences}
                            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                        >
                            Limpiar preferencias de docentes
                        </button>
                    </div>

                    {teacherGroups.length === 0 ? (
                        <EmptyFilteredState />
                    ) : (
                        teacherGroups.map((teacher) => (
                            <TeacherOfferCard
                                key={teacher.teacher_id || teacher.teacher_name}
                                teacher={teacher}
                                isPreferred={preferredTeacherIds.includes(Number(teacher.teacher_id))}
                                isAvoided={avoidedTeacherIds.includes(Number(teacher.teacher_id))}
                                onPrefer={() => preferTeacher(teacher.teacher_id)}
                                onAvoid={() => avoidTeacher(teacher.teacher_id)}
                                onClear={() => clearTeacherPreference(teacher.teacher_id)}
                            />
                        ))
                    )}
                </section>
            )}
        </div>
    )
}

function CourseOfferCard({ course, selected, onToggle }) {
    return (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-xl bg-orange-100 px-3 py-1 text-sm font-black text-orange-700">
                                {course.course_code}
                            </span>

                            <span className="rounded-xl bg-slate-200 px-3 py-1 text-sm font-bold text-slate-700">
                                Ciclo {course.cycle}
                            </span>

                            <span className="rounded-xl bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">
                                {course.credits} créditos
                            </span>
                        </div>

                        <h2 className="mt-3 text-xl font-black text-slate-900">
                            {course.course_name}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            {course.career} | {course.weekly_hours} horas semanales
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 md:items-end">
                        <button
                            type="button"
                            onClick={onToggle}
                            className={[
                                'flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition',
                                selected
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                    : 'bg-slate-900 text-white hover:bg-slate-800',
                            ].join(' ')}
                        >
                            {selected ? (
                                <>
                                    <CheckCircle size={18} />
                                    Seleccionado
                                </>
                            ) : (
                                <>
                                    <BookOpen size={18} />
                                    Seleccionar curso
                                </>
                            )}
                        </button>

                        <div className="rounded-2xl bg-white px-4 py-3 text-center shadow-sm">
                            <p className="text-xs font-semibold text-slate-500">
                                Secciones
                            </p>
                            <p className="text-2xl font-black text-slate-900">
                                {course.sections.length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 p-5 xl:grid-cols-2">
                {course.sections.map((section) => (
                    <SectionCard key={section.section_id} section={section} />
                ))}
            </div>
        </div>
    )
}

function TeacherOfferCard({
    teacher,
    isPreferred,
    isAvoided,
    onPrefer,
    onAvoid,
    onClear,
}) {
    return (
        <div
            className={[
                'overflow-hidden rounded-3xl border bg-white shadow-sm',
                isPreferred
                    ? 'border-emerald-300'
                    : isAvoided
                      ? 'border-red-300'
                      : 'border-slate-200',
            ].join(' ')}
        >
            <div className="border-b border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div className="flex items-start gap-4">
                        <div
                            className={[
                                'flex h-14 w-14 items-center justify-center rounded-2xl',
                                isPreferred
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : isAvoided
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-orange-100 text-orange-700',
                            ].join(' ')}
                        >
                            <UserRound size={28} />
                        </div>

                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-xl font-black text-slate-900">
                                    {teacher.teacher_name}
                                </h2>

                                {isPreferred && (
                                    <span className="rounded-xl bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
                                        Preferido
                                    </span>
                                )}

                                {isAvoided && (
                                    <span className="rounded-xl bg-red-100 px-3 py-1 text-xs font-black text-red-700">
                                        Evitado
                                    </span>
                                )}
                            </div>

                            <p className="mt-1 text-sm text-slate-500">
                                {teacher.teacher_code || 'Sin código'} |{' '}
                                {teacher.teacher_specialty || 'Sin especialidad'}
                            </p>

                            <p className="mt-2 flex items-center gap-1 text-sm font-bold text-yellow-600">
                                Rating: {formatNumber(teacher.teacher_rating)}
                                <Star size={15} fill="currentColor" />
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 md:items-end">
                        <div className="rounded-2xl bg-white px-4 py-3 text-center shadow-sm">
                            <p className="text-xs font-semibold text-slate-500">
                                Cursos / secciones
                            </p>
                            <p className="text-2xl font-black text-slate-900">
                                {teacher.assignments.length}
                            </p>
                        </div>

                        <div className="flex flex-wrap justify-end gap-2">
                            <button
                                type="button"
                                onClick={onPrefer}
                                disabled={!teacher.teacher_id || isPreferred}
                                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black text-white hover:bg-emerald-700 disabled:bg-slate-400"
                            >
                                <Star size={14} />
                                Preferir
                            </button>

                            <button
                                type="button"
                                onClick={onAvoid}
                                disabled={!teacher.teacher_id || isAvoided}
                                className="flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-xs font-black text-white hover:bg-red-700 disabled:bg-slate-400"
                            >
                                <Ban size={14} />
                                Evitar
                            </button>

                            {(isPreferred || isAvoided) && (
                                <button
                                    type="button"
                                    onClick={onClear}
                                    className="flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50"
                                >
                                    <XCircle size={14} />
                                    Quitar
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5 p-5 xl:grid-cols-2">
                <div>
                    <h3 className="mb-3 font-black text-slate-900">
                        Cursos que enseña
                    </h3>

                    <div className="space-y-3">
                        {teacher.assignments.map((assignment) => (
                            <div
                                key={`${assignment.course_id}-${assignment.section_id}`}
                                className="rounded-2xl border border-orange-200 bg-orange-50 p-4"
                            >
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                    <span className="rounded-lg bg-orange-100 px-2 py-1 text-xs font-black text-orange-700">
                                        {assignment.course_code}
                                    </span>

                                    <span className="rounded-lg bg-white px-2 py-1 text-xs font-bold text-slate-600">
                                        Sección {assignment.section_code}
                                    </span>

                                    <span className="rounded-lg bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700">
                                        {assignment.credits} créditos
                                    </span>
                                </div>

                                <h4 className="font-black text-slate-900">
                                    {assignment.course_name}
                                </h4>

                                <div className="mt-3 space-y-2">
                                    {assignment.blocks.map((block) => (
                                        <BlockPill
                                            key={block.schedule_block_id}
                                            block={block}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="mb-3 font-black text-slate-900">
                        Disponibilidad del docente
                    </h3>

                    {teacher.teacher_availability?.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                            No hay disponibilidad registrada.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-2">
                            {teacher.teacher_availability.map((availability, index) => (
                                <div
                                    key={`${availability.day_of_week}-${availability.start_time}-${index}`}
                                    className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700"
                                >
                                    <span className="font-bold">
                                        {DAYS[availability.day_of_week]}:
                                    </span>{' '}
                                    {formatShortTime(availability.start_time)} -{' '}
                                    {formatShortTime(availability.end_time)}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function SectionCard({ section }) {
    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-lg font-black text-slate-900">
                        Sección {section.section_code || section.section_id}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        ID sección: {section.section_id}
                    </p>
                </div>

                <span className="rounded-xl bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
                    {section.blocks.length} bloque(s)
                </span>
            </div>

            <div className="mb-4 rounded-2xl bg-slate-50 p-4">
                <div className="mb-3 flex items-center gap-2 text-slate-900">
                    <UserRound size={18} className="text-orange-600" />
                    <p className="font-black">
                        {section.teacher_name || 'Sin docente asignado'}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-2 text-sm text-slate-600 md:grid-cols-2">
                    <p>
                        <span className="font-bold">Código:</span>{' '}
                        {section.teacher_code || '-'}
                    </p>

                    <p>
                        <span className="font-bold">Especialidad:</span>{' '}
                        {section.teacher_specialty || '-'}
                    </p>

                    <p className="flex items-center gap-1">
                        <span className="font-bold">Rating:</span>{' '}
                        {formatNumber(section.teacher_rating)}
                        <Star size={14} className="text-yellow-500" fill="currentColor" />
                    </p>
                </div>
            </div>

            <div>
                <h4 className="mb-3 font-black text-slate-900">
                    Horarios de clase
                </h4>

                <div className="space-y-2">
                    {section.blocks.map((block) => (
                        <BlockPill key={block.schedule_block_id} block={block} />
                    ))}
                </div>
            </div>

            <div className="mt-5">
                <h4 className="mb-3 font-black text-slate-900">
                    Disponibilidad del docente
                </h4>

                {section.teacher_availability.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                        No hay disponibilidad registrada.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        {section.teacher_availability.map((availability, index) => (
                            <div
                                key={`${availability.day_of_week}-${availability.start_time}-${index}`}
                                className="rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-700"
                            >
                                <span className="font-bold">
                                    {DAYS[availability.day_of_week]}:
                                </span>{' '}
                                {formatShortTime(availability.start_time)} -{' '}
                                {formatShortTime(availability.end_time)}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

function BlockPill({ block }) {
    return (
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-3">
            <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
                <div>
                    <p className="font-black text-orange-800">
                        {DAYS[block.day_of_week]} | {formatShortTime(block.start_time)} -{' '}
                        {formatShortTime(block.end_time)}
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                        Aula: {block.classroom_code || '-'} |{' '}
                        {block.classroom_name || 'Sin aula'}
                    </p>
                </div>

                <span className="rounded-xl bg-white px-3 py-1 text-xs font-bold text-slate-600">
                    Bloque #{block.schedule_block_id}
                </span>
            </div>
        </div>
    )
}

function MetricCard({ title, value, icon }) {
    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
                {icon}
            </div>

            <p className="text-sm font-semibold text-slate-500">
                {title}
            </p>

            <p className="mt-1 text-2xl font-black text-slate-900">
                {value}
            </p>
        </div>
    )
}

function TabButton({ active, onClick, icon, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                'flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-black transition',
                active
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
            ].join(' ')}
        >
            {icon}
            {children}
        </button>
    )
}

function EmptyOfferState() {
    return (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
            <BookOpen size={42} className="mx-auto mb-3 text-slate-400" />
            <h2 className="mb-2 text-xl font-black text-slate-900">
                Oferta académica no cargada
            </h2>
            <p>
                Selecciona un horario institucional publicado para consultar cursos y docentes.
            </p>
        </div>
    )
}

function EmptyFilteredState() {
    return (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
            No hay resultados que coincidan con los filtros aplicados.
        </div>
    )
}

function readNumberArrayFromStorage(key) {
    try {
        const raw = localStorage.getItem(key)
        const parsed = JSON.parse(raw || '[]')

        if (!Array.isArray(parsed)) return []

        return parsed
            .map(Number)
            .filter((value) => Number.isInteger(value) && value > 0)
    } catch {
        return []
    }
}

function extractList(data) {
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.items)) return data.items
    if (Array.isArray(data?.data)) return data.data
    if (Array.isArray(data?.results)) return data.results
    if (Array.isArray(data?.schedules)) return data.schedules
    return []
}

function formatShortTime(value) {
    if (!value) return '-'
    return String(value).slice(0, 5)
}

function formatNumber(value) {
    if (value === null || value === undefined || value === '') return '-'

    const numberValue = Number(value)

    if (Number.isNaN(numberValue)) {
        return value
    }

    return numberValue.toFixed(1)
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
