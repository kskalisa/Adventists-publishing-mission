import { Calendar, MoreHorizontal } from 'lucide-react'
import { coverImages, people } from '../../data/assets'
import type { PageProps } from '../../types/navigation'
import { Shell } from '../../components/layout'
import { Badge, Button, Card, PageHeader, SearchBox, Segmented, SimpleTable, StatCard, UserCell } from '../../components/ui'

export function Publishing({ active, onNavigate }: PageProps) {
  const projects = [
    'The Great Controversy|E.G. White|Printing|w-5/6|85%|Oct 15, 2024',
    'Sabbath School Lesson Q3|Sarah M. (Trans)|Typesetting|w-2/5|45%|Nov 01, 2024',
    'Healthy Living Guide|Dr. James K.|Manuscript|w-1/5|20%|Dec 10, 2024',
  ]

  return (
    <Shell active={active} onNavigate={onNavigate}>
      <PageHeader title="Publishing Operations" />
      <div className="grid gap-6 md:grid-cols-4">{['Projects in Progress|14|Across all stages', 'In Printing|3|', 'Pending Review|5|Action required', 'Published (YTD)|42|'].map((s) => { const [label, value, helper] = s.split('|'); return <StatCard key={label} stat={{ label, value, helper }} /> })}</div>
      <Card className="mt-6 p-4"><div className="flex flex-col gap-3 lg:flex-row"><div className="flex-1"><SearchBox placeholder="Search titles, ISBN, or authors..." /></div><Segmented items={['All', 'Editing', 'Design', 'Printing', 'Completed']} /><Button variant="secondary" icon={Calendar}>Schedule</Button></div></Card>
      <Card className="rounded-t-none">
        <SimpleTable
          headers={['', 'Book Details', 'Author / Editor', 'Current Stage', 'Progress', 'Due Date', 'Actions']}
          rows={projects.map((row, index) => {
            const [title, author, stage, width, pct, due] = row.split('|')
            return [
              <input type="checkbox" aria-label={`Select ${title}`} />,
              <div className="flex items-center gap-4"><img className="size-14 rounded object-cover" src={coverImages[index]} alt="" /><div><p className="font-semibold text-blue-950">{title}</p><p className="text-xs text-slate-400">ISBN: {index ? 'Pending' : '978-1-234-56789-0'}</p></div></div>,
              <UserCell name={author} src={people[index]} />,
              <Badge tone={stage === 'Printing' ? 'blue' : stage === 'Typesetting' ? 'orange' : 'gray'}>{stage}</Badge>,
              <div className="flex items-center gap-2"><div className="h-1.5 w-24 rounded bg-slate-100"><div className={`h-full rounded bg-blue-600 ${width}`} /></div><span>{pct}</span></div>,
              due,
              <MoreHorizontal className="size-4 text-slate-400" />,
            ]
          })}
        />
      </Card>
    </Shell>
  )
}
