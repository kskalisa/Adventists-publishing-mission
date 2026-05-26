import type { ReactNode } from 'react'

export function SimpleTable({ headers, rows }: { headers: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-400">
          <tr>{headers.map((header) => <th className="px-5 py-4" key={header}>{header}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, index) => (
            <tr className="transition hover:bg-slate-50/70" key={index}>
              {row.map((cell, cellIndex) => <td className="px-5 py-4 align-middle" key={cellIndex}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

