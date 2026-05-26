import { Download, Edit3, Trash2, UserPlus } from 'lucide-react'
import { people } from '../../data/assets'
import type { PageProps } from '../../types/navigation'
import { Shell } from '../../components/layout'
import { Badge, Button, Card, FilterBar, PageHeader, SimpleTable, StatCard, UserCell } from '../../components/ui'

export function Users({ active, onNavigate }: PageProps) {
  const names = ['Sarah Uwase', 'Eric Manzi', 'Grace Keza', 'Patrick Mugisha', 'Alice Umutoni', 'Alice Umutoni']

  return (
    <Shell active={active} onNavigate={onNavigate}>
      <PageHeader title="User Management" subtitle="Dashboard / User Management" actions={<Button icon={UserPlus}>Add New User</Button>} />
      <div className="grid gap-6 md:grid-cols-4">{['Total Users|148', 'Active Users|132', 'Pending Approval|5', 'New This Month|+12'].map((s) => { const [label, value] = s.split('|'); return <StatCard key={label} stat={{ label, value }} /> })}</div>
      <div className="mt-8"><FilterBar placeholder="Filter users..." filters={['All Roles', 'Status: All']} /></div>
      <Card className="mt-6">
        <SimpleTable headers={['', 'User', 'Role', 'Department', 'Status', 'Last Active', 'Actions']} rows={names.map((name, index) => [<input type="checkbox" aria-label={`Select ${name}`} />, <UserCell name={name} sub={`${name.toLowerCase().replaceAll(' ', '.')}@adventist.rw`} src={people[index % people.length]} />, <Badge tone={index === 0 ? 'blue' : index === 1 || index > 3 ? 'purple' : 'gray'}>{index === 0 ? 'Admin' : index === 1 || index > 3 ? 'Manager' : 'Staff'}</Badge>, ['IT & Systems','Sales','Inventory','Publishing','Finance','Finance'][index], <Badge tone={index === 3 ? 'gray' : 'green'}>{index === 3 ? 'Inactive' : 'Active'}</Badge>, ['2 mins ago','1 hour ago','Yesterday','2 weeks ago','3 hours ago','3 hours ago'][index], <div className="flex gap-4 text-slate-400"><Edit3 className="size-4" /><Trash2 className="size-4" /><Download className="hidden size-4" /></div>])} />
      </Card>
    </Shell>
  )
}
