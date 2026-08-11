"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, contactMessages, orderItems, orders, products } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";
import { deleteProductImage, saveProductImage } from "@/lib/upload-image";
import { markAllOrdersViewed, markOrderViewed } from "@/lib/queries";
import { slugify } from "@/lib/slugify";
import { ORDER_STATUS_ORDER } from "@/lib/format";

export type ActionResult = { error: string } | undefined;

function readProductFields(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const price = String(formData.get("price") || "").trim();
  const oldPriceRaw = String(formData.get("oldPrice") || "").trim();
  const stock = String(formData.get("stock") || "0").trim();
  const categoryId = String(formData.get("categoryId") || "").trim();
  const isFeatured = formData.get("isFeatured") === "on";
  const isActive = formData.get("isActive") === "on";

  return {
    name,
    description,
    price,
    oldPrice: oldPriceRaw || null,
    stock: Number.parseInt(stock, 10) || 0,
    categoryId: categoryId ? Number.parseInt(categoryId, 10) : null,
    isFeatured,
    isActive,
  };
}

export async function createProduct(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const fields = readProductFields(formData);

  if (!fields.name || !fields.price) {
    return { error: "পণ্যের নাম এবং মূল্য অবশ্যই দিতে হবে।" };
  }

  const imageFile = formData.get("image") as File | null;
  let imageUrl = "";

  if (imageFile && imageFile.size > 0) {
    try {
      imageUrl = await saveProductImage(imageFile);
    } catch (error) {
      return { error: error instanceof Error ? error.message : "ছবি আপলোড ব্যর্থ হয়েছে।" };
    }
  }

  await db.insert(products).values({
    name: fields.name,
    slug: slugify(fields.name),
    description: fields.description,
    price: fields.price,
    oldPrice: fields.oldPrice,
    imageUrl,
    stock: fields.stock,
    categoryId: fields.categoryId,
    isFeatured: fields.isFeatured,
    isActive: fields.isActive,
  });

  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
  revalidateTag("products", "max");
  redirect("/admin/products");
}

export async function updateProduct(id: number, formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const fields = readProductFields(formData);

  if (!fields.name || !fields.price) {
    return { error: "পণ্যের নাম এবং মূল্য অবশ্যই দিতে হবে।" };
  }

  const [existing] = await db.select().from(products).where(eq(products.id, id));
  if (!existing) {
    return { error: "পণ্য খুঁজে পাওয়া যায়নি।" };
  }

  const imageFile = formData.get("image") as File | null;
  let imageUrl = existing.imageUrl;

  if (imageFile && imageFile.size > 0) {
    try {
      imageUrl = await saveProductImage(imageFile);
      await deleteProductImage(existing.imageUrl);
    } catch (error) {
      return { error: error instanceof Error ? error.message : "ছবি আপলোড ব্যর্থ হয়েছে।" };
    }
  }

  await db
    .update(products)
    .set({
      name: fields.name,
      description: fields.description,
      price: fields.price,
      oldPrice: fields.oldPrice,
      imageUrl,
      stock: fields.stock,
      categoryId: fields.categoryId,
      isFeatured: fields.isFeatured,
      isActive: fields.isActive,
      updatedAt: new Date(),
    })
    .where(eq(products.id, id));

  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
  revalidateTag("products", "max");
  redirect("/admin/products");
}

export async function deleteProduct(id: number): Promise<void> {
  await requireAdmin();

  const [existing] = await db.select().from(products).where(eq(products.id, id));
  if (existing) {
    await deleteProductImage(existing.imageUrl);
  }

  await db.delete(products).where(eq(products.id, id));

  // The admin product list refreshes client-side (router.refresh) after the
  // row's delete animation finishes — revalidating this route here would rip
  // the row away before the "deleted" state can be seen. The public
  // storefront still needs its caches refreshed immediately.
  revalidatePath("/", "layout");
  revalidateTag("products", "max");
}

// Marks the admin's new orders as viewed. Called the moment the orders list
// (orderId omitted) or a single order detail page (orderId set) opens, so the
// sidebar "new orders" badge clears. The client component dispatches an
// "orders:viewed" event afterwards so the badge refreshes immediately.
export async function markOrdersViewed(orderId?: number): Promise<void> {
  await requireAdmin();

  if (orderId) {
    await markOrderViewed(orderId);
  } else {
    await markAllOrdersViewed();
  }
}

export async function updateOrderStatus(orderId: number, formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const status = String(formData.get("status") || "");

  if (!ORDER_STATUS_ORDER.includes(status)) {
    return { error: "অবৈধ স্ট্যাটাস" };
  }

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
  if (!order) {
    return { error: "অর্ডার খুঁজে পাওয়া যায়নি।" };
  }

  await db
    .update(orders)
    .set({
      status,
      updatedAt: new Date(),
      // A finished order can never stay "due".
      ...(status === "delivered" || status === "cancelled" ? { isDue: false } : {}),
    })
    .where(eq(orders.id, orderId));

  // When an order is cancelled, return the ordered quantities to product stock.
  if (status === "cancelled" && order.status !== "cancelled") {
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
    for (const item of items) {
      if (!item.productId) continue;
      await db
        .update(products)
        .set({ stock: sql`${products.stock} + ${item.quantity}` })
        .where(eq(products.id, item.productId));
    }
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return undefined;
}

// Mark an order delivered and fix the actual delivery date in one step. The
// admin picks a date/time; it is stored as the order's real delivery date.
export async function deliverOrder(
  orderId: number,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
  if (!order) {
    return { error: "অর্ডার খুঁজে পাওয়া যায়নি।" };
  }

  if (order.status === "delivered" || order.status === "cancelled") {
    return { error: "সম্পন্ন বা বাতিল অর্ডার আবার ডেলিভারি করা যাবে না।" };
  }

  const deliveredRaw = String(formData.get("deliveredAt") || "").trim();
  const deliveredAt = deliveredRaw ? new Date(deliveredRaw) : new Date();
  if (Number.isNaN(deliveredAt.getTime())) {
    return { error: "ডেলিভারির তারিখ সঠিক নয়।" };
  }

  await db
    .update(orders)
    .set({ status: "delivered", isDue: false, deliveredAt, updatedAt: new Date() })
    .where(eq(orders.id, orderId));

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/account");
  return undefined;
}

// Confirm an order and set its delivery time in one step. The admin picks a
// number of days from today; the exact delivery date/time is computed from it.
export async function confirmOrderWithDelivery(
  orderId: number,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
  if (!order) {
    return { error: "অর্ডার খুঁজে পাওয়া যায়নি।" };
  }

  if (order.status === "delivered" || order.status === "cancelled") {
    return { error: "সম্পন্ন বা বাতিল অর্ডারের ডেলিভারি সময় পরিবর্তন করা যাবে না।" };
  }

  const daysRaw = String(formData.get("deliveryDays") || "").trim();
  const days = Number.parseInt(daysRaw, 10);
  if (!Number.isInteger(days) || days < 1 || days > 60) {
    return { error: "ডেলিভারি দিন ১ থেকে ৬০ এর মধ্যে হতে হবে।" };
  }

  const expectedDeliveryAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  await db
    .update(orders)
    .set({
      // Setting the delivery time confirms the order in the same step.
      status: order.status === "pending" ? "confirmed" : order.status,
      expectedDeliveryAt,
      isDue: false,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId));

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/account");
  return undefined;
}

export async function toggleOrderDue(orderId: number): Promise<ActionResult> {
  await requireAdmin();

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
  if (!order) {
    return { error: "অর্ডার খুঁজে পাওয়া যায়নি।" };
  }

  if (order.status === "delivered" || order.status === "cancelled") {
    return { error: "সম্পন্ন বা বাতিল অর্ডার ডিউ চিহ্নিত করা যাবে না।" };
  }

  await db
    .update(orders)
    .set({ isDue: !order.isDue, updatedAt: new Date() })
    .where(eq(orders.id, orderId));

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return undefined;
}

// ---------- Categories ----------

export async function createCategory(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const nameBn = String(formData.get("nameBn") || "").trim();
  const icon = String(formData.get("icon") || "layout-grid").trim();
  const sortOrder = Number.parseInt(String(formData.get("sortOrder") || "0"), 10) || 0;

  if (!nameBn) {
    return { error: "ক্যাটাগরির নাম দিতে হবে।" };
  }

  await db.insert(categories).values({ nameBn, slug: slugify(nameBn), icon, sortOrder });

  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
  revalidateTag("categories", "max");
  revalidateTag("products", "max");
  redirect("/admin/categories");
}

export async function updateCategory(id: number, formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const nameBn = String(formData.get("nameBn") || "").trim();
  const slug = String(formData.get("slug") || "").trim();
  const icon = String(formData.get("icon") || "layout-grid").trim();
  const sortOrder = Number.parseInt(String(formData.get("sortOrder") || "0"), 10) || 0;

  if (!nameBn) {
    return { error: "ক্যাটাগরির নাম দিতে হবে।" };
  }

  const [existing] = await db.select().from(categories).where(eq(categories.id, id));
  if (!existing) {
    return { error: "ক্যাটাগরি খুঁজে পাওয়া যায়নি।" };
  }

  try {
    await db
      .update(categories)
      .set({ nameBn, slug: slug || existing.slug, icon, sortOrder })
      .where(eq(categories.id, id));
  } catch (error) {
    if ((error as { code?: string }).code === "23505") {
      return { error: "এই স্লাগটি ইতিমধ্যে ব্যবহৃত হচ্ছে, ভিন্ন স্লাগ দিন।" };
    }
    throw error;
  }

  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
  revalidateTag("categories", "max");
  revalidateTag("products", "max");
  redirect("/admin/categories");
}

export async function deleteCategory(id: number): Promise<void> {
  await requireAdmin();
  await db.delete(categories).where(eq(categories.id, id));

  // Same as deleteProduct: the admin list refreshes via router.refresh after
  // the delete animation; only the public storefront revalidates here.
  revalidatePath("/", "layout");
  revalidateTag("categories", "max");
  revalidateTag("products", "max");
}

export async function markMessageRead(id: number): Promise<void> {
  await requireAdmin();
  await db.update(contactMessages).set({ isRead: true }).where(eq(contactMessages.id, id));
  revalidatePath("/admin/messages");
}

export async function deleteMessage(id: number): Promise<void> {
  await requireAdmin();
  await db.delete(contactMessages).where(eq(contactMessages.id, id));
  // The admin list refreshes client-side (router.refresh) after the delete
  // animation finishes; nothing public references contact messages.
}
