import { Check, Printer } from 'lucide-react'
import { Button, Modal } from '../ui'

export function PaymentSuccessModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal
      title=""
      onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Close</Button><Button icon={Printer}>Print Receipt</Button></>}
    >
      <div className="text-center">
        <div className="mx-auto grid size-10 place-items-center rounded-md bg-blue-600 text-white"><Check className="size-6" /></div>
        <h2 className="mt-4 text-xl font-bold">Payment Successful</h2>
        <p className="mt-2 text-slate-400">Transaction ID: TXN-8839201</p>
        <div className="my-6 border-t border-dashed border-slate-200" />
        <div className="space-y-3 text-left text-sm">
          <div className="flex justify-between"><span className="text-slate-400">Date</span><span>Oct 24, 2024, 14:30</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Customer</span><span>Jean Baptiste</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Payment Method</span><strong>Mobile Money</strong></div>
          <div className="flex justify-between border-t border-slate-100 pt-4 text-base"><strong>Amount Paid</strong><strong>RWF 23,010</strong></div>
        </div>
      </div>
    </Modal>
  )
}

