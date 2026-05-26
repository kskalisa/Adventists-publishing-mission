import { Calendar, Download, RefreshCw } from 'lucide-react'
import type { PageProps } from '../../types/navigation'
import { Shell } from '../../components/layout'
import { Button, Card, PageHeader, Progress, StatCard } from '../../components/ui'

export function Reports({ active, onNavigate }: PageProps) {
  return (
    <Shell active={active} onNavigate={onNavigate}>
      <PageHeader title="Reports & Analytics" subtitle="Generate insights across sales, inventory, and distribution." actions={<><Button variant="secondary" icon={Calendar}>Last 30 Days</Button><Button icon={Download}>Export Data</Button></>} />
      <div className="mb-8 flex gap-8 overflow-x-auto border-b border-slate-200 text-sm font-medium text-slate-400"><span className="border-b-2 border-blue-700 px-6 py-4 text-blue-800">Sales Performance</span><span className="py-4">Inventory Health</span><span className="py-4">Publishing Output</span><span className="py-4">Distribution Logs</span></div>
      <Card className="mb-6 p-4"><div className="flex flex-wrap gap-4"><Button variant="secondary">All Branches</Button><Button variant="secondary">All Books</Button><Button variant="secondary" icon={RefreshCw}>Refresh</Button></div></Card>
      <div className="grid gap-6 md:grid-cols-4">{['Total Revenue|$124,500|+12%', 'Books Sold|14,230|+5%', 'Inventory Turnover|4.2x|-1.5%', 'Active Agents|45|0%'].map((s) => { const [label, value, helper] = s.split('|'); return <StatCard key={label} stat={{ label, value, helper }} /> })}</div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card className="p-6"><div className="mb-8 flex justify-between"><h2 className="font-semibold">Sales vs Target</h2><span className="text-xs text-slate-400">Target: $120,000</span></div><div className="flex h-72 items-end gap-4">{['h-28','h-40','h-32','h-52','h-44','h-64','h-56','h-72'].map((height, i) => <div className="flex flex-1 flex-col items-center gap-3" key={height}><div className={`w-full rounded-t bg-[#253f91] ${height}`} /><span className="text-xs text-slate-400">Week {i + 1}</span></div>)}</div></Card>
        <Card className="p-6"><h2 className="mb-20 font-semibold">Sales by Category</h2><Progress label="Spirit of Prophecy" value="45%" width="w-[45%]" color="bg-[#253f91]" /><Progress label="Health & Wellness" value="30%" width="w-[30%]" color="bg-blue-500" /><Progress label="Bibles" value="15%" width="w-[15%]" color="bg-sky-300" /><Progress label="Other" value="10%" width="w-[10%]" color="bg-slate-300" /></Card>
      </div>
    </Shell>
  )
}
