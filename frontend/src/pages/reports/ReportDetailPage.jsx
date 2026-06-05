import { useEffect, useMemo, useState } from 'react'
import { Download, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

import { reportService } from '../../services/reportService'
import DataTable from '../../components/common/DataTable'
import LoadingState from '../../components/common/LoadingState'
import ErrorState from '../../components/common/ErrorState'
import MetricCard from '../../components/common/MetricCard'
import ReadableNumber from '../../components/common/ReadableNumber'
import SectionCard from '../../components/common/SectionCard'
import { safeArray, safeObject } from '../../utils/safeData'
import { formatBytes, formatCO2, formatDecimal, formatInteger, formatMilliseconds } from '../../utils/formatters'

const definitions = {
    'teacher-load': {
        title: 'Carga docente',
        description: 'Horas asignadas en horarios publicados y nivel de utilizacion docente.',
        load: reportService.getTeacherLoadReport,
        export: reportService.exportTeacherLoadCsv,
        rows: (data) => safeArray(data.teachers),
        cards: (data) => [['Docentes', safeArray(data.teachers).length], ['Con carga', safeArray(data.teachers).filter((x) => x.assigned_weekly_hours > 0).length], ['Sobrecargados', safeArray(data.teachers).filter((x) => x.status === 'OVERLOADED').length]],
        columns: [['teacher_name', 'Docente'], ['assigned_weekly_hours', 'Horas'], ['max_weekly_hours', 'Maximo'], ['load_percentage', '% carga'], ['courses_count', 'Cursos'], ['sections_count', 'Secciones'], ['status', 'Estado']],
    },
    'classroom-usage': {
        title: 'Uso de aulas',
        description: 'Ocupacion semanal calculada desde bloques institucionales publicados.',
        load: reportService.getClassroomUsageReport,
        export: reportService.exportClassroomUsageCsv,
        rows: (data) => safeArray(data.classrooms),
        cards: (data) => [['Aulas', safeArray(data.classrooms).length], ['En uso', safeArray(data.classrooms).filter((x) => x.blocks_count > 0).length], ['Alta ocupacion', safeArray(data.classrooms).filter((x) => ['HIGH_USAGE', 'SATURATED'].includes(x.status)).length]],
        columns: [['classroom_code', 'Codigo'], ['classroom_name', 'Aula'], ['type', 'Tipo'], ['capacity', 'Capacidad'], ['used_hours', 'Horas'], ['usage_percentage', '% uso'], ['status', 'Estado']],
    },
    offerings: {
        title: 'Estado de ofertas',
        description: 'Avance de secciones ofertadas por periodo academico.',
        load: reportService.getOfferingStatusReport,
        export: reportService.exportOfferingStatusCsv,
        rows: (data) => Object.entries(data.by_status || {}).map(([status, count]) => ({ status, count })),
        cards: (data) => [['Ofertas', data.total_offerings], ['Sin docente', data.missing_teacher], ['Sin aula', data.missing_classroom], ['Publicadas', data.published_count]],
        columns: [['status', 'Estado'], ['count', 'Cantidad']],
    },
    conflicts: {
        title: 'Conflictos de oferta',
        description: 'Alertas detectadas durante la preparacion y validacion de oferta.',
        load: reportService.getConflictsReport,
        export: reportService.exportConflictsCsv,
        rows: (data) => safeArray(data.details),
        cards: (data) => [['Conflictos', data.total_conflicts], ['Pendientes', data.unresolved_count], ['Resueltos', data.resolved_count], ['Criticos', data.by_severity?.CRITICAL || 0]],
        columns: [['conflict_type', 'Tipo'], ['severity', 'Severidad'], ['related_course', 'Curso'], ['related_section', 'Seccion'], ['message', 'Mensaje'], ['is_resolved', 'Resuelto']],
    },
    schedules: {
        title: 'Horarios institucionales',
        description: 'Horarios generados, calidad y distribucion de bloques.',
        load: reportService.getSchedulesReport,
        rows: (data) => safeArray(data.schedules),
        cards: (data) => [['Horarios', safeArray(data.schedules).length], ['Publicados', safeArray(data.schedules).filter((x) => x.status === 'PUBLISHED').length], ['Borradores', safeArray(data.schedules).filter((x) => x.status === 'DRAFT').length]],
        columns: [['name', 'Horario'], ['source_type', 'Fuente'], ['status', 'Estado'], ['quality_score', 'Calidad'], ['total_blocks', 'Bloques'], ['period', 'Periodo'], ['program', 'Programa']],
    },
    students: {
        title: 'Indicadores estudiantiles',
        description: 'Cursos asignados y horarios personales guardados por estudiantes.',
        load: reportService.getStudentsReport,
        export: reportService.exportStudentsCsv,
        rows: (data) => safeArray(data.most_common_courses),
        cards: (data) => [['Estudiantes', data.total_students], ['Con asignaciones', data.students_with_enrollments], ['Con horario guardado', data.students_with_saved_schedules], ['Creditos promedio', data.average_credits]],
        columns: [['course_code', 'Codigo'], ['course_name', 'Curso asignado'], ['students', 'Estudiantes']],
    },
    'change-requests': {
        title: 'Solicitudes docentes',
        description: 'Seguimiento de peticiones de cambio registradas por docentes.',
        load: reportService.getChangeRequestsReport,
        rows: (data) => safeArray(data.requests_by_teacher),
        cards: (data) => [['Solicitudes', data.total], ['Pendientes', data.pending_count], ['Aprobadas', data.approved_count], ['Rechazadas', data.rejected_count]],
        columns: [['teacher_name', 'Docente'], ['total', 'Total'], ['pending', 'Pendientes']],
    },
    sustainability: {
        title: 'Sostenibilidad',
        description: 'Estimacion del consumo digital generado por el uso de las funcionalidades del sistema.',
        load: reportService.getSustainabilityReport,
        rows: (data) => Object.entries(safeObject(data.environmental_metrics)).map(([indicator, value]) => ({ indicator, value })),
        cards: (data) => [['Solicitudes analizadas', safeObject(data.environmental_metrics).total_requests || 0], ['Datos transferidos', safeObject(data.environmental_metrics).total_bytes || 0], ['CO2 estimado total', Number(safeObject(data.environmental_metrics).total_co2 || 0)], ['Analisis complementario', safeObject(data.latest_greenframe_result).available ? 'Disponible' : 'Pendiente']],
        columns: [['indicator', 'Indicador'], ['value', 'Valor']],
    },
}

export default function ReportDetailPage({ reportType }) {
    const config = useMemo(() => definitions[reportType], [reportType])
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [periodId, setPeriodId] = useState('')

    const load = async () => {
        if (!config) return
        try {
            setLoading(true)
            setError(false)
            setData(await config.load(periodId ? { academic_period_id: Number(periodId) } : {}))
        } catch {
            setError(true)
            toast.error('No se pudo cargar el reporte')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        let active = true
        if (!config) {
            return () => { active = false }
        }
        config.load()
            .then((result) => { if (active) setData(result) })
            .catch(() => { setError(true); toast.error('No se pudo cargar el reporte') })
            .finally(() => { if (active) setLoading(false) })
        return () => { active = false }
    }, [config])

    if (!config) {
        return <ErrorState title="Reporte no disponible" message="La ruta solicitada no corresponde a un reporte activo." />
    }

    const rows = data ? safeArray(config.rows(data)) : []

    return <div className="space-y-6">
        <header className="flex flex-col justify-between gap-4 rounded-2xl border bg-white p-6 lg:flex-row lg:items-center">
            <div>
                <p className="text-xs font-bold uppercase tracking-widest text-orange-600">Reportes academicos</p>
                <h1 className="mt-2 text-3xl font-bold text-slate-900">{config.title}</h1>
                <p className="mt-2 text-sm text-slate-500">{config.description}</p>
                {data?.active_period && <p className="mt-2 text-sm font-semibold text-slate-600">Periodo: {data.active_period.code}</p>}
            </div>
            <div className="flex flex-wrap items-end gap-2">
                {reportType !== 'sustainability' && (
                    <label className="text-sm font-semibold text-slate-700">
                        ID de periodo
                        <input
                            type="number"
                            min="1"
                            value={periodId}
                            onChange={(event) => setPeriodId(event.target.value)}
                            placeholder="Ej. 1"
                            className="mt-1 block w-32 rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800"
                        />
                    </label>
                )}
                {config.export && (
                    <button onClick={() => config.export(periodId ? { academic_period_id: Number(periodId) } : {}).then(() => toast.success('Exportacion registrada.')).catch(() => toast.error('No se pudo exportar CSV'))} className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 font-semibold text-white">
                        <Download size={17} /> Exportar CSV
                    </button>
                )}
                <button onClick={load} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 font-semibold text-slate-700">
                    <RefreshCw size={17} /> Actualizar
                </button>
            </div>
        </header>

        {loading && !data && <LoadingState title="Cargando reporte..." />}
        {error && !data && <ErrorState onRetry={load} message="No se pudo recuperar este reporte." />}
        {data && (
            <>
                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {config.cards(data).map(([title, value]) => (
                        <MetricCard
                            key={title}
                            title={title}
                            value={formatCardValue(title, value)}
                            description="Indicador consolidado del reporte"
                            tone={title.includes('Critic') || title.includes('Sobrecarg') ? 'red' : 'slate'}
                        />
                    ))}
                </section>
                <SectionCard
                    title={`Detalle de ${config.title.toLowerCase()}`}
                    subtitle="Los valores incluyen unidades visibles y se pueden revisar con desplazamiento horizontal en pantallas pequeñas."
                >
                    <DataTable
                        caption={`Tabla de ${config.title.toLowerCase()}`}
                        columns={config.columns.map(([field, label]) => ({
                            key: field,
                            label,
                            className: 'max-w-sm',
                            render: (row) => formatTableValue(reportType, field, row[field], row),
                        }))}
                        rows={rows}
                        getRowKey={(row, index) => row.id || row.teacher_id || row.classroom_id || row.schedule_id || `${reportType}-${index}`}
                        emptyTitle="No hay registros para mostrar."
                    />
                </SectionCard>
                {reportType === 'sustainability' && <p className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800">{data.message}</p>}
            </>
        )}
    </div>
}

function display(value) {
    if (typeof value === 'boolean') return value ? 'Si' : 'No'
    if (value === null || value === undefined) return '-'
    return String(value)
}

function formatCardValue(title, value) {
    if (title.includes('CO2')) return formatCO2(value)
    if (title === 'Datos transferidos') return formatBytes(value)
    if (typeof value === 'number') return formatInteger(value)
    return display(value)
}

function formatTableValue(reportType, field, value, row) {
    if (field.includes('percentage')) return <ReadableNumber type="percent" value={value} digits={1} />
    if (field === 'quality_score') return formatDecimal(value, 2)
    if (['assigned_weekly_hours', 'max_weekly_hours', 'used_hours'].includes(field)) return `${formatDecimal(value, 2)} h`
    if (reportType === 'sustainability') {
        if (field === 'indicator') return sustainabilityIndicatorLabel(value)
        if (field === 'value' && row.indicator === 'total_bytes') return formatBytes(value)
        if (field === 'value' && row.indicator?.includes('co2')) return formatCO2(value)
        if (field === 'value' && row.indicator?.includes('time')) return formatMilliseconds(value)
        if (field === 'value' && typeof value === 'number') return formatInteger(value)
    }
    if (typeof value === 'number') return formatInteger(value)
    if (field === 'is_resolved') return value ? 'Sí, resuelto' : 'No, pendiente'
    return display(value)
}

function sustainabilityIndicatorLabel(indicator) {
    const labels = {
        total_requests: 'Solicitudes analizadas',
        total_bytes: 'Datos transferidos',
        total_co2: 'CO2 estimado total',
        average_co2: 'CO2 promedio por solicitud',
        average_response_time: 'Tiempo promedio de respuesta',
    }
    return labels[indicator] || display(indicator).replaceAll('_', ' ')
}
