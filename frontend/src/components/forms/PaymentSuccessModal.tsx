import { Check, Printer } from 'lucide-react'
import { printCurrentPage } from '../../lib/actions'
import { money } from '../../lib/api'
import type { Sale } from '../../lib/api'
import { Button, Modal } from '../ui'

export function PaymentSuccessModal({ onClose, sale }: { onClose: () => void; sale: Sale }) {
  return (
    <Modal
      title=""
      onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Close</Button><Button icon={Printer} onClick={printCurrentPage}>Print Receipt</Button></>}
    >
      <div className="text-center">
        <div className="mx-auto grid size-10 place-items-center rounded-md bg-blue-600 text-white"><Check className="size-6" /></div>
        <h2 className="mt-4 text-xl font-bold">Payment Successful</h2>
        <p className="mt-2 text-slate-400">Receipt {sale.receiptNumber ?? `#${sale.id.toString().padStart(5, '0')}`}</p>
        <div className="my-6 border-t border-dashed border-slate-200" />
        <div className="space-y-3 text-left text-sm">
          <div className="flex justify-between"><span className="text-slate-400">Date</span><span>{new Date(sale.createdAt).toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Customer</span><span>{sale.customerName}</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Cashier</span><strong>{sale.cashierName ?? 'Unassigned'}</strong></div>
          <div className="flex justify-between"><span className="text-slate-400">Payment Method</span><strong>{paymentLabel(sale.paymentMethod)}</strong></div>
          {sale.paymentReference && <div className="flex justify-between"><span className="text-slate-400">Reference</span><strong>{sale.paymentReference}</strong></div>}
          <div className="flex justify-between"><span className="text-slate-400">Payment Status</span><strong>{sale.paymentStatus}</strong></div>
          <div className="flex justify-between border-t border-slate-100 pt-4 text-base"><strong>Amount Paid</strong><strong>{money(sale.amountPaid)}</strong></div>
          {sale.balanceDue > 0 && <div className="flex justify-between text-red-600"><strong>Balance Due</strong><strong>{money(sale.balanceDue)}</strong></div>}
        </div>
      </div>
    </Modal>
  )
}

function paymentLabel(method: Sale['paymentMethod']) {
  if (!method) return 'Unspecified'
  return method.split('_').map((part) => part[0] + part.slice(1).toLowerCase()).join(' ')
}
