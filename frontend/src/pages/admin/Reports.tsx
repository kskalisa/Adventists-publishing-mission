import { Download, Package, RefreshCw, RotateCcw, ShoppingCart, TrendingUp } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { PageProps } from '../../types/navigation'
import { Shell } from '../../components/layout'
import { Badge, Button, Card, PageHeader, Progress, SimpleTable, StatCard } from '../../components/ui'
import { downloadReportCsv, exportReportPdf } from '../../lib/actions'
import { formatDate, listBooks, listSales, listStockAdjustments, money } from '../../lib/api'
import type { AdjustmentType, Book, BookStatus, PaymentMethod, Sale, SaleStatus, StockAdjustment } from '../../lib/api'
import { validDateRange } from '../../lib/validation'

type StatusFilter = 'ALL' | SaleStatus
type PaymentFilter = 'ALL' | PaymentMethod
type StockFilter = 'ALL' | BookStatus
type MovementFilter = 'ALL' | 'IN' | 'OUT' | AdjustmentType

function Bars({ values }: { values: number[] }) {
  const safeValues = values.length ? values : [0, 0, 0, 0, 0, 0]
  const max = Math.max(...safeValues, 1)
  return <div className="flex h-64 items-end gap-4">{safeValues.slice(0, 8).map((value, index) => <div className="flex flex-1 flex-col items-center gap-3" key={`${value}-${index}`}><div className="w-full rounded-t bg-blue-700" style={{ height: `${Math.max((value / max) * 100, 8)}%` }} /><span className="text-xs font-medium text-slate-500">#{index + 1}</span></div>)}</div>
}

function EmptyReportPanel({ message }: { message: string }) {
  return <div className="grid min-h-40 place-items-center rounded-md border border-dashed border-slate-200 bg-slate-50 px-4 text-center text-sm text-slate-500">{message}</div>
}

function labelize(value: string) {
  return value.split('_').map((part) => part[0] + part.slice(1).toLowerCase()).join(' ')
}

export function Reports({ active, onNavigate }: PageProps) {
  const [books, setBooks] = useState<Book[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([])
  const [error, setError] = useState('')
  const [status, setStatus] = useState<StatusFilter>('ALL')
  const [payment, setPayment] = useState<PaymentFilter>('ALL')
  const [stockStatus, setStockStatus] = useState<StockFilter>('ALL')
  const [category, setCategory] = useState('ALL')
  const [movement, setMovement] = useState<MovementFilter>('ALL')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const rangeError = validDateRange(fromDate, toDate)

  const load = () => {
    setError('')
    Promise.all([listBooks(), listSales(), listStockAdjustments()])
      .then(([books, sales, adjustments]) => { setBooks(books); setSales(sales); setAdjustments(adjustments) })
      .catch((error) => setError(error instanceof Error ? error.message : 'Unable to load analytics.'))
  }

  useEffect(load, [])

  const filteredSales = useMemo(() => sales.filter((sale) => {
    if (rangeError) return false
    const created = new Date(sale.createdAt).getTime()
    const afterFrom = !fromDate || created >= new Date(fromDate).getTime()
    const beforeTo = !toDate || created <= new Date(`${toDate}T23:59:59`).getTime()
    const matchesStatus = status === 'ALL' || sale.status === status
    return afterFrom && beforeTo && matchesStatus
  }), [fromDate, rangeError, sales, status, toDate])
  const filterLabel = [`Status: ${status === 'ALL' ? 'All' : status}`, fromDate ? `From: ${fromDate}` : 'From: Beginning', toDate ? `To: ${toDate}` : 'To: Today'].join(' | ')
  const revenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0)
  const booksSold = filteredSales.reduce((sum, sale) => sum + sale.items.reduce((inner, item) => inner + item.quantity, 0), 0)
  const stockValue = books.reduce((sum, book) => sum + book.price * book.stockQuantity, 0)
  const lowStock = books.filter((book) => book.status !== 'IN_STOCK')
  const categoryCounts = useMemo(() => [...books.reduce((map, book) => map.set(book.category, (map.get(book.category) ?? 0) + 1), new Map<string, number>()).entries()], [books])
  const topTitles = useMemo(() => [...filteredSales.reduce((map, sale) => {
    sale.items.forEach((item) => map.set(item.title, (map.get(item.title) ?? 0) + item.quantity))
    return map
  }, new Map<string, number>()).entries()].sort((a, b) => b[1] - a[1]).slice(0, 6), [filteredSales])
  const report = {
    title: `Administrative Analytics Report - ${status === 'ALL' ? 'All Sales' : status}`,
    subtitle: 'Sales, inventory value, top titles, and recent stock movements from live records.',
    filename: 'administrative-analytics-report',
    filterLabel,
    metrics: [
      { label: 'Total Revenue', value: money(revenue), helper: `${filteredSales.length} sale(s)` },
      { label: 'Books Sold', value: booksSold, helper: 'Units sold' },
      { label: 'Stock Value', value: money(stockValue), helper: `${books.length} title(s)` },
      { label: 'Stock Alerts', value: lowStock.length, helper: 'Low or out of stock' },
    ],
    tables: [
      {
        title: 'Top Selling Titles',
        headers: ['Title', 'Units Sold'],
        rows: topTitles.map(([title, count]) => [title, count]),
      },
      {
        title: 'Recent Stock Movements',
        headers: ['Book', 'Type', 'Quantity', 'Date'],
        rows: adjustments.slice(0, 20).map((item) => [item.bookTitle, item.type.replaceAll('_', ' '), item.quantityDelta, formatDate(item.createdAt)]),
      },
      {
        title: 'Inventory by Category',
        headers: ['Category', 'Titles'],
        rows: categoryCounts.map(([category, count]) => [category, count]),
      },
    ],
  }

  return (
    <Shell active={active} onNavigate={onNavigate}>
      <PageHeader title="Analytics" subtitle="Live sales, inventory, and stock movement insights." actions={<><Button variant="secondary" icon={RefreshCw} onClick={load}>Refresh</Button><Button variant="secondary" icon={Download} disabled={Boolean(rangeError)} onClick={() => downloadReportCsv(report)}>CSV</Button><Button icon={Download} disabled={Boolean(rangeError)} onClick={() => exportReportPdf(report)}>PDF</Button></>} />
      {error && <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      <Card className="mb-6 p-4"><div className="grid gap-3 md:grid-cols-[180px_1fr_1fr]"><select className="h-10 rounded-md border border-slate-200 px-3 text-sm" value={status} onChange={(event) => setStatus(event.target.value as StatusFilter)}><option value="ALL">All Statuses</option><option value="PENDING">Pending</option><option value="APPROVED">Approved</option><option value="PROCESSING">Processing</option><option value="SHIPPED">Shipped</option><option value="DELIVERED">Delivered</option><option value="PAID">Paid</option><option value="HELD">Held</option><option value="CANCELLED">Cancelled</option></select><label className="text-xs font-medium text-slate-500">From<input className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-900" type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} /></label><label className="text-xs font-medium text-slate-500">To<input className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-900" type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} /></label></div></Card>
      {rangeError && <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{rangeError}</p>}
      <div className="grid gap-6 md:grid-cols-4"><StatCard stat={{ label: 'Total Revenue', value: money(revenue), helper: `${filteredSales.length} sale(s)`, icon: TrendingUp, tone: 'green' }} /><StatCard stat={{ label: 'Books Sold', value: booksSold.toString(), helper: 'Units sold', icon: ShoppingCart, tone: 'blue' }} /><StatCard stat={{ label: 'Stock Value', value: money(stockValue), helper: `${books.length} title(s)`, icon: Package }} /><StatCard stat={{ label: 'Stock Alerts', value: lowStock.length.toString(), helper: 'Low or out of stock', tone: lowStock.length ? 'orange' : 'green' }} /></div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card className="p-6"><div className="mb-8 flex justify-between"><div><h2 className="font-semibold text-blue-950">Sales Performance</h2><p className="text-sm text-slate-500">Filtered invoice totals from the API.</p></div><Badge tone="green">{money(revenue)}</Badge></div>{filteredSales.length ? <Bars values={filteredSales.map((sale) => sale.total)} /> : <EmptyReportPanel message={rangeError ? 'Fix the date range to view sales performance.' : 'No sales match the selected filters.'} />}</Card>
        <Card className="p-6"><h2 className="mb-6 font-semibold text-blue-950">Inventory by Category</h2>{categoryCounts.length ? categoryCounts.map(([category, count]) => <Progress key={category} label={category} value={`${count}`} width={Math.min((count / Math.max(books.length, 1)) * 100, 100)} color="bg-blue-700" />) : <EmptyReportPanel message="No inventory categories found yet." />}</Card>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card className="p-6"><h2 className="mb-5 font-semibold text-blue-950">Top Selling Titles</h2>{topTitles.length ? topTitles.map(([title, count]) => <Progress key={title} label={title} value={`${count} sold`} width={Math.min(count * 12, 100)} color="bg-emerald-600" />) : <p className="text-sm text-slate-500">No sales recorded yet.</p>}</Card>
        <Card className="p-6"><h2 className="mb-5 font-semibold text-blue-950">Recent Stock Movements</h2>{adjustments.length ? <SimpleTable headers={['Book', 'Type', 'Qty', 'Date']} rows={adjustments.slice(0, 6).map((item) => [item.bookTitle, item.type.replaceAll('_', ' '), item.quantityDelta > 0 ? `+${item.quantityDelta}` : item.quantityDelta.toString(), formatDate(item.createdAt)])} /> : <EmptyReportPanel message="No stock movements recorded yet." />}</Card>
      </div>
    </Shell>
  )
}
