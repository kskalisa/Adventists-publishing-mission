import { AlertTriangle, BarChart3, BookOpen, Download, Edit3, Package, Plus, Printer, Trash2, Zap } from 'lucide-react'
import { useState } from 'react'
import { AddItemModal } from '../../components/forms'
import type { StoredInventoryItem } from '../../components/forms'
import { coverImages } from '../../data/assets'
import { readStoredList } from '../../lib/storage'
import type { PageProps } from '../../types/navigation'
import { Shell } from '../../components/layout'
import { Badge, Button, Card, FilterBar, PageHeader, Progress, SimpleTable, StatCard } from '../../components/ui'

function StockBar({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) {
  return <div><p className="font-semibold">{label}</p><div className="mt-2 h-1.5 w-24 rounded bg-slate-100"><div className={`h-full rounded ${danger ? 'bg-red-500' : 'bg-blue-600'} ${value}`} /></div></div>
}

export function Inventory({ active, onNavigate }: PageProps) {
  const [showModal, setShowModal] = useState(false)
  const [storedItems, setStoredItems] = useState(() => readStoredList<StoredInventoryItem>('adventist-inventory-items', []))
  const rows = [
    ...storedItems.map((item) => ({
      title: item.title || 'New Inventory Item',
      author: item.author || 'Unknown Author',
      isbn: item.isbn || 'SKU-PENDING',
      category: item.category,
      price: item.price ? `$${item.price}` : '$0.00',
      stock: item.stock || '0',
      image: coverImages[0],
      low: Number(item.stock || 0) < 50,
    })),
    { title: 'The Great Controversy', author: 'Ellen G. White', isbn: '978-0-8163-2345', category: 'Spirituality', price: '$18.50', stock: '1,240', image: coverImages[0], low: false },
    { title: 'Ministry of Healing', author: 'Health Dept.', isbn: '978-0-8163-1122', category: 'Health & Wellness', price: '$14.99', stock: '42', image: coverImages[1], low: true },
    { title: 'Steps to Christ', author: 'Ellen G. White', isbn: '978-0-8163-9988', category: 'Spirituality', price: '$5.00', stock: '850', image: coverImages[2], low: false },
  ]

  return (
    <Shell active={active} onNavigate={onNavigate}>
      <PageHeader title="Inventory Management" actions={<><Button variant="secondary" icon={Download}>Export</Button><Button icon={Plus} onClick={() => setShowModal(true)}>Add New Book</Button></>} />
      <div className="grid gap-6 xl:grid-cols-[1fr_235px]">
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Total Titles', value: '8,452', helper: '+12 New this week', icon: BookOpen, tone: 'blue' as const },
              { label: 'Low Stock Alerts', value: '24', helper: 'Needs Attention', icon: AlertTriangle, tone: 'red' as const },
              { label: 'Total Value', value: '$424k', helper: '+2.4% vs last month', icon: BarChart3, tone: 'green' as const },
              { label: 'Categories', value: '18', helper: 'Active Sections', icon: Package, tone: 'orange' as const },
            ].map((stat) => <StatCard key={stat.label} stat={stat} />)}
          </div>
          <FilterBar placeholder="Filter by Title, ISBN, or Author..." filters={['All Categories', 'Stock Status']} />
          <Card>
            <SimpleTable
              headers={['Book Title', 'ISBN', 'Category', 'Price', 'Stock Level', 'Status', 'Actions']}
              rows={rows.map((item) => [
                <div className="flex items-center gap-4"><img className="size-14 rounded object-cover" src={item.image} alt="" /><div><p className="font-semibold">{item.title}</p><p className="text-xs text-slate-400">{item.author}</p></div></div>,
                <span className="font-mono text-xs text-slate-400">{item.isbn}</span>,
                item.category,
                item.price,
                <StockBar value={item.low ? 'w-4' : 'w-5/6'} danger={item.low} label={item.stock} />,
                <Badge tone={item.low ? 'orange' : 'green'}>{item.low ? 'Low Stock' : 'In Stock'}</Badge>,
                <div className="flex gap-3 text-slate-400"><Edit3 className="size-4" /><Trash2 className="size-4 text-red-500" /></div>,
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
      {showModal && <AddItemModal onClose={() => setShowModal(false)} onCreated={() => setStoredItems(readStoredList<StoredInventoryItem>('adventist-inventory-items', []))} />}
    </Shell>
  )
}
