import { useMemo, useState } from 'react'
import EmptyState from '../common/EmptyState'

function normalizeIssues(data) {
    const items = []
    const push = (item, fallback = {}) => {
        if (!item) return
        if (typeof item === 'string') {
            items.push({ message: item, severity: fallback.severity || 'WARNING', ...fallback })
            return
        }
        items.push({
            section: item.section_code || item.section || item.section_id || fallback.section || '-',
            course: item.course_name || item.course || item.course_id || fallback.course || '-',
            severity: item.severity || item.level || fallback.severity || 'WARNING',
            message: item.message || item.reason || item.detail || item.description || fallback.message || 'Observacion CSP',
            recommendation: item.suggested_action || item.recommendation || item.action || fallback.recommendation || '-',
        })
    }

    asArray(data?.issues).forEach((item) => push(item))
    asArray(data?.conflicts).forEach((item) => push(item, { severity: item.severity || 'CRITICAL' }))
    asArray(data?.warnings).forEach((item) => push(item, { severity: 'WARNING' }))
    asArray(data?.soft_warnings).forEach((item) => push(item, { severity: 'WARNING' }))
    asArray(data?.hard_conflicts).forEach((item) => push(item, { severity: 'CRITICAL' }))
    asArray(data?.not_eligible_by_cycle).forEach((item) => push({
        section: `Ciclo ${item.cycle}`,
        course: `${item.eligible}/${item.total} elegibles`,
        severity: item.eligible ? 'WARNING' : 'CRITICAL',
        message: item.reason || 'Ciclo no elegible para generar.',
        recommendation: item.suggestion || 'Prepare datos demo o complete la oferta academica.',
    }))
    asArray(data?.diagnostics).forEach((item) => {
        asArray(item.reasons).forEach((reason) => push(reason, {
            section: item.section_code || item.section_id,
            course: item.course_name || item.course_id,
            severity: item.is_programmable === false ? 'CRITICAL' : 'WARNING',
        }))
    })
    asArray(data?.problematic_sections).forEach((item) => push(item, { severity: 'WARNING' }))

    return items
}

export default function CspIssueList({ data, emptyText = 'Todo listo para generar horario.' }) {
    const [filter, setFilter] = useState('all')
    const issues = useMemo(() => normalizeIssues(data), [data])
    const summary = useMemo(() => buildIssueSummary(issues), [issues])
    const filteredIssues = useMemo(() => filterIssues(issues, filter), [issues, filter])

    if (!issues.length) {
        return <EmptyState title={emptyText} text="No se detectaron bloqueos en la respuesta CSP." />
    }

    return (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="border-b border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-sm font-black text-slate-900 dark:text-slate-100">Advertencias detectadas: {issues.length}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                            {summary.classroom} sin aula asignada · {summary.teacher} sin docente asignado · {summary.availability} sin disponibilidad · {summary.conflict} conflictos
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2" aria-label="Filtros de advertencias CSP">
                        {[
                            ['all', 'Todas'],
                            ['high', 'Alta severidad'],
                            ['classroom', 'Sin aula'],
                            ['teacher', 'Sin docente'],
                            ['availability', 'Sin disponibilidad'],
                        ].map(([value, label]) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setFilter(value)}
                                className={`rounded-full border px-3 py-1.5 text-xs font-black transition focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                                    filter === value
                                        ? 'border-orange-500 bg-orange-600 text-white'
                                        : 'border-slate-300 bg-white text-slate-700 hover:border-orange-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-h-[420px] overflow-auto">
                <table className="w-full min-w-[760px] text-sm">
                    <caption className="sr-only">Listado de advertencias del diagnostico CSP agrupables por tipo de problema</caption>
                    <thead className="sticky top-0 bg-slate-50 text-left text-xs font-black uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                        <tr>
                            <th scope="col" className="px-4 py-3">Tipo</th>
                            <th scope="col" className="px-4 py-3">Seccion</th>
                            <th scope="col" className="px-4 py-3">Curso</th>
                            <th scope="col" className="px-4 py-3">Severidad</th>
                            <th scope="col" className="px-4 py-3">Problema</th>
                            <th scope="col" className="px-4 py-3">Recomendacion</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredIssues.map((issue, index) => (
                            <tr key={`${issue.message}-${index}`} className="border-t border-slate-100 dark:border-slate-800">
                                <td className="px-4 py-3"><IssueTypeBadge issue={issue} /></td>
                                <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100">{issue.section}</td>
                                <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{issue.course}</td>
                                <td className="px-4 py-3"><SeverityBadge value={issue.severity} /></td>
                                <td className="px-4 py-3 text-slate-800 dark:text-slate-100">{issue.message}</td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{issue.recommendation}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!filteredIssues.length && (
                    <div className="p-4">
                        <EmptyState title="No hay advertencias con este filtro." text="Cambie el filtro para revisar el resto del diagnostico." />
                    </div>
                )}
            </div>
        </div>
    )
}

function SeverityBadge({ value }) {
    const normalized = String(value || 'INFO').toUpperCase()
    const styles = {
        CRITICAL: 'bg-red-100 text-red-700',
        ERROR: 'bg-red-100 text-red-700',
        HIGH: 'bg-red-100 text-red-700',
        WARNING: 'bg-amber-100 text-amber-700',
        MEDIUM: 'bg-amber-100 text-amber-700',
        LOW: 'bg-blue-100 text-blue-700',
        INFO: 'bg-blue-100 text-blue-700',
    }
    return <span className={`rounded-full px-3 py-1 text-xs font-black ${styles[normalized] || styles.INFO}`}>{normalized}</span>
}

function IssueTypeBadge({ issue }) {
    const type = getIssueType(issue)
    const labels = {
        classroom: 'Sin aula',
        teacher: 'Sin docente',
        availability: 'Sin disponibilidad',
        conflict: 'Conflicto',
        other: 'Otros',
    }
    const classes = {
        classroom: 'bg-orange-100 text-orange-800',
        teacher: 'bg-purple-100 text-purple-800',
        availability: 'bg-amber-100 text-amber-800',
        conflict: 'bg-red-100 text-red-800',
        other: 'bg-slate-100 text-slate-800',
    }
    return <span className={`rounded-full px-3 py-1 text-xs font-black ${classes[type]}`}>{labels[type]}</span>
}

function buildIssueSummary(issues) {
    return issues.reduce((summary, issue) => {
        const type = getIssueType(issue)
        summary[type] = (summary[type] || 0) + 1
        return summary
    }, { classroom: 0, teacher: 0, availability: 0, conflict: 0, other: 0 })
}

function filterIssues(issues, filter) {
    if (filter === 'all') return issues
    if (filter === 'high') return issues.filter((issue) => ['CRITICAL', 'ERROR', 'HIGH'].includes(String(issue.severity || '').toUpperCase()))
    return issues.filter((issue) => getIssueType(issue) === filter)
}

function getIssueType(issue) {
    const text = `${issue.message || ''} ${issue.recommendation || ''}`.toLowerCase()
    if (text.includes('aula') || text.includes('classroom')) return 'classroom'
    if (text.includes('docente') || text.includes('teacher')) return 'teacher'
    if (text.includes('disponibilidad') || text.includes('availability')) return 'availability'
    if (text.includes('conflicto') || text.includes('cruce') || text.includes('overlap')) return 'conflict'
    return 'other'
}

function asArray(value) {
    return Array.isArray(value) ? value : []
}
