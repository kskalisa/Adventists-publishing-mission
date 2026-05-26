import type { LucideIcon } from 'lucide-react'

export type Screen =
  | 'landing'
  | 'login'
  | 'access'
  | 'dashboard'
  | 'inventory'
  | 'sales'
  | 'customers'
  | 'distribution'
  | 'publishing'
  | 'reports'
  | 'pos'
  | 'sales-dashboard'
  | 'sales-history'
  | 'daily-summary'
  | 'settings'
  | 'users'
  | 'inventory-manager'
  | 'inventory-manager-inventory'
  | 'inventory-manager-adjustments'
  | 'inventory-manager-reprint'
  | 'inventory-manager-report'
  | 'inventory-manager-profile'
  | 'coordinator'
  | 'coordinator-reprint'
  | 'coordinator-sales'
  | 'coordinator-production'
  | 'coordinator-budget'
  | 'coordinator-reports'
  | 'customer-dashboard'

export type Navigate = (screen: Screen) => void

export type RoleArea = 'admin' | 'sales' | 'inventory-manager' | 'coordinator' | 'customer'

export type NavItem = {
  id: Screen
  label: string
  icon: LucideIcon
  group: 'main' | 'management' | 'analysis'
}

export type PageProps = {
  active: Screen
  onNavigate: Navigate
}
