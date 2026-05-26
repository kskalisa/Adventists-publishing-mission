import { Download, MoreHorizontal, Plus } from 'lucide-react'
import { useState } from 'react'
import { AddCustomerModal } from '../../components/forms'
import type { StoredCustomer } from '../../components/forms'
import { people } from '../../data/assets'
import { readStoredList } from '../../lib/storage'
import type { PageProps } from '../../types/navigation'
import { Shell } from '../../components/layout'
import { Badge, Button, Card, FilterBar, PageHeader, SimpleTable, StatCard, UserCell } from '../../components/ui'

export function Customers({ active, onNavigate }: PageProps) {
  const [showModal, setShowModal] = useState(false)
  const [storedCustomers, setStoredCustomers] = useState(() => readStoredList<StoredCustomer>('adventist-customers', []))
  const customers = [
    ...storedCustomers.map((customer) => `${customer.name || 'New Customer'}|${customer.type || 'Individual'}|${customer.district}|0|$0`),
    'Jean-Claude M.|Branch Manager|Kigali Center|152|$12,400',
    'Butare SDA Church|Church|Huye District|24|$3,200',
    'Alice M.|Individual|Nyarugenge|5|$450',
    'Gitwe Adventist College|School|Ruhango|12|$8,900',
    'Alice M.|Individual|Nyarugenge|5|$450',
  ]

  return (
    <Shell active={active} onNavigate={onNavigate}>
      <PageHeader title="Customer Management" actions={<><Button variant="secondary" icon={Download}>Export CSV</Button><Button icon={Plus} onClick={() => setShowModal(true)}>Add Customer</Button></>} />
      <div className="grid gap-6 md:grid-cols-4">{['Total Customers|1,245|42 new this month', 'Active Branches|12|Across 4 regions', 'Registered Churches|85|3 new registrations', 'Total Revenue (YTD)|$458K|+14% vs last year'].map((s) => { const [label, value, helper] = s.split('|'); return <StatCard key={label} stat={{ label, value, helper }} /> })}</div>
      <div className="mt-6"><FilterBar placeholder="Search customers..." filters={['All Types', 'Status: All']} /></div>
      <Card className="mt-6">
        <SimpleTable
          headers={['', 'Customer / Contact', 'Type', 'Location', 'Orders', 'Total Spend', 'Status', 'Actions']}
          rows={customers.map((row, index) => {
            const [name, type, loc, orders, spend] = row.split('|')
            return [
              <input type="checkbox" aria-label={`Select ${name}`} />,
              <UserCell name={name} sub={`${name.toLowerCase().replaceAll(' ', '.')}@adventist.rw`} src={index === 1 || index === 3 ? undefined : people[index % people.length]} />,
              <Badge tone={type === 'School' ? 'green' : type === 'Church' ? 'blue' : type === 'Branch Manager' ? 'purple' : 'gray'}>{type}</Badge>,
              loc,
              orders,
              spend,
              <span className="flex items-center gap-2"><i className={`size-2 rounded-full ${index === 3 ? 'bg-slate-500' : 'bg-emerald-600'}`} />{index === 3 ? 'Pending' : 'Active'}</span>,
              <MoreHorizontal className="size-4 text-slate-400" />,
            ]
          })}
        />
      </Card>
      {showModal && <AddCustomerModal onClose={() => setShowModal(false)} onCreated={() => setStoredCustomers(readStoredList<StoredCustomer>('adventist-customers', []))} />}
    </Shell>
  )
}
