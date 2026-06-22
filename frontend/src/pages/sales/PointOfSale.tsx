import { ChevronDown, SlidersHorizontal, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { PaymentSuccessModal } from '../../components/forms'
import { coverImages } from '../../data/assets'
import { createSale, getCurrentUser, listBooks, listCustomers, money } from '../../lib/api'
import type { Book, Customer, Sale } from '../../lib/api'
import type { PageProps } from '../../types/navigation'
import { Shell } from '../../components/layout'
import { Button, Card, SearchBox } from '../../components/ui'

type CartItem = {
  book: Book
  quantity: number
}

export function PointOfSale({ active, onNavigate }: PageProps) {
  const [books, setBooks] = useState<Book[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [customerId, setCustomerId] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [error, setError] = useState('')
  const [completedSale, setCompletedSale] = useState<Sale | null>(null)
  const currentUser = getCurrentUser()
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.book.price * item.quantity, 0), [cart])
  const tax = subtotal * 0.18
  const total = subtotal + tax

  useEffect(() => {
    listBooks().then(setBooks).catch((error) => setError(error instanceof Error ? error.message : 'Unable to load books.'))
    listCustomers().then(setCustomers).catch(() => undefined)
  }, [])

  const addToCart = (book: Book) => {
    if (book.stockQuantity <= 0) return
    setCart((current) => {
      const existing = current.find((item) => item.book.id === book.id)
      if (existing) {
        return current.map((item) => item.book.id === book.id ? { ...item, quantity: Math.min(item.quantity + 1, book.stockQuantity) } : item)
      }
      return [...current, { book, quantity: 1 }]
    })
  }

  const updateQuantity = (bookId: number, delta: number) => {
    setCart((current) => current.flatMap((item) => {
      if (item.book.id !== bookId) return [item]
      const quantity = Math.min(Math.max(item.quantity + delta, 0), item.book.stockQuantity)
      return quantity === 0 ? [] : [{ ...item, quantity }]
    }))
  }

  const submitSale = async () => {
    if (cart.length === 0) {
      setError('Add at least one book before proceeding to payment.')
      return
    }
    setError('')
    try {
      const sale = await createSale({
        customerId: customerId ? Number(customerId) : undefined,
        cashierId: currentUser?.id,
        status: 'PAID',
        discount: 0,
        items: cart.map((item) => ({ bookId: item.book.id, quantity: item.quantity })),
      })
      setCart([])
      setCompletedSale(sale)
      setBooks(await listBooks())
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to complete sale.')
    }
  }

  return (
    <Shell active={active} onNavigate={onNavigate} title="Point of Sale" role="sales">
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div>
          <div className="mb-6 flex gap-3"><SearchBox placeholder="Search by title, ISBN, or SKU..." /><Button variant="secondary" icon={SlidersHorizontal}> </Button></div>
          {error && <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {books.map((book, index) => <button className="text-left" key={book.id} onClick={() => addToCart(book)} type="button"><Card className="overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md"><img className="h-36 w-full object-cover" src={book.coverImageUrl ?? coverImages[index % coverImages.length]} alt="" /><div className="p-3"><h3 className="font-semibold">{book.title}</h3><p className="mt-1 text-xs text-slate-500">ISBN: {book.isbn}</p><p className="mt-2 font-bold text-blue-600">{money(book.price)}</p><p className="mt-1 text-xs text-slate-400">{book.stockQuantity} in stock</p></div></Card></button>)}
          </div>
        </div>
        <Card className="flex min-h-[760px] flex-col p-5">
          <label className="mb-8 flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 p-4 text-left"><span className="flex items-center gap-3"><Users className="size-5" /><span><strong>Customer</strong><select className="mt-1 w-full bg-transparent text-xs text-slate-500 outline-none" value={customerId} onChange={(event) => setCustomerId(event.target.value)}><option value="">Walk-in Customer</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}</select></span></span><ChevronDown className="size-4" /></label>
          <div className="divide-y divide-slate-100">
            {cart.map((item) => <div className="flex items-start justify-between py-5" key={item.book.id}><div><p className="font-semibold">{item.book.title}</p><p className="text-sm text-slate-500">{money(item.book.price)} x {item.quantity}</p></div><div className="text-right"><p className="text-lg font-bold">{money(item.book.price * item.quantity)}</p><div className="mt-2 inline-flex overflow-hidden rounded border border-slate-200 text-sm"><button className="bg-slate-100 px-3" onClick={() => updateQuantity(item.book.id, -1)} type="button">-</button><span className="px-4">{item.quantity}</span><button className="bg-slate-100 px-3" onClick={() => updateQuantity(item.book.id, 1)} type="button">+</button></div></div></div>)}
          </div>
          <div className="mt-auto border-t border-slate-100 pt-5">
            {[['Subtotal', money(subtotal)], ['Discount', money(0)], ['Tax (18%)', money(tax)]].map(([label, value]) => <div className="mb-2 flex justify-between text-slate-500" key={label}><span>{label}</span><span>{value}</span></div>)}
            <div className="mt-5 flex justify-between text-2xl font-bold"><span>Total</span><span>{money(total)}</span></div>
            <div className="mt-6 grid grid-cols-2 gap-3"><Button variant="danger" onClick={() => setCart([])}>Cancel</Button><Button variant="secondary">Hold Order</Button></div>
            <button className="mt-3 h-12 w-full rounded-md bg-blue-600 font-semibold text-white transition hover:bg-blue-700" onClick={submitSale} type="button">Proceed to Payment</button>
          </div>
        </Card>
      </div>
      {completedSale && <PaymentSuccessModal sale={completedSale} onClose={() => setCompletedSale(null)} />}
    </Shell>
  )
}
