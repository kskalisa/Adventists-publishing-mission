import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  Info,
  MapPin,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { registerCustomer } from "../../lib/api";
import type { CustomerType } from "../../lib/api";
import type { Navigate } from "../../types/navigation";
import { Logo } from "../../components/ui";

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  type: CustomerType;
  country: string;
  city: string;
  district: string;
  address: string;
  landmark: string;
};

type RegisterErrors = Partial<Record<keyof RegisterForm, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+()\d\s-]{7,20}$/;

const customerTypes: Array<{
  value: CustomerType;
  label: string;
  description: string;
}> = [
  {
    value: "INDIVIDUAL",
    label: "Individual Customer",
    description: "Personal orders, book requests, and account tracking.",
  },
  {
    value: "CHURCH",
    label: "Church / Congregation",
    description: "Church orders, Sabbath school materials, and hymnals.",
  },
  {
    value: "SCHOOL",
    label: "School / Institution",
    description: "Learning materials and bulk academic orders.",
  },
  {
    value: "BRANCH",
    label: "Branch / Bookshop",
    description: "Branch-level ordering and fulfillment coordination.",
  },
];

function inputClass(error?: string) {
  return `h-14 w-full rounded-md border px-4 text-base outline-none transition focus:ring-4 ${
    error
      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
      : "border-slate-300 focus:border-blue-300 focus:ring-blue-100"
  }`;
}

function Field({
  label,
  value,
  onChange,
  onBlur,
  type = "text",
  autoComplete,
  placeholder,
  error,
  hint,
  icon: Icon,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  error?: string;
  hint?: string;
  icon?: LucideIcon;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-800">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      <span className="relative block">
        <input
          aria-invalid={Boolean(error)}
          autoComplete={autoComplete}
          className={`${inputClass(error)} ${Icon ? "pr-12" : ""}`}
          onBlur={onBlur}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          type={type}
          value={value}
        />
        {Icon && (
          <Icon className="absolute right-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
        )}
      </span>
      {error ? (
        <span className="mt-2 block text-sm text-red-600">{error}</span>
      ) : (
        hint && <span className="mt-2 block text-sm text-slate-500">{hint}</span>
      )}
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  hint,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-800">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      <textarea
        aria-invalid={Boolean(error)}
        className={`min-h-28 w-full rounded-md border px-4 py-3 text-base outline-none transition focus:ring-4 ${
          error
            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
            : "border-slate-300 focus:border-blue-300 focus:ring-blue-100"
        }`}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
      {error ? (
        <span className="mt-2 block text-sm text-red-600">{error}</span>
      ) : (
        hint && <span className="mt-2 block text-sm text-slate-500">{hint}</span>
      )}
    </label>
  );
}

function Section({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-slate-200 pt-8">
      <div className="mb-6 flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-950">
          <Icon className="size-5" />
        </span>
        <div>
          <h3 className="font-semibold text-blue-950">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function validateForm(form: RegisterForm) {
  const errors: RegisterErrors = {};
  const name = form.name.trim();
  const email = form.email.trim();
  const phone = form.phone.trim();
  const district = form.district.trim();
  const address = form.address.trim();

  if (!name) {
    errors.name = "Full name or organization name is required.";
  } else if (name.length < 3) {
    errors.name = "Name must be at least 3 characters.";
  }

  if (!email) {
    errors.email = "Email address is required.";
  } else if (!emailPattern.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!phone) {
    errors.phone = "Phone number is required.";
  } else if (!phonePattern.test(phone)) {
    errors.phone = "Enter a valid phone number.";
  }

  if (!form.city.trim()) {
    errors.city = "Province or city is required.";
  }

  if (!district) {
    errors.district = "District or area is required.";
  }

  if (!address) {
    errors.address = "Full delivery address is required.";
  } else if (address.length < 10) {
    errors.address = "Please provide a more complete address.";
  }

  if (!form.password) {
    errors.password = "Password is required.";
  } else if (form.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = "Confirm your password.";
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

function passwordStrength(password: string) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
  ];
  const score = checks.filter(Boolean).length;

  if (!password) return { label: "Use at least 8 characters.", score };
  if (score <= 2) return { label: "Password strength: basic", score };
  if (score === 3) return { label: "Password strength: good", score };
  return { label: "Password strength: strong", score };
}

export function Register({ onNavigate }: { onNavigate: Navigate }) {
  const [form, setForm] = useState<RegisterForm>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    type: "INDIVIDUAL",
    country: "Rwanda",
    city: "",
    district: "",
    address: "",
    landmark: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState<
    Partial<Record<keyof RegisterForm, boolean>>
  >({});

  const errors = validateForm(form);
  const strength = passwordStrength(form.password);
  const showError = (key: keyof RegisterForm) =>
    submitted || touched[key] ? errors[key] : "";

  const update = (key: keyof RegisterForm, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const markTouched = (key: keyof RegisterForm) =>
    setTouched((current) => ({ ...current, [key]: true }));

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    setError("");
    setMessage("");

    const nextErrors = validateForm(form);
    if (Object.keys(nextErrors).length > 0) {
      setTouched({
        name: true,
        email: true,
        phone: true,
        city: true,
        district: true,
        address: true,
        password: true,
        confirmPassword: true,
      });
      setError("Please correct the highlighted fields before submitting.");
      return;
    }

    const fullAddress = [
      form.address.trim(),
      form.landmark.trim() ? `Landmark: ${form.landmark.trim()}` : "",
      form.district.trim(),
      form.city.trim(),
      form.country.trim(),
    ]
      .filter(Boolean)
      .join(", ");

    setSubmitting(true);
    try {
      await registerCustomer({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        type: form.type,
        phone: form.phone.trim(),
        district: form.district.trim(),
        address: fullAddress,
      });
      setMessage(
        "Registration submitted. An administrator will review and approve your account.",
      );
      setForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        type: "INDIVIDUAL",
        country: "Rwanda",
        city: "",
        district: "",
        address: "",
        landmark: "",
      });
      setTouched({});
      setSubmitted(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to submit registration.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <form className="mx-auto max-w-4xl" onSubmit={submit}>
        <button
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-blue-950 transition hover:text-blue-700"
          onClick={() => onNavigate("landing")}
          type="button"
        >
          <ArrowLeft className="size-4" />
          Back to Home
        </button>

        <div className="mb-12">
          <Logo compact />
          <div className="-mt-9 ml-16">
            <h1 className="text-xl font-bold">Adventist Publishing</h1>
            <p className="text-sm text-slate-500">
              Management & Sales Data System
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6 border-b border-slate-200 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-4xl font-bold">Request Customer Account</h2>
            <p className="mt-5 max-w-2xl text-slate-500">
              Create a customer profile for ordering books, tracking requests,
              and receiving delivery updates after administrator approval.
            </p>
          </div>
          <div className="rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-950">
            <div className="flex items-center gap-2 font-semibold">
              <Info className="size-4" />
              Approval required
            </div>
            <p className="mt-1 text-blue-900">
              Your account is activated after staff review.
            </p>
          </div>
        </div>

        {error && (
          <p className="mt-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}
        {message && (
          <div className="mt-6 flex items-start gap-3 rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            <p>{message}</p>
          </div>
        )}

        <div className="mt-10 space-y-10">
          <Section
            description="Tell us who should own this account and how to reach you."
            icon={UserRound}
            title="Account Details"
          >
            <div className="grid gap-6 md:grid-cols-2">
              <Field
                autoComplete="name"
                error={showError("name")}
                label="Full Name / Organization Name"
                onBlur={() => markTouched("name")}
                onChange={(value) => update("name", value)}
                placeholder="e.g. Kigali Central Church"
                required
                value={form.name}
              />
              <Field
                autoComplete="email"
                error={showError("email")}
                label="Email Address"
                onBlur={() => markTouched("email")}
                onChange={(value) => update("email", value)}
                placeholder="contact@example.org"
                required
                type="email"
                value={form.email}
              />
              <Field
                autoComplete="tel"
                error={showError("phone")}
                hint="We may contact you to confirm your request."
                label="Phone Number"
                onBlur={() => markTouched("phone")}
                onChange={(value) => update("phone", value)}
                placeholder="+250 7XX XXX XXX"
                required
                value={form.phone}
              />
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">
                  Customer Type <span className="text-red-500">*</span>
                </span>
                <select
                  className={inputClass()}
                  onChange={(event) =>
                    update("type", event.target.value as CustomerType)
                  }
                  value={form.type}
                >
                  {customerTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <span className="mt-2 block text-sm text-slate-500">
                  {
                    customerTypes.find((type) => type.value === form.type)
                      ?.description
                  }
                </span>
              </label>
            </div>
          </Section>

          <Section
            description="This helps staff verify your location and prepare deliveries accurately."
            icon={MapPin}
            title="Address Information"
          >
            <div className="grid gap-6 md:grid-cols-2">
              <Field
                autoComplete="country-name"
                label="Country"
                onChange={(value) => update("country", value)}
                placeholder="Rwanda"
                value={form.country}
              />
              <Field
                autoComplete="address-level1"
                error={showError("city")}
                label="Province / City"
                onBlur={() => markTouched("city")}
                onChange={(value) => update("city", value)}
                placeholder="e.g. Kigali City"
                required
                value={form.city}
              />
              <Field
                autoComplete="address-level2"
                error={showError("district")}
                hint="Used for reporting and customer grouping."
                label="District / Area"
                onBlur={() => markTouched("district")}
                onChange={(value) => update("district", value)}
                placeholder="e.g. Kicukiro"
                required
                value={form.district}
              />
              <Field
                label="Nearest Landmark"
                onChange={(value) => update("landmark", value)}
                placeholder="e.g. Near Sonatubes"
                value={form.landmark}
              />
            </div>
            <div className="mt-6">
              <TextArea
                error={showError("address")}
                hint="Used for book delivery and account verification."
                label="Full Delivery Address"
                onBlur={() => markTouched("address")}
                onChange={(value) => update("address", value)}
                placeholder="Street, sector, cell, village, building, or church/school location"
                required
                value={form.address}
              />
            </div>
          </Section>

          <Section
            description="Create the password you will use after your account is approved."
            icon={ShieldCheck}
            title="Security"
          >
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <Field
                  autoComplete="new-password"
                  error={showError("password")}
                  icon={Eye}
                  label="Password"
                  onBlur={() => markTouched("password")}
                  onChange={(value) => update("password", value)}
                  placeholder="Create a password"
                  required
                  type="password"
                  value={form.password}
                />
                <div className="mt-3">
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((level) => (
                      <span
                        className={`h-1.5 rounded-full ${
                          strength.score >= level
                            ? "bg-blue-950"
                            : "bg-slate-200"
                        }`}
                        key={level}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    {strength.label}
                  </p>
                </div>
              </div>
              <Field
                autoComplete="new-password"
                error={showError("confirmPassword")}
                label="Confirm Password"
                onBlur={() => markTouched("confirmPassword")}
                onChange={(value) => update("confirmPassword", value)}
                placeholder="Repeat your password"
                required
                type="password"
                value={form.confirmPassword}
              />
            </div>
          </Section>
        </div>

        <button
          className="mt-12 h-14 w-full rounded-md bg-[#0d2b49] font-semibold text-white transition hover:bg-[#123a62] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={submitting}
          type="submit"
        >
          {submitting ? "Submitting request..." : "Submit Customer Request"}
        </button>
        <p className="mt-10 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <button
            className="ml-4 font-semibold text-blue-950"
            onClick={() => onNavigate("login")}
            type="button"
          >
            Login
          </button>
        </p>
      </form>
    </main>
  );
}
