import { Avatar } from './Avatar'

export function UserCell({ name, src, sub }: { name: string; src?: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar src={src} label={name.slice(0, 2).toUpperCase()} />
      <div>
        <p className="font-medium text-slate-900">{name}</p>
        {sub && <p className="text-xs text-slate-400">{sub}</p>}
      </div>
    </div>
  )
}

