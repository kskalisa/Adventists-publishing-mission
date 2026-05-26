export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-9 shrink-0 place-items-center rounded-md bg-[#21459b]">
        <div className="size-4 rotate-45 rounded-sm bg-[#f4ca3b]" />
      </div>
      {!compact && <p className="font-semibold text-slate-100">Adventist Publishing</p>}
    </div>
  )
}

