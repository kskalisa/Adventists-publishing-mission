import { Download, Eye, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { people } from '../../data/assets'
import { downloadCsv } from '../../lib/actions'
import { listSales, money } from '../../lib/api'
import type { Sale } from '../../lib/api'
import type { PageProps } from '../../types/navigation'
import { Shell } from '../../components/layout'
import { Badge, Button, Card, FilterBar, Modal, PageHeader, SimpleTable, StatCard, UserCell } from '../../components/ui'

export function Sales({ active, onNavigate }: PageProps) {
  const [rows, setRows] = useState<Sale[]>([])
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    listSales().then(setRows).catch((error) => setError(error instanceof Error ? error.message : 'Unable to load sales.'))
  }, [])
  const revenue = rows.reduce((sum, sale) => sum + sale.total, 0)
  const average = rows.length ? revenue / rows.length : 0

  return (
    <Shell active={active} onNavigate={onNavigate}>
      <PageHeader title="Sales Management" subtitle="Track and manage book sales across all branches" actions={<><Button variant="secondary" icon={Download} onClick={() => downloadCsv('sales.csv', ['Order ID', 'Customer', 'Date', 'Amount', 'Status'], rows.map((sale) => [`#ORD-${sale.id}`, sale.customerName, sale.createdAt, sale.total, sale.status]))}>Export Report</Button><Button icon={Plus} onClick={() => onNavigate('pos')}>New Order</Button></>} />
      <div className="grid gap-4 md:grid-cols-4">{[
        { label: 'Total Revenue', value: money(revenue) },
        { label: 'Total Orders', value: rows.length.toString() },
        { label: 'Avg. Order Value', value: money(average) },
        { label: 'Held Orders', value: rows.filter((sale) => sale.status === 'HELD').length.toString() },
      ].map((stat) => <StatCard key={stat.label} stat={stat} />)}</div>
      <div className="mt-6"><FilterBar placeholder="Search by Order ID, Customer..." filters={['Status: All', 'Branch: All Branches', 'Date: This Month']} /></div>
      {error && <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      <Card className="mt-6">
        <SimpleTable headers={['Order ID', 'Customer', 'Date', 'Items', 'Branch', 'Amount', 'Status', 'Actions']} rows={rows.map((sale, index) => [`#ORD-${sale.id.toString().padStart(4, '0')}`, <UserCell name={sale.customerName} src={sale.customerId ? people[index % people.length] : undefined} />, <span className="text-slate-400">{new Date(sale.createdAt).toLocaleString()}</span>, <div>{sale.items[0]?.title ?? 'No items'}<p className="text-xs text-slate-400">+ {Math.max(sale.items.length - 1, 0)} other item(s)</p></div>, 'Main Branch', <strong>{money(sale.total)}</strong>, <Badge tone={sale.status === 'HELD' ? 'orange' : sale.status === 'CANCELLED' ? 'gray' : 'green'}>{sale.status}</Badge>, <div className="flex gap-3 text-slate-400"><button aria-label={`View order ${sale.id}`} onClick={() => setSelectedSale(sale)} type="button"><Eye className="size-4" /></button><button aria-label={`Export order ${sale.id}`} onClick={() => downloadCsv(`order-${sale.id}.csv`, ['Item', 'Quantity', 'Unit Price', 'Line Total'], sale.items.map((item) => [item.title, item.quantity, item.unitPrice, item.lineTotal]))} type="button"><Download className="size-4" /></button></div>])} />
      </Card>
      {selectedSale && <Modal title={`Order #${selectedSale.id}`} onClose={() => setSelectedSale(null)} footer={<Button onClick={() => setSelectedSale(null)}>Done</Button>}><div className="space-y-3 text-sm text-slate-600"><p>Customer: <strong className="text-blue-950">{selectedSale.customerName}</strong></p><p>Total: {money(selectedSale.total)}</p><p>Status: {selectedSale.status}</p><p>Date: {new Date(selectedSale.createdAt).toLocaleString()}</p><div><p className="font-semibold text-blue-950">Items</p>{selectedSale.items.map((item) => <p key={item.id}>{item.title} x {item.quantity} - {money(item.lineTotal)}</p>)}</div></div></Modal>}
    </Shell>
  )
}
