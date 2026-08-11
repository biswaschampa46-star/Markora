-- ============================================================================
-- Markora security hardening SQL
-- Run this in the Supabase Dashboard -> SQL Editor (or `npm run db:migrate`
-- applies it automatically as migration 0004).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) Grant the admin role to your admin account(s)
--    The admin panel now requires user.app_metadata.role = 'admin' (or an
--    email listed in the ADMIN_EMAILS env var). Set the role for your account:
-- ----------------------------------------------------------------------------
update auth.users
set raw_app_meta_data = jsonb_set(
  coalesce(raw_app_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'::jsonb
)
where email in ('YOUR_ADMIN_EMAIL@gmail.com');  -- <- put your admin email here

-- ----------------------------------------------------------------------------
-- 2) Row Level Security
--    The app reads/writes these tables through its own server-side Postgres
--    connection (DATABASE_URL = table owner, bypasses RLS), so the app keeps
--    working. RLS blocks the PUBLIC Supabase REST API (PostgREST with the
--    browser-exposed anon key) from reading/writing customer data directly.
-- ----------------------------------------------------------------------------

-- Customer data: deny all access via the public API.
alter table "orders" enable row level security;
alter table "order_items" enable row level security;
alter table "contact_messages" enable row level security;

-- Public catalog data: readable by everyone, but not writable.
alter table "products" enable row level security;
alter table "categories" enable row level security;

drop policy if exists "catalog read for anon" on "products";
create policy "catalog read for anon" on "products"
  for select to anon using (true);
drop policy if exists "catalog read for authenticated" on "products";
create policy "catalog read for authenticated" on "products"
  for select to authenticated using (true);
drop policy if exists "catalog read for anon" on "categories";
create policy "catalog read for anon" on "categories"
  for select to anon using (true);
drop policy if exists "catalog read for authenticated" on "categories";
create policy "catalog read for authenticated" on "categories"
  for select to authenticated using (true);

-- ----------------------------------------------------------------------------
-- 3) Backfill customer emails on existing orders (from their account)
-- ----------------------------------------------------------------------------
update orders o
set customer_email = u.email
from auth.users u
where o.user_id = u.id
  and o.customer_email is null;
