import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

type ButtonProps = {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  icon?: LucideIcon
  onClick?: () => void
  className?: string
}

export function Button({ children, variant = 'primary', icon: Icon, onClick, className = '' }: ButtonProps) {
  const styles = {
    primary: 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50',
    danger: 'border-red-500 bg-white text-red-600 hover:bg-red-50',
    ghost: 'border-transparent bg-transparent text-slate-600 hover:bg-slate-100',
  }

  return (
    <button
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-md border px-4 text-sm font-medium transition ${styles[variant]} ${className}`}
      onClick={onClick}
      type="button"
    >
      {Icon && <Icon className="size-4" />}
      {children}
    </button>
  )
}

