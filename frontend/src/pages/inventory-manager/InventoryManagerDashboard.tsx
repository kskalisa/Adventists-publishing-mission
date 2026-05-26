import {
  AlertCircle,
  BarChart3,
  BookOpen,
  Box,
  Calendar,
  Check,
  CircleX,
  Download,
  Edit3,
  Eye,
  Filter,
  Globe,
  Grid2X2,
  MapPin,
  Package,
  Plus,
  Printer,
  RefreshCcw,
  Shield,
  ShoppingCart,
  Trash2,
  TrendingUp,
  Upload,
} from 'lucide-react'
import { useState } from 'react'
import { Shell } from '../../components/layout'
import { Avatar, Badge, Button, Card, Modal } from '../../components/ui'
import { coverImages, people } from '../../data/assets'
import type { PageProps } from '../../types/navigation'

type InventoryPage = 'dashboard' | 'inventory' | 'adjustments' | 'reprint' | 'report' | 'profile'
type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock'

const books = [
  { title: 'The Great Controversy', author: 'Ellen G. White', isbn: '978-0-8163', sku: 'SKU-1029', category: 'Spirituality', lang: 'EN', qty: '1,500', min: '500', price: '25,000 RWF', status: 'In Stock' as StockStatus, image: coverImages[0] },
  { title: 'Steps to Christ', author: 'Ellen G. White', isbn: '978-0-8280', sku: 'SKU-4421', category: 'Evangelism', lang: 'FR', qty: '84', min: '100', price: '5,000 RWF', status: 'Low Stock' as StockStatus, image: coverImages[1] },
  { title: 'Sabbath School Q3 2024', author: 'GC Department', isbn: '978-0-1234', sku: 'SKU-5512', category: 'Education', lang: 'RW', qty: '0', min: '200', price: '3,500 RWF', status: 'Out of Stock' as StockStatus, image: coverImages[2] },
  { title: 'Biblical Health & Wellness', author: 'Dr. John Doe', isbn: '978-1-5678', sku: 'SKU-8892', category: 'Health', lang: 'EN', qty: '450', min: '150', price: '12,000 RWF', status: 'In Stock' as StockStatus, image: coverImages[3] },
  { title: 'Biblical Health & Wellness', author: 'Dr. John Doe', isbn: '978-1-5678', sku: 'SKU-8892', category: 'Health', lang: 'EN', qty: '450', min: '150', price: '12,000 RWF', status: 'In Stock' as StockStatus, image: coverImages[4] },
  { title: 'Biblical Health & Wellness', author: 'Dr. John Doe', isbn: '978-1-5678', sku: 'SKU-8892', category: 'Health', lang: 'EN', qty: '450', min: '150', price: '12,000 RWF', status: 'In Stock' as StockStatus, image: coverImages[5] },
]

const statusTone = {
  'In Stock': 'green',
  'Low Stock': 'orange',
  'Out of Stock': 'red',
} as const

function FilterPill({ icon: Icon, label }: { icon?: typeof Grid2X2; label: string }) {
  return (
    <button className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-400 transition hover:bg-white" type="button">
      {Icon && <Icon className="size-4" />}
      {label}
      <span className="text-slate-300">⌄</span>
    </button>
  )
}

function InventoryRows({ limit }: { limit?: number }) {
  return (
    <>
      {books.slice(0, limit).map((book, index) => (
        <tr className="border-t border-slate-100" key={`${book.title}-${index}`}>
          <td className="px-6 py-4">
            <div className="flex items-center gap-4">
              <img className="size-16 rounded object-cover" src={book.image} alt="" />
              <div className="min-w-0">
                <p className="max-w-36 text-sm font-semibold leading-tight text-slate-900">{book.title}</p>
                <p className="mt-1 text-xs text-slate-400">{book.author}</p>
              </div>
            </div>
          </td>
          <td className="px-2 py-4 text-sm font-semibold text-slate-900">
            <p>{book.isbn}</p>
            <p className="mt-1 text-xs font-normal text-slate-400">{book.sku}</p>
          </td>
          <td className="px-2 py-4 text-sm">{book.category}</td>
          <td className="px-2 py-4 text-sm">{book.lang}</td>
          <td className="px-2 py-4 text-sm font-semibold">{book.qty}</td>
          <td className="px-2 py-4 text-sm text-slate-400">{book.min}</td>
          <td className="px-2 py-4 text-sm">{book.price}</td>
          <td className="px-2 py-4"><Badge tone={statusTone[book.status]}>{book.status}</Badge></td>
          <td className="px-4 py-4">
            <div className="flex gap-4 text-slate-400">
              <Edit3 className="size-4" />
              <Trash2 className="size-4" />
            </div>
          </td>
        </tr>
      ))}
    </>
  )
}

function MiniBarChart({ tall = false }: { tall?: boolean }) {
  const bars = [38, 58, 32, 78, 48, 88, 68]
  return (
    <div className={`flex items-end gap-3 ${tall ? 'h-64' : 'h-36'}`}>
      {bars.map((bar, index) => (
        <div className="flex flex-1 flex-col items-center gap-2" key={bar}>
          <div className={`w-full rounded-t ${index === 5 ? 'bg-blue-600' : 'bg-blue-100'}`} style={{ height: `${bar}%` }} />
          <span className="text-xs text-slate-400">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}</span>
        </div>
      ))}
    </div>
  )
}

export function DashboardScreen({ active, onNavigate }: PageProps) {
  return (
    <Shell active={active} onNavigate={onNavigate} role="inventory-manager">
      <div className="grid gap-6 md:grid-cols-4">
        {[
          ['Total Titles', '1,248', BookOpen],
          ['Low Stock', '24', AlertCircle],
          ['Out of Stock', '8', CircleX],
          ['Reprint Required', '15', Printer],
        ].map(([label, value, Icon]) => (
          <Card className="min-h-40 p-6" key={label as string}>
            <div className="flex justify-between text-sm text-slate-400"><span>{label as string}</span>{typeof Icon !== 'string' && <Icon className="size-4" />}</div>
            <p className="mt-6 text-4xl font-bold tracking-tight">{value as string}</p>
          </Card>
        ))}
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_248px]">
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 p-6">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Book Inventory</h1>
              <p className="mt-2 text-sm text-slate-400">Manage stock levels, prices, and status.</p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" icon={Download}>Export</Button>
              <Button variant="secondary" icon={Upload}>Bulk Import</Button>
              <Button icon={Plus}>Add Book</Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 px-6 pb-4">
            <FilterPill label="Category: All" />
            <FilterPill label="Language: All" />
            <FilterPill label="Status: Active" />
          </div>
          <div className="overflow-x-auto px-6 pb-64">
            <table className="w-full min-w-[760px]">
              <thead className="border-y border-slate-100 text-left text-xs font-semibold uppercase text-slate-400">
                <tr>{['Book', 'ISBN/SKU', 'Category', 'Lang', 'Qty', 'Min Lvl', 'Status', 'Actions'].map((head) => <th className="px-2 py-4" key={head}>{head}</th>)}</tr>
              </thead>
              <tbody><InventoryRows limit={4} /></tbody>
            </table>
          </div>
        </Card>
        <aside className="space-y-6">
          <Card className="p-5">
            <h2 className="flex items-center justify-between font-bold">Low Stock Alerts <span className="grid size-6 place-items-center rounded-full bg-red-500 text-xs text-white">3</span></h2>
            {['Steps to Christ (FR)|84 remaining (Min: 100)', 'Biblical Diet|12 remaining (Min: 50)'].map((item) => {
              const [title, helper] = item.split('|')
              return <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm" key={title}><p className="font-semibold">{title}</p><p className="text-xs text-slate-400">{helper}</p></div>
            })}
            <Button className="mt-4 w-full" variant="secondary">View All Alerts</Button>
          </Card>
          <Card className="p-5">
            <h2 className="font-bold">Reprint Suggested</h2>
            <p className="mt-5 text-sm leading-6 text-slate-400">Based on sales velocity, Sabbath School Q3 should be reprinted immediately to meet demand.</p>
            <Button className="mt-4 w-full" variant="secondary" onClick={() => onNavigate('inventory-manager-reprint')}>Create Reprint Order</Button>
          </Card>
          <Card className="p-5">
            <h2 className="font-bold">Stock Movement</h2>
            <div className="mt-8"><MiniBarChart /></div>
          </Card>
        </aside>
      </div>
    </Shell>
  )
}

export function BookInventoryScreen({ active, onNavigate }: PageProps) {
  return (
    <Shell active={active} onNavigate={onNavigate} role="inventory-manager" title="Book Inventory">
      <h1 className="mb-7 text-2xl font-bold">Book Inventory</h1>
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-5">
          <div className="flex flex-wrap gap-3">
            <FilterPill icon={Grid2X2} label="Category: All" />
            <FilterPill icon={Globe} label="Language: All" />
            <FilterPill icon={Filter} label="Status: All" />
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" icon={Download}>Export</Button>
            <Button variant="secondary" icon={Upload}>Bulk Import</Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px]">
            <thead className="bg-slate-100 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
              <tr>{['Book Title & Author', 'ISBN / SKU', 'Category', 'Lang', 'Quantity', 'Min Level', 'Retail Price', 'Status', 'Actions'].map((head) => <th className="px-6 py-4" key={head}>{head}</th>)}</tr>
            </thead>
            <tbody><InventoryRows /></tbody>
          </table>
        </div>
      </Card>
    </Shell>
  )
}

function ReprintOrderModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal
      title="Create Reprint Order"
      onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={onClose}>Create Order</Button></>}
    >
      <div className="grid gap-5 text-sm text-blue-950 sm:grid-cols-2">
        <label className="sm:col-span-2">Select Book Title<input className="mt-2 h-10 w-full rounded-md border-0 bg-slate-100 px-4" defaultValue="Steps to Christ (BK-001)" /></label>
        <label>Quantity<input className="mt-2 h-10 w-full rounded-md border-0 bg-slate-100 px-4" defaultValue="2000" /></label>
        <label>Priority<input className="mt-2 h-10 w-full rounded-md border-0 bg-slate-100 px-4" defaultValue="Urgent (Rush)" /></label>
        <label className="sm:col-span-2">Supplier / Printer<input className="mt-2 h-10 w-full rounded-md border-0 bg-slate-100 px-4" defaultValue="Local Press Inc. (Kigali)" /></label>
        <label>Expected Delivery<input className="mt-2 h-10 w-full rounded-md border-0 bg-slate-100 px-4" defaultValue="11 / 20 / 2024" /></label>
        <label>Est. Cost<input className="mt-2 h-10 w-full rounded-md border-0 bg-slate-100 px-4" defaultValue="$4,200.00" /></label>
        <label className="sm:col-span-2">Production Notes<textarea className="mt-2 h-20 w-full resize-none rounded-md border-0 bg-slate-100 px-4 py-3" placeholder="Add specific instructions for the printer (e.g., paper quality, binding type)..." /></label>
      </div>
    </Modal>
  )
}

export function ReprintAlertsScreen({ active, onNavigate }: PageProps) {
  const [showOrder, setShowOrder] = useState(false)
  return (
    <Shell active={active} onNavigate={onNavigate} role="inventory-manager" title="Reprint Alerts">
      <div className="grid gap-6 md:grid-cols-[1fr_1fr_1fr_320px]">
        {['Critical Levels (< 30 days)|5 Titles', 'Active Print Jobs|2 Orders', 'Est. Reprint Cost|$12,450'].map((stat) => {
          const [label, value] = stat.split('|')
          return <Card className="p-6" key={label}><p className="text-sm text-slate-500">{label}</p><p className={`mt-2 text-2xl font-bold ${value.includes('5') ? 'text-red-600' : value.includes('2') ? 'text-blue-600' : 'text-blue-950'}`}>{value}</p></Card>
        })}
        <Card className="row-span-2 p-5">
          <h2 className="mb-5 flex justify-between font-bold">Active Print Jobs <Printer className="size-4 text-slate-400" /></h2>
          {['#PO-2024-001|Ministry of Healing (1000)|PRE-PRESS|35', '#PO-2024-002|Education (500)|SHIPPED|90'].map((job) => {
            const [code, title, state, percent] = job.split('|')
            return <div className="mb-5 border-b border-slate-100 pb-4" key={code}><p className="font-semibold">{code}<span className={`float-right text-xs ${state === 'SHIPPED' ? 'text-emerald-600' : 'text-blue-600'}`}>{state}</span></p><p className="mt-3 text-sm font-semibold">{title}</p><p className="mt-3 text-sm text-slate-400">Local Press Inc.<span className="float-right">Due: Nov 10</span></p><div className="mt-4 h-1.5 rounded bg-slate-100"><div className={`h-full rounded ${state === 'SHIPPED' ? 'bg-emerald-600' : 'bg-blue-600'}`} style={{ width: `${percent}%` }} /></div></div>
          })}
        </Card>
        <Card className="overflow-hidden md:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-4 p-5">
            <h1 className="text-xl font-bold">Recommended Reprints</h1>
            <div className="flex gap-3"><Button variant="secondary" icon={Download}>Export List</Button><Button icon={Plus} onClick={() => setShowOrder(true)}>Create Order</Button></div>
          </div>
          <div className="flex gap-3 bg-slate-100 px-5 py-3"><FilterPill label="Urgency: All" /><FilterPill label="Category: All" /><FilterPill label="Supplier: All" /></div>
          <table className="w-full text-sm">
            <thead className="bg-blue-50 text-left text-slate-500"><tr>{['Book Details', 'Current Stock', 'Days Left', 'Suggested Qty', 'Status', 'Actions'].map((h) => <th className="px-5 py-3" key={h}>{h}</th>)}</tr></thead>
            <tbody>{['Steps to Christ|180 / Min 150|~10 Days|2,000|Critical|Order', 'The Great Controversy|180 / Min 150|~60 Days|1,500|Warning|Review', 'Ministry of Healing|50 / Min 50|~30 Days|1,000|In Printing|Track', 'Health & Home|200 / Min 200|~50 Days|3,000|Warning|Review'].map((row) => {
              const [title, stock, days, qty, status, action] = row.split('|')
              return <tr className="border-t border-slate-100" key={title}><td className="px-5 py-4 font-semibold text-blue-950">{title}<p className="font-normal text-slate-500">SKU: BK-001</p></td><td className="px-5 py-4 font-semibold">{stock}</td><td className="px-5 py-4 font-semibold text-red-600">{days}</td><td className="px-5 py-4">{qty}</td><td className="px-5 py-4"><Badge tone={status === 'Critical' ? 'red' : status === 'Warning' ? 'orange' : 'blue'}>{status}</Badge></td><td className="px-5 py-4"><Button className="h-8 px-4" variant={action === 'Order' ? 'primary' : 'secondary'} onClick={() => action === 'Order' && setShowOrder(true)}>{action}</Button></td></tr>
            })}</tbody>
          </table>
          <div className="h-40" />
        </Card>
        <Card className="p-5">
          <h2 className="font-bold">Est. Q4 Reprint Budget</h2>
          <div className="mt-8"><MiniBarChart /></div>
          <p className="mt-3 text-sm text-slate-500">Used Budget <strong className="float-right text-blue-950">$8,200</strong></p>
          <p className="mt-3 text-sm text-slate-500">Pending Approval <strong className="float-right text-orange-500">$4,250</strong></p>
          <p className="mt-3 text-sm text-slate-500">Remaining <strong className="float-right text-emerald-600">$7,550</strong></p>
        </Card>
      </div>
      {showOrder && <ReprintOrderModal onClose={() => setShowOrder(false)} />}
    </Shell>
  )
}

export function AdjustmentsScreen({ active, onNavigate }: PageProps) {
  return (
    <Shell active={active} onNavigate={onNavigate} role="inventory-manager" title="Stock Adjustments">
      <div className="grid gap-6 lg:grid-cols-[1fr_278px]">
        <div>
          <div className="mb-6 grid gap-6 sm:grid-cols-3">
            <Card className="p-6"><p className="text-sm text-slate-500">Stock In (Month)</p><p className="mt-2 text-2xl font-bold text-emerald-600">+2,450</p></Card>
            <Card className="p-6"><p className="text-sm text-slate-500">Shrinkage/Damage</p><p className="mt-2 text-2xl font-bold text-red-600">-48</p></Card>
            <Card className="p-6"><p className="text-sm text-slate-500">Pending Approval</p><p className="mt-2 text-2xl font-bold text-orange-500">3</p></Card>
          </div>
          <Card className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-4 p-5"><h1 className="text-xl font-bold">Stock Movement History</h1><div className="flex gap-3"><Button variant="secondary" icon={Download}>Export Report</Button><Button icon={Plus}>New Adjustment</Button></div></div>
            <div className="flex gap-3 bg-slate-100 px-5 py-3"><FilterPill label="All Types" /><FilterPill label="Last 30 Days" /><FilterPill label="All Users" /></div>
            <table className="w-full text-sm">
              <thead className="bg-blue-50 text-left text-slate-500"><tr>{['Ref #', 'Date', 'Type', 'Reason', 'Items', 'Total Qty', 'Adjusted', 'Status', ''].map((h) => <th className="px-5 py-3" key={h}>{h}</th>)}</tr></thead>
              <tbody>{['ADJ-24-089|Oct 24, 2024|Stock In|New Shipment Received|8 Titles|+1,200|Jean P.|Done', 'ADJ-24-088|Oct 23, 2024|Damage|Water Damage in Storage|2 Titles|-15|Sarah M.|Done', 'ADJ-24-087|Oct 22, 2024|Correction|Quarterly Stock Take|12 Titles|+4|Mark T.|Approval', 'ADJ-24-086|Oct 20, 2024|Return|Customer Return (Undelivered)|1 Title|+50|Alice K.|Done', 'ADJ-24-085|Oct 19, 2024|Write-off|Obsolete / Expired|4 Titles|-200|Sarah M.|Done'].map((row, index) => {
                const [ref, date, type, reason, items, qty, user, status] = row.split('|')
                return <tr className="border-t border-slate-100" key={ref}><td className="px-5 py-4 font-mono text-xs">{ref}</td><td className="px-5 py-4">{date}</td><td className="px-5 py-4"><Badge tone={type === 'Damage' || type === 'Write-off' ? 'red' : type === 'Correction' ? 'blue' : 'green'}>{type}</Badge></td><td className="px-5 py-4">{reason}</td><td className="px-5 py-4">{items}</td><td className={`px-5 py-4 font-bold ${qty.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>{qty}</td><td className="px-5 py-4"><div className="flex items-center gap-2"><Avatar src={people[index % people.length]} label={user} size="sm" />{user}</div></td><td className={`px-5 py-4 font-medium ${status === 'Approval' ? 'text-orange-500' : 'text-emerald-600'}`}>{status}</td><td className="px-5 py-4"><Eye className="size-4 text-slate-400" /></td></tr>
              })}</tbody>
            </table>
            <div className="h-28" />
          </Card>
        </div>
        <aside className="space-y-6">
          <Card className="p-5"><h2 className="font-bold">Adjustment Reasons</h2>{[['New Stock', '45%', 'bg-blue-600'], ['Damaged', '15%', 'bg-red-600'], ['Corrections', '25%', 'bg-orange-500'], ['Returns', '15%', 'bg-slate-200']].map(([label, value, color]) => <p className="mt-4 text-sm text-slate-500" key={label}><span className={`mr-2 inline-block size-2 rounded-full ${color}`} />{label}<strong className="float-right text-blue-950">{value}</strong></p>)}</Card>
          <Card className="p-5"><h2 className="mb-5 flex justify-between font-bold">Recent Activity <BarChart3 className="size-4 text-slate-400" /></h2><div className="space-y-5 text-sm"><p><strong>New Shipment</strong><span className="block text-slate-500">Added 1,200 copies of "The Great Controversy"</span><span className="text-xs text-slate-400">2 hours ago</span></p><p><strong>Stock Alert</strong><span className="block text-slate-500">Physical count mismatch detected in Section B</span><span className="text-xs text-slate-400">Yesterday</span></p></div></Card>
        </aside>
      </div>
    </Shell>
  )
}

export function ReportsScreen({ active, onNavigate }: PageProps) {
  return (
    <Shell active={active} onNavigate={onNavigate} role="inventory-manager" title="Reports">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-blue-950">Reports & Analytics</h1><p className="mt-1 text-sm text-slate-500">Overview of publishing performance and inventory metrics.</p></div>
        <Button variant="secondary" icon={Calendar}>Jan 01, 2025 - Jan 31, 2025</Button>
      </div>
      <div className="grid gap-6 md:grid-cols-4">
        {[
          ['Total Revenue', 'RWF 12.4M', '+15.2% from last month', TrendingUp],
          ['Books Distributed', '3,842', '+5.4% from last month', Package],
          ['Stock Turnover', '4.2x', '-1.1% from last month', RefreshCcw],
          ['Avg. Order Value', 'RWF 3,250', '+2.3% from last month', ShoppingCart],
        ].map(([label, value, helper, Icon]) => <Card className="p-6" key={label as string}><p className="flex justify-between text-sm text-slate-500">{label as string}{typeof Icon !== 'string' && <Icon className="size-5 text-blue-600" />}</p><p className="mt-6 text-3xl font-bold text-blue-950">{value as string}</p><p className={`mt-2 text-xs ${(helper as string).startsWith('-') ? 'text-red-500' : 'text-emerald-600'}`}>{helper as string}</p></Card>)}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_285px]">
        <Card className="p-6"><div className="flex justify-between"><h2 className="font-bold text-blue-950">Sales Performance</h2><Button variant="secondary" className="h-7 px-3">Last 6 Months</Button></div><div className="mt-8 border-y border-dashed border-slate-200 py-6"><MiniBarChart tall /></div></Card>
        <Card className="p-6"><h2 className="font-bold text-blue-950">Sales by Category <span className="float-right text-slate-400">...</span></h2><div className="grid h-56 place-items-center text-center"><p className="text-2xl font-bold text-blue-950">3,842</p><p className="-mt-20 text-sm text-slate-500">Total Books</p></div>{[['Spirituality', '45%', 'bg-blue-600'], ['Education', '25%', 'bg-orange-500'], ['Health', '20%', 'bg-emerald-600'], ['Other', '10%', 'bg-slate-100']].map(([label, value, color]) => <p className="mt-3 text-sm" key={label}><span className={`mr-2 inline-block size-3 rounded ${color}`} />{label}<strong className="float-right">{value}</strong></p>)}</Card>
      </div>
      <Card className="mt-6 overflow-hidden"><div className="flex items-center justify-between p-5"><h2 className="font-bold text-blue-950">Recently Generated Reports</h2><div className="flex gap-3"><Button variant="secondary" icon={Filter}>Filter</Button><Button>Export Report</Button></div></div><div className="bg-blue-50 px-6 py-4 text-xs font-bold uppercase tracking-wide text-blue-950"><div className="grid grid-cols-6"><span>Report Name</span><span>Date Generated</span><span>Generated By</span><span>Type</span><span>Format</span><span>Action</span></div></div><div className="h-48" /></Card>
    </Shell>
  )
}

function SavedModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4">
      <Card className="w-full max-w-sm p-8 text-center shadow-2xl">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-50"><Check className="size-8 text-emerald-600" /></div>
        <h2 className="mt-10 text-xl font-bold text-blue-950">Changes Saved</h2>
        <p className="mt-6 text-sm leading-6 text-slate-500">Your profile information has been successfully updated.</p>
        <Button className="mt-6 w-full" onClick={onClose}>Dismiss</Button>
      </Card>
    </div>
  )
}

export function ProfileScreen({ active, onNavigate }: PageProps) {
  const [saved, setSaved] = useState(false)
  return (
    <Shell active={active} onNavigate={onNavigate} role="inventory-manager" title="Profile">
      <h1 className="text-2xl font-bold text-blue-950">Profile & Settings</h1>
      <p className="mt-1 text-sm text-slate-500">Manage your account settings and preferences.</p>
      <div className="mt-6 grid gap-6 xl:grid-cols-[320px_1fr]">
        <Card className="p-6">
          <div className="text-center"><img className="mx-auto size-24 rounded-full object-cover ring-4 ring-slate-100" src={people[0]} alt="" /><h2 className="mt-5 text-xl font-bold text-blue-950">Jean-Claude N.</h2><p className="text-sm text-slate-500">Inventory Manager</p></div>
          <div className="mt-10 space-y-5 text-sm text-blue-950">
            <p className="flex items-center gap-3"><Box className="size-8 rounded-md bg-slate-100 p-2 text-slate-500" />Publishing Dept.</p>
            <p className="flex items-center gap-3"><MapPin className="size-8 rounded-md bg-slate-100 p-2 text-slate-500" />Kigali, Rwanda</p>
            <p className="flex items-center gap-3"><Calendar className="size-8 rounded-md bg-slate-100 p-2 text-slate-500" />Joined Jan 2023</p>
          </div>
          <Button className="mt-8 w-full" variant="secondary">Change Avatar</Button>
        </Card>
        <Card className="overflow-hidden">
          <h2 className="border-b border-slate-200 p-6 text-xl font-bold text-blue-950">General Information</h2>
          <div className="p-6">
            <div className="mb-8 flex items-center justify-between"><h3 className="font-bold text-blue-950">Personal Details</h3><Button onClick={() => setSaved(true)}>Save Changes</Button></div>
            <div className="grid gap-6 md:grid-cols-2">
              {['First Name|Moise', 'Last Name|Arihafi', 'Email Address|arihafi moise@gh.rw', 'Phone|+250 788 123 2345'].map((field) => {
                const [label, value] = field.split('|')
                return <label className="grid grid-cols-[120px_1fr] items-center gap-3 text-sm text-slate-500" key={label}>{label}<input className="h-8 rounded-full border border-slate-200 px-4 text-center text-blue-950" defaultValue={value} /></label>
              })}
            </div>
            <h3 className="mt-10 border-t border-slate-200 pt-8 font-bold text-blue-950">Preferences & Security</h3>
            {[
              ['Email Notifications', 'Receive daily summaries and low stock alerts.', true],
              ['Two-Factor Authentication', 'Secure your account with 2FA via SMS.', false],
              ['Dark Mode', 'Switch interface to dark theme.', false],
            ].map(([label, helper, checked]) => <div className="flex items-center justify-between border-b border-slate-100 py-4" key={label as string}><div><p className="font-semibold text-blue-950">{label as string}</p><p className="text-sm text-slate-500">{helper as string}</p></div><span className={`h-5 w-9 rounded-full p-0.5 ${checked ? 'bg-emerald-600' : 'bg-slate-100'}`}><span className={`block size-4 rounded-full bg-white shadow ${checked ? 'ml-4' : ''}`} /></span></div>)}
            <Button className="mt-8 border-red-300 text-red-500" variant="danger" icon={Shield}>Reset Password</Button>
          </div>
        </Card>
      </div>
      {saved && <SavedModal onClose={() => setSaved(false)} />}
    </Shell>
  )
}

export function InventoryManagerDashboard(props: PageProps) {
  const pageByScreen: Record<string, InventoryPage> = {
    'inventory-manager': 'dashboard',
    'inventory-manager-inventory': 'inventory',
    'inventory-manager-adjustments': 'adjustments',
    'inventory-manager-reprint': 'reprint',
    'inventory-manager-report': 'report',
    'inventory-manager-profile': 'profile',
  }
  const page = pageByScreen[props.active] ?? 'dashboard'

  if (page === 'inventory') return <BookInventoryScreen {...props} />
  if (page === 'adjustments') return <AdjustmentsScreen {...props} />
  if (page === 'reprint') return <ReprintAlertsScreen {...props} />
  if (page === 'report') return <ReportsScreen {...props} />
  if (page === 'profile') return <ProfileScreen {...props} />
  return <DashboardScreen {...props} />
}
