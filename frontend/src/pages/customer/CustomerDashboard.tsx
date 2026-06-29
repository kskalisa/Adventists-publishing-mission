import { Bell, BookOpen, Check, Clock3, Heart, PackageCheck, ShoppingCart, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatDate, listBooks, listCustomerSales, listMyBookRequests, listNotifications, markNotificationRead, money } from "../../lib/api";
import type { Book, BookRequest, Notification, Sale } from "../../lib/api";
import type { PageProps } from "../../types/navigation";
import { Shell } from "../../components/layout";
import { Badge, Button, Card, PageHeader, SimpleTable, StatCard } from "../../components/ui";
import { statusLabel, statusTone } from "./MyOrders";

function readIds(key: string) {
  try {
    return JSON.parse(window.localStorage.getItem(key) ?? "[]") as number[];
  } catch {
    return [];
  }
}

export function CustomerDashboard({ active, onNavigate }: PageProps) {
  const [orders, setOrders] = useState<Sale[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [requests, setRequests] = useState<BookRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState("");

  const loadDashboard = () =>
    Promise.all([listCustomerSales(), listBooks(), listMyBookRequests(), listNotifications()])
      .then(([orders, books, requests, notifications]) => {
        setOrders(orders);
        setBooks(books);
        setRequests(requests);
        setNotifications(notifications);
      })
      .catch((error) => setError(error instanceof Error ? error.message : "Unable to load dashboard data."));

  useEffect(() => {
    loadDashboard();
  }, []);

  const markRead = async (id: number) => {
    setError("");
    try {
      const updated = await markNotificationRead(id);
      setNotifications((current) =>
        current.map((note) => (note.id === id ? updated : note)),
      );
      window.dispatchEvent(new Event("adventist-notifications-updated"));
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to update notification.");
    }
  };

  const favoriteIds = readIds("adventist-favorite-books");
  const recentIds = readIds("adventist-recent-books");
  const favorites = books.filter((book) => favoriteIds.includes(book.id));
  const recentlyViewed = recentIds.map((id) => books.find((book) => book.id === id)).filter(Boolean) as Book[];
  const recommended = useMemo(() => {
    const orderedBooks = new Set(orders.flatMap((order) => order.items.map((item) => item.bookId)));
    return books.filter((book) => book.status !== "OUT_OF_STOCK" && !orderedBooks.has(book.id)).slice(0, 4);
  }, [books, orders]);

  const pending = orders.filter((order) => order.status === "PENDING" || order.status === "HELD" || order.status === "APPROVED");
  const completed = orders.filter((order) => order.status === "DELIVERED" || order.status === "PAID");
  const cancelled = orders.filter((order) => order.status === "CANCELLED" || order.status === "REJECTED");
  const unread = notifications.filter((note) => !note.read);

  return (
    <Shell
      active={active}
      onNavigate={onNavigate}
      role="customer"
      title="Customer Dashboard"
    >
      <PageHeader
        title="Customer Dashboard"
        subtitle="Track orders, requested books, restock updates, and recommended titles."
        actions={<><Button variant="secondary" onClick={() => onNavigate("customer-notifications")}>Notifications</Button><Button icon={ShoppingCart} onClick={() => onNavigate("customer-place-order")}>New Order</Button></>}
      />

      {error && <p className="mb-5 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <div className="grid gap-6 md:grid-cols-4">
        <StatCard stat={{ label: "Total Orders", value: orders.length.toString(), helper: `${money(orders.reduce((sum, order) => sum + order.total, 0))} total value`, icon: ShoppingCart }} />
        <StatCard stat={{ label: "Pending Orders", value: pending.length.toString(), helper: "Awaiting or in review", icon: Clock3, tone: "orange" }} />
        <StatCard stat={{ label: "Completed", value: completed.length.toString(), helper: "Delivered or paid", icon: PackageCheck, tone: "green" }} />
        <StatCard stat={{ label: "Cancelled", value: cancelled.length.toString(), helper: "Cancelled or rejected", icon: XCircle, tone: "red" }} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card className="p-5">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-slate-900">Recent Orders</h2>
                <p className="text-sm text-slate-500">Latest requests and fulfillment updates.</p>
              </div>
              <Button variant="secondary" onClick={() => onNavigate("customer-orders")}>View All</Button>
            </div>
            {orders.length === 0 ? (
              <div className="rounded-md border border-dashed border-slate-200 p-8 text-center">
                <h3 className="font-semibold text-slate-900">No orders yet</h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">Browse the catalog, add available books to an order, and track every status change from here.</p>
                <Button className="mt-5" onClick={() => onNavigate("customer-browse-books")}>Browse Books</Button>
              </div>
            ) : (
              <SimpleTable headers={["Order", "Books", "Status", "Total", "Updated"]} rows={orders.slice(0, 5).map((order) => [`#${order.id}`, `${order.items.length} item(s)`, <Badge tone={statusTone(order.status)}>{statusLabel(order.status)}</Badge>, money(order.total), formatDate(order.updatedAt ?? order.createdAt)])} />
            )}
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">Recommended Books</h2>
                <BookOpen className="size-5 text-blue-600" />
              </div>
              <div className="space-y-3">
                {(recommended.length ? recommended : books.slice(0, 4)).map((book) => (
                  <div key={book.id} className="flex items-center justify-between rounded-md bg-slate-50 p-3">
                    <div>
                      <p className="font-medium text-slate-900">{book.title}</p>
                      <p className="text-xs text-slate-500">{book.author} · {money(book.price)}</p>
                    </div>
                    <Button className="h-8 px-3" variant="secondary" onClick={() => onNavigate("customer-place-order")}>Order</Button>
                  </div>
                ))}
                {books.length === 0 && <p className="text-sm text-slate-500">Recommendations will appear once books are available.</p>}
              </div>
            </Card>

            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">Book Requests</h2>
                <Badge tone="orange">{requests.filter((request) => request.status === "OPEN").length} open</Badge>
              </div>
              <div className="space-y-3">
                {requests.slice(0, 4).map((request) => (
                  <div key={request.id} className="rounded-md bg-slate-50 p-3">
                    <p className="font-medium text-slate-900">{request.bookTitle}</p>
                    <p className="text-xs text-slate-500">{request.quantity} requested · {request.status}</p>
                  </div>
                ))}
                {requests.length === 0 && <p className="text-sm text-slate-500">Out-of-stock requests you submit will appear here.</p>}
              </div>
              <Button className="mt-4 w-full" variant="secondary" onClick={() => onNavigate("customer-book-requests")}>Manage Requests</Button>
            </Card>
          </div>
        </div>

        <aside className="space-y-6">
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Notifications</h2>
              <Bell className="size-5 text-blue-600" />
            </div>
            <p className="text-3xl font-semibold text-slate-900">{unread.length}</p>
            <p className="mt-1 text-sm text-slate-500">Unread update(s)</p>
            <div className="mt-4 space-y-3">
              {notifications.slice(0, 3).map((note) => (
                <div key={note.id} className={`rounded-md p-3 ${note.read ? "bg-slate-50" : "bg-blue-50"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{note.title}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-500">{note.message}</p>
                    </div>
                    {!note.read && (
                      <button className="grid size-7 shrink-0 place-items-center rounded-md bg-white text-blue-600 shadow-sm" onClick={() => markRead(note.id)} type="button" aria-label={`Mark ${note.title} as read`}>
                        <Check className="size-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {notifications.length === 0 && <p className="text-sm text-slate-500">Order and restock updates will appear here.</p>}
            </div>
            <Button className="mt-4 w-full" variant="secondary" onClick={() => onNavigate("customer-notifications")}>Open Notifications</Button>
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold text-slate-900">Wishlist / Favorites</h2>
            <div className="mt-4 space-y-3">
              {favorites.slice(0, 4).map((book) => <div key={book.id} className="flex items-center gap-3 rounded-md bg-slate-50 p-3"><Heart className="size-4 text-red-500" /><span className="text-sm font-medium text-slate-900">{book.title}</span></div>)}
              {favorites.length === 0 && <p className="text-sm text-slate-500">Save favorites while browsing books for quick follow-up.</p>}
            </div>
            <Button className="mt-4 w-full" variant="secondary" onClick={() => onNavigate("customer-browse-books")}>Browse Catalog</Button>
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold text-slate-900">Recently Viewed</h2>
            <div className="mt-4 space-y-3">
              {recentlyViewed.slice(0, 4).map((book) => <p key={book.id} className="rounded-md bg-slate-50 p-3 text-sm font-medium text-slate-900">{book.title}</p>)}
              {recentlyViewed.length === 0 && <p className="text-sm text-slate-500">Books you open from the catalog will show here.</p>}
            </div>
          </Card>
        </aside>
      </div>
    </Shell>
  );
}
