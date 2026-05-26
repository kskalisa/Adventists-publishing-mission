import { useState } from 'react'
import { appendStoredItem } from '../../lib/storage'
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

export function AddCustomerModal({ onClose, onCreated }: { onClose: () => void; onCreated?: (customer: StoredCustomer) => void }) {
  const [form, setForm] = useState({
    type: '',
    name: '',
    email: '',
    phone: '',
    district: 'Kicukiro',
    status: 'Active',
    address: '',
  })

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }))

  const submit = () => {
    const customer: StoredCustomer = { id: crypto.randomUUID(), ...form }
    appendStoredItem('adventist-customers', customer)
    onCreated?.(customer)
    onClose()
  }

  return (
    <Modal
      title="Add New Customer"
      onClose={onClose}
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={submit}>Create Customer</Button></>}
    >
      <div className="space-y-5">
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

