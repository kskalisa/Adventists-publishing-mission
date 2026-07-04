import type { ReactNode } from 'react'

type ReportValue = string | number | null | undefined

export type ReportMetric = {
  label: string
  value: ReportValue
  helper?: ReportValue
}

export type ReportTable = {
  title: string
  headers: string[]
  rows: ReportValue[][]
}

export type ReportDocument = {
  title: string
  subtitle?: string
  filename?: string
  filterLabel?: string
  footer?: string
  metrics?: ReportMetric[]
  tables: ReportTable[]
}

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

export function downloadReportCsv(report: ReportDocument) {
  const lines = report.tables.flatMap((table, index) => [
    ...(index > 0 ? [[]] : []),
    [table.title],
    table.headers,
    ...table.rows,
  ])
  const csv = lines.map((row) => row.map(escapeCsv).join(',')).join('\n')
  downloadBlob(`${report.filename ?? slugify(report.title)}.csv`, csv, 'text/csv;charset=utf-8')
}

export function exportReportPdf(report: ReportDocument) {
  downloadBlob(`${report.filename ?? slugify(report.title)}.pdf`, buildPdf(report), 'application/pdf')
}

export function printReport(report: ReportDocument) {
  const printWindow = window.open('', '_blank', 'width=1100,height=850')
  if (!printWindow) {
    printCurrentPage()
    return
  }
  printWindow.document.write(buildReportHtml(report, true))
  printWindow.document.close()
}

function buildReportHtml(report: ReportDocument, autoPrint = false) {
  const generated = new Intl.DateTimeFormat('en-RW', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date())
  const subtitle = [report.subtitle, report.filterLabel ? `Filters: ${report.filterLabel}` : ''].filter(Boolean).join(' | ')
  const metrics = report.metrics?.length ? `<section class="metrics">${report.metrics.map((metric) => `<article><span>${escapeHtml(metric.label)}</span><strong>${escapeHtml(metric.value)}</strong>${metric.helper ? `<small>${escapeHtml(metric.helper)}</small>` : ''}</article>`).join('')}</section>` : ''
  const tables = report.tables.map((table) => `
    <section class="table-section">
      <h2>${escapeHtml(table.title)}</h2>
      <table>
        <thead><tr>${table.headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead>
        <tbody>${table.rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>
    </section>
  `).join('')

  return `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(report.title)}</title>
        <style>
          @page { margin: 16mm; }
          * { box-sizing: border-box; }
          body { margin: 0; background: #e8eef4; color: #102033; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
          main { max-width: 1040px; margin: 0 auto; background: white; min-height: 100vh; }
          .hero { display: grid; grid-template-columns: 1fr auto; gap: 28px; align-items: start; padding: 36px 40px; color: white; background: linear-gradient(135deg, #0d2b49 0%, #0b6f4a 100%); }
          .brand { display: flex; align-items: center; gap: 14px; font-weight: 800; letter-spacing: 0; }
          .brand img { width: 54px; height: 54px; border-radius: 12px; background: white; padding: 6px; }
          h1 { margin: 30px 0 10px; font-size: 34px; line-height: 1.1; letter-spacing: 0; }
          .subtitle { margin: 0; max-width: 620px; color: #dbeafe; line-height: 1.6; }
          .date { border: 1px solid rgba(255,255,255,.25); border-radius: 8px; padding: 14px 16px; text-align: right; color: #e2e8f0; }
          .date strong { display: block; color: white; font-size: 15px; }
          .content { padding: 28px 40px 42px; }
          .metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin-bottom: 26px; }
          .metrics article { min-height: 112px; border: 1px solid #dbe5ee; border-radius: 8px; padding: 16px; background: #f8fafc; }
          .metrics span { display: block; color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; }
          .metrics strong { display: block; margin-top: 12px; color: #0f5132; font-size: 23px; line-height: 1.15; }
          .metrics small { display: block; margin-top: 8px; color: #64748b; line-height: 1.4; }
          .table-section { margin-top: 22px; page-break-inside: avoid; }
          h2 { margin: 0 0 12px; color: #0d2b49; font-size: 18px; }
          table { width: 100%; border-collapse: collapse; overflow: hidden; border: 1px solid #dbe5ee; border-radius: 8px; }
          th { background: #0d2b49; color: white; font-size: 11px; text-align: left; text-transform: uppercase; }
          th, td { padding: 11px 12px; border-bottom: 1px solid #e5edf4; vertical-align: top; }
          td { color: #334155; font-size: 12px; }
          tr:nth-child(even) td { background: #f8fafc; }
          footer { display: flex; justify-content: space-between; gap: 18px; padding: 0 40px 24px; color: #64748b; font-size: 11px; }
          @media print {
            body { background: white; }
            main { max-width: none; }
          }
        </style>
      </head>
      <body>
        <main>
          <header class="hero">
            <div>
              <div class="brand"><img src="${window.location.origin}/adventist-logo.svg" alt="" />Seventh-day Adventist Publishing</div>
              <h1>${escapeHtml(report.title)}</h1>
              ${subtitle ? `<p class="subtitle">${escapeHtml(subtitle)}</p>` : ''}
            </div>
            <div class="date"><span>Generated</span><strong>${escapeHtml(generated)}</strong></div>
          </header>
          <div class="content">${metrics}${tables}</div>
          <footer><span>${escapeHtml(report.footer ?? 'Rwanda Union Mission Publishing Department')}</span><span>${escapeHtml(report.filterLabel ?? report.title)}</span></footer>
        </main>
        ${autoPrint ? `<script>window.addEventListener('load', () => { setTimeout(() => window.print(), 250) })</script>` : ''}
      </body>
    </html>`
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

function downloadBlob(filename: string, content: BlobPart, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function escapeHtml(value: ReportValue) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'report'
}

function buildPdf(report: ReportDocument) {
  const pageWidth = 595
  const pageHeight = 842
  const margin = 42
  const pages: string[] = []
  let content = ''
  let y = 0

  const startPage = () => {
    if (content) {
      drawFooter()
      pages.push(content)
    }
    content = ''
    y = 0
    rect(0, 0, pageWidth, 118, '0.051 0.169 0.286')
    rect(0, 118, pageWidth, 12, '0.043 0.435 0.290')
    text('Seventh-day Adventist Publishing', margin, 36, 13, '1 1 1', true)
    text(report.title, margin, 70, 24, '1 1 1', true)
    if (report.subtitle) text(report.subtitle, margin, 96, 10, '0.86 0.92 0.98')
    if (report.filterLabel) text(`Filters: ${report.filterLabel}`, margin, 111, 8, '0.86 0.92 0.98')
    const generated = new Intl.DateTimeFormat('en-RW', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date())
    text(`Generated ${generated}`, 390, 38, 9, '0.86 0.92 0.98')
    y = 160
  }
  const ensure = (height: number) => {
    if (y + height > pageHeight - 48) startPage()
  }
  const rect = (x: number, top: number, w: number, h: number, color: string) => {
    const bottom = pageHeight - top - h
    content += `${color} rg ${x.toFixed(2)} ${bottom.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f\n`
  }
  const text = (value: ReportValue, x: number, top: number, size = 10, color = '0.12 0.16 0.22', bold = false) => {
    const safe = escapePdfText(value)
    const bottom = pageHeight - top
    content += `BT ${color} rg /${bold ? 'F2' : 'F1'} ${size} Tf ${x.toFixed(2)} ${bottom.toFixed(2)} Td (${safe}) Tj ET\n`
  }
  const wrappedText = (value: ReportValue, x: number, top: number, width: number, size = 9, color = '0.20 0.25 0.33') => {
    const chars = Math.max(Math.floor(width / (size * 0.52)), 8)
    const lines = wrap(String(value ?? ''), chars)
    lines.slice(0, 3).forEach((line, index) => text(line, x, top + index * (size + 3), size, color))
  }

  startPage()
  if (report.metrics?.length) {
    const columns = Math.min(report.metrics.length, 4)
    const gap = 12
    const width = (pageWidth - margin * 2 - gap * (columns - 1)) / columns
    report.metrics.forEach((metric, index) => {
      const x = margin + (index % columns) * (width + gap)
      const top = y + Math.floor(index / columns) * 86
      rect(x, top, width, 72, '0.961 0.976 0.988')
      text(metric.label, x + 12, top + 22, 8, '0.39 0.45 0.55', true)
      wrappedText(metric.value, x + 12, top + 43, width - 24, 15, '0.043 0.318 0.196')
      if (metric.helper) wrappedText(metric.helper, x + 12, top + 62, width - 24, 8, '0.39 0.45 0.55')
    })
    y += Math.ceil(report.metrics.length / columns) * 86 + 10
  }

  report.tables.forEach((table) => {
    ensure(70)
    text(table.title, margin, y, 15, '0.051 0.169 0.286', true)
    y += 18
    const tableWidth = pageWidth - margin * 2
    const colWidth = tableWidth / table.headers.length
    rect(margin, y, tableWidth, 24, '0.051 0.169 0.286')
    table.headers.forEach((header, index) => wrappedText(header, margin + index * colWidth + 7, y + 16, colWidth - 12, 7, '1 1 1'))
    y += 26
    table.rows.slice(0, 36).forEach((row, rowIndex) => {
      ensure(24)
      if (rowIndex % 2 === 0) rect(margin, y - 4, tableWidth, 23, '0.976 0.980 0.984')
      row.forEach((cell, index) => wrappedText(cell, margin + index * colWidth + 7, y + 11, colWidth - 12, 8))
      y += 24
    })
    y += 18
  })
  drawFooter()
  pages.push(content)

  const objects: string[] = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
  ]
  const kids: string[] = []
  pages.forEach((pageContent) => {
    const pageObjectNumber = objects.length + 1
    const streamObjectNumber = objects.length + 2
    kids.push(`${pageObjectNumber} 0 R`)
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${streamObjectNumber} 0 R >>`)
    objects.push(`<< /Length ${pageContent.length} >>\nstream\n${pageContent}endstream`)
  })
  objects[1] = `<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${pages.length} >>`

  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  objects.forEach((object, index) => {
    offsets.push(pdf.length)
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
  })
  const xref = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  offsets.slice(1).forEach((offset) => {
    pdf += `${offset.toString().padStart(10, '0')} 00000 n \n`
  })
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`
  return pdf

  function drawFooter() {
    rect(0, pageHeight - 34, pageWidth, 1, '0.86 0.90 0.94')
    text(report.footer ?? 'Rwanda Union Mission Publishing Department', margin, pageHeight - 18, 8, '0.39 0.45 0.55')
    text(report.filterLabel ?? report.title, 320, pageHeight - 18, 8, '0.39 0.45 0.55')
  }
}

function escapePdfText(value: ReportValue) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
}

function wrap(value: string, maxChars: number) {
  const words = value.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let line = ''
  words.forEach((word) => {
    if ((line + ' ' + word).trim().length > maxChars) {
      if (line) lines.push(line)
      line = word
    } else {
      line = `${line} ${word}`.trim()
    }
  })
  if (line) lines.push(line)
  return lines.length ? lines : ['']
}

