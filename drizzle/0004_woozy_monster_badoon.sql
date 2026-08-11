ALTER TABLE "orders" ADD COLUMN "customer_email" text;

-- Backfill customer emails from the Supabase auth users table for existing
-- orders, so the admin panel shows every customer's email immediately.
update orders o
set customer_email = u.email
from auth.users u
where o.user_id = u.id
  and o.customer_email is null;

-- ---------- Row Level Security ----------
-- The app reads/writes these tables through its own server-side Postgres
-- connection (DATABASE_URL, the table owner), which bypasses RLS, so enabling
-- RLS here does not change how the app works. It blocks the PUBLIC Supabase
-- REST API (PostgREST, using the browser-exposed anon key) from reading or
-- writing customer data directly.

-- Customer data: deny all access via the public API.
alter table "orders" enable row level security;
alter table "order_items" enable row level security;
alter table "contact_messages" enable row level security;

-- Public catalog data: readable by everyone (still protected from writes).
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
