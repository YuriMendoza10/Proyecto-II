import { useEffect, useMemo, useRef, useState } from 'react'
import {
    CalendarDays,
    CheckCircle,
    Download,
    Eye,
    Loader2,
    RefreshCcw,
    Search,
    Star,
    Trophy,
} from 'lucide-react'
import toast from 'react-hot-toast'

import { studentCspService } from '../../services/studentCspService'
import { useAuthStore } from '../../stores/authStore'
import StudentFlowGuide from '../../components/student/StudentFlowGuide'

const DAYS = [
    { id: 1, label: 'Lunes' },
    { id: 2, label: 'Martes' },
    { id: 3, label: 'Miércoles' },
    { id: 4, label: 'Jueves' },
    { id: 5, label: 'Viernes' },
    { id: 6, label: 'Sábado' },
    { id: 7, label: 'Domingo' },
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

export default function MySavedSchedulesPage() {
    const { user } = useAuthStore()
    const isStudentUser = user?.role === 'STUDENT'
    const isAdminOrCoordinator = user?.role === 'ADMIN' || user?.role === 'COORDINATOR'

    const [studentIdFilter, setStudentIdFilter] = useState('')
    const [savedSchedules, setSavedSchedules] = useState([])
    const [selectedSchedule, setSelectedSchedule] = useState(null)

    const [loading, setLoading] = useState(false)
    const [loadingDetail, setLoadingDetail] = useState(false)
    const [favoriteLoadingId, setFavoriteLoadingId] = useState(null)

    const pdfRef = useRef(null)
    const [exportingPdf, setExportingPdf] = useState(false)

    const validSchedules = useMemo(() => {
        return savedSchedules.filter((schedule) => {
            return Number(schedule.total_blocks || 0) > 0
        })
    }, [savedSchedules])

    const favoriteSchedule = useMemo(() => {
        return validSchedules.find((schedule) => schedule.is_favorite) || null
    }, [validSchedules])

    const otherSchedules = useMemo(() => {
        return validSchedules.filter((schedule) => {
            return !favoriteSchedule || schedule.id !== favoriteSchedule.id
        })
    }, [validSchedules, favoriteSchedule])

    const blocksBySlot = useMemo(() => {
        const map = {}

        if (!selectedSchedule?.blocks) return map

        for (const block of selectedSchedule.blocks) {
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
    }, [selectedSchedule])

    const loadSavedSchedules = async () => {
        setLoading(true)

        try {
            const params = {}

            if (isAdminOrCoordinator && studentIdFilter) {
                params.student_id = Number(studentIdFilter)
            }

            const data = await studentCspService.getSavedStudentSchedules(params)

            const schedules = data?.schedules || data?.items || data || []

            const allValid = Array.isArray(schedules)
                ? schedules.filter((schedule) => {
                      return Number(schedule.total_blocks || 0) > 0
                  })
                : []

            const favoriteSchedule =
                allValid.find((schedule) => schedule.is_favorite === true) || null

            setSavedSchedules(favoriteSchedule ? [favoriteSchedule] : [])

            if (favoriteSchedule) {
                await loadScheduleDetail(favoriteSchedule.id)
            } else {
                setSelectedSchedule(null)
            }
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudo cargar tu horario final'))
        } finally {
            setLoading(false)
        }
    }

    const loadScheduleDetail = async (studentScheduleId, showToast = true) => {
        setLoadingDetail(true)

        try {
            const data = await studentCspService.getSavedStudentScheduleDetail(
                studentScheduleId
            )

            if (Number(data.total_blocks || 0) <= 0) {
                setSelectedSchedule(null)
                toast.error('Este horario no tiene bloques guardados')
                return
            }

            setSelectedSchedule(data)

            if (showToast) {
                toast.success('Horario abierto correctamente')
            }
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudo abrir el horario'))
        } finally {
            setLoadingDetail(false)
        }
    }

    const handleMarkFavorite = async (studentScheduleId) => {
        setFavoriteLoadingId(studentScheduleId)

        try {
            await studentCspService.markStudentScheduleAsFavorite(studentScheduleId)

            toast.success('Horario marcado como elegido')
            await loadSavedSchedules()
            await loadScheduleDetail(studentScheduleId, false)
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudo marcar como favorito'))
        } finally {
            setFavoriteLoadingId(null)
        }
    }

    const handleExportFinalSchedulePdf = async () => {
        if (!selectedSchedule) {
            toast.error('No hay horario final para exportar')
            return
        }

        if (!pdfRef.current) {
            toast.error('No se pudo preparar el contenido del PDF')
            return
        }

        setExportingPdf(true)

        try {
            const html2pdf = (await import('html2pdf.js')).default

            const studentCode =
                selectedSchedule.student_code ||
                selectedSchedule.student_id ||
                'estudiante'

            const fileName = `horario-final-${studentCode}.pdf`

            const options = {
                margin: 8,
                filename: fileName,
                image: {
                    type: 'jpeg',
                    quality: 0.98,
                },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#ffffff',
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'landscape',
                },
            }

            await html2pdf().set(options).from(pdfRef.current).save()

            toast.success('PDF exportado correctamente')
        } catch (error) {
            console.error('ERROR EXPORT PDF:', error)
            toast.error('No se pudo exportar el horario final')
        } finally {
            setExportingPdf(false)
        }
    }

    useEffect(() => {
        loadSavedSchedules()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="space-y-8">
            <section className="rounded-3xl bg-slate-900 p-6 text-white shadow-sm">
                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-600 text-white">
                            <CalendarDays size={28} />
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold">
                                Mi horario elegido
                            </h1>
                            <p className="mt-1 text-sm text-slate-300">
                                Consulta el horario que elegiste como favorito y revisa tus otras opciones guardadas.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={loadSavedSchedules}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-bold text-slate-100 transition hover:bg-slate-700 disabled:opacity-60"
                    >
                        <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
                        Recargar
                    </button>

                    <button
                        type="button"
                        onClick={handleExportFinalSchedulePdf}
                        disabled={!selectedSchedule || exportingPdf}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {exportingPdf ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <Download size={18} />
                        )}
                        Exportar PDF
                    </button>
                </div>
            </section>

            <StudentFlowGuide currentStep="final" />

            {!isStudentUser && (
                <section className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-end">
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Filtrar por Student ID
                        </label>

                        <div className="relative">
                            <Search
                                size={17}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="number"
                                value={studentIdFilter}
                                onChange={(event) => setStudentIdFilter(event.target.value)}
                                placeholder="Ejemplo: 1"
                                className="w-full rounded-xl border border-slate-300 py-3 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-orange-500 md:w-64"
                            />
                        </div>
                    </div>

                    <button
                        onClick={loadSavedSchedules}
                        className="rounded-xl bg-orange-600 px-5 py-3 font-bold text-white hover:bg-orange-700"
                    >
                        Aplicar filtro
                    </button>
                </section>
            )}

            {loading ? (
                <LoadingState />
            ) : validSchedules.length === 0 ? (
                <EmptyState />
            ) : (
                <>
                    <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                        <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-6 shadow-sm xl:col-span-1">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-700">
                                    <Trophy size={23} />
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-yellow-900">
                                        Horario actual
                                    </h2>
                                    <p className="text-sm text-yellow-700">
                                        Este es el horario marcado como elegido.
                                    </p>
                                </div>
                            </div>

                            {favoriteSchedule ? (
                                <SavedScheduleCard
                                    schedule={favoriteSchedule}
                                    onOpen={() => loadScheduleDetail(favoriteSchedule.id)}
                                    onFavorite={() => handleMarkFavorite(favoriteSchedule.id)}
                                    favoriteLoading={favoriteLoadingId === favoriteSchedule.id}
                                    highlighted
                                />
                            ) : (
                                <div className="rounded-2xl border border-yellow-200 bg-white p-5 text-sm text-yellow-800">
                                    Todavía no tienes un horario favorito. Marca una opción guardada como elegida.
                                </div>
                            )}

                            {otherSchedules.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                                        Otras opciones guardadas
                                    </h3>

                                    <div className="space-y-3">
                                        {otherSchedules.map((schedule) => (
                                            <SavedScheduleCard
                                                key={schedule.id}
                                                schedule={schedule}
                                                onOpen={() => loadScheduleDetail(schedule.id)}
                                                onFavorite={() => handleMarkFavorite(schedule.id)}
                                                favoriteLoading={favoriteLoadingId === schedule.id}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
                            {!selectedSchedule ? (
                                <SelectScheduleState />
                            ) : loadingDetail ? (
                                <LoadingState />
                            ) : (
                                <ScheduleDetail
                                    selectedSchedule={selectedSchedule}
                                    onFavorite={() => handleMarkFavorite(selectedSchedule.id)}
                                    favoriteLoading={favoriteLoadingId === selectedSchedule.id}
                                />
                            )}
                        </div>
                    </section>

                    {selectedSchedule && (
                        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-200 p-5">
                                <h2 className="text-xl font-bold text-slate-900">
                                    Grilla semanal
                                </h2>
                                <p className="text-sm text-slate-500">
                                    Vista del horario seleccionado.
                                </p>
                            </div>

                            <WeeklyGrid blocksBySlot={blocksBySlot} />
                        </section>
                    )}
                </>
            )}

            <div className="fixed -left-[9999px] top-0 bg-white">
                {selectedSchedule && (
                    <FinalSchedulePdfTemplate
                        refElement={pdfRef}
                        schedule={selectedSchedule}
                        detail={selectedSchedule}
                    />
                )}
            </div>
        </div>
    )
}

function SavedScheduleCard({
    schedule,
    onOpen,
    onFavorite,
    favoriteLoading,
    highlighted = false,
}) {
    return (
        <div
            className={[
                'rounded-2xl border p-4 transition',
                highlighted
                    ? 'border-yellow-300 bg-white shadow-sm'
                    : 'border-slate-200 bg-white hover:bg-slate-50',
            ].join(' ')}
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-900">
                            {schedule.name}
                        </h3>

                        {schedule.is_favorite && (
                            <span className="flex items-center gap-1 rounded-lg bg-yellow-100 px-2 py-1 text-xs font-bold text-yellow-700">
                                <Star size={13} fill="currentColor" />
                                Elegido
                            </span>
                        )}
                        {schedule.generation_mode === 'ENROLLMENTS' && (
                            <span className="rounded-lg bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">
                                Cursos matriculados
                            </span>
                        )}
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                        ID {schedule.id} | Student {schedule.student_id}
                    </p>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
                <MiniMetric title="Score" value={formatNumber(schedule.score)} />
                <MiniMetric title="Créditos" value={schedule.total_credits} />
                <MiniMetric title="Cursos" value={schedule.total_courses} />
            </div>

            <div className="mt-4 flex gap-2">
                <button
                    onClick={onOpen}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-600 py-2 font-semibold text-white hover:bg-orange-700"
                >
                    <Eye size={16} />
                    Ver
                </button>

                <button
                    onClick={onFavorite}
                    disabled={favoriteLoading || schedule.is_favorite}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 py-2 font-semibold text-white hover:bg-slate-800 disabled:bg-slate-400"
                >
                    {favoriteLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <Star size={16} />
                    )}
                    Elegir
                </button>
            </div>
        </div>
    )
}

function ScheduleDetail({ selectedSchedule, onFavorite, favoriteLoading }) {
    return (
        <div>
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-2xl font-bold text-slate-900">
                            {selectedSchedule.name}
                        </h2>

                        {selectedSchedule.is_favorite && (
                            <div className="flex items-center gap-2 rounded-xl bg-yellow-100 px-3 py-1 text-sm font-bold text-yellow-700">
                                <Star size={16} fill="currentColor" />
                                Horario elegido
                            </div>
                        )}
                    </div>

                    <p className="mt-1 text-slate-500">
                        Horario estudiantil #{selectedSchedule.id}
                    </p>
                </div>

                {!selectedSchedule.is_favorite && (
                    <button
                        onClick={onFavorite}
                        disabled={favoriteLoading}
                        className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60"
                    >
                        {favoriteLoading ? (
                            <Loader2 size={17} className="animate-spin" />
                        ) : (
                            <Star size={17} />
                        )}
                        Marcar como elegido
                    </button>
                )}
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-5">
                <Metric title="Score" value={formatNumber(selectedSchedule.score)} />
                <Metric title="Créditos" value={selectedSchedule.total_credits} />
                <Metric title="Cursos" value={selectedSchedule.total_courses} />
                <Metric title="Bloques" value={selectedSchedule.total_blocks} />
                <Metric
                    title="Oferta base"
                    value={selectedSchedule.institutional_schedule_id}
                />
            </div>

            {selectedSchedule.is_favorite && (
                <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
                    <CheckCircle size={22} />
                    <div>
                        <p className="font-bold">Este es tu horario activo.</p>
                        <p className="text-sm">
                            Es el horario que se tomará como seleccionado para el estudiante.
                        </p>
                    </div>
                </div>
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
                        {selectedSchedule.blocks.map((block, index) => (
                            <tr
                                key={`${block.schedule_block_id}-${index}`}
                                className="border-t border-slate-200"
                            >
                                <td className="px-4 py-3">
                                    <p className="font-semibold text-slate-900">
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
                                    <p className="font-semibold text-slate-900">
                                        {block.teacher_name || 'Sin docente'}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {block.teacher_code || ''}
                                    </p>
                                </td>

                                <td className="px-4 py-3">
                                    {DAYS.find((day) => day.id === block.day_of_week)?.label}
                                </td>

                                <td className="px-4 py-3">
                                    {formatShortTime(block.start_time)} -{' '}
                                    {formatShortTime(block.end_time)}
                                </td>

                                <td className="px-4 py-3">
                                    {block.classroom_code || block.classroom_id}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
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
                <span className="rounded-lg bg-orange-100 px-2 py-1 text-xs font-bold text-orange-700">
                    {block.course_code || `Curso ${block.course_id}`}
                </span>

                <span className="text-xs font-semibold text-slate-500">
                    {block.classroom_code || `Aula ${block.classroom_id}`}
                </span>
            </div>

            <h3 className="text-sm font-bold leading-snug text-slate-900">
                {block.course_name}
            </h3>

            <p className="mt-1 text-xs text-slate-600">
                Sección {block.section_code || block.section_id}
            </p>

            <p className="mt-1 text-xs text-slate-600">
                Docente: {block.teacher_name || block.teacher_code || 'Sin docente'}
            </p>

            <p className="mt-2 text-sm font-bold text-orange-700">
                {formatShortTime(block.start_time)} - {formatShortTime(block.end_time)}
            </p>
        </div>
    )
}

function Metric({ title, value }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">{title}</p>
            <p className="text-xl font-bold text-slate-900">{value}</p>
        </div>
    )
}

function MiniMetric({ title, value }) {
    return (
        <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-[11px] text-slate-500">{title}</p>
            <p className="font-bold text-slate-900">{value}</p>
        </div>
    )
}

function LoadingState() {
    return (
        <div className="flex justify-center py-16 text-slate-500">
            <Loader2 className="animate-spin" />
        </div>
    )
}

function EmptyState() {
    return (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
            <CalendarDays size={42} className="mx-auto mb-3 text-slate-400" />
            <h2 className="mb-2 text-xl font-bold text-slate-900">
                Aún no tienes un horario elegido
            </h2>
            <p>
                Genera una opción desde el generador estudiantil y guárdala como favorita.
            </p>
        </div>
    )
}

function SelectScheduleState() {
    return (
        <div className="flex h-full min-h-[320px] items-center justify-center text-center">
            <div>
                <CalendarDays size={46} className="mx-auto mb-4 text-slate-400" />
                <h2 className="mb-2 text-xl font-bold text-slate-900">
                    Selecciona un horario
                </h2>
                <p className="text-slate-600">
                    Abre una opción guardada para ver su detalle.
                </p>
            </div>
        </div>
    )
}

function normalizeTime(value) {
    if (!value) return ''
    if (value.length === 5) return `${value}:00`
    return value
}

function formatShortTime(value) {
    if (!value) return ''
    return String(value).slice(0, 5)
}

function formatNumber(value) {
    if (value === null || value === undefined || value === '') return '-'

    const numberValue = Number(value)

    if (Number.isNaN(numberValue)) {
        return value
    }

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

// ─── PDF ─────────────────────────────────────────────────────────────────────

const PDF_DAYS = [
    { id: 1, label: 'Lunes' },
    { id: 2, label: 'Martes' },
    { id: 3, label: 'Miércoles' },
    { id: 4, label: 'Jueves' },
    { id: 5, label: 'Viernes' },
    { id: 6, label: 'Sábado' },
    { id: 7, label: 'Domingo' },
]

const PDF_TIME_ROWS = [
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

function FinalSchedulePdfTemplate({ refElement, schedule, detail }) {
    const blocks = getPdfBlocks(detail)

    const blocksBySlot = {}

    for (const block of blocks) {
        const startTime = normalizePdfTime(block.start_time)
        const key = `${block.day_of_week}-${startTime}`

        if (!blocksBySlot[key]) {
            blocksBySlot[key] = []
        }

        blocksBySlot[key].push({
            ...block,
            start_time: startTime,
            end_time: normalizePdfTime(block.end_time),
        })
    }

    const totalCredits =
        detail.total_credits ||
        schedule.total_credits ||
        blocks.reduce((sum, block) => sum + Number(block.credits || 0), 0)

    const totalCourses =
        detail.total_courses ||
        schedule.total_courses ||
        new Set(blocks.map((block) => block.course_id)).size

    return (
        <div
            ref={refElement}
            style={{
                width: '1120px',
                minHeight: '790px',
                padding: '28px',
                background: '#ffffff',
                color: '#0f172a',
                fontFamily: 'Arial, sans-serif',
            }}
        >
            <div
                style={{
                    borderBottom: '3px solid #ea580c',
                    paddingBottom: '14px',
                    marginBottom: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '20px',
                }}
            >
                <div>
                    <h1
                        style={{
                            margin: 0,
                            fontSize: '28px',
                            fontWeight: 900,
                            color: '#0f172a',
                        }}
                    >
                        Horario final del estudiante
                    </h1>

                    <p
                        style={{
                            margin: '6px 0 0 0',
                            fontSize: '13px',
                            color: '#475569',
                        }}
                    >
                        Generado por OptiAcademic
                    </p>
                </div>

                <div
                    style={{
                        textAlign: 'right',
                        fontSize: '12px',
                        color: '#475569',
                    }}
                >
                    <p style={{ margin: 0 }}>
                        <strong>ID horario:</strong> {schedule.id || '-'}
                    </p>
                    <p style={{ margin: '4px 0 0 0' }}>
                        <strong>Score:</strong> {formatPdfNumber(schedule.score)}
                    </p>
                </div>
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '10px',
                    marginBottom: '18px',
                }}
            >
                <PdfMetric label="Horario" value={schedule.name || 'Horario final'} />
                <PdfMetric label="Créditos" value={totalCredits} />
                <PdfMetric label="Cursos" value={totalCourses} />
                <PdfMetric
                    label="Estado"
                    value={schedule.is_favorite ? 'Final elegido' : 'Guardado'}
                />
            </div>

            <h2
                style={{
                    margin: '0 0 10px 0',
                    fontSize: '18px',
                    fontWeight: 900,
                    color: '#0f172a',
                }}
            >
                Vista semanal
            </h2>

            <table
                style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    tableLayout: 'fixed',
                    fontSize: '10px',
                    marginBottom: '20px',
                }}
            >
                <thead>
                    <tr>
                        <th style={pdfThStyle}>Hora</th>
                        {PDF_DAYS.map((day) => (
                            <th key={day.id} style={pdfThStyle}>
                                {day.label}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {PDF_TIME_ROWS.map((startTime) => (
                        <tr key={startTime}>
                            <td style={pdfTimeTdStyle}>
                                {formatPdfShortTime(startTime)}
                            </td>

                            {PDF_DAYS.map((day) => {
                                const key = `${day.id}-${startTime}`
                                const cellBlocks = blocksBySlot[key] || []

                                return (
                                    <td key={day.id} style={pdfTdStyle}>
                                        {cellBlocks.map((block, index) => (
                                            <div
                                                key={`${block.schedule_block_id}-${index}`}
                                                style={pdfBlockStyle}
                                            >
                                                <strong>
                                                    {block.course_code ||
                                                        `Curso ${block.course_id}`}
                                                </strong>
                                                <br />
                                                {block.course_name}
                                                <br />
                                                {formatPdfShortTime(block.start_time)} -{' '}
                                                {formatPdfShortTime(block.end_time)}
                                                <br />
                                                Aula:{' '}
                                                {block.classroom_code ||
                                                    block.classroom_id ||
                                                    '-'}
                                            </div>
                                        ))}
                                    </td>
                                )
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>

            <h2
                style={{
                    margin: '0 0 10px 0',
                    fontSize: '18px',
                    fontWeight: 900,
                    color: '#0f172a',
                }}
            >
                Lista de clases
            </h2>

            <table
                style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '11px',
                }}
            >
                <thead>
                    <tr>
                        <th style={pdfListThStyle}>Curso</th>
                        <th style={pdfListThStyle}>Sección</th>
                        <th style={pdfListThStyle}>Docente</th>
                        <th style={pdfListThStyle}>Día</th>
                        <th style={pdfListThStyle}>Hora</th>
                        <th style={pdfListThStyle}>Aula</th>
                    </tr>
                </thead>

                <tbody>
                    {blocks.map((block, index) => (
                        <tr key={`${block.schedule_block_id}-${index}`}>
                            <td style={pdfListTdStyle}>
                                <strong>{block.course_code}</strong>
                                <br />
                                {block.course_name}
                            </td>

                            <td style={pdfListTdStyle}>
                                {block.section_code || block.section_id}
                            </td>

                            <td style={pdfListTdStyle}>
                                {block.teacher_name || block.teacher_code || '-'}
                            </td>

                            <td style={pdfListTdStyle}>
                                {getPdfDayName(block.day_of_week)}
                            </td>

                            <td style={pdfListTdStyle}>
                                {formatPdfShortTime(block.start_time)} -{' '}
                                {formatPdfShortTime(block.end_time)}
                            </td>

                            <td style={pdfListTdStyle}>
                                {block.classroom_code || block.classroom_id || '-'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

function PdfMetric({ label, value }) {
    return (
        <div
            style={{
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '10px',
                background: '#f8fafc',
            }}
        >
            <p
                style={{
                    margin: 0,
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#64748b',
                    textTransform: 'uppercase',
                }}
            >
                {label}
            </p>

            <p
                style={{
                    margin: '4px 0 0 0',
                    fontSize: '16px',
                    fontWeight: 900,
                    color: '#0f172a',
                }}
            >
                {value || '-'}
            </p>
        </div>
    )
}

const pdfThStyle = {
    border: '1px solid #cbd5e1',
    background: '#f1f5f9',
    padding: '7px',
    fontWeight: 900,
    color: '#0f172a',
}

const pdfTdStyle = {
    border: '1px solid #e2e8f0',
    padding: '5px',
    verticalAlign: 'top',
    height: '58px',
}

const pdfTimeTdStyle = {
    border: '1px solid #cbd5e1',
    background: '#f8fafc',
    padding: '7px',
    fontWeight: 900,
    color: '#334155',
    verticalAlign: 'top',
}

const pdfBlockStyle = {
    border: '1px solid #fed7aa',
    background: '#fff7ed',
    borderRadius: '8px',
    padding: '5px',
    marginBottom: '4px',
    color: '#7c2d12',
    lineHeight: 1.25,
}

const pdfListThStyle = {
    border: '1px solid #cbd5e1',
    background: '#f1f5f9',
    padding: '8px',
    textAlign: 'left',
    fontWeight: 900,
}

const pdfListTdStyle = {
    border: '1px solid #e2e8f0',
    padding: '7px',
    verticalAlign: 'top',
}

function getPdfBlocks(detail) {
    if (Array.isArray(detail?.blocks)) return detail.blocks
    if (Array.isArray(detail?.schedule_blocks)) return detail.schedule_blocks
    if (Array.isArray(detail?.items)) return detail.items
    return []
}

function normalizePdfTime(value) {
    if (!value) return ''
    if (String(value).length === 5) return `${value}:00`
    return String(value)
}

function formatPdfShortTime(value) {
    if (!value) return '-'
    return String(value).slice(0, 5)
}

function formatPdfNumber(value) {
    if (value === null || value === undefined || value === '') return '-'

    const numberValue = Number(value)

    if (Number.isNaN(numberValue)) return value

    return numberValue.toFixed(2)
}

function getPdfDayName(dayOfWeek) {
    return (
        PDF_DAYS.find((day) => Number(day.id) === Number(dayOfWeek))?.label ||
        dayOfWeek ||
        '-'
    )
}
