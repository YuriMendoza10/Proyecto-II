import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react'

import CspIssueList from './CspIssueList'
import CspMetricCard from './CspMetricCard'
import CspTechnicalDetails from './CspTechnicalDetails'

export default function CspDiagnosticResult({ data, scheduleLabel }) {
    if (!data) return null

    const sections = pickNumber(data, ['total_offerings', 'total_sections_checked', 'sections_checked'], ['summary.sections', 'domains.sections'])
    const programmable = pickNumber(data, ['eligible_offerings', 'programmable_sections'], ['summary.eligible_offerings', 'summary.programmable_sections'])
    const problematic = countProblems(data)
    const success = data.success !== false && problematic === 0
    const warning = data.success !== false && problematic > 0

    return (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <Header
                title="Diagnostico completado"
                tone={success ? 'success' : warning ? 'warning' : 'danger'}
                subtitle={data.summary_text || data.message || data.summary?.message || 'Revision de dominios CSP terminada.'}
            />
            <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
                <CspMetricCard label="Horario" value={scheduleLabel || data.schedule_id || 'Nuevo'} tone="neutral" />
                <CspMetricCard label="Secciones revisadas" value={sections} tone="info" />
                <CspMetricCard label="Programables" value={programmable || Math.max(Number(sections || 0) - problematic, 0) || '-'} tone="success" />
                <CspMetricCard label="Con problemas" value={problematic} tone={problematic ? 'warning' : 'success'} />
                <CspMetricCard label="Sin docente" value={pickNumber(data, ['missing_teacher'], ['summary.missing_teacher'])} tone={data.missing_teacher ? 'warning' : 'success'} />
                <CspMetricCard label="Sin aula" value={pickNumber(data, ['missing_classroom'], ['summary.missing_classroom'])} tone={data.missing_classroom ? 'warning' : 'success'} />
            </div>
            <div className="mt-6">
                <h3 className="mb-3 text-lg font-black text-slate-900">Problemas y recomendaciones</h3>
                <CspIssueList data={data} />
            </div>
            <CspTechnicalDetails data={data} />
        </section>
    )
}

function Header({ title, subtitle, tone }) {
    const config = {
        success: { icon: CheckCircle2, badge: 'Exito', classes: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
        warning: { icon: AlertTriangle, badge: 'Advertencia', classes: 'border-amber-200 bg-amber-50 text-amber-700' },
        danger: { icon: ShieldAlert, badge: 'Error', classes: 'border-red-200 bg-red-50 text-red-700' },
    }[tone]
    const Icon = config.icon

    return (
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex items-start gap-3">
                <div className={`rounded-2xl border p-3 ${config.classes}`}><Icon size={24} /></div>
                <div>
                    <h2 className="text-2xl font-black text-slate-900">{title}</h2>
                    <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
                </div>
            </div>
            <span className={`w-fit rounded-full border px-4 py-2 text-xs font-black uppercase ${config.classes}`}>
                {config.badge}
            </span>
        </div>
    )
}

function countProblems(data) {
    const diagnostics = Array.isArray(data?.diagnostics) ? data.diagnostics : []
    const diagnosticProblems = diagnostics.filter((item) => item.is_programmable === false || (item.reasons || []).length).length
    return Number(data?.problematic_sections_count ?? data?.problematic_sections ?? data?.summary?.problematic_sections ?? 0)
        || diagnosticProblems
        || (Array.isArray(data?.issues) ? data.issues.length : 0)
        || (Array.isArray(data?.conflicts) ? data.conflicts.length : 0)
}

function pickNumber(data, directKeys, nestedKeys = []) {
    for (const key of directKeys) {
        if (data?.[key] !== undefined && data?.[key] !== null) return data[key]
    }
    for (const path of nestedKeys) {
        const value = path.split('.').reduce((current, key) => current?.[key], data)
        if (value !== undefined && value !== null) return value
    }
    return '-'
}
