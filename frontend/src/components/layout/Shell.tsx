import type { ReactNode } from 'react'
import type { Navigate, RoleArea, Screen } from '../../types/navigation'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function Shell({
  active,
  onNavigate,
  children,
  title,
  role = 'admin',
}: {
  active: Screen
  onNavigate: Navigate
  children: ReactNode
  title?: string
  role?: RoleArea
}) {
  return (
    <div className="min-h-screen bg-[#eef3f9] text-slate-900">
      <Sidebar active={active} onNavigate={onNavigate} role={role} />
      <div className="lg:pl-[260px]">
        <Topbar onNavigate={onNavigate} title={title} role={role} />
        <main className="mx-auto max-w-[1240px] p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
