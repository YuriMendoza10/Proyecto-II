export default function TechnicalEndpointDetails({ endpoint, className = '' }) {
  if (!endpoint) return null

  return (
    <details className={`text-sm text-slate-700 ${className}`.trim()}>
      <summary className="cursor-pointer font-semibold text-blue-700 hover:text-blue-900">
        Ver detalle tecnico
      </summary>
      <p className="mt-2 max-w-xl break-all rounded-md bg-slate-100 px-3 py-2 font-mono text-sm text-slate-800">
        Endpoint: {endpoint}
      </p>
    </details>
  )
}
