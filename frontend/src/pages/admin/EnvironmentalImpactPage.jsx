import { useCallback, useEffect, useState } from 'react'
import {
    Activity,
    ArrowUpRight,
    BarChart3,
    Cloud,
    Database,
    Globe2,
    Info,
    Leaf,
    Loader2,
    RefreshCw,
    Route,
    Server,
    Timer,
    TriangleAlert,
} from 'lucide-react'
import toast from 'react-hot-toast'

import SharedMetricCard from '../../components/common/MetricCard'
import ProgressMetric from '../../components/common/ProgressMetric'
import TechnicalEndpointDetails from '../../components/common/TechnicalEndpointDetails'
import { environmentalImpactService } from '../../services/environmentalImpactService'
import { getEndpointDescription, getEndpointLabel } from '../../utils/endpointLabels'
import { formatBytes, formatCO2, formatInteger, formatMilliseconds } from '../../utils/formatters'

function formatDate(value) {
    if (!value) return '-'

    return new Date(value).toLocaleString('es-PE', {
        dateStyle: 'medium',
        timeStyle: 'medium',
    })
}

function FunctionalityLabel({ path }) {
    return (
        <div className="max-w-sm">
            <p className="font-semibold text-slate-900">{getEndpointLabel(path)}</p>
            <p className="mt-1 text-sm leading-5 text-slate-700">{getEndpointDescription(path)}</p>
        </div>
    )
}

function MethodBadge({ method }) {
    const normalized = String(method || '').toUpperCase()
    const styles = {
        GET: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        POST: 'border-blue-200 bg-blue-50 text-blue-700',
        PUT: 'border-amber-200 bg-amber-50 text-amber-700',
        PATCH: 'border-amber-200 bg-amber-50 text-amber-700',
        DELETE: 'border-red-200 bg-red-50 text-red-700',
    }

    return (
        <span className={`rounded-full border px-2.5 py-1 text-sm font-bold ${styles[normalized] || 'border-slate-200 bg-slate-50 text-slate-700'}`}>
            {normalized || 'N/A'}
        </span>
    )
}

function StatusBadge({ statusCode }) {
    const status = Number(statusCode)
    let classes = 'border-red-200 bg-red-50 text-red-700'

    if (status >= 200 && status < 300) {
        classes = 'border-emerald-200 bg-emerald-50 text-emerald-700'
    } else if (status >= 300 && status < 400) {
        classes = 'border-blue-200 bg-blue-50 text-blue-700'
    } else if (status >= 400 && status < 500) {
        classes = 'border-amber-200 bg-amber-50 text-amber-700'
    }

    return (
        <span className={`rounded-full border px-2.5 py-1 text-sm font-bold ${classes}`}>
            {statusCode}
        </span>
    )
}

function EmptyState({ title, description, icon: Icon = Leaf }) {
    return (
        <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center">
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                <Icon size={24} />
            </div>
            <p className="mt-4 font-semibold text-slate-800">{title}</p>
            <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">{description}</p>
        </div>
    )
}

function LoadingState() {
    return (
        <div className="space-y-6">
            <div className="h-56 animate-pulse rounded-3xl bg-gradient-to-r from-emerald-100 to-teal-50" />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[...Array(7)].map((_, index) => (
                    <div key={index} className="h-32 animate-pulse rounded-2xl border border-slate-100 bg-white shadow-sm">
                        <div className="m-5 h-4 w-24 rounded bg-slate-100" />
                        <div className="mx-5 mt-5 h-7 w-36 rounded bg-slate-100" />
                    </div>
                ))}
            </div>
        </div>
    )
}

function ErrorState({ onRetry }) {
    return (
        <div className="rounded-3xl border border-red-100 bg-white p-8 shadow-sm">
            <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
                <div className="flex gap-4">
                    <div className="rounded-2xl bg-red-50 p-3 text-red-600">
                        <TriangleAlert size={25} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">No se pudieron cargar las metricas</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Revisa la conexion con el backend y vuelve a intentar la consulta.
                        </p>
                    </div>
                </div>
                <button
                    onClick={onRetry}
                    className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                    <RefreshCw size={16} />
                    Reintentar
                </button>
            </div>
        </div>
    )
}

export default function EnvironmentalImpactPage() {
    const [summary, setSummary] = useState(null)
    const [metrics, setMetrics] = useState([])
    const [ranking, setRanking] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [lastUpdated, setLastUpdated] = useState(null)

    const loadDashboard = useCallback(async () => {
        setLoading(true)
        setError(false)

        try {
            const [summaryData, metricsData, rankingData] = await Promise.all([
                environmentalImpactService.getSummary(),
                environmentalImpactService.getMetrics(),
                environmentalImpactService.getRanking(),
            ])

            setSummary(summaryData)
            setMetrics(metricsData)
            setRanking(rankingData)
            setLastUpdated(new Date())
        } catch (requestError) {
            console.error(requestError)
            setError(true)
            toast.error('No se pudieron cargar las metricas ambientales')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        const timer = window.setTimeout(() => {
            loadDashboard()
        }, 0)

        return () => window.clearTimeout(timer)
    }, [loadDashboard])

    const highestImpact = Number(ranking[0]?.total_co2 || 0)

    if (loading && !summary) {
        return <LoadingState />
    }

    return (
        <div className="space-y-6">
            <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-800 to-teal-600 p-6 text-white shadow-lg shadow-emerald-900/10 sm:p-8">
                <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
                    <div className="flex items-start gap-5">
                        <div className="hidden rounded-3xl border border-white/20 bg-white/10 p-5 shadow-inner backdrop-blur sm:block">
                            <Globe2 size={42} className="text-emerald-100" />
                        </div>
                        <div>
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                                <Leaf size={13} />
                                Observabilidad sostenible
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Impacto ambiental</h1>
                            <p className="mt-3 max-w-2xl text-sm leading-7 text-emerald-50/90 sm:text-base">
                                Estimacion del consumo digital de las funcionalidades del sistema segun solicitudes
                                realizadas, tiempo promedio de respuesta y transferencia de datos.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-start gap-3 lg:items-end">
                        <button
                            onClick={loadDashboard}
                            disabled={loading}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white px-5 py-3 text-sm font-bold text-emerald-900 shadow-sm transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? <Loader2 size={17} className="animate-spin" /> : <RefreshCw size={17} />}
                            Actualizar
                        </button>
                        <p className="text-sm text-emerald-100">
                            Ultima actualizacion: {lastUpdated ? formatDate(lastUpdated) : 'pendiente'}
                        </p>
                    </div>
                </div>
            </header>

            {error && <ErrorState onRetry={loadDashboard} />}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SharedMetricCard title="Funcionalidad mas usada" value={<span className="block text-xl">{getEndpointLabel(summary?.most_used_endpoint)}</span>} description="Modulo consultado con mayor frecuencia" icon={Route} tone="green" />
                <SharedMetricCard title="Solicitudes totales" value={formatInteger(summary?.total_requests)} description="Operaciones analizadas durante la sesion" icon={Activity} tone="green" />
                <SharedMetricCard title="CO₂ estimado total" value={formatCO2(summary?.total_co2)} description="Emision digital estimada acumulada" icon={Cloud} tone="green" />
                <SharedMetricCard title="Tiempo promedio global" value={formatMilliseconds(summary?.average_response_time)} description="Latencia observada" icon={Timer} tone="blue" />
                <SharedMetricCard title="Datos transferidos" value={formatBytes(summary?.total_bytes)} description="Volumen de informacion procesada" icon={Database} />
            </div>

            <section className="grid gap-4 rounded-3xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50 p-5 shadow-sm md:grid-cols-[auto_1fr] md:p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-100">
                    <Info size={23} />
                </div>
                <div>
                    <h2 className="text-base font-bold text-slate-900">Como interpretar este reporte</h2>
                    <div className="mt-3 grid gap-3 text-sm leading-6 text-slate-600 lg:grid-cols-3">
                        <p className="rounded-xl bg-white/70 px-4 py-3">
                            Las metricas reflejan el uso de las funcionalidades durante la sesion actual.
                        </p>
                        <p className="rounded-xl bg-white/70 px-4 py-3">
                            Los valores sirven como referencia comparativa para observar tendencias de consumo.
                        </p>
                        <p className="rounded-xl bg-white/70 px-4 py-3">
                            El CO2 es una estimacion academica calculada desde los datos transferidos.
                        </p>
                    </div>
                </div>
            </section>

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col justify-between gap-2 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-end sm:px-6">
                    <div>
                        <div className="flex items-center gap-2 text-emerald-700">
                            <BarChart3 size={20} />
                            <h2 className="text-lg font-bold text-slate-900">Consumo estimado por funcionalidad</h2>
                        </div>
                        <p className="mt-1 text-sm text-slate-700">Comparacion de las funciones mas utilizadas y su impacto digital estimado.</p>
                    </div>
                    <span className="inline-flex w-fit items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-800">
                        <ArrowUpRight size={13} />
                        Mayor CO2 primero
                    </span>
                </div>

                <div className="overflow-x-auto p-4 sm:p-5">
                    {ranking.length ? (
                        <table className="min-w-[820px] w-full border-separate border-spacing-y-2 text-sm">
                            <caption className="sr-only">Consumo estimado por funcionalidad, ordenado por mayor emisión de CO₂.</caption>
                            <thead className="text-left text-sm font-bold text-slate-800">
                                <tr>
                                    <th className="px-3 pb-2" scope="col">Modulo o funcionalidad</th>
                                    <th className="px-3 pb-2" scope="col">Uso</th>
                                    <th className="px-3 pb-2" scope="col">CO₂ estimado</th>
                                    <th className="px-3 pb-2" scope="col">Solicitudes</th>
                                    <th className="px-3 pb-2" scope="col">Tiempo promedio</th>
                                    <th className="px-3 pb-2" scope="col">Datos transferidos</th>
                                    <th className="px-3 pb-2" scope="col">Detalle</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ranking.map((item) => {
                                    const percentage = highestImpact > 0
                                        ? Math.max((Number(item.total_co2) / highestImpact) * 100, 2)
                                        : 0

                                    return (
                                        <tr key={item.path} className="bg-slate-50/80 transition hover:bg-emerald-50/50">
                                            <td className="rounded-l-xl px-3 py-3"><FunctionalityLabel path={item.path} /></td>
                                            <td className="min-w-44 px-3 py-3">
                                                <ProgressMetric label="Participación" value={percentage} />
                                            </td>
                                            <td className="px-3 py-3 font-semibold text-emerald-900">{formatCO2(item.total_co2)}</td>
                                            <td className="px-3 py-3 text-slate-800">{formatInteger(item.total_requests)}</td>
                                            <td className="px-3 py-3 text-slate-800">{formatMilliseconds(item.average_response_time)}</td>
                                            <td className="px-3 py-3 text-slate-800">{formatBytes(item.total_bytes)}</td>
                                            <td className="rounded-r-xl px-3 py-3"><TechnicalEndpointDetails endpoint={item.path} /></td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <EmptyState
                            title="Sin funcionalidades medidas aun"
                            description="Realiza operaciones en la plataforma para comenzar a comparar su impacto estimado."
                            icon={BarChart3}
                        />
                    )}
                </div>
            </section>

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col justify-between gap-2 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-end sm:px-6">
                    <div>
                        <div className="flex items-center gap-2 text-teal-700">
                            <Activity size={20} />
                            <h2 className="text-lg font-bold text-slate-900">Metricas recientes</h2>
                        </div>
                        <p className="mt-1 text-sm text-slate-700">Actividad reciente de las funcionalidades, ordenada desde la operacion mas nueva.</p>
                    </div>
                    <p className="text-sm font-medium text-slate-700">{metrics.length} registros visibles</p>
                </div>

                <div className="max-h-[480px] overflow-auto">
                    {metrics.length ? (
                        <table className="min-w-[1020px] w-full divide-y divide-slate-100 text-sm">
                            <caption className="sr-only">Detalle de solicitudes API recientes con transferencia, latencia y emisión estimada.</caption>
                            <thead className="sticky top-0 z-10 bg-slate-100 text-left text-sm font-bold text-slate-800 shadow-sm">
                                <tr>
                                    <th className="px-5 py-3" scope="col">Fecha y hora</th>
                                    <th className="px-4 py-3" scope="col">Método</th>
                                    <th className="px-4 py-3" scope="col">Funcionalidad</th>
                                    <th className="px-4 py-3" scope="col">Estado HTTP</th>
                                    <th className="px-4 py-3" scope="col">Tiempo promedio</th>
                                    <th className="px-4 py-3" scope="col">Transferencia</th>
                                    <th className="px-5 py-3" scope="col">CO₂ estimado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {metrics.map((metric, index) => (
                                    <tr key={`${metric.measured_at}-${metric.path}-${index}`} className="transition hover:bg-emerald-50/30">
                                        <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">{formatDate(metric.measured_at)}</td>
                                        <td className="px-4 py-3.5"><MethodBadge method={metric.method} /></td>
                                        <td className="px-4 py-3.5">
                                            <p className="font-semibold text-slate-900">{getEndpointLabel(metric.path)}</p>
                                            <TechnicalEndpointDetails className="mt-2" endpoint={metric.path} />
                                        </td>
                                        <td className="px-4 py-3.5"><StatusBadge statusCode={metric.status_code} /></td>
                                        <td className="whitespace-nowrap px-4 py-3.5 font-medium text-slate-800">{formatMilliseconds(metric.response_time_ms)}</td>
                                        <td className="whitespace-nowrap px-4 py-3.5 text-slate-800">{formatBytes(metric.response_size_bytes)}</td>
                                        <td className="whitespace-nowrap px-5 py-3.5 font-semibold text-emerald-900">{formatCO2(metric.estimated_co2_g)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-5">
                            <EmptyState
                                title="No hay metricas recientes"
                                description="La tabla se llenara automaticamente conforme se utilicen las funcionalidades del sistema."
                                icon={Server}
                            />
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}
