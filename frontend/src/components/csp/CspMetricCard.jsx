export default function CspMetricCard({ label, value, tone = 'info', helper }) {
    const tones = {
        info: 'border-blue-100 bg-blue-50 text-blue-700',
        success: 'border-emerald-100 bg-emerald-50 text-emerald-700',
        warning: 'border-amber-100 bg-amber-50 text-amber-700',
        danger: 'border-red-100 bg-red-50 text-red-700',
        neutral: 'border-slate-200 bg-slate-50 text-slate-700',
    }

    return (
        <article className={`rounded-2xl border p-4 ${tones[tone] || tones.info}`}>
            <p className="text-xs font-black uppercase tracking-wide opacity-75">{label}</p>
            <p className="mt-2 text-3xl font-black">{value ?? '-'}</p>
            {helper && <p className="mt-1 text-xs font-semibold opacity-75">{helper}</p>}
        </article>
    )
}
