# Adventist Bookstore Management System

A full-stack bookstore operations platform for Adventist publishing and distribution workflows. The application helps teams manage book inventory, customer registrations, sales, customer orders, reprint demand, production orders, notifications, users, and administrative reporting from role-specific dashboards.

The project is split into:

- `backend/` - Spring Boot API with PostgreSQL, Flyway migrations, token-based authentication, role-based authorization, and integration tests.
- `frontend/` - React, TypeScript, Vite, and Tailwind CSS single-page application with hash-based navigation.

## What The System Does

The platform supports the day-to-day work of a bookstore or publishing distribution office:

- Admins manage users, customer approvals, catalog inventory, production planning, reports, and audit activity.
- Sales staff sell books at the point of sale, manage customers, review orders, update fulfillment, and reconcile daily sales.
- Inventory managers maintain stock, record adjustments, monitor low-stock/reprint alerts, and review customer demand for unavailable books.
- Coordinators plan reprints, analyze sales, manage production orders, and track estimated production budgets.
- Customers register, browse books, place orders, request out-of-stock books, track their orders, and read notifications.

## Tech Stack

### Backend

- Java 17
- Spring Boot 4
- Spring Web MVC
- Spring Security
- Spring Data JPA
- PostgreSQL
- Flyway database migrations
- Maven wrapper
- H2 for tests

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Redux Toolkit dependencies available
- Lucide React icons
- ESLint

## Project Structure

```text
.
|-- backend/
|   |-- src/main/java/com/adventist/backend/
|   |   |-- access/          # Staff access requests
|   |   |-- audit/           # Audit log tracking
|   |   |-- auth/            # Login, tokens, current session
|   |   |-- books/           # Book catalog and stock metadata
|   |   |-- bookrequests/    # Customer demand requests
|   |   |-- config/          # Security, CORS, token filter
|   |   |-- customers/       # Customers and registrations
|   |   |-- dashboard/       # Admin summary metrics
|   |   |-- inventory/       # Stock adjustments
|   |   |-- notifications/   # User notifications
|   |   |-- production/      # Reprint/production orders
|   |   |-- sales/           # POS, customer orders, fulfillment
|   |   `-- users/           # User management
|   `-- src/main/resources/db/migration/
|-- frontend/
|   |-- src/components/      # Shared UI, layout, forms
|   |-- src/data/            # Navigation and demo user metadata
|   |-- src/lib/             # API client, actions, storage, validation
|   |-- src/pages/           # Role-specific screens
|   `-- src/types/           # Shared TypeScript types
`-- README.md
```

## User Roles And Flows

### Public Visitor

1. Opens the landing page.
2. Logs in with an existing account, registers as a customer, or requests staff access.
3. Customer registration and staff access requests are submitted to the backend for admin review.

### Admin

1. Logs in and lands on the admin dashboard.
2. Reviews summary metrics such as users, titles, customers, revenue, recent sales, and low-stock books.
3. Manages inventory records and book catalog data.
4. Reviews and approves or rejects customer registration requests.
5. Reviews and approves or rejects staff access requests.
6. Creates, edits, locks, unlocks, or deletes users.
7. Reviews sales, reports, production orders, production budgets, book requests, and audit logs.

### Sales

1. Logs in to the sales dashboard.
2. Creates in-person sales through the point-of-sale screen.
3. Selects customers, books, quantities, payment method, fulfillment method, and sale status.
4. Reviews sales history and daily summaries.
5. Manages customer records.
6. Reviews customer orders and updates order or fulfillment status.

### Customer

1. Registers from the public registration screen and waits for admin approval.
2. Logs in after approval.
3. Browses available books.
4. Places pickup or delivery orders.
5. Reviews, updates, cancels, or hides eligible personal orders.
6. Creates book requests for wanted titles.
7. Reads notifications and manages profile details.

### Inventory Manager

1. Logs in to the inventory manager dashboard.
2. Reviews book inventory and stock status.
3. Records stock adjustments such as received shipments, corrections, returns, damage, and received reprints.
4. Monitors low-stock and reprint alerts.
5. Reviews customer book requests and demand summaries.
6. Reviews production orders and inventory reports.

### Coordinator

1. Logs in to the coordinator dashboard.
2. Reviews reprint planning and sales analysis screens.
3. Creates and manages production orders.
4. Tracks estimated production costs and budget information.
5. Reviews coordinator reports.

## Demo Accounts

The backend seeds these accounts when the database has no users, books, or customers:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@adventist.rw` | `admin123` |
| Sales | `sales@adventist.rw` | `sales123` |
| Inventory Manager | `inventory@adventist.rw` | `inventory123` |
| Coordinator | `coordinator@adventist.rw` | `coordinator123` |

Customer accounts are created through the public registration flow and become usable after admin approval.

## Backend Setup

### Prerequisites

- Java 17+
- PostgreSQL
- A database named `adventist_bookstore`, or a custom database configured with environment variables

### Configuration

The backend reads configuration from `backend/src/main/resources/application.properties`.

Default values:

```properties
server.port=8084
spring.datasource.url=jdbc:postgresql://localhost:5432/adventist_bookstore
spring.datasource.username=postgres
spring.datasource.password=postgres
app.cors.allowed-origins=http://localhost:5173,http://127.0.0.1:5173
```

Supported environment variables:

| Variable | Purpose | Default |
| --- | --- | --- |
| `SERVER_PORT` | API server port | `8084` |
| `DATABASE_URL` | JDBC database URL | `jdbc:postgresql://localhost:5432/adventist_bookstore` |
| `DATABASE_USERNAME` | Database username | `postgres` |
| `DATABASE_PASSWORD` | Database password | `postgres` |
| `JPA_DDL_AUTO` | Hibernate schema behavior | `update` |
| `CORS_ALLOWED_ORIGINS` | Allowed frontend origins | `http://localhost:5173,http://127.0.0.1:5173` |

### Run The API

From `backend/`:

```powershell
.\mvnw.cmd spring-boot:run
```

On macOS or Linux:

```bash
./mvnw spring-boot:run
```

The API runs at `http://localhost:8084` by default.

### Test The Backend

From `backend/`:

```powershell
.\mvnw.cmd test
```

The test profile uses an in-memory H2 database from `backend/src/test/resources/application.properties`.

## Frontend Setup

### Prerequisites

- Node.js
- npm

### Install Dependencies

From `frontend/`:

```powershell
npm install
```

### Configure API URL

The frontend defaults to `http://localhost:8084`. To point it somewhere else, create a local Vite environment file such as `frontend/.env.local`:

```env
VITE_API_BASE_URL=http://localhost:8084
```

### Run The Frontend

From `frontend/`:

```powershell
npm run dev
```

The Vite app usually runs at `http://localhost:5173`.

### Build, Lint, And Preview

```powershell
npm run build
npm run lint
npm run preview
```

## Running The Whole App Locally

1. Start PostgreSQL and create the database:

   ```sql
   CREATE DATABASE adventist_bookstore;
   ```

2. Start the backend:

   ```powershell
   cd backend
   .\mvnw.cmd spring-boot:run
   ```

3. In a second terminal, start the frontend:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

4. Open `http://localhost:5173`.
5. Log in with one of the demo accounts or register a customer.

## Main API Areas

All protected endpoints use a bearer token returned by `POST /api/auth/login`.

| Area | Endpoint |
| --- | --- |
| Authentication | `/api/auth/login`, `/api/auth/me` |
| Dashboard | `/api/dashboard` |
| Books | `/api/books` |
| Customers | `/api/customers` |
| Customer registration requests | `/api/customer-requests` |
| Staff access requests | `/api/access-requests` |
| Sales and orders | `/api/sales`, `/api/sales/my` |
| Inventory adjustments | `/api/inventory/adjustments` |
| Book requests | `/api/book-requests`, `/api/book-requests/my`, `/api/book-requests/summary` |
| Production orders | `/api/production-orders` |
| Notifications | `/api/notifications/my` |
| Users | `/api/users` |
| Audit logs | `/api/audit-logs` |

## Authorization Summary

- Public users can log in, request staff access, and submit customer registrations.
- Admins can access user management, approvals, dashboard metrics, audit logs, inventory, sales, reports, and production planning.
- Sales users can access POS, customer management, sales history, customer orders, fulfillment, and daily summaries.
- Inventory managers can manage inventory adjustments, book inventory, book requests, reprint alerts, and production-order visibility.
- Coordinators can manage reprint planning, sales analysis, production orders, budgets, and reports.
- Customers can browse books, create orders, manage their own orders, create book requests, and read notifications.

## Database Migrations

Flyway migrations live in `backend/src/main/resources/db/migration/`.

Current migration themes include:

- Initial schema for users, books, customers, and sales
- Customer orders, book requests, and notifications
- Sales payment and fulfillment details
- Production order receiving
- Audit logs
- User notifications
- Customer addresses

## Notes For Development

- The frontend uses hash routes such as `#dashboard`, `#pos`, and `#customer-orders`.
- Auth state is stored in browser local storage under `adventist-auth-token` and `adventist-current-user`.
- The backend is stateless and authenticates API requests with bearer tokens.
- Seed data only runs when users, books, and customers are all empty.
- Keep CORS origins aligned with the frontend dev server URL.
