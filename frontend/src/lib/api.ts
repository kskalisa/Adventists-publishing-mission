import type { Screen } from '../types/navigation'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8084'

export type UserRole = 'ADMIN' | 'SALES' | 'INVENTORY_MANAGER' | 'COORDINATOR' | 'CUSTOMER'
export type BookStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'
export type CustomerType = 'INDIVIDUAL' | 'CHURCH' | 'SCHOOL' | 'BRANCH'
export type SaleStatus = 'PAID' | 'HELD' | 'CANCELLED'
export type AccessRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export type User = {
  id: number
  name: string
  email: string
  role: UserRole
  active: boolean
  createdAt: string
}

export type Book = {
  id: number
  title: string
  author: string
  isbn: string
  category: string
  price: number
  stockQuantity: number
  reorderLevel: number
  coverImageUrl: string | null
  status: BookStatus
  createdAt: string
}

export type Customer = {
  id: number
  name: string
  type: CustomerType
  email: string | null
  phone: string | null
  district: string | null
  active: boolean
  createdAt: string
}

export type SaleItem = {
  id: number
  bookId: number
  title: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export type Sale = {
  id: number
  customerId: number | null
  customerName: string
  cashierId: number | null
  cashierName: string | null
  status: SaleStatus
  subtotal: number
  tax: number
  discount: number
  total: number
  createdAt: string
  items: SaleItem[]
}

export type DashboardSummary = {
  totalUsers: number
  totalTitles: number
  totalCustomers: number
  totalRevenue: number
  monthlyRevenue: number
  lowStockCount: number
  outOfStockCount: number
  lowStockBooks: Book[]
  recentSales: Sale[]
}

export type AdjustmentType = 'RECEIVE_SHIPMENT' | 'CORRECTION' | 'RETURN' | 'DAMAGE' | 'REPRINT_RECEIVED'

export type StockAdjustment = {
  id: number
  bookId: number
  bookTitle: string
  adjustedById: number | null
  adjustedByName: string | null
  type: AdjustmentType
  quantityDelta: number
  note: string | null
  createdAt: string
}

export type CreateStockAdjustmentRequest = {
  bookId: number
  adjustedById?: number
  type?: AdjustmentType
  quantityDelta: number
  note?: string
}

export type CreateBookRequest = {
  title: string
  author: string
  isbn: string
  category: string
  price: number
  stockQuantity: number
  reorderLevel?: number
  coverImageUrl?: string
}

export type UpdateBookRequest = CreateBookRequest

export type CreateCustomerRequest = {
  name: string
  type?: CustomerType
  email?: string
  phone?: string
  district?: string
}

export type CreateSaleRequest = {
  customerId?: number
  cashierId?: number
  status?: SaleStatus
  discount?: number
  items: Array<{ bookId: number; quantity: number }>
}

export type CreateUserRequest = {
  name: string
  email: string
  password: string
  role: UserRole
}

export type AuthResponse = {
  user: User
  token: string
}

export type AccessRequest = {
  id: number
  name: string
  email: string
  phone: string | null
  department: string | null
  requestedRole: UserRole
  status: AccessRequestStatus
  createdAt: string
}

export type CreateAccessRequest = {
  name: string
  email: string
  phone?: string
  department?: string
  requestedRole: Exclude<UserRole, 'ADMIN' | 'CUSTOMER'>
  password: string
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken()
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  })

  if (!response.ok) {
    const problem = await response.json().catch(() => null)
    throw new Error(problem?.detail ?? `Request failed with status ${response.status}`)
  }

  return response.json() as Promise<T>
}

export const roleDashboards: Record<UserRole, Screen> = {
  ADMIN: 'dashboard',
  SALES: 'sales-dashboard',
  INVENTORY_MANAGER: 'inventory-manager',
  COORDINATOR: 'coordinator',
  CUSTOMER: 'customer-dashboard',
}

export const login = (email: string, password: string) =>
  api<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })

export const requestAccess = (request: CreateAccessRequest) =>
  api<AccessRequest>('/api/access-requests', { method: 'POST', body: JSON.stringify(request) })

export const listAccessRequests = () => api<AccessRequest[]>('/api/access-requests')

export const approveAccessRequest = (id: number) =>
  api<User>(`/api/access-requests/${id}/approve`, { method: 'POST' })

export const rejectAccessRequest = (id: number) =>
  api<AccessRequest>(`/api/access-requests/${id}/reject`, { method: 'POST' })

export const listBooks = (search?: string) =>
  api<Book[]>(`/api/books${search ? `?search=${encodeURIComponent(search)}` : ''}`)

export const createBook = (request: CreateBookRequest) =>
  api<Book>('/api/books', { method: 'POST', body: JSON.stringify(request) })

export const updateBook = (id: number, request: UpdateBookRequest) =>
  api<Book>(`/api/books/${id}`, { method: 'PUT', body: JSON.stringify(request) })

export const deleteBook = async (id: number) => {
  const token = getAuthToken()
  const response = await fetch(`${API_BASE_URL}/api/books/${id}`, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : undefined })
  if (!response.ok) {
    const problem = await response.json().catch(() => null)
    throw new Error(problem?.detail ?? `Request failed with status ${response.status}`)
  }
}

export const listCustomers = (search?: string) =>
  api<Customer[]>(`/api/customers${search ? `?search=${encodeURIComponent(search)}` : ''}`)

export const createCustomer = (request: CreateCustomerRequest) =>
  api<Customer>('/api/customers', { method: 'POST', body: JSON.stringify(request) })

export const listSales = () => api<Sale[]>('/api/sales')

export const createSale = (request: CreateSaleRequest) =>
  api<Sale>('/api/sales', { method: 'POST', body: JSON.stringify(request) })

export const listUsers = () => api<User[]>('/api/users')

export const createUser = (request: CreateUserRequest) =>
  api<User>('/api/users', { method: 'POST', body: JSON.stringify(request) })

export const deleteUser = async (id: number) => {
  const token = getAuthToken()
  const response = await fetch(`${API_BASE_URL}/api/users/${id}`, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : undefined })
  if (!response.ok) {
    const problem = await response.json().catch(() => null)
    throw new Error(problem?.detail ?? `Request failed with status ${response.status}`)
  }
}

export const getDashboardSummary = () => api<DashboardSummary>('/api/dashboard')

export const listStockAdjustments = () => api<StockAdjustment[]>('/api/inventory/adjustments')

export const createStockAdjustment = (request: CreateStockAdjustmentRequest) =>
  api<StockAdjustment>('/api/inventory/adjustments', { method: 'POST', body: JSON.stringify(request) })

export function getCurrentUser(): User | null {
  const raw = window.localStorage.getItem('adventist-current-user')
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function getAuthToken() {
  return window.localStorage.getItem('adventist-auth-token')
}

export function setCurrentSession(response: AuthResponse) {
  window.localStorage.setItem('adventist-current-user', JSON.stringify(response.user))
  window.localStorage.setItem('adventist-auth-token', response.token)
}

export function clearCurrentSession() {
  window.localStorage.removeItem('adventist-current-user')
  window.localStorage.removeItem('adventist-auth-token')
}

export function money(value: number, currency = 'RWF') {
  return new Intl.NumberFormat('en-RW', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value)
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-RW', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}
