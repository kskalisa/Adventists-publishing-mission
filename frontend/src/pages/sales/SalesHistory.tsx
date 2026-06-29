import { Download, Eye, Printer } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { TransactionDetailsModal } from '../../components/forms'
import { Shell } from '../../components/layout'
import { Badge, Button, Card, PageHeader, Pagination, SimpleTable, StatCard, UserCell, paginate } from '../../components/ui'
import { people } from '../../data/assets'
import { downloadCsv, exportReportPdf, printReport } from '../../lib/actions'
import { listSales, money } from '../../lib/api'
import type { PaymentMethod, Sale, SaleStatus } from '../../lib/api'
import type { PageProps } from '../../types/navigation'

type StatusFilter = 'ALL' | SaleStatus
type PaymentFilter = 'ALL' | PaymentMethod

export function SalesHistory({ active, onNavigate }: PageProps) {
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [sales, setSales] = useState<Sale[]>([])
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<StatusFilter>('ALL')
  const [payment, setPayment] = useState<PaymentFilter>('ALL')
  const [page, setPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    listSales().then(setSales).catch((error) => setError(error instanceof Error ? error.message : 'Unable to load sales.'))
  }, [])

  const filteredSales = useMemo(() => {
    const term = query.trim().toLowerCase()
    return sales.filter((sale) => {
      const matchesQuery = !term || sale.customerName.toLowerCase().includes(term) || sale.id.toString().includes(term) || (sale.receiptNumber ?? '').toLowerCase().includes(term)
      const matchesStatus = status === 'ALL' || sale.status === status
      const matchesPayment = payment === 'ALL' || sale.paymentMethod === payment
      return matchesQuery && matchesStatus && matchesPayment
    })
  }, [payment, query, sales, status])

  const visibleSales = paginate(filteredSales, page, pageSize)
  const filterLabel = [`Status: ${status === 'ALL' ? 'All' : status}`, `Payment: ${payment === 'ALL' ? 'All' : payment}`, query.trim() ? `Search: ${query.trim()}` : 'Search: None'].join(' | ')
  const revenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0)
  const average = filteredSales.length ? revenue / filteredSales.length : 0
  const report = {
    title: `Sales Transaction History - ${status === 'ALL' ? 'All Statuses' : status}`,
    subtitle: 'Transaction report generated from filtered live sales records.',
    filename: 'sales-transaction-history',
    filterLabel,
    metrics: [
      { label: 'Total Sales', value: money(revenue) },
      { label: 'Transactions', value: filteredSales.length },
      { label: 'Average Value', value: money(average) },
      { label: 'Cancelled', value: filteredSales.filter((sale) => sale.status === 'CANCELLED').length },
    ],
    tables: [{ title: 'Transactions', headers: ['Invoice', 'Customer', 'Items', 'Total', 'Status', 'Date'], rows: filteredSales.map((sale) => [`INV-${sale.id.toString().padStart(5, '0')}`, sale.customerName, sale.items.length, money(sale.total), sale.status, new Date(sale.createdAt).toLocaleString()]) }],
  }

  return (
    <Shell active={active} onNavigate={onNavigate} role="sales">
      <PageHeader title="Sales Transaction History" actions={<><Button variant="secondary" icon={Download} onClick={() => downloadCsv('sales-history.csv', ['Invoice', 'Customer', 'Items', 'Total', 'Status', 'Date'], filteredSales.map((sale) => [`INV-${sale.id}`, sale.customerName, sale.items.length, sale.total, sale.status, sale.createdAt]))}>Export CSV</Button><Button variant="secondary" icon={Download} onClick={() => exportReportPdf(report)}>PDF</Button><Button icon={Printer} onClick={() => printReport(report)}>Print Report</Button></>} />
      <div className="grid gap-4 md:grid-cols-4">{[
        { label: 'Total Sales', value: money(revenue) },
        { label: 'Transactions', value: filteredSales.length.toString() },
        { label: 'Average Value', value: money(average) },
        { label: 'Cancelled', value: filteredSales.filter((sale) => sale.status === 'CANCELLED').length.toString() },
      ].map((stat) => <StatCard key={stat.label} stat={stat} />)}</div>
      <Card className="mt-6 p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_180px_210px_130px]">
          <input className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100" placeholder="Search invoice or customer" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} />
          <select className="h-10 rounded-md border border-slate-200 px-3 text-sm" value={status} onChange={(event) => { setStatus(event.target.value as StatusFilter); setPage(1) }}>
            <option value="ALL">All Statuses</option><option value="PENDING">Pending</option><option value="APPROVED">Approved</option><option value="PROCESSING">Processing</option><option value="SHIPPED">Shipped</option><option value="DELIVERED">Delivered</option><option value="PAID">Paid</option><option value="HELD">Held</option><option value="CANCELLED">Cancelled</option>
          </select>
          <select className="h-10 rounded-md border border-slate-200 px-3 text-sm" value={payment} onChange={(event) => { setPayment(event.target.value as PaymentFilter); setPage(1) }}>
            <option value="ALL">All Payment Methods</option><option value="CASH">Cash</option><option value="MOMO">MoMo</option><option value="CARD">Card</option><option value="BANK_TRANSFER">Bank Transfer</option><option value="CREDIT">Credit</option>
          </select>
          <span className="self-center text-sm text-slate-500">Showing: <strong className="text-slate-900">{filteredSales.length}</strong></span>
        </div>
      </Card>
      {error && <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      <Card className="mt-6">
        <SimpleTable headers={['', 'Invoice ID', 'Customer', 'Items Summary', 'Total Amount', 'Payment', 'Status', 'Date & Time', 'Actions']} rows={visibleSales.map((sale, index) => [<input type="checkbox" aria-label={`Select INV-${sale.id}`} />, <span className="font-mono text-blue-950">INV-{sale.id.toString().padStart(5, '0')}</span>, <UserCell name={sale.customerName} src={sale.customerId ? people[index % people.length] : undefined} />, <span className="text-slate-500">{sale.items.length} item(s)</span>, <strong className="text-blue-950">{money(sale.total)}</strong>, sale.paymentMethod ?? 'Unpaid', <Badge tone={sale.status === 'CANCELLED' ? 'red' : sale.status === 'HELD' ? 'orange' : 'green'}>{sale.status}</Badge>, <span className="text-slate-500">{new Date(sale.createdAt).toLocaleString()}</span>, <div className="flex gap-4 text-slate-500"><button onClick={() => setSelectedSale(sale)} type="button"><Eye className="size-4" /></button><Printer className="size-4" /></div>])} />
        <Pagination page={page} pageSize={pageSize} total={filteredSales.length} onPageChange={setPage} />
      </Card>
      {selectedSale && <TransactionDetailsModal sale={selectedSale} onClose={() => setSelectedSale(null)} />}
    </Shell>
  )
}
