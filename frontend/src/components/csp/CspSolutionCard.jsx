import { CalendarDays, Save } from 'lucide-react'

import CspMetricCard from './CspMetricCard'

export default function CspSolutionCard({ solution, index = 0, onSelect, saving = false }) {
    const blocks = asArray(solution?.blocks)
    const score = solution?.score_total ?? solution?.score ?? solution?.quality_score ?? '-'
    const hardConflicts = asArray(solution?.hard_conflicts).length
    const warnings = asArray(solution?.soft_warnings).length || asArray(solution?.warnings).length

    return (
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                    <p className="text-xs font-black uppercase tracking-wide text-orange-600">
                        Solucion {Number(solution?.solution_index ?? index) + 1}
                    </p>
                    <h3 className="mt-1 text-2xl font-black text-slate-900">
                        Score {score}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                        {blocks.length} bloques generados para esta alternativa.
                    </p>
                </div>
                {onSelect && (
                    <button
                        type="button"
                        onClick={() => onSelect(solution?.solution_index ?? index)}
                        disabled={saving}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Save size={17} /> {saving ? 'Guardando...' : 'Seleccionar solucion'}
                    </button>
                )}
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-4">
                <CspMetricCard label="Bloques" value={blocks.length} tone="info" />
                <CspMetricCard label="Conflictos duros" value={hardConflicts} tone={hardConflicts ? 'danger' : 'success'} />
                <CspMetricCard label="Advertencias" value={warnings} tone={warnings ? 'warning' : 'success'} />
                <CspMetricCard label="Ciclos" value={countKeys(solution?.cycle_distribution) || '-'} tone="neutral" />
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
                <table className="w-full min-w-[860px] text-sm">
                    <thead className="bg-slate-50 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                        <tr>
                            <th className="px-4 py-3">Dia</th>
                            <th className="px-4 py-3">Hora</th>
                            <th className="px-4 py-3">Curso</th>
                            <th className="px-4 py-3">Seccion</th>
                            <th className="px-4 py-3">Docente</th>
                            <th className="px-4 py-3">Aula</th>
                            <th className="px-4 py-3">Ciclo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {blocks.length ? blocks.map((block, blockIndex) => (
                            <tr key={`${block.section_offering_id || block.section_id || block.course_id}-${blockIndex}`} className="border-t border-slate-100">
                                <td className="px-4 py-3 font-semibold text-slate-700">
                                    <CalendarDays size={14} className="mr-1 inline" /> {block.day_name || dayLabel(block.day_of_week)}
                                </td>
                                <td className="px-4 py-3 text-slate-600">{shortTime(block.start_time)} - {shortTime(block.end_time)}</td>
                                <td className="px-4 py-3 text-slate-700">{block.course_name || block.course_code || block.course_id || '-'}</td>
                                <td className="px-4 py-3 text-slate-600">{block.section_code || block.section_id || '-'}</td>
                                <td className="px-4 py-3 text-slate-600">{block.teacher_name || block.teacher_code || block.teacher_id || 'Sin docente'}</td>
                                <td className="px-4 py-3 text-slate-600">{block.classroom_name || block.classroom_code || block.classroom_id || 'Virtual'}</td>
                                <td className="px-4 py-3 text-slate-600">{block.cycle_number || '-'}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan="7" className="px-4 py-8 text-center text-slate-500">Esta solucion no incluye bloques para mostrar.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <SummaryGrid title="Resumen docente" data={solution?.teacher_load_summary} />
            <SummaryGrid title="Uso de aulas" data={solution?.classroom_usage} />
        </article>
    )
}

function SummaryGrid({ title, data }) {
    const entries = Object.entries(data || {})
    if (!entries.length) return null

    return (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-black text-slate-800">{title}</p>
            <div className="mt-3 grid gap-2 md:grid-cols-3">
                {entries.slice(0, 6).map(([key, value]) => (
                    <div key={key} className="rounded-xl bg-white px-3 py-2 text-xs">
                        <p className="font-black text-slate-600">{key}</p>
                        <p className="mt-1 text-slate-500">{formatValue(value)}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

function formatValue(value) {
    if (value === null || value === undefined) return '-'
    if (typeof value === 'object') return Object.entries(value).map(([key, val]) => `${key}: ${val}`).join(', ')
    return String(value)
}

function asArray(value) {
    return Array.isArray(value) ? value : []
}

function countKeys(value) {
    return value && typeof value === 'object' ? Object.keys(value).length : 0
}

function shortTime(value) {
    return value ? String(value).slice(0, 5) : '-'
}

function dayLabel(value) {
    const labels = { 1: 'Lunes', 2: 'Martes', 3: 'Miercoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sabado', 7: 'Domingo' }
    return labels[value] || value || '-'
}
