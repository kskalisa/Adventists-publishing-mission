import { Briefcase, Calendar, Printer } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { printCurrentPage } from '../../lib/actions'
import { listSales, money } from '../../lib/api'
import type { Sale } from '../../lib/api'
import type { PageProps } from '../../types/navigation'
import { Shell } from '../../components/layout'
import { Badge, Button, Card, PageHeader, Progress, SimpleTable, StatCard } from '../../components/ui'

const DAILY_TARGET = 600000

export function DailySummary({ active, onNavigate }: PageProps) {
  const [sales, setSales] = useState<Sale[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    listSales().then(setSales).catch((error) => setError(error instanceof Error ? error.message : 'Unable to load daily sales.'))
  }, [])

  const todaySales = useMemo(() => {
    const today = new Date().toDateString()
    return sales.filter((sale) => new Date(sale.createdAt).toDateString() === today)
  }, [sales])
  const visibleSales = todaySales.length ? todaySales : sales
  const total = visibleSales.reduce((sum, sale) => sum + sale.total, 0)
  const itemsSold = visibleSales.reduce((sum, sale) => sum + sale.items.reduce((inner, item) => inner + item.quantity, 0), 0)
  const average = visibleSales.length ? total / visibleSales.length : 0
  const targetProgress = Math.min(Math.round((total / DAILY_TARGET) * 100), 100)
  const remaining = Math.max(DAILY_TARGET - total, 0)
  const topItems = new Map<string, { quantity: number; revenue: number }>()
  visibleSales.forEach((sale) => sale.items.forEach((item) => {
    const current = topItems.get(item.title) ?? { quantity: 0, revenue: 0 }
    topItems.set(item.title, { quantity: current.quantity + item.quantity, revenue: current.revenue + item.lineTotal })
  }))
  const topTitles = [...topItems.entries()].sort((a, b) => b[1].quantity - a[1].quantity).slice(0, 3)

  return (
    <Shell active={active} onNavigate={onNavigate} role="sales">
      <PageHeader title="Daily Sales Summary" subtitle="Overview of today's transactions and register status." actions={<><Button variant="secondary" icon={Calendar}>Today</Button><Button variant="secondary" icon={Printer} onClick={printCurrentPage}>Print Report</Button><Button icon={Briefcase} onClick={() => onNavigate('sales-history')}>Close Register</Button></>} />
      {error && <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      <div className="grid gap-5 md:grid-cols-4">{[
        { label: 'Total Sales', value: money(total), helper: todaySales.length ? 'Today' : 'Recent sales' },
        { label: 'Transactions', value: visibleSales.length.toString(), helper: `Average ${money(average)} per tx` },
        { label: 'Items Sold', value: itemsSold.toString(), helper: `Across ${topItems.size} different titles` },
        { label: 'Sales Target', value: `${targetProgress}%`, helper: `${money(remaining)} remaining` },
      ].map((stat) => <StatCard key={stat.label} stat={stat} />)}</div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_345px]">
        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-semibold text-blue-950">Recent Transactions</h2><Button variant="secondary" onClick={() => onNavigate('sales-history')}>View All</Button></div>
          <SimpleTable headers={['Time', 'Receipt', 'Customer', 'Items', 'Total', 'Payment']} rows={visibleSales.map((sale) => [new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), `#INV-${sale.id.toString().padStart(5, '0')}`, sale.customerName, sale.items.reduce((sum, item) => sum + item.quantity, 0).toString(), money(sale.total), <Badge tone="blue">Cash</Badge>])} />
        </Card>
        <div className="space-y-6">
          <Card className="p-6"><h2 className="mb-6 text-lg font-semibold text-blue-950">Payment Methods</h2><Progress label="Cash" value={money(total)} width={targetProgress} color="bg-blue-600" /><Progress label="Mobile Money (MoMo)" value={money(0)} width={0} color="bg-amber-500" /><Progress label="Bank Transfer" value={money(0)} width={0} color="bg-purple-500" /><Progress label="Card" value={money(0)} width={0} color="bg-blue-500" /></Card>
          <Card className="p-6"><h2 className="mb-6 text-lg font-semibold text-blue-950">Top Selling Titles Today</h2>{topTitles.map(([title, item]) => <div className="flex justify-between border-b border-slate-100 py-4 last:border-0" key={title}><div><p className="font-semibold text-blue-950">{title}</p><p className="text-sm text-slate-500">{money(item.revenue)}</p></div><strong>{item.quantity} sold</strong></div>)}</Card>
        </div>
      </div>
    </Shell>
  )
}
