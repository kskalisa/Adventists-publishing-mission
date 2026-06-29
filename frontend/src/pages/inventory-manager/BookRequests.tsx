import { Check, Download, Eye, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { downloadCsv } from "../../lib/actions";
import { formatDate, getCurrentUser, listBookRequests, listBookRequestSummary, updateBookRequestStatus } from "../../lib/api";
import type { BookRequest, BookRequestStatus, BookRequestSummary } from "../../lib/api";
import type { PageProps } from "../../types/navigation";
import { Shell } from "../../components/layout";
import { Badge, Button, Card, Modal, PageHeader, SimpleTable, StatCard } from "../../components/ui";

export function InventoryBookRequests({ active, onNavigate }: PageProps) {
  const role = getCurrentUser()?.role === "ADMIN" ? "admin" : "inventory-manager";
  const [requests, setRequests] = useState<BookRequest[]>([]);
  const [summary, setSummary] = useState<BookRequestSummary[]>([]);
  const [selected, setSelected] = useState<BookRequest | null>(null);
  const [status, setStatus] = useState<"ALL" | BookRequestStatus>("ALL");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    Promise.all([listBookRequests(), listBookRequestSummary()])
      .then(([requests, summary]) => { setRequests(requests); setSummary(summary); })
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load book requests."));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return requests.filter((request) => {
      const matchesStatus = status === "ALL" || request.status === status;
      const matchesQuery = !q || request.bookTitle.toLowerCase().includes(q) || request.customerName.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [query, requests, status]);

  const setRequestStatus = async (request: BookRequest, next: BookRequestStatus) => {
    await updateBookRequestStatus(request.id, next);
    setSelected(null);
    load();
  };

  return (
    <Shell active={active} onNavigate={onNavigate} role={role} title="Book Requests">
      <PageHeader title="Book Requests" subtitle="Demand signals for out-of-stock titles and restock planning." actions={<Button variant="secondary" icon={Download} onClick={() => downloadCsv("book-requests.csv", ["Book", "Customer", "Quantity", "Status", "Comment", "Date"], filtered.map((request) => [request.bookTitle, request.customerName, request.quantity, request.status, request.comment, request.createdAt]))}>Export</Button>} />

      <div className="grid gap-6 md:grid-cols-4">
        <StatCard stat={{ label: "Open Requests", value: requests.filter((r) => r.status === "OPEN").length.toString(), helper: "Need inventory review", tone: "orange" }} />
        <StatCard stat={{ label: "Requested Units", value: summary.reduce((sum, item) => sum + item.requestedQuantity, 0).toString(), helper: "Across open requests", tone: "blue" }} />
        <StatCard stat={{ label: "Requested Titles", value: summary.length.toString(), helper: "Unique books" }} />
        <StatCard stat={{ label: "Fulfilled", value: requests.filter((r) => r.status === "FULFILLED").length.toString(), helper: "Closed after restock", tone: "green" }} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
        <Card className="p-5">
          <div className="mb-5 grid gap-3 md:grid-cols-[1fr_180px]">
            <label className="relative block">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input className="h-11 w-full rounded-md border border-slate-200 pl-10 pr-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100" placeholder="Search book or customer" value={query} onChange={(event) => setQuery(event.target.value)} />
            </label>
            <select className="h-11 rounded-md border border-slate-200 px-3 text-sm" value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
              <option value="ALL">All statuses</option>
              <option value="OPEN">Open</option>
              <option value="FULFILLED">Fulfilled</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          {error && <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
          {filtered.length ? (
            <SimpleTable headers={["Book", "Customer", "Qty", "Status", "Submitted", "Actions"]} rows={filtered.map((request) => [request.bookTitle, request.customerName, request.quantity.toString(), <Badge tone={request.status === "FULFILLED" ? "green" : request.status === "CANCELLED" ? "red" : "orange"}>{request.status}</Badge>, formatDate(request.createdAt), <button className="text-slate-500 hover:text-blue-700" onClick={() => setSelected(request)} type="button" aria-label={`View request ${request.id}`}><Eye className="size-4" /></button>])} />
          ) : (
            <div className="rounded-md border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500">No book requests match this view.</div>
          )}
        </Card>

        <aside className="space-y-6">
          <Card className="p-5">
            <h2 className="font-semibold text-slate-900">Most Requested</h2>
            <div className="mt-4 space-y-3">
              {summary.slice(0, 6).map((item) => (
                <div key={item.bookId} className="rounded-md bg-slate-50 p-3">
                  <p className="font-medium text-slate-900">{item.bookTitle}</p>
                  <p className="text-xs text-slate-500">{item.customerCount} customer(s), {item.requestedQuantity} requested unit(s)</p>
                </div>
              ))}
              {summary.length === 0 && <p className="text-sm text-slate-500">No open demand yet.</p>}
            </div>
          </Card>
          <Card className="p-5">
            <h2 className="font-semibold text-slate-900">Restock Workflow</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">Use demand counts to restock through stock adjustments. When a previously unavailable title receives stock, customers with open requests get a notification.</p>
            <Button className="mt-5 w-full" onClick={() => onNavigate("inventory-manager-adjustments")}>Create Stock Adjustment</Button>
          </Card>
        </aside>
      </div>

      {selected && (
        <Modal title="Book Request Details" onClose={() => setSelected(null)} footer={<><Button variant="secondary" onClick={() => setSelected(null)}>Close</Button><Button variant="danger" icon={X} onClick={() => setRequestStatus(selected, "CANCELLED")}>Cancel</Button><Button icon={Check} onClick={() => setRequestStatus(selected, "FULFILLED")}>Mark Fulfilled</Button></>}>
          <div className="space-y-4 text-sm">
            <p><span className="block text-slate-500">Book</span><strong>{selected.bookTitle}</strong></p>
            <p><span className="block text-slate-500">Customer</span><strong>{selected.customerName}</strong></p>
            <p><span className="block text-slate-500">Requested quantity</span><strong>{selected.quantity}</strong></p>
            <p><span className="block text-slate-500">Comment</span>{selected.comment ?? "No comment provided."}</p>
            <p><span className="block text-slate-500">Status</span><Badge tone={selected.status === "FULFILLED" ? "green" : selected.status === "CANCELLED" ? "red" : "orange"}>{selected.status}</Badge></p>
          </div>
        </Modal>
      )}
    </Shell>
  );
}
