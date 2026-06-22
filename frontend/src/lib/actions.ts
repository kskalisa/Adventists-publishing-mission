import type { ReactNode } from 'react'

export function downloadCsv(filename: string, headers: string[], rows: Array<Array<string | number | null | undefined>>) {
  const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function printCurrentPage() {
  window.print()
}

export function notify(message: string) {
  window.dispatchEvent(new CustomEvent('adventist-toast', { detail: message }))
}

export function asText(value: ReactNode) {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  return ''
}

function escapeCsv(value: string | number | null | undefined) {
  const text = String(value ?? '')
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}
