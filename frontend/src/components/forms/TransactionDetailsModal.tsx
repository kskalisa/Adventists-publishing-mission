import { Mail, Printer, RotateCcw } from 'lucide-react'
import { people } from '../../data/assets'
import { Badge, Button, Modal, SimpleTable, UserCell } from '../ui'

export function TransactionDetailsModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal
      title="Transaction Details"
      size="lg"
      onClose={onClose}
      footer={<><Button variant="danger" icon={RotateCcw}>Process Refund</Button><div className="flex-1" /><Button variant="secondary" icon={Mail}>Email Receipt</Button><Button icon={Printer}>Print Receipt</Button></>}
    >
      <p className="-mt-4 mb-6 text-sm text-slate-500">Invoice #INV-00923 • Created on Oct 24, 2023 at 10:42 AM <Badge tone="green">Completed</Badge></p>
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="mb-3 font-semibold text-blue-950">Customer Information</h3>
          <div className="rounded-md bg-blue-50 p-4"><UserCell name="Alice M." sub="alicem@example.com" src={people[1]} /></div>
          <div className="mt-4 space-y-2 text-sm"><div className="flex justify-between"><span className="text-slate-500">Phone</span><strong>+250 788 123 456</strong></div><div className="flex justify-between"><span className="text-slate-500">Customer Type</span><strong>Registered Member</strong></div></div>
        </div>
        <div>
          <h3 className="mb-3 font-semibold text-blue-950">Payment Details</h3>
          <div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-slate-500">Payment Method</span><strong>Cash</strong></div><div className="flex justify-between"><span className="text-slate-500">Cashier</span><strong>Jean-Claude N.</strong></div><div className="flex justify-between"><span className="text-slate-500">Terminal</span><strong>POS-01 (Kigali Main)</strong></div></div>
        </div>
      </div>
      <h3 className="mt-8 mb-4 text-xl font-bold">Purchased Items (3)</h3>
      <SimpleTable headers={['Item Description', 'SKU', 'Price', 'Qty', 'Total']} rows={[
        ['The Great Controversy', 'BK-ENG-001', '4,500', '1', '4,500'],
        ['The Desire of Ages', 'BK-ENG-004', '4,000', '1', '4,000'],
        ['Ministry of Healing', 'BK-ENG-008', '4,000', '1', '4,000'],
      ]} />
      <div className="ml-auto mt-6 max-w-xs space-y-2 text-sm"><div className="flex justify-between"><span className="text-slate-500">Subtotal</span><strong>RWF 12,500</strong></div><div className="flex justify-between"><span className="text-slate-500">Tax (18% VAT included)</span><strong>RWF 1,907</strong></div><div className="flex justify-between"><span className="text-slate-500">Discount</span><strong>- RWF 0</strong></div><div className="flex justify-between border-t border-slate-200 pt-3 text-base"><strong>Total Amount</strong><strong>RWF 12,500</strong></div></div>
    </Modal>
  )
}

