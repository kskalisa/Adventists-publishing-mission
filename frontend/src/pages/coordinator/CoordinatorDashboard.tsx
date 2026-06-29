import { BarChart3, CheckCircle, Download, Edit3, Gauge, Package, PackageCheck, Plus, Printer, Trash2, Upload, Users, WalletCards, XCircle, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Shell } from '../../components/layout'
import { Badge, Button, Card, Modal, Pagination, Progress, SimpleTable, StatCard, paginate } from '../../components/ui'
import { downloadCsv, downloadReportCsv, exportReportPdf } from '../../lib/actions'
import { cancelProductionOrder, createProductionOrder, deleteProductionOrder, listBooks, listProductionOrders, listSales, money, updateProductionOrder } from '../../lib/api'
import type { Book, ProductionOrder, ProductionOrderStatus, Sale } from '../../lib/api'
import { firstError, notPastDate, positiveNumber, required, todayDateString, wholeNumber } from '../../lib/validation'
import type { PageProps, RoleArea } from '../../types/navigation'

type CoordinatorData = {
  books: Book[]
  sales: Sale[]
  orders: ProductionOrder[]
  error: string
  reload: () => void
}

function useCoordinatorData(): CoordinatorData {
  const [books, setBooks] = useState<Book[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [orders, setOrders] = useState<ProductionOrder[]>([])
  const [error, setError] = useState('')

  const reload = () => {
    setError('')
    Promise.all([listBooks(), listSales(), listProductionOrders()])
      .then(([books, sales, orders]) => { setBooks(books); setSales(sales); setOrders(orders) })
      .catch((error) => setError(error instanceof Error ? error.message : 'Unable to load coordinator data.'))
  }

  useEffect(reload, [])

  return { books, sales, orders, error, reload }
}

function Bars({ values, labels, colors }: { values: number[]; labels: string[]; colors?: string[] }) {
  const max = Math.max(...values, 1)
  return <div className="flex h-48 items-end gap-4">{values.map((value, index) => <div className="flex flex-1 flex-col items-center gap-3" key={`${value}-${index}`}><div className={`w-full rounded-t ${colors?.[index] ?? (index === values.length - 1 ? 'bg-blue-600' : 'bg-blue-100')}`} style={{ height: `${Math.max((value / max) * 100, 4)}%` }} /><span className="text-xs text-slate-400">{labels[index]}</span></div>)}</div>
}

function bookStatusLabel(status: Book['status']) {
  return status === 'IN_STOCK' ? 'Adequate' : status === 'LOW_STOCK' ? 'Warning' : 'Critical'
}

function statusTone(status: Book['status']) {
  return status === 'IN_STOCK' ? 'green' : status === 'LOW_STOCK' ? 'orange' : 'red'
}

function orderStatusLabel(status: ProductionOrderStatus) {
  return status.split('_').map((word) => word[0] + word.slice(1).toLowerCase()).join(' ')
}

function orderTone(status: ProductionOrderStatus) {
  if (status === 'RECEIVED') return 'green'
  if (status === 'CANCELLED') return 'red'
  if (status === 'IN_PROGRESS') return 'blue'
  return 'orange'
}

function orderProgress(status: ProductionOrderStatus) {
  if (status === 'RECEIVED') return 100
  if (status === 'IN_PROGRESS') return 65
  if (status === 'APPROVED') return 40
  if (status === 'CANCELLED') return 0
  return 20
}

function saleTone(status: Sale['status']) {
  if (status === 'DELIVERED' || status === 'PAID' || status === 'APPROVED') return 'green'
  if (status === 'CANCELLED' || status === 'REJECTED') return 'red'
  if (status === 'PROCESSING' || status === 'SHIPPED') return 'blue'
  return 'orange'
}

function revenue(data: CoordinatorData) {
  return data.sales.reduce((sum, sale) => sum + sale.total, 0)
}

function booksSold(data: CoordinatorData) {
  return data.sales.reduce((sum, sale) => sum + sale.items.reduce((inner, item) => inner + item.quantity, 0), 0)
}

function topSelling(data: CoordinatorData) {
  const map = new Map<string, number>()
  data.sales.forEach((sale) => sale.items.forEach((item) => map.set(item.title, (map.get(item.title) ?? 0) + item.quantity)))
  return [...map.entries()].sort((a, b) => b[1] - a[1])
}

function reprintCandidates(books: Book[]) {
  return books.filter((book) => book.stockQuantity <= book.reorderLevel * 2).sort((a, b) => a.stockQuantity - b.stockQuantity)
}

function salesByCategory(data: CoordinatorData) {
  const categoryByTitle = new Map(data.books.map((book) => [book.title, book.category]))
  const totals = new Map<string, number>()
  data.sales.forEach((sale) => sale.items.forEach((item) => {
    const category = categoryByTitle.get(item.title) ?? 'Uncategorized'
    totals.set(category, (totals.get(category) ?? 0) + item.quantity)
  }))
  return [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
}

function LiveError({ error }: { error: string }) {
  return error ? <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null
}

function GuidanceModal({ title, message, onClose }: { title: string; message: string; onClose: () => void }) {
  return <Modal title={title} onClose={onClose} footer={<Button onClick={onClose}>Done</Button>}><p className="text-sm leading-6 text-slate-600">{message}</p></Modal>
}

function EmptyPanel({ message }: { message: string }) {
  return <div className="grid min-h-40 place-items-center rounded-md border border-dashed border-slate-200 bg-slate-50 px-4 text-center text-sm text-slate-500">{message}</div>
}

function SalesByCategoryCard({ data }: { data: CoordinatorData }) {
  const rows = salesByCategory(data)
  const max = Math.max(...rows.map(([, units]) => units), 1)
  return (
    <Card className="flex min-h-[310px] flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-bold text-blue-950">Sales by Category</h2>
          <p className="mt-1 text-xs text-slate-500">Units sold from recorded sales.</p>
        </div>
        <Badge tone="blue">{rows.reduce((sum, [, units]) => sum + units, 0)} units</Badge>
      </div>
      <div className="mt-6 flex-1">
        {rows.length ? <Bars values={rows.map(([, units]) => units)} labels={rows.map(([category]) => category.slice(0, 10))} colors={rows.map((_, index) => index === 0 ? 'bg-blue-600' : 'bg-sky-200')} /> : <EmptyPanel message="No sales have been recorded yet." />}
      </div>
      {rows.length > 0 && <div className="mt-4 space-y-3">{rows.slice(0, 3).map(([category, units]) => <Progress key={category} label={category} value={`${units} units`} width={Math.max((units / max) * 100, 6)} color="bg-blue-600" />)}</div>}
    </Card>
  )
}

function ReprintForecastCard({ candidates }: { candidates: Book[] }) {
  const urgent = candidates.filter((book) => book.status === 'OUT_OF_STOCK').length
  return (
    <Card className="flex min-h-[310px] flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-bold text-blue-950">Reprint Forecast</h2>
          <p className="mt-1 text-xs text-slate-500">Titles below reorder comfort level.</p>
        </div>
        <Badge tone={urgent > 0 ? 'red' : candidates.length > 0 ? 'orange' : 'green'}>{urgent} critical</Badge>
      </div>
      <div className="mt-5 flex-1 space-y-3">
        {candidates.length ? candidates.slice(0, 5).map((book) => {
          const suggested = Math.max(book.reorderLevel * 5 - book.stockQuantity, 0)
          return (
            <div className="rounded-md border border-slate-100 bg-slate-50 px-3 py-2" key={book.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{book.title}</p>
                  <p className="mt-1 text-xs text-slate-500">Stock {book.stockQuantity} / reorder {book.reorderLevel}</p>
                </div>
                <Badge tone={statusTone(book.status)}>{bookStatusLabel(book.status)}</Badge>
              </div>
              <p className="mt-2 text-xs font-medium text-blue-700">Suggested reprint: {suggested.toLocaleString()} units</p>
            </div>
          )
        }) : <EmptyPanel message="No titles need reprint attention right now." />}
      </div>
    </Card>
  )
}

function InventoryStatusCard({ books, healthy }: { books: Book[]; healthy: number }) {
  const adequate = books.filter((book) => book.status === 'IN_STOCK').length
  const warning = books.filter((book) => book.status === 'LOW_STOCK').length
  const critical = books.filter((book) => book.status === 'OUT_OF_STOCK').length
  return (
    <Card className="flex min-h-[310px] flex-col p-5">
      <div>
        <h2 className="font-bold text-blue-950">Inventory Status</h2>
        <p className="mt-1 text-xs text-slate-500">Catalog health across active titles.</p>
      </div>
      <div className="my-7 grid place-items-center">
        <div className="grid size-36 place-items-center rounded-full border-[12px] border-blue-100 bg-white text-center">
          <div>
            <p className="text-3xl font-bold text-blue-950">{healthy}%</p>
            <p className="text-xs text-slate-500">healthy</p>
          </div>
        </div>
      </div>
      <div className="mt-auto grid grid-cols-3 gap-3 text-center text-sm">
        <div className="rounded-md bg-green-50 px-2 py-3"><strong className="block text-green-700">{adequate}</strong><span className="text-xs text-slate-500">Adequate</span></div>
        <div className="rounded-md bg-orange-50 px-2 py-3"><strong className="block text-orange-700">{warning}</strong><span className="text-xs text-slate-500">Warning</span></div>
        <div className="rounded-md bg-red-50 px-2 py-3"><strong className="block text-red-700">{critical}</strong><span className="text-xs text-slate-500">Critical</span></div>
      </div>
    </Card>
  )
}

function RevenuePerformanceCard({ sales }: { sales: Sale[] }) {
  const latest = [...sales].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).slice(-8)
  const highest = latest.reduce((max, sale) => Math.max(max, sale.total), 0)
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-bold text-blue-950">Revenue Performance</h2>
          <p className="mt-1 text-xs text-slate-500">Latest {latest.length} completed sales records from the API.</p>
        </div>
        <Badge tone="green">{money(latest.reduce((sum, sale) => sum + sale.total, 0))}</Badge>
      </div>
      <div className="mt-6">
        {latest.length ? (
          <div className="space-y-4">
            <Bars values={latest.map((sale) => sale.total)} labels={latest.map((sale) => sale.receiptNumber ?? `#${sale.id}`)} colors={latest.map((_, index) => index === latest.length - 1 ? 'bg-blue-600' : 'bg-sky-200')} />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {latest.slice(-4).map((sale) => <div className="rounded-md bg-slate-50 px-3 py-2 text-sm" key={sale.id}><span className="block truncate text-xs text-slate-500">{sale.receiptNumber ?? `#ORD-${sale.id}`}</span><strong className="text-slate-900">{money(sale.total)}</strong><span className="mt-1 block text-xs text-slate-500">{Math.round((sale.total / Math.max(highest, 1)) * 100)}% of peak</span></div>)}
            </div>
          </div>
        ) : <EmptyPanel message="No sales records found yet. Revenue performance will appear after sales are created." />}
      </div>
    </Card>
  )
}

function TopSellingTitlesCard({ top }: { top: [string, number][] }) {
  const highest = Math.max(...top.map(([, count]) => count), 1)
  return (
    <Card className="p-5">
      <h2 className="font-bold text-blue-950">Top Selling Titles</h2>
      <p className="mt-1 text-xs text-slate-500">Calculated from real sale line items.</p>
      <div className="mt-5">
        {top.length ? top.slice(0, 5).map(([title, count], index) => <div className="mt-5 flex gap-3" key={title}><span className="grid size-7 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">{index + 1}</span><div className="min-w-0 flex-1"><p className="flex justify-between gap-3 font-semibold leading-tight"><span className="truncate">{title}</span><strong>{count}</strong></p><Progress label="" value={`${count} sold`} width={Math.max((count / highest) * 100, 6)} color="bg-blue-600" /></div></div>) : <EmptyPanel message="No sold titles yet." />}
      </div>
    </Card>
  )
}

function RecentTransactionsCard({ sales }: { sales: Sale[] }) {
  return (
    <Card className="mt-6 p-5">
      <h2 className="mb-4 font-bold text-blue-950">Recent Transactions</h2>
      {sales.length ? <SimpleTable headers={['Order ID', 'Entity / Customer', 'Date', 'Items', 'Amount', 'Status']} rows={sales.map((sale) => [`#ORD-${sale.id}`, sale.customerName, new Date(sale.createdAt).toLocaleString(), sale.items.reduce((sum, item) => sum + item.quantity, 0).toString(), money(sale.total), <Badge tone={saleTone(sale.status)}>{sale.status}</Badge>])} /> : <EmptyPanel message="No transactions found. This table uses live sales records only." />}
    </Card>
  )
}

function PrintOrderModal({ books, order, onClose, onSaved }: { books: Book[]; order?: ProductionOrder; onClose: () => void; onSaved: (message: string) => void }) {
  const first = order ? books.find((book) => book.id === order.bookId) ?? books[0] : books[0]
  const [bookId, setBookId] = useState(order?.bookId.toString() ?? first?.id.toString() ?? '')
  const selectedBook = books.find((book) => book.id === Number(bookId)) ?? first
  const suggested = selectedBook ? Math.max(selectedBook.reorderLevel * 5 - selectedBook.stockQuantity, 0) : 0
  const [quantity, setQuantity] = useState(order?.quantity.toString() ?? suggested.toString())
  const [printer, setPrinter] = useState(order?.printer ?? 'Kigali Print Press')
  const [deliveryDate, setDeliveryDate] = useState(order?.expectedDeliveryDate ?? '')
  const [estimatedCost, setEstimatedCost] = useState(order?.estimatedCost.toString() ?? (selectedBook ? (suggested * selectedBook.price).toString() : ''))
  const [status, setStatus] = useState<ProductionOrderStatus>(order?.status ?? 'PLANNED')
  const [notes, setNotes] = useState(order?.notes ?? '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!order) {
      setQuantity(suggested.toString())
      setEstimatedCost(selectedBook ? (suggested * selectedBook.price).toString() : '')
    }
  }, [order, selectedBook, suggested])

  const submit = async () => {
    const qty = Number(quantity)
    const cost = Number(estimatedCost)
    setError('')
    const validationError = firstError([
      selectedBook ? '' : 'Select a title before creating the print order.',
      wholeNumber(quantity, 'Print quantity', false),
      required(printer, 'Printer or production partner'),
      notPastDate(deliveryDate, 'Expected delivery'),
      positiveNumber(estimatedCost, 'Estimated production cost', true),
    ])
    if (validationError) {
      setError(validationError)
      return
    }
    setSaving(true)
    try {
      if (order) {
        await updateProductionOrder(order.id, { quantity: qty, printer, expectedDeliveryDate: deliveryDate || undefined, notes, estimatedCost: cost, status })
        onSaved(`Production order #PO-${order.id.toString().padStart(4, '0')} was updated.`)
      } else {
        const created = await createProductionOrder({ bookId: selectedBook.id, quantity: qty, printer, expectedDeliveryDate: deliveryDate || undefined, notes, estimatedCost: cost })
        onSaved(`Production order #PO-${created.id.toString().padStart(4, '0')} for ${selectedBook.title} was created and assigned to ${created.createdByName ?? 'the coordinator'}.`)
      }
      onClose()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to save production order.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={order ? 'Edit print order' : 'Create print order'} onClose={onClose} size="lg" footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={submit}>{saving ? 'Saving...' : order ? 'Save Changes' : 'Create Order'}</Button></>}>
      {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2"><span className="mb-2 block text-sm font-medium">Title</span><select className="h-10 w-full rounded-md border border-slate-200 px-3" value={bookId} onChange={(event) => setBookId(event.target.value)} disabled={Boolean(order)}>{books.map((book) => <option key={book.id} value={book.id}>{book.title}</option>)}</select></label>
        <label><span className="mb-2 block text-sm font-medium">Print Quantity</span><input className="h-10 w-full rounded-md border border-slate-200 px-3" inputMode="numeric" value={quantity} onChange={(event) => setQuantity(event.target.value)} /></label>
        <label><span className="mb-2 block text-sm font-medium">Printer</span><input className="h-10 w-full rounded-md border border-slate-200 px-3" value={printer} onChange={(event) => setPrinter(event.target.value)} /></label>
        <label><span className="mb-2 block text-sm font-medium">Expected Delivery</span><input className="h-10 w-full rounded-md border border-slate-200 px-3" min={todayDateString()} type="date" value={deliveryDate} onChange={(event) => setDeliveryDate(event.target.value)} /></label>
        <label><span className="mb-2 block text-sm font-medium">Estimated Cost</span><input className="h-10 w-full rounded-md border border-slate-200 px-3" inputMode="decimal" value={estimatedCost} onChange={(event) => setEstimatedCost(event.target.value)} /></label>
        {order && <label><span className="mb-2 block text-sm font-medium">Status</span><select className="h-10 w-full rounded-md border border-slate-200 px-3" value={status} onChange={(event) => setStatus(event.target.value as ProductionOrderStatus)}><option value="PLANNED">Planned</option><option value="APPROVED">Approved</option><option value="IN_PROGRESS">In Progress</option><option value="RECEIVED">Received into stock</option></select></label>}
        <label className={order ? '' : 'sm:col-span-2'}><span className="mb-2 block text-sm font-medium">Notes</span><input className="h-10 w-full rounded-md border border-slate-200 px-3" value={notes} onChange={(event) => setNotes(event.target.value)} /></label>
      </div>
      {selectedBook && <div className="mt-5 grid gap-3 rounded-md bg-slate-50 p-4 text-sm sm:grid-cols-3"><p><span className="block text-slate-500">Current Stock</span><strong>{selectedBook.stockQuantity}</strong></p><p><span className="block text-slate-500">Reorder Level</span><strong>{selectedBook.reorderLevel}</strong></p><p><span className="block text-slate-500">Suggested Qty</span><strong>{suggested}</strong></p></div>}
    </Modal>
  )
}

export function CoordinatorDashboardScreen({ active, onNavigate, data = useCoordinatorData() }: PageProps & { data?: CoordinatorData }) {
  const [notice, setNotice] = useState<string | null>(null)
  const candidates = reprintCandidates(data.books)
  const fastMoving = topSelling(data).filter(([, qty]) => qty > 0)
  const stockTotal = data.books.reduce((sum, book) => sum + book.stockQuantity, 0)
  const healthy = data.books.length ? Math.round((data.books.filter((book) => book.status === 'IN_STOCK').length / data.books.length) * 100) : 0

  return (
    <Shell active={active} onNavigate={onNavigate} role="coordinator">
      <LiveError error={data.error} />
      <div className="grid gap-6 md:grid-cols-4"><StatCard stat={{ label: 'Reprint Recommended', value: candidates.length.toString(), helper: 'From live stock levels', tone: 'orange', icon: Gauge }} /><StatCard stat={{ label: 'Fast Moving Titles', value: fastMoving.length.toString(), helper: 'From sales records', tone: 'green', icon: Zap }} /><StatCard stat={{ label: 'Total Stock Units', value: stockTotal.toLocaleString(), helper: 'All catalog stock', icon: Package }} /><StatCard stat={{ label: 'Revenue', value: money(revenue(data)), helper: 'Recent sales', tone: 'green', icon: WalletCards }} /></div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
          <div>
            <h1 className="text-xl font-bold text-blue-950">Coordination Overview</h1>
            <p className="mt-1 text-sm text-slate-500">Sales movement, reprint priorities, and inventory health from live records.</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <SalesByCategoryCard data={data} />
            <ReprintForecastCard candidates={candidates} />
            <InventoryStatusCard books={data.books} healthy={healthy} />
          </div>
        </div>
        <aside className="space-y-6"><Card className="p-5"><h2 className="font-bold">Recent Sales</h2>{data.sales.slice(0, 4).map((sale) => <p className="mt-4 text-sm" key={sale.id}><strong>#{sale.id}</strong><span className="float-right">{money(sale.total)}</span><span className="block text-slate-500">{sale.customerName}</span></p>)}</Card><Card className="p-5"><h2 className="font-bold">Open Production</h2>{data.orders.filter((order) => order.status !== 'CANCELLED' && order.status !== 'RECEIVED').slice(0, 3).map((order) => <p className="mt-4 text-sm" key={order.id}><strong>#PO-{order.id.toString().padStart(4, '0')}</strong><span className="float-right">{order.quantity}</span><span className="block text-slate-500">{order.bookTitle}</span></p>)}</Card></aside>
      </div>
      <ReprintTable books={candidates} />
      {notice && <GuidanceModal title="Production order guidance" message={notice} onClose={() => setNotice(null)} />}
    </Shell>
  )
}

function ReprintTable({ books }: { books: Book[] }) {
  return <Card className="mt-6 overflow-hidden"><div className="flex items-center justify-between p-5"><h2 className="font-bold">Reprint Planning</h2><Button variant="secondary" icon={Download} onClick={() => downloadCsv('coordinator-reprints.csv', ['Book', 'Current Stock', 'Reorder Level', 'Suggested Qty', 'Status'], books.map((book) => [book.title, book.stockQuantity, book.reorderLevel, Math.max(book.reorderLevel * 5 - book.stockQuantity, 0), book.status]))}>Export</Button></div><SimpleTable headers={['Book Title', 'Current Stock', 'Min Level', 'Rec. Qty', 'Est. Cost', 'Status']} rows={books.map((book) => [book.title, book.stockQuantity.toString(), book.reorderLevel.toString(), Math.max(book.reorderLevel * 5 - book.stockQuantity, 0).toString(), money(Math.max(book.reorderLevel * 5 - book.stockQuantity, 0) * book.price), <Badge tone={statusTone(book.status)}>{bookStatusLabel(book.status)}</Badge>])} /></Card>
}

export function ReprintPlanningScreen({ active, onNavigate, data = useCoordinatorData() }: PageProps & { data?: CoordinatorData }) {
  const [notice, setNotice] = useState<string | null>(null)
  const [showPrintOrder, setShowPrintOrder] = useState(false)
  const candidates = reprintCandidates(data.books)
  const saveNotice = (message: string) => { data.reload(); setNotice(message) }
  return <Shell active={active} onNavigate={onNavigate} role="coordinator" title="Reprint Planning"><LiveError error={data.error} /><div className="mb-6 flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-2xl font-bold text-blue-950">Publishing & Reprint Planning</h1><p className="mt-2 text-slate-500">Live stock depletion and suggested reprint quantities.</p></div><Button icon={Plus} onClick={() => setShowPrintOrder(true)}>New Print Order</Button></div><div className="grid gap-5 md:grid-cols-4"><StatCard stat={{ label: 'Reprint Recommendations', value: candidates.length.toString(), tone: 'red' }} /><StatCard stat={{ label: 'Critical Titles', value: candidates.filter((book) => book.status === 'OUT_OF_STOCK').length.toString(), tone: 'red', icon: Printer }} /><StatCard stat={{ label: 'Est. Units', value: candidates.reduce((sum, book) => sum + Math.max(book.reorderLevel * 5 - book.stockQuantity, 0), 0).toString(), icon: Package }} /><StatCard stat={{ label: 'Open Print Orders', value: data.orders.filter((order) => order.status !== 'CANCELLED' && order.status !== 'RECEIVED').length.toString(), icon: WalletCards }} /></div><ReprintTable books={candidates} />{showPrintOrder && <PrintOrderModal books={candidates.length ? candidates : data.books} onClose={() => setShowPrintOrder(false)} onSaved={saveNotice} />}{notice && <GuidanceModal title="Print order planned" message={notice} onClose={() => setNotice(null)} />}</Shell>
}

export function SalesAnalysisScreen({ active, onNavigate, data = useCoordinatorData() }: PageProps & { data?: CoordinatorData }) {
  const totalRevenue = revenue(data)
  const totalBooks = booksSold(data)
  const avg = data.sales.length ? totalRevenue / data.sales.length : 0
  const top = topSelling(data)
  return (
    <Shell active={active} onNavigate={onNavigate} role="coordinator" title="Sales Analysis">
      <LiveError error={data.error} />
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-blue-950">Sales Analysis</h1>
          <p className="mt-1 text-sm text-slate-500">All figures are calculated from live sales records, sale items, and payment totals.</p>
        </div>
        <Button icon={Download} onClick={() => downloadCsv('coordinator-sales.csv', ['Invoice', 'Customer', 'Total', 'Status', 'Date'], data.sales.map((sale) => [sale.receiptNumber ?? sale.id, sale.customerName, sale.total, sale.status, sale.createdAt]))}>Export Sales</Button>
      </div>
      <div className="grid gap-6 md:grid-cols-4">
        <StatCard stat={{ label: 'Total Revenue', value: money(totalRevenue), tone: 'green' }} />
        <StatCard stat={{ label: 'Books Distributed', value: totalBooks.toString(), tone: 'green' }} />
        <StatCard stat={{ label: 'Transactions', value: data.sales.length.toString(), icon: Users }} />
        <StatCard stat={{ label: 'Avg Order Value', value: money(avg), tone: 'green' }} />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <RevenuePerformanceCard sales={data.sales} />
        <TopSellingTitlesCard top={top} />
      </div>
      <RecentTransactionsCard sales={data.sales} />
    </Shell>
  )
}

export function ProductionOrdersScreen({ active, onNavigate, data = useCoordinatorData(), role = 'coordinator' }: PageProps & { data?: CoordinatorData; role?: RoleArea }) {
  const [notice, setNotice] = useState<string | null>(null)
  const [showPrintOrder, setShowPrintOrder] = useState(false)
  const [editingOrder, setEditingOrder] = useState<ProductionOrder | undefined>()
  const [deletingOrder, setDeletingOrder] = useState<ProductionOrder | null>(null)
  const [actionError, setActionError] = useState('')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProductionOrderStatus | 'ALL'>('ALL')
  const [page, setPage] = useState(1)
  const candidates = reprintCandidates(data.books)
  const activeOrders = data.orders.filter((order) => order.status !== 'CANCELLED')
  const openOrders = activeOrders.filter((order) => order.status !== 'RECEIVED')
  const saveNotice = (message: string) => { data.reload(); setNotice(message) }
  const filteredOrders = data.orders.filter((order) => {
    const term = query.trim().toLowerCase()
    const matchesQuery = !term || order.bookTitle.toLowerCase().includes(term) || order.printer.toLowerCase().includes(term) || order.id.toString().includes(term) || (order.createdByName ?? '').toLowerCase().includes(term)
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter
    return matchesQuery && matchesStatus
  })
  const visibleOrders = paginate(filteredOrders, page, 10)

  const changeOrderStatus = async (order: ProductionOrder, status: ProductionOrderStatus) => {
    setActionError('')
    try {
      await updateProductionOrder(order.id, {
        quantity: order.quantity,
        printer: order.printer,
        expectedDeliveryDate: order.expectedDeliveryDate ?? undefined,
        notes: order.notes ?? undefined,
        estimatedCost: order.estimatedCost,
        status,
      })
      data.reload()
      setNotice(`Production order #PO-${order.id.toString().padStart(4, '0')} was ${status === 'RECEIVED' ? 'received into stock' : 'approved'}.`)
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to update production order.')
    }
  }

  const cancelOrder = async (order: ProductionOrder) => {
    setActionError('')
    try {
      await cancelProductionOrder(order.id)
      data.reload()
      setNotice(`Production order #PO-${order.id.toString().padStart(4, '0')} was cancelled.`)
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to cancel production order.')
    }
  }

  const removeOrder = async () => {
    if (!deletingOrder) return
    setActionError('')
    try {
      await deleteProductionOrder(deletingOrder.id)
      setDeletingOrder(null)
      data.reload()
      setNotice('Production order deleted.')
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to delete production order.')
    }
  }

  return <Shell active={active} onNavigate={onNavigate} role={role} title="Production Orders"><div className="mb-6 flex justify-between"><h1 className="text-xl font-bold">Production Orders</h1><Button icon={Plus} onClick={() => { setEditingOrder(undefined); setShowPrintOrder(true) }}>Create New Order</Button></div>{actionError && <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{actionError}</p>}<div className="grid gap-6 md:grid-cols-4"><StatCard stat={{ label: 'Suggested Orders', value: candidates.length.toString() }} /><StatCard stat={{ label: 'Open Orders', value: openOrders.length.toString() }} /><StatCard stat={{ label: 'Pending Approval', value: data.orders.filter((order) => order.status === 'PLANNED').length.toString(), tone: 'orange' }} /><StatCard stat={{ label: 'Committed Budget', value: money(openOrders.reduce((sum, order) => sum + order.estimatedCost, 0)) }} /></div><Card className="mt-6 p-5"><div className="mb-5 grid gap-3 md:grid-cols-[1fr_220px_120px]"><input className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100" placeholder="Search order, book, printer, or owner" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} /><select className="h-10 rounded-md border border-slate-200 px-3 text-sm" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value as ProductionOrderStatus | 'ALL'); setPage(1) }}><option value="ALL">All Statuses</option><option value="PLANNED">Planned</option><option value="APPROVED">Approved</option><option value="IN_PROGRESS">In Progress</option><option value="RECEIVED">Received</option><option value="CANCELLED">Cancelled</option></select><span className="self-center text-sm text-slate-500">Showing <strong className="text-slate-900">{filteredOrders.length}</strong></span></div><SimpleTable headers={['Order ID', 'Book Details', 'Quantity', 'Printer', 'Est. Delivery', 'Cost', 'Owner', 'Progress', 'Status', 'Actions']} rows={visibleOrders.map((order) => [`#PO-${order.id.toString().padStart(4, '0')}`, order.bookTitle, order.quantity.toLocaleString(), order.printer, order.expectedDeliveryDate ?? 'TBD', money(order.estimatedCost), order.createdByName ?? 'Coordinator', <Progress label="" value={orderStatusLabel(order.status)} width={orderProgress(order.status)} color={order.status === 'CANCELLED' ? 'bg-red-500' : 'bg-blue-600'} />, <Badge tone={orderTone(order.status)}>{orderStatusLabel(order.status)}</Badge>, <div className="flex flex-wrap gap-2">{order.status === 'PLANNED' && <button className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold text-green-700 transition hover:bg-green-50" onClick={() => changeOrderStatus(order, 'APPROVED')} type="button" aria-label={`Approve order ${order.id}`}><CheckCircle className="size-4" />Approve</button>}{(order.status === 'APPROVED' || order.status === 'IN_PROGRESS') && <button className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-50" onClick={() => changeOrderStatus(order, 'RECEIVED')} type="button" aria-label={`Receive order ${order.id}`}><PackageCheck className="size-4" />Receive</button>}<button className="rounded p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600" onClick={() => { setEditingOrder(order); setShowPrintOrder(true) }} type="button" aria-label={`Edit order ${order.id}`}><Edit3 className="size-4" /></button>{order.status !== 'CANCELLED' && order.status !== 'RECEIVED' && <button className="rounded p-2 text-orange-400 transition hover:bg-orange-50 hover:text-orange-600" onClick={() => cancelOrder(order)} type="button" aria-label={`Cancel order ${order.id}`}><XCircle className="size-4" /></button>}<button className="rounded p-2 text-red-400 transition hover:bg-red-50 hover:text-red-600" onClick={() => setDeletingOrder(order)} type="button" aria-label={`Delete order ${order.id}`}><Trash2 className="size-4" /></button></div>])} /><Pagination page={page} pageSize={10} total={filteredOrders.length} onPageChange={setPage} /></Card>{showPrintOrder && <PrintOrderModal books={data.books} order={editingOrder} onClose={() => { setShowPrintOrder(false); setEditingOrder(undefined) }} onSaved={saveNotice} />}{deletingOrder && <Modal title="Delete production order?" onClose={() => { setDeletingOrder(null); setActionError('') }} footer={<><Button variant="secondary" onClick={() => { setDeletingOrder(null); setActionError('') }}>Cancel</Button><Button variant="danger" icon={Trash2} onClick={removeOrder}>Delete Order</Button></>}>{actionError && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{actionError}</p>}<p className="text-sm leading-6 text-slate-600">This removes <strong>#PO-{deletingOrder.id.toString().padStart(4, '0')}</strong> for <strong>{deletingOrder.bookTitle}</strong>. Received orders are protected by the backend and cannot be deleted.</p></Modal>}{notice && <GuidanceModal title="Production order updated" message={notice} onClose={() => setNotice(null)} />}</Shell>
}

export function BudgetTrackingScreen({ active, onNavigate, data = useCoordinatorData(), role = 'coordinator' }: PageProps & { data?: CoordinatorData; role?: RoleArea }) {
  const activeOrders = data.orders.filter((order) => order.status !== 'CANCELLED')
  const planned = activeOrders.filter((order) => order.status === 'PLANNED').reduce((sum, order) => sum + order.estimatedCost, 0)
  const committed = activeOrders.filter((order) => order.status === 'APPROVED' || order.status === 'IN_PROGRESS').reduce((sum, order) => sum + order.estimatedCost, 0)
  const spent = activeOrders.filter((order) => order.status === 'RECEIVED').reduce((sum, order) => sum + order.estimatedCost, 0)
  const cancelled = data.orders.filter((order) => order.status === 'CANCELLED').reduce((sum, order) => sum + order.estimatedCost, 0)
  const controlledBudget = planned + committed + spent
  const utilization = controlledBudget > 0 ? Math.round((spent / controlledBudget) * 100) : 0
  const report = { title: 'Production Budget Report', subtitle: 'Actual production-order costs grouped by approval and receiving status.', filename: 'production-budget-report', metrics: [{ label: 'Planned Requests', value: money(planned) }, { label: 'Approved Commitments', value: money(committed) }, { label: 'Received / Spent', value: money(spent) }, { label: 'Cancelled Value', value: money(cancelled) }, { label: 'Received Share', value: `${utilization}%` }], tables: [{ title: 'Production Order Costs', headers: ['Order', 'Title', 'Units', 'Printer', 'Estimated Cost', 'Owner', 'Status'], rows: data.orders.map((order) => [`#PO-${order.id.toString().padStart(4, '0')}`, order.bookTitle, order.quantity.toLocaleString(), order.printer, money(order.estimatedCost), order.createdByName ?? 'Coordinator', orderStatusLabel(order.status)]) }] }
  return <Shell active={active} onNavigate={onNavigate} role={role} title="Production Budget"><div className="mb-6 flex justify-between"><h1 className="text-xl font-bold">Production Budget</h1><Button variant="secondary" icon={Download} onClick={() => exportReportPdf(report)}>Export Report</Button></div><LiveError error={data.error} /><div className="grid gap-6 md:grid-cols-4"><StatCard stat={{ label: 'Planned Requests', value: money(planned), tone: 'orange' }} /><StatCard stat={{ label: 'Approved Commitments', value: money(committed) }} /><StatCard stat={{ label: 'Received / Spent', value: money(spent), tone: 'blue' }} /><StatCard stat={{ label: 'Received Share', value: `${utilization}%`, tone: 'green' }} /></div><Card className="mt-6 p-5"><h2 className="mb-5 font-bold">Budget by Production Order</h2>{data.orders.length ? <SimpleTable headers={['Order', 'Title', 'Units', 'Printer', 'Estimated Cost', 'Owner', 'Status']} rows={data.orders.map((order) => [`#PO-${order.id.toString().padStart(4, '0')}`, order.bookTitle, order.quantity.toLocaleString(), order.printer, money(order.estimatedCost), order.createdByName ?? 'Coordinator', <Badge tone={orderTone(order.status)}>{orderStatusLabel(order.status)}</Badge>])} /> : <div className="rounded-md border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No production budget records yet. Budget lines appear after a production order is created.</div>}</Card><Card className="mt-6 p-5"><h2 className="mb-5 font-bold">Cost Control Summary</h2><SimpleTable headers={['Status', 'Orders', 'Total Cost']} rows={['PLANNED', 'APPROVED', 'IN_PROGRESS', 'RECEIVED', 'CANCELLED'].map((status) => { const orders = data.orders.filter((order) => order.status === status); return [orderStatusLabel(status as ProductionOrderStatus), orders.length.toString(), money(orders.reduce((sum, order) => sum + order.estimatedCost, 0))] })} /></Card></Shell>
}

export function CoordinatorReportsScreen({ active, onNavigate, data = useCoordinatorData() }: PageProps & { data?: CoordinatorData }) {
  const stockValue = data.books.reduce((sum, book) => sum + book.price * book.stockQuantity, 0)
  const candidates = reprintCandidates(data.books)
  const customerCount = new Set(data.sales.map((sale) => sale.customerName)).size
  const generated = new Date().toLocaleString()
  const report = {
    title: 'Coordinator Reports & Analytics',
    subtitle: 'Sales, inventory valuation, production needs, and customer activity from live publishing records.',
    filename: 'coordinator-reports-analytics',
    metrics: [
      { label: 'Sales Summary', value: money(revenue(data)), helper: `${data.sales.length} transaction(s)` },
      { label: 'Inventory Valuation', value: money(stockValue), helper: `${data.books.length} title(s)` },
      { label: 'Production Needs', value: candidates.length, helper: 'Suggested reprint order(s)' },
      { label: 'Customer Activity', value: customerCount, helper: 'Customer entities' },
    ],
    tables: [
      {
        title: 'Generated Reports',
        headers: ['Report Name', 'Type', 'Records', 'Generated'],
        rows: [[ 'Sales Summary', 'Sales', data.sales.length, generated ], [ 'Inventory Valuation', 'Inventory', data.books.length, generated ], [ 'Reprint Plan', 'Production', candidates.length, generated ]],
      },
      {
        title: 'Suggested Reprint Plan',
        headers: ['Book', 'Current Stock', 'Reorder Level', 'Suggested Qty', 'Estimated Cost'],
        rows: candidates.map((book) => [book.title, book.stockQuantity, book.reorderLevel, Math.max(book.reorderLevel * 5 - book.stockQuantity, 0), money(Math.max(book.reorderLevel * 5 - book.stockQuantity, 0) * book.price)]),
      },
      {
        title: 'Recent Sales',
        headers: ['Invoice', 'Customer', 'Amount', 'Status', 'Date'],
        rows: data.sales.slice(0, 20).map((sale) => [`#${sale.id}`, sale.customerName, money(sale.total), sale.status, new Date(sale.createdAt).toLocaleString()]),
      },
    ],
  }

  return <Shell active={active} onNavigate={onNavigate} role="coordinator" title="Reports"><div className="mb-6 flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-bold text-blue-950">Reports & Analytics</h1><p className="text-slate-500">Generated from live sales and inventory records.</p></div><div className="flex gap-3"><Button variant="secondary" icon={Upload} onClick={() => downloadReportCsv(report)}>CSV</Button><Button icon={Upload} onClick={() => exportReportPdf(report)}>PDF</Button></div></div><div className="grid gap-5 md:grid-cols-4"><Card className="p-6"><BarChart3 className="size-8 text-blue-600" /><h3 className="mt-5 font-bold">Sales Summary</h3><p className="mt-2 text-sm text-slate-500">{data.sales.length} transactions, {money(revenue(data))} revenue.</p></Card><Card className="p-6"><Package className="size-8 text-blue-600" /><h3 className="mt-5 font-bold">Inventory Valuation</h3><p className="mt-2 text-sm text-slate-500">{data.books.length} titles, {money(stockValue)} stock value.</p></Card><Card className="p-6"><Printer className="size-8 text-blue-600" /><h3 className="mt-5 font-bold">Production Costs</h3><p className="mt-2 text-sm text-slate-500">{candidates.length} suggested reprint order(s).</p></Card><Card className="p-6"><Users className="size-8 text-blue-600" /><h3 className="mt-5 font-bold">Customer Activity</h3><p className="mt-2 text-sm text-slate-500">{customerCount} customer entities in recent sales.</p></Card></div><Card className="mt-6 p-5"><SimpleTable headers={['Report Name', 'Type', 'Records', 'Generated']} rows={[[ 'Sales Summary', 'Sales', data.sales.length.toString(), generated ], [ 'Inventory Valuation', 'Inventory', data.books.length.toString(), generated ], [ 'Reprint Plan', 'Production', candidates.length.toString(), generated ]]} /></Card></Shell>
}

export function CoordinatorDashboard(props: PageProps) {
  const data = useCoordinatorData()
  if (props.active === 'coordinator-reprint') return <ReprintPlanningScreen {...props} data={data} />
  if (props.active === 'coordinator-sales') return <SalesAnalysisScreen {...props} data={data} />
  if (props.active === 'coordinator-production') return <ProductionOrdersScreen {...props} data={data} />
  if (props.active === 'coordinator-budget') return <BudgetTrackingScreen {...props} data={data} />
  if (props.active === 'coordinator-reports') return <CoordinatorReportsScreen {...props} data={data} />
  return <CoordinatorDashboardScreen {...props} data={data} />
}

