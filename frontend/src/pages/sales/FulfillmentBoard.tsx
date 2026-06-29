import { CheckCircle2, PackageCheck, RefreshCw, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatDate, listSales, money, updateSaleStatus } from "../../lib/api";
import type { Sale, SaleStatus } from "../../lib/api";
import type { PageProps } from "../../types/navigation";
import { Shell } from "../../components/layout";
import { Badge, Button, Card, PageHeader, StatCard } from "../../components/ui";
import { statusLabel, statusTone } from "../customer/MyOrders";

const columns: Array<{
  status: SaleStatus;
  title: string;
  action?: SaleStatus;
  actionLabel?: string;
}> = [
  { status: "APPROVED", title: "Approved", action: "PROCESSING", actionLabel: "Start Processing" },
  { status: "PROCESSING", title: "Processing", action: "SHIPPED", actionLabel: "Mark Shipped" },
  { status: "SHIPPED", title: "Shipped", action: "DELIVERED", actionLabel: "Mark Delivered" },
  { status: "DELIVERED", title: "Delivered" },
];

export function FulfillmentBoard({ active, onNavigate }: PageProps) {
  const [orders, setOrders] = useState<Sale[]>([]);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);

  const load = () =>
    listSales()
      .then((sales) =>
        setOrders(
          sales.filter((sale) =>
            ["APPROVED", "PROCESSING", "SHIPPED", "DELIVERED"].includes(
              sale.status,
            ),
          ),
        ),
      )
      .catch((error) =>
        setError(
          error instanceof Error ? error.message : "Unable to load fulfillment.",
        ),
      );

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(
    () => ({
      approved: orders.filter((order) => order.status === "APPROVED").length,
      processing: orders.filter((order) => order.status === "PROCESSING").length,
      shipped: orders.filter((order) => order.status === "SHIPPED").length,
      delivered: orders.filter((order) => order.status === "DELIVERED").length,
    }),
    [orders],
  );

  const moveOrder = async (order: Sale, nextStatus: SaleStatus) => {
    setSavingId(order.id);
    setError("");
    try {
      const updated = await updateSaleStatus(order.id, {
        status: nextStatus,
        fulfillmentMethod: order.fulfillmentMethod,
        deliveryContact: order.deliveryContact ?? undefined,
        deliveryAddress: order.deliveryAddress ?? undefined,
        paymentMethod: order.paymentMethod ?? undefined,
        amountPaid: order.amountPaid,
        paymentReference: order.paymentReference ?? undefined,
        internalNote: `Fulfillment moved from ${order.status} to ${nextStatus}.`,
      });
      setOrders((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to update order.",
      );
    } finally {
      setSavingId(null);
    }
  };

  return (
    <Shell active={active} onNavigate={onNavigate} role="sales" title="Fulfillment">
      <PageHeader
        title="Fulfillment Board"
        subtitle="Move customer orders from approval through processing, shipping, and delivery."
        actions={<Button variant="secondary" icon={RefreshCw} onClick={load}>Refresh</Button>}
      />

      {error && <p className="mb-5 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <div className="grid gap-6 md:grid-cols-4">
        <StatCard stat={{ label: "Approved", value: stats.approved.toString(), icon: PackageCheck, tone: "blue" }} />
        <StatCard stat={{ label: "Processing", value: stats.processing.toString(), icon: PackageCheck, tone: "orange" }} />
        <StatCard stat={{ label: "Shipped", value: stats.shipped.toString(), icon: Truck, tone: "blue" }} />
        <StatCard stat={{ label: "Delivered", value: stats.delivered.toString(), icon: CheckCircle2, tone: "green" }} />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-4">
        {columns.map((column) => {
          const columnOrders = orders.filter((order) => order.status === column.status);
          return (
            <Card key={column.status} className="min-h-[520px] p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">{column.title}</h2>
                <Badge tone={statusTone(column.status)}>{columnOrders.length}</Badge>
              </div>
              <div className="space-y-3">
                {columnOrders.map((order) => (
                  <article key={order.id} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">Order #{order.id}</p>
                        <p className="text-xs text-slate-500">{order.customerName}</p>
                      </div>
                      <Badge tone={statusTone(order.status)}>{statusLabel(order.status)}</Badge>
                    </div>
                    <div className="space-y-2 text-xs text-slate-500">
                      <p><strong className="text-slate-700">{order.items.length}</strong> item(s), {money(order.total)}</p>
                      <p>{order.fulfillmentMethod === "DELIVERY" ? "Delivery" : "Pickup"} · {order.paymentStatus}</p>
                      {order.deliveryContact && <p>{order.deliveryContact}</p>}
                      {order.deliveryAddress && <p className="line-clamp-2">{order.deliveryAddress}</p>}
                      <p>Updated {formatDate(order.updatedAt ?? order.createdAt)}</p>
                    </div>
                    {column.action && (
                      <Button
                        className="mt-4 w-full"
                        disabled={savingId === order.id}
                        onClick={() => moveOrder(order, column.action!)}
                      >
                        {savingId === order.id ? "Updating..." : column.actionLabel}
                      </Button>
                    )}
                  </article>
                ))}
                {columnOrders.length === 0 && (
                  <div className="rounded-md border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                    No orders in this stage.
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </Shell>
  );
}
