import { LogOut } from "lucide-react";
import { clearCurrentSession, getCurrentUser } from "../../lib/api";
import type { PageProps } from "../../types/navigation";
import { Shell } from "../../components/layout";
import { Button, Card, PageHeader } from "../../components/ui";

export function CustomerProfile({ active, onNavigate }: PageProps) {
  const currentUser = getCurrentUser();

  const handleLogout = () => {
    clearCurrentSession();
    window.location.hash = "login";
    window.location.reload();
  };

  return (
    <Shell
      active={active}
      onNavigate={onNavigate}
      role="customer"
      title="Account Settings"
    >
      <PageHeader title="Account Settings" subtitle="Manage your profile" />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <div className="border-b border-slate-100 p-5">
              <h2 className="font-semibold text-slate-900">
                Profile Information
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Your account details and contact information.
              </p>
            </div>
            <div className="space-y-6 p-6">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Full Name
                </label>
                <p className="mt-2 text-slate-900">{currentUser?.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Email Address
                </label>
                <p className="mt-2 text-slate-900">{currentUser?.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Account Role
                </label>
                <p className="mt-2 text-slate-900">Customer</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Account Status
                </label>
                <p className="mt-2">
                  <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
                    {currentUser?.active ? "Active" : "Inactive"}
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Member Since
                </label>
                <p className="mt-2 text-slate-900">
                  {currentUser?.createdAt
                    ? new Date(currentUser.createdAt).toLocaleDateString()
                    : "Unknown"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="mt-6">
            <div className="border-b border-slate-100 p-5">
              <h2 className="font-semibold text-slate-900">Quick Links</h2>
            </div>
            <div className="space-y-3 p-5">
              <button
                onClick={() => onNavigate("customer-dashboard")}
                className="block w-full rounded-md border border-slate-300 px-4 py-3 text-left text-sm font-medium text-slate-900 hover:bg-slate-50"
              >
                View Order History
              </button>
              <button
                onClick={() => onNavigate("customer-browse-books")}
                className="block w-full rounded-md border border-slate-300 px-4 py-3 text-left text-sm font-medium text-slate-900 hover:bg-slate-50"
              >
                Browse Available Books
              </button>
              <button
                onClick={() => onNavigate("customer-place-order")}
                className="block w-full rounded-md border border-slate-300 px-4 py-3 text-left text-sm font-medium text-slate-900 hover:bg-slate-50"
              >
                Place New Order
              </button>
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <div className="border-b border-slate-100 p-5">
              <h2 className="font-semibold text-slate-900">Session</h2>
            </div>
            <div className="p-5">
              <p className="mb-4 text-sm text-slate-600">
                You are logged in to your customer account.
              </p>
              <Button
                onClick={handleLogout}
                icon={LogOut}
                variant="danger"
                className="w-full"
              >
                Logout
              </Button>
            </div>
          </Card>

          <Card className="mt-6">
            <div className="border-b border-slate-100 p-5">
              <h2 className="font-semibold text-slate-900">Help</h2>
            </div>
            <div className="space-y-3 p-5 text-sm text-slate-600">
              <p>Contact support@adventist.rw for account assistance.</p>
            </div>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
