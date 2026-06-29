import { Eye, Search, Trash2, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  cancelMyOrder,
  formatDate,
  hideMyOrder,
  listCustomerSales,
  money,
  updateMyOrder,
} from "../../lib/api";
import type { Sale, SaleStatus } from "../../lib/api";
import type { PageProps } from "../../types/navigation";
import { Shell } from "../../components/layout";
import { Badge, Button, Card, Modal, PageHeader, SimpleTable } from "../../components/ui";

const statuses: Array<"ALL" | SaleStatus> = [
  "ALL",
  "PENDING",
  "APPROVED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REJECTED",
  "PAID",
];

export function MyOrders({ active, onNavigate }: PageProps) {
  const [orders, setOrders] = useState<Sale[]>([]);
  const [selected, setSelected] = useState<Sale | null>(null);
  const [status, setStatus] = useState<(typeof statuses)[number]>("ALL");
  const [query, setQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editItems, setEditItems] = useState<Array<{ bookId: number; title: string; quantity: number }>>([]);
  const [error, setError] = useState("");

  const load = () =>
    listCustomerSales()
      .then(setOrders)
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load orders."));

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = status === "ALL" || order.status === status;
      const matchesQuery =
        !q ||
        `#${order.id}`.includes(q) ||
        order.items.some((item) => item.title.toLowerCase().includes(q));
      const created = new Date(order.createdAt).getTime();
      const afterFrom = !fromDate || created >= new Date(fromDate).getTime();
      const beforeTo = !toDate || created <= new Date(`${toDate}T23:59:59`).getTime();
      return matchesStatus && matchesQuery && afterFrom && beforeTo;
    });
  }, [fromDate, orders, query, status, toDate]);

  const openDetails = (order: Sale) => {
    setSelected(order);
    setEditNote(order.customerNote ?? "");
    setEditItems(order.items.map((item) => ({ bookId: item.bookId, title: item.title, quantity: item.quantity })));
  };

  const cancel = async (order: Sale) => {
    await cancelMyOrder(order.id);
    setSelected(null);
    load();
  };

  const remove = async (order: Sale) => {
    await hideMyOrder(order.id);
    setSelected(null);
    load();
  };

  const saveEdit = async () => {
    if (!selected) return;
    await updateMyOrder(selected.id, {
      customerNote: editNote,
      items: editItems.map((item) => ({ bookId: item.bookId, quantity: item.quantity })),
    });
    setSelected(null);
    load();
  };

  return (
    <Shell active={active} onNavigate={onNavigate} role="customer" title="My Orders">
      <PageHeader
        title="My Orders"
        subtitle="Track every submitted order request and review status updates."
        actions={<Button onClick={() => onNavigate("customer-place-order")}>New Order</Button>}
      />

      <div className="grid gap-4 md:grid-cols-[1fr_180px_180px_220px]">
        <label className="relative block">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input className="h-11 w-full rounded-md border border-slate-200 pl-10 pr-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100" placeholder="Search by order number or book title" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <select className="h-11 rounded-md border border-slate-200 px-3 text-sm" value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
          {statuses.map((item) => <option key={item} value={item}>{item === "ALL" ? "All statuses" : statusLabel(item)}</option>)}
        </select>
        <input className="h-11 rounded-md border border-slate-200 px-3 text-sm" type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
        <input className="h-11 rounded-md border border-slate-200 px-3 text-sm" type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
      </div>

      {error && <p className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <Card className="mt-6">
        {filtered.length === 0 ? (
          <div className="p-8 text-center">
            <h2 className="font-semibold text-slate-900">No orders found</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">Place a new order or adjust your filters to see previous requests.</p>
            <Button className="mt-5" onClick={() => onNavigate("customer-place-order")}>Browse and Order</Button>
          </div>
        ) : (
          <SimpleTable
            headers={["Order", "Books", "Status", "Total", "Updated", "Actions"]}
            rows={filtered.map((order) => [
              `#${order.id}`,
              <div>{order.items[0]?.title ?? "No items"}<p className="text-xs text-slate-400">{order.items.length} item(s)</p></div>,
              <Badge tone={statusTone(order.status)}>{statusLabel(order.status)}</Badge>,
              money(order.total),
              formatDate(order.updatedAt ?? order.createdAt),
              <button className="text-slate-500 hover:text-blue-700" onClick={() => openDetails(order)} type="button" aria-label={`View order ${order.id}`}><Eye className="size-4" /></button>,
            ])}
          />
        )}
      </Card>

      {selected && (
        <Modal title={`Order #${selected.id}`} onClose={() => setSelected(null)} size="lg" footer={<><Button variant="secondary" onClick={() => setSelected(null)}>Close</Button>{canEdit(selected.status) && <Button onClick={saveEdit}>Save Changes</Button>}{canCancel(selected.status) && <Button variant="danger" icon={XCircle} onClick={() => cancel(selected)}>Cancel Order</Button>}{canRemove(selected.status) && <Button variant="danger" icon={Trash2} onClick={() => remove(selected)}>Remove</Button>}</>}>
          <div className="space-y-5 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Badge tone={statusTone(selected.status)}>{statusLabel(selected.status)}</Badge>
              <span className="text-slate-500">Submitted {formatDate(selected.createdAt)}</span>
            </div>
            <div className="rounded-md bg-slate-50 p-4">
              {canEdit(selected.status) ? editItems.map((item) => <div className="flex items-center justify-between gap-3 py-2" key={item.bookId}><span>{item.title}</span><input className="h-8 w-20 rounded-md border border-slate-200 px-2" min="1" type="number" value={item.quantity} onChange={(event) => setEditItems((current) => current.map((row) => row.bookId === item.bookId ? { ...row, quantity: Math.max(1, Number(event.target.value) || 1) } : row))} /></div>) : selected.items.map((item) => <div className="flex justify-between py-2" key={item.id}><span>{item.title} x {item.quantity}</span><strong>{money(item.lineTotal)}</strong></div>)}
            </div>
            {canEdit(selected.status) ? <label className="block"><span className="mb-2 block font-medium">My note</span><textarea className="min-h-20 w-full rounded-md border border-slate-200 px-3 py-2" value={editNote} onChange={(event) => setEditNote(event.target.value)} /></label> : selected.customerNote && <p><strong>My note:</strong> {selected.customerNote}</p>}
            {selected.internalNote && <p><strong>Sales note:</strong> {selected.internalNote}</p>}
            <div className="flex justify-between border-t border-slate-200 pt-4 text-base font-semibold"><span>Total</span><span>{money(selected.total)}</span></div>
          </div>
        </Modal>
      )}
    </Shell>
  );
}

export function statusLabel(status: SaleStatus) {
  if (status === "PAID") return "Completed";
  if (status === "HELD") return "Pending";
  return status[0] + status.slice(1).toLowerCase();
}

export function statusTone(status: SaleStatus): "blue" | "green" | "orange" | "red" | "gray" {
  if (status === "DELIVERED" || status === "PAID") return "green";
  if (status === "CANCELLED" || status === "REJECTED") return "red";
  if (status === "PENDING" || status === "HELD") return "orange";
  if (status === "SHIPPED" || status === "PROCESSING" || status === "APPROVED") return "blue";
  return "gray";
}

function canCancel(status: SaleStatus) {
  return status === "PENDING" || status === "HELD" || status === "APPROVED";
}

function canRemove(status: SaleStatus) {
  return status === "CANCELLED" || status === "REJECTED" || status === "DELIVERED" || status === "PAID";
}

function canEdit(status: SaleStatus) {
  return status === "PENDING" || status === "HELD";
}
