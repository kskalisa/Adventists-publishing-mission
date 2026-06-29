import { Check, Edit3, Lock, Plus, Trash2, Unlock, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { people } from '../../data/assets'
import { approveAccessRequest, createUser, deleteUser, getCurrentUser, listAccessRequests, listUsers, lockUser, rejectAccessRequest, unlockUser, updateUser } from '../../lib/api'
import type { AccessRequest, User, UserRole } from '../../lib/api'
import { firstError, minLength, required, validEmail } from '../../lib/validation'
import type { PageProps } from '../../types/navigation'
import { Shell } from '../../components/layout'
import { Badge, Button, Card, Modal, PageHeader, Pagination, SimpleTable, StatCard, UserCell, paginate } from '../../components/ui'

export function Users({ active, onNavigate }: PageProps) {
  const [users, setUsers] = useState<User[]>([])
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'LOCKED'>('ALL')
  const [page, setPage] = useState(1)
  const currentUser = getCurrentUser()
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
  const toggleUserLock = async (user: User) => {
    setError('')
    try {
      if (user.active) {
        await lockUser(user.id)
      } else {
        await unlockUser(user.id)
      }
      loadUsers()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to update user access.')
    }
  }
  const pendingRequests = accessRequests.filter((request) => request.status === 'PENDING')
  const filteredUsers = users.filter((user) => {
    const term = query.trim().toLowerCase()
    const matchesQuery = !term || user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term)
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter
    const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' ? user.active : !user.active)
    return matchesQuery && matchesRole && matchesStatus
  })
  const visibleUsers = paginate(filteredUsers, page, 10)

  return (
    <Shell active={active} onNavigate={onNavigate}>
      <PageHeader title="Users & Access" subtitle="Manage active users and approve pending access requests." actions={<Button icon={Plus} onClick={() => { setEditingUser(null); setShowUserModal(true) }}>Add User</Button>} />
      <div className="grid gap-6 md:grid-cols-4">{[
        { label: 'Total Users', value: users.length.toString() },
        { label: 'Active Users', value: users.filter((user) => user.active).length.toString() },
        { label: 'Admins', value: users.filter((user) => user.role === 'ADMIN').length.toString() },
        { label: 'Pending Requests', value: pendingRequests.length.toString() },
      ].map((stat) => <StatCard key={stat.label} stat={stat} />)}</div>
      <Card className="mt-8 p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_220px_180px]">
          <input className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100" placeholder="Search users by name or email" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} />
          <select className="h-10 rounded-md border border-slate-200 px-3 text-sm" value={roleFilter} onChange={(event) => { setRoleFilter(event.target.value as UserRole | 'ALL'); setPage(1) }}><option value="ALL">All Roles</option><option value="ADMIN">Admin</option><option value="SALES">Sales</option><option value="INVENTORY_MANAGER">Inventory Manager</option><option value="COORDINATOR">Coordinator</option><option value="CUSTOMER">Customer</option></select>
          <select className="h-10 rounded-md border border-slate-200 px-3 text-sm" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value as 'ALL' | 'ACTIVE' | 'LOCKED'); setPage(1) }}><option value="ALL">All Statuses</option><option value="ACTIVE">Active</option><option value="LOCKED">Locked</option></select>
        </div>
      </Card>
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
        <SimpleTable headers={['', 'User', 'Role', 'Department', 'Status', 'Created', 'Actions']} rows={visibleUsers.map((user, index) => [<input type="checkbox" aria-label={`Select ${user.name}`} />, <UserCell name={user.name} sub={user.email} src={people[index % people.length]} />, <Badge tone={user.role === 'ADMIN' ? 'blue' : user.role === 'INVENTORY_MANAGER' || user.role === 'COORDINATOR' ? 'purple' : 'gray'}>{roleLabel(user.role)}</Badge>, roleLabel(user.role), <Badge tone={user.active ? 'green' : 'gray'}>{user.active ? 'Active' : 'Locked'}</Badge>, new Date(user.createdAt).toLocaleDateString(), <div className="flex gap-3 text-slate-400"><button aria-label={`View ${user.name}`} onClick={() => setSelectedUser(user)} type="button"><Edit3 className="size-4" /></button><button aria-label={`Edit ${user.name}`} onClick={() => { setEditingUser(user); setShowUserModal(true) }} type="button"><Edit3 className="size-4" /></button><button aria-label={user.active ? `Lock ${user.name}` : `Unlock ${user.name}`} disabled={currentUser?.id === user.id} onClick={() => toggleUserLock(user)} type="button" className="disabled:cursor-not-allowed disabled:opacity-40">{user.active ? <Lock className="size-4" /> : <Unlock className="size-4" />}</button><button aria-label={`Delete ${user.name}`} disabled={currentUser?.id === user.id} onClick={() => setDeletingUser(user)} type="button" className="disabled:cursor-not-allowed disabled:opacity-40"><Trash2 className="size-4" /></button></div>])} />
        <Pagination page={page} pageSize={10} total={filteredUsers.length} onPageChange={setPage} />
      </Card>
      {showUserModal && <UserFormModal user={editingUser} onClose={() => { setShowUserModal(false); setEditingUser(null) }} onSaved={loadUsers} />}
      {selectedUser && <Modal title="User details" onClose={() => setSelectedUser(null)} footer={<Button onClick={() => setSelectedUser(null)}>Done</Button>}><div className="space-y-3 text-sm text-slate-600"><p><strong className="text-blue-950">{selectedUser.name}</strong></p><p>Email: {selectedUser.email}</p><p>Role: {roleLabel(selectedUser.role)}</p><p>Status: {selectedUser.active ? 'Active' : 'Inactive'}</p><p>Created: {new Date(selectedUser.createdAt).toLocaleString()}</p></div></Modal>}
      {deletingUser && <Modal title="Delete user?" onClose={() => setDeletingUser(null)} footer={<><Button variant="secondary" onClick={() => setDeletingUser(null)}>Cancel</Button><Button variant="danger" icon={Trash2} onClick={removeUser}>Delete User</Button></>}><p className="text-sm leading-6 text-slate-600">This will permanently remove <strong className="text-blue-950">{deletingUser.name}</strong> and their access to this system.</p></Modal>}
    </Shell>
  )
}

function UserFormModal({ user, onClose, onSaved }: { user: User | null; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [role, setRole] = useState<UserRole>(user?.role ?? 'SALES')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setError('')
    const validationError = firstError([
      required(name, 'Name'),
      required(email, 'Email'),
      validEmail(email),
      !user ? minLength(password, 6, 'Password') : password ? minLength(password, 6, 'New password') : '',
    ])
    if (validationError) {
      setError(validationError)
      return
    }
    setSaving(true)
    try {
      if (user) {
        await updateUser(user.id, { name, email, role, password: password || undefined })
      } else {
        await createUser({ name, email, role, password })
      }
      onSaved()
      onClose()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to save user.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={user ? 'Edit user' : 'Add user'} onClose={onClose} size="lg" footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={save}>{saving ? 'Saving...' : user ? 'Save Changes' : 'Create User'}</Button></>}>
      {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <label><span className="mb-2 block text-sm font-medium">Name</span><input className="h-10 w-full rounded-md border border-slate-200 px-3" value={name} onChange={(event) => setName(event.target.value)} /></label>
        <label><span className="mb-2 block text-sm font-medium">Email</span><input className="h-10 w-full rounded-md border border-slate-200 px-3" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        <label><span className="mb-2 block text-sm font-medium">Role</span><select className="h-10 w-full rounded-md border border-slate-200 px-3" value={role} onChange={(event) => setRole(event.target.value as UserRole)}><option value="ADMIN">Admin</option><option value="SALES">Sales</option><option value="INVENTORY_MANAGER">Inventory Manager</option><option value="COORDINATOR">Coordinator</option><option value="CUSTOMER">Customer</option></select></label>
        <label><span className="mb-2 block text-sm font-medium">{user ? 'New password' : 'Password'}</span><input className="h-10 w-full rounded-md border border-slate-200 px-3" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={user ? 'Leave blank to keep current password' : ''} /></label>
      </div>
    </Modal>
  )
}

function roleLabel(role: User['role']) {
  return role.split('_').map((part) => part[0] + part.slice(1).toLowerCase()).join(' ')
}
