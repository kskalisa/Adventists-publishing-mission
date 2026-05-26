import { ImagePlus } from 'lucide-react'
import { useState } from 'react'
import { appendStoredItem } from '../../lib/storage'
import { Button, Modal } from '../ui'

export type StoredInventoryItem = {
  id: string
  title: string
  author: string
  isbn: string
  category: string
  price: string
  stock: string
  description: string
}

const inputClass = 'h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100'

export function AddItemModal({ onClose, onCreated }: { onClose: () => void; onCreated?: (item: StoredInventoryItem) => void }) {
  const [form, setForm] = useState({
    title: '',
    author: '',
    isbn: '',
    category: 'Spirit of Prophecy',
    price: '',
    stock: '',
    description: '',
  })

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }))

  const submit = () => {
    const item: StoredInventoryItem = { id: crypto.randomUUID(), ...form }
    appendStoredItem('adventist-inventory-items', item)
    onCreated?.(item)
    onClose()
  }

  return (
    <Modal title="Add New Item" size="lg" onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={submit}>Add Item</Button></>}>
      <div className="space-y-6">
        <button className="grid h-36 w-full place-items-center rounded-md border border-dashed border-slate-300 bg-slate-50 text-center" type="button">
          <span>
            <ImagePlus className="mx-auto mb-3 size-8 rounded-full bg-slate-100 p-2 text-slate-500" />
            <span className="block font-medium text-slate-500">Upload Book Cover</span>
            <span className="mt-1 block text-xs text-slate-500">Supports JPG, PNG (Max 2MB)</span>
          </span>
        </button>
        <div className="grid gap-5 sm:grid-cols-2">
          <label><span className="mb-2 block text-sm font-medium">Book Title</span><input className={inputClass} placeholder="e.g. The Great Controversy" value={form.title} onChange={(event) => update('title', event.target.value)} /></label>
          <label><span className="mb-2 block text-sm font-medium">Author</span><input className={inputClass} placeholder="e.g. Ellen G. White" value={form.author} onChange={(event) => update('author', event.target.value)} /></label>
          <label><span className="mb-2 block text-sm font-medium">ISBN / SKU</span><input className={inputClass} placeholder="e.g. SP-9021-X" value={form.isbn} onChange={(event) => update('isbn', event.target.value)} /></label>
          <label><span className="mb-2 block text-sm font-medium">Category</span><select className={inputClass} value={form.category} onChange={(event) => update('category', event.target.value)}><option>Spirit of Prophecy</option><option>Health & Wellness</option><option>Education</option><option>Bibles</option></select></label>
          <label><span className="mb-2 block text-sm font-medium">Price ($)</span><input className={inputClass} placeholder="0.00" value={form.price} onChange={(event) => update('price', event.target.value)} /></label>
          <label><span className="mb-2 block text-sm font-medium">Initial Stock</span><input className={inputClass} placeholder="0" value={form.stock} onChange={(event) => update('stock', event.target.value)} /></label>
        </div>
        <label className="block"><span className="mb-2 block text-sm font-medium">Description</span><textarea className="h-24 w-full rounded-md border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100" placeholder="Enter a brief description of the book..." value={form.description} onChange={(event) => update('description', event.target.value)} /></label>
      </div>
    </Modal>
  )
}

