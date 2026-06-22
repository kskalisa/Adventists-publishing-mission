export function Progress({ label, value, width, color }: { label: string; value: string; width: string | number; color: string }) {
  return (
    <div className="mb-4">
      <div className="mb-2 flex justify-between text-sm">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div className="h-1.5 rounded bg-slate-100">
        <div className={`h-full rounded ${typeof width === 'string' ? width : ''} ${color}`} style={typeof width === 'number' ? { width: `${width}%` } : undefined} />
      </div>
    </div>
  )
}
