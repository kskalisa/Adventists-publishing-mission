import { Download, MoreHorizontal, Plus } from 'lucide-react'
import { people } from '../../data/assets'
import type { PageProps } from '../../types/navigation'
import { Shell } from '../../components/layout'
import { Badge, Button, Card, FilterBar, PageHeader, SimpleTable, StatCard, UserCell } from '../../components/ui'

export function Sales({ active, onNavigate }: PageProps) {
  const rows = [
    ['#ORD-8291', 'Alice Uwase', 'Oct 24, 2023', 'Great Controversy', 'Kigali Central', '$120.00', 'Completed'],
    ['#ORD-8290', 'Jean-Pierre M.', 'Oct 24, 2023', 'Health Power', 'Butare Branch', '$850.00', 'Processing'],
    ['#ORD-8289', 'Grace N.', 'Oct 23, 2023', 'Steps to Christ', 'Kigali Central', '$15.00', 'Completed'],
    ['#ORD-8288', 'Emmanuel K.', 'Oct 23, 2023', 'Desire of Ages', 'Gisenyi Point', '$45.00', 'Cancelled'],
  ]

  return (
    <Shell active={active} onNavigate={onNavigate}>
      <PageHeader title="Sales Management" subtitle="Track and manage book sales across all branches" actions={<><Button variant="secondary" icon={Download}>Export Report</Button><Button icon={Plus}>New Order</Button></>} />
      <div className="grid gap-4 md:grid-cols-4">{['Total Revenue|$142,300', 'Total Orders|1,245', 'Avg. Order Value|$114.30', 'Pending Fulfillment|48'].map((s) => { const [label, value] = s.split('|'); return <StatCard key={label} stat={{ label, value }} /> })}</div>
      <div className="mt-6"><FilterBar placeholder="Search by Order ID, Customer..." filters={['Status: All', 'Branch: All Branches', 'Date: This Month']} /></div>
      <Card className="mt-6">
        <SimpleTable headers={['Order ID', 'Customer', 'Date', 'Items', 'Branch', 'Amount', 'Status', 'Actions']} rows={rows.map((row, index) => [row[0], <UserCell name={row[1]} src={people[index % people.length]} />, <span className="text-slate-400">{row[2]}</span>, <div>{row[3]}<p className="text-xs text-slate-400">+ {index + 1} other item</p></div>, row[4], <strong>{row[5]}</strong>, <Badge tone={row[6] === 'Processing' ? 'orange' : row[6] === 'Cancelled' ? 'gray' : 'green'}>{row[6]}</Badge>, <MoreHorizontal className="size-4 text-slate-400" />])} />
      </Card>
    </Shell>
  )
}
