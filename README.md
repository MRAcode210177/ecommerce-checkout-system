# 🛒 ApexStore — Production-Ready E-Commerce Checkout & Payment System

A complete, production-ready full-stack E-Commerce Checkout & Payment System architected as a **pnpm monorepo**. Built with **NestJS**, **PostgreSQL**, **Prisma ORM**, **Next.js (App Router)**, **React Query**, **Zustand**, and **Tailwind CSS**.

---

## 🌟 Key Features & Architectural Highlights

- **Monorepo Architecture**: Clean separation of concerns with `apps/web` (Next.js), `apps/api` (NestJS), and `packages/shared-types` (shared TypeScript DTOs and enums).
- **Strictly Layered Backend**: Clear unidirectional flow: `Controller (HTTP & Class-Validator DTOs)` → `Service (Business Invariants)` → `Repository (Pure Prisma DB Queries)`. Zero database leaking into services, zero business logic in controllers.
- **Atomic Stock Reservation (`$transaction` + Row Locking)**:
  - Executes stock validation, row-level locking (`SELECT ... FOR UPDATE` via Prisma `$queryRaw`), stock decrement, price re-computation, and Order + OrderItem creation inside a **single database transaction**.
  - Guarantees zero partial stock decrements or overselling under high concurrency.
- **Deterministic Mock Payment Service**:
  - Deterministically evaluates card numbers: cards ending in `0000` are declined; all other cards succeed.
  - Full client-supplied `idempotencyKey` support to prevent duplicate charge attempts.
- **Order Lifecycle & Atomic Refunds**:
  - Lifecycle: `RESERVED` → `PAID` → `COMPLETED`, with `CANCELLED` and `REFUNDED` states.
  - Refund endpoint reverses `PAID` orders inside a transaction: creates a `Refund` record, restores product stock, and updates order status to `REFUNDED`.
- **JWT Auth & Ownership Guard**:
  - Passport JWT authentication, `JwtAuthGuard`, `RolesGuard` (`USER`/`ADMIN`), and resource ownership enforcement.
- **Resilient Modern Frontend**:
  - Built with Next.js App Router, TanStack Query for server state caching, Zustand for local persistent cart state, `next-themes` dark/light mode toggle, skeleton loading states, empty state views, and React `ErrorBoundary`.

---

## 🏗 Monorepo Structure

```
.
├── apps
│   ├── api                 # NestJS Backend Application
│   │   ├── prisma          # Prisma Schema & Database Seed Scripts
│   │   └── src
│   │       ├── auth        # JWT Authentication, Guards, Roles, User Repository
│   │       ├── checkout    # Atomic Checkout Transaction & Stock Reservation
│   │       ├── common      # Custom Global Exception Filter & Domain Exceptions
│   │       ├── orders      # Order History & Atomic Refund Management
│   │       ├── payments    # Mock Payment Service & Idempotency Key Handling
│   │       ├── prisma      # Global Prisma Module & Service
│   │       └── products    # Product Listing, Keyword Search, & Pagination
│   └── web                 # Next.js 14 App Router Frontend
│       └── src
│           ├── app         # App Router Pages (Catalog, Detail, Checkout, Confirmation, Orders, Auth)
│           ├── components  # Modular UI Primitives (Button, Input, Card, Badge, Skeleton, ThemeToggle)
│           ├── hooks       # TanStack Query Custom Hooks
│           ├── lib         # API Client & Utility Functions
│           ├── providers   # QueryClient & NextThemes Providers
│           └── store       # Zustand Local Stores (useCartStore, useAuthStore)
└── packages
    └── shared-types        # Shared TypeScript DTOs, Enums, and Interfaces
```

---

## 🛠 Technology Stack

- **Backend**: NestJS, PostgreSQL, Prisma ORM, Passport JWT, Bcrypt, Class-Validator, Jest.
- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS, TanStack Query v5, Zustand, Lucide React, Next-Themes.
- **Shared**: TypeScript 5, PNPM Workspaces.

---

## 🚀 Getting Started & Local Setup

### Prerequisites

- **Node.js**: `v18.0.0` or higher (`v22` recommended)
- **pnpm**: `v8.0.0` or higher (`pnpm 10` supported)
- **PostgreSQL**: Local or remote PostgreSQL database instance running on port `5432`

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/MRAcode210177/ecommerce-checkout-system.git
cd ecommerce-checkout-system
pnpm install
```

### 2. Configure Environment Variables

Create `.env` in the root directory (or copy from `.env.example`):

```env
# Database Connection (PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ecommerce_db?schema=public"

# Auth / JWT
JWT_SECRET="super-secret-jwt-key-production-change-me-32-chars-minimum"
JWT_EXPIRES_IN="7d"

# Server Ports
PORT=4000
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
```

### 3. Initialize Database & Seed Demo Data

Run Prisma database generation, migrations, and seed demo products and user accounts:

```bash
# Generate Prisma Client
pnpm db:generate

# Execute Database Migration
pnpm db:migrate

# Seed Demo Products and User/Admin Accounts
pnpm db:seed
```

#### Demo User Credentials:
- **Customer User**: `user@example.com` / `password123`
- **Admin User**: `admin@example.com` / `password123`

### 4. Run Development Servers

Start both NestJS API (`http://localhost:4000`) and Next.js Web Frontend (`http://localhost:3000`) concurrently:

```bash
pnpm dev
```

You can also start them individually:
```bash
pnpm dev:api   # Starts NestJS API on http://localhost:4000
pnpm dev:web   # Starts Next.js Web on http://localhost:3000
```

---

## 🧪 Running Unit & Integration Tests

The project includes targeted unit tests covering high-value business logic: cart price calculations (with multi-item subtotal and rounding precision) and the checkout transaction's stock reservation / rollback mechanism under low stock conditions.

```bash
pnpm test
```

Sample Test Output:
```
PASS src/checkout/cart-total.spec.ts
PASS src/checkout/checkout-transaction.spec.ts

Test Suites: 2 passed, 2 total
Tests:       7 passed, 7 total
Time:        17.948 s
```

---

## 💳 Mock Payment Rules & Idempotency

### Payment Evaluation Rules
Payments are processed via `POST /api/payments/process`:
- **Declined Simulation**: Any credit card number ending in `0000` (e.g. `4000 0000 0000 0000`) is deterministically declined (`PaymentDeclinedException`).
- **Success Simulation**: Any other valid 16-digit card number will succeed and transition the order status from `RESERVED` to `PAID`.

### Idempotency Key Handling
Both `POST /api/checkout` and `POST /api/payments/process` require/accept a unique `idempotencyKey` header or body parameter. Re-submitting requests with a matching key immediately returns the cached order/payment payload without re-executing database mutations or charging the card twice.

---

## ⚖️ Trade-offs & Future Improvements

While this submission is production-ready, modular, and fully tested, real-world enterprise deployments at massive scale would benefit from the following architectural evolutions:

1. **Distributed Locks (Redis / Redlock) vs. Database Row Locking**:
   - *Current Implementation*: Uses PostgreSQL `SELECT ... FOR UPDATE` row locking via Prisma `$queryRaw` inside `$transaction`. This is ACID-compliant and bulletproof for single/multi-node deployments backed by a relational database.
   - *Future Scale*: For extreme read/write scale across thousands of concurrent checkout requests per second, offloading row locks to a Redis cluster using Redlock or Redis Lua scripts reduces relational database connection contention.

2. **Job Queue & Reservation Expiry Timers (BullMQ / Redis)**:
   - *Current Implementation*: Orders transition to `RESERVED` during checkout.
   - *Future Scale*: Integrate BullMQ background worker queues to automatically release stock and set order status to `EXPIRED` if payment is not completed within a 15-minute window.

3. **Asynchronous Stripe Webhook Integration**:
   - *Current Implementation*: Synchronous mock payment endpoint returning immediate transaction status.
   - *Future Scale*: Integrate real payment providers (e.g., Stripe PaymentIntents API) using asynchronous webhooks (`payment_intent.succeeded`, `payment_intent.payment_failed`) for event-driven status reconciliation.

4. **Event-Driven Architecture & Outbox Pattern**:
   - *Current Implementation*: Direct database updates during checkout and refund calls.
   - *Future Scale*: Implement the Transactional Outbox pattern with Kafka/RabbitMQ to trigger downstream services (order fulfillment, email notifications, analytics) asynchronously.
