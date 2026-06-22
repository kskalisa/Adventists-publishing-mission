import { AlertTriangle, BarChart3, BookOpen, Download, Edit3, Package, Plus, Printer, Trash2, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AddItemModal } from '../../components/forms'
import { coverImages } from '../../data/assets'
import { downloadCsv } from '../../lib/actions'
import { deleteBook, listBooks, money } from '../../lib/api'
import type { Book } from '../../lib/api'
import type { PageProps } from '../../types/navigation'
import { Shell } from '../../components/layout'
import { Badge, Button, Card, FilterBar, Modal, PageHeader, Progress, SimpleTable, StatCard } from '../../components/ui'

function StockBar({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) {
  return <div><p className="font-semibold">{label}</p><div className="mt-2 h-1.5 w-24 rounded bg-slate-100"><div className={`h-full rounded ${danger ? 'bg-red-500' : 'bg-blue-600'} ${value}`} /></div></div>
}

export function Inventory({ active, onNavigate }: PageProps) {
  const [showModal, setShowModal] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | undefined>()
  const [deletingBook, setDeletingBook] = useState<Book | null>(null)
  const [rows, setRows] = useState<Book[]>([])
  const [error, setError] = useState('')

  const loadBooks = () => {
    listBooks().then(setRows).catch((error) => setError(error instanceof Error ? error.message : 'Unable to load inventory.'))
  }

  useEffect(loadBooks, [])
  const lowStock = rows.filter((item) => item.status !== 'IN_STOCK').length
  const categories = new Set(rows.map((item) => item.category)).size
  const totalValue = rows.reduce((sum, item) => sum + item.price * item.stockQuantity, 0)

  const removeBook = async () => {
    if (!deletingBook) return
    setError('')
    try {
      await deleteBook(deletingBook.id)
      setDeletingBook(null)
      loadBooks()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to delete book.')
    }
  }

  return (
    <Shell active={active} onNavigate={onNavigate}>
      <PageHeader title="Inventory Management" actions={<><Button variant="secondary" icon={Download} onClick={() => downloadCsv('inventory.csv', ['Title', 'Author', 'ISBN', 'Category', 'Price', 'Stock', 'Status'], rows.map((item) => [item.title, item.author, item.isbn, item.category, item.price, item.stockQuantity, item.status]))}>Export</Button><Button icon={Plus} onClick={() => setShowModal(true)}>Add New Book</Button></>} />
      <div className="grid gap-6 xl:grid-cols-[1fr_235px]">
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Total Titles', value: rows.length.toString(), helper: 'Live catalog', icon: BookOpen, tone: 'blue' as const },
              { label: 'Low Stock Alerts', value: lowStock.toString(), helper: 'Needs attention', icon: AlertTriangle, tone: 'red' as const },
              { label: 'Total Value', value: money(totalValue), helper: 'Current stock value', icon: BarChart3, tone: 'green' as const },
              { label: 'Categories', value: categories.toString(), helper: 'Active sections', icon: Package, tone: 'orange' as const },
            ].map((stat) => <StatCard key={stat.label} stat={stat} />)}
          </div>
          <FilterBar placeholder="Filter by Title, ISBN, or Author..." filters={['All Categories', 'Stock Status']} />
          {error && <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
          <Card>
            <SimpleTable
              headers={['Book Title', 'ISBN', 'Category', 'Price', 'Stock Level', 'Status', 'Actions']}
              rows={rows.map((item, index) => [
                <div className="flex items-center gap-4"><img className="size-14 rounded object-cover" src={item.coverImageUrl ?? coverImages[index % coverImages.length]} alt="" /><div><p className="font-semibold">{item.title}</p><p className="text-xs text-slate-400">{item.author}</p></div></div>,
                <span className="font-mono text-xs text-slate-400">{item.isbn}</span>,
                item.category,
                money(item.price),
                <StockBar value={item.status === 'OUT_OF_STOCK' ? 'w-0' : item.status === 'LOW_STOCK' ? 'w-4' : 'w-5/6'} danger={item.status !== 'IN_STOCK'} label={item.stockQuantity.toLocaleString()} />,
                <Badge tone={item.status === 'IN_STOCK' ? 'green' : 'orange'}>{item.status === 'IN_STOCK' ? 'In Stock' : item.status === 'LOW_STOCK' ? 'Low Stock' : 'Out of Stock'}</Badge>,
                <div className="flex gap-3 text-slate-400"><button aria-label={`Edit ${item.title}`} onClick={() => { setEditingBook(item); setShowModal(true) }} type="button"><Edit3 className="size-4" /></button><button aria-label={`Delete ${item.title}`} onClick={() => setDeletingBook(item)} type="button"><Trash2 className="size-4 text-red-500" /></button></div>,
              ])}
            />
          </Card>
        </div>
        <aside className="space-y-6">
          <Card className="p-5">
            <h2 className="mb-4 flex items-center gap-2 font-semibold"><Zap className="size-5 text-amber-500" />Quick Actions</h2>
            {['Receive Shipment', 'Process Returns', 'Print Labels'].map((action) => <button className="mb-2 flex h-10 w-full items-center gap-3 rounded-md border border-slate-200 px-4 text-left text-sm hover:bg-slate-50" key={action} type="button"><Printer className="size-4 text-slate-400" />{action}</button>)}
          </Card>
          <Card className="p-5">
            <h2 className="mb-4 flex items-center gap-2 font-semibold"><BarChart3 className="size-5 text-blue-600" />Distribution by Category</h2>
            <Progress label="Spirituality" value="45%" width="w-[45%]" color="bg-blue-600" />
            <Progress label="Health & Wellness" value="25%" width="w-1/4" color="bg-amber-400" />
            <Progress label="Education" value="20%" width="w-1/5" color="bg-emerald-500" />
            <Progress label="Other" value="10%" width="w-1/12" color="bg-slate-400" />
          </Card>
        </aside>
      </div>
      {showModal && <AddItemModal book={editingBook} onClose={() => { setShowModal(false); setEditingBook(undefined) }} onCreated={loadBooks} />}
      {deletingBook && <Modal title="Delete book?" onClose={() => setDeletingBook(null)} footer={<><Button variant="secondary" onClick={() => setDeletingBook(null)}>Cancel</Button><Button variant="danger" icon={Trash2} onClick={removeBook}>Delete Book</Button></>}><p className="text-sm leading-6 text-slate-600">This will permanently remove <strong className="text-blue-950">{deletingBook.title}</strong> from inventory. Continue only if this title should no longer be available in the catalog.</p></Modal>}
    </Shell>
  )
}
