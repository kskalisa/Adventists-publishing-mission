import { ArrowLeft, Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { people } from "../../data/assets";
import {
  getCurrentUser,
  listNotifications,
  roleDashboards,
} from "../../lib/api";
import type { Navigate, RoleArea } from "../../types/navigation";
import { Avatar, Button, Logo, SearchBox } from "../ui";

export function Topbar({
  onNavigate,
  title,
  role = "admin",
}: {
  onNavigate: Navigate;
  title?: string;
  role?: RoleArea;
}) {
  const user = getCurrentUser();
  const [unreadCount, setUnreadCount] = useState(0);
  const roleLabel =
    role === "sales"
      ? "Sales"
      : role === "inventory-manager"
        ? "Inventory Mgr."
        : role === "coordinator"
          ? "Coordinator"
          : role === "customer"
            ? "Customer"
            : "Administrator";
  const profileScreen =
    role === "inventory-manager"
      ? "inventory-manager-profile"
      : role === "admin"
        ? "users"
        : role === "sales"
          ? "customers"
          : role === "customer"
            ? "customer-dashboard"
            : "coordinator";
  const accountScreen =
    role === "sales"
      ? "customers"
      : role === "admin"
        ? "users"
        : role === "customer"
          ? "customer-dashboard"
          : profileScreen;
  const dashboardScreen = user ? roleDashboards[user.role] : "dashboard";
  const searchPlaceholder =
    role === "coordinator"
      ? title === "Production Budget"
        ? "Search budget codes, expenses..."
        : title === "Production Orders"
          ? "Search orders, ISBN, printer..."
          : title === "Reports"
            ? "Search reports..."
            : title === "Sales Analysis"
              ? "Search transactions, orders, books..."
              : title === "Reprint Planning"
                ? "Search titles, orders, suppliers..."
                : "Search book title, ISBN..."
      : role === "inventory-manager"
        ? title === "Reports"
          ? "Search reports, metrics..."
          : title === "Stock Adjustments"
            ? "Search reference # or reason..."
            : title === "Reprint Alerts"
              ? "Search books or alerts..."
              : title === "Profile"
                ? "Search settings..."
                : "Search titles, ISBN, authors..."
        : undefined;

  useEffect(() => {
    const loadUnreadCount = () => {
      listNotifications()
        .then((notifications) =>
          setUnreadCount(notifications.filter((note) => !note.read).length),
        )
        .catch(() => setUnreadCount(0));
    };

    loadUnreadCount();
    window.addEventListener("adventist-notifications-updated", loadUnreadCount);
    return () =>
      window.removeEventListener(
        "adventist-notifications-updated",
        loadUnreadCount,
      );
  }, [role]);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        {title === "Point of Sale" && (
          <Button
            variant="ghost"
            icon={ArrowLeft}
            onClick={() => onNavigate("sales-dashboard")}
          >
            {" "}
          </Button>
        )}
        <div className="hidden w-80 sm:block">
          {title === "Point of Sale" ? (
            <h1 className="font-semibold text-slate-900">Point of Sale</h1>
          ) : (
            <SearchBox placeholder={searchPlaceholder} />
          )}
        </div>
        <button
          className="lg:hidden"
          onClick={() => onNavigate(dashboardScreen)}
          type="button"
        >
          <Logo compact />
        </button>
      </div>
      <div className="flex items-center gap-5">
        <button
          className="relative text-slate-600"
          onClick={() => onNavigate("notifications")}
          type="button"
          aria-label={
            unreadCount > 0
              ? `${unreadCount} unread notifications`
              : "Notifications"
          }
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-2 -top-2 grid min-h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-4 text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
        <button
          className="hidden text-left sm:block"
          onClick={() => onNavigate(accountScreen)}
          type="button"
        >
          <p className="text-sm font-medium text-slate-900">
            {user?.name ?? "Signed-in user"}
          </p>
          <p className="text-xs text-slate-500">{roleLabel}</p>
        </button>
        <button onClick={() => onNavigate(profileScreen)} type="button">
          <Avatar src={people[0]} label="MA" />
        </button>
      </div>
    </header>
  );
}
