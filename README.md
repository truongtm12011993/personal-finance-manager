# Personal Finance Manager

Next.js + Auth.js + Prisma + PostgreSQL app for personal finance tracking.

## Main Features

- Google Login with Auth.js database sessions.
- PostgreSQL persistence through Prisma.
- Dashboard overview for cash flow, allocation, savings, and investment alerts.
- Expense and budget tracking.
- Savings goals, deposits, withdrawals, maturity tracking.
- Investment assets, holdings, transactions, price updates, and transaction history.
- USD/VND exchange-rate setting for USD-like assets with explicit VND conversion notes.
- Export endpoints for expense and investment data.

## Setup

Install dependencies:

```bash
npm install
```

Copy `.env.example` to `.env` and fill in the values.

Local PostgreSQL:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/finance_db?schema=public"
```

Online PostgreSQL, for example Neon or Supabase:

```bash
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public&sslmode=require"
```

Auth variables:

```bash
AUTH_SECRET="random-secret"
AUTH_GOOGLE_ID="google-client-id"
AUTH_GOOGLE_SECRET="google-client-secret"
```

Create a secret with:

```bash
npx auth secret
```

## Google OAuth

In Google Cloud Console, create an OAuth client with:

- Application type: `Web application`
- Local origin: `http://localhost:3000`
- Local redirect URI: `http://localhost:3000/api/auth/callback/google`

For production, add the real domain redirect URI:

```bash
https://your-domain.com/api/auth/callback/google
```

## Database

Generate Prisma client:

```bash
npm run prisma:generate
```

Apply migrations in development:

```bash
npm run prisma:migrate
```

Apply existing migrations to an online database:

```bash
npm run prisma:deploy
```

## Run

```bash
npm run dev
```

Open `http://localhost:3000`.

## Quality Checks

```bash
npm run typecheck
npm run check:utf8
npm run lint
npm run build
npx prisma validate
```

Optional database connectivity check:

```bash
"SELECT 1;" | npx prisma db execute --stdin --schema prisma/schema.prisma
```

## Important Structure

- `auth.ts`: Auth.js Google provider and Prisma adapter.
- `prisma/schema.prisma`: PostgreSQL schema.
- `app/actions/*`: server actions for expense, savings, investment, settings, and auth.
- `lib/server/*`: validators, repositories, and services.
- `components/dashboard-*`: dashboard overview and charts.
- `components/expense-*`: expense and budget UI.
- `components/savings-*`: savings goals and transactions.
- `components/investment-*`: investment assets, holdings, transactions, and price updates.
- `components/fintech-ui.tsx`: shared dashboard UI primitives.
