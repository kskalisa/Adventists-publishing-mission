import type { LucideIcon } from "lucide-react";

export type Screen =
  | "landing"
  | "login"
  | "register"
  | "dashboard"
  | "inventory"
  | "sales"
  | "customers"
  | "customer-requests"
  | "distribution"
  | "publishing"
  | "reports"
  | "pos"
  | "sales-dashboard"
  | "sales-history"
  | "sales-orders"
  | "sales-fulfillment"
  | "daily-summary"
  | "settings"
  | "notifications"
  | "users"
  | "inventory-manager"
  | "inventory-manager-inventory"
  | "inventory-manager-adjustments"
  | "inventory-manager-reprint"
  | "inventory-manager-report"
  | "inventory-manager-book-requests"
  | "inventory-manager-profile"
  | "coordinator"
  | "coordinator-reprint"
  | "coordinator-sales"
  | "coordinator-production"
  | "coordinator-budget"
  | "coordinator-reports"
  | "customer-dashboard"
  | "customer-browse-books"
  | "customer-place-order"
  | "customer-orders"
  | "customer-book-requests"
  | "customer-notifications"
  | "customer-profile";

export type Navigate = (screen: Screen) => void;

export type RoleArea =
  | "admin"
  | "sales"
  | "inventory-manager"
  | "coordinator"
  | "customer";

export type NavItem = {
  id: Screen;
  label: string;
  icon: LucideIcon;
  group: "main" | "management" | "analysis";
};

export type PageProps = {
  active: Screen;
  onNavigate: Navigate;
};
