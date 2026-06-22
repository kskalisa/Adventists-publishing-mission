import { AlertCircle, ArrowDown, ArrowUp, BookOpen, Calendar, Check, CircleX, ClipboardList, Download, Edit3, Eye, Grid2X2, MapPin, Package, Plus, Printer, RefreshCcw, Search, Shield, ShoppingCart, Trash2, TrendingUp } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { AddItemModal } from '../../components/forms'
import { Shell } from '../../components/layout'
import { Badge, Button, Card, Modal, Progress, SimpleTable, StatCard } from '../../components/ui'
import { downloadCsv, printCurrentPage } from '../../lib/actions'
import { createStockAdjustment, deleteBook, formatDate, getCurrentUser, listBooks, listSales, listStockAdjustments, money } from '../../lib/api'
import type { AdjustmentType, Book, Sale, StockAdjustment } from '../../lib/api'
import { coverImages, people } from '../../data/assets'
import type { PageProps } from '../../types/navigation'

type InventoryPage = 'dashboard' | 'inventory' | 'adjustments' | 'reprint' | 'report' | 'profile'
type AdjustmentFilter = 'ALL' | 'IN' | 'OUT' | AdjustmentType

type InventoryData = {
  books: Book[]
  sales: Sale[]
  adjustments: StockAdjustment[]
  error: string
  reload: () => void
}

const statusTone = { IN_STOCK: 'green', LOW_STOCK: 'orange', OUT_OF_STOCK: 'red' } as const
const adjustmentTone: Record<AdjustmentType, 'blue' | 'green' | 'orange' | 'red'> = {
  RECEIVE_SHIPMENT: 'green',
  REPRINT_RECEIVED: 'green',
  RETURN: 'blue',
  CORRECTION: 'orange',
  DAMAGE: 'red',
}

function useInventoryData(): InventoryData {
  const [books, setBooks] = useState<Book[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([])
  const [error, setError] = useState('')

  const reload = () => {
    setError('')
    Promise.all([listBooks(), listSales(), listStockAdjustments()])
      .then(([books, sales, adjustments]) => { setBooks(books); setSales(sales); setAdjustments(adjustments) })
      .catch((error) => setError(error instanceof Error ? error.message : 'Unable to load inventory data.'))
  }

  useEffect(reload, [])
  return { books, sales, adjustments, error, reload }
}

function bookStatusLabel(status: Book['status']) {
  return status === 'IN_STOCK' ? 'In Stock' : status === 'LOW_STOCK' ? 'Low Stock' : 'Out of Stock'
}

function adjustmentLabel(type: AdjustmentType) {
  return type.split('_').map((word) => word[0] + word.slice(1).toLowerCase()).join(' ')
}

function rowsForExport(books: Book[]) {
  return books.map((book) => [book.title, book.author, book.isbn, book.category, book.price, book.stockQuantity, book.reorderLevel, book.status])
}

function NoticeModal({ title, children, actionLabel = 'Done', onClose }: { title: string; children: React.ReactNode; actionLabel?: string; onClose: () => void }) {
  return <Modal title={title} onClose={onClose} footer={<Button onClick={onClose}>{actionLabel}</Button>}>{children}</Modal>
}

function BookDetailsModal({ book, onClose }: { book: Book; onClose: () => void }) {
  const suggested = Math.max(book.reorderLevel * 5 - book.stockQuantity, 0)
  return (
    <NoticeModal title="Book stock details" onClose={onClose}>
      <div className="flex gap-4">
        <img className="size-20 rounded-md object-cover" src={book.coverImageUrl ?? coverImages[book.id % coverImages.length]} alt="" />
        <div>
          <h3 className="text-lg font-bold text-blue-950">{book.title}</h3>
          <p className="text-sm text-slate-500">{book.author}</p>
          <p className="mt-2 font-mono text-xs text-slate-400">ISBN {book.isbn}</p>
        </div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Card className="p-4"><p className="text-xs text-slate-500">Current Stock</p><p className="mt-1 text-2xl font-bold text-blue-950">{book.stockQuantity}</p></Card>
        <Card className="p-4"><p className="text-xs text-slate-500">Reorder Level</p><p className="mt-1 text-2xl font-bold text-blue-950">{book.reorderLevel}</p></Card>
        <Card className="p-4"><p className="text-xs text-slate-500">Suggested Reprint</p><p className="mt-1 text-2xl font-bold text-blue-950">{suggested}</p></Card>
      </div>
      <p className="mt-5 rounded-md bg-slate-50 px-4 py-3 text-sm text-slate-600">Status is <strong>{bookStatusLabel(book.status)}</strong>. {suggested > 0 ? 'This title should be reviewed for replenishment before stock becomes critical.' : 'No immediate replenishment action is required.'}</p>
    </NoticeModal>
  )
}

function ReprintPlanModal({ book, onClose }: { book: Book; onClose: () => void }) {
  const suggested = Math.max(book.reorderLevel * 5 - book.stockQuantity, 0)
  return (
    <NoticeModal title="Reprint planning guidance" actionLabel="Close" onClose={onClose}>
      <h3 className="text-lg font-bold text-blue-950">{book.title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">Based on the current stock level of <strong>{book.stockQuantity}</strong> and reorder level of <strong>{book.reorderLevel}</strong>, plan approximately <strong>{suggested} units</strong>.</p>
      <p className="mt-4 rounded-md bg-blue-50 px-4 py-3 text-sm text-blue-800">Next step: create a stock adjustment when printed copies are received, or coordinate the production order from the Coordinator dashboard.</p>
    </NoticeModal>
  )
}

function InventoryTable({ books, limit, onView, onEdit, onDelete }: { books: Book[]; limit?: number; onView: (book: Book) => void; onEdit?: (book: Book) => void; onDelete?: (book: Book) => void }) {
  const visible = limit ? books.slice(0, limit) : books
  return (
    <SimpleTable
      headers={['Book', 'ISBN', 'Category', 'Qty', 'Min Level', 'Price', 'Status', 'Actions']}
      rows={visible.map((book, index) => [
        <div className="flex items-center gap-4"><img className="size-14 rounded object-cover" src={book.coverImageUrl ?? coverImages[index % coverImages.length]} alt="" /><div><p className="font-semibold text-blue-950">{book.title}</p><p className="text-xs text-slate-400">{book.author}</p></div></div>,
        <span className="font-mono text-xs text-slate-500">{book.isbn}</span>,
        book.category,
        book.stockQuantity.toLocaleString(),
        book.reorderLevel.toLocaleString(),
        money(book.price),
        <Badge tone={statusTone[book.status]}>{bookStatusLabel(book.status)}</Badge>,
        <div className="flex gap-2"><button className="rounded p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600" onClick={() => onView(book)} type="button" aria-label={`View ${book.title}`}><Eye className="size-4" /></button>{onEdit && <button className="rounded p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600" onClick={() => onEdit(book)} type="button" aria-label={`Edit ${book.title}`}><Edit3 className="size-4" /></button>}{onDelete && <button className="rounded p-2 text-red-400 transition hover:bg-red-50 hover:text-red-600" onClick={() => onDelete(book)} type="button" aria-label={`Delete ${book.title}`}><Trash2 className="size-4" /></button>}</div>,
      ])}
    />
  )
}

function MiniBarChart({ values }: { values: number[] }) {
  const safeValues = values.length ? values : [0, 0, 0, 0, 0, 0]
  const max = Math.max(...safeValues, 1)
  return <div className="flex h-40 items-end gap-3">{safeValues.slice(0, 7).map((value, index) => <div className="flex flex-1 flex-col items-center gap-2" key={`${value}-${index}`}><div className={`w-full rounded-t ${index === safeValues.length - 1 ? 'bg-blue-700' : 'bg-blue-300'}`} style={{ height: `${Math.max((value / max) * 100, 8)}%` }} /><span className="text-xs font-medium text-slate-500">{index + 1}</span></div>)}</div>
}

export function DashboardScreen({ active, onNavigate, data = useInventoryData() }: PageProps & { data?: InventoryData }) {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const lowStock = data.books.filter((book) => book.status === 'LOW_STOCK')
  const outOfStock = data.books.filter((book) => book.status === 'OUT_OF_STOCK')
  const reprintRequired = data.books.filter((book) => book.stockQuantity <= book.reorderLevel * 2)
  const salesByDay = data.sales.map((sale) => sale.total)

  return (
    <Shell active={active} onNavigate={onNavigate} role="inventory-manager">
      {data.error && <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{data.error}</p>}
      <div className="grid gap-6 md:grid-cols-4">
        <StatCard stat={{ label: 'Total Titles', value: data.books.length.toString(), icon: BookOpen }} />
        <StatCard stat={{ label: 'Low Stock', value: lowStock.length.toString(), icon: AlertCircle, tone: 'orange' }} />
        <StatCard stat={{ label: 'Out of Stock', value: outOfStock.length.toString(), icon: CircleX, tone: 'red' }} />
        <StatCard stat={{ label: 'Reprint Required', value: reprintRequired.length.toString(), icon: Printer, tone: 'blue' }} />
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_280px]">
        <Card className="p-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-xl font-bold text-blue-950">Book Inventory</h1><p className="text-sm text-slate-500">Live catalog and stock levels.</p></div><div className="flex gap-3"><Button variant="secondary" icon={Download} onClick={() => downloadCsv('inventory-manager-books.csv', ['Title', 'Author', 'ISBN', 'Category', 'Price', 'Stock', 'Reorder', 'Status'], rowsForExport(data.books))}>Export</Button></div></div>
          <InventoryTable books={data.books} limit={6} onView={setSelectedBook} />
        </Card>
        <aside className="space-y-6">
          <Card className="p-5"><h2 className="font-bold">Low Stock Alerts</h2>{lowStock.slice(0, 4).map((book) => <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm" key={book.id}><p className="font-semibold">{book.title}</p><p className="text-xs text-slate-500">{book.stockQuantity} remaining, min {book.reorderLevel}</p></div>)}<Button className="mt-4 w-full" variant="secondary" onClick={() => onNavigate('inventory-manager-reprint')}>View Reprint Alerts</Button></Card>
          <Card className="p-5"><h2 className="font-bold">Stock Movement</h2><div className="mt-6"><MiniBarChart values={data.adjustments.map((item) => Math.abs(item.quantityDelta))} /></div></Card>
          <Card className="p-5"><h2 className="font-bold">Recent Sales Impact</h2><div className="mt-6"><MiniBarChart values={salesByDay} /></div></Card>
        </aside>
      </div>
      {selectedBook && <BookDetailsModal book={selectedBook} onClose={() => setSelectedBook(null)} />}
    </Shell>
  )
}

export function BookInventoryScreen({ active, onNavigate, data = useInventoryData() }: PageProps & { data?: InventoryData }) {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [editingBook, setEditingBook] = useState<Book | undefined>()
  const [deletingBook, setDeletingBook] = useState<Book | null>(null)
  const [showBookModal, setShowBookModal] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const removeBook = async () => {
    if (!deletingBook) return
    setDeleteError('')
    try {
      await deleteBook(deletingBook.id)
      setDeletingBook(null)
      data.reload()
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Unable to delete book.')
    }
  }

  return (
    <Shell active={active} onNavigate={onNavigate} role="inventory-manager" title="Book Inventory">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-bold text-blue-950">Book Inventory</h1><div className="flex gap-3"><Button variant="secondary" icon={Grid2X2}>All Categories</Button><Button variant="secondary" icon={Download} onClick={() => downloadCsv('book-inventory.csv', ['Title', 'Author', 'ISBN', 'Category', 'Price', 'Stock', 'Reorder', 'Status'], rowsForExport(data.books))}>Export</Button><Button icon={Plus} onClick={() => { setEditingBook(undefined); setShowBookModal(true) }}>Add Book</Button></div></div>
      {data.error && <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{data.error}</p>}
      <Card className="p-5"><InventoryTable books={data.books} onView={setSelectedBook} onEdit={(book) => { setEditingBook(book); setShowBookModal(true) }} onDelete={setDeletingBook} /></Card>
      {selectedBook && <BookDetailsModal book={selectedBook} onClose={() => setSelectedBook(null)} />}
      {showBookModal && <AddItemModal book={editingBook} onClose={() => { setShowBookModal(false); setEditingBook(undefined) }} onCreated={data.reload} />}
      {deletingBook && <Modal title="Delete book?" onClose={() => { setDeletingBook(null); setDeleteError('') }} footer={<><Button variant="secondary" onClick={() => { setDeletingBook(null); setDeleteError('') }}>Cancel</Button><Button variant="danger" icon={Trash2} onClick={removeBook}>Delete Book</Button></>}>{deleteError && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{deleteError}</p>}<p className="text-sm leading-6 text-slate-600">This will permanently remove <strong className="text-blue-950">{deletingBook.title}</strong> from the catalog. If this book already appears in sales or stock history, deletion may be blocked to protect records.</p></Modal>}
    </Shell>
  )
}

function AdjustmentModal({ books, onClose, onCreated }: { books: Book[]; onClose: () => void; onCreated: () => void }) {
  const [bookId, setBookId] = useState(books[0]?.id.toString() ?? '')
  const [quantityDelta, setQuantityDelta] = useState('')
  const [type, setType] = useState<AdjustmentType>('CORRECTION')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const currentUser = getCurrentUser()
  const selectedBook = books.find((book) => book.id === Number(bookId))
  const quantity = Number(quantityDelta)
  const projectedStock = selectedBook ? selectedBook.stockQuantity + (Number.isFinite(quantity) ? quantity : 0) : 0

  const submit = async () => {
    setError('')
    if (!selectedBook) {
      setError('Choose the book that needs a stock update.')
      return
    }
    if (!Number.isFinite(quantity) || quantity === 0) {
      setError('Enter a non-zero quantity. Use a positive number for stock received and a negative number for stock removed.')
      return
    }
    if (projectedStock < 0) {
      setError('This adjustment would make stock negative. Reduce the quantity or review the current stock first.')
      return
    }

    setSaving(true)
    try {
      await createStockAdjustment({ bookId: selectedBook.id, adjustedById: currentUser?.id, type, quantityDelta: quantity, note })
      onCreated()
      onClose()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to create adjustment.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title="New Stock Adjustment" onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={submit}>{saving ? 'Saving...' : 'Save Adjustment'}</Button></>} size="lg">
      {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <label><span className="mb-2 block text-sm font-medium">Book</span><select className="h-10 w-full rounded-md border border-slate-200 px-3" value={bookId} onChange={(event) => setBookId(event.target.value)}>{books.map((book) => <option key={book.id} value={book.id}>{book.title}</option>)}</select></label>
        <label><span className="mb-2 block text-sm font-medium">Adjustment Type</span><select className="h-10 w-full rounded-md border border-slate-200 px-3" value={type} onChange={(event) => setType(event.target.value as AdjustmentType)}><option value="RECEIVE_SHIPMENT">Receive Shipment</option><option value="REPRINT_RECEIVED">Reprint Received</option><option value="RETURN">Customer Return</option><option value="CORRECTION">Stock Correction</option><option value="DAMAGE">Damage / Write-off</option></select></label>
        <label><span className="mb-2 block text-sm font-medium">Quantity Change</span><input className="h-10 w-full rounded-md border border-slate-200 px-3" inputMode="numeric" placeholder="Example: 50 or -8" value={quantityDelta} onChange={(event) => setQuantityDelta(event.target.value)} /></label>
        <label><span className="mb-2 block text-sm font-medium">Reason / Note</span><input className="h-10 w-full rounded-md border border-slate-200 px-3" placeholder="Shipment ref, stock count, damage note..." value={note} onChange={(event) => setNote(event.target.value)} /></label>
      </div>
      {selectedBook && <div className="mt-5 grid gap-3 rounded-md bg-slate-50 p-4 text-sm sm:grid-cols-3"><p><span className="block text-slate-500">Current Stock</span><strong className="text-blue-950">{selectedBook.stockQuantity}</strong></p><p><span className="block text-slate-500">Change</span><strong className={quantity < 0 ? 'text-red-600' : 'text-emerald-600'}>{Number.isFinite(quantity) ? quantity : 0}</strong></p><p><span className="block text-slate-500">Projected Stock</span><strong className="text-blue-950">{projectedStock}</strong></p></div>}
      <p className="mt-4 text-xs leading-5 text-slate-500">Positive quantities increase stock. Negative quantities reduce stock for damage, correction, or write-off cases.</p>
    </Modal>
  )
}

function EmptyAdjustments({ onCreate }: { onCreate: () => void }) {
  return <div className="grid place-items-center rounded-md border border-dashed border-slate-200 py-14 text-center"><ClipboardList className="size-10 text-slate-300" /><h3 className="mt-4 font-bold text-blue-950">No stock movements yet</h3><p className="mt-2 max-w-md text-sm text-slate-500">Create the first adjustment when books are received, corrected after a stock count, returned, or removed because of damage.</p><Button className="mt-5" icon={Plus} onClick={onCreate}>New Adjustment</Button></div>
}

export function AdjustmentsScreen({ active, onNavigate, data = useInventoryData() }: PageProps & { data?: InventoryData }) {
  const [showModal, setShowModal] = useState(false)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<AdjustmentFilter>('ALL')
  const stockIn = data.adjustments.filter((item) => item.quantityDelta > 0).reduce((sum, item) => sum + item.quantityDelta, 0)
  const stockOut = data.adjustments.filter((item) => item.quantityDelta < 0).reduce((sum, item) => sum + Math.abs(item.quantityDelta), 0)
  const damageCount = data.adjustments.filter((item) => item.type === 'DAMAGE').length
  const latestAdjustment = data.adjustments[0]
  const filteredAdjustments = useMemo(() => data.adjustments.filter((item) => {
    const matchesSearch = [item.bookTitle, item.note, item.adjustedByName, item.type].some((value) => value?.toLowerCase().includes(query.toLowerCase()))
    const matchesFilter = filter === 'ALL' || (filter === 'IN' ? item.quantityDelta > 0 : filter === 'OUT' ? item.quantityDelta < 0 : item.type === filter)
    return matchesSearch && matchesFilter
  }), [data.adjustments, filter, query])

  return (
    <Shell active={active} onNavigate={onNavigate} role="inventory-manager" title="Stock Adjustments">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-blue-950">Stock Adjustments</h1><p className="mt-1 text-sm text-slate-500">Track every manual stock movement from receiving, corrections, returns, and damages.</p></div>
        <div className="flex gap-3"><Button variant="secondary" icon={Download} onClick={() => downloadCsv('stock-adjustments.csv', ['Book', 'Type', 'Quantity', 'Note', 'By', 'Date'], filteredAdjustments.map((item) => [item.bookTitle, adjustmentLabel(item.type), item.quantityDelta, item.note, item.adjustedByName, item.createdAt]))}>Export Visible</Button><Button icon={Plus} onClick={() => setShowModal(true)}>New Adjustment</Button></div>
      </div>
      {data.error && <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{data.error}</p>}
      <div className="grid gap-6 md:grid-cols-4"><StatCard stat={{ label: 'Stock Added', value: `+${stockIn.toLocaleString()}`, tone: 'green', icon: ArrowUp }} /><StatCard stat={{ label: 'Stock Removed', value: `-${stockOut.toLocaleString()}`, tone: 'red', icon: ArrowDown }} /><StatCard stat={{ label: 'Damage Entries', value: damageCount.toString(), tone: 'orange', icon: AlertCircle }} /><StatCard stat={{ label: 'Total Adjustments', value: data.adjustments.length.toString(), tone: 'blue', icon: ClipboardList }} /></div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_300px]">
        <Card className="p-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold text-blue-950">Movement History</h2><div className="flex flex-wrap gap-2">{(['ALL', 'IN', 'OUT', 'RECEIVE_SHIPMENT', 'CORRECTION', 'DAMAGE'] as AdjustmentFilter[]).map((option) => <button className={`rounded-md px-3 py-2 text-sm font-medium transition ${filter === option ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`} key={option} onClick={() => setFilter(option)} type="button">{option === 'ALL' ? 'All' : option === 'IN' ? 'Stock In' : option === 'OUT' ? 'Stock Out' : adjustmentLabel(option)}</button>)}</div></div>
          <label className="mb-5 flex h-11 items-center gap-3 rounded-md border border-slate-200 px-3 text-sm text-slate-500"><Search className="size-4" /><input className="h-full flex-1 outline-none" placeholder="Search by book, reason, user, or type" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
          {filteredAdjustments.length ? <SimpleTable headers={['Ref', 'Date', 'Type', 'Book', 'Qty', 'Adjusted By', 'Note']} rows={filteredAdjustments.map((item) => [`ADJ-${item.id.toString().padStart(4, '0')}`, formatDate(item.createdAt), <Badge tone={adjustmentTone[item.type]}>{adjustmentLabel(item.type)}</Badge>, item.bookTitle, <strong className={item.quantityDelta < 0 ? 'text-red-600' : 'text-emerald-600'}>{item.quantityDelta > 0 ? `+${item.quantityDelta}` : item.quantityDelta}</strong>, item.adjustedByName ?? 'System', item.note ?? 'No note'])} /> : <EmptyAdjustments onCreate={() => setShowModal(true)} />}
        </Card>
        <aside className="space-y-6">
          <Card className="p-5"><h2 className="font-bold text-blue-950">Adjustment Meaning</h2><div className="mt-5 space-y-4 text-sm text-slate-600"><p><Badge tone="green">Receive</Badge><span className="ml-2">New stock entered from shipment or reprint.</span></p><p><Badge tone="orange">Correction</Badge><span className="ml-2">Physical count differs from system count.</span></p><p><Badge tone="red">Damage</Badge><span className="ml-2">Books removed from usable stock.</span></p><p><Badge tone="blue">Return</Badge><span className="ml-2">Books returned into inventory.</span></p></div></Card>
          <Card className="p-5"><h2 className="font-bold text-blue-950">Latest Movement</h2>{latestAdjustment ? <div className="mt-5 text-sm"><p className="font-semibold">{latestAdjustment.bookTitle}</p><p className="mt-2 text-slate-500">{adjustmentLabel(latestAdjustment.type)} by {latestAdjustment.adjustedByName ?? 'System'}</p><p className={`mt-4 text-2xl font-bold ${latestAdjustment.quantityDelta < 0 ? 'text-red-600' : 'text-emerald-600'}`}>{latestAdjustment.quantityDelta > 0 ? `+${latestAdjustment.quantityDelta}` : latestAdjustment.quantityDelta}</p><p className="mt-2 text-xs text-slate-400">{formatDate(latestAdjustment.createdAt)}</p></div> : <p className="mt-4 text-sm text-slate-500">No movement recorded yet.</p>}</Card>
          <Card className="p-5"><h2 className="font-bold text-blue-950">Operational Check</h2><p className="mt-4 text-sm leading-6 text-slate-600">Before saving a reduction, confirm the book title, physical count, and reason. This keeps reporting reliable for reprint planning and finance.</p></Card>
        </aside>
      </div>
      {showModal && <AdjustmentModal books={data.books} onClose={() => setShowModal(false)} onCreated={data.reload} />}
    </Shell>
  )
}

export function ReprintAlertsScreen({ active, onNavigate, data = useInventoryData() }: PageProps & { data?: InventoryData }) {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const recommended = data.books.filter((book) => book.stockQuantity <= book.reorderLevel * 2).sort((a, b) => a.stockQuantity - b.stockQuantity)
  return (
    <Shell active={active} onNavigate={onNavigate} role="inventory-manager" title="Reprint Alerts">
      <div className="grid gap-6 md:grid-cols-4"><StatCard stat={{ label: 'Reprint Recommendations', value: recommended.length.toString(), tone: 'red' }} /><StatCard stat={{ label: 'Critical Titles', value: recommended.filter((book) => book.stockQuantity <= book.reorderLevel).length.toString(), tone: 'orange' }} /><StatCard stat={{ label: 'Estimated Units', value: recommended.reduce((sum, book) => sum + Math.max(book.reorderLevel * 5 - book.stockQuantity, 0), 0).toString(), tone: 'blue' }} /><StatCard stat={{ label: 'Catalog Titles', value: data.books.length.toString() }} /></div>
      <Card className="mt-6 p-5"><div className="mb-5 flex items-center justify-between"><h1 className="text-xl font-bold">Recommended Reprints</h1><Button variant="secondary" icon={Download} onClick={() => downloadCsv('reprint-recommendations.csv', ['Title', 'Current Stock', 'Reorder Level', 'Suggested Qty', 'Status'], recommended.map((book) => [book.title, book.stockQuantity, book.reorderLevel, Math.max(book.reorderLevel * 5 - book.stockQuantity, 0), book.status]))}>Export List</Button></div><SimpleTable headers={['Book', 'Current Stock', 'Reorder Level', 'Suggested Qty', 'Status', 'Action']} rows={recommended.map((book) => [book.title, book.stockQuantity.toString(), book.reorderLevel.toString(), Math.max(book.reorderLevel * 5 - book.stockQuantity, 0).toString(), <Badge tone={statusTone[book.status]}>{bookStatusLabel(book.status)}</Badge>, <Button className="h-8 px-4" onClick={() => setSelectedBook(book)}>Plan</Button>])} /></Card>
      {selectedBook && <ReprintPlanModal book={selectedBook} onClose={() => setSelectedBook(null)} />}
    </Shell>
  )
}

export function ReportsScreen({ active, onNavigate, data = useInventoryData() }: PageProps & { data?: InventoryData }) {
  const revenue = data.sales.reduce((sum, sale) => sum + sale.total, 0)
  const booksSold = data.sales.reduce((sum, sale) => sum + sale.items.reduce((inner, item) => inner + item.quantity, 0), 0)
  const stockValue = data.books.reduce((sum, book) => sum + book.price * book.stockQuantity, 0)
  const categoryCounts = [...data.books.reduce((map, book) => map.set(book.category, (map.get(book.category) ?? 0) + 1), new Map<string, number>()).entries()]
  const lowStock = data.books.filter((book) => book.status === 'LOW_STOCK').length
  const outOfStock = data.books.filter((book) => book.status === 'OUT_OF_STOCK').length
  const healthyStock = data.books.length ? Math.round(((data.books.length - lowStock - outOfStock) / data.books.length) * 100) : 0
  const topTitles = [...data.sales.reduce((map, sale) => {
    sale.items.forEach((item) => map.set(item.title, (map.get(item.title) ?? 0) + item.quantity))
    return map
  }, new Map<string, number>()).entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)

  return (
    <Shell active={active} onNavigate={onNavigate} role="inventory-manager" title="Reports">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-bold text-blue-950">Inventory Reports</h1><p className="text-sm text-slate-500">Live stock health, sales impact, and movement summaries.</p></div><div className="flex gap-3"><Button variant="secondary" icon={Calendar}>Live Data</Button><Button icon={Download} onClick={printCurrentPage}>Export Report</Button></div></div>
      {data.error && <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{data.error}</p>}
      <div className="grid gap-6 md:grid-cols-4"><StatCard stat={{ label: 'Revenue Impact', value: money(revenue), icon: TrendingUp, tone: 'green', helper: `${data.sales.length} recent sale(s)` }} /><StatCard stat={{ label: 'Books Sold', value: booksSold.toString(), icon: Package, tone: 'blue', helper: 'Units leaving stock' }} /><StatCard stat={{ label: 'Stock Value', value: money(stockValue), icon: RefreshCcw, helper: `${data.books.length} catalog titles` }} /><StatCard stat={{ label: 'Healthy Stock', value: `${healthyStock}%`, icon: ShoppingCart, tone: healthyStock < 70 ? 'orange' : 'green', helper: `${lowStock + outOfStock} title(s) need attention` }} /></div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
        <Card className="p-6"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-bold text-blue-950">Sales Performance</h2><p className="text-sm text-slate-500">Recent transaction totals affecting inventory.</p></div><Badge tone="blue">{money(revenue)}</Badge></div><MiniBarChart values={data.sales.map((sale) => sale.total)} /></Card>
        <Card className="p-6"><h2 className="font-bold text-blue-950">Stock Health</h2><div className="mt-6 space-y-5"><Progress label="Healthy titles" value={`${healthyStock}%`} width={healthyStock} color="bg-emerald-600" /><Progress label="Low stock titles" value={`${lowStock}`} width={Math.min((lowStock / Math.max(data.books.length, 1)) * 100, 100)} color="bg-amber-500" /><Progress label="Out of stock titles" value={`${outOfStock}`} width={Math.min((outOfStock / Math.max(data.books.length, 1)) * 100, 100)} color="bg-red-500" /></div></Card>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
        <Card className="p-6"><h2 className="mb-5 font-bold text-blue-950">Recent Sales Impact</h2><SimpleTable headers={['Invoice', 'Customer', 'Units', 'Total', 'Date']} rows={data.sales.slice(0, 8).map((sale) => [`INV-${sale.id.toString().padStart(5, '0')}`, sale.customerName, sale.items.reduce((sum, item) => sum + item.quantity, 0).toString(), money(sale.total), formatDate(sale.createdAt)])} /></Card>
        <Card className="p-6"><h2 className="font-bold text-blue-950">Top Moving Titles</h2><div className="mt-5 space-y-4">{topTitles.length ? topTitles.map(([title, count]) => <Progress key={title} label={title} value={`${count} sold`} width={Math.min(count * 12, 100)} color="bg-blue-600" />) : <p className="text-sm text-slate-500">No sales recorded yet.</p>}</div><h2 className="mt-8 font-bold text-blue-950">Titles by Category</h2><div className="mt-5">{categoryCounts.map(([category, count]) => <Progress key={category} label={category} value={`${count}`} width={Math.min((count / Math.max(data.books.length, 1)) * 100, 100)} color="bg-slate-700" />)}</div></Card>
      </div>
      <Card className="mt-6 p-5"><div className="flex items-center justify-between"><h2 className="font-bold text-blue-950">Generated Reports</h2><Button variant="secondary" onClick={printCurrentPage}>Print</Button></div><SimpleTable headers={['Report Name', 'Type', 'Records', 'Generated']} rows={[[ 'Inventory Valuation', 'Inventory', data.books.length.toString(), new Date().toLocaleString() ], [ 'Sales Summary', 'Sales', data.sales.length.toString(), new Date().toLocaleString() ], [ 'Stock Movements', 'Inventory', data.adjustments.length.toString(), new Date().toLocaleString() ]]} /></Card>
    </Shell>
  )
}

function SavedModal({ onClose }: { onClose: () => void }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4"><Card className="w-full max-w-sm p-8 text-center shadow-2xl"><div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-50"><Check className="size-8 text-emerald-600" /></div><h2 className="mt-10 text-xl font-bold text-blue-950">Changes Saved</h2><p className="mt-6 text-sm leading-6 text-slate-500">Your profile information has been successfully updated.</p><Button className="mt-6 w-full" onClick={onClose}>Dismiss</Button></Card></div>
}

export function ProfileScreen({ active, onNavigate }: PageProps) {
  const [saved, setSaved] = useState(false)
  const user = getCurrentUser()
  return <Shell active={active} onNavigate={onNavigate} role="inventory-manager" title="Profile"><h1 className="text-2xl font-bold text-blue-950">Profile & Settings</h1><div className="mt-6 grid gap-6 xl:grid-cols-[320px_1fr]"><Card className="p-6 text-center"><img className="mx-auto size-24 rounded-full object-cover ring-4 ring-slate-100" src={people[0]} alt="" /><h2 className="mt-5 text-xl font-bold text-blue-950">{user?.name ?? 'Inventory Manager'}</h2><p className="text-sm text-slate-500">Inventory Manager</p><p className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-500"><MapPin className="size-4" />Kigali, Rwanda</p></Card><Card className="p-6"><div className="mb-8 flex items-center justify-between"><h3 className="font-bold text-blue-950">Personal Details</h3><Button onClick={() => setSaved(true)}>Save Changes</Button></div><div className="grid gap-6 md:grid-cols-2"><label>Name<input className="mt-2 h-10 w-full rounded-md border border-slate-200 px-4" defaultValue={user?.name ?? ''} /></label><label>Email<input className="mt-2 h-10 w-full rounded-md border border-slate-200 px-4" defaultValue={user?.email ?? ''} /></label></div><Button className="mt-8 border-red-300 text-red-500" variant="danger" icon={Shield}>Reset Password</Button></Card></div>{saved && <SavedModal onClose={() => setSaved(false)} />}</Shell>
}

export function InventoryManagerDashboard(props: PageProps) {
  const data = useInventoryData()
  const pageByScreen: Record<string, InventoryPage> = { 'inventory-manager': 'dashboard', 'inventory-manager-inventory': 'inventory', 'inventory-manager-adjustments': 'adjustments', 'inventory-manager-reprint': 'reprint', 'inventory-manager-report': 'report', 'inventory-manager-profile': 'profile' }
  const page = pageByScreen[props.active] ?? 'dashboard'
  if (page === 'inventory') return <BookInventoryScreen {...props} data={data} />
  if (page === 'adjustments') return <AdjustmentsScreen {...props} data={data} />
  if (page === 'reprint') return <ReprintAlertsScreen {...props} data={data} />
  if (page === 'report') return <ReportsScreen {...props} data={data} />
  if (page === 'profile') return <ProfileScreen {...props} />
  return <DashboardScreen {...props} data={data} />
}
