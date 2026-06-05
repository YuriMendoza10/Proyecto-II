import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function PaginationControls({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [20, 50, 100],
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = total ? (page - 1) * pageSize + 1 : 0
  const end = Math.min(page * pageSize, total)

  return (
    <nav
      aria-label="Paginacion de resultados"
      className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
    >
      <p>
        Mostrando <strong>{start}-{end}</strong> de <strong>{total}</strong>
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2">
          Filas
          <select
            aria-label="Filas por pagina"
            className="rounded-md border border-slate-300 bg-white px-2 py-1"
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            value={pageSize}
          >
            {pageSizeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <button
          aria-label="Pagina anterior"
          className="rounded-md border border-slate-300 p-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          type="button"
        >
          <ChevronLeft aria-hidden="true" size={16} />
        </button>
        <span>Página {page} de {totalPages}</span>
        <button
          aria-label="Pagina siguiente"
          className="rounded-md border border-slate-300 p-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          type="button"
        >
          <ChevronRight aria-hidden="true" size={16} />
        </button>
      </div>
    </nav>
  )
}
