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
    const issues = normalizeIssues(data)

    if (!issues.length) {
        return <EmptyState title={emptyText} text="No se detectaron bloqueos en la respuesta CSP." />
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-slate-50 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                    <tr>
                        <th className="px-4 py-3">Seccion</th>
                        <th className="px-4 py-3">Curso</th>
                        <th className="px-4 py-3">Severidad</th>
                        <th className="px-4 py-3">Problema</th>
                        <th className="px-4 py-3">Recomendacion</th>
                    </tr>
                </thead>
                <tbody>
                    {issues.map((issue, index) => (
                        <tr key={`${issue.message}-${index}`} className="border-t border-slate-100">
                            <td className="px-4 py-3 font-semibold text-slate-700">{issue.section}</td>
                            <td className="px-4 py-3 text-slate-600">{issue.course}</td>
                            <td className="px-4 py-3"><SeverityBadge value={issue.severity} /></td>
                            <td className="px-4 py-3 text-slate-700">{issue.message}</td>
                            <td className="px-4 py-3 text-slate-500">{issue.recommendation}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
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

function asArray(value) {
    return Array.isArray(value) ? value : []
}
