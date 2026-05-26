import { Printer, Trash2 } from 'lucide-react'
import { coverImages } from '../../data/assets'
import type { PageProps } from '../../types/navigation'
import { Shell } from '../../components/layout'
import { Badge, Button, Card, SearchBox, SimpleTable, StatCard } from '../../components/ui'

export function SalesDashboard({ active, onNavigate }: PageProps) {
  return (
    <Shell active={active} onNavigate={onNavigate} role="sales">
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard stat={{ label: "Today's Sales", value: 'RWF 450,000', helper: '+12%' }} />
        <StatCard stat={{ label: 'Transactions', value: '34', helper: 'Running' }} />
        <Card className="p-6">
          <p className="text-sm text-slate-500">Daily Target Progress</p>
          <div className="mt-3 flex items-end justify-between">
            <p className="text-3xl font-semibold">75%</p>
            <span className="text-sm text-slate-500">Goal: 600k</span>
          </div>
          <div className="mt-4 h-1.5 rounded bg-slate-100"><div className="h-full w-3/4 rounded bg-blue-600" /></div>
        </Card>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[245px_1fr_295px]">
        <Card>
          <h2 className="border-b border-slate-100 p-5 font-semibold text-blue-950">Available Books</h2>
          <div className="space-y-3 p-4">
            <SearchBox placeholder="Search title or scan ISBN..." />
            {['The Great Controversy|RWF 12,000', 'Steps to Christ|RWF 5,000', 'Desire of Ages|RWF 15,000', 'Adventist Home|RWF 8,500'].map((item, index) => {
              const [title, price] = item.split('|')
              return <button className="flex w-full items-center gap-3 rounded-md border border-slate-200 p-3 text-left transition hover:bg-slate-50" key={title} type="button"><img className="size-16 rounded object-cover" src={coverImages[index]} alt="" /><span><strong className="block text-blue-950">{title}</strong><span className="text-sm text-slate-500">{price}</span></span></button>
            })}
          </div>
        </Card>
        <Card className="flex min-h-[560px] flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <h2 className="font-semibold text-blue-950">Current Order #1024</h2>
            <button className="flex items-center gap-2 text-sm text-slate-500" type="button"><Trash2 className="size-4" />Clear</button>
          </div>
          <SimpleTable headers={['Item', 'Qty', 'Price', 'Total', '']} rows={[
            ['The Great Controversy', '-  2  +', '12,000', '24,000', '×'],
            ['Steps to Christ', '-  1  +', '5,000', '5,000', '×'],
            ['Health & Healing', '-  5  +', '3,000', '15,000', '×'],
          ]} />
          <div className="mt-auto border-t border-blue-100 bg-blue-50 p-4">
            <p className="mb-2 font-medium text-blue-950">Add Discount Code</p>
            <div className="flex gap-2"><input className="h-10 flex-1 rounded-md border border-slate-200 px-3" placeholder="Code" /><Button variant="secondary">Apply</Button></div>
          </div>
        </Card>
        <Card>
          <h2 className="border-b border-slate-100 p-5 font-semibold text-blue-950">Payment Details</h2>
          <div className="space-y-6 p-6">
            <label className="block"><span className="mb-2 block text-sm font-medium">Customer</span><input className="h-10 w-full rounded-md border border-slate-200 px-3" value="Walk-in Customer" readOnly /></label>
            <div><p className="mb-3 text-sm font-medium">Payment Method</p><div className="grid grid-cols-2 gap-3">{['Cash', 'MoMo', 'Card', 'Transfer'].map((method, index) => <button className={`h-11 rounded-md border text-sm font-medium ${index === 0 ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200'}`} key={method} type="button">{method}</button>)}</div></div>
            <div className="space-y-2 border-t border-slate-100 pt-5 text-sm text-slate-500"><div className="flex justify-between"><span>Subtotal</span><span>44,000 RWF</span></div><div className="flex justify-between"><span>Tax (18%)</span><span>7,920 RWF</span></div><div className="flex justify-between"><span>Discount</span><span>-0 RWF</span></div></div>
            <div className="flex justify-between text-xl font-bold text-blue-950"><span>Total</span><span>51,920 RWF</span></div>
            <button className="h-12 w-full rounded-md bg-blue-600 font-semibold text-white" onClick={() => onNavigate('pos')} type="button">Complete Sale</button>
          </div>
        </Card>
      </div>
      <Card className="mt-6 p-6">
        <h2 className="mb-5 text-xl font-semibold text-blue-950">Recent Sales History</h2>
        <SimpleTable headers={['Invoice ID', 'Customer', 'Date', 'Payment Method', 'Amount', 'Status', 'Action']} rows={[
          ['INV-2023-001', 'Eric M.', 'Oct 24, 10:30 AM', 'Mobile Money', '24,500 RWF', <Badge tone="green">Completed</Badge>, <Printer className="size-4 text-slate-500" />],
          ['INV-2023-002', 'Walk-in', 'Oct 24, 09:45 AM', 'Cash', '8,000 RWF', <Badge tone="green">Completed</Badge>, <Printer className="size-4 text-slate-500" />],
          ['INV-2023-003', 'Pastor John', 'Oct 24, 09:15 AM', 'Bank Transfer', '150,000 RWF', <Badge tone="green">Completed</Badge>, <Printer className="size-4 text-slate-500" />],
        ]} />
      </Card>
    </Shell>
  )
}

