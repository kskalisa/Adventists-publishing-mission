import { Check, Eye, MessageSquare, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatDate, listSales, money, updateSaleStatus } from "../../lib/api";
import type { FulfillmentMethod, PaymentMethod, Sale, SaleStatus } from "../../lib/api";
import type { PageProps } from "../../types/navigation";
import { Shell } from "../../components/layout";
import { Badge, Button, Card, Modal, PageHeader, SimpleTable, StatCard } from "../../components/ui";
import { statusLabel, statusTone } from "../customer/MyOrders";

const orderStatuses: SaleStatus[] = ["PENDING", "APPROVED", "PROCESSING", "SHIPPED", "DELIVERED", "REJECTED", "CANCELLED"];

export function CustomerOrders({ active, onNavigate }: PageProps) {
  const [orders, setOrders] = useState<Sale[]>([]);
  const [selected, setSelected] = useState<Sale | null>(null);
  const [status, setStatus] = useState<"ALL" | SaleStatus>("ALL");
  const [query, setQuery] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [paymentReference, setPaymentReference] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod>("PICKUP");
  const [deliveryContact, setDeliveryContact] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () =>
    listSales()
      .then((sales) => setOrders(sales.filter((sale) => sale.customerId !== null && sale.status !== "PAID")))
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load customer orders."));

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = status === "ALL" || order.status === status;
      const matchesQuery =
        !q ||
        order.customerName.toLowerCase().includes(q) ||
        `#${order.id}`.includes(q) ||
        order.items.some((item) => item.title.toLowerCase().includes(q));
      return matchesStatus && matchesQuery;
    });
  }, [orders, query, status]);

  const updateStatus = async (nextStatus: SaleStatus) => {
    if (!selected) return;
    setSaving(true);
    setError("");
    try {
      const updated = await updateSaleStatus(selected.id, {
        status: nextStatus,
        internalNote: note,
        paymentMethod,
        paymentReference: paymentReference || undefined,
        amountPaid: amountPaid ? Number(amountPaid) : undefined,
        fulfillmentMethod,
        deliveryContact: deliveryContact || undefined,
        deliveryAddress: deliveryAddress || undefined,
      });
      setSelected(updated);
      hydrateModal(updated);
      setOrders((current) => current.map((order) => (order.id === updated.id ? updated : order)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update order.");
    } finally {
      setSaving(false);
    }
  };

  const hydrateModal = (order: Sale) => {
    setNote(order.internalNote ?? "");
    setPaymentMethod(order.paymentMethod ?? "CASH");
    setPaymentReference(order.paymentReference ?? "");
    setAmountPaid(order.amountPaid > 0 ? String(order.amountPaid) : "");
    setFulfillmentMethod(order.fulfillmentMethod ?? "PICKUP");
    setDeliveryContact(order.deliveryContact ?? "");
    setDeliveryAddress(order.deliveryAddress ?? "");
  };

  return (
    <Shell active={active} onNavigate={onNavigate} role="sales" title="Customer Orders">
      <PageHeader title="Customer Orders" subtitle="Review requests, approve fulfillment, and keep customers updated." />

      <div className="grid gap-6 md:grid-cols-4">
        <StatCard stat={{ label: "Pending", value: orders.filter((o) => o.status === "PENDING" || o.status === "HELD").length.toString(), helper: "Need review" }} />
        <StatCard stat={{ label: "Processing", value: orders.filter((o) => o.status === "APPROVED" || o.status === "PROCESSING").length.toString(), helper: "In progress", tone: "blue" }} />
        <StatCard stat={{ label: "Completed", value: orders.filter((o) => o.status === "DELIVERED").length.toString(), helper: "Delivered", tone: "green" }} />
        <StatCard stat={{ label: "Cancelled", value: orders.filter((o) => o.status === "CANCELLED" || o.status === "REJECTED").length.toString(), helper: "Closed without sale", tone: "red" }} />
      </div>

      <Card className="mt-6 p-5">
        <div className="mb-5 grid gap-3 md:grid-cols-[1fr_220px]">
          <label className="relative block">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input className="h-11 w-full rounded-md border border-slate-200 pl-10 pr-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100" placeholder="Search by customer, order, or book" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
          <select className="h-11 rounded-md border border-slate-200 px-3 text-sm" value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
            <option value="ALL">All statuses</option>
            {orderStatuses.map((item) => <option key={item} value={item}>{statusLabel(item)}</option>)}
          </select>
        </div>

        {error && <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

        {filtered.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-200 p-10 text-center">
            <h2 className="font-semibold text-slate-900">No customer orders match this view</h2>
            <p className="mt-2 text-sm text-slate-500">New customer requests will appear here once submitted.</p>
          </div>
        ) : (
          <SimpleTable
            headers={["Order", "Customer", "Items", "Status", "Total", "Updated", "Actions"]}
            rows={filtered.map((order) => [
              `#${order.id}`,
              order.customerName,
              <div>{order.items[0]?.title ?? "No items"}<p className="text-xs text-slate-400">{order.items.length} item(s)</p></div>,
              <Badge tone={statusTone(order.status)}>{statusLabel(order.status)}</Badge>,
              money(order.total),
              formatDate(order.updatedAt ?? order.createdAt),
              <button className="text-slate-500 hover:text-blue-700" onClick={() => { setSelected(order); hydrateModal(order); }} type="button" aria-label={`Review order ${order.id}`}><Eye className="size-4" /></button>,
            ])}
          />
        )}
      </Card>

      {selected && (
        <Modal title={`Review Order #${selected.id}`} size="lg" onClose={() => setSelected(null)} footer={<><Button variant="secondary" onClick={() => setSelected(null)}>Close</Button><Button variant="danger" icon={X} disabled={saving} onClick={() => updateStatus("REJECTED")}>Reject</Button><Button icon={Check} disabled={saving} onClick={() => updateStatus(selected.status === "PENDING" || selected.status === "HELD" ? "APPROVED" : "PROCESSING")}>{selected.status === "PENDING" || selected.status === "HELD" ? "Approve" : "Update"}</Button></>}>
          <div className="space-y-5 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{selected.customerName}</p>
                <p className="text-slate-500">Submitted {formatDate(selected.createdAt)}</p>
              </div>
              <Badge tone={statusTone(selected.status)}>{statusLabel(selected.status)}</Badge>
            </div>
            <div className="rounded-md bg-slate-50 p-4">
              {selected.items.map((item) => <div className="flex justify-between py-2" key={item.id}><span>{item.title} x {item.quantity}</span><strong>{money(item.lineTotal)}</strong></div>)}
              <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-base font-semibold"><span>Total</span><span>{money(selected.total)}</span></div>
              <div className="flex justify-between text-sm text-slate-500"><span>Paid</span><span>{money(selected.amountPaid)}</span></div>
              <div className="flex justify-between text-sm text-slate-500"><span>Balance</span><span>{money(selected.balanceDue)}</span></div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block">
                <span className="mb-2 block font-medium text-slate-700">Payment</span>
                <select className="h-10 w-full rounded-md border border-slate-200 px-3" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}>
                  <option value="CASH">Cash</option>
                  <option value="MOMO">Mobile Money</option>
                  <option value="CARD">Card</option>
                  <option value="BANK_TRANSFER">Bank transfer</option>
                  <option value="CREDIT">Credit</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block font-medium text-slate-700">Reference</span>
                <input className="h-10 w-full rounded-md border border-slate-200 px-3" value={paymentReference} onChange={(event) => setPaymentReference(event.target.value)} />
              </label>
              <label className="block">
                <span className="mb-2 block font-medium text-slate-700">Amount paid</span>
                <input className="h-10 w-full rounded-md border border-slate-200 px-3" min="0" max={selected.total} type="number" value={amountPaid} onChange={(event) => setAmountPaid(event.target.value)} />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block font-medium text-slate-700">Fulfillment</span>
                <select className="h-10 w-full rounded-md border border-slate-200 px-3" value={fulfillmentMethod} onChange={(event) => setFulfillmentMethod(event.target.value as FulfillmentMethod)}>
                  <option value="PICKUP">Pickup</option>
                  <option value="DELIVERY">Delivery</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block font-medium text-slate-700">Delivery contact</span>
                <input className="h-10 w-full rounded-md border border-slate-200 px-3" value={deliveryContact} onChange={(event) => setDeliveryContact(event.target.value)} />
              </label>
            </div>
            <label className="block">
              <span className="mb-2 block font-medium text-slate-700">Delivery address</span>
              <textarea className="min-h-20 w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100" value={deliveryAddress} onChange={(event) => setDeliveryAddress(event.target.value)} />
            </label>
            {selected.customerNote && <p><strong>Customer note:</strong> {selected.customerNote}</p>}
            <label className="block">
              <span className="mb-2 flex items-center gap-2 font-medium text-slate-700"><MessageSquare className="size-4" />Sales note / customer update</span>
              <textarea className="min-h-24 w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100" value={note} onChange={(event) => setNote(event.target.value)} />
            </label>
            <div className="grid gap-2 sm:grid-cols-4">
              {["APPROVED", "PROCESSING", "SHIPPED", "DELIVERED"].map((next) => <Button key={next} variant="secondary" disabled={saving} onClick={() => updateStatus(next as SaleStatus)}>{statusLabel(next as SaleStatus)}</Button>)}
            </div>
          </div>
        </Modal>
      )}
    </Shell>
  );
}
