import { useEffect, useState } from "react";
import { formatDate, listMyBookRequests } from "../../lib/api";
import type { BookRequest } from "../../lib/api";
import type { PageProps } from "../../types/navigation";
import { Shell } from "../../components/layout";
import { Badge, Button, Card, PageHeader, SimpleTable } from "../../components/ui";

export function CustomerBookRequests({ active, onNavigate }: PageProps) {
  const [requests, setRequests] = useState<BookRequest[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    listMyBookRequests()
      .then(setRequests)
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load book requests."));
  }, []);

  return (
    <Shell active={active} onNavigate={onNavigate} role="customer" title="Book Requests">
      <PageHeader title="Book Requests" subtitle="Track out-of-stock books you asked us to restock." actions={<Button onClick={() => onNavigate("customer-browse-books")}>Browse Books</Button>} />
      {error && <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      <Card className="mt-6">
        {requests.length === 0 ? (
          <div className="p-8 text-center">
            <h2 className="font-semibold text-slate-900">No book requests yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">When a title is out of stock, request it from the catalog and we will notify you when there is movement.</p>
            <Button className="mt-5" onClick={() => onNavigate("customer-browse-books")}>Find Books</Button>
          </div>
        ) : (
          <SimpleTable headers={["Book", "Quantity", "Status", "Comment", "Submitted"]} rows={requests.map((request) => [request.bookTitle, request.quantity.toString(), <Badge tone={request.status === "FULFILLED" ? "green" : request.status === "CANCELLED" ? "red" : "orange"}>{request.status}</Badge>, request.comment ?? "-", formatDate(request.createdAt)])} />
        )}
      </Card>
    </Shell>
  );
}
