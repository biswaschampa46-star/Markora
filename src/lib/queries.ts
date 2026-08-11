import { db } from "@/db";
import { categories, contactMessages, orderItems, orders, products } from "@/db/schema";
import { and, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { getOrderDue } from "@/lib/order-due";

export async function getCategories() {
  return db.select().from(categories).orderBy(categories.sortOrder);
}

export async function getCategoryBySlug(slug: string) {
  const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
  return category ?? null;
}

export async function getCategoryByIdAdmin(id: number) {
  const [category] = await db.select().from(categories).where(eq(categories.id, id));
  return category ?? null;
}

export async function getFeaturedProducts(limit = 8) {
  return db
    .select()
    .from(products)
    .where(and(eq(products.isActive, true), eq(products.isFeatured, true)))
    .orderBy(desc(products.createdAt))
    .limit(limit);
}

export async function getLatestProducts(limit = 12) {
  return db
    .select()
    .from(products)
    .where(eq(products.isActive, true))
    .orderBy(desc(products.createdAt))
    .limit(limit);
}

export async function getProductsByCategorySlug(slug: string) {
  const category = await getCategoryBySlug(slug);
  if (!category) return { category: null, items: [] };
  const items = await db
    .select()
    .from(products)
    .where(and(eq(products.categoryId, category.id), eq(products.isActive, true)))
    .orderBy(desc(products.createdAt));
  return { category, items };
}

export async function getProductBySlug(slug: string) {
  const [product] = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.isActive, true)));
  return product ?? null;
}

export async function searchProducts(query: string) {
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
}

export async function getProductsByIds(ids: number[]) {
  if (ids.length === 0) return [];
  return db
    .select()
    .from(products)
    .where(and(eq(products.isActive, true), inArray(products.id, ids)));
}

export async function getRelatedProducts(categoryId: number | null, excludeId: number, limit = 4) {
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
}

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

export async function getAllOrdersAdmin(status?: string) {
  const rows =
    status && status !== "all" && status !== "due"
      ? await db.select().from(orders).where(eq(orders.status, status)).orderBy(desc(orders.createdAt))
      : await db.select().from(orders).orderBy(desc(orders.createdAt));

  const withDue = rows.map((o) => ({ ...o, due: getOrderDue(o) }));
  return status === "due" ? withDue.filter((o) => o.due.isDue) : withDue;
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
  const [productCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(products);
  const [orderCount] = await db.select({ count: sql<number>`count(*)::int` }).from(orders);
  const [pendingCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(orders)
    .where(eq(orders.status, "pending"));
  const [revenue] = await db
    .select({ total: sql<string>`coalesce(sum(${orders.total}), 0)` })
    .from(orders)
    .where(sql`${orders.status} <> 'cancelled'`);
  const [unreadMessages] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(contactMessages)
    .where(eq(contactMessages.isRead, false));

  // Due count is computed in JS so it stays consistent with the smart due rules
  // used across the admin lists and the customer dashboard.
  const activeOrders = await db
    .select()
    .from(orders)
    .where(sql`${orders.status} not in ('delivered', 'cancelled')`);
  const dueCount = activeOrders.filter((o) => getOrderDue(o).isDue).length;

  return {
    productCount: productCount?.count ?? 0,
    orderCount: orderCount?.count ?? 0,
    pendingCount: pendingCount?.count ?? 0,
    dueCount,
    revenue: revenue?.total ?? "0",
    unreadMessages: unreadMessages?.count ?? 0,
  };
}

export async function getContactMessagesAdmin() {
  return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
}
