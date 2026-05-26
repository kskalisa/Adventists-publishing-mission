import { Eye } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { demoUsers, findDemoUser } from '../../data/demoUsers'
import type { Navigate } from '../../types/navigation'
import { Logo } from '../../components/ui'

function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen bg-slate-50 p-6"><section className="mx-auto flex min-h-[calc(100vh-48px)] max-w-7xl items-center justify-center rounded-2xl bg-white shadow-xl shadow-slate-200/70">{children}</section></main>
}

function Field({
  label,
  value,
  icon: Icon,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  icon?: LucideIcon
  onChange?: (value: string) => void
  type?: string
}) {
  return (
    <label className="mt-8 block">
      <span className="mb-2 block text-sm font-medium">{label}</span>
      <span className="relative block">
        <input
          className="h-14 w-full rounded-md border border-slate-300 px-4 text-base outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
          onChange={(event) => onChange?.(event.target.value)}
          readOnly={!onChange}
          type={type}
          value={value}
        />
        {Icon && <Icon className="absolute right-4 top-1/2 size-5 -translate-y-1/2" />}
      </span>
    </label>
  )
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
  )
}

export function Login({ onNavigate }: { onNavigate: Navigate }) {
  const [email, setEmail] = useState('admin@adventist.rw')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const user = findDemoUser(email, password)

    if (!user) {
      setError('Invalid demo credentials. Pick one of the accounts below.')
      return
    }

    window.localStorage.setItem('adventist-current-user', JSON.stringify(user))
    onNavigate(user.dashboard)
  }

  return (
    <AuthLayout>
      <form className="w-full max-w-md" onSubmit={submit}>
        <AuthBrand />
        <h2 className="text-4xl font-bold">Welcome Back</h2>
        <p className="mt-4 text-slate-500">Sign in to access your dashboard and manage operations</p>
        <Field label="Email Address" value={email} onChange={setEmail} />
        <Field label="Password" value={password} onChange={setPassword} icon={Eye} type="password" />
        {error && <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
        <div className="my-5 flex items-center justify-between text-sm"><label className="flex items-center gap-2 text-slate-500"><input type="checkbox" className="size-5 rounded" />Remember me</label><button className="font-medium text-blue-950" type="button">Forgot Password?</button></div>
        <button className="h-14 w-full rounded-md bg-[#0d2b49] font-semibold text-white" type="submit">Sign In</button>
        <div className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-4">
          <p className="mb-3 text-sm font-semibold text-blue-950">Demo credentials</p>
          <div className="space-y-2">
            {demoUsers.map((user) => (
              <button
                className="flex w-full items-center justify-between rounded border border-transparent px-3 py-2 text-left text-xs transition hover:border-blue-100 hover:bg-white"
                key={user.email}
                onClick={() => {
                  setEmail(user.email)
                  setPassword(user.password)
                  setError('')
                }}
                type="button"
              >
                <span><strong className="block text-slate-900">{user.name}</strong><span className="text-slate-500">{user.email}</span></span>
                <span className="font-mono text-slate-500">{user.password}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="my-10 flex items-center gap-5 text-slate-400"><span className="h-px flex-1 bg-slate-200" />or<span className="h-px flex-1 bg-slate-200" /></div>
        <p className="text-center text-sm text-slate-500">Don't have an account? <button className="font-semibold text-blue-950" onClick={() => onNavigate('access')} type="button">Request Access</button></p>
      </form>
    </AuthLayout>
  )
}

export function RequestAccess({ onNavigate }: { onNavigate: Navigate }) {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-20">
      <form className="mx-auto max-w-2xl">
        <AuthBrand />
        <h2 className="text-4xl font-bold">Request Access</h2>
        <p className="mt-5 max-w-xl text-slate-500">Fill in your details to request system access. Your account will be reviewed and approved by an administrator.</p>
        <div className="mt-12 grid gap-6 md:grid-cols-2">{['Full Name *|John Doe', 'Email Address *|john.doe@adventist.org', 'Phone Number *|+250 XXX XXX XXX', 'Employee ID *|EMP-12345', 'Department *|Select department', 'Role *|Select role'].map((item) => { const [label, value] = item.split('|'); return <Field key={label} label={label} value={value} /> })}</div>
        <Field label="Password *" value="Create a strong password" icon={Eye} />
        <Field label="Confirm Password *" value="Re-enter your password" />
        <button className="mt-12 h-14 w-full rounded-md bg-[#0d2b49] font-semibold text-white" type="button">Sign Up</button>
        <p className="mt-10 text-center text-sm text-slate-500">Already Have an account <button className="ml-4 font-semibold text-blue-950" onClick={() => onNavigate('login')} type="button">Login</button></p>
      </form>
    </main>
  )
}
