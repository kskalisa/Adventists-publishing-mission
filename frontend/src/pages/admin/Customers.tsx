import { Download, Eye, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AddCustomerModal } from '../../components/forms'
import { people } from '../../data/assets'
import { downloadCsv } from '../../lib/actions'
import { listCustomers } from '../../lib/api'
import type { Customer } from '../../lib/api'
import type { PageProps } from '../../types/navigation'
import { Shell } from '../../components/layout'
import { Badge, Button, Card, FilterBar, Modal, PageHeader, SimpleTable, StatCard, UserCell } from '../../components/ui'
import type { RoleArea } from '../../types/navigation'

export function Customers({ active, onNavigate, role = 'admin' }: PageProps & { role?: RoleArea }) {
  const [showModal, setShowModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [error, setError] = useState('')

  const loadCustomers = () => {
    listCustomers().then(setCustomers).catch((error) => setError(error instanceof Error ? error.message : 'Unable to load customers.'))
  }

  useEffect(loadCustomers, [])

  return (
    <Shell active={active} onNavigate={onNavigate} role={role}>
      <PageHeader title="Customer Management" actions={<><Button variant="secondary" icon={Download} onClick={() => downloadCsv('customers.csv', ['Name', 'Type', 'Email', 'Phone', 'District', 'Address', 'Status'], customers.map((customer) => [customer.name, customer.type, customer.email, customer.phone, customer.district, customer.address, customer.active ? 'Active' : 'Inactive']))}>Export CSV</Button><Button icon={Plus} onClick={() => setShowModal(true)}>Add Customer</Button></>} />
      <div className="grid gap-6 md:grid-cols-4">{[
        { label: 'Total Customers', value: customers.length.toString(), helper: 'Live customer records' },
        { label: 'Active Branches', value: customers.filter((customer) => customer.type === 'BRANCH').length.toString(), helper: 'Across registered districts' },
        { label: 'Registered Churches', value: customers.filter((customer) => customer.type === 'CHURCH').length.toString(), helper: 'Church accounts' },
        { label: 'Schools', value: customers.filter((customer) => customer.type === 'SCHOOL').length.toString(), helper: 'Education customers' },
      ].map((stat) => <StatCard key={stat.label} stat={stat} />)}</div>
      <div className="mt-6"><FilterBar placeholder="Search customers..." filters={['All Types', 'Status: All']} /></div>
      {error && <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      <Card className="mt-6">
        <SimpleTable
          headers={['', 'Customer / Contact', 'Type', 'Location', 'Orders', 'Total Spend', 'Status', 'Actions']}
          rows={customers.map((customer, index) => [
            <input type="checkbox" aria-label={`Select ${customer.name}`} />,
            <UserCell name={customer.name} sub={customer.email ?? customer.phone ?? 'No contact provided'} src={people[index % people.length]} />,
            <Badge tone={customer.type === 'SCHOOL' ? 'green' : customer.type === 'CHURCH' ? 'blue' : customer.type === 'BRANCH' ? 'purple' : 'gray'}>{typeLabel(customer.type)}</Badge>,
            customer.district ?? 'Unassigned',
            '0',
            'RWF 0',
            <span className="flex items-center gap-2"><i className={`size-2 rounded-full ${customer.active ? 'bg-emerald-600' : 'bg-slate-500'}`} />{customer.active ? 'Active' : 'Inactive'}</span>,
            <div className="flex gap-3 text-slate-400"><button aria-label={`View ${customer.name}`} onClick={() => setSelectedCustomer(customer)} type="button"><Eye className="size-4" /></button><button aria-label={`Export ${customer.name}`} onClick={() => downloadCsv(`customer-${customer.id}.csv`, ['Name', 'Type', 'Email', 'Phone', 'District', 'Address', 'Status'], [[customer.name, customer.type, customer.email, customer.phone, customer.district, customer.address, customer.active ? 'Active' : 'Inactive']])} type="button"><Download className="size-4" /></button></div>,
          ])}
        />
      </Card>
      {showModal && <AddCustomerModal onClose={() => setShowModal(false)} onCreated={loadCustomers} />}
      {selectedCustomer && <Modal title="Customer details" onClose={() => setSelectedCustomer(null)} footer={<Button onClick={() => setSelectedCustomer(null)}>Done</Button>}><div className="space-y-3 text-sm text-slate-600"><p><strong className="text-blue-950">{selectedCustomer.name}</strong></p><p>Email: {selectedCustomer.email ?? 'No email recorded'}</p><p>Phone: {selectedCustomer.phone ?? 'No phone recorded'}</p><p>District: {selectedCustomer.district ?? 'No district assigned'}</p><p>Address: {selectedCustomer.address ?? 'No address recorded'}</p><p>Status: {selectedCustomer.active ? 'Active' : 'Inactive'}</p></div></Modal>}
    </Shell>
  )
}

function typeLabel(type: Customer['type']) {
  return type === 'BRANCH' ? 'Branch Manager' : type[0] + type.slice(1).toLowerCase()
}
