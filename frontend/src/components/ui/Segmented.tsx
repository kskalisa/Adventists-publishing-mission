export function Segmented({ items }: { items: string[] }) {
  return (
    <div className="flex rounded-md bg-slate-100 p-1">
      {items.map((item, index) => (
        <button className={`rounded px-4 py-2 text-sm ${index === 0 ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`} key={item} type="button">
          {item}
        </button>
      ))}
    </div>
  )
}

