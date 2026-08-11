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
| `ADMIN_EMAILS` | Comma-separated allowlist of admin emails (alt. to the admin role) | No |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key for storage uploads + live customer email lookup | Recommended |

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

Reachable only by URL (`/admin`) - there are no links to it from the public site. **Only accounts marked as admin can enter** - a regular (or public signup) account is blocked, so the dashboard is not exposed to customers.

1. Create an admin user in Supabase: **Authentication -> Users -> Add user** (email + password).
2. Grant the admin role by running this in the Supabase SQL Editor (or `npm run db:migrate`, then edit `scripts/enable-rls.sql` to your email first):

   ```sql
   update auth.users
   set raw_app_meta_data = jsonb_set(coalesce(raw_app_meta_data, '{}'::jsonb), '{role}', '"admin"'::jsonb)
   where email = 'YOUR_ADMIN_EMAIL@gmail.com';
   ```

   Alternatively, set the `ADMIN_EMAILS` env var (comma-separated) in Vercel and redeploy - no SQL needed.
3. Open `/admin/login` and sign in.
4. The dashboard covers products, categories, orders (with status updates and automatic restock on cancel), customers (full profile per account, with the email taken automatically from their Supabase account), and contact messages.

## Security hardening (recommended)

Migration `0004` (run with `npm run db:migrate`) plus `scripts/enable-rls.sql` (for the Supabase SQL Editor):

- Enables **Row Level Security** on all tables so the public Supabase REST API (browser-exposed anon key) cannot read/write customer data. The app itself is unaffected (it uses the server-side `DATABASE_URL` connection).
- Backfills `customer_email` on existing orders from `auth.users`.
- Grants the admin role to your admin account (edit the email in the script first).

Also recommended:
- Disable **public signup** in Supabase (Authentication -> Providers -> Email: uncheck "Allow new users to sign up") if customers should only be created by admins.
- Set a strong password / enable 2FA on the admin account.

## Product images on Vercel (Supabase Storage)

Product images are stored in **Supabase Storage**, not on the local disk. This is required because Vercel's serverless filesystem is read-only - a local `public/uploads` folder works in `next dev` but every upload fails after deploying.

### One-time setup (Supabase dashboard)

1. **Storage -> New bucket**, name it exactly `product-images` and enable **Public bucket**.
2. Recommended: add the server-only key so uploads work without extra policies:
   - Project Settings -> API -> copy the `service_role` key.
   - Add it as `SUPABASE_SERVICE_ROLE_KEY` in your `.env` **and** in Vercel (Project -> Settings -> Environment Variables, tick Production + Preview).
   - The service role key is powerful - never put it in a `NEXT_PUBLIC_*` variable.

   Alternative (no service role key): run these two policies in the Supabase SQL editor, then the anon key can upload/delete:

   ```sql
   create policy "anon product image uploads" on storage.objects
     for insert to anon with check (bucket_id = 'product-images');

   create policy "anon product image deletes" on storage.objects
     for delete to anon using (bucket_id = 'product-images');
   ```

3. Redeploy on Vercel after adding/changing environment variables - `NEXT_PUBLIC_*` values are baked in at build time.

Note: this app also needs `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel - see the environment variables table above. If you only ran `npm run db:push` against a local database, run `npm run db:migrate` against the production connection string first so the tables exist.

## Payments

- **Cash on Delivery** - default, no setup needed.
- **bKash / Nagad** - manual verification flow. The customer sends money to `NEXT_PUBLIC_STORE_PHONE` and enters the TrxID at checkout; the admin verifies it manually from the order detail page.

## Notes

- Product images are stored locally under `public/uploads/products/` (gitignored).
- Order notification emails are skipped automatically when Resend is not configured.
