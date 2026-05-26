import type { ReactNode } from 'react'
import type { BadgeTone } from '../../types/ui'

export function Badge({ children, tone = 'gray' }: { children: ReactNode; tone?: BadgeTone }) {
  const styles = {
    green: 'bg-emerald-100 text-emerald-700',
    blue: 'bg-blue-100 text-blue-700',
    orange: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-700',
    purple: 'bg-purple-100 text-purple-700',
    gray: 'bg-slate-100 text-slate-600',
  }

  return <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${styles[tone]}`}>{children}</span>
}

