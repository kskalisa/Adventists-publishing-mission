import { useState } from 'react'
import type { Screen } from './types/navigation'
import {
  Customers,
  CustomerDashboard,
  Dashboard,
  DailySummary,
  Distribution,
  Inventory,
  InventoryManagerDashboard,
  Landing,
  Login,
  PointOfSale,
  Publishing,
  Reports,
  RequestAccess,
  Sales,
  SalesDashboard,
  SalesHistory,
  Settings,
  Users,
  CoordinatorDashboard,
} from './pages'

function getInitialScreen(): Screen {
  const hash = window.location.hash.replace('#', '') as Screen
  return hash || 'landing'
}

function App() {
  const [screen, setScreen] = useState<Screen>(getInitialScreen)

  const navigate = (next: Screen) => {
    window.location.hash = next
    setScreen(next)
  }

  if (screen === 'landing') return <Landing onNavigate={navigate} />
  if (screen === 'login') return <Login onNavigate={navigate} />
  if (screen === 'access') return <RequestAccess onNavigate={navigate} />
  if (screen === 'inventory') return <Inventory active={screen} onNavigate={navigate} />
  if (screen === 'sales') return <Sales active={screen} onNavigate={navigate} />
  if (screen === 'customers') return <Customers active={screen} onNavigate={navigate} />
  if (screen === 'distribution') return <Distribution active={screen} onNavigate={navigate} />
  if (screen === 'publishing') return <Publishing active={screen} onNavigate={navigate} />
  if (screen === 'reports') return <Reports active={screen} onNavigate={navigate} />
  if (screen === 'pos') return <PointOfSale active={screen} onNavigate={navigate} />
  if (screen === 'sales-dashboard') return <SalesDashboard active={screen} onNavigate={navigate} />
  if (screen === 'sales-history') return <SalesHistory active={screen} onNavigate={navigate} />
  if (screen === 'daily-summary') return <DailySummary active={screen} onNavigate={navigate} />
  if (screen === 'settings') return <Settings active={screen} onNavigate={navigate} />
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
  if (screen === 'customer-dashboard') return <CustomerDashboard active={screen} onNavigate={navigate} />

  return <Dashboard active={screen} onNavigate={navigate} />
}

export default App
