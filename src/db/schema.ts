import {
  boolean,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// ---------- Categories ----------
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  nameBn: text("name_bn").notNull(),
  icon: text("icon").notNull().default("layout-grid"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------- Products ----------
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull().default(""),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  oldPrice: numeric("old_price", { precision: 12, scale: 2 }),
  imageUrl: text("image_url").notNull().default(""),
  stock: integer("stock").notNull().default(0),
  categoryId: integer("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  isFeatured: boolean("is_featured").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------- Orders ----------
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  // Supabase auth user id - required for new orders (legacy guest orders may be null).
  userId: text("user_id"),
  // Manually flagged "due" by the admin; auto-due (overdue) is computed.
  isDue: boolean("is_due").notNull().default(false),
  // Admin-set expected delivery date/time - chosen manually when confirming the order.
  expectedDeliveryAt: timestamp("expected_delivery_at", { withTimezone: true }),
  // Actual delivery date/time - fixed by the admin when marking the order delivered.
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  altPhone: text("alt_phone"),
  address: text("address").notNull(),
  city: text("city").notNull(),
  area: text("area"),
  note: text("note"),
  paymentMethod: text("payment_method").notNull().default("cash_on_delivery"),
  transactionId: text("transaction_id"),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
  deliveryFee: numeric("delivery_fee", { precision: 12, scale: 2 }).notNull().default("0"),
  total: numeric("total", { precision: 12, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------- Order items ----------
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id").references(() => products.id, {
    onDelete: "set null",
  }),
  productName: text("product_name").notNull(),
  productImage: text("product_image").notNull().default(""),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull().default(1),
  lineTotal: numeric("line_total", { precision: 12, scale: 2 }).notNull(),
});

// ---------- Contact messages ----------
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  subject: text("subject").notNull().default(""),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
