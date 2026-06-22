import { useState } from 'react'
import type { Screen } from './types/navigation'
import { getCurrentUser } from './lib/api'
import {
  Customers,
  Dashboard,
  DailySummary,
  Inventory,
  InventoryManagerDashboard,
  Landing,
  Login,
  PointOfSale,
  Reports,
  RequestAccess,
  Sales,
  SalesDashboard,
  SalesHistory,
  Users,
  CoordinatorDashboard,
} from './pages'
import type { UserRole } from './lib/api'

function getInitialScreen(): Screen {
  const hash = window.location.hash.replace('#', '') as Screen
  return hash || 'landing'
}

function App() {
  const [screen, setScreen] = useState<Screen>(getInitialScreen)
  const currentUser = getCurrentUser()

  const navigate = (next: Screen) => {
    window.location.hash = next
    setScreen(next)
  }

  if (screen === 'landing') return <Landing onNavigate={navigate} />
  if (screen === 'login') return <Login onNavigate={navigate} />
  if (screen === 'access') return <RequestAccess onNavigate={navigate} />
  if (!currentUser) return <Login onNavigate={navigate} />
  if (!canAccess(currentUser.role, screen)) return <Login onNavigate={navigate} />
  if (screen === 'inventory') return <Inventory active={screen} onNavigate={navigate} />
  if (screen === 'sales') return <Sales active={screen} onNavigate={navigate} />
  if (screen === 'customers') return <Customers active={screen} onNavigate={navigate} role={currentUser?.role === 'SALES' ? 'sales' : 'admin'} />
  if (screen === 'reports') return <Reports active={screen} onNavigate={navigate} />
  if (screen === 'pos') return <PointOfSale active={screen} onNavigate={navigate} />
  if (screen === 'sales-dashboard') return <SalesDashboard active={screen} onNavigate={navigate} />
  if (screen === 'sales-history') return <SalesHistory active={screen} onNavigate={navigate} />
  if (screen === 'daily-summary') return <DailySummary active={screen} onNavigate={navigate} />
  if (screen === 'users') return <Users active={screen} onNavigate={navigate} />
  if (
    screen === 'inventory-manager' ||
    screen === 'inventory-manager-inventory' ||
    screen === 'inventory-manager-adjustments' ||
    screen === 'inventory-manager-reprint' ||
    screen === 'inventory-manager-report' ||
    screen === 'inventory-manager-profile'
  ) return <InventoryManagerDashboard active={screen} onNavigate={navigate} />
  if (
    screen === 'coordinator' ||
    screen === 'coordinator-reprint' ||
    screen === 'coordinator-sales' ||
    screen === 'coordinator-production' ||
    screen === 'coordinator-budget' ||
    screen === 'coordinator-reports'
  ) return <CoordinatorDashboard active={screen} onNavigate={navigate} />

  return <Dashboard active={screen} onNavigate={navigate} />
}

function canAccess(role: UserRole, screen: Screen) {
  const allowed: Record<UserRole, Screen[]> = {
    ADMIN: ['dashboard', 'inventory', 'sales', 'customers', 'users', 'reports', 'pos'],
    SALES: ['sales-dashboard', 'pos', 'customers', 'sales-history', 'daily-summary'],
    INVENTORY_MANAGER: ['inventory-manager', 'inventory-manager-inventory', 'inventory-manager-adjustments', 'inventory-manager-reprint', 'inventory-manager-report', 'inventory-manager-profile'],
    COORDINATOR: ['coordinator', 'coordinator-reprint', 'coordinator-sales', 'coordinator-production', 'coordinator-budget', 'coordinator-reports'],
    CUSTOMER: [],
  }
  return allowed[role].includes(screen)
}

export default App
