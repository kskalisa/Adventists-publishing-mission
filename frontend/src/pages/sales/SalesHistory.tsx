import { Download, Eye, Printer } from 'lucide-react'
import { useState } from 'react'
import { TransactionDetailsModal } from '../../components/forms'
import { people } from '../../data/assets'
import type { PageProps } from '../../types/navigation'
import { Shell } from '../../components/layout'
import { Badge, Button, Card, PageHeader, SearchBox, SimpleTable, StatCard, UserCell } from '../../components/ui'

export function SalesHistory({ active, onNavigate }: PageProps) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <Shell active={active} onNavigate={onNavigate} role="sales">
      <PageHeader title="Sales Transaction History" actions={<><Button variant="secondary" icon={Download}>Export CSV</Button><Button icon={Printer}>Print Report</Button></>} />
      <div className="grid gap-4 md:grid-cols-4">{['Total Sales Today|RWF 450,000', 'Transactions|34', 'Average Value|RWF 13,235', 'Returns|1'].map((s) => { const [label, value] = s.split('|'); return <StatCard key={label} stat={{ label, value }} /> })}</div>
      <Card className="mt-6 p-5"><div className="grid gap-4 md:grid-cols-[1fr_160px_210px_130px]"><SearchBox placeholder="Search Invoice ID or Customer" /><button className="text-sm">All Statuses⌄</button><button className="text-sm">All Payment Methods⌄</button><button className="text-sm text-slate-500">Showing: <strong className="text-slate-900">10</strong>⌄</button></div></Card>
      <Card className="mt-6">
        <SimpleTable headers={['', 'Invoice ID', 'Customer', 'Items Summary', 'Total Amount', 'Payment', 'Status', 'Date & Time', 'Actions']} rows={[
          ['#INV-00923', 'Alice M.', '3 Books (The Great Controv...)', 'RWF 12,500', 'Cash', 'Completed', 'Oct 24, 10:42 AM'],
          ['#INV-00922', 'Walk-in Customer', '1 Book (Steps to Christ)', 'RWF 3,500', 'MoMo', 'Completed', 'Oct 24, 09:15 AM'],
          ['#INV-00921', 'Pastor John K.', '5 Books (Admin Bundle)', 'RWF 45,000', 'Bank Transfer', 'Pending', 'Oct 23, 04:30 PM'],
          ['#INV-00920', 'Walk-in Customer', '1 Book (Sabbath School)', 'RWF 1,500', 'Cash', 'Refunded', 'Oct 23, 02:15 PM'],
        ].map((row, index) => [<input type="checkbox" aria-label={`Select ${row[0]}`} />, <span className="font-mono text-blue-950">{row[0]}</span>, <UserCell name={row[1]} src={index === 1 || index === 3 ? undefined : people[index % people.length]} />, <span className="text-slate-500">{row[2]}</span>, <strong className="text-blue-950">{row[3]}</strong>, row[4], <Badge tone={row[5] === 'Pending' ? 'orange' : row[5] === 'Refunded' ? 'red' : 'green'}>{row[5]}</Badge>, <span className="text-slate-500">{row[6]}</span>, <div className="flex gap-4 text-slate-500"><button onClick={() => setShowDetails(true)} type="button"><Eye className="size-4" /></button><Printer className="size-4" /></div>])} />
      </Card>
      {showDetails && <TransactionDetailsModal onClose={() => setShowDetails(false)} />}
    </Shell>
  )
}

