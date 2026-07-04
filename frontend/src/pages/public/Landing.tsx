import { Grid2X2, Package } from "lucide-react";
import type { Navigate } from "../../types/navigation";
import { Button, Card, Logo } from "../../components/ui";

function Feature({
  title,
  image,
  flip = false,
}: {
  title: string;
  image: string;
  flip?: boolean;
}) {
  return (
    <section className="bg-[#eaf1f5] px-6 py-24">
      <div
        className={`mx-auto grid max-w-6xl gap-16 lg:grid-cols-2 lg:items-center ${flip ? "lg:[&>img]:order-2" : ""}`}
      >
        <img
          className="h-80 w-full rounded-md object-cover"
          src={image}
          alt=""
        />
        <div>
          <h2 className="text-3xl font-bold">{title}</h2>
          <p className="mt-6 max-w-md leading-7 text-slate-500">
            Make informed decisions, monitor stock, and streamline publishing
            workflows across multiple locations.
          </p>
          <ul className="mt-8 space-y-4 text-sm font-semibold">
            <li>Real-time stock level monitoring</li>
            <li>Automated low-stock alerts</li>
            <li>Multi-location tracking</li>
          </ul>
          <button
            className="mt-8 rounded bg-[#0d2b49] px-5 py-3 text-sm font-semibold text-white"
            type="button"
          >
            Explore Features
          </button>
        </div>
      </div>
    </section>
  );
}

export function Landing({ onNavigate }: { onNavigate: Navigate }) {
  return (
    <main className="bg-[#f3f8fc] text-[#103245]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-8">
        <button onClick={() => onNavigate("dashboard")} type="button">
          <Logo compact size="xl" tone="dark" />
        </button>
        <nav className="hidden items-center gap-8 text-sm font-semibold md:flex">
          <a>Features</a>
          <a>Modules</a>
          <a>Support</a>
          <button
            className="rounded border border-slate-300 px-5 py-3 text-slate-700 hover:bg-slate-50"
            onClick={() => onNavigate("register")}
            type="button"
          >
            Request Account
          </button>
          <button
            className="rounded bg-[#0d2b49] px-5 py-3 text-white"
            onClick={() => onNavigate("login")}
            type="button"
          >
            System Login
          </button>
        </nav>
      </header>
      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-2 lg:items-center">
        <div>
          <h1 className="max-w-xl text-5xl font-extrabold leading-tight">
            Empowering the Adventist Publishing Mission
          </h1>
          <p className="mt-8 max-w-md text-lg text-slate-500">
            A unified digital platform for inventory, sales, and distribution
            management. Designed specifically for the Rwanda Union Mission
            Publishing Department.
          </p>
          <div className="mt-8 flex gap-4">
            <Button icon={Grid2X2}>Get Started</Button>
            <Button variant="secondary">View Documentation</Button>
          </div>
        </div>
        <img
          className="h-80 w-full rounded-md object-cover shadow-xl"
          src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=900&q=80"
          alt="Library interior"
        />
      </section>
      <section className="bg-[#0d2b49] py-12 text-white">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 text-center md:grid-cols-4">
          {[
            "100%|Inventory Accuracy",
            "24/7|Real-time Access",
            "13+|Integrated Modules",
            "10x|Reporting Speed",
          ].map((stat) => {
            const [value, label] = stat.split("|");
            return (
              <div key={label}>
                <p className="text-4xl font-bold">{value}</p>
                <p className="mt-3 text-sm text-slate-300">{label}</p>
              </div>
            );
          })}
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 py-28 text-center">
        <h2 className="text-4xl font-bold">
          Comprehensive Publishing Management
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-slate-500">
          Everything you need to manage the Adventist Book Center and publishing
          operations efficiently.
        </p>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {[
            "Centralized Dashboard",
            "Smart Inventory",
            "Sales Analytics",
            "Reprint Planning",
            "Distribution Tracking",
            "Mobile Capable",
          ].map((title) => (
            <Card className="p-8 text-left" key={title}>
              <Package className="mb-8 size-8 rounded bg-blue-50 p-2 text-[#0d2b49]" />
              <h3 className="font-bold">{title}</h3>
              <p className="mt-4 text-sm leading-6 text-slate-500">
                Role-aware tools, real-time metrics, and workflows built for
                publishing teams.
              </p>
            </Card>
          ))}
        </div>
      </section>
      <Feature
        title="Inventory & Stock Control"
        image="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=900&q=80"
      />
      <Feature
        title="Data-Driven Publishing"
        image="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80"
        flip
      />
      <section className="bg-[#0b3442] px-6 py-28 text-center text-white">
        <h2 className="text-4xl font-bold">
          Ready to modernize your operations?
        </h2>
        <p className="mx-auto mt-8 max-w-xl text-slate-300">
          Join the digital transformation of the Rwanda Union Mission Publishing
          Department today.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <button
            className="rounded bg-white px-6 py-3 text-sm font-semibold text-[#0d2b49]"
            onClick={() => onNavigate("register")}
            type="button"
          >
            Register as Customer
          </button>
          <button
            className="rounded border border-white/30 bg-transparent px-6 py-3 text-sm font-semibold text-white"
            onClick={() => onNavigate("register")}
            type="button"
          >
            Register
          </button>
        </div>
      </section>
    </main>
  );
}
