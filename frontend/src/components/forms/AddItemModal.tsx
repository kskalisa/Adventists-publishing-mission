import { ImagePlus } from 'lucide-react'
import { useState } from 'react'
import { createBook, updateBook } from '../../lib/api'
import type { Book } from '../../lib/api'
import { readImageAsDataUrl } from '../../lib/files'
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

export function AddItemModal({ onClose, onCreated, book }: { onClose: () => void; onCreated?: (item: Book) => void; book?: Book }) {
  const [form, setForm] = useState({
    title: book?.title ?? '',
    author: book?.author ?? '',
    isbn: book?.isbn ?? '',
    category: book?.category ?? 'Spirit of Prophecy',
    price: book?.price.toString() ?? '',
    stock: book?.stockQuantity.toString() ?? '',
    description: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [coverImageUrl, setCoverImageUrl] = useState(book?.coverImageUrl ?? '')

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }))

  const submit = async () => {
    setSubmitting(true)
    setError('')
    try {
      const payload = {
        title: form.title,
        author: form.author,
        isbn: form.isbn,
        category: form.category,
        price: Number(form.price || 0),
        stockQuantity: Number(form.stock || 0),
        reorderLevel: book?.reorderLevel,
        coverImageUrl: coverImageUrl || undefined,
      }
      const item = book ? await updateBook(book.id, payload) : await createBook(payload)
      onCreated?.(item)
      onClose()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to add item.')
    } finally {
      setSubmitting(false)
    }
  }

  const chooseCover = async (file: File | undefined) => {
    if (!file) return
    setError('')
    try {
      setCoverImageUrl(await readImageAsDataUrl(file))
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to upload cover.')
    }
  }

  return (
    <Modal title={book ? 'Edit Item' : 'Add New Item'} size="lg" onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={submit}>{submitting ? 'Saving...' : book ? 'Save Changes' : 'Add Item'}</Button></>}>
      <div className="space-y-6">
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <label className="grid h-36 w-full cursor-pointer place-items-center overflow-hidden rounded-md border border-dashed border-slate-300 bg-slate-50 text-center">
          <input className="sr-only" accept="image/png,image/jpeg,image/webp" type="file" onChange={(event) => chooseCover(event.target.files?.[0])} />
          {coverImageUrl ? <img className="h-full w-full object-cover" src={coverImageUrl} alt="Selected book cover" /> : (
          <span>
            <ImagePlus className="mx-auto mb-3 size-8 rounded-full bg-slate-100 p-2 text-slate-500" />
            <span className="block font-medium text-slate-500">Upload Book Cover</span>
            <span className="mt-1 block text-xs text-slate-500">Supports JPG, PNG (Max 2MB)</span>
          </span>
          )}
        </label>
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
