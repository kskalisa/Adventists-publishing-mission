import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { people } from "../../data/assets";
import {
  approveCustomerRegistration,
  listCustomerRegistrations,
  rejectCustomerRegistration,
} from "../../lib/api";
import type { CustomerRegistrationDto } from "../../lib/api";
import type { PageProps } from "../../types/navigation";
import { Shell } from "../../components/layout";
import {
  Badge,
  Button,
  Card,
  Modal,
  PageHeader,
  SimpleTable,
  StatCard,
  UserCell,
} from "../../components/ui";

export function CustomerRequests({ active, onNavigate }: PageProps) {
  const [registrations, setRegistrations] = useState<CustomerRegistrationDto[]>(
    [],
  );
  const [selectedRequest, setSelectedRequest] =
    useState<CustomerRegistrationDto | null>(null);
  const [error, setError] = useState("");
  const [actionInProgress, setActionInProgress] = useState(false);

  function loadRegistrations() {
    listCustomerRegistrations()
      .then(setRegistrations)
      .catch((error) =>
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load customer requests.",
          ),
      );
  }

  useEffect(() => {
    loadRegistrations();
  }, []);

  const handleApprove = async (request: CustomerRegistrationDto) => {
    setError("");
    setActionInProgress(true);
    try {
      await approveCustomerRegistration(request.id);
      setSelectedRequest(null);
      loadRegistrations();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to approve customer registration.",
      );
    } finally {
      setActionInProgress(false);
    }
  };

  const handleReject = async (request: CustomerRegistrationDto) => {
    setError("");
    setActionInProgress(true);
    try {
      await rejectCustomerRegistration(request.id);
      setSelectedRequest(null);
      loadRegistrations();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to reject customer registration.",
      );
    } finally {
      setActionInProgress(false);
    }
  };

  const pendingRequests = registrations.filter((r) => r.status === "PENDING");
  const approvedRequests = registrations.filter((r) => r.status === "APPROVED");
  const rejectedRequests = registrations.filter((r) => r.status === "REJECTED");

  return (
    <Shell active={active} onNavigate={onNavigate}>
      <PageHeader
        title="Customer Registration Requests"
        subtitle="Review and approve pending customer registrations."
      />
      <div className="grid gap-6 md:grid-cols-4">
        {[
          {
            label: "Pending Requests",
            value: pendingRequests.length.toString(),
            helper: "Awaiting approval",
          },
          {
            label: "Approved",
            value: approvedRequests.length.toString(),
            helper: "Total activated",
          },
          {
            label: "Rejected",
            value: rejectedRequests.length.toString(),
            helper: "Declined requests",
          },
          {
            label: "Total Requests",
            value: registrations.length.toString(),
            helper: "All registrations",
          },
        ].map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      {error && (
        <p className="mt-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <Card className="mt-6">
        <div className="border-b border-slate-100 p-5">
          <h2 className="font-semibold text-blue-950">
            Pending Customer Requests
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Review new customer registrations and approve only verified
            accounts.
          </p>
        </div>
        {pendingRequests.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No pending customer requests.
          </div>
        ) : (
          <SimpleTable
            headers={[
              "Name",
              "Email",
              "Type",
              "Phone",
              "District",
              "Address",
              "Submitted",
              "Actions",
            ]}
            rows={pendingRequests.map((request) => [
              request.name,
              request.email,
              <Badge
                tone={
                  request.type === "CHURCH"
                    ? "blue"
                    : request.type === "SCHOOL"
                      ? "green"
                      : request.type === "BRANCH"
                        ? "purple"
                        : "gray"
                }
              >
                {typeLabel(request.type)}
              </Badge>,
              request.phone ?? "-",
              request.district ?? "-",
              request.address ?? "-",
              new Date(request.createdAt).toLocaleDateString(),
              <div className="flex gap-3">
                <Button
                  className="h-8 px-3"
                  icon={Check}
                  onClick={() => setSelectedRequest(request)}
                >
                  Review
                </Button>
              </div>,
            ])}
          />
        )}
      </Card>

      <Card className="mt-6">
        <div className="border-b border-slate-100 p-5">
          <h2 className="font-semibold text-blue-950">Processed Requests</h2>
          <p className="mt-1 text-sm text-slate-500">
            Approved and rejected customer registration history.
          </p>
        </div>
        {registrations.filter((r) => r.status !== "PENDING").length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No processed requests yet.
          </div>
        ) : (
          <SimpleTable
            headers={["Name", "Email", "Type", "Status", "Submitted"]}
            rows={registrations
              .filter((r) => r.status !== "PENDING")
              .map((request) => [
                request.name,
                request.email,
                <Badge
                  tone={
                    request.type === "CHURCH"
                      ? "blue"
                      : request.type === "SCHOOL"
                        ? "green"
                        : request.type === "BRANCH"
                          ? "purple"
                          : "gray"
                  }
                >
                  {typeLabel(request.type)}
                </Badge>,
                <Badge tone={request.status === "APPROVED" ? "green" : "red"}>
                  {request.status}
                </Badge>,
                new Date(request.createdAt).toLocaleDateString(),
              ])}
          />
        )}
      </Card>

      {selectedRequest && selectedRequest.status === "PENDING" && (
        <Modal
          title="Review Customer Registration"
          onClose={() => setSelectedRequest(null)}
          footer={
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setSelectedRequest(null)}
                disabled={actionInProgress}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                icon={X}
                onClick={() => handleReject(selectedRequest)}
                disabled={actionInProgress}
              >
                {actionInProgress ? "Processing..." : "Reject"}
              </Button>
              <Button
                icon={Check}
                onClick={() => handleApprove(selectedRequest)}
                disabled={actionInProgress}
              >
                {actionInProgress
                  ? "Processing..."
                  : "Approve & Create Account"}
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="mb-3 font-semibold text-blue-950">
                Registration Details
              </h3>
              <div className="rounded-md bg-blue-50 p-4">
                <UserCell
                  name={selectedRequest.name}
                  sub={selectedRequest.email ?? undefined}
                  src={people[0]}
                />
              </div>
            </div>
            <div className="grid gap-4">
              <div>
                <span className="block text-slate-500">Email Address</span>
                <strong className="text-blue-950">
                  {selectedRequest.email}
                </strong>
              </div>
              <div>
                <span className="block text-slate-500">Customer Type</span>
                <strong className="text-blue-950">
                  {typeLabel(selectedRequest.type)}
                </strong>
              </div>
              <div>
                <span className="block text-slate-500">Phone Number</span>
                <strong className="text-blue-950">
                  {selectedRequest.phone || "Not provided"}
                </strong>
              </div>
              <div>
                <span className="block text-slate-500">District</span>
                <strong className="text-blue-950">
                  {selectedRequest.district || "Not assigned"}
                </strong>
              </div>
              <div>
                <span className="block text-slate-500">Delivery Address</span>
                <strong className="text-blue-950">
                  {selectedRequest.address || "Not provided"}
                </strong>
              </div>
              <div>
                <span className="block text-slate-500">Submitted Date</span>
                <strong className="text-blue-950">
                  {new Date(selectedRequest.createdAt).toLocaleString()}
                </strong>
              </div>
            </div>
            <div className="rounded-md bg-amber-50 p-4 text-xs text-amber-700">
              <p>
                <strong>Note:</strong> Approving this registration will create a
                customer account and an app user with the CUSTOMER role. The
                customer will be able to log in and place orders.
              </p>
            </div>
          </div>
        </Modal>
      )}
    </Shell>
  );
}

function typeLabel(type: string) {
  return type === "BRANCH"
    ? "Branch Manager"
    : type[0] + type.slice(1).toLowerCase();
}
