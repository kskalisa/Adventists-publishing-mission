import { ArrowLeft, Bell } from 'lucide-react'
import { people } from '../../data/assets'
import type { Navigate, RoleArea } from '../../types/navigation'
import { Avatar, Button, Logo, SearchBox } from '../ui'

export function Topbar({ onNavigate, title, role = 'admin' }: { onNavigate: Navigate; title?: string; role?: RoleArea }) {
  const roleLabel = role === 'sales' ? 'Sales' : role === 'inventory-manager' ? 'Inventory Mgr.' : role === 'coordinator' ? 'Coordinator' : 'Administrator'
  const profileScreen = role === 'inventory-manager' ? 'inventory-manager-profile' : 'settings'
  const searchPlaceholder = role === 'coordinator'
    ? title === 'Budget Tracking'
      ? 'Search budget codes, expenses...'
      : title === 'Production Orders'
        ? 'Search orders, ISBN, printer...'
        : title === 'Reports'
          ? 'Search reports...'
          : title === 'Sales Analysis'
            ? 'Search transactions, orders, books...'
            : title === 'Reprint Planning'
              ? 'Search titles, orders, suppliers...'
              : 'Search book title, ISBN...'
    : role === 'inventory-manager'
    ? title === 'Reports'
      ? 'Search reports, metrics...'
      : title === 'Stock Adjustments'
        ? 'Search reference # or reason...'
        : title === 'Reprint Alerts'
          ? 'Search books or alerts...'
          : title === 'Profile'
            ? 'Search settings...'
            : 'Search titles, ISBN, authors...'
    : undefined

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        {title === 'Point of Sale' && <Button variant="ghost" icon={ArrowLeft}> </Button>}
        <div className="hidden w-80 sm:block">
          {title === 'Point of Sale' ? <h1 className="font-semibold text-slate-900">Point of Sale</h1> : <SearchBox placeholder={searchPlaceholder} />}
        </div>
        <button className="lg:hidden" onClick={() => onNavigate('dashboard')} type="button">
          <Logo compact />
        </button>
      </div>
      <div className="flex items-center gap-5">
        <button className="relative text-slate-600" type="button" aria-label="Notifications">
          <Bell className="size-5" />
          <span className="absolute -right-1 -top-1 size-2 rounded-full bg-red-500" />
        </button>
        <button className="hidden text-left sm:block" onClick={() => onNavigate('users')} type="button">
          <p className="text-sm font-medium text-slate-900">Moise Arihafi</p>
          <p className="text-xs text-slate-500">{roleLabel}</p>
        </button>
        <button onClick={() => onNavigate(profileScreen)} type="button">
          <Avatar src={people[0]} label="MA" />
        </button>
      </div>
    </header>
  )
}
