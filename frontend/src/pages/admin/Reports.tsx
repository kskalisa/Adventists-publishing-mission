import { Calendar, Download, Package, RefreshCw, ShoppingCart, TrendingUp } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { PageProps } from '../../types/navigation'
import { Shell } from '../../components/layout'
import { Badge, Button, Card, PageHeader, Progress, SimpleTable, StatCard } from '../../components/ui'
import { formatDate, listBooks, listSales, listStockAdjustments, money } from '../../lib/api'
import type { Book, Sale, StockAdjustment } from '../../lib/api'

function Bars({ values }: { values: number[] }) {
  const safeValues = values.length ? values : [0, 0, 0, 0, 0, 0]
  const max = Math.max(...safeValues, 1)
  return <div className="flex h-64 items-end gap-4">{safeValues.slice(0, 8).map((value, index) => <div className="flex flex-1 flex-col items-center gap-3" key={`${value}-${index}`}><div className="w-full rounded-t bg-blue-700" style={{ height: `${Math.max((value / max) * 100, 8)}%` }} /><span className="text-xs font-medium text-slate-500">#{index + 1}</span></div>)}</div>
}

export function Reports({ active, onNavigate }: PageProps) {
  const [books, setBooks] = useState<Book[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([])
  const [error, setError] = useState('')

  const load = () => {
    setError('')
    Promise.all([listBooks(), listSales(), listStockAdjustments()])
      .then(([books, sales, adjustments]) => { setBooks(books); setSales(sales); setAdjustments(adjustments) })
      .catch((error) => setError(error instanceof Error ? error.message : 'Unable to load analytics.'))
  }

  useEffect(load, [])

  const revenue = sales.reduce((sum, sale) => sum + sale.total, 0)
  const booksSold = sales.reduce((sum, sale) => sum + sale.items.reduce((inner, item) => inner + item.quantity, 0), 0)
  const stockValue = books.reduce((sum, book) => sum + book.price * book.stockQuantity, 0)
  const lowStock = books.filter((book) => book.status !== 'IN_STOCK')
  const categoryCounts = useMemo(() => [...books.reduce((map, book) => map.set(book.category, (map.get(book.category) ?? 0) + 1), new Map<string, number>()).entries()], [books])
  const topTitles = useMemo(() => [...sales.reduce((map, sale) => {
    sale.items.forEach((item) => map.set(item.title, (map.get(item.title) ?? 0) + item.quantity))
    return map
  }, new Map<string, number>()).entries()].sort((a, b) => b[1] - a[1]).slice(0, 6), [sales])

  return (
    <Shell active={active} onNavigate={onNavigate}>
      <PageHeader title="Analytics" subtitle="Live sales, inventory, and stock movement insights." actions={<><Button variant="secondary" icon={Calendar}>Live Data</Button><Button variant="secondary" icon={RefreshCw} onClick={load}>Refresh</Button><Button icon={Download} onClick={() => window.print()}>Export</Button></>} />
      {error && <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      <div className="grid gap-6 md:grid-cols-4"><StatCard stat={{ label: 'Total Revenue', value: money(revenue), helper: `${sales.length} sale(s)`, icon: TrendingUp, tone: 'green' }} /><StatCard stat={{ label: 'Books Sold', value: booksSold.toString(), helper: 'Units sold', icon: ShoppingCart, tone: 'blue' }} /><StatCard stat={{ label: 'Stock Value', value: money(stockValue), helper: `${books.length} title(s)`, icon: Package }} /><StatCard stat={{ label: 'Stock Alerts', value: lowStock.length.toString(), helper: 'Low or out of stock', tone: lowStock.length ? 'orange' : 'green' }} /></div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card className="p-6"><div className="mb-8 flex justify-between"><div><h2 className="font-semibold text-blue-950">Sales Performance</h2><p className="text-sm text-slate-500">Recent invoice totals from the API.</p></div><Badge tone="green">{money(revenue)}</Badge></div><Bars values={sales.map((sale) => sale.total)} /></Card>
        <Card className="p-6"><h2 className="mb-6 font-semibold text-blue-950">Inventory by Category</h2>{categoryCounts.map(([category, count]) => <Progress key={category} label={category} value={`${count}`} width={Math.min((count / Math.max(books.length, 1)) * 100, 100)} color="bg-blue-700" />)}</Card>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card className="p-6"><h2 className="mb-5 font-semibold text-blue-950">Top Selling Titles</h2>{topTitles.length ? topTitles.map(([title, count]) => <Progress key={title} label={title} value={`${count} sold`} width={Math.min(count * 12, 100)} color="bg-emerald-600" />) : <p className="text-sm text-slate-500">No sales recorded yet.</p>}</Card>
        <Card className="p-6"><h2 className="mb-5 font-semibold text-blue-950">Recent Stock Movements</h2><SimpleTable headers={['Book', 'Type', 'Qty', 'Date']} rows={adjustments.slice(0, 6).map((item) => [item.bookTitle, item.type.replaceAll('_', ' '), item.quantityDelta > 0 ? `+${item.quantityDelta}` : item.quantityDelta.toString(), formatDate(item.createdAt)])} /></Card>
      </div>
    </Shell>
  )
}
