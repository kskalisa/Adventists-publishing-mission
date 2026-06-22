import { Printer, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { coverImages } from '../../data/assets'
import { listBooks, listSales, money } from '../../lib/api'
import type { Book, Sale } from '../../lib/api'
import type { PageProps } from '../../types/navigation'
import { Shell } from '../../components/layout'
import { Badge, Button, Card, SearchBox, SimpleTable, StatCard } from '../../components/ui'

export function SalesDashboard({ active, onNavigate }: PageProps) {
  const [books, setBooks] = useState<Book[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    listBooks().then(setBooks).catch((error) => setError(error instanceof Error ? error.message : 'Unable to load books.'))
    listSales().then(setSales).catch((error) => setError(error instanceof Error ? error.message : 'Unable to load sales.'))
  }, [])

  const latestSale = sales[0]
  const revenue = sales.reduce((sum, sale) => sum + sale.total, 0)
  const itemCount = sales.reduce((sum, sale) => sum + sale.items.reduce((inner, item) => inner + item.quantity, 0), 0)
  const targetProgress = Math.min(Math.round((revenue / 600000) * 100), 100)

  return (
    <Shell active={active} onNavigate={onNavigate} role="sales">
      {error && <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard stat={{ label: 'Recent Sales', value: money(revenue), helper: 'Last recorded transactions' }} />
        <StatCard stat={{ label: 'Transactions', value: sales.length.toString(), helper: `${itemCount} books sold` }} />
        <Card className="p-6">
          <p className="text-sm text-slate-500">Daily Target Progress</p>
          <div className="mt-3 flex items-end justify-between">
            <p className="text-3xl font-semibold">{targetProgress}%</p>
            <span className="text-sm text-slate-500">Goal: 600k</span>
          </div>
          <div className="mt-4 h-1.5 rounded bg-slate-100"><div className="h-full rounded bg-blue-600" style={{ width: `${targetProgress}%` }} /></div>
        </Card>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[245px_1fr_295px]">
        <Card>
          <h2 className="border-b border-slate-100 p-5 font-semibold text-blue-950">Available Books</h2>
          <div className="space-y-3 p-4">
            <SearchBox placeholder="Search title or scan ISBN..." />
            {books.slice(0, 6).map((book, index) => (
              <button className="flex w-full items-center gap-3 rounded-md border border-slate-200 p-3 text-left transition hover:bg-slate-50" key={book.id} type="button">
                <img className="size-16 rounded object-cover" src={book.coverImageUrl ?? coverImages[index % coverImages.length]} alt="" />
                <span><strong className="block text-blue-950">{book.title}</strong><span className="text-sm text-slate-500">{money(book.price)}</span></span>
              </button>
            ))}
          </div>
        </Card>
        <Card className="flex min-h-[560px] flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <h2 className="font-semibold text-blue-950">{latestSale ? `Latest Order #${latestSale.id}` : 'Latest Order'}</h2>
            <button className="flex items-center gap-2 text-sm text-slate-500" type="button"><Trash2 className="size-4" />Clear</button>
          </div>
          <SimpleTable headers={['Item', 'Qty', 'Price', 'Total', '']} rows={(latestSale?.items ?? []).map((item) => [item.title, item.quantity.toString(), money(item.unitPrice), money(item.lineTotal), 'x'])} />
          <div className="mt-auto border-t border-blue-100 bg-blue-50 p-4">
            <p className="mb-2 font-medium text-blue-950">Add Discount Code</p>
            <div className="flex gap-2"><input className="h-10 flex-1 rounded-md border border-slate-200 px-3" placeholder="Code" /><Button variant="secondary">Apply</Button></div>
          </div>
        </Card>
        <Card>
          <h2 className="border-b border-slate-100 p-5 font-semibold text-blue-950">Payment Details</h2>
          <div className="space-y-6 p-6">
            <label className="block"><span className="mb-2 block text-sm font-medium">Customer</span><input className="h-10 w-full rounded-md border border-slate-200 px-3" value={latestSale?.customerName ?? 'Walk-in Customer'} readOnly /></label>
            <div><p className="mb-3 text-sm font-medium">Payment Method</p><div className="grid grid-cols-2 gap-3">{['Cash', 'MoMo', 'Card', 'Transfer'].map((method, index) => <button className={`h-11 rounded-md border text-sm font-medium ${index === 0 ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200'}`} key={method} type="button">{method}</button>)}</div></div>
            <div className="space-y-2 border-t border-slate-100 pt-5 text-sm text-slate-500"><div className="flex justify-between"><span>Subtotal</span><span>{money(latestSale?.subtotal ?? 0)}</span></div><div className="flex justify-between"><span>Tax (18%)</span><span>{money(latestSale?.tax ?? 0)}</span></div><div className="flex justify-between"><span>Discount</span><span>-{money(latestSale?.discount ?? 0)}</span></div></div>
            <div className="flex justify-between text-xl font-bold text-blue-950"><span>Total</span><span>{money(latestSale?.total ?? 0)}</span></div>
            <button className="h-12 w-full rounded-md bg-blue-600 font-semibold text-white" onClick={() => onNavigate('pos')} type="button">Complete Sale</button>
          </div>
        </Card>
      </div>
      <Card className="mt-6 p-6">
        <h2 className="mb-5 text-xl font-semibold text-blue-950">Recent Sales History</h2>
        <SimpleTable headers={['Invoice ID', 'Customer', 'Date', 'Payment Method', 'Amount', 'Status', 'Action']} rows={sales.map((sale) => [`INV-${sale.id.toString().padStart(5, '0')}`, sale.customerName, new Date(sale.createdAt).toLocaleString(), 'Cash', money(sale.total), <Badge tone="green">{sale.status}</Badge>, <Printer className="size-4 text-slate-500" />])} />
      </Card>
    </Shell>
  )
}
