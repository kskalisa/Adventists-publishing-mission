import { ChevronDown, SlidersHorizontal, Users } from 'lucide-react'
import { useState } from 'react'
import { PaymentSuccessModal } from '../../components/forms'
import { coverImages } from '../../data/assets'
import type { PageProps } from '../../types/navigation'
import { Shell } from '../../components/layout'
import { Button, Card, SearchBox } from '../../components/ui'

export function PointOfSale({ active, onNavigate }: PageProps) {
  const products = ['SDA Hymnal (Hardcover)', 'The Great Controversy', 'Steps to Christ (Pocket)', 'Holy Bible (KJV, Black)', 'Quarterly Lesson (Q4 2024)', 'Ministry of Healing']
  const [showSuccess, setShowSuccess] = useState(false)

  return (
    <Shell active={active} onNavigate={onNavigate} title="Point of Sale" role="sales">
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div>
          <div className="mb-6 flex gap-3"><SearchBox placeholder="Search by title, ISBN, or SKU..." /><Button variant="secondary" icon={SlidersHorizontal}> </Button></div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {products.concat(products.slice(3, 5)).map((product, index) => <Card className="overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md" key={`${product}${index}`}><img className="h-36 w-full object-cover" src={coverImages[index % coverImages.length]} alt="" /><div className="p-3"><h3 className="font-semibold">{product}</h3><p className="mt-1 text-xs text-slate-500">SKU: SOP-{index + 1}</p><p className="mt-2 font-bold text-blue-600">${index === 2 ? '2.50' : index === 4 ? '3.00' : '15.00'}</p></div></Card>)}
          </div>
        </div>
        <Card className="flex min-h-[760px] flex-col p-5">
          <button className="mb-8 flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 p-4 text-left" type="button"><span className="flex items-center gap-3"><Users className="size-5" /><span><strong>Walk-in Customer</strong><p className="text-xs text-slate-400">Retail sale</p></span></span><ChevronDown className="size-4" /></button>
          <div className="divide-y divide-slate-100">
            {['SDA Hymnal (Hardcover)|$30.00|2', 'Quarterly Lesson (Q4)|$15.00|5', 'Steps to Christ|$2.50|1'].map((item) => { const [name, price, qty] = item.split('|'); return <div className="flex items-start justify-between py-5" key={name}><div><p className="font-semibold">{name}</p><p className="text-sm text-slate-500">{price} x {qty}</p></div><div className="text-right"><p className="text-lg font-bold">{price}</p><div className="mt-2 inline-flex overflow-hidden rounded border border-slate-200 text-sm"><button className="bg-slate-100 px-3" type="button">-</button><span className="px-4">{qty}</span><button className="bg-slate-100 px-3" type="button">+</button></div></div></div> })}
          </div>
          <div className="mt-auto border-t border-slate-100 pt-5">
            {['Subtotal|$47.50', 'Discount|$0.00', 'Tax (18%)|$8.55'].map((row) => { const [label, value] = row.split('|'); return <div className="mb-2 flex justify-between text-slate-500" key={label}><span>{label}</span><span>{value}</span></div> })}
            <div className="mt-5 flex justify-between text-2xl font-bold"><span>Total</span><span>$56.05</span></div>
            <div className="mt-6 grid grid-cols-2 gap-3"><Button variant="danger">Cancel</Button><Button variant="secondary">Hold Order</Button></div>
            <button className="mt-3 h-12 w-full rounded-md bg-blue-600 font-semibold text-white transition hover:bg-blue-700" onClick={() => setShowSuccess(true)} type="button">Proceed to Payment</button>
          </div>
        </Card>
      </div>
      {showSuccess && <PaymentSuccessModal onClose={() => setShowSuccess(false)} />}
    </Shell>
  )
}
