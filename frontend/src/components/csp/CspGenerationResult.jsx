import EmptyState from '../common/EmptyState'
import CspIssueList from './CspIssueList'
import CspMetricCard from './CspMetricCard'
import CspSolutionCard from './CspSolutionCard'
import CspTechnicalDetails from './CspTechnicalDetails'

export default function CspGenerationResult({ data, onSaveSolution, savingSolutionIndex }) {
    if (!data) return null

    const solutions = asArray(data.solutions)
    const blocks = asArray(data.blocks)
    const hasSolutions = solutions.length || blocks.length || data.generated_blocks
    const bestScore = data.best_score ?? data.score_total ?? data.score ?? data.quality_score ?? solutions[0]?.score_total ?? solutions[0]?.score ?? '-'
    const hardConflicts = asArray(data.hard_conflicts).length + asArray(data.conflicts).filter((item) => String(item.severity).toUpperCase() === 'CRITICAL').length
    const warnings = asArray(data.soft_warnings).length + asArray(data.warnings).length

    return (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
                <div>
                    <p className="text-xs font-black uppercase tracking-wide text-emerald-600">Generacion CSP</p>
                    <h2 className="mt-1 text-2xl font-black text-slate-900">
                        {hasSolutions ? 'Generacion completada' : 'Sin soluciones generadas'}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        {data.message || 'Resultado del motor de restricciones para horario institucional.'}
                    </p>
                </div>
                <span className={`w-fit rounded-full px-4 py-2 text-xs font-black uppercase ${hasSolutions ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {hasSolutions ? 'Exito' : 'Revisar'}
                </span>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
                <CspMetricCard label="Soluciones" value={solutions.length || (blocks.length ? 1 : 0)} tone={hasSolutions ? 'success' : 'danger'} />
                <CspMetricCard label="Mejor score" value={bestScore} tone="info" />
                <CspMetricCard label="Bloques" value={data.generated_blocks || blocks.length || sumBlocks(solutions) || '-'} tone="info" />
                <CspMetricCard label="Conflictos criticos" value={hardConflicts} tone={hardConflicts ? 'danger' : 'success'} />
                <CspMetricCard label="Advertencias" value={warnings || '-'} tone={warnings ? 'warning' : 'success'} />
                <CspMetricCard label="Estrategia" value={data.strategy || data.generation_strategy || '-'} tone="neutral" />
            </div>

            {!hasSolutions && (
                <div className="mt-6">
                    <EmptyState title="No hay soluciones para guardar." text="Revise que existan secciones READY o APPROVED, docentes, aulas y disponibilidad suficiente." />
                </div>
            )}

            {solutions.length ? (
                <div className="mt-6 space-y-5">
                    {solutions.map((solution, index) => (
                        <CspSolutionCard
                            key={solution.solution_index ?? index}
                            solution={solution}
                            index={index}
                            onSelect={onSaveSolution}
                            saving={savingSolutionIndex === (solution.solution_index ?? index)}
                        />
                    ))}
                </div>
            ) : blocks.length ? (
                <CspSolutionCard solution={{ ...data, blocks, solution_index: data.selected_solution_index || 0 }} />
            ) : null}

            <div className="mt-6">
                <h3 className="mb-3 text-lg font-black text-slate-900">Conflictos y advertencias</h3>
                <CspIssueList data={data} emptyText="No hay conflictos reportados por el motor CSP." />
            </div>
            <CspTechnicalDetails data={data} />
        </section>
    )
}

function asArray(value) {
    return Array.isArray(value) ? value : []
}

function sumBlocks(solutions) {
    return solutions.reduce((sum, solution) => sum + asArray(solution.blocks).length, 0)
}
