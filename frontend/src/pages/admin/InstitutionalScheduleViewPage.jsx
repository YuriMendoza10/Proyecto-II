import { useEffect, useMemo, useRef, useState } from 'react'
import {
    AlertTriangle,
    BookOpen,
    CalendarDays,
    ChevronDown,
    ChevronUp,
    Filter,
    GraduationCap,
    Layers,
    Loader2,
    RefreshCcw,
    Search,
    UserRound,
    XCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useSearchParams } from 'react-router-dom'
import { scheduleBlockService } from '../../services/scheduleBlockService'

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

const INITIAL_FILTERS = {
    search: '',
    day: '',
    course: '',
    teacher: '',
    classroom: '',
    section: '',
}

// Color palette por día para la grilla
const DAY_COLORS = [
    { border: 'border-blue-200', bg: 'bg-blue-50', code: 'bg-blue-100 text-blue-700', time: 'text-blue-700', head: 'bg-blue-600' },
    { border: 'border-violet-200', bg: 'bg-violet-50', code: 'bg-violet-100 text-violet-700', time: 'text-violet-700', head: 'bg-violet-600' },
    { border: 'border-emerald-200', bg: 'bg-emerald-50', code: 'bg-emerald-100 text-emerald-700', time: 'text-emerald-700', head: 'bg-emerald-600' },
    { border: 'border-amber-200', bg: 'bg-amber-50', code: 'bg-amber-100 text-amber-700', time: 'text-amber-700', head: 'bg-amber-600' },
    { border: 'border-rose-200', bg: 'bg-rose-50', code: 'bg-rose-100 text-rose-700', time: 'text-rose-700', head: 'bg-rose-600' },
    { border: 'border-sky-200', bg: 'bg-sky-50', code: 'bg-sky-100 text-sky-700', time: 'text-sky-700', head: 'bg-sky-600' },
    { border: 'border-orange-200', bg: 'bg-orange-50', code: 'bg-orange-100 text-orange-700', time: 'text-orange-700', head: 'bg-orange-600' },
]

export default function InstitutionalScheduleViewPage() {
    const [searchParams] = useSearchParams()
    const initialScheduleId = searchParams.get('schedule_id') || searchParams.get('scheduleId') || 1
    const [scheduleId, setScheduleId] = useState(initialScheduleId)
    const [blocks, setBlocks] = useState([])
    const [loading, setLoading] = useState(false)
    const [filters, setFilters] = useState(INITIAL_FILTERS)
    const [showFilters, setShowFilters] = useState(false)
    const [activeView, setActiveView] = useState('grid')
    const [highlightedDay, setHighlightedDay] = useState(null)

    const gridRef = useRef(null)

    const normalizedBlocks = useMemo(() => {
        if (!Array.isArray(blocks)) return []
        return blocks.map((block) => ({
            id: block.id,
            schedule_id: block.schedule_id,
            section_id: block.section_id,
            section_code: block.section_code,
            course_id: block.course_id,
            course_code: block.course_code,
            course_name: block.course_name,
            weekly_hours: block.weekly_hours,
            teacher_id: block.teacher_id,
            teacher_code: block.teacher_code,
            teacher_name: block.teacher_name,
            classroom_id: block.classroom_id,
            classroom_code: block.classroom_code,
            classroom_name: block.classroom_name,
            classroom_capacity: block.classroom_capacity,
            day_of_week: block.day_of_week,
            start_time: normalizeTime(block.start_time),
            end_time: normalizeTime(block.end_time),
        }))
    }, [blocks])

    const filterOptions = useMemo(() => ({
        courses: buildUniqueOptions(
            normalizedBlocks,
            (b) => b.course_id,
            (b) => `${b.course_code || 'Curso'} · ${b.course_name || b.course_id}`
        ),
        teachers: buildUniqueOptions(
            normalizedBlocks,
            (b) => b.teacher_id,
            (b) => `${b.teacher_code || 'Docente'} · ${b.teacher_name || b.teacher_id}`
        ),
        classrooms: buildUniqueOptions(
            normalizedBlocks,
            (b) => b.classroom_id,
            (b) => `${b.classroom_code || 'Aula'} · ${b.classroom_name || b.classroom_id}`
        ),
        sections: buildUniqueOptions(
            normalizedBlocks,
            (b) => b.section_id,
            (b) => `${b.course_code || 'Curso'} · Sección ${b.section_code || b.section_id}`
        ),
    }), [normalizedBlocks])

    const filteredBlocks = useMemo(() => {
        const search = filters.search.trim().toLowerCase()
        return normalizedBlocks.filter((block) => {
            if (filters.day && Number(filters.day) !== block.day_of_week) return false
            if (filters.course && Number(filters.course) !== block.course_id) return false
            if (filters.teacher && Number(filters.teacher) !== block.teacher_id) return false
            if (filters.classroom && Number(filters.classroom) !== block.classroom_id) return false
            if (filters.section && Number(filters.section) !== block.section_id) return false
            if (!search) return true
            const text = [block.course_code, block.course_name, block.section_code, block.teacher_code, block.teacher_name, block.classroom_code, block.classroom_name]
                .filter(Boolean).join(' ').toLowerCase()
            return text.includes(search)
        })
    }, [normalizedBlocks, filters])

    const blocksBySlot = useMemo(() => {
        const map = {}
        for (const block of filteredBlocks) {
            const key = `${block.day_of_week}-${block.start_time}`
            if (!map[key]) map[key] = []
            map[key].push(block)
        }
        return map
    }, [filteredBlocks])

    const summary = useMemo(() => ({
        totalBlocks: filteredBlocks.length,
        totalDays: new Set(filteredBlocks.map((b) => b.day_of_week)).size,
        totalSections: new Set(filteredBlocks.map((b) => b.section_id)).size,
        totalTeachers: new Set(filteredBlocks.map((b) => b.teacher_id).filter(Boolean)).size,
        totalClassrooms: new Set(filteredBlocks.map((b) => b.classroom_id).filter(Boolean)).size,
    }), [filteredBlocks])

    const blocksByDay = useMemo(() => {
        const map = {}
        for (const block of filteredBlocks) {
            if (!map[block.day_of_week]) map[block.day_of_week] = 0
            map[block.day_of_week]++
        }
        return map
    }, [filteredBlocks])

    const hasActiveFilters = useMemo(() => {
        return Object.values(filters).some((v) => String(v).trim() !== '')
    }, [filters])

    const loadBlocks = async () => {
        if (!scheduleId) {
            toast.error('Ingresa un ID de horario válido')
            return
        }
        setLoading(true)
        try {
            const data = await scheduleBlockService.getScheduleBlocks(Number(scheduleId))
            const list = extractScheduleBlocks(data)
            setBlocks(list)
            if (list.length > 0) {
                toast.success(`${list.length} bloques cargados`)
                setActiveView('grid')
            } else {
                toast('El horario no tiene bloques registrados')
            }
        } catch (error) {
            console.error('ERROR AL CARGAR BLOQUES:', error.response?.data || error)
            toast.error(getErrorMessage(error, 'No se pudo cargar el horario institucional'))
        } finally {
            setLoading(false)
        }
    }

    const updateFilter = (field, value) => {
        setFilters((current) => ({ ...current, [field]: value }))
    }

    const clearFilters = () => setFilters(INITIAL_FILTERS)

    const scrollToGrid = () => {
        setActiveView('grid')
        setTimeout(() => gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
    }

    useEffect(() => {
        loadBlocks()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="space-y-5">

            {/* ── Sticky header ── */}
            <section className="sticky top-4 z-20 overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 text-white shadow-xl">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-600/20 via-transparent to-violet-600/20" />

                <div className="relative flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-600 shadow-lg shadow-blue-900/40">
                            <CalendarDays size={28} />
                        </div>

                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-blue-400">
                                Vista institucional · CSP
                            </p>
                            <h1 className="text-2xl font-black lg:text-3xl">
                                Horario Institucional
                            </h1>
                            {normalizedBlocks.length > 0 && (
                                <p className="mt-0.5 text-sm text-slate-400">
                                    ID {scheduleId} · {normalizedBlocks.length} bloques totales
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur sm:flex-row sm:items-center">
                        <div className="relative">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="number"
                                value={scheduleId}
                                onChange={(event) => setScheduleId(event.target.value)}
                                onKeyDown={(event) => event.key === 'Enter' && loadBlocks()}
                                className="w-full rounded-2xl border border-slate-600 bg-slate-900 py-3 pl-9 pr-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500 sm:w-36"
                                placeholder="ID horario"
                            />
                        </div>

                        <button
                            onClick={loadBlocks}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700 active:scale-[0.97] disabled:opacity-60"
                        >
                            {loading ? <Loader2 size={17} className="animate-spin" /> : <RefreshCcw size={17} />}
                            Cargar
                        </button>
                    </div>
                </div>
            </section>

            {/* ── Metrics ── */}
            <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
                <MetricCard icon={<CalendarDays size={18} />} title="Horario ID" value={scheduleId} color="blue" />
                <MetricCard icon={<Layers size={18} />} title="Bloques visibles" value={summary.totalBlocks} color="violet" />
                <MetricCard icon={<CalendarDays size={18} />} title="Días usados" value={summary.totalDays} color="emerald" />
                <MetricCard icon={<GraduationCap size={18} />} title="Secciones" value={summary.totalSections} color="amber" />
                <MetricCard icon={<UserRound size={18} />} title="Docentes" value={summary.totalTeachers} color="rose" />
            </section>

            {/* ── Day heat bar ── */}
            {normalizedBlocks.length > 0 && (
                <section className="rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                        Distribución por día
                    </p>
                    <div className="flex gap-2">
                        {DAYS.map((day, i) => {
                            const count = blocksByDay[day.id] || 0
                            const max = Math.max(...Object.values(blocksByDay), 1)
                            const pct = Math.round((count / max) * 100)
                            const colors = DAY_COLORS[i]
                            const isActive = highlightedDay === day.id

                            return (
                                <button
                                    key={day.id}
                                    type="button"
                                    onClick={() => {
                                        if (count === 0) return
                                        updateFilter('day', isActive ? '' : String(day.id))
                                        setHighlightedDay(isActive ? null : day.id)
                                        scrollToGrid()
                                    }}
                                    disabled={count === 0}
                                    title={`${day.label}: ${count} bloque(s)`}
                                    className={[
                                        'flex flex-1 flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 transition-all duration-200',
                                        count === 0 ? 'opacity-30 cursor-default' : 'hover:scale-105 cursor-pointer',
                                        isActive ? `${colors.border} ${colors.bg} shadow-sm` : 'border-slate-100 bg-slate-50',
                                    ].join(' ')}
                                >
                                    <div className="h-12 w-full flex items-end justify-center">
                                        <div
                                            className={`w-4 rounded-t-lg transition-all duration-500 ${colors.head}`}
                                            style={{ height: `${Math.max(pct, 8)}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-black text-slate-700">{day.short}</span>
                                    {count > 0 && (
                                        <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-black ${colors.code}`}>
                                            {count}
                                        </span>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                    {highlightedDay && (
                        <p className="mt-2 text-xs text-slate-400">
                            Filtrando por {DAYS.find((d) => d.id === highlightedDay)?.label} ·{' '}
                            <button
                                type="button"
                                onClick={() => { clearFilters(); setHighlightedDay(null) }}
                                className="font-bold text-blue-600 hover:underline"
                            >
                                quitar filtro
                            </button>
                        </p>
                    )}
                </section>
            )}

            {/* ── Nav bar ── */}
            {normalizedBlocks.length > 0 && (
                <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-3">
                            {hasActiveFilters && (
                                <span className="flex items-center gap-1.5 rounded-2xl bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700">
                                    <Filter size={12} />
                                    {filteredBlocks.length} de {normalizedBlocks.length} bloques
                                </span>
                            )}
                            {!hasActiveFilters && (
                                <p className="text-sm text-slate-500">
                                    <span className="font-black text-slate-900">{normalizedBlocks.length}</span> bloques cargados
                                </p>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <ViewButton active={activeView === 'grid'} onClick={() => { setActiveView('grid'); scrollToGrid() }} color="blue">
                                <CalendarDays size={15} /> Grilla semanal
                            </ViewButton>

                            <button
                                type="button"
                                onClick={() => setShowFilters((c) => !c)}
                                className={[
                                    'flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-sm font-black transition',
                                    showFilters
                                        ? 'bg-orange-600 text-white'
                                        : 'bg-orange-50 text-orange-700 hover:bg-orange-100',
                                ].join(' ')}
                            >
                                <Filter size={15} />
                                Filtros
                                {showFilters ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                {hasActiveFilters && (
                                    <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] font-black text-orange-700">
                                        {Object.values(filters).filter((v) => String(v).trim() !== '').length}
                                    </span>
                                )}
                            </button>

                            <ViewButton active={activeView === 'list'} onClick={() => setActiveView('list')} color="slate">
                                <BookOpen size={15} /> Lista de bloques
                            </ViewButton>

                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={() => { clearFilters(); setHighlightedDay(null) }}
                                    className="flex items-center gap-1.5 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-500 transition hover:bg-slate-50"
                                >
                                    <XCircle size={14} /> Limpiar
                                </button>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* ── Filters (collapsible) ── */}
            {normalizedBlocks.length > 0 && showFilters && (
                <section className="rounded-3xl border border-orange-200 bg-orange-50 p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <Filter size={16} className="text-orange-600" />
                            <h2 className="text-base font-black text-slate-900">Filtros de visualización</h2>
                        </div>
                        <button
                            onClick={clearFilters}
                            disabled={!hasActiveFilters}
                            className="flex items-center gap-1.5 rounded-xl border border-orange-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                        >
                            <XCircle size={13} /> Limpiar todo
                        </button>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                        <div className="xl:col-span-2">
                            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
                                Búsqueda libre
                            </label>
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    value={filters.search}
                                    onChange={(event) => updateFilter('search', event.target.value)}
                                    placeholder="Curso, docente, aula..."
                                    className="w-full rounded-xl border border-orange-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        <FilterSelect label="Día" value={filters.day} onChange={(v) => updateFilter('day', v)}
                            options={DAYS.map((d) => ({ value: d.id, label: d.label }))} />
                        <FilterSelect label="Curso" value={filters.course} onChange={(v) => updateFilter('course', v)} options={filterOptions.courses} />
                        <FilterSelect label="Docente" value={filters.teacher} onChange={(v) => updateFilter('teacher', v)} options={filterOptions.teachers} />
                        <FilterSelect label="Aula" value={filters.classroom} onChange={(v) => updateFilter('classroom', v)} options={filterOptions.classrooms} />
                    </div>
                </section>
            )}

            {/* ── Content area ── */}
            {normalizedBlocks.length === 0 ? (
                <EmptyState />
            ) : filteredBlocks.length === 0 ? (
                <NoResultsState onClear={() => { clearFilters(); setHighlightedDay(null) }} />
            ) : activeView === 'grid' ? (
                <section ref={gridRef} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                        <div>
                            <h2 className="text-lg font-black text-slate-900">Grilla semanal</h2>
                            <p className="text-sm text-slate-500">
                                {filteredBlocks.length} bloque(s) · cada celda muestra curso, sección, docente y aula
                            </p>
                        </div>
                        {hasActiveFilters && (
                            <span className="rounded-2xl bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700">
                                Filtrado activo
                            </span>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1100px] text-sm">
                            <thead>
                                <tr>
                                    <th className="w-28 border-r border-slate-200 bg-slate-100 px-4 py-4 text-left text-sm font-black text-slate-800">
                                        Hora
                                    </th>
                                    {DAYS.map((day, i) => (
                                        <th
                                            key={day.id}
                                            className={[
                                                'border-r border-slate-200 px-4 py-4 text-left text-sm font-black',
                                                highlightedDay === day.id
                                                    ? `${DAY_COLORS[i].bg} ${DAY_COLORS[i].time}`
                                                    : 'bg-slate-100 text-slate-700',
                                            ].join(' ')}
                                        >
                                            {day.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {TIME_ROWS.map((startTime) => (
                                    <tr key={startTime} className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors">
                                        <td className="border-r border-slate-200 bg-slate-50 px-4 py-3 align-top">
                                            <span className="rounded-lg bg-white px-2 py-1 text-xs font-black text-slate-600 shadow-sm ring-1 ring-slate-200">
                                                {formatShortTime(startTime)}
                                            </span>
                                        </td>

                                        {DAYS.map((day, di) => {
                                            const key = `${day.id}-${startTime}`
                                            const cellBlocks = blocksBySlot[key] || []
                                            const colors = DAY_COLORS[di]

                                            return (
                                                <td
                                                    key={day.id}
                                                    className={[
                                                        'border-r border-slate-100 px-2 py-2 align-top',
                                                        highlightedDay === day.id ? colors.bg : '',
                                                    ].join(' ')}
                                                >
                                                    {cellBlocks.length === 0 ? (
                                                        <div className="h-20 rounded-xl border border-dashed border-slate-200 bg-slate-50/80" />
                                                    ) : (
                                                        <div className="space-y-1.5">
                                                            {cellBlocks.map((block) => (
                                                                <ScheduleCard key={block.id} block={block} colors={colors} />
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
                </section>
            ) : (
                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex flex-col justify-between gap-2 md:flex-row md:items-center">
                        <div>
                            <h2 className="text-xl font-black text-slate-900">Lista de bloques</h2>
                            <p className="text-sm text-slate-500">Resultado filtrado del horario institucional.</p>
                        </div>
                        <span className="w-fit rounded-2xl bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">
                            {filteredBlocks.length} bloque(s)
                        </span>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-slate-200">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-100 text-slate-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-black" scope="col">ID</th>
                                    <th className="px-4 py-3 text-left text-sm font-black" scope="col">Día</th>
                                    <th className="px-4 py-3 text-left text-sm font-black" scope="col">Hora</th>
                                    <th className="px-4 py-3 text-left text-sm font-black" scope="col">Curso</th>
                                    <th className="px-4 py-3 text-left text-sm font-black" scope="col">Sección</th>
                                    <th className="px-4 py-3 text-left text-sm font-black" scope="col">Docente</th>
                                    <th className="px-4 py-3 text-left text-sm font-black" scope="col">Aula</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredBlocks.map((block, index) => {
                                    const dayIndex = DAYS.findIndex((d) => d.id === block.day_of_week)
                                    const colors = DAY_COLORS[dayIndex] || DAY_COLORS[0]

                                    return (
                                        <tr key={block.id} className={`border-t border-slate-100 transition-colors hover:bg-slate-50 ${index % 2 === 0 ? '' : 'bg-slate-50/40'}`}>
                                            <td className="px-4 py-3 text-xs font-bold text-slate-400">#{block.id}</td>

                                            <td className="px-4 py-3">
                                                <span className={`rounded-lg px-2 py-1 text-xs font-black ${colors.code}`}>
                                                    {DAYS.find((d) => d.id === block.day_of_week)?.short}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3 text-xs font-bold text-slate-600">
                                                {formatShortTime(block.start_time)} – {formatShortTime(block.end_time)}
                                            </td>

                                            <td className="px-4 py-3">
                                                <p className="font-bold text-slate-900">{block.course_name || `Curso ${block.course_id}`}</p>
                                                <p className="text-xs text-slate-400">{block.course_code}</p>
                                            </td>

                                            <td className="px-4 py-3 text-sm font-semibold text-slate-700">
                                                {block.section_code || block.section_id}
                                            </td>

                                            <td className="px-4 py-3">
                                                <p className="font-semibold text-slate-900">{block.teacher_name || 'Sin docente'}</p>
                                                <p className="text-xs text-slate-400">{block.teacher_code}</p>
                                            </td>

                                            <td className="px-4 py-3">
                                                <p className="font-semibold text-slate-900">{block.classroom_code || `Aula ${block.classroom_id}`}</p>
                                                <p className="text-xs text-slate-400">{block.classroom_name}</p>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </div>
    )
}

/* ─── Sub-components ─────────────────────────────────────────────── */

function ViewButton({ active, onClick, color, children }) {
    const activeMap = {
        blue: 'bg-blue-600 text-white',
        slate: 'bg-slate-900 text-white',
    }
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                'flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-sm font-black transition',
                active
                    ? (activeMap[color] || 'bg-slate-900 text-white')
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
            ].join(' ')}
        >
            {children}
        </button>
    )
}

function FilterSelect({ label, value, onChange, options }) {
    return (
        <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
                {label}
            </label>
            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
                <option value="">Todos</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    )
}

function ScheduleCard({ block, colors }) {
    return (
        <div className={`rounded-xl border p-2.5 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md ${colors.border} ${colors.bg}`}>
            <div className="mb-1.5 flex items-center justify-between gap-1">
                <span className={`rounded-md px-1.5 py-0.5 text-xs font-black ${colors.code}`}>
                    {block.course_code || `C${block.course_id}`}
                </span>
                <span className="text-[9px] font-bold text-slate-400">
                    {block.classroom_code || `A${block.classroom_id}`}
                </span>
            </div>

            <p className="line-clamp-2 text-[11px] font-black leading-snug text-slate-900">
                {block.course_name || `Curso ${block.course_id}`}
            </p>

            <p className="mt-1 text-xs text-slate-700">
                §{block.section_code || block.section_id}
            </p>

            <p className="truncate text-xs text-slate-700">
                {block.teacher_name || block.teacher_code || '—'}
            </p>

            <p className={`mt-1.5 text-[11px] font-black ${colors.time}`}>
                {formatShortTime(block.start_time)} – {formatShortTime(block.end_time)}
            </p>
        </div>
    )
}

function MetricCard({ icon, title, value, color }) {
    const colorMap = {
        blue: 'bg-blue-50 text-blue-600',
        violet: 'bg-violet-50 text-violet-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        amber: 'bg-amber-50 text-amber-600',
        rose: 'bg-rose-50 text-rose-600',
    }
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${colorMap[color] || colorMap.blue}`}>
                {icon}
            </div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{title}</p>
            <p className="mt-0.5 text-2xl font-black text-slate-900">{value}</p>
        </div>
    )
}

function EmptyState() {
    return (
        <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <AlertTriangle size={28} />
            </div>
            <h2 className="mb-2 text-xl font-black text-slate-900">
                Este horario aún no tiene bloques generados
            </h2>
            <p className="mx-auto max-w-xl text-slate-500">
                Primero genera el horario desde el módulo CSP Institucional. Luego vuelve aquí y carga el ID para visualizar la grilla semanal.
            </p>
        </section>
    )
}

function NoResultsState({ onClear }) {
    return (
        <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <Filter size={28} />
            </div>
            <h2 className="mb-2 text-xl font-black text-slate-900">
                Sin resultados con los filtros actuales
            </h2>
            <p className="mb-6 text-slate-500">
                Prueba limpiando los filtros o usando otro criterio de búsqueda.
            </p>
            <button
                onClick={onClear}
                className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-black text-white transition hover:bg-blue-700 active:scale-[0.97]"
            >
                Limpiar filtros
            </button>
        </section>
    )
}

/* ─── Utilities ──────────────────────────────────────────────────── */

function normalizeTime(value) {
    if (!value) return ''
    if (value.length === 5) return `${value}:00`
    return value
}

function formatShortTime(value) {
    if (!value) return ''
    return value.slice(0, 5)
}

function getErrorMessage(error, fallback) {
    const detail = error.response?.data?.detail
    if (!detail) return fallback
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) return detail.map((item) => item.msg || JSON.stringify(item)).join(' | ')
    if (typeof detail === 'object') return detail.msg || JSON.stringify(detail)
    return fallback
}

function extractScheduleBlocks(data) {
    if (!data) return []
    if (Array.isArray(data)) return data
    if (Array.isArray(data.items)) return data.items
    if (Array.isArray(data.results)) return data.results
    if (Array.isArray(data.data)) return data.data
    if (Array.isArray(data.blocks)) return data.blocks
    if (Array.isArray(data.schedule_blocks)) return data.schedule_blocks
    if (Array.isArray(data.scheduleBlocks)) return data.scheduleBlocks
    return []
}

function buildUniqueOptions(items, getValue, getLabel) {
    const map = new Map()
    for (const item of items) {
        const value = getValue(item)
        if (value === null || value === undefined || value === '') continue
        if (!map.has(value)) map.set(value, { value, label: getLabel(item) })
    }
    return Array.from(map.values()).sort((a, b) => String(a.label).localeCompare(String(b.label)))
}
