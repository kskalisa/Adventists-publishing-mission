import { ChevronLeft, ChevronRight, Download, Edit3, Eye, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { people } from '../../data/assets'
import { downloadCsv } from '../../lib/actions'
import type { PageProps } from '../../types/navigation'
import { Shell } from '../../components/layout'
import { Badge, Button, Card, Modal, PageHeader, SearchBox, Segmented, SimpleTable, StatCard, UserCell } from '../../components/ui'

type Shipment = {
  id: string
  destination: string
  payload: string
  status: 'Pending' | 'In Transit' | 'Delivered'
  driver: string
  eta: string
  district: string
  boxes: number
}

const initialShipments: Shipment[] = [
  { id: '#DST-24-089', destination: 'Kigali Central ABC', payload: '350 Books', status: 'In Transit', driver: 'Paul K.', eta: 'Today, 2:00 PM', district: 'Kigali', boxes: 4 },
  { id: '#DST-24-092', destination: 'Butare SDA Church', payload: '120 Hymnals', status: 'Pending', driver: 'Unassigned', eta: 'Tomorrow', district: 'Huye', boxes: 5 },
  { id: '#DST-24-085', destination: 'Gisenyi Mission Field', payload: '200 Sabbath Lessons', status: 'Delivered', driver: 'Eric M.', eta: 'Oct 12, 10:30 AM', district: 'Rubavu', boxes: 6 },
]

export function Distribution({ active, onNavigate }: PageProps) {
  const [shipments, setShipments] = useState(initialShipments)
  const [showModal, setShowModal] = useState(false)
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null)
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null)
  const [deletingShipment, setDeletingShipment] = useState<Shipment | null>(null)

  const createShipment = (shipment: Omit<Shipment, 'id' | 'status'>) => {
    setShipments((current) => [{ ...shipment, id: `#DST-${new Date().getFullYear().toString().slice(-2)}-${String(current.length + 100).padStart(3, '0')}`, status: 'Pending' }, ...current])
    setShowModal(false)
  }
  const updateShipment = (shipment: Shipment) => {
    setShipments((current) => current.map((item) => item.id === shipment.id ? shipment : item))
    setEditingShipment(null)
  }
  const deleteShipment = () => {
    if (!deletingShipment) return
    setShipments((current) => current.filter((item) => item.id !== deletingShipment.id))
    setDeletingShipment(null)
  }

  return (
    <Shell active={active} onNavigate={onNavigate}>
      <PageHeader title="Distribution & Logistics" />
      <div className="grid gap-6 md:grid-cols-4">{[
        { label: 'Shipments In Transit', value: shipments.filter((shipment) => shipment.status === 'In Transit').length.toString(), helper: 'Currently on the road' },
        { label: 'Pending Dispatches', value: shipments.filter((shipment) => shipment.status === 'Pending').length.toString(), helper: 'Awaiting driver assignment' },
        { label: 'Delivered', value: shipments.filter((shipment) => shipment.status === 'Delivered').length.toString(), helper: 'Recorded deliveries' },
        { label: 'Returned Items', value: '0', helper: 'Processing refunds' },
      ].map((stat) => <StatCard key={stat.label} stat={stat} />)}</div>
      <Card className="mt-6 p-4">
        <div className="flex flex-col gap-3 lg:flex-row"><div className="flex-1"><SearchBox placeholder="Search shipment ID, driver, or location..." /></div><Segmented items={['All', 'Pending', 'In Transit', 'Delivered']} /><Button variant="secondary" icon={Download} onClick={() => downloadCsv('shipments.csv', ['Shipment ID', 'Destination', 'Payload', 'Status', 'Driver', 'ETA'], shipments.map((shipment) => [shipment.id, shipment.destination, shipment.payload, shipment.status, shipment.driver, shipment.eta]))}>Export Manifest</Button><Button icon={Plus} onClick={() => setShowModal(true)}>New Shipment</Button></div>
      </Card>
      <Card className="mt-0 rounded-t-none">
        <SimpleTable
          headers={['', 'Shipment ID', 'Destination / Branch', 'Payload', 'Status', 'Driver / Courier', 'Est. Arrival', 'Actions']}
          rows={shipments.map((shipment, index) => [
            <input type="checkbox" aria-label={`Select ${shipment.id}`} />,
            <span className="font-mono text-blue-600">{shipment.id}</span>,
            <div><strong>{shipment.destination}</strong><p className="text-xs text-slate-400">{shipment.district} District</p></div>,
            <div>{shipment.payload}<p className="text-xs text-slate-400">Box Count: {shipment.boxes}</p></div>,
            <Badge tone={shipment.status === 'Delivered' ? 'green' : shipment.status === 'Pending' ? 'orange' : 'blue'}>{shipment.status}</Badge>,
            shipment.driver === 'Unassigned' ? <span className="text-slate-400">{shipment.driver}</span> : <UserCell name={shipment.driver} src={people[index % people.length]} />,
            shipment.eta,
            <div className="flex gap-3 text-slate-400"><button aria-label={`View ${shipment.id}`} onClick={() => setSelectedShipment(shipment)} type="button"><Eye className="size-4" /></button><button aria-label={`Edit ${shipment.id}`} onClick={() => setEditingShipment(shipment)} type="button"><Edit3 className="size-4" /></button><button aria-label={`Delete ${shipment.id}`} onClick={() => setDeletingShipment(shipment)} type="button"><Trash2 className="size-4 text-red-500" /></button></div>,
          ])}
        />
        <div className="flex items-center justify-between border-t border-slate-100 p-5 text-sm text-slate-500"><span>Showing {shipments.length} shipment(s)</span><div className="flex gap-2"><Button variant="secondary" icon={ChevronLeft}> </Button><Button variant="secondary" icon={ChevronRight}> </Button></div></div>
      </Card>
      {showModal && <ShipmentModal onClose={() => setShowModal(false)} onSubmit={createShipment} />}
      {editingShipment && <ShipmentStatusModal shipment={editingShipment} onClose={() => setEditingShipment(null)} onSubmit={updateShipment} />}
      {deletingShipment && <Modal title="Delete shipment?" onClose={() => setDeletingShipment(null)} footer={<><Button variant="secondary" onClick={() => setDeletingShipment(null)}>Cancel</Button><Button variant="danger" icon={Trash2} onClick={deleteShipment}>Delete Shipment</Button></>}><p className="text-sm leading-6 text-slate-600">This removes <strong className="text-blue-950">{deletingShipment.id}</strong> from the current logistics board.</p></Modal>}
      {selectedShipment && <Modal title="Shipment details" onClose={() => setSelectedShipment(null)} footer={<Button onClick={() => setSelectedShipment(null)}>Done</Button>}><div className="space-y-3 text-sm text-slate-600"><p><strong className="text-blue-950">{selectedShipment.id}</strong></p><p>Destination: {selectedShipment.destination}</p><p>Payload: {selectedShipment.payload}</p><p>Boxes: {selectedShipment.boxes}</p><p>Status: {selectedShipment.status}</p><p>Driver: {selectedShipment.driver}</p><p>ETA: {selectedShipment.eta}</p></div></Modal>}
    </Shell>
  )
}

function ShipmentStatusModal({ shipment, onClose, onSubmit }: { shipment: Shipment; onClose: () => void; onSubmit: (shipment: Shipment) => void }) {
  const [status, setStatus] = useState<Shipment['status']>(shipment.status)
  const [driver, setDriver] = useState(shipment.driver)
  const [eta, setEta] = useState(shipment.eta)

  return (
    <Modal title={`Update ${shipment.id}`} onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={() => onSubmit({ ...shipment, status, driver, eta })}>Save Changes</Button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label><span className="mb-2 block text-sm font-medium">Status</span><select className="h-10 w-full rounded-md border border-slate-200 px-3" value={status} onChange={(event) => setStatus(event.target.value as Shipment['status'])}><option>Pending</option><option>In Transit</option><option>Delivered</option></select></label>
        <label><span className="mb-2 block text-sm font-medium">Driver</span><input className="h-10 w-full rounded-md border border-slate-200 px-3" value={driver} onChange={(event) => setDriver(event.target.value)} /></label>
        <label className="sm:col-span-2"><span className="mb-2 block text-sm font-medium">Estimated Arrival</span><input className="h-10 w-full rounded-md border border-slate-200 px-3" value={eta} onChange={(event) => setEta(event.target.value)} /></label>
      </div>
    </Modal>
  )
}

function ShipmentModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (shipment: Omit<Shipment, 'id' | 'status'>) => void }) {
  const [form, setForm] = useState({ destination: '', payload: '', driver: 'Unassigned', eta: '', district: '', boxes: '1' })
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }))

  return (
    <Modal title="New Shipment" onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={() => onSubmit({ ...form, boxes: Number(form.boxes || 1) })}>Create Shipment</Button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label><span className="mb-2 block text-sm font-medium">Destination</span><input className="h-10 w-full rounded-md border border-slate-200 px-3" value={form.destination} onChange={(event) => update('destination', event.target.value)} /></label>
        <label><span className="mb-2 block text-sm font-medium">District</span><input className="h-10 w-full rounded-md border border-slate-200 px-3" value={form.district} onChange={(event) => update('district', event.target.value)} /></label>
        <label><span className="mb-2 block text-sm font-medium">Payload</span><input className="h-10 w-full rounded-md border border-slate-200 px-3" value={form.payload} onChange={(event) => update('payload', event.target.value)} /></label>
        <label><span className="mb-2 block text-sm font-medium">Boxes</span><input className="h-10 w-full rounded-md border border-slate-200 px-3" type="number" min="1" value={form.boxes} onChange={(event) => update('boxes', event.target.value)} /></label>
        <label><span className="mb-2 block text-sm font-medium">Driver</span><input className="h-10 w-full rounded-md border border-slate-200 px-3" value={form.driver} onChange={(event) => update('driver', event.target.value)} /></label>
        <label><span className="mb-2 block text-sm font-medium">ETA</span><input className="h-10 w-full rounded-md border border-slate-200 px-3" value={form.eta} onChange={(event) => update('eta', event.target.value)} /></label>
      </div>
    </Modal>
  )
}
