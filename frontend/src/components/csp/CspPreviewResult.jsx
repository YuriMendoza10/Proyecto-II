import EmptyState from '../common/EmptyState'
import CspIssueList from './CspIssueList'
import CspMetricCard from './CspMetricCard'
import CspSolutionCard from './CspSolutionCard'
import CspTechnicalDetails from './CspTechnicalDetails'

export default function CspPreviewResult({ data }) {
    if (!data) return null

    const solutions = asArray(data.solutions)
    const blocks = asArray(data.blocks)
    const warnings = asArray(data.warnings).length + asArray(data.soft_warnings).length

    return (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
                <div>
                    <p className="text-xs font-black uppercase tracking-wide text-blue-600">Vista previa CSP</p>
                    <h2 className="mt-1 text-2xl font-black text-slate-900">Resumen de alternativas</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Revisa candidatos, advertencias y soluciones antes de guardar cambios.
                    </p>
                </div>
                <span className={`w-fit rounded-full px-4 py-2 text-xs font-black uppercase ${solutions.length || blocks.length ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {solutions.length || blocks.length ? 'Con datos' : 'Sin datos'}
                </span>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
                <CspMetricCard label="Ofertas totales" value={data.total_offerings ?? solutions.length ?? '-'} tone="info" />
                <CspMetricCard label="Bloques" value={blocks.length || data.total_blocks || data.generated_blocks || '-'} tone="info" />
                <CspMetricCard label="Elegibles" value={data.eligible_offerings ?? data.sections_count ?? data.summary?.sections ?? '-'} tone="neutral" />
                <CspMetricCard label="READY" value={data.ready_offerings ?? '-'} tone="neutral" />
                <CspMetricCard label="APPROVED" value={data.approved_offerings ?? '-'} tone="neutral" />
                <CspMetricCard label="Advertencias" value={warnings || '-'} tone={warnings ? 'warning' : 'success'} />
            </div>

            {!solutions.length && !blocks.length ? (
                <div className="mt-6">
                    <EmptyState title="No hay secciones listas para previsualizar." text="Revise la oferta academica o el diagnostico antes de continuar." />
                </div>
            ) : null}

            {solutions.length ? (
                <div className="mt-6 space-y-5">
                    {solutions.map((solution, index) => (
                        <CspSolutionCard key={solution.solution_index ?? index} solution={solution} index={index} />
                    ))}
                </div>
            ) : blocks.length ? (
                <BlocksTable blocks={blocks} />
            ) : null}

            <div className="mt-6">
                <h3 className="mb-3 text-lg font-black text-slate-900">Advertencias previas</h3>
                <CspIssueList data={data} emptyText="No hay advertencias previas." />
            </div>
            <CspTechnicalDetails data={data} />
        </section>
    )
}

function BlocksTable({ blocks }) {
    return (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-slate-50 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                    <tr>
                        <th className="px-4 py-3">Dia</th>
                        <th className="px-4 py-3">Hora</th>
                        <th className="px-4 py-3">Curso</th>
                        <th className="px-4 py-3">Seccion</th>
                        <th className="px-4 py-3">Aula</th>
                    </tr>
                </thead>
                <tbody>
                    {blocks.map((block, index) => (
                        <tr key={`${block.section_id || block.section_offering_id}-${index}`} className="border-t border-slate-100">
                            <td className="px-4 py-3">{block.day_name || block.day_of_week || '-'}</td>
                            <td className="px-4 py-3">{shortTime(block.start_time)} - {shortTime(block.end_time)}</td>
                            <td className="px-4 py-3">{block.course_name || block.course_id || '-'}</td>
                            <td className="px-4 py-3">{block.section_code || block.section_id || '-'}</td>
                            <td className="px-4 py-3">{block.classroom_code || block.classroom_id || 'Virtual'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

function asArray(value) {
    return Array.isArray(value) ? value : []
}

function shortTime(value) {
    return value ? String(value).slice(0, 5) : '-'
}
