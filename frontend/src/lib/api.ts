import type { Screen } from "../types/navigation";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8084";

export type UserRole =
  | "ADMIN"
  | "SALES"
  | "INVENTORY_MANAGER"
  | "COORDINATOR"
  | "CUSTOMER";
export type BookStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
export type CustomerType = "INDIVIDUAL" | "CHURCH" | "SCHOOL" | "BRANCH";
export type SaleStatus =
  | "PENDING"
  | "APPROVED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "REJECTED"
  | "PAID"
  | "HELD"
  | "CANCELLED";
export type PaymentMethod =
  | "CASH"
  | "MOMO"
  | "CARD"
  | "BANK_TRANSFER"
  | "CREDIT";
export type PaymentStatus = "UNPAID" | "PARTIAL" | "PAID" | "REFUNDED";
export type FulfillmentMethod = "PICKUP" | "DELIVERY";
export type BookRequestStatus = "OPEN" | "FULFILLED" | "CANCELLED";
export type AccessRequestStatus = "PENDING" | "APPROVED" | "REJECTED";
export type ProductionOrderStatus =
  | "PLANNED"
  | "APPROVED"
  | "IN_PROGRESS"
  | "RECEIVED"
  | "CANCELLED";

export type AuditLog = {
  id: number;
  actorId: number | null;
  actorName: string;
  action: string;
  resourceType: string;
  resourceId: number | null;
  summary: string;
  createdAt: string;
};

export type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  passwordChangeRequired: boolean;
  createdAt: string;
};

export type Book = {
  id: number;
  title: string;
  author: string;
  isbn: string;
  category: string;
  price: number;
  stockQuantity: number;
  reorderLevel: number;
  coverImageUrl: string | null;
  status: BookStatus;
  createdAt: string;
};

export type Customer = {
  id: number;
  name: string;
  type: CustomerType;
  email: string | null;
  phone: string | null;
  district: string | null;
  address: string | null;
  active: boolean;
  createdAt: string;
};

export type CustomerRegistrationDto = {
  id: number;
  name: string;
  type: CustomerType;
  email: string | null;
  phone: string | null;
  district: string | null;
  address: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
};

export type SaleItem = {
  id: number;
  bookId: number;
  title: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type Sale = {
  id: number;
  customerId: number | null;
  customerName: string;
  cashierId: number | null;
  cashierName: string | null;
  status: SaleStatus;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  receiptNumber: string | null;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod | null;
  paymentReference: string | null;
  amountPaid: number;
  balanceDue: number;
  fulfillmentMethod: FulfillmentMethod;
  deliveryContact: string | null;
  deliveryAddress: string | null;
  customerNote: string | null;
  internalNote: string | null;
  createdAt: string;
  updatedAt: string;
  deliveredAt: string | null;
  items: SaleItem[];
};

export type Notification = {
  id: number;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export type BookRequest = {
  id: number;
  bookId: number;
  bookTitle: string;
  customerId: number;
  customerName: string;
  quantity: number;
  comment: string | null;
  status: BookRequestStatus;
  createdAt: string;
  updatedAt: string;
};

export type BookRequestSummary = {
  bookId: number;
  bookTitle: string;
  customerCount: number;
  requestedQuantity: number;
};

export type DashboardSummary = {
  totalUsers: number;
  totalTitles: number;
  totalCustomers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  lowStockCount: number;
  outOfStockCount: number;
  lowStockBooks: Book[];
  recentSales: Sale[];
};

export type NamedMetric = {
  name: string;
  count: number;
  value: number;
};

export type TimeSeriesPoint = {
  label: string;
  value: number;
  count: number;
};

export type TitleMetric = {
  bookId: number;
  title: string;
  category: string;
  unitsSold: number;
  revenue: number;
  stockQuantity: number;
  reorderLevel: number;
};

export type CustomerMetric = {
  customerId: number;
  name: string;
  type: CustomerType;
  orderCount: number;
  revenue: number;
  outstandingBalance: number;
};

export type InventoryRisk = {
  bookId: number;
  title: string;
  category: string;
  stockQuantity: number;
  reorderLevel: number;
  unitsSold: number;
  requestedQuantity: number;
  riskLevel: "OUT_OF_STOCK" | "LOW_STOCK" | "DEMAND_RISK" | "FAST_MOVING" | "NORMAL";
  suggestedReorderQuantity: number;
};

export type DemandMetric = {
  bookId: number;
  title: string;
  customerCount: number;
  requestedQuantity: number;
  stockQuantity: number;
  reorderLevel: number;
};

export type ProductionMetric = {
  status: ProductionOrderStatus;
  orders: number;
  units: number;
  estimatedCost: number;
};

export type AdminAnalyticsSummary = {
  overview: {
    totalBooks: number;
    activeCustomers: number;
    totalSales: number;
    openCustomerOrders: number;
    stockAlerts: number;
    openBookRequests: number;
    grossRevenue: number;
    paidRevenue: number;
    outstandingBalance: number;
    cancelledOrRejectedValue: number;
    averageOrderValue: number;
    stockValue: number;
    productionPlannedCost: number;
    productionReceivedCost: number;
  };
  revenueTrend: TimeSeriesPoint[];
  salesByStatus: NamedMetric[];
  paymentBreakdown: NamedMetric[];
  fulfillmentBreakdown: NamedMetric[];
  customerTypeBreakdown: NamedMetric[];
  inventoryByCategory: NamedMetric[];
  topSellingTitles: TitleMetric[];
  topCustomers: CustomerMetric[];
  inventoryRisks: InventoryRisk[];
  reprintDemand: DemandMetric[];
  productionPipeline: ProductionMetric[];
  recommendations: string[];
};

export type AdminAnalyticsFilters = {
  from?: string;
  to?: string;
  category?: string;
  customerType?: CustomerType | "";
  saleStatus?: SaleStatus | "";
  paymentStatus?: PaymentStatus | "";
  fulfillmentMethod?: FulfillmentMethod | "";
  productionStatus?: ProductionOrderStatus | "";
};

export type AdjustmentType =
  | "RECEIVE_SHIPMENT"
  | "CORRECTION"
  | "RETURN"
  | "DAMAGE"
  | "REPRINT_RECEIVED";

export type StockAdjustment = {
  id: number;
  bookId: number;
  bookTitle: string;
  adjustedById: number | null;
  adjustedByName: string | null;
  type: AdjustmentType;
  quantityDelta: number;
  note: string | null;
  createdAt: string;
};

export type ProductionOrder = {
  id: number;
  bookId: number;
  bookTitle: string;
  createdById: number | null;
  createdByName: string | null;
  quantity: number;
  printer: string;
  expectedDeliveryDate: string | null;
  notes: string | null;
  status: ProductionOrderStatus;
  estimatedCost: number;
  createdAt: string;
  receivedAt: string | null;
};

export type CreateStockAdjustmentRequest = {
  bookId: number;
  adjustedById?: number;
  type?: AdjustmentType;
  quantityDelta: number;
  note?: string;
};

export type CreateBookRequest = {
  title: string;
  author: string;
  isbn: string;
  category: string;
  price: number;
  stockQuantity: number;
  reorderLevel?: number;
  coverImageUrl?: string;
};

export type UpdateBookRequest = CreateBookRequest;

export type CreateCustomerRequest = {
  name: string;
  type?: CustomerType;
  email?: string;
  phone?: string;
  district?: string;
  address?: string;
};

export type CreateSaleRequest = {
  customerId?: number;
  cashierId?: number;
  status?: SaleStatus;
  discount?: number;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  amountPaid?: number;
  fulfillmentMethod?: FulfillmentMethod;
  deliveryContact?: string;
  deliveryAddress?: string;
  customerNote?: string;
  items: Array<{ bookId: number; quantity: number }>;
};

export type UpdateSaleRequest = {
  status?: SaleStatus;
  discount?: number;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  amountPaid?: number;
  fulfillmentMethod?: FulfillmentMethod;
  deliveryContact?: string;
  deliveryAddress?: string;
  customerNote?: string;
  internalNote?: string;
  items?: Array<{ bookId: number; quantity: number }>;
};

export type CreateProductionOrderRequest = {
  bookId: number;
  quantity: number;
  printer: string;
  expectedDeliveryDate?: string;
  notes?: string;
  estimatedCost?: number;
};

export type UpdateProductionOrderRequest = {
  quantity: number;
  printer: string;
  expectedDeliveryDate?: string;
  notes?: string;
  estimatedCost?: number;
  status?: ProductionOrderStatus;
};

export type CreateUserRequest = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

export type UpdateUserRequest = {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
};

export type AuthResponse = {
  user: User | null;
  token: string | null;
  otpRequired: boolean;
  challengeId: string | null;
};

export type AccessRequest = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  department: string | null;
  requestedRole: UserRole;
  status: AccessRequestStatus;
  createdAt: string;
};

export type CreateAccessRequest = {
  name: string;
  email: string;
  phone?: string;
  department?: string;
  requestedRole: Exclude<UserRole, "ADMIN" | "CUSTOMER">;
  password: string;
};

async function api<T>(
  path: string,
  init?: RequestInit,
  options: { auth?: boolean } = {},
): Promise<T> {
  const token = options.auth === false ? null : getAuthToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const problem = await response.json().catch(() => null);
    throw new Error(
      problem?.detail ?? `Request failed with status ${response.status}`,
    );
  }

  return response.json() as Promise<T>;
}

export const roleDashboards: Record<UserRole, Screen> = {
  ADMIN: "dashboard",
  SALES: "sales-dashboard",
  INVENTORY_MANAGER: "inventory-manager",
  COORDINATOR: "coordinator",
  CUSTOMER: "customer-dashboard",
};

export const login = (email: string, password: string) =>
  api<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  }, { auth: false });

export const verifyLoginOtp = (challengeId: string, otp: string) =>
  api<AuthResponse>("/api/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ challengeId, otp }),
  }, { auth: false });

export const changePassword = (currentPassword: string, newPassword: string) =>
  api<User>("/api/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });

export const getSessionUser = () => api<User>("/api/auth/me");

export const registerCustomer = (request: {
  name: string;
  email: string;
  password: string;
  type?: CustomerType;
  phone?: string;
  district?: string;
  address?: string;
}) =>
  api<CustomerRegistrationDto>("/api/customer-requests", {
    method: "POST",
    body: JSON.stringify(request),
  }, { auth: false });

export const listCustomerRegistrations = () =>
  api<CustomerRegistrationDto[]>("/api/customer-requests");

export const approveCustomerRegistration = (id: number) =>
  api<User>(`/api/customer-requests/${id}/approve`, { method: "POST" });

export const rejectCustomerRegistration = (id: number) =>
  api<CustomerRegistrationDto>(`/api/customer-requests/${id}/reject`, {
    method: "POST",
  });

export const requestAccess = (request: CreateAccessRequest) =>
  api<AccessRequest>("/api/access-requests", {
    method: "POST",
    body: JSON.stringify(request),
  });

export const listAccessRequests = () =>
  api<AccessRequest[]>("/api/access-requests");

export const approveAccessRequest = (id: number) =>
  api<User>(`/api/access-requests/${id}/approve`, { method: "POST" });

export const rejectAccessRequest = (id: number) =>
  api<AccessRequest>(`/api/access-requests/${id}/reject`, { method: "POST" });

export const listBooks = (search?: string) =>
  api<Book[]>(
    `/api/books${search ? `?search=${encodeURIComponent(search)}` : ""}`,
  );

export const createBook = (request: CreateBookRequest) =>
  api<Book>("/api/books", { method: "POST", body: JSON.stringify(request) });

export const updateBook = (id: number, request: UpdateBookRequest) =>
  api<Book>(`/api/books/${id}`, {
    method: "PUT",
    body: JSON.stringify(request),
  });

export const deleteBook = async (id: number) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/books/${id}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!response.ok) {
    const problem = await response.json().catch(() => null);
    throw new Error(
      problem?.detail ?? `Request failed with status ${response.status}`,
    );
  }
};

export const listCustomers = (search?: string) =>
  api<Customer[]>(
    `/api/customers${search ? `?search=${encodeURIComponent(search)}` : ""}`,
  );

export const createCustomer = (request: CreateCustomerRequest) =>
  api<Customer>("/api/customers", {
    method: "POST",
    body: JSON.stringify(request),
  });

export const listCustomerSales = () => api<Sale[]>("/api/sales/my");

export const listSales = () => api<Sale[]>("/api/sales");

export const createSale = (request: CreateSaleRequest) =>
  api<Sale>("/api/sales", { method: "POST", body: JSON.stringify(request) });

export const updateMyOrder = (id: number, request: UpdateSaleRequest) =>
  api<Sale>(`/api/sales/my/${id}`, {
    method: "PUT",
    body: JSON.stringify(request),
  });

export const cancelMyOrder = (id: number) =>
  api<Sale>(`/api/sales/my/${id}/cancel`, { method: "POST" });

export const hideMyOrder = async (id: number) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/sales/my/${id}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!response.ok) {
    const problem = await response.json().catch(() => null);
    throw new Error(
      problem?.detail ?? `Request failed with status ${response.status}`,
    );
  }
};

export const updateSaleStatus = (id: number, request: UpdateSaleRequest) =>
  api<Sale>(`/api/sales/${id}/status`, {
    method: "PUT",
    body: JSON.stringify(request),
  });

export const listNotifications = () =>
  api<Notification[]>("/api/notifications/my");

export const markNotificationRead = (id: number) =>
  api<Notification>(`/api/notifications/${id}/read`, { method: "POST" });

export const createBookRequest = (request: {
  bookId: number;
  quantity?: number;
  comment?: string;
}) =>
  api<BookRequest>("/api/book-requests", {
    method: "POST",
    body: JSON.stringify(request),
  });

export const listMyBookRequests = () =>
  api<BookRequest[]>("/api/book-requests/my");

export const listBookRequests = () => api<BookRequest[]>("/api/book-requests");

export const listBookRequestSummary = () =>
  api<BookRequestSummary[]>("/api/book-requests/summary");

export const updateBookRequestStatus = (
  id: number,
  status: BookRequestStatus,
) =>
  api<BookRequest>(`/api/book-requests/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });

export const listUsers = () => api<User[]>("/api/users");

export const listAuditLogs = () => api<AuditLog[]>("/api/audit-logs");

export const createUser = (request: CreateUserRequest) =>
  api<User>("/api/users", { method: "POST", body: JSON.stringify(request) });

export const updateUser = (id: number, request: UpdateUserRequest) =>
  api<User>(`/api/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(request),
  });

export const lockUser = (id: number) =>
  api<User>(`/api/users/${id}/lock`, { method: "POST" });

export const unlockUser = (id: number) =>
  api<User>(`/api/users/${id}/unlock`, { method: "POST" });

export const deleteUser = async (id: number) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!response.ok) {
    const problem = await response.json().catch(() => null);
    throw new Error(
      problem?.detail ?? `Request failed with status ${response.status}`,
    );
  }
};

export const getDashboardSummary = () =>
  api<DashboardSummary>("/api/dashboard");

export const getAdminAnalyticsSummary = (filters: AdminAnalyticsFilters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, String(value));
  });
  const query = params.toString();
  return api<AdminAnalyticsSummary>(`/api/analytics/admin-summary${query ? `?${query}` : ""}`);
};

export const listStockAdjustments = () =>
  api<StockAdjustment[]>("/api/inventory/adjustments");

export const createStockAdjustment = (request: CreateStockAdjustmentRequest) =>
  api<StockAdjustment>("/api/inventory/adjustments", {
    method: "POST",
    body: JSON.stringify(request),
  });

export const listProductionOrders = () =>
  api<ProductionOrder[]>("/api/production-orders");

export const createProductionOrder = (request: CreateProductionOrderRequest) =>
  api<ProductionOrder>("/api/production-orders", {
    method: "POST",
    body: JSON.stringify(request),
  });

export const updateProductionOrder = (
  id: number,
  request: UpdateProductionOrderRequest,
) =>
  api<ProductionOrder>(`/api/production-orders/${id}`, {
    method: "PUT",
    body: JSON.stringify(request),
  });

export const cancelProductionOrder = (id: number) =>
  api<ProductionOrder>(`/api/production-orders/${id}/cancel`, {
    method: "POST",
  });

export const deleteProductionOrder = async (id: number) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/production-orders/${id}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!response.ok) {
    const problem = await response.json().catch(() => null);
    throw new Error(
      problem?.detail ?? `Request failed with status ${response.status}`,
    );
  }
};

export function getCurrentUser(): User | null {
  if (!getAuthToken()) return null;
  const raw = window.localStorage.getItem("adventist-current-user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function getAuthToken() {
  return window.localStorage.getItem("adventist-auth-token");
}

export function setCurrentSession(response: AuthResponse) {
  if (!response.user || !response.token) {
    throw new Error("Session is missing user or token.");
  }
  setStoredCurrentUser(response.user);
  window.localStorage.setItem("adventist-auth-token", response.token);
  window.dispatchEvent(new Event("adventist-session-updated"));
}

export function setStoredCurrentUser(user: User) {
  window.localStorage.setItem(
    "adventist-current-user",
    JSON.stringify(user),
  );
}

export function clearCurrentSession() {
  window.localStorage.removeItem("adventist-current-user");
  window.localStorage.removeItem("adventist-auth-token");
  window.dispatchEvent(new Event("adventist-session-updated"));
}

export function money(value: number, currency = "RWF") {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-RW", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

