import { Briefcase, Calendar, Printer } from 'lucide-react'
import type { PageProps } from '../../types/navigation'
import { Shell } from '../../components/layout'
import { Badge, Button, Card, PageHeader, Progress, SimpleTable, StatCard } from '../../components/ui'

export function DailySummary({ active, onNavigate }: PageProps) {
  return (
    <Shell active={active} onNavigate={onNavigate} role="sales">
      <PageHeader title="Daily Sales Summary" subtitle="Overview of today's transactions and register status." actions={<><Button variant="secondary" icon={Calendar}>Today, Oct 24, 2024</Button><Button variant="secondary" icon={Printer}>Print Report</Button><Button icon={Briefcase}>Close Register</Button></>} />
      <div className="grid gap-5 md:grid-cols-4">{['Total Sales|450,000 RWF|vs yesterday', 'Transactions|32|Average 14,062 RWF per tx', 'Items Sold|56|Across 12 different titles', 'Sales Target|90%|50,000 RWF remaining'].map((s) => { const [label, value, helper] = s.split('|'); return <StatCard key={label} stat={{ label, value, helper }} /> })}</div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_345px]">
        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-semibold text-blue-950">Recent Transactions</h2><Button variant="secondary">View All</Button></div>
          <SimpleTable headers={['Time', 'Receipt', 'Customer', 'Items', 'Total', 'Payment']} rows={[
            ['14:30', '#INV-1042', 'Walk-in', '3', '40,000 RWF', <Badge tone="blue">Cash</Badge>],
            ['14:15', '#INV-1041', 'Kigali SDA Church', '15', '180,000 RWF', <Badge tone="purple">Bank</Badge>],
            ['13:50', '#INV-1040', 'John M.', '1', '12,500 RWF', <Badge tone="orange">MoMo</Badge>],
            ['13:10', '#INV-1039', 'Walk-in', '2', '25,000 RWF', <Badge tone="blue">Card</Badge>],
          ]} />
        </Card>
        <div className="space-y-6">
          <Card className="p-6"><h2 className="mb-6 text-lg font-semibold text-blue-950">Payment Methods</h2><Progress label="Cash" value="120,000 RWF" width="w-[40%]" color="bg-blue-600" /><Progress label="Mobile Money (MoMo)" value="200,000 RWF" width="w-[65%]" color="bg-amber-500" /><Progress label="Bank Transfer" value="80,000 RWF" width="w-[26%]" color="bg-purple-500" /><Progress label="Card" value="50,000 RWF" width="w-[16%]" color="bg-blue-500" /></Card>
          <Card className="p-6"><h2 className="mb-6 text-lg font-semibold text-blue-950">Top Selling Titles Today</h2>{['Adult Sabbath School Quarterly|20 sold|2,500 RWF', 'The Great Controversy|12 sold|12,500 RWF', 'Steps to Christ (Kinya.)|8 sold|3,000 RWF'].map((item) => { const [title, sold, price] = item.split('|'); return <div className="flex justify-between border-b border-slate-100 py-4 last:border-0" key={title}><div><p className="font-semibold text-blue-950">{title}</p><p className="text-sm text-slate-500">{price}</p></div><strong>{sold}</strong></div> })}</Card>
        </div>
      </div>
    </Shell>
  )
}

