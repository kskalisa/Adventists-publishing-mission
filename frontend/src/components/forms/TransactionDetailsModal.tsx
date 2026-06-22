import { Mail, Printer, RotateCcw } from 'lucide-react'
import { people } from '../../data/assets'
import { printCurrentPage } from '../../lib/actions'
import { money } from '../../lib/api'
import type { Sale } from '../../lib/api'
import { Badge, Button, Modal, SimpleTable, UserCell } from '../ui'

export function TransactionDetailsModal({ onClose, sale }: { onClose: () => void; sale: Sale }) {
  return (
    <Modal
      title="Transaction Details"
      size="lg"
      onClose={onClose}
      footer={<><Button variant="danger" icon={RotateCcw}>Process Refund</Button><div className="flex-1" /><Button variant="secondary" icon={Mail}>Email Receipt</Button><Button icon={Printer} onClick={printCurrentPage}>Print Receipt</Button></>}
    >
      <p className="-mt-4 mb-6 text-sm text-slate-500">Invoice #{sale.id.toString().padStart(5, '0')} - Created on {new Date(sale.createdAt).toLocaleString()} <Badge tone="green">{sale.status}</Badge></p>
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="mb-3 font-semibold text-blue-950">Customer Information</h3>
          <div className="rounded-md bg-blue-50 p-4"><UserCell name={sale.customerName} sub={sale.customerId ? `Customer #${sale.customerId}` : 'Retail sale'} src={sale.customerId ? people[1] : undefined} /></div>
          <div className="mt-4 space-y-2 text-sm"><div className="flex justify-between"><span className="text-slate-500">Customer ID</span><strong>{sale.customerId ?? 'Walk-in'}</strong></div><div className="flex justify-between"><span className="text-slate-500">Customer Type</span><strong>{sale.customerId ? 'Registered' : 'Walk-in'}</strong></div></div>
        </div>
        <div>
          <h3 className="mb-3 font-semibold text-blue-950">Payment Details</h3>
          <div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-slate-500">Payment Method</span><strong>Cash</strong></div><div className="flex justify-between"><span className="text-slate-500">Cashier</span><strong>{sale.cashierName ?? 'Unassigned'}</strong></div><div className="flex justify-between"><span className="text-slate-500">Terminal</span><strong>POS-01 (Kigali Main)</strong></div></div>
        </div>
      </div>
      <h3 className="mt-8 mb-4 text-xl font-bold">Purchased Items ({sale.items.length})</h3>
      <SimpleTable headers={['Item Description', 'SKU', 'Price', 'Qty', 'Total']} rows={sale.items.map((item) => [item.title, `BOOK-${item.bookId}`, money(item.unitPrice), item.quantity.toString(), money(item.lineTotal)])} />
      <div className="ml-auto mt-6 max-w-xs space-y-2 text-sm"><div className="flex justify-between"><span className="text-slate-500">Subtotal</span><strong>{money(sale.subtotal)}</strong></div><div className="flex justify-between"><span className="text-slate-500">Tax (18% VAT included)</span><strong>{money(sale.tax)}</strong></div><div className="flex justify-between"><span className="text-slate-500">Discount</span><strong>- {money(sale.discount)}</strong></div><div className="flex justify-between border-t border-slate-200 pt-3 text-base"><strong>Total Amount</strong><strong>{money(sale.total)}</strong></div></div>
    </Modal>
  )
}
