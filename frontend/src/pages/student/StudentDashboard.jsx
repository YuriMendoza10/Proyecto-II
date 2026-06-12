import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
    AlertCircle,
    BookOpen,
    CalendarDays,
    CheckCircle,
    ChevronRight,
    Clock,
    GraduationCap,
    Loader2,
    Sparkles,
    Star,
    TrendingUp,
    Zap,
} from 'lucide-react'
import toast from 'react-hot-toast'

import { studentCspService } from '../../services/studentCspService'
import { useAuthStore } from '../../stores/authStore'

const DAYS = [
    { id: 1, label: 'Lunes', short: 'Lun' },
    { id: 2, label: 'Martes', short: 'Mar' },
    { id: 3, label: 'Miércoles', short: 'Mié' },
    { id: 4, label: 'Jueves', short: 'Jue' },
    { id: 5, label: 'Viernes', short: 'Vie' },
    { id: 6, label: 'Sábado', short: 'Sáb' },
    { id: 7, label: 'Domingo', short: 'Dom' },
]

const SHIFT_COLORS = {
    morning: { bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-400', label: 'text-amber-700', badge: 'bg-amber-100 text-amber-800' },
    afternoon: { bg: 'bg-sky-50', border: 'border-sky-200', dot: 'bg-sky-400', label: 'text-sky-700', badge: 'bg-sky-100 text-sky-800' },
    night: { bg: 'bg-indigo-50', border: 'border-indigo-200', dot: 'bg-indigo-400', label: 'text-indigo-700', badge: 'bg-indigo-100 text-indigo-800' },
}

function getShift(startTime) {
    if (!startTime) return 'afternoon'
    const hour = parseInt(String(startTime).slice(0, 2), 10)
    if (hour < 12) return 'morning'
    if (hour < 18) return 'afternoon'
    return 'night'
}

export default function StudentDashboard() {
    const { user } = useAuthStore()

    const [loading, setLoading] = useState(false)
    const [studentProfile, setStudentProfile] = useState(null)
    const [savedSchedules, setSavedSchedules] = useState([])
    const [finalSchedule, setFinalSchedule] = useState(null)
    const [finalScheduleDetail, setFinalScheduleDetail] = useState(null)
    const [mounted, setMounted] = useState(false)
    const [activeDay, setActiveDay] = useState(null)

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 50)
        return () => clearTimeout(t)
    }, [])

    const blocks = useMemo(() => {
        return getBlocksFromDetail(finalScheduleDetail)
    }, [finalScheduleDetail])

    const totalCredits = useMemo(() => {
        return (
            finalScheduleDetail?.total_credits ||
            finalSchedule?.total_credits ||
            getUniqueCourses(blocks).reduce(
                (sum, course) => sum + Number(course.credits || 0),
                0
            )
        )
    }, [finalScheduleDetail, finalSchedule, blocks])

    const totalCourses = useMemo(() => {
        return (
            finalScheduleDetail?.total_courses ||
            finalSchedule?.total_courses ||
            getUniqueCourses(blocks).length
        )
    }, [finalScheduleDetail, finalSchedule, blocks])

    const todayClasses = useMemo(() => {
        const dayId = activeDay ?? getTodayDayId()
        return blocks
            .filter((block) => Number(block.day_of_week) === Number(dayId))
            .sort((a, b) => String(a.start_time).localeCompare(String(b.start_time)))
    }, [blocks, activeDay])

    const nextClass = useMemo(() => {
        return getNextClass(blocks)
    }, [blocks])

    const weekDaysWithClasses = useMemo(() => {
        const set = new Set(blocks.map((b) => Number(b.day_of_week)))
        return set
    }, [blocks])

    useEffect(() => {
        setActiveDay(getTodayDayId())
    }, [])

    const loadDashboard = async () => {
        setLoading(true)
        try {
            const profile = await studentCspService.getMyStudentProfile()
            setStudentProfile(profile)

            const schedulesData = await studentCspService.getSavedStudentSchedules()
            const schedules = extractList(schedulesData)
            const validSchedules = schedules.filter(
                (schedule) => Number(schedule.total_blocks || 0) > 0
            )
            setSavedSchedules(validSchedules)

            const favorite =
                validSchedules.find((schedule) => schedule.is_favorite === true) || null
            setFinalSchedule(favorite)

            if (favorite) {
                const detail = await studentCspService.getSavedStudentScheduleDetail(favorite.id)
                setFinalScheduleDetail(detail)
            } else {
                setFinalScheduleDetail(null)
            }
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudo cargar el dashboard'))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadDashboard()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-slate-200 bg-white py-24 text-slate-400">
                <Loader2 size={32} className="animate-spin text-orange-500" />
                <p className="text-sm font-medium animate-pulse">Cargando tu panel...</p>
            </div>
        )
    }

    return (
        <div
            className="space-y-6 transition-all duration-700"
            style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(12px)',
            }}
        >
            {/* ── Hero header ── */}
            <HeroHeader
                user={user}
                studentProfile={studentProfile}
                hasFinalSchedule={!!finalSchedule}
                finalSchedule={finalSchedule}
                totalCredits={totalCredits}
                totalCourses={totalCourses}
                savedCount={savedSchedules.length}
            />

            {!finalSchedule ? (
                <NoFinalScheduleCard />
            ) : (
                <>
                    {/* ── Stats strip ── */}
                    <StatsStrip
                        totalCredits={totalCredits}
                        totalCourses={totalCourses}
                        score={finalSchedule.score}
                        savedCount={savedSchedules.length}
                    />

                    {/* ── Main grid ── */}
                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
                        {/* Left: weekly picker + classes */}
                        <div className="space-y-5 xl:col-span-3">
                            <WeeklyScheduleCard
                                blocks={blocks}
                                activeDay={activeDay}
                                setActiveDay={setActiveDay}
                                todayClasses={todayClasses}
                                weekDaysWithClasses={weekDaysWithClasses}
                            />
                        </div>

                        {/* Right: next class + actions */}
                        <div className="space-y-5 xl:col-span-2">
                            <NextClassCard nextClass={nextClass} />
                            <QuickActions />
                            <FinalScheduleSummary
                                schedule={finalSchedule}
                                totalCredits={totalCredits}
                                totalCourses={totalCourses}
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

/* ─────────────────────────────────────────────────────── Hero ── */
function HeroHeader({ user, studentProfile, hasFinalSchedule, finalSchedule, totalCredits, totalCourses, savedCount }) {
    const timeOfDay = getGreeting()

    return (
        <section className="relative overflow-hidden rounded-3xl bg-slate-900 p-7 text-white shadow-sm">
            {/* decorative ring */}
            <div
                className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border border-white/5"
                aria-hidden="true"
            />
            <div
                className="pointer-events-none absolute -right-8 -top-8 h-44 w-44 rounded-full border border-white/5"
                aria-hidden="true"
            />
            <div
                className="pointer-events-none absolute right-4 top-4 h-24 w-24 rounded-full border border-orange-500/20"
                aria-hidden="true"
            />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                {/* greeting block */}
                <div className="flex items-center gap-5">
                    <div className="relative">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-600 shadow-lg shadow-orange-900/30">
                            <GraduationCap size={32} />
                        </div>
                        {hasFinalSchedule && (
                            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400">
                                <CheckCircle size={12} className="text-white" />
                            </span>
                        )}
                    </div>

                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-orange-400">
                            {timeOfDay}
                        </p>
                        <h1 className="mt-0.5 text-2xl font-black lg:text-3xl">
                            {user?.full_name
                                ? user.full_name.split(' ')[0]
                                : 'Estudiante'}
                            {' '}👋
                        </h1>
                        {studentProfile && (
                            <p className="mt-1 text-sm text-slate-400">
                                {studentProfile.career} &middot; Ciclo {studentProfile.current_cycle}
                            </p>
                        )}
                    </div>
                </div>

                {/* status badge */}
                {hasFinalSchedule ? (
                    <div className="flex flex-col gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-6 py-4">
                        <div className="flex items-center gap-2 text-emerald-300">
                            <CheckCircle size={16} />
                            <span className="text-sm font-black">Horario final activo</span>
                        </div>
                        <p className="text-xs text-slate-400">
                            {totalCredits} créditos &middot; {totalCourses} cursos
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2 rounded-2xl border border-orange-400/20 bg-orange-500/10 px-6 py-4">
                        <div className="flex items-center gap-2 text-orange-300">
                            <AlertCircle size={16} />
                            <span className="text-sm font-black">Sin horario final</span>
                        </div>
                        <p className="text-xs text-slate-400">
                            Genera y guarda tu horario
                        </p>
                    </div>
                )}
            </div>
        </section>
    )
}

/* ─────────────────────────────────────────────────── Stats strip ── */
function StatsStrip({ totalCredits, totalCourses, score, savedCount }) {
    const stats = [
        { label: 'Créditos', value: totalCredits, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Cursos', value: totalCourses, icon: BookOpen, color: 'text-sky-600', bg: 'bg-sky-50' },
        { label: 'Score', value: formatNumber(score), icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Guardados', value: savedCount, icon: CalendarDays, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ]

    return (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {stats.map((stat, i) => (
                <StatCard key={stat.label} stat={stat} delay={i * 60} />
            ))}
        </div>
    )
}

function StatCard({ stat, delay }) {
    const [visible, setVisible] = useState(false)
    const [counted, setCounted] = useState(0)
    const { label, value, icon: Icon, color, bg } = stat
    const numericVal = typeof value === 'string' ? parseFloat(value) : value

    useEffect(() => {
        const t1 = setTimeout(() => setVisible(true), delay)
        return () => clearTimeout(t1)
    }, [delay])

    useEffect(() => {
        if (!visible || isNaN(numericVal)) return
        const duration = 600
        const steps = 30
        const increment = numericVal / steps
        let current = 0
        let step = 0
        const interval = setInterval(() => {
            step++
            current = Math.min(current + increment, numericVal)
            setCounted(Number.isInteger(numericVal) ? Math.round(current) : parseFloat(current.toFixed(2)))
            if (step >= steps) clearInterval(interval)
        }, duration / steps)
        return () => clearInterval(interval)
    }, [visible, numericVal])

    return (
        <div
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-500"
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(10px)',
            }}
        >
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
                <Icon size={20} className={color} />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
            <p className="mt-1 text-3xl font-black text-slate-900">
                {isNaN(numericVal) ? value : counted}
            </p>
        </div>
    )
}

/* ─────────────────────────────────────── Weekly schedule picker ── */
function WeeklyScheduleCard({ blocks, activeDay, setActiveDay, todayClasses, weekDaysWithClasses }) {
    const todayId = getTodayDayId()

    return (
        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            {/* Day tabs */}
            <div className="border-b border-slate-100 p-4">
                <div className="flex items-center justify-between gap-2">
                    <h2 className="text-lg font-black text-slate-900">Clases del día</h2>
                    <Clock size={18} className="text-orange-500" />
                </div>
                <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1">
                    {DAYS.map((day) => {
                        const hasClass = weekDaysWithClasses.has(day.id)
                        const isToday = day.id === todayId
                        const isActive = day.id === activeDay

                        return (
                            <button
                                key={day.id}
                                onClick={() => setActiveDay(day.id)}
                                className={[
                                    'relative flex min-w-[52px] flex-col items-center rounded-2xl px-3 py-2.5 text-xs font-bold transition-all duration-200',
                                    isActive
                                        ? 'bg-slate-900 text-white shadow-sm scale-105'
                                        : isToday
                                          ? 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                                          : 'bg-slate-50 text-slate-500 hover:bg-slate-100',
                                ].join(' ')}
                            >
                                <span className="text-xs uppercase tracking-wide opacity-80">
                                    {day.short}
                                </span>
                                <span className="mt-0.5 text-sm font-black">{day.id}</span>
                                {hasClass && (
                                    <span
                                        className={[
                                            'mt-1 h-1.5 w-1.5 rounded-full',
                                            isActive ? 'bg-orange-400' : 'bg-orange-500',
                                        ].join(' ')}
                                    />
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Class list */}
            <div className="p-4">
                {todayClasses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-10 text-center">
                        <CalendarDays size={28} className="mb-2 text-slate-300" />
                        <p className="text-sm font-semibold text-slate-400">
                            Sin clases este día
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {todayClasses.map((block, index) => (
                            <ClassRow
                                key={`${block.schedule_block_id}-${index}`}
                                block={block}
                                index={index}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}

function ClassRow({ block, index }) {
    const shift = getShift(block.start_time)
    const colors = SHIFT_COLORS[shift]

    return (
        <div
            className={`flex items-center gap-4 rounded-2xl border p-4 transition-all duration-300 hover:shadow-sm ${colors.bg} ${colors.border}`}
            style={{
                animationDelay: `${index * 50}ms`,
            }}
        >
            {/* Time pill */}
            <div className="flex flex-col items-center">
                <span className={`rounded-xl px-2.5 py-1 text-xs font-black ${colors.badge}`}>
                    {formatShortTime(block.start_time)}
                </span>
                <div className={`my-1 h-4 w-px ${colors.dot}`} />
                <span className={`text-xs font-semibold ${colors.label}`}>
                    {formatShortTime(block.end_time)}
                </span>
            </div>

            {/* Divider */}
            <div className={`h-10 w-0.5 rounded-full ${colors.dot}`} />

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="truncate font-black text-slate-900">{block.course_name}</p>
                <p className="mt-0.5 truncate text-xs text-slate-500">
                    {block.course_code}
                    {block.section_code && ` · Sección ${block.section_code}`}
                    {block.classroom_code && ` · Aula ${block.classroom_code}`}
                </p>
                {block.teacher_name && (
                    <p className="mt-0.5 truncate text-xs text-slate-400">
                        {block.teacher_name}
                    </p>
                )}
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────── Next class card ── */
function NextClassCard({ nextClass }) {
    const [pulse, setPulse] = useState(true)
    useEffect(() => {
        const t = setInterval(() => setPulse((p) => !p), 2000)
        return () => clearInterval(t)
    }, [])

    if (!nextClass) {
        return (
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <Zap size={16} className="text-orange-500" />
                    <h2 className="text-base font-black text-slate-900">Próxima clase</h2>
                </div>
                <div className="rounded-2xl border border-dashed border-slate-200 py-8 text-center">
                    <p className="text-sm text-slate-400">No hay próxima clase registrada</p>
                </div>
            </section>
        )
    }

    const shift = getShift(nextClass.start_time)
    const colors = SHIFT_COLORS[shift]

    return (
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-2">
                    <span
                        className={`h-2 w-2 rounded-full transition-all duration-700 ${colors.dot} ${pulse ? 'opacity-100 scale-100' : 'opacity-40 scale-75'}`}
                    />
                    <h2 className="text-base font-black text-slate-900">Próxima clase</h2>
                </div>
                <span className={`rounded-xl px-2.5 py-1 text-xs font-black uppercase tracking-wide ${colors.badge}`}>
                    {getDayName(nextClass.day_of_week)}
                </span>
            </div>

            <div className={`p-5 ${colors.bg}`}>
                <p className="text-xl font-black leading-snug text-slate-900">
                    {nextClass.course_name}
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                    {nextClass.course_code}
                    {nextClass.section_code && ` · ${nextClass.section_code}`}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2">
                    <InfoPill
                        icon={<Clock size={12} />}
                        label={`${formatShortTime(nextClass.start_time)} - ${formatShortTime(nextClass.end_time)}`}
                    />
                    <InfoPill
                        icon={<CalendarDays size={12} />}
                        label={nextClass.classroom_code || nextClass.classroom_id || 'Sin aula'}
                    />
                </div>

                {nextClass.teacher_name && (
                    <p className="mt-3 text-xs text-slate-500">
                        <span className="font-semibold">Docente:</span> {nextClass.teacher_name}
                    </p>
                )}
            </div>
        </section>
    )
}

function InfoPill({ icon, label }) {
    return (
        <div className="flex items-center gap-1.5 rounded-xl bg-white/70 px-3 py-2 text-xs font-semibold text-slate-600">
            {icon}
            <span className="truncate">{label}</span>
        </div>
    )
}

/* ─────────────────────────────────────────────── Quick actions ── */
function QuickActions() {
    const actions = [
        {
            to: '/student/my-schedules',
            label: 'Ver horario final',
            icon: CalendarDays,
            primary: true,
        },
        {
            to: '/student/offer',
            label: 'Oferta académica',
            icon: BookOpen,
            primary: false,
        },
        {
            to: '/student/schedule-generator',
            label: 'Generar horario',
            icon: Sparkles,
            primary: false,
            accent: true,
        },
    ]

    return (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-black text-slate-900">Accesos rápidos</h2>
            <div className="space-y-2">
                {actions.map((action) => {
                    const Icon = action.icon
                    const base =
                        'flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-150 active:scale-[0.98]'
                    const cls = action.primary
                        ? `${base} bg-slate-900 text-white hover:bg-slate-800`
                        : action.accent
                          ? `${base} bg-orange-600 text-white hover:bg-orange-700`
                          : `${base} border border-slate-200 text-slate-700 hover:bg-slate-50`

                    return (
                        <Link key={action.to} to={action.to} className={cls}>
                            <div className="flex items-center gap-2.5">
                                <Icon size={16} />
                                {action.label}
                            </div>
                            <ChevronRight size={14} className="opacity-50" />
                        </Link>
                    )
                })}
            </div>
        </section>
    )
}

/* ────────────────────────────────────────── Final schedule mini ── */
function FinalScheduleSummary({ schedule, totalCredits, totalCourses }) {
    return (
        <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-emerald-700">
                    <CheckCircle size={16} />
                    <span className="text-sm font-black">Horario final elegido</span>
                </div>
                <Link
                    to="/student/my-schedules"
                    className="text-xs font-bold text-emerald-700 hover:underline"
                >
                    Ver →
                </Link>
            </div>

            <p className="font-black text-slate-900 leading-snug">
                {schedule.name || 'Mi horario final'}
            </p>

            <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                    { label: 'Créditos', val: totalCredits },
                    { label: 'Cursos', val: totalCourses },
                    { label: 'Score', val: formatNumber(schedule.score) },
                ].map((m) => (
                    <div key={m.label} className="rounded-xl bg-white/60 p-3 text-center">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-700">{m.label}</p>
                        <p className="mt-0.5 text-lg font-black text-slate-900">{m.val || 0}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}

/* ─────────────────────────────────────────── No schedule state ── */
function NoFinalScheduleCard() {
    return (
        <section className="relative overflow-hidden rounded-3xl border border-dashed border-orange-200 bg-orange-50 p-10 text-center">
            <div
                className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-orange-100 opacity-60"
                aria-hidden="true"
            />
            <div className="relative">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-orange-100">
                    <Sparkles size={32} className="text-orange-600" />
                </div>

                <h2 className="text-2xl font-black text-slate-900">
                    Aún no tienes un horario final
                </h2>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
                    Revisa la oferta académica, selecciona tus cursos, genera opciones y guarda la mejor como tu horario definitivo.
                </p>

                <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                    <Link
                        to="/student/offer"
                        className="rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-black text-slate-800 transition hover:bg-slate-50 hover:shadow-sm active:scale-[0.98]"
                    >
                        Ver oferta académica
                    </Link>

                    <Link
                        to="/student/schedule-generator"
                        className="rounded-2xl bg-orange-600 px-6 py-3 text-sm font-black text-white transition hover:bg-orange-700 hover:shadow-md active:scale-[0.98]"
                    >
                        <span className="flex items-center gap-2">
                            <Sparkles size={15} />
                            Generar horario
                        </span>
                    </Link>
                </div>
            </div>
        </section>
    )
}

/* ──────────────────────────────────────────────────── Utilities ── */

function getGreeting() {
    const h = new Date().getHours()
    if (h < 12) return 'Buenos días'
    if (h < 19) return 'Buenas tardes'
    return 'Buenas noches'
}

function getBlocksFromDetail(detail) {
    if (Array.isArray(detail?.blocks)) return detail.blocks
    if (Array.isArray(detail?.schedule_blocks)) return detail.schedule_blocks
    if (Array.isArray(detail?.items)) return detail.items
    return []
}

function getUniqueCourses(blocks) {
    const map = new Map()
    for (const block of blocks) {
        if (!map.has(block.course_id)) {
            map.set(block.course_id, {
                course_id: block.course_id,
                course_code: block.course_code,
                course_name: block.course_name,
                credits: block.credits,
            })
        }
    }
    return Array.from(map.values())
}

function getTodayDayId() {
    const jsDay = new Date().getDay()
    return jsDay === 0 ? 7 : jsDay
}

function getNextClass(blocks) {
    if (!blocks?.length) return null

    const today = getTodayDayId()
    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()

    const normalized = blocks
        .map((block) => ({
            ...block,
            day_of_week: Number(block.day_of_week),
            start_minutes: timeToMinutes(block.start_time),
        }))
        .filter((block) => Number.isFinite(block.start_minutes))

    const todayUpcoming = normalized
        .filter((b) => b.day_of_week === today && b.start_minutes >= currentMinutes)
        .sort((a, b) => a.start_minutes - b.start_minutes)

    if (todayUpcoming.length > 0) return todayUpcoming[0]

    for (let offset = 1; offset <= 7; offset++) {
        const targetDay = ((today + offset - 1) % 7) + 1
        const dayBlocks = normalized
            .filter((b) => b.day_of_week === targetDay)
            .sort((a, b) => a.start_minutes - b.start_minutes)
        if (dayBlocks.length > 0) return dayBlocks[0]
    }

    return null
}

function timeToMinutes(value) {
    if (!value) return NaN
    const [hours, minutes] = String(value).split(':').map(Number)
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return NaN
    return hours * 60 + minutes
}

function getDayName(dayId) {
    return DAYS.find((day) => Number(day.id) === Number(dayId))?.label || dayId || '-'
}

function formatShortTime(value) {
    if (!value) return '-'
    return String(value).slice(0, 5)
}

function formatNumber(value) {
    if (value === null || value === undefined || value === '') return '-'
    const n = Number(value)
    if (Number.isNaN(n)) return value
    return n.toFixed(2)
}

function extractList(data) {
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.items)) return data.items
    if (Array.isArray(data?.data)) return data.data
    if (Array.isArray(data?.results)) return data.results
    if (Array.isArray(data?.schedules)) return data.schedules
    if (Array.isArray(data?.student_schedules)) return data.student_schedules
    return []
}

function getErrorMessage(error, fallback = 'Ocurrió un error') {
    const detail = error.response?.data?.detail
    if (!detail) return fallback
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) return detail.map((item) => item.msg || JSON.stringify(item)).join(' | ')
    if (typeof detail === 'object') return detail.msg || JSON.stringify(detail)
    return fallback
}
