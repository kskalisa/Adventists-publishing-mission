import { X } from 'lucide-react'
import type { ReactNode } from 'react'

type ModalProps = {
  title: string
  children: ReactNode
  footer: ReactNode
  onClose: () => void
  size?: 'md' | 'lg'
}

export function Modal({ title, children, footer, onClose, size = 'md' }: ModalProps) {
  const maxWidth = size === 'lg' ? 'max-w-2xl' : 'max-w-xl'

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <section className={`w-full ${maxWidth} overflow-hidden rounded-md bg-white shadow-2xl`}>
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <h2 id="modal-title" className="text-xl font-semibold text-blue-950">{title}</h2>
          <button className="text-slate-400 transition hover:text-slate-700" onClick={onClose} type="button" aria-label="Close modal">
            <X className="size-5" />
          </button>
        </header>
        <div className="px-6 py-6">{children}</div>
        <footer className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5">{footer}</footer>
      </section>
    </div>
  )
}

