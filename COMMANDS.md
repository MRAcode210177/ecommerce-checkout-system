# 📜 Command Reference Guide — ApexStore Monorepo

This document provides a comprehensive cheat sheet for running, building, testing, and managing the database across the **ApexStore E-Commerce Monorepo**.

---

## 🚀 1. Running the Application

### Run Full Application (Frontend + Backend Concurrently)
Starts both the NestJS Backend (`http://localhost:4000`) and Next.js Web Frontend (`http://localhost:3000`) simultaneously:
```bash
pnpm dev
```

### Run Only Frontend (Next.js Web App)
Starts only the Next.js frontend application on `http://localhost:3000`:
```bash
pnpm dev:web
```

### Run Only Backend (NestJS API Service)
Starts only the NestJS backend application in watch mode on `http://localhost:4000`:
```bash
pnpm dev:api
```

---

## 🗄️ 2. Database & Prisma Management Commands

### Generate Prisma Client
Generates TypeScript client bindings from `apps/api/prisma/schema.prisma`:
```bash
pnpm db:generate
```

### Apply Schema Migrations (Development Migration)
Creates a new migration file and applies pending migrations to the PostgreSQL database:
```bash
pnpm db:migrate
```

### Push Schema Changes directly (Without Migration Files)
Pushes schema changes directly to the database without creating migration history files (useful for rapid prototyping):
```bash
pnpm db:push
```

### Seed Database with Initial Data
Populates the database with demo products across multiple categories and pre-configured user & admin accounts:
```bash
pnpm db:seed
```

### Clear & Reset Local Database
Drops the local database, recreates it, applies all schema migrations from scratch, and runs the seed script:
```bash
pnpm db:reset
```

### Open Prisma Studio (GUI Data Browser)
Launches Prisma Studio in your web browser (`http://localhost:5555`) for visual database browsing and manual record editing:
```bash
pnpm db:studio
```

---

## 🏗️ 3. Building & Linting

### Build All Workspaces
Compiles `packages/shared-types`, `apps/api`, and `apps/web` in the correct dependency order:
```bash
pnpm build
```

### Build Individual Workspaces
```bash
# Build only Shared Types package
pnpm --filter @ecommerce/shared-types build

# Build only NestJS Backend
pnpm --filter api build

# Build only Next.js Web Frontend
pnpm --filter web build
```

### Code Formatting & Quality
```bash
# Format all codebase files with Prettier
pnpm format

# Lint all workspace projects
pnpm lint
```

---

## 🧪 4. Running Tests

### Run All Unit & Transaction Tests
Runs Jest unit tests for cart price calculations and stock reservation transaction rollback:
```bash
pnpm test
```

### Run Tests in Watch Mode
```bash
pnpm --filter api test:watch
```

### Generate Test Coverage Report
```bash
pnpm --filter api test:cov
```

---

## 📦 5. Package & Dependency Management

### Install All Workspace Dependencies
```bash
pnpm install
```

### Adding New Packages
```bash
# Add a dependency to the NestJS Backend
pnpm --filter api add <package-name>

# Add a dev dependency to the NestJS Backend
pnpm --filter api add -D <package-name>

# Add a dependency to the Next.js Frontend
pnpm --filter web add <package-name>

# Add a dependency to Shared Types
pnpm --filter @ecommerce/shared-types add <package-name>

# Add a dependency to the Monorepo Root
pnpm add -w <package-name>
```

---

## 🔑 Demo Account Credentials

When the database is seeded (`pnpm db:seed`), the following test accounts are generated with hashed passwords:

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Customer** | `user@example.com` | `password123` | Cart, Checkout, View Personal Orders, Request Refunds |
| **Admin** | `admin@example.com` | `password123` | Full privileges (Create Products, View All Orders, Process Refunds) |

---

## 💳 Payment Simulation Rules

- **Declined Card**: Enter a card ending in `0000` (e.g. `4000 0000 0000 0000`) to test transaction decline errors.
- **Successful Card**: Enter any other 16-digit card number (e.g. `4242 4242 4242 4242`) to complete payment.
