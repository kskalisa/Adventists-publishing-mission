import type { LucideIcon } from 'lucide-react'

export type Stat = {
  label: string
  value: string
  helper?: string
  icon?: LucideIcon
  tone?: 'blue' | 'red' | 'green' | 'orange'
}

export type BadgeTone = 'green' | 'blue' | 'orange' | 'red' | 'purple' | 'gray'

