import {
  AlertTriangle,
  ArrowLeftRight,
  BarChart3,
  Box,
  Clock3,
  FileText,
  Bell,
  LayoutDashboard,
  LibraryBig,
  Package,
  PackageCheck,
  Printer,
  ShoppingCart,
  Users,
  WalletCards,
} from "lucide-react";
import type { NavItem } from "../types/navigation";

export const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, group: "main" },
  { id: "inventory", label: "Inventory", icon: Box, group: "management" },
  { id: "sales", label: "Sales", icon: ShoppingCart, group: "management" },
  { id: "coordinator-production", label: "Production Orders", icon: Package, group: "management" },
  {
    id: "coordinator-budget",
    label: "Production Budget",
    icon: WalletCards,
    group: "management",
  },
  {
    id: "customer-requests",
    label: "Customer Requests",
    icon: FileText,
    group: "management",
  },
  { id: "users", label: "Users & Access", icon: Users, group: "management" },
  {
    id: "inventory-manager-book-requests",
    label: "Book Requests",
    icon: Bell,
    group: "management",
  },
  { id: "reports", label: "Analytics", icon: BarChart3, group: "analysis" },
];

export const salesNavItems: NavItem[] = [
  {
    id: "sales-dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    group: "main",
  },
  {
    id: "pos",
    label: "Point of Sale",
    icon: ShoppingCart,
    group: "management",
  },
  { id: "customers", label: "Customers", icon: Users, group: "management" },
  {
    id: "sales-history",
    label: "Sales History",
    icon: Clock3,
    group: "management",
  },
  {
    id: "sales-orders",
    label: "Customer Orders",
    icon: FileText,
    group: "management",
  },
  {
    id: "sales-fulfillment",
    label: "Fulfillment",
    icon: PackageCheck,
    group: "management",
  },
  {
    id: "daily-summary",
    label: "Daily Summary",
    icon: BarChart3,
    group: "management",
  },
];

export const customerNavItems: NavItem[] = [
  {
    id: "customer-dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    group: "main",
  },
  {
    id: "customer-orders",
    label: "My Orders",
    icon: FileText,
    group: "management",
  },
  {
    id: "customer-browse-books",
    label: "Browse Books",
    icon: LibraryBig,
    group: "management",
  },
  {
    id: "customer-place-order",
    label: "New Order",
    icon: ShoppingCart,
    group: "management",
  },
  {
    id: "customer-book-requests",
    label: "Book Requests",
    icon: Bell,
    group: "management",
  },
  {
    id: "customer-notifications",
    label: "Notifications",
    icon: Bell,
    group: "management",
  },
  {
    id: "customer-profile",
    label: "Account",
    icon: Users,
    group: "management",
  },
];

export const inventoryManagerNavItems: NavItem[] = [
  {
    id: "inventory-manager",
    label: "Dashboard",
    icon: LayoutDashboard,
    group: "main",
  },
  {
    id: "inventory-manager-inventory",
    label: "Book Inventory",
    icon: LibraryBig,
    group: "management",
  },
  {
    id: "inventory-manager-adjustments",
    label: "Stock Adjustments",
    icon: ArrowLeftRight,
    group: "management",
  },
  {
    id: "inventory-manager-reprint",
    label: "Reprint Alerts",
    icon: AlertTriangle,
    group: "management",
  },
  {
    id: "inventory-manager-book-requests",
    label: "Book Requests",
    icon: Bell,
    group: "management",
  },
  {
    id: "inventory-manager-report",
    label: "Report",
    icon: BarChart3,
    group: "management",
  },
];

export const coordinatorNavItems: NavItem[] = [
  {
    id: "coordinator",
    label: "Dashboard",
    icon: LayoutDashboard,
    group: "main",
  },
  {
    id: "coordinator-reprint",
    label: "Reprint Planning",
    icon: Printer,
    group: "management",
  },
  {
    id: "coordinator-sales",
    label: "Sales Analysis",
    icon: BarChart3,
    group: "management",
  },
  {
    id: "coordinator-production",
    label: "Production Orders",
    icon: Package,
    group: "management",
  },
  {
    id: "coordinator-budget",
    label: "Production Budget",
    icon: WalletCards,
    group: "management",
  },
  {
    id: "coordinator-reports",
    label: "Reports",
    icon: BarChart3,
    group: "management",
  },
];
