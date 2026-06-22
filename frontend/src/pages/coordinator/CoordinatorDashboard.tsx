import { BarChart3, Calendar, Download, Filter, Gauge, Package, Plus, Printer, Upload, Users, WalletCards, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Shell } from '../../components/layout'
import { Badge, Button, Card, Modal, Progress, SimpleTable, StatCard } from '../../components/ui'
import { downloadCsv, printCurrentPage } from '../../lib/actions'
import { listBooks, listSales, money } from '../../lib/api'
import type { Book, Sale } from '../../lib/api'
import type { PageProps } from '../../types/navigation'

type CoordinatorData = {
  books: Book[]
  sales: Sale[]
  error: string
}

function useCoordinatorData(): CoordinatorData {
  const [books, setBooks] = useState<Book[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    setError('')
    Promise.all([listBooks(), listSales()])
      .then(([books, sales]) => { setBooks(books); setSales(sales) })
      .catch((error) => setError(error instanceof Error ? error.message : 'Unable to load coordinator data.'))
  }, [])

  return { books, sales, error }
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

function LiveError({ error }: { error: string }) {
  return error ? <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null
}

function GuidanceModal({ title, message, onClose }: { title: string; message: string; onClose: () => void }) {
  return <Modal title={title} onClose={onClose} footer={<Button onClick={onClose}>Done</Button>}><p className="text-sm leading-6 text-slate-600">{message}</p></Modal>
}

function PrintOrderModal({ books, onClose, onCreated }: { books: Book[]; onClose: () => void; onCreated: (message: string) => void }) {
  const first = books[0]
  const [bookId, setBookId] = useState(first?.id.toString() ?? '')
  const selectedBook = books.find((book) => book.id === Number(bookId)) ?? first
  const suggested = selectedBook ? Math.max(selectedBook.reorderLevel * 5 - selectedBook.stockQuantity, 0) : 0
  const [quantity, setQuantity] = useState(suggested.toString())
  const [printer, setPrinter] = useState('Kigali Print Press')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setQuantity(suggested.toString())
  }, [suggested])

  const submit = () => {
    const qty = Number(quantity)
    if (!selectedBook) {
      setError('Select a title before creating the print order.')
      return
    }
    if (!Number.isFinite(qty) || qty <= 0) {
      setError('Enter a print quantity greater than zero.')
      return
    }
    if (!printer.trim()) {
      setError('Add the printer or production partner responsible for this order.')
      return
    }
    onCreated(`${selectedBook.title} is planned for ${qty.toLocaleString()} copies with ${printer}. ${deliveryDate ? `Expected delivery: ${deliveryDate}.` : 'Add a delivery date when the printer confirms the schedule.'}${notes ? ` Notes: ${notes}` : ''}`)
    onClose()
  }

  return (
    <Modal title="Create print order" onClose={onClose} size="lg" footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={submit}>Create Order</Button></>}>
      {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2"><span className="mb-2 block text-sm font-medium">Title</span><select className="h-10 w-full rounded-md border border-slate-200 px-3" value={bookId} onChange={(event) => setBookId(event.target.value)}>{books.map((book) => <option key={book.id} value={book.id}>{book.title}</option>)}</select></label>
        <label><span className="mb-2 block text-sm font-medium">Print Quantity</span><input className="h-10 w-full rounded-md border border-slate-200 px-3" inputMode="numeric" value={quantity} onChange={(event) => setQuantity(event.target.value)} /></label>
        <label><span className="mb-2 block text-sm font-medium">Printer</span><input className="h-10 w-full rounded-md border border-slate-200 px-3" value={printer} onChange={(event) => setPrinter(event.target.value)} /></label>
        <label><span className="mb-2 block text-sm font-medium">Expected Delivery</span><input className="h-10 w-full rounded-md border border-slate-200 px-3" type="date" value={deliveryDate} onChange={(event) => setDeliveryDate(event.target.value)} /></label>
        <label><span className="mb-2 block text-sm font-medium">Notes</span><input className="h-10 w-full rounded-md border border-slate-200 px-3" value={notes} onChange={(event) => setNotes(event.target.value)} /></label>
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
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_300px]"><div className="grid gap-6 lg:grid-cols-3"><Card className="p-5"><h2 className="font-bold">Sales by Category</h2><div className="mt-12"><Bars values={data.books.slice(0, 5).map((book) => book.stockQuantity)} labels={data.books.slice(0, 5).map((book) => book.category.slice(0, 8))} /></div></Card><Card className="p-5"><h2 className="font-bold">Reprint Forecast</h2><div className="mt-8"><SimpleTable headers={['Title', 'Stock', 'Status']} rows={candidates.slice(0, 4).map((book) => [book.title, book.stockQuantity.toString(), <Badge tone={statusTone(book.status)}>{bookStatusLabel(book.status)}</Badge>])} /></div></Card><Card className="grid place-items-center p-5 text-center"><h2 className="self-start justify-self-start font-bold">Inventory Status</h2><div><p className="text-3xl font-bold">{healthy}%</p><p className="text-xs text-slate-500">Healthy titles</p></div></Card></div><aside className="space-y-6"><ReprintCalculator books={data.books} onPlan={setNotice} /><Card className="p-5"><h2 className="font-bold">Recent Sales</h2>{data.sales.slice(0, 4).map((sale) => <p className="mt-4 text-sm" key={sale.id}><strong>#{sale.id}</strong><span className="float-right">{money(sale.total)}</span><span className="block text-slate-500">{sale.customerName}</span></p>)}</Card></aside></div>
      <ReprintTable books={candidates} />
      {notice && <GuidanceModal title="Production order guidance" message={notice} onClose={() => setNotice(null)} />}
    </Shell>
  )
}

function ReprintCalculator({ books, onPlan }: { books: Book[]; onPlan: (message: string) => void }) {
  const first = reprintCandidates(books)[0] ?? books[0]
  const suggested = first ? Math.max(first.reorderLevel * 5 - first.stockQuantity, 0) : 0
  return <Card className="p-5"><h2 className="mb-6 font-bold">Reprint Calculator</h2><label className="text-sm font-medium">Book Title<input className="mt-2 h-9 w-full rounded-md border border-slate-200 px-3 text-sm" value={first?.title ?? ''} readOnly /></label><div className="mt-4 grid grid-cols-2 gap-3"><label className="text-sm font-medium">Current Stock<input className="mt-2 h-9 w-full rounded-md border border-slate-200 px-3 text-sm" value={first?.stockQuantity ?? 0} readOnly /></label><label className="text-sm font-medium">Min Level<input className="mt-2 h-9 w-full rounded-md border border-slate-200 px-3 text-sm" value={first?.reorderLevel ?? 0} readOnly /></label></div><label className="mt-4 block text-sm font-medium text-blue-600">Suggested Reprint<input className="mt-2 h-9 w-full rounded-md border border-slate-200 px-3 text-sm font-bold text-slate-900" value={`${suggested} Units`} readOnly /></label><Button className="mt-4 w-full" onClick={() => onPlan(`Production order prepared for ${first?.title ?? 'the selected title'}. Review quantity, assign a printer, and confirm the expected delivery date before approval.`)}>Create Production Order</Button></Card>
}

function ReprintTable({ books }: { books: Book[] }) {
  return <Card className="mt-6 overflow-hidden"><div className="flex items-center justify-between p-5"><h2 className="font-bold">Reprint Planning</h2><Button variant="secondary" icon={Download} onClick={() => downloadCsv('coordinator-reprints.csv', ['Book', 'Current Stock', 'Reorder Level', 'Suggested Qty', 'Status'], books.map((book) => [book.title, book.stockQuantity, book.reorderLevel, Math.max(book.reorderLevel * 5 - book.stockQuantity, 0), book.status]))}>Export</Button></div><SimpleTable headers={['Book Title', 'Current Stock', 'Min Level', 'Rec. Qty', 'Est. Cost', 'Status']} rows={books.map((book) => [book.title, book.stockQuantity.toString(), book.reorderLevel.toString(), Math.max(book.reorderLevel * 5 - book.stockQuantity, 0).toString(), money(Math.max(book.reorderLevel * 5 - book.stockQuantity, 0) * book.price), <Badge tone={statusTone(book.status)}>{bookStatusLabel(book.status)}</Badge>])} /></Card>
}

export function ReprintPlanningScreen({ active, onNavigate, data = useCoordinatorData() }: PageProps & { data?: CoordinatorData }) {
  const [notice, setNotice] = useState<string | null>(null)
  const [showPrintOrder, setShowPrintOrder] = useState(false)
  const candidates = reprintCandidates(data.books)
  return <Shell active={active} onNavigate={onNavigate} role="coordinator" title="Reprint Planning"><LiveError error={data.error} /><div className="mb-6 flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-2xl font-bold text-blue-950">Publishing & Reprint Planning</h1><p className="mt-2 text-slate-500">Live stock depletion and suggested reprint quantities.</p></div><Button icon={Plus} onClick={() => setShowPrintOrder(true)}>New Print Order</Button></div><div className="grid gap-5 md:grid-cols-4"><StatCard stat={{ label: 'Reprint Recommendations', value: candidates.length.toString(), tone: 'red' }} /><StatCard stat={{ label: 'Critical Titles', value: candidates.filter((book) => book.status === 'OUT_OF_STOCK').length.toString(), tone: 'red', icon: Printer }} /><StatCard stat={{ label: 'Est. Units', value: candidates.reduce((sum, book) => sum + Math.max(book.reorderLevel * 5 - book.stockQuantity, 0), 0).toString(), icon: Package }} /><StatCard stat={{ label: 'Est. Cost', value: money(candidates.reduce((sum, book) => sum + Math.max(book.reorderLevel * 5 - book.stockQuantity, 0) * book.price, 0)), icon: WalletCards }} /></div><ReprintTable books={candidates} />{showPrintOrder && <PrintOrderModal books={candidates.length ? candidates : data.books} onClose={() => setShowPrintOrder(false)} onCreated={setNotice} />}{notice && <GuidanceModal title="Print order planned" message={notice} onClose={() => setNotice(null)} />}</Shell>
}

export function SalesAnalysisScreen({ active, onNavigate, data = useCoordinatorData() }: PageProps & { data?: CoordinatorData }) {
  const totalRevenue = revenue(data)
  const totalBooks = booksSold(data)
  const avg = data.sales.length ? totalRevenue / data.sales.length : 0
  const top = topSelling(data)
  return <Shell active={active} onNavigate={onNavigate} role="coordinator" title="Sales Analysis"><LiveError error={data.error} /><div className="mb-6 flex justify-between"><h1 className="text-xl font-bold">Sales Analysis</h1><div className="flex gap-3"><Button variant="secondary" icon={Calendar}>Live Range</Button><Button variant="secondary" icon={Filter}>Filter</Button><Button icon={Download} onClick={() => downloadCsv('coordinator-sales.csv', ['Invoice', 'Customer', 'Total', 'Status', 'Date'], data.sales.map((sale) => [sale.id, sale.customerName, sale.total, sale.status, sale.createdAt]))}>Export Report</Button></div></div><div className="grid gap-6 md:grid-cols-4"><StatCard stat={{ label: 'Total Revenue', value: money(totalRevenue), tone: 'green' }} /><StatCard stat={{ label: 'Books Distributed', value: totalBooks.toString(), tone: 'green' }} /><StatCard stat={{ label: 'Transactions', value: data.sales.length.toString(), icon: Users }} /><StatCard stat={{ label: 'Avg Order Value', value: money(avg), tone: 'green' }} /></div><div className="mt-6 grid gap-6 xl:grid-cols-[1fr_280px]"><Card className="p-5"><h2 className="font-bold">Revenue Performance</h2><div className="mt-8"><Bars values={data.sales.map((sale) => sale.total)} labels={data.sales.map((sale) => `#${sale.id}`)} /></div></Card><Card className="p-5"><h2 className="font-bold">Top Selling Titles</h2>{top.slice(0, 5).map(([title, count], index) => <div className="mt-5 flex gap-3" key={title}><span className="grid size-6 place-items-center rounded-full bg-slate-100 text-xs">{index + 1}</span><div className="flex-1"><p className="font-semibold leading-tight">{title}<strong className="float-right">{count}</strong></p><Progress label="" value={String(count)} width={Math.min(count * 10, 100)} color="bg-blue-600" /></div></div>)}</Card></div><Card className="mt-6 p-5"><h2 className="mb-4 font-bold">Recent Transactions</h2><SimpleTable headers={['Order ID', 'Entity / Customer', 'Date', 'Items', 'Amount', 'Status']} rows={data.sales.map((sale) => [`#ORD-${sale.id}`, sale.customerName, new Date(sale.createdAt).toLocaleString(), sale.items.reduce((sum, item) => sum + item.quantity, 0).toString(), money(sale.total), <Badge tone="green">{sale.status}</Badge>])} /></Card></Shell>
}

export function ProductionOrdersScreen({ active, onNavigate, data = useCoordinatorData() }: PageProps & { data?: CoordinatorData }) {
  const [notice, setNotice] = useState<string | null>(null)
  const [showPrintOrder, setShowPrintOrder] = useState(false)
  const candidates = reprintCandidates(data.books)
  return <Shell active={active} onNavigate={onNavigate} role="coordinator" title="Production Orders"><div className="mb-6 flex justify-between"><h1 className="text-xl font-bold">Production Orders</h1><Button icon={Plus} onClick={() => setShowPrintOrder(true)}>Create New Order</Button></div><div className="grid gap-6 md:grid-cols-4"><StatCard stat={{ label: 'Suggested Orders', value: candidates.length.toString() }} /><StatCard stat={{ label: 'Books Needed', value: candidates.reduce((sum, book) => sum + Math.max(book.reorderLevel * 5 - book.stockQuantity, 0), 0).toString() }} /><StatCard stat={{ label: 'Pending Approval', value: candidates.filter((book) => book.status !== 'IN_STOCK').length.toString(), tone: 'orange' }} /><StatCard stat={{ label: 'Budget Estimate', value: money(candidates.reduce((sum, book) => sum + Math.max(book.reorderLevel * 5 - book.stockQuantity, 0) * book.price, 0)) }} /></div><Card className="mt-6 p-5"><SimpleTable headers={['Order ID', 'Book Details', 'Quantity', 'Printer', 'Est. Delivery', 'Cost', 'Progress', 'Status']} rows={candidates.map((book) => [`#PO-${book.id.toString().padStart(4, '0')}`, book.title, Math.max(book.reorderLevel * 5 - book.stockQuantity, 0).toString(), 'Pending assignment', 'TBD', money(Math.max(book.reorderLevel * 5 - book.stockQuantity, 0) * book.price), <Progress label="" value="Planned" width={20} color="bg-blue-600" />, <Badge tone={statusTone(book.status)}>{bookStatusLabel(book.status)}</Badge>])} /></Card>{showPrintOrder && <PrintOrderModal books={candidates.length ? candidates : data.books} onClose={() => setShowPrintOrder(false)} onCreated={setNotice} />}{notice && <GuidanceModal title="Production order created" message={notice} onClose={() => setNotice(null)} />}</Shell>
}

export function BudgetTrackingScreen({ active, onNavigate, data = useCoordinatorData() }: PageProps & { data?: CoordinatorData }) {
  const candidates = reprintCandidates(data.books)
  const committed = candidates.reduce((sum, book) => sum + Math.max(book.reorderLevel * 5 - book.stockQuantity, 0) * book.price, 0)
  const annual = Math.max(committed * 2, 1)
  return <Shell active={active} onNavigate={onNavigate} role="coordinator" title="Budget Tracking"><div className="mb-6 flex justify-between"><h1 className="text-xl font-bold">Budget Tracking</h1><Button variant="secondary" icon={Download} onClick={printCurrentPage}>Export Report</Button></div><div className="grid gap-6 md:grid-cols-4"><StatCard stat={{ label: 'Projected Budget', value: money(annual), tone: 'green' }} /><StatCard stat={{ label: 'Committed Funds', value: money(committed) }} /><StatCard stat={{ label: 'Available Remaining', value: money(Math.max(annual - committed, 0)), tone: 'orange' }} /><StatCard stat={{ label: 'Utilization', value: `${Math.round((committed / annual) * 100)}%` }} /></div><Card className="mt-6 p-5"><h2 className="mb-5 font-bold">Budget by Reprint Candidate</h2><SimpleTable headers={['Title', 'Suggested Units', 'Unit Cost', 'Estimated Cost', 'Status']} rows={candidates.map((book) => { const qty = Math.max(book.reorderLevel * 5 - book.stockQuantity, 0); return [book.title, qty.toString(), money(book.price), money(qty * book.price), <Badge tone={statusTone(book.status)}>{bookStatusLabel(book.status)}</Badge>] })} /></Card></Shell>
}

export function CoordinatorReportsScreen({ active, onNavigate, data = useCoordinatorData() }: PageProps & { data?: CoordinatorData }) {
  return <Shell active={active} onNavigate={onNavigate} role="coordinator" title="Reports"><div className="mb-6 flex justify-between"><div><h1 className="text-2xl font-bold text-blue-950">Reports & Analytics</h1><p className="text-slate-500">Generated from live sales and inventory records.</p></div><Button icon={Upload} onClick={printCurrentPage}>Export Report</Button></div><div className="grid gap-5 md:grid-cols-4"><Card className="p-6"><BarChart3 className="size-8 text-blue-600" /><h3 className="mt-5 font-bold">Sales Summary</h3><p className="mt-2 text-sm text-slate-500">{data.sales.length} transactions, {money(revenue(data))} revenue.</p></Card><Card className="p-6"><Package className="size-8 text-blue-600" /><h3 className="mt-5 font-bold">Inventory Valuation</h3><p className="mt-2 text-sm text-slate-500">{data.books.length} titles, {money(data.books.reduce((sum, book) => sum + book.price * book.stockQuantity, 0))} stock value.</p></Card><Card className="p-6"><Printer className="size-8 text-blue-600" /><h3 className="mt-5 font-bold">Production Costs</h3><p className="mt-2 text-sm text-slate-500">{reprintCandidates(data.books).length} suggested reprint order(s).</p></Card><Card className="p-6"><Users className="size-8 text-blue-600" /><h3 className="mt-5 font-bold">Customer Activity</h3><p className="mt-2 text-sm text-slate-500">{new Set(data.sales.map((sale) => sale.customerName)).size} customer entities in recent sales.</p></Card></div><Card className="mt-6 p-5"><SimpleTable headers={['Report Name', 'Type', 'Records', 'Generated']} rows={[[ 'Sales Summary', 'Sales', data.sales.length.toString(), new Date().toLocaleString() ], [ 'Inventory Valuation', 'Inventory', data.books.length.toString(), new Date().toLocaleString() ], [ 'Reprint Plan', 'Production', reprintCandidates(data.books).length.toString(), new Date().toLocaleString() ]]} /></Card></Shell>
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

