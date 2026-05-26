import { Card } from './Card'
import type { Stat } from '../../types/ui'

export function StatCard({ stat }: { stat: Stat }) {
  const Icon = stat.icon
  const tones = {
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    green: 'bg-emerald-50 text-emerald-600',
    orange: 'bg-amber-50 text-amber-600',
  }

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{stat.label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{stat.value}</p>
          {stat.helper && <p className="mt-2 text-sm text-slate-500">{stat.helper}</p>}
        </div>
        {Icon && (
          <div className={`rounded-md p-2 ${tones[stat.tone ?? 'blue']}`}>
            <Icon className="size-5" />
          </div>
        )}
      </div>
    </Card>
  )
}

