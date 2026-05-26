import { AlertTriangle, Package, Zap } from 'lucide-react'
import { people } from '../../data/assets'
import type { PageProps } from '../../types/navigation'
import { Shell } from '../../components/layout'
import { Badge, Card, SimpleTable, StatCard, UserCell } from '../../components/ui'

function Announcement({ title, tone }: { title: string; tone: 'gray' | 'blue' | 'dashed' }) {
  const styles = {
    gray: 'bg-slate-100',
    blue: 'bg-blue-50',
    dashed: 'border border-dashed border-slate-200 bg-white',
  }

  return (
    <article className={`rounded-md p-4 text-sm ${styles[tone]}`}>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-slate-500">Scheduled updates and reports are available for administrators.</p>
      <p className="mt-3 text-xs text-slate-400">Oct 23, 2023</p>
    </article>
  )
}

export function Dashboard({ active, onNavigate }: PageProps) {
  const stats = [
    { label: 'Total Users', value: '24,592' },
    { label: 'Total Titles', value: '1,483' },
    { label: 'Monthly Sales', value: '$142,300' },
    { label: 'Active Branches', value: '18' },
  ]

  return (
    <Shell active={active} onNavigate={onNavigate}>
      <div className="grid gap-6 xl:grid-cols-[1fr_270px]">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map((stat) => <StatCard key={stat.label} stat={stat} />)}</div>
          <div className="grid gap-6 lg:grid-cols-[2fr_220px]">
            <Card className="p-5">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-semibold">Sales Trend</h2>
                <span className="rounded bg-slate-50 px-3 py-1 text-xs text-slate-400">Last 6 Months</span>
              </div>
              <div className="relative h-48 overflow-hidden">
                <div className="absolute inset-x-0 top-8 border-t border-slate-100" />
                <div className="absolute inset-x-0 top-20 border-t border-slate-100" />
                <div className="absolute inset-x-0 top-32 border-t border-slate-100" />
                <svg className="h-full w-full" viewBox="0 0 520 190" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M0 140 L90 115 L175 150 L260 88 L345 62 L430 102 L520 35 L520 190 L0 190 Z" fill="#dbeafe" opacity="0.7" />
                  <path d="M0 140 L90 115 L175 150 L260 88 L345 62 L430 102 L520 35" fill="none" stroke="#1769ff" strokeWidth="3" />
                </svg>
                <div className="absolute bottom-0 flex w-full justify-between text-xs text-slate-400">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map((month) => <span key={month}>{month}</span>)}
                </div>
              </div>
            </Card>
            <Card className="flex flex-col items-center justify-center p-5">
              <h2 className="mb-16 self-start font-semibold">Inventory Status</h2>
              <p className="text-3xl font-bold">85%</p>
              <p className="text-xs text-slate-400">In Stock</p>
              <div className="mt-16 flex gap-4 text-xs text-slate-600">
                <span className="flex items-center gap-2"><i className="size-2 rounded-full bg-blue-600" />Available</span>
                <span className="flex items-center gap-2"><i className="size-2 rounded-full bg-amber-400" />Low</span>
                <span className="flex items-center gap-2"><i className="size-2 rounded-full bg-slate-300" />Out</span>
              </div>
            </Card>
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            <Card className="p-5">
              <h2 className="font-semibold">Top Selling Books</h2>
              <div className="mt-10 flex h-32 items-end gap-5 border-b border-slate-200 px-2">
                {['h-16', 'h-24', 'h-20', 'h-28', 'h-36'].map((height) => <div className={`flex-1 rounded-t bg-blue-600 ${height}`} key={height} />)}
              </div>
              <div className="mt-3 grid grid-cols-5 text-[11px] text-slate-400">
                {['Great Cont.', 'Desire Ages', 'Steps Christ', 'Health Pwr', 'Bible Std'].map((label) => <span key={label}>{label}</span>)}
              </div>
            </Card>
            <Card>
              <h2 className="p-5 font-semibold">Recent Activity</h2>
              <div className="divide-y divide-slate-100">
                {[
                  ['New order #8291', '2 mins ago', '$120.00'],
                  ['New customer registered', '15 mins ago', ''],
                  ['Stock updated: Health Power', '1 hour ago', '+50'],
                ].map((item) => (
                  <div className="flex items-center justify-between px-5 py-4" key={item[0]}>
                    <div className="flex items-center gap-3">
                      <span className="grid size-8 place-items-center rounded-full bg-slate-100"><Package className="size-4" /></span>
                      <div><p className="text-sm font-medium">{item[0]}</p><p className="text-xs text-slate-400">{item[1]}</p></div>
                    </div>
                    <span className="text-sm font-semibold">{item[2]}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
          <Card className="p-5">
            <h2 className="mb-5 font-semibold">Audit Logs</h2>
            <SimpleTable
              headers={['User', 'Action', 'Resource', 'Date', 'Status']}
              rows={[
                [<UserCell name="Sarah M." src={people[1]} />, 'Login Attempt', 'System Access', 'Oct 24, 10:23 AM', <Badge tone="green">Success</Badge>],
                [<UserCell name="David K." src={people[2]} />, 'Update Inventory', 'Warehouse A', 'Oct 24, 09:45 AM', <Badge tone="green">Completed</Badge>],
                [<UserCell name="System" />, 'Backup Database', 'Daily Backup', 'Oct 24, 04:00 AM', <Badge tone="green">Success</Badge>],
              ]}
            />
          </Card>
        </div>
        <aside className="space-y-6">
          <Card className="p-5">
            <h2 className="mb-4 flex items-center gap-2 font-semibold"><AlertTriangle className="size-5 text-red-500" />Low Stock Alerts</h2>
            {['Child Guidance|Only 3 left|Restock', 'Education|Only 8 left|Restock', 'Evangelism||Review'].map((row) => {
              const [title, sub, action] = row.split('|')
              return <div className="flex items-center justify-between border-b border-slate-100 py-3 last:border-0" key={title}><div><p className="text-sm font-medium">{title}</p>{sub && <p className="text-xs text-red-500">{sub}</p>}</div><button className="rounded bg-slate-100 px-3 py-1 text-xs" type="button">{action}</button></div>
            })}
          </Card>
          <Card className="p-5">
            <h2 className="mb-4 flex items-center gap-2 font-semibold"><Zap className="size-5 text-blue-600" />Announcements</h2>
            <div className="space-y-4">
              <Announcement title="System Maintenance" tone="gray" />
              <Announcement title="Quarterly Report" tone="blue" />
              <Announcement title="Inventory Audit" tone="dashed" />
            </div>
          </Card>
        </aside>
      </div>
    </Shell>
  )
}
