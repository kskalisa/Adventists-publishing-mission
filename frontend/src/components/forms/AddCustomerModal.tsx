import { useState } from 'react'
import { createCustomer } from '../../lib/api'
import type { Customer, CustomerType } from '../../lib/api'
import { Button, Modal } from '../ui'

export type StoredCustomer = {
  id: string
  type: string
  name: string
  email: string
  phone: string
  district: string
  status: string
  address: string
}

const inputClass = 'h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100'

export function AddCustomerModal({ onClose, onCreated }: { onClose: () => void; onCreated?: (customer: Customer) => void }) {
  const [form, setForm] = useState({
    type: '',
    name: '',
    email: '',
    phone: '',
    district: 'Kicukiro',
    status: 'Active',
    address: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }))

  const submit = async () => {
    setSubmitting(true)
    setError('')
    try {
      const customer = await createCustomer({
        name: form.name,
        type: toCustomerType(form.type),
        email: form.email || undefined,
        phone: form.phone || undefined,
        district: form.district || undefined,
      })
      onCreated?.(customer)
      onClose()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to create customer.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title="Add New Customer"
      onClose={onClose}
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={submit}>{submitting ? 'Creating...' : 'Create Customer'}</Button></>}
    >
      <div className="space-y-5">
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-blue-950">Customer Type</span>
          <select className={inputClass} value={form.type} onChange={(event) => update('type', event.target.value)}>
            <option value="">Select customer type...</option>
            <option>Individual</option>
            <option>Church</option>
            <option>School</option>
            <option>Branch Manager</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-blue-950">Full Name / Organization Name</span>
          <input className={inputClass} placeholder="e.g. Kigali Central Church" value={form.name} onChange={(event) => update('name', event.target.value)} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm font-medium text-blue-950">Email Address</span>
            <input className={inputClass} placeholder="contact@email.com" value={form.email} onChange={(event) => update('email', event.target.value)} />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium text-blue-950">Phone Number</span>
            <input className={inputClass} placeholder="+250 7..." value={form.phone} onChange={(event) => update('phone', event.target.value)} />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm font-medium text-blue-950">District</span>
            <select className={inputClass} value={form.district} onChange={(event) => update('district', event.target.value)}>
              <option>Kicukiro</option>
              <option>Nyarugenge</option>
              <option>Gasabo</option>
              <option>Huye District</option>
              <option>Ruhango</option>
            </select>
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium text-blue-950">Status</span>
            <select className={inputClass} value={form.status} onChange={(event) => update('status', event.target.value)}>
              <option>Active</option>
              <option>Pending</option>
              <option>Inactive</option>
            </select>
          </label>
        </div>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-blue-950">Address</span>
          <textarea className="h-20 w-full rounded-md border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100" placeholder="Street, Sector, Cell..." value={form.address} onChange={(event) => update('address', event.target.value)} />
        </label>
      </div>
    </Modal>
  )
}

function toCustomerType(value: string): CustomerType | undefined {
  if (value === 'Church') return 'CHURCH'
  if (value === 'School') return 'SCHOOL'
  if (value === 'Branch Manager') return 'BRANCH'
  if (value === 'Individual') return 'INDIVIDUAL'
  return undefined
}
