import EmptyState from './EmptyState'
import ErrorState from './ErrorState'
import LoadingState from './LoadingState'

export default function DataTable({
  caption,
  columns,
  rows = [],
  getRowKey = (row, index) => row.id ?? index,
  loading = false,
  error,
  emptyTitle = 'No hay datos para mostrar',
  emptyMessage = 'Ajusta los filtros o vuelve a intentarlo más tarde.',
  minWidth = 'min-w-full',
}) {
  if (loading) return <LoadingState message="Cargando datos..." />
  if (error) return <ErrorState message={error} />
  if (!rows.length) return <EmptyState title={emptyTitle} message={emptyMessage} />

  return (
    <div className="overflow-x-auto">
      <table className={`${minWidth} divide-y divide-slate-200 text-left text-sm`}>
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead className="bg-slate-100">
          <tr>
            {columns.map((column) => (
              <th
                className={`whitespace-nowrap px-4 py-3 text-sm font-bold text-slate-800 ${column.headerClassName || ''}`}
                key={column.key}
                scope="col"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {rows.map((row, index) => (
            <tr className="transition-colors hover:bg-blue-50" key={getRowKey(row, index)}>
              {columns.map((column) => (
                <td className={`px-4 py-3 align-top text-slate-800 ${column.className || ''}`} key={column.key}>
                  {column.render ? column.render(row, index) : row[column.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
