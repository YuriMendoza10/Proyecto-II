export default function CspTechnicalDetails({ data, title = 'Ver detalles tecnicos' }) {
    if (!data) return null

    return (
        <details className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer text-sm font-black text-slate-700">
                {title}
            </summary>
            <pre className="mt-4 max-h-72 overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100">
                {JSON.stringify(data, null, 2)}
            </pre>
        </details>
    )
}
