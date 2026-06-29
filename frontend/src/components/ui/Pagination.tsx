export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}) {
  const pageCount = Math.max(Math.ceil(total / pageSize), 1)
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 text-sm text-slate-500">
      <span>{start}-{end} of {total}</span>
      <div className="flex items-center gap-2">
        <button className="h-9 rounded-md border border-slate-200 px-3 disabled:cursor-not-allowed disabled:opacity-50" disabled={page <= 1} onClick={() => onPageChange(page - 1)} type="button">Previous</button>
        <span className="px-2 font-medium text-slate-700">Page {page} / {pageCount}</span>
        <button className="h-9 rounded-md border border-slate-200 px-3 disabled:cursor-not-allowed disabled:opacity-50" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)} type="button">Next</button>
      </div>
    </div>
  )
}

export function paginate<T>(items: T[], page: number, pageSize: number) {
  return items.slice((page - 1) * pageSize, page * pageSize)
}
