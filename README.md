# Markora - বাংলা ই-কমার্স ওয়েবসাইট

A Bengali-language e-commerce store built with Next.js (App Router), Drizzle ORM, PostgreSQL (Supabase) and Supabase Auth. Includes a public storefront and a separate admin panel under `/admin`.

## Tech stack

- **Next.js 16** (App Router) + React 19 + TypeScript
- **Tailwind CSS 4** with a custom Bengali-friendly theme
- **Drizzle ORM** + PostgreSQL (Supabase), `pg` driver
- **Supabase Auth** for the admin panel login
- **Resend** (optional) for new-order email notifications

## Getting started

```bash
npm install
cp .env.example .env   # then fill in your real values
npm run db:push        # sync the database schema (or: npm run db:migrate on a fresh DB)
npm run seed           # add starter categories and products (idempotent)
npm run dev
```

- Storefront: http://localhost:3000
- Admin panel: http://localhost:3000/admin (login via Supabase Auth user)

## Environment variables

See `.env.example` for the full list. Key ones:

| Variable | Purpose | Required |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes (admin login) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public key | Yes (admin login) |
| `RESEND_API_KEY` | Order notification emails | No |
| `ADMIN_NOTIFY_EMAIL` | Recipient of new-order emails | No |
| `NOTIFY_EMAIL_FROM` | Sender address for emails | No |
| `NEXT_PUBLIC_STORE_PHONE` | Mobile number shown for bKash/Nagad | No |

## Useful scripts

```bash
npm run dev            # development server
npm run build          # production build
npm run typecheck      # TypeScript check
npm run lint           # ESLint
npm run seed           # seed categories + products (safe to re-run)
npm run db:generate    # generate a new migration from the schema
npm run db:push        # push schema changes to the database (dev)
npm run db:migrate     # apply migrations (fresh/production databases)
```

## Database & migrations

- Schema lives in `src/db/schema.ts`. Tables: `categories`, `products`, `orders`, `order_items`, `contact_messages`.
- During development, `npm run db:push` keeps the database in sync with the schema.
- The `drizzle/` folder holds generated migrations for fresh deployments - run `npm run db:migrate` there.
- Note: `0000_*.sql` is a full-create baseline. It only works on a **fresh** database; for an existing database always use `npm run db:push` instead.

## Admin panel

Reachable only by URL (`/admin`) - there are no links to it from the public site.

1. Create an admin user in Supabase: **Authentication -> Users -> Add user** (email + password).
2. Open `/admin/login` and sign in.
3. The dashboard covers products, categories, orders (with status updates and automatic restock on cancel), and contact messages.

## Payments

- **Cash on Delivery** - default, no setup needed.
- **bKash / Nagad** - manual verification flow. The customer sends money to `NEXT_PUBLIC_STORE_PHONE` and enters the TrxID at checkout; the admin verifies it manually from the order detail page.

## Notes

- Product images are stored locally under `public/uploads/products/` (gitignored).
- Order notification emails are skipped automatically when Resend is not configured.
