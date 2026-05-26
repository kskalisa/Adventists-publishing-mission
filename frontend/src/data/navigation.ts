import { AlertTriangle, ArrowLeftRight, BarChart3, BookOpen, Box, Clock3, LayoutDashboard, LibraryBig, Package, Printer, ShoppingCart, Truck, Users, WalletCards } from 'lucide-react'
import type { NavItem } from '../types/navigation'

export const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'main' },
  { id: 'inventory', label: 'Inventory', icon: Box, group: 'management' },
  { id: 'sales', label: 'Sales', icon: ShoppingCart, group: 'management' },
  { id: 'customers', label: 'Customers', icon: Users, group: 'management' },
  { id: 'publishing', label: 'Publishing', icon: BookOpen, group: 'management' },
  { id: 'distribution', label: 'Distribution', icon: Truck, group: 'management' },
  { id: 'reports', label: 'Reports', icon: BarChart3, group: 'analysis' },
]

export const salesNavItems: NavItem[] = [
  { id: 'sales-dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'main' },
  { id: 'pos', label: 'Point of Sale', icon: ShoppingCart, group: 'management' },
  { id: 'customers', label: 'Customers', icon: Users, group: 'management' },
  { id: 'sales-history', label: 'Sales History', icon: Clock3, group: 'management' },
  { id: 'daily-summary', label: 'Daily Summary', icon: BarChart3, group: 'management' },
]

export const inventoryManagerNavItems: NavItem[] = [
  { id: 'inventory-manager', label: 'Dashboard', icon: LayoutDashboard, group: 'main' },
  { id: 'inventory-manager-inventory', label: 'Book Inventory', icon: LibraryBig, group: 'management' },
  { id: 'inventory-manager-adjustments', label: 'Stock Adjustments', icon: ArrowLeftRight, group: 'management' },
  { id: 'inventory-manager-reprint', label: 'Reprint Alerts', icon: AlertTriangle, group: 'management' },
  { id: 'inventory-manager-report', label: 'Report', icon: BarChart3, group: 'management' },
]

export const coordinatorNavItems: NavItem[] = [
  { id: 'coordinator', label: 'Dashboard', icon: LayoutDashboard, group: 'main' },
  { id: 'coordinator-reprint', label: 'Reprint Planning', icon: Printer, group: 'management' },
  { id: 'coordinator-sales', label: 'Sales Analysis', icon: BarChart3, group: 'management' },
  { id: 'coordinator-production', label: 'Production Orders', icon: Package, group: 'management' },
  { id: 'coordinator-budget', label: 'Budget Tracking', icon: WalletCards, group: 'management' },
  { id: 'coordinator-reports', label: 'Reports', icon: BarChart3, group: 'management' },
]
