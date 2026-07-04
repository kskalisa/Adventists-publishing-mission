import { AlertTriangle, CalendarDays, Download, Filter, Package, RefreshCw, ShoppingCart, TrendingUp, Users, WalletCards, XCircle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { PageProps } from '../../types/navigation'
import { Shell } from '../../components/layout'
import { Badge, Button, Card, PageHeader, SimpleTable, StatCard } from '../../components/ui'
import { downloadReportCsv, exportReportPdf } from '../../lib/actions'
import { getAdminAnalyticsSummary, money } from '../../lib/api'
import type { AdminAnalyticsFilters, AdminAnalyticsSummary, InventoryRisk, ProductionOrderStatus, SaleStatus } from '../../lib/api'

type ChartDatum = { label: string; value: number; helper?: string }
type SectionReportKey = 'top-selling-titles' | 'top-customers' | 'inventory-risks' | 'reprint-demand' | 'payment-reconciliation' | 'production-pipeline' | 'sales-status' | 'inventory-categories'

type SectionReport = {
  key: SectionReportKey
  label: string
  title: string
  filename: string
  metrics?: Array<{ label: string; value: string | number; helper?: string | number }>
  headers: string[]
  rows: Array<Array<string | number>>
}

function EmptyReportPanel({ message }: { message: string }) {
  return <div className="grid min-h-32 place-items-center rounded-md border border-dashed border-slate-200 bg-slate-50 px-4 text-center text-sm text-slate-500">{message}</div>
}

function labelize(value: string) {
  return value.split('_').map((part) => part[0] + part.slice(1).toLowerCase()).join(' ')
}

function riskTone(risk: InventoryRisk['riskLevel']) {
  if (risk === 'OUT_OF_STOCK') return 'red'
  if (risk === 'LOW_STOCK') return 'orange'
  if (risk === 'DEMAND_RISK') return 'purple'
  return 'blue'
}

function productionTone(status: ProductionOrderStatus) {
  if (status === 'RECEIVED') return 'green'
  if (status === 'CANCELLED') return 'gray'
  if (status === 'APPROVED' || status === 'IN_PROGRESS') return 'blue'
  return 'orange'
}

function chartColor(index: number) {
  return ['#1d4ed8', '#059669', '#d97706', '#7c3aed', '#dc2626', '#0891b2', '#4f46e5', '#16a34a'][index % 8]
}

function ChartHeader({ title, subtitle, badge }: { title: string; subtitle?: string; badge?: string }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <h2 className="font-semibold text-blue-950">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
      {badge && <Badge tone="blue">{badge}</Badge>}
    </div>
  )
}

function LineAreaChart({ values }: { values: ChartDatum[] }) {
  if (!values.length) return <EmptyReportPanel message="No trend data available." />
  const width = 720
  const height = 260
  const padding = { top: 18, right: 26, bottom: 42, left: 54 }
  const max = Math.max(...values.map((item) => item.value), 1)
  const xStep = values.length > 1 ? (width - padding.left - padding.right) / (values.length - 1) : 0
  const y = (value: number) => padding.top + (1 - value / max) * (height - padding.top - padding.bottom)
  const x = (index: number) => padding.left + index * xStep
  const points = values.map((item, index) => `${x(index)},${y(item.value)}`).join(' ')
  const area = `${padding.left},${height - padding.bottom} ${points} ${x(values.length - 1)},${height - padding.bottom}`

  return (
    <div className="overflow-hidden rounded-md border border-slate-100 bg-white">
      <svg className="h-72 w-full" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Revenue trend chart">
        <defs>
          <linearGradient id="revenue-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.03" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
          const top = padding.top + tick * (height - padding.top - padding.bottom)
          const value = Math.round(max * (1 - tick))
          return <g key={tick}><line x1={padding.left} x2={width - padding.right} y1={top} y2={top} stroke="#e2e8f0" /><text x={padding.left - 10} y={top + 4} textAnchor="end" fontSize="10" fill="#64748b">{value ? money(value).replace('RWF', '').trim() : '0'}</text></g>
        })}
        <polygon points={area} fill="url(#revenue-fill)" />
        <polyline points={points} fill="none" stroke="#1d4ed8" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        {values.map((item, index) => <circle key={item.label} cx={x(index)} cy={y(item.value)} r="4" fill="#ffffff" stroke="#1d4ed8" strokeWidth="2"><title>{`${item.label}: ${money(item.value)}`}</title></circle>)}
        {values.map((item, index) => index % Math.ceil(values.length / 6) === 0 || index === values.length - 1 ? <text key={item.label} x={x(index)} y={height - 16} textAnchor="middle" fontSize="11" fill="#64748b">{item.label}</text> : null)}
      </svg>
    </div>
  )
}

function HorizontalBarChart({ values, valueLabel = (value) => value.toString(), emptyMessage }: { values: ChartDatum[]; valueLabel?: (value: number) => string; emptyMessage: string }) {
  const visible = values.filter((item) => item.value > 0).slice(0, 8)
  if (!visible.length) return <EmptyReportPanel message={emptyMessage} />
  const max = Math.max(...visible.map((item) => item.value), 1)
  return (
    <div className="space-y-4">
      {visible.map((item, index) => (
        <div key={item.label}>
          <div className="mb-1 flex items-center justify-between gap-3 text-sm"><span className="truncate font-medium text-slate-700">{item.label}</span><span className="shrink-0 text-slate-500">{item.helper ?? valueLabel(item.value)}</span></div>
          <div className="h-3 rounded-full bg-slate-100"><div className="h-3 rounded-full" style={{ width: `${Math.max((item.value / max) * 100, 5)}%`, backgroundColor: chartColor(index) }} /></div>
        </div>
      ))}
    </div>
  )
}

function DonutChart({ values, valueLabel = (value) => value.toString(), emptyMessage }: { values: ChartDatum[]; valueLabel?: (value: number) => string; emptyMessage: string }) {
  const visible = values.filter((item) => item.value > 0).slice(0, 6)
  const total = visible.reduce((sum, item) => sum + item.value, 0)
  if (!visible.length || total <= 0) return <EmptyReportPanel message={emptyMessage} />
  let offset = 25
  const radius = 34
  const circumference = 2 * Math.PI * radius
  return (
    <div className="grid gap-5 sm:grid-cols-[180px_1fr] sm:items-center">
      <svg viewBox="0 0 100 100" className="mx-auto size-44" role="img" aria-label="Donut chart">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="13" />
        {visible.map((item, index) => {
          const dash = (item.value / total) * circumference
          const circle = <circle key={item.label} cx="50" cy="50" r={radius} fill="none" stroke={chartColor(index)} strokeWidth="13" strokeDasharray={`${dash} ${circumference - dash}`} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 50 50)"><title>{`${item.label}: ${valueLabel(item.value)}`}</title></circle>
          offset -= dash
          return circle
        })}
        <text x="50" y="48" textAnchor="middle" className="fill-blue-950 text-[10px] font-bold">{visible.length}</text>
        <text x="50" y="61" textAnchor="middle" className="fill-slate-500 text-[6px]">segments</text>
      </svg>
      <div className="space-y-3">
        {visible.map((item, index) => <div className="flex items-center justify-between gap-3 text-sm" key={item.label}><span className="flex min-w-0 items-center gap-2"><i className="size-3 shrink-0 rounded-full" style={{ backgroundColor: chartColor(index) }} /><span className="truncate text-slate-700">{item.label}</span></span><strong className="shrink-0 text-blue-950">{valueLabel(item.value)}</strong></div>)}
      </div>
    </div>
  )
}

const EMPTY_FILTERS: AdminAnalyticsFilters = {
  from: '',
  to: '',
  category: '',
  customerType: '',
  saleStatus: '',
  paymentStatus: '',
  fulfillmentMethod: '',
  productionStatus: '',
}

const SALE_STATUSES: SaleStatus[] = ['PENDING', 'APPROVED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'REJECTED', 'PAID', 'HELD', 'CANCELLED']

function dateInputValue(date: Date) {
  return date.toISOString().slice(0, 10)
}

function filterCount(filters: AdminAnalyticsFilters) {
  return Object.values(filters).filter(Boolean).length
}

function toDocument(reports: SectionReport[], filterCaption: string) {
  const single = reports.length === 1 ? reports[0] : null
  return {
    title: single ? single.title : 'Selected Analytics Reports',
    subtitle: `${filterCaption}. Generated from the currently filtered analytics view.`,
    filename: single ? single.filename : 'selected-analytics-reports',
    metrics: single?.metrics,
    tables: reports.map((report) => ({ title: report.title, headers: report.headers, rows: report.rows })),
  }
}

function buildSectionReports(summary: AdminAnalyticsSummary): SectionReport[] {
  return [
    {
      key: 'top-selling-titles',
      label: 'Top Selling Titles',
      title: 'Top Selling Titles',
      filename: 'top-selling-titles',
      metrics: [
        { label: 'Units Sold', value: summary.topSellingTitles.reduce((sum, item) => sum + item.unitsSold, 0) },
        { label: 'Revenue', value: money(summary.topSellingTitles.reduce((sum, item) => sum + item.revenue, 0)) },
      ],
      headers: ['Title', 'Category', 'Units Sold', 'Revenue', 'Stock', 'Reorder Level'],
      rows: summary.topSellingTitles.map((item) => [item.title, item.category, item.unitsSold, money(item.revenue), item.stockQuantity, item.reorderLevel]),
    },
    {
      key: 'top-customers',
      label: 'Top Customers',
      title: 'Top Customers',
      filename: 'top-customers',
      metrics: [
        { label: 'Customers', value: summary.topCustomers.length },
        { label: 'Revenue', value: money(summary.topCustomers.reduce((sum, item) => sum + item.revenue, 0)) },
        { label: 'Outstanding', value: money(summary.topCustomers.reduce((sum, item) => sum + item.outstandingBalance, 0)) },
      ],
      headers: ['Customer', 'Type', 'Orders', 'Revenue', 'Outstanding Balance'],
      rows: summary.topCustomers.map((item) => [item.name, labelize(item.type), item.orderCount, money(item.revenue), money(item.outstandingBalance)]),
    },
    {
      key: 'inventory-risks',
      label: 'Inventory Risks',
      title: 'Inventory Risk and Reorder Suggestions',
      filename: 'inventory-risk-and-reorder-suggestions',
      metrics: [
        { label: 'At-risk Titles', value: summary.inventoryRisks.length },
        { label: 'Suggested Units', value: summary.inventoryRisks.reduce((sum, item) => sum + item.suggestedReorderQuantity, 0) },
      ],
      headers: ['Title', 'Category', 'Risk', 'Stock', 'Reorder Level', 'Demand', 'Suggested Units'],
      rows: summary.inventoryRisks.map((item) => [item.title, item.category, labelize(item.riskLevel), item.stockQuantity, item.reorderLevel, item.requestedQuantity, item.suggestedReorderQuantity]),
    },
    {
      key: 'reprint-demand',
      label: 'Reprint Demand',
      title: 'Customer Reprint Demand',
      filename: 'customer-reprint-demand',
      metrics: [
        { label: 'Requested Units', value: summary.reprintDemand.reduce((sum, item) => sum + item.requestedQuantity, 0) },
        { label: 'Titles Requested', value: summary.reprintDemand.length },
      ],
      headers: ['Title', 'Customers', 'Requested Quantity', 'Stock', 'Reorder Level'],
      rows: summary.reprintDemand.map((item) => [item.title, item.customerCount, item.requestedQuantity, item.stockQuantity, item.reorderLevel]),
    },
    {
      key: 'payment-reconciliation',
      label: 'Payment Reconciliation',
      title: 'Payment Reconciliation',
      filename: 'payment-reconciliation',
      metrics: [
        { label: 'Paid Revenue', value: money(summary.overview.paidRevenue) },
        { label: 'Outstanding Balance', value: money(summary.overview.outstandingBalance) },
        { label: 'Cancelled/Rejected Value', value: money(summary.overview.cancelledOrRejectedValue) },
      ],
      headers: ['Payment Method', 'Records', 'Paid Value'],
      rows: summary.paymentBreakdown.map((item) => [labelize(item.name), item.count, money(item.value)]),
    },
    {
      key: 'production-pipeline',
      label: 'Production Pipeline',
      title: 'Production Pipeline and Budget',
      filename: 'production-pipeline-and-budget',
      metrics: [
        { label: 'Planned / Active Cost', value: money(summary.overview.productionPlannedCost) },
        { label: 'Received Cost', value: money(summary.overview.productionReceivedCost) },
      ],
      headers: ['Status', 'Orders', 'Units', 'Estimated Cost'],
      rows: summary.productionPipeline.map((item) => [labelize(item.status), item.orders, item.units, money(item.estimatedCost)]),
    },
    {
      key: 'sales-status',
      label: 'Sales Status',
      title: 'Sales Status Breakdown',
      filename: 'sales-status-breakdown',
      metrics: [{ label: 'Sales / Orders', value: summary.overview.totalSales }],
      headers: ['Status', 'Records', 'Value'],
      rows: summary.salesByStatus.map((item) => [labelize(item.name), item.count, money(item.value)]),
    },
    {
      key: 'inventory-categories',
      label: 'Inventory Categories',
      title: 'Inventory Value by Category',
      filename: 'inventory-value-by-category',
      metrics: [{ label: 'Stock Value', value: money(summary.overview.stockValue) }],
      headers: ['Category', 'Titles', 'Stock Value'],
      rows: summary.inventoryByCategory.map((item) => [item.name, item.count, money(item.value)]),
    },
  ]
}

export function Reports({ active, onNavigate }: PageProps) {
  const [summary, setSummary] = useState<AdminAnalyticsSummary | null>(null)
  const [filters, setFilters] = useState<AdminAnalyticsFilters>(EMPTY_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState<AdminAnalyticsFilters>(EMPTY_FILTERS)
  const [selectedReportKeys, setSelectedReportKeys] = useState<SectionReportKey[]>(['top-selling-titles', 'top-customers'])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const load = (nextFilters: AdminAnalyticsFilters = filters) => {
    setLoading(true)
    setError('')
    setAppliedFilters(nextFilters)
    getAdminAnalyticsSummary(nextFilters)
      .then(setSummary)
      .catch((error) => setError(error instanceof Error ? error.message : 'Unable to load analytics.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load(EMPTY_FILTERS)
  }, [])

  const updateFilter = <K extends keyof AdminAnalyticsFilters>(key: K, value: AdminAnalyticsFilters[K]) => {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  const applyPreset = (days: number) => {
    const to = new Date()
    const from = new Date()
    from.setDate(to.getDate() - days + 1)
    setFilters((current) => ({ ...current, from: dateInputValue(from), to: dateInputValue(to) }))
  }

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS)
    load(EMPTY_FILTERS)
  }

  const activeFilterCount = filterCount(appliedFilters)
  const filterCaption = activeFilterCount ? `${activeFilterCount} filter(s) applied` : 'All records'
  const sectionReports = useMemo(() => summary ? buildSectionReports(summary) : [], [summary])
  const selectedReports = sectionReports.filter((item) => selectedReportKeys.includes(item.key))
  const selectedDocument = selectedReports.length ? toDocument(selectedReports, filterCaption) : null

  const toggleReport = (key: SectionReportKey) => {
    setSelectedReportKeys((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key])
  }

  return (
    <Shell active={active} onNavigate={onNavigate}>
      <PageHeader title="Analytics" subtitle={`Operational intelligence for revenue, inventory, customer demand, and production. ${filterCaption}.`} actions={<><Button variant="secondary" icon={RefreshCw} onClick={() => load(appliedFilters)}>{loading ? 'Loading...' : 'Refresh'}</Button></>} />

      <Card className="mb-6 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-950"><Filter className="size-4" /> Report Filters</div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" icon={CalendarDays} onClick={() => applyPreset(7)}>Last 7 days</Button>
            <Button variant="secondary" icon={CalendarDays} onClick={() => applyPreset(30)}>Last 30 days</Button>
            <Button variant="secondary" icon={XCircle} onClick={clearFilters}>Clear</Button>
            <Button icon={Filter} onClick={() => load(filters)}>Apply</Button>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">From<input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-normal normal-case text-slate-700 outline-none focus:border-blue-500" type="date" value={filters.from} onChange={(event) => updateFilter('from', event.target.value)} /></label>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">To<input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-normal normal-case text-slate-700 outline-none focus:border-blue-500" type="date" value={filters.to} onChange={(event) => updateFilter('to', event.target.value)} /></label>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Category<input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-normal normal-case text-slate-700 outline-none focus:border-blue-500" list="analytics-categories" value={filters.category} onChange={(event) => updateFilter('category', event.target.value)} placeholder="All categories" /></label>
          <datalist id="analytics-categories">{summary?.inventoryByCategory.map((item) => <option value={item.name} key={item.name} />)}</datalist>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sale Status<select className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-normal normal-case text-slate-700 outline-none focus:border-blue-500" value={filters.saleStatus} onChange={(event) => updateFilter('saleStatus', event.target.value as SaleStatus | '')}><option value="">All sale statuses</option>{SALE_STATUSES.map((item) => <option value={item} key={item}>{labelize(item)}</option>)}</select></label>
        </div>
      </Card>

      <Card className="mb-6 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-blue-950">Export Sections</h2>
            <p className="text-sm text-slate-500">Tick one or more analytics sections to include in the download.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" icon={Download} disabled={!selectedDocument} onClick={() => selectedDocument && downloadReportCsv(selectedDocument)}>Download CSV</Button>
            <Button icon={Download} disabled={!selectedDocument} onClick={() => selectedDocument && exportReportPdf(selectedDocument)}>Download PDF</Button>
          </div>
        </div>
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
          {sectionReports.map((item) => <label className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700" key={item.key}><input className="size-4 accent-blue-700" type="checkbox" checked={selectedReportKeys.includes(item.key)} onChange={() => toggleReport(item.key)} />{item.label}</label>)}
        </div>
      </Card>

      {error && <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      {!summary ? (
        <EmptyReportPanel message={loading ? 'Loading analytics...' : 'No analytics loaded yet.'} />
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-4">
            <StatCard stat={{ label: 'Gross Revenue', value: money(summary.overview.grossRevenue), helper: `${summary.overview.totalSales} sale/order record(s)`, icon: TrendingUp, tone: 'green' }} />
            <StatCard stat={{ label: 'Outstanding', value: money(summary.overview.outstandingBalance), helper: `${summary.overview.openCustomerOrders} open order(s)`, icon: WalletCards, tone: summary.overview.outstandingBalance > 0 ? 'orange' : 'green' }} />
            <StatCard stat={{ label: 'Books Sold', value: summary.topSellingTitles.reduce((sum, item) => sum + item.unitsSold, 0).toString(), helper: `${money(summary.overview.averageOrderValue)} average order`, icon: ShoppingCart, tone: 'blue' }} />
            <StatCard stat={{ label: 'Stock Alerts', value: summary.overview.stockAlerts.toString(), helper: `${money(summary.overview.stockValue)} stock value`, icon: AlertTriangle, tone: summary.overview.stockAlerts ? 'orange' : 'green' }} />
          </div>

          <Card className="mt-6 p-5">
            <h2 className="font-semibold text-blue-950">Management Recommendations</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {summary.recommendations.map((item) => <div className="rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-950" key={item}>{item}</div>)}
            </div>
          </Card>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <Card className="p-6">
              <ChartHeader title="Revenue Trend" subtitle="Paid value grouped by sale date." badge={money(summary.overview.paidRevenue)} />
              <LineAreaChart values={summary.revenueTrend.map((item) => ({ label: item.label, value: item.value }))} />
            </Card>
            <Card className="p-6">
              <ChartHeader title="Payment Reconciliation" subtitle="Paid value by payment method." />
              <DonutChart values={summary.paymentBreakdown.map((item) => ({ label: labelize(item.name), value: item.value }))} valueLabel={money} emptyMessage="No payments recorded yet." />
              <div className="mt-5 rounded-md bg-slate-50 p-4 text-sm text-slate-600">
                <div className="flex justify-between"><span>Paid revenue</span><strong>{money(summary.overview.paidRevenue)}</strong></div>
                <div className="mt-2 flex justify-between"><span>Outstanding balance</span><strong>{money(summary.overview.outstandingBalance)}</strong></div>
                <div className="mt-2 flex justify-between"><span>Cancelled/rejected value</span><strong>{money(summary.overview.cancelledOrRejectedValue)}</strong></div>
              </div>
            </Card>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <Card className="p-6">
              <ChartHeader title="Sales Status" subtitle="Order lifecycle distribution." />
              <DonutChart values={summary.salesByStatus.map((item) => ({ label: labelize(item.name), value: item.count }))} emptyMessage="No sales or orders yet." />
            </Card>
            <Card className="p-6">
              <ChartHeader title="Fulfillment Mix" subtitle="Pickup compared with delivery." />
              <DonutChart values={summary.fulfillmentBreakdown.map((item) => ({ label: labelize(item.name), value: item.count }))} emptyMessage="No fulfillment records yet." />
            </Card>
            <Card className="p-6">
              <ChartHeader title="Customer Types" subtitle="Customer base composition." />
              <HorizontalBarChart values={summary.customerTypeBreakdown.map((item) => ({ label: labelize(item.name), value: item.count }))} emptyMessage="No customers registered yet." />
            </Card>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
            <Card className="p-6">
              <ChartHeader title="Top Selling Titles" subtitle="Units sold by title." />
              <HorizontalBarChart values={summary.topSellingTitles.map((item) => ({ label: item.title, value: item.unitsSold, helper: `${item.unitsSold} units | ${money(item.revenue)}` }))} emptyMessage="No sold titles yet. Create POS sales or customer orders." />
              {summary.topSellingTitles.some((item) => item.unitsSold > 0) && <div className="mt-6"><SimpleTable headers={['Title', 'Category', 'Units', 'Revenue', 'Stock']} rows={summary.topSellingTitles.filter((item) => item.unitsSold > 0).map((item) => [item.title, item.category, item.unitsSold.toString(), money(item.revenue), item.stockQuantity.toString()])} /></div>}
            </Card>
            <Card className="p-6">
              <ChartHeader title="Top Customers" subtitle="Revenue by customer." />
              <HorizontalBarChart values={summary.topCustomers.map((item) => ({ label: item.name, value: item.revenue, helper: `${money(item.revenue)} | ${item.orderCount} orders` }))} valueLabel={money} emptyMessage="No customer purchase history yet." />
              {summary.topCustomers.length > 0 && <div className="mt-6"><SimpleTable headers={['Customer', 'Type', 'Orders', 'Revenue', 'Outstanding']} rows={summary.topCustomers.map((item) => [item.name, labelize(item.type), item.orderCount.toString(), money(item.revenue), money(item.outstandingBalance)])} /></div>}
            </Card>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <Card className="p-6">
              <ChartHeader title="Inventory Risk & Reorder Suggestions" subtitle="Titles needing replenishment attention." />
              {summary.inventoryRisks.length ? <SimpleTable headers={['Title', 'Risk', 'Stock', 'Demand', 'Suggested']} rows={summary.inventoryRisks.map((item) => [item.title, <Badge tone={riskTone(item.riskLevel)}>{labelize(item.riskLevel)}</Badge>, `${item.stockQuantity} / ${item.reorderLevel}`, item.requestedQuantity.toString(), item.suggestedReorderQuantity.toString()])} /> : <EmptyReportPanel message="No inventory risk detected." />}
            </Card>
            <Card className="p-6">
              <ChartHeader title="Inventory Value by Category" subtitle="Stock value distribution." />
              <HorizontalBarChart values={summary.inventoryByCategory.map((item) => ({ label: item.name, value: item.value, helper: `${money(item.value)} | ${item.count} titles` }))} valueLabel={money} emptyMessage="No inventory categories found." />
            </Card>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
            <Card className="p-6">
              <ChartHeader title="Customer Reprint Demand" subtitle="Open requests by title." />
              <HorizontalBarChart values={summary.reprintDemand.map((item) => ({ label: item.title, value: item.requestedQuantity, helper: `${item.requestedQuantity} requested | ${item.customerCount} customers` }))} emptyMessage="No open customer book requests yet." />
              {summary.reprintDemand.length > 0 && <div className="mt-6"><SimpleTable headers={['Title', 'Customers', 'Requested', 'Stock']} rows={summary.reprintDemand.map((item) => [item.title, item.customerCount.toString(), item.requestedQuantity.toString(), `${item.stockQuantity} on hand`])} /></div>}
            </Card>
            <Card className="p-6">
              <ChartHeader title="Production Pipeline & Budget" subtitle="Orders and estimated costs by status." />
              <DonutChart values={summary.productionPipeline.map((item) => ({ label: labelize(item.status), value: item.estimatedCost || item.units, helper: `${item.orders} orders` }))} valueLabel={(value) => money(value)} emptyMessage="No production orders yet." />
              {summary.productionPipeline.length ? <div className="mt-6"><SimpleTable headers={['Status', 'Orders', 'Units', 'Estimated Cost']} rows={summary.productionPipeline.map((item) => [<Badge tone={productionTone(item.status)}>{labelize(item.status)}</Badge>, item.orders.toString(), item.units.toString(), money(item.estimatedCost)])} /></div> : null}
              <div className="mt-5 rounded-md bg-slate-50 p-4 text-sm text-slate-600">
                <div className="flex justify-between"><span>Planned / active cost</span><strong>{money(summary.overview.productionPlannedCost)}</strong></div>
                <div className="mt-2 flex justify-between"><span>Received cost</span><strong>{money(summary.overview.productionReceivedCost)}</strong></div>
              </div>
            </Card>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <StatCard stat={{ label: 'Active Customers', value: summary.overview.activeCustomers.toString(), helper: 'Approved and managed customers', icon: Users, tone: 'blue' }} />
            <StatCard stat={{ label: 'Open Book Requests', value: summary.overview.openBookRequests.toString(), helper: 'Demand waiting for restock', icon: Package, tone: summary.overview.openBookRequests ? 'orange' : 'green' }} />
            <StatCard stat={{ label: 'Catalog Size', value: summary.overview.totalBooks.toString(), helper: 'Book titles in inventory', icon: Package, tone: 'blue' }} />
          </div>
        </>
      )}
    </Shell>
  )
}




