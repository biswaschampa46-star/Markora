import { unstable_cache } from "next/cache";
import { db } from "@/db";
import { categories, contactMessages, orderItems, orders, products } from "@/db/schema";
import { and, desc, eq, ilike, inArray, isNull, or, sql } from "drizzle-orm";
import { getOrderDue } from "@/lib/order-due";

// The public storefront catalog is cached in Next's Data Cache for 60s. This
// keeps Vercel serverless renders fast (no DB hit on every visit) while admin
// edits purge the cache immediately via revalidatePath (see admin actions).
// NOTE: cached rows are JSON-serialized, so Date columns arrive as ISO strings.
// The storefront only renders scalar fields, so this is safe here.
const STOREFRONT_REVALIDATE = 60;

export const getCategories = unstable_cache(
  async () => db.select().from(categories).orderBy(categories.sortOrder),
  ["categories"],
  { revalidate: STOREFRONT_REVALIDATE, tags: ["categories"] },
);

export const getCategoryBySlug = unstable_cache(
  async (slug: string) => {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category ?? null;
  },
  ["category-by-slug"],
  { revalidate: STOREFRONT_REVALIDATE, tags: ["categories"] },
);

export async function getCategoryByIdAdmin(id: number) {
  const [category] = await db.select().from(categories).where(eq(categories.id, id));
  return category ?? null;
}

export const getFeaturedProducts = unstable_cache(
  async (limit = 8) =>
    db
      .select()
      .from(products)
      .where(and(eq(products.isActive, true), eq(products.isFeatured, true)))
      .orderBy(desc(products.createdAt))
      .limit(limit),
  ["featured-products"],
  { revalidate: STOREFRONT_REVALIDATE, tags: ["products"] },
);

export const getLatestProducts = unstable_cache(
  async (limit = 12) =>
    db
      .select()
      .from(products)
      .where(eq(products.isActive, true))
      .orderBy(desc(products.createdAt))
      .limit(limit),
  ["latest-products"],
  { revalidate: STOREFRONT_REVALIDATE, tags: ["products"] },
);

export const getProductsByCategorySlug = unstable_cache(
  async (slug: string) => {
    const category = await getCategoryBySlug(slug);
    if (!category) return { category: null, items: [] };
    const items = await db
      .select()
      .from(products)
      .where(and(eq(products.categoryId, category.id), eq(products.isActive, true)))
      .orderBy(desc(products.createdAt));
    return { category, items };
  },
  ["products-by-category"],
  { revalidate: STOREFRONT_REVALIDATE, tags: ["products", "categories"] },
);

export const getProductBySlug = unstable_cache(
  async (slug: string) => {
    const [product] = await db
      .select()
      .from(products)
      .where(and(eq(products.slug, slug), eq(products.isActive, true)));
    return product ?? null;
  },
  ["product-by-slug"],
  { revalidate: STOREFRONT_REVALIDATE, tags: ["products"] },
);

export const searchProducts = unstable_cache(
  async (query: string) => {
    if (!query.trim()) return [];
    return db
      .select()
      .from(products)
      .where(
        and(
          eq(products.isActive, true),
          or(ilike(products.name, `%${query}%`), ilike(products.description, `%${query}%`)),
        ),
      )
      .orderBy(desc(products.createdAt));
  },
  ["search-products"],
  { revalidate: STOREFRONT_REVALIDATE, tags: ["products"] },
);

export async function getProductsByIds(ids: number[]) {
  if (ids.length === 0) return [];
  return db
    .select()
    .from(products)
    .where(and(eq(products.isActive, true), inArray(products.id, ids)));
}

export const getRelatedProducts = unstable_cache(
  async (categoryId: number | null, excludeId: number, limit = 4) => {
    if (!categoryId) return [];
    return db
      .select()
      .from(products)
      .where(
        and(
          eq(products.categoryId, categoryId),
          eq(products.isActive, true),
          sql`${products.id} <> ${excludeId}`,
        ),
      )
      .limit(limit);
  },
  ["related-products"],
  { revalidate: STOREFRONT_REVALIDATE, tags: ["products"] },
);

// ---------- Admin ----------
export async function getAllProductsAdmin() {
  return db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      price: products.price,
      oldPrice: products.oldPrice,
      imageUrl: products.imageUrl,
      stock: products.stock,
      isFeatured: products.isFeatured,
      isActive: products.isActive,
      createdAt: products.createdAt,
      categoryName: categories.nameBn,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(desc(products.createdAt));
}

export async function getProductByIdAdmin(id: number) {
  const [product] = await db.select().from(products).where(eq(products.id, id));
  return product ?? null;
}

export async function getAllOrdersAdmin(status?: string, limit?: number) {
  const base =
    status && status !== "all" && status !== "due"
      ? db.select().from(orders).where(eq(orders.status, status)).orderBy(desc(orders.createdAt))
      : db.select().from(orders).orderBy(desc(orders.createdAt));

  const rows = await (limit ? base.limit(limit) : base);

  const withDue = rows.map((o) => ({ ...o, due: getOrderDue(o) }));
  return status === "due" ? withDue.filter((o) => o.due.isDue) : withDue;
}

// Counts that power the "new orders" notification badge in the admin sidebar:
// unread = orders the admin hasn't viewed yet, pending = awaiting confirmation.
export async function getAdminOrderNotificationCounts() {
  const [unread, pending] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(orders)
      .where(isNull(orders.adminViewedAt)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(orders)
      .where(eq(orders.status, "pending")),
  ]);

  return {
    unreadCount: unread[0]?.count ?? 0,
    pendingCount: pending[0]?.count ?? 0,
  };
}

// Marks every not-yet-viewed order as viewed (fired when the admin opens the
// orders list page), so the sidebar "new orders" badge clears.
export async function markAllOrdersViewed(): Promise<void> {
  await db
    .update(orders)
    .set({ adminViewedAt: new Date() })
    .where(isNull(orders.adminViewedAt));
}

// Marks a single order as viewed (fired when the admin opens its detail page).
export async function markOrderViewed(orderId: number): Promise<void> {
  await db
    .update(orders)
    .set({ adminViewedAt: new Date() })
    .where(and(eq(orders.id, orderId), isNull(orders.adminViewedAt)));
}

// Items for a set of order ids in a single query - used by the admin orders
// list's expandable rows so every detail is visible without a query per order.
export async function getOrderItemsByOrderIds(orderIds: number[]) {
  if (orderIds.length === 0) return [];
  return db.select().from(orderItems).where(inArray(orderItems.orderId, orderIds));
}

export async function getOrderWithItems(id: number) {
  const [order] = await db.select().from(orders).where(eq(orders.id, id));
  if (!order) return null;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
  return { order: { ...order, due: getOrderDue(order) }, items };
}

export async function getOrderByNumber(orderNumber: string) {
  const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber));
  if (!order) return null;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  return { order: { ...order, due: getOrderDue(order) }, items };
}

// Orders belonging to a logged-in customer, newest first, with their items.
export async function getOrdersByUser(userId: string) {
  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));

  if (rows.length === 0) return [];

  const items = await db
    .select()
    .from(orderItems)
    .where(inArray(orderItems.orderId, rows.map((r) => r.id)));

  return rows.map((o) => ({
    order: { ...o, due: getOrderDue(o) },
    items: items.filter((i) => i.orderId === o.id),
  }));
}

export async function getDashboardStats() {
  // Run all count/aggregate queries in parallel to cut down round-trips, and
  // fetch only the columns needed to compute the due count in JS (keeps the
  // smart due rules consistent without loading entire order rows).
  const [productCount, orderCount, pendingCount, revenue, unreadMessages, activeOrders] =
    await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(products),
      db.select({ count: sql<number>`count(*)::int` }).from(orders),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(orders)
        .where(eq(orders.status, "pending")),
      db
        .select({ total: sql<string>`coalesce(sum(${orders.total}), 0)` })
        .from(orders)
        .where(sql`${orders.status} <> 'cancelled'`),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(contactMessages)
        .where(eq(contactMessages.isRead, false)),
      db
        .select({
          id: orders.id,
          isDue: orders.isDue,
          status: orders.status,
          paymentMethod: orders.paymentMethod,
          expectedDeliveryAt: orders.expectedDeliveryAt,
        })
        .from(orders)
        .where(sql`${orders.status} not in ('delivered', 'cancelled')`),
    ]);

  const dueCount = activeOrders.filter((o) => getOrderDue(o).isDue).length;

  return {
    productCount: productCount[0]?.count ?? 0,
    orderCount: orderCount[0]?.count ?? 0,
    pendingCount: pendingCount[0]?.count ?? 0,
    dueCount,
    revenue: revenue[0]?.total ?? "0",
    unreadMessages: unreadMessages[0]?.count ?? 0,
  };
}

export async function getContactMessagesAdmin() {
  return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
}

// ---------- Customers (admin) ----------
// One row per registered customer (orders linked to a Supabase account), with
// their latest name/phone/email, order count, total spent and first/last
// order dates. Email is captured automatically from the customer's account at
// order time (and backfilled by migration 0004).
export type CustomerSummary = {
  userId: string;
  customerName: string;
  phone: string;
  customerEmail: string | null;
  orderCount: number;
  totalSpent: string;
  lastOrderAt: Date;
  firstOrderAt: Date;
};

export async function getCustomersAdmin(): Promise<CustomerSummary[]> {
  const rows = await db
    .select({
      userId: orders.userId,
      customerName: sql<string>`(array_agg(${orders.customerName} order by ${orders.createdAt} desc))[1]`,
      phone: sql<string>`(array_agg(${orders.phone} order by ${orders.createdAt} desc))[1]`,
      // Pick the newest non-null email (nulls sort last, newest first).
      customerEmail: sql<string | null>`(array_agg(${orders.customerEmail} order by (${orders.customerEmail} is null), ${orders.createdAt} desc))[1]`,
      orderCount: sql<number>`count(*)::int`,
      totalSpent: sql<string>`coalesce(sum(${orders.total}), 0)`,
      lastOrderAt: sql<Date>`max(${orders.createdAt})`,
      firstOrderAt: sql<Date>`min(${orders.createdAt})`,
    })
    .from(orders)
    .where(sql`${orders.userId} is not null`)
    .groupBy(orders.userId)
    .orderBy(sql`max(${orders.createdAt}) desc`);

  // The WHERE clause guarantees non-null user ids; narrow the type for callers.
  return rows.map((row) => ({ ...row, userId: row.userId as string }));
}
