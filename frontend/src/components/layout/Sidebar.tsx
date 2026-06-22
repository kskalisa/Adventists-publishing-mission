import { LogOut } from 'lucide-react'
import { coordinatorNavItems, inventoryManagerNavItems, navItems, salesNavItems } from '../../data/navigation'
import { clearCurrentSession } from '../../lib/api'
import type { Navigate, RoleArea, Screen } from '../../types/navigation'
import { Logo } from '../ui'

const groups = [
  { id: 'main', label: '' },
  { id: 'management', label: 'Management' },
  { id: 'analysis', label: 'Analysis' },
] as const

export function Sidebar({ active, onNavigate, role = 'admin' }: { active: Screen; onNavigate: Navigate; role?: RoleArea }) {
  const items = role === 'sales' ? salesNavItems : role === 'inventory-manager' ? inventoryManagerNavItems : role === 'coordinator' ? coordinatorNavItems : navItems
  const visibleGroups = role === 'sales' || role === 'inventory-manager' || role === 'coordinator' ? groups.filter((group) => group.id !== 'analysis') : groups

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col bg-[#0d2b49] text-white lg:flex">
      <button className="flex h-16 items-center px-6 text-left" onClick={() => onNavigate('landing')} type="button">
        <Logo />
      </button>
      <nav className="flex-1 space-y-6 px-3 pt-4">
        {visibleGroups.map((group) => (
          <div key={group.id}>
            {group.label && <p className="px-3 pb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{group.label}</p>}
            <div className="space-y-1">
              {items
                .filter((item) => item.group === group.id)
                .map((item) => {
                  const Icon = item.icon
                  const selected =
                    active === item.id ||
                    (active === 'pos' && item.id === 'sales') ||
                    (active === 'sales-dashboard' && item.id === 'dashboard') ||
                    (active === 'inventory-manager-profile' && item.id === 'inventory-manager-report')

                  return (
                    <button
                      className={`flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition ${
                        selected ? 'bg-blue-600 text-white' : 'text-slate-100 hover:bg-white/10'
                      }`}
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      type="button"
                    >
                      <Icon className="size-5" />
                      {item.label}
                    </button>
                  )
                })}
            </div>
          </div>
        ))}
      </nav>
      <button
        className="flex items-center gap-3 border-t border-white/5 px-4 py-5 text-sm text-slate-400 transition hover:text-white"
        onClick={() => {
          clearCurrentSession()
          onNavigate('login')
        }}
        type="button"
      >
        <LogOut className="size-5" />
        Log out
      </button>
    </aside>
  )
}
