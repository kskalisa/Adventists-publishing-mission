import { ChevronLeft, ChevronRight, Download, MoreHorizontal, Plus } from 'lucide-react'
import { people } from '../../data/assets'
import type { PageProps } from '../../types/navigation'
import { Shell } from '../../components/layout'
import { Badge, Button, Card, PageHeader, SearchBox, Segmented, SimpleTable, StatCard, UserCell } from '../../components/ui'

export function Distribution({ active, onNavigate }: PageProps) {
  const shipments = [
    '#DST-24-089|Kigali Central ABC|350 Books|In Transit|Paul K.|Today, 2:00 PM',
    '#DST-24-092|Butare SDA Church|120 Hymnals|Pending|Unassigned|Tomorrow',
    '#DST-24-085|Gisenyi Mission Field|200 Sabbath Lessons|Delivered|Eric M.|Oct 12, 10:30 AM',
    '#DST-24-085|Gisenyi Mission Field|200 Sabbath Lessons|Delivered|Eric M.|Oct 12, 10:30 AM',
  ]

  return (
    <Shell active={active} onNavigate={onNavigate}>
      <PageHeader title="Distribution & Logistics" />
      <div className="grid gap-6 md:grid-cols-4">{['Shipments In Transit|8|3 Arriving today', 'Pending Dispatches|12|Awaiting driver assignment', 'Delivered (This Month)|156|', 'Returned Items|2|Processing refunds'].map((s) => { const [label, value, helper] = s.split('|'); return <StatCard key={label} stat={{ label, value, helper }} /> })}</div>
      <Card className="mt-6 p-4">
        <div className="flex flex-col gap-3 lg:flex-row"><div className="flex-1"><SearchBox placeholder="Search shipment ID, driver, or location..." /></div><Segmented items={['All', 'Pending', 'In Transit', 'Delivered']} /><Button variant="secondary" icon={Download}>Export Manifest</Button><Button icon={Plus}>New Shipment</Button></div>
      </Card>
      <Card className="mt-0 rounded-t-none">
        <SimpleTable
          headers={['', 'Shipment ID', 'Destination / Branch', 'Payload', 'Status', 'Driver / Courier', 'Est. Arrival', 'Actions']}
          rows={shipments.map((row, index) => {
            const [id, dest, payload, status, driver, eta] = row.split('|')
            return [
              <input type="checkbox" aria-label={`Select ${id}`} />,
              <span className="font-mono text-blue-600">{id}</span>,
              <div><strong>{dest}</strong><p className="text-xs text-slate-400">Rubavu District</p></div>,
              <div>{payload}<p className="text-xs text-slate-400">Box Count: {index + 4}</p></div>,
              <Badge tone={status === 'Delivered' ? 'green' : status === 'Pending' ? 'orange' : 'blue'}>{status}</Badge>,
              driver === 'Unassigned' ? <span className="text-slate-400">{driver}</span> : <UserCell name={driver} src={people[index % people.length]} />,
              eta,
              <MoreHorizontal className="size-4 text-slate-400" />,
            ]
          })}
        />
        <div className="flex items-center justify-between border-t border-slate-100 p-5 text-sm text-slate-500"><span>Showing 1-5 of 48 shipments</span><div className="flex gap-2"><Button variant="secondary" icon={ChevronLeft}> </Button><Button variant="secondary" icon={ChevronRight}> </Button></div></div>
      </Card>
    </Shell>
  )
}
