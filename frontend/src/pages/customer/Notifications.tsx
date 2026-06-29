import { Bell, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { formatDate, listNotifications, markNotificationRead } from "../../lib/api";
import type { Notification } from "../../lib/api";
import type { PageProps } from "../../types/navigation";
import { Shell } from "../../components/layout";
import { Button, Card, PageHeader } from "../../components/ui";
import { getCurrentUser } from "../../lib/api";
import type { RoleArea } from "../../types/navigation";

export function CustomerNotifications({ active, onNavigate }: PageProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState("");
  const user = getCurrentUser();
  const role: RoleArea =
    user?.role === "SALES"
      ? "sales"
      : user?.role === "INVENTORY_MANAGER"
        ? "inventory-manager"
        : user?.role === "COORDINATOR"
          ? "coordinator"
          : user?.role === "CUSTOMER"
            ? "customer"
            : "admin";

  const load = () =>
    listNotifications()
      .then(setNotifications)
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load notifications."));

  useEffect(() => {
    load();
  }, []);

  const markRead = async (id: number) => {
    await markNotificationRead(id);
    window.dispatchEvent(new Event("adventist-notifications-updated"));
    load();
  };

  return (
    <Shell active={active} onNavigate={onNavigate} role={role} title="Notifications">
      <PageHeader title="Notifications" subtitle="System updates, production handoffs, orders, and account messages." />
      {error && <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      <div className="mt-6 space-y-3">
        {notifications.length === 0 ? (
          <Card className="p-8 text-center">
            <Bell className="mx-auto size-8 text-slate-400" />
            <h2 className="mt-4 font-semibold text-slate-900">No notifications</h2>
            <p className="mt-2 text-sm text-slate-500">Updates about your work in the system will appear here.</p>
          </Card>
        ) : (
          notifications.map((note) => (
            <Card key={note.id} className={`p-5 ${note.read ? "bg-white" : "border-blue-200 bg-blue-50"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-slate-900">{note.title}</h2>
                  <p className="mt-1 text-sm text-slate-600">{note.message}</p>
                  <p className="mt-2 text-xs text-slate-400">{formatDate(note.createdAt)}</p>
                </div>
                {!note.read && <Button variant="secondary" icon={Check} onClick={() => markRead(note.id)}>Mark read</Button>}
              </div>
            </Card>
          ))
        )}
      </div>
    </Shell>
  );
}
