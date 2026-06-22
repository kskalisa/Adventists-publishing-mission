import { Check, Edit3, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { people } from '../../data/assets'
import { approveAccessRequest, deleteUser, listAccessRequests, listUsers, rejectAccessRequest } from '../../lib/api'
import type { AccessRequest, User } from '../../lib/api'
import type { PageProps } from '../../types/navigation'
import { Shell } from '../../components/layout'
import { Badge, Button, Card, FilterBar, Modal, PageHeader, SimpleTable, StatCard, UserCell } from '../../components/ui'

export function Users({ active, onNavigate }: PageProps) {
  const [users, setUsers] = useState<User[]>([])
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    loadUsers()
  }, [])
  const loadUsers = () => {
    Promise.all([listUsers(), listAccessRequests()])
      .then(([users, requests]) => {
        setUsers(users)
        setAccessRequests(requests)
      })
      .catch((error) => setError(error instanceof Error ? error.message : 'Unable to load users.'))
  }
  const removeUser = async () => {
    if (!deletingUser) return
    setError('')
    try {
      await deleteUser(deletingUser.id)
      setDeletingUser(null)
      loadUsers()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to delete user.')
    }
  }
  const resolveRequest = async (request: AccessRequest, action: 'approve' | 'reject') => {
    setError('')
    try {
      if (action === 'approve') {
        await approveAccessRequest(request.id)
      } else {
        await rejectAccessRequest(request.id)
      }
      loadUsers()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to update access request.')
    }
  }
  const pendingRequests = accessRequests.filter((request) => request.status === 'PENDING')

  return (
    <Shell active={active} onNavigate={onNavigate}>
      <PageHeader title="Users & Access" subtitle="Manage active users and approve pending access requests." />
      <div className="grid gap-6 md:grid-cols-4">{[
        { label: 'Total Users', value: users.length.toString() },
        { label: 'Active Users', value: users.filter((user) => user.active).length.toString() },
        { label: 'Admins', value: users.filter((user) => user.role === 'ADMIN').length.toString() },
        { label: 'Pending Requests', value: pendingRequests.length.toString() },
      ].map((stat) => <StatCard key={stat.label} stat={stat} />)}</div>
      <div className="mt-8"><FilterBar placeholder="Filter users..." filters={['All Roles', 'Status: All']} /></div>
      {error && <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      <Card className="mt-6">
        <div className="border-b border-slate-100 p-5">
          <h2 className="font-semibold text-blue-950">Pending Access Requests</h2>
          <p className="mt-1 text-sm text-slate-500">Approve only verified staff accounts. Admin access is not self-requestable.</p>
        </div>
        <SimpleTable
          headers={['Name', 'Email', 'Department', 'Requested Role', 'Requested', 'Actions']}
          rows={pendingRequests.map((request) => [
            request.name,
            request.email,
            request.department ?? 'Unassigned',
            <Badge tone={request.requestedRole === 'INVENTORY_MANAGER' || request.requestedRole === 'COORDINATOR' ? 'purple' : 'gray'}>{roleLabel(request.requestedRole)}</Badge>,
            new Date(request.createdAt).toLocaleDateString(),
            <div className="flex gap-3"><Button className="h-8 px-3" icon={Check} onClick={() => resolveRequest(request, 'approve')}>Approve</Button><Button className="h-8 px-3" variant="danger" icon={X} onClick={() => resolveRequest(request, 'reject')}>Reject</Button></div>,
          ])}
        />
      </Card>
      <Card className="mt-6">
        <SimpleTable headers={['', 'User', 'Role', 'Department', 'Status', 'Created', 'Actions']} rows={users.map((user, index) => [<input type="checkbox" aria-label={`Select ${user.name}`} />, <UserCell name={user.name} sub={user.email} src={people[index % people.length]} />, <Badge tone={user.role === 'ADMIN' ? 'blue' : user.role === 'INVENTORY_MANAGER' || user.role === 'COORDINATOR' ? 'purple' : 'gray'}>{roleLabel(user.role)}</Badge>, roleLabel(user.role), <Badge tone={user.active ? 'green' : 'gray'}>{user.active ? 'Active' : 'Inactive'}</Badge>, new Date(user.createdAt).toLocaleDateString(), <div className="flex gap-4 text-slate-400"><button aria-label={`View ${user.name}`} onClick={() => setSelectedUser(user)} type="button"><Edit3 className="size-4" /></button><button aria-label={`Delete ${user.name}`} onClick={() => setDeletingUser(user)} type="button"><Trash2 className="size-4" /></button></div>])} />
      </Card>
      {selectedUser && <Modal title="User details" onClose={() => setSelectedUser(null)} footer={<Button onClick={() => setSelectedUser(null)}>Done</Button>}><div className="space-y-3 text-sm text-slate-600"><p><strong className="text-blue-950">{selectedUser.name}</strong></p><p>Email: {selectedUser.email}</p><p>Role: {roleLabel(selectedUser.role)}</p><p>Status: {selectedUser.active ? 'Active' : 'Inactive'}</p><p>Created: {new Date(selectedUser.createdAt).toLocaleString()}</p></div></Modal>}
      {deletingUser && <Modal title="Delete user?" onClose={() => setDeletingUser(null)} footer={<><Button variant="secondary" onClick={() => setDeletingUser(null)}>Cancel</Button><Button variant="danger" icon={Trash2} onClick={removeUser}>Delete User</Button></>}><p className="text-sm leading-6 text-slate-600">This will permanently remove <strong className="text-blue-950">{deletingUser.name}</strong> and their access to this system.</p></Modal>}
    </Shell>
  )
}

function roleLabel(role: User['role']) {
  return role.split('_').map((part) => part[0] + part.slice(1).toLowerCase()).join(' ')
}
