ALTER TABLE "orders" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "is_due" boolean DEFAULT false NOT NULL;