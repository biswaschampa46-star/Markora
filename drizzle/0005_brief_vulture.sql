ALTER TABLE "orders" ADD COLUMN "admin_viewed_at" timestamp with time zone;
--> statement-breakpoint
-- Existing orders predate this feature - treat them as already viewed so the
-- "new orders" badge starts at zero and only counts future orders.
UPDATE "orders" SET "admin_viewed_at" = now() WHERE "admin_viewed_at" IS NULL;
