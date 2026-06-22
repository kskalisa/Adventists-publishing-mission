import { Download, Eye, Printer } from 'lucide-react'
import { useEffect, useState } from 'react'
import { TransactionDetailsModal } from '../../components/forms'
import { people } from '../../data/assets'
import { downloadCsv, printCurrentPage } from '../../lib/actions'
import { listSales, money } from '../../lib/api'
import type { Sale } from '../../lib/api'
import type { PageProps } from '../../types/navigation'
import { Shell } from '../../components/layout'
import { Badge, Button, Card, PageHeader, SearchBox, SimpleTable, StatCard, UserCell } from '../../components/ui'

export function SalesHistory({ active, onNavigate }: PageProps) {
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [sales, setSales] = useState<Sale[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    listSales().then(setSales).catch((error) => setError(error instanceof Error ? error.message : 'Unable to load sales.'))
  }, [])

  const revenue = sales.reduce((sum, sale) => sum + sale.total, 0)
  const average = sales.length ? revenue / sales.length : 0

  return (
    <Shell active={active} onNavigate={onNavigate} role="sales">
      <PageHeader title="Sales Transaction History" actions={<><Button variant="secondary" icon={Download} onClick={() => downloadCsv('sales-history.csv', ['Invoice', 'Customer', 'Items', 'Total', 'Status', 'Date'], sales.map((sale) => [`INV-${sale.id}`, sale.customerName, sale.items.length, sale.total, sale.status, sale.createdAt]))}>Export CSV</Button><Button icon={Printer} onClick={printCurrentPage}>Print Report</Button></>} />
      <div className="grid gap-4 md:grid-cols-4">{[
        { label: 'Total Sales', value: money(revenue) },
        { label: 'Transactions', value: sales.length.toString() },
        { label: 'Average Value', value: money(average) },
        { label: 'Cancelled', value: sales.filter((sale) => sale.status === 'CANCELLED').length.toString() },
      ].map((stat) => <StatCard key={stat.label} stat={stat} />)}</div>
      <Card className="mt-6 p-5"><div className="grid gap-4 md:grid-cols-[1fr_160px_210px_130px]"><SearchBox placeholder="Search Invoice ID or Customer" /><button className="text-sm">All Statuses</button><button className="text-sm">All Payment Methods</button><button className="text-sm text-slate-500">Showing: <strong className="text-slate-900">{sales.length}</strong></button></div></Card>
      {error && <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      <Card className="mt-6">
        <SimpleTable headers={['', 'Invoice ID', 'Customer', 'Items Summary', 'Total Amount', 'Payment', 'Status', 'Date & Time', 'Actions']} rows={sales.map((sale, index) => [<input type="checkbox" aria-label={`Select INV-${sale.id}`} />, <span className="font-mono text-blue-950">INV-{sale.id.toString().padStart(5, '0')}</span>, <UserCell name={sale.customerName} src={sale.customerId ? people[index % people.length] : undefined} />, <span className="text-slate-500">{sale.items.length} item(s)</span>, <strong className="text-blue-950">{money(sale.total)}</strong>, 'Cash', <Badge tone={sale.status === 'CANCELLED' ? 'red' : sale.status === 'HELD' ? 'orange' : 'green'}>{sale.status}</Badge>, <span className="text-slate-500">{new Date(sale.createdAt).toLocaleString()}</span>, <div className="flex gap-4 text-slate-500"><button onClick={() => setSelectedSale(sale)} type="button"><Eye className="size-4" /></button><Printer className="size-4" /></div>])} />
      </Card>
      {selectedSale && <TransactionDetailsModal sale={selectedSale} onClose={() => setSelectedSale(null)} />}
    </Shell>
  )
}
