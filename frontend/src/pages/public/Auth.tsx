import { ArrowLeft, CheckCircle2, Eye, Info } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import {
  changePassword,
  login,
  requestAccess,
  roleDashboards,
  setCurrentSession,
  verifyLoginOtp,
} from "../../lib/api";
import type { AuthResponse, CreateAccessRequest } from "../../lib/api";
import type { Navigate } from "../../types/navigation";
import { Logo } from "../../components/ui";

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <section className="mx-auto flex min-h-[calc(100vh-48px)] max-w-7xl items-center justify-center rounded-2xl bg-white shadow-xl shadow-slate-200/70">
        {children}
      </section>
    </main>
  );
}

function Field({
  label,
  value,
  icon: Icon,
  onChange,
  onBlur,
  type = "text",
  autoComplete,
  placeholder,
  error,
  hint,
  required = false,
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}) {
  return (
    <label className="mt-8 block">
      <span className="mb-2 flex items-center justify-between gap-3 text-sm font-medium">
        <span>
          {label}
          {required && <span className="text-red-500"> *</span>}
        </span>
      </span>
      <span className="relative block">
        <input
          aria-invalid={Boolean(error)}
          className={`h-14 w-full rounded-md border px-4 text-base outline-none transition focus:ring-4 ${
            error
              ? "border-red-300 focus:border-red-400 focus:ring-red-100"
              : "border-slate-300 focus:border-blue-300 focus:ring-blue-100"
          } ${Icon ? "pr-12" : ""}`}
          onBlur={onBlur}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={placeholder}
          readOnly={!onChange}
          type={type}
          value={value}
          autoComplete={autoComplete}
        />
        {Icon && (
          <Icon className="absolute right-4 top-1/2 size-5 -translate-y-1/2" />
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

function AuthBrand() {
  return (
    <div className="mb-14">
      <Logo compact />
      <div className="-mt-9 ml-16">
        <h1 className="text-xl font-bold">Adventist Publishing</h1>
        <p className="text-sm text-slate-500">Management & Sales Data System</p>
      </div>
    </div>
  );
}

export function Login({ onNavigate }: { onNavigate: Navigate }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [pendingSession, setPendingSession] = useState<AuthResponse | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const stage = pendingSession?.user?.passwordChangeRequired
    ? "password"
    : challengeId
      ? "otp"
      : "credentials";

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (stage === "otp") {
        const session = await verifyLoginOtp(challengeId, otp);
        if (!session.user || !session.token) {
          throw new Error("Verification did not return a session.");
        }
        if (session.user.passwordChangeRequired) {
          setPendingSession(session);
          return;
        }
        setCurrentSession(session);
        onNavigate(roleDashboards[session.user.role]);
        return;
      }

      if (stage === "password") {
        if (!pendingSession) {
          throw new Error("Password change session expired. Please sign in again.");
        }
        if (newPassword.length < 8) {
          throw new Error("New password must be at least 8 characters.");
        }
        if (newPassword !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }
        if (!pendingSession.token) {
          throw new Error("Password change session expired. Please sign in again.");
        }
        window.localStorage.setItem("adventist-auth-token", pendingSession.token);
        const user = await changePassword(password, newPassword);
        const completedSession = { ...pendingSession, user };
        setCurrentSession(completedSession);
        onNavigate(roleDashboards[user.role]);
        return;
      }

      const session = await login(email, password);
      if (session.otpRequired && session.challengeId) {
        setChallengeId(session.challengeId);
        return;
      }
      if (!session.user || !session.token) {
        throw new Error("Login did not return a session.");
      }
      setCurrentSession(session);
      onNavigate(roleDashboards[session.user.role]);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <form className="w-full max-w-md" onSubmit={submit}>
        <button
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-blue-950 transition hover:text-blue-700"
          onClick={() => onNavigate("landing")}
          type="button"
        >
          <ArrowLeft className="size-4" />
          Back to Home
        </button>
        <AuthBrand />
        <h2 className="text-4xl font-bold">
          {stage === "otp" ? "Verify Login" : stage === "password" ? "Change Password" : "Welcome Back"}
        </h2>
        <p className="mt-4 text-slate-500">
          {stage === "otp"
            ? "Enter the one-time code sent to your registered email."
            : stage === "password"
              ? "Set a new password before opening your dashboard."
              : "Sign in to access your dashboard and manage operations"}
        </p>
        {stage === "credentials" && (
          <>
            <Field
              label="Email Address"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              placeholder="you@example.com"
            />
            <Field
              label="Password"
              value={password}
              onChange={setPassword}
              icon={Eye}
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
            />
          </>
        )}
        {stage === "otp" && (
          <Field
            label="Verification Code"
            value={otp}
            onChange={setOtp}
            autoComplete="one-time-code"
            placeholder="6-digit code"
          />
        )}
        {stage === "password" && (
          <>
            <Field
              label="New Password"
              value={newPassword}
              onChange={setNewPassword}
              type="password"
              autoComplete="new-password"
              placeholder="Create a new password"
            />
            <Field
              label="Confirm New Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              type="password"
              autoComplete="new-password"
              placeholder="Repeat your new password"
            />
          </>
        )}
        {error && (
          <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}
        {stage === "credentials" && <div className="my-5 flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-500">
            <input type="checkbox" className="size-5 rounded" />
            Remember me
          </label>
          <button className="font-medium text-blue-950" type="button">
            Forgot Password?
          </button>
        </div>}
        <button
          className="h-14 w-full rounded-md bg-[#0d2b49] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          disabled={submitting}
          type="submit"
        >
          {submitting
            ? "Working..."
            : stage === "otp"
              ? "Verify Code"
              : stage === "password"
                ? "Change Password"
                : "Sign In"}
        </button>
        {stage === "credentials" && <><div className="my-10 flex items-center gap-5 text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          or
          <span className="h-px flex-1 bg-slate-200" />
        </div>
        <p className="text-center text-sm text-slate-500">
          Don't have an account?{" "}
          <button
            className="font-semibold text-blue-950"
            onClick={() => onNavigate("register")}
            type="button"
          >
            Register as Customer
          </button>
        </p></>}
      </form>
    </AuthLayout>
  );
}

type AccessForm = {
  name: string;
  email: string;
  phone: string;
  employeeId: string;
  department: string;
  role: CreateAccessRequest["requestedRole"];
  password: string;
  confirmPassword: string;
};

type AccessErrors = Partial<Record<keyof AccessForm, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+()\d\s-]{7,20}$/;

function validateAccessForm(form: AccessForm) {
  const errors: AccessErrors = {};
  const name = form.name.trim();
  const email = form.email.trim();
  const phone = form.phone.trim();
  const password = form.password;

  if (!name) {
    errors.name = "Full name is required.";
  } else if (name.length < 3) {
    errors.name = "Full name must be at least 3 characters.";
  }

  if (!email) {
    errors.email = "Email address is required.";
  } else if (!emailPattern.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (phone && !phonePattern.test(phone)) {
    errors.phone = "Enter a valid phone number.";
  }

  if (!form.department) {
    errors.department = "Choose a department.";
  }

  if (!form.role) {
    errors.role = "Choose the access role you need.";
  }

  if (!password) {
    errors.password = "Password is required.";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = "Confirm your password.";
  } else if (password !== form.confirmPassword) {
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

export function RequestAccess({ onNavigate }: { onNavigate: Navigate }) {
  const [form, setForm] = useState<AccessForm>({
    name: "",
    email: "",
    phone: "",
    employeeId: "",
    department: "Sales",
    role: "SALES" as CreateAccessRequest["requestedRole"],
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<keyof AccessForm, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);

  const errors = validateAccessForm(form);
  const showError = (key: keyof AccessForm) =>
    submitted || touched[key] ? errors[key] : "";
  const markTouched = (key: keyof AccessForm) =>
    setTouched((current) => ({ ...current, [key]: true }));
  const strength = passwordStrength(form.password);

  const update = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSubmitted(true);

    const nextErrors = validateAccessForm(form);
    if (Object.keys(nextErrors).length > 0) {
      setTouched({
        name: true,
        email: true,
        phone: true,
        department: true,
        role: true,
        password: true,
        confirmPassword: true,
      });
      setError("Please correct the highlighted fields before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      await requestAccess({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        department: form.department,
        password: form.password,
        requestedRole: form.role,
      });
      setMessage(
        "Access request submitted. An administrator must approve it before you can sign in.",
      );
      setForm({
        name: "",
        email: "",
        phone: "",
        employeeId: "",
        department: "Sales",
        role: "SALES",
        password: "",
        confirmPassword: "",
      });
      setTouched({});
      setSubmitted(false);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to create account.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <form className="mx-auto max-w-3xl" onSubmit={submit}>
        <button
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-blue-950 transition hover:text-blue-700"
          onClick={() => onNavigate("landing")}
          type="button"
        >
          <ArrowLeft className="size-4" />
          Back to Home
        </button>
        <AuthBrand />
        <div className="flex flex-col gap-6 border-b border-slate-200 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-4xl font-bold">Request Access</h2>
            <p className="mt-5 max-w-xl text-slate-500">
              Fill in your details to request system access. Your account will
              be reviewed and approved by an administrator.
            </p>
          </div>
          <div className="rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-950">
            <div className="flex items-center gap-2 font-semibold">
              <Info className="size-4" />
              Review required
            </div>
            <p className="mt-1 text-blue-900">
              You will be notified after approval.
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
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Field
            label="Full Name"
            value={form.name}
            onChange={(value) => update("name", value)}
            onBlur={() => markTouched("name")}
            placeholder="Your full name"
            error={showError("name")}
            required
          />
          <Field
            label="Email Address"
            value={form.email}
            onChange={(value) => update("email", value)}
            onBlur={() => markTouched("email")}
            autoComplete="email"
            placeholder="name@organization.org"
            error={showError("email")}
            required
          />
          <Field
            label="Phone Number"
            value={form.phone}
            onChange={(value) => update("phone", value)}
            onBlur={() => markTouched("phone")}
            placeholder="+250 7XX XXX XXX"
            error={showError("phone")}
            hint="Optional, but useful if an administrator needs to verify your request."
          />
          <Field
            label="Employee ID"
            value={form.employeeId}
            onChange={(value) => update("employeeId", value)}
            placeholder="Optional"
          />
          <label className="mt-8 block">
            <span className="mb-2 block text-sm font-medium">
              Department <span className="text-red-500">*</span>
            </span>
            <select
              aria-invalid={Boolean(showError("department"))}
              className={`h-14 w-full rounded-md border px-4 text-base outline-none transition focus:ring-4 ${
                showError("department")
                  ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                  : "border-slate-300 focus:border-blue-300 focus:ring-blue-100"
              }`}
              value={form.department}
              onBlur={() => markTouched("department")}
              onChange={(event) => update("department", event.target.value)}
            >
              <option>Sales</option>
              <option>Inventory</option>
              <option>Coordination</option>
              <option>Administration</option>
            </select>
            {showError("department") && (
              <span className="mt-2 block text-sm text-red-600">
                {showError("department")}
              </span>
            )}
          </label>
          <label className="mt-8 block">
            <span className="mb-2 block text-sm font-medium">
              Role <span className="text-red-500">*</span>
            </span>
            <select
              aria-invalid={Boolean(showError("role"))}
              className={`h-14 w-full rounded-md border px-4 text-base outline-none transition focus:ring-4 ${
                showError("role")
                  ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                  : "border-slate-300 focus:border-blue-300 focus:ring-blue-100"
              }`}
              value={form.role}
              onBlur={() => markTouched("role")}
              onChange={(event) =>
                update("role", event.target.value as AccessForm["role"])
              }
            >
              <option value="SALES">Sales</option>
              <option value="INVENTORY_MANAGER">Inventory Manager</option>
              <option value="COORDINATOR">Coordinator</option>
            </select>
            {showError("role") && (
              <span className="mt-2 block text-sm text-red-600">
                {showError("role")}
              </span>
            )}
          </label>
        </div>
        <Field
          label="Password"
          value={form.password}
          onChange={(value) => update("password", value)}
          onBlur={() => markTouched("password")}
          icon={Eye}
          type="password"
          autoComplete="new-password"
          placeholder="Create a password"
          error={showError("password")}
          required
        />
        <div className="mt-3">
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((level) => (
              <span
                className={`h-1.5 rounded-full ${
                  strength.score >= level ? "bg-blue-950" : "bg-slate-200"
                }`}
                key={level}
              />
            ))}
          </div>
          <p className="mt-2 text-sm text-slate-500">{strength.label}</p>
        </div>
        <Field
          label="Confirm Password"
          value={form.confirmPassword}
          onChange={(value) => update("confirmPassword", value)}
          onBlur={() => markTouched("confirmPassword")}
          type="password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          error={showError("confirmPassword")}
          required
        />
        <button
          className="mt-12 h-14 w-full rounded-md bg-[#0d2b49] font-semibold text-white transition hover:bg-[#123a62] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={submitting}
          type="submit"
        >
          {submitting ? "Submitting request..." : "Submit Access Request"}
        </button>
        <p className="mt-10 text-center text-sm text-slate-500">
          Already Have an account{" "}
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
