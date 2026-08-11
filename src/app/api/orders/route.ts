import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orderItems, orders, products } from "@/db/schema";
import { and, eq, inArray, sql } from "drizzle-orm";
import { generateOrderNumber } from "@/lib/order-number";
import { sendNewOrderAdminNotification } from "@/lib/notify";
import { getUser } from "@/lib/supabase/server";

const DHAKA_KEYWORDS = ["ঢাকা", "dhaka"];
const PAYMENT_METHODS = ["cash_on_delivery", "bkash", "nagad"];

function calculateDeliveryFee(city: string) {
  const normalized = city.trim().toLowerCase();
  const isDhaka = DHAKA_KEYWORDS.some((k) => normalized.includes(k.toLowerCase()));
  return isDhaka ? 70 : 130;
}

// Runs the whole order (order row + items + stock decrement) inside a single
// DB transaction so a failure anywhere rolls everything back. The stock
// decrement is conditional (stock >= quantity) so concurrent orders can never
// oversell the last unit.
async function placeOrder(
  userId: string,
  customerEmail: string | null,
  orderData: {
    customerName: string;
    phone: string;
    altPhone: string | null;
    address: string;
    city: string;
    area: string | null;
    note: string | null;
    paymentMethod: string;
    transactionId: string | null;
    subtotal: string;
    deliveryFee: string;
    total: string;
  },
  lineItems: {
    productId: number;
    productName: string;
    productImage: string;
    price: number;
    quantity: number;
    lineTotal: number;
  }[],
) {
  // Order numbers are date + random digits - retry a few times on the rare
  // unique-constraint collision instead of failing the whole order.
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await db.transaction(async (tx) => {
        const [order] = await tx
          .insert(orders)
          .values({
            orderNumber: generateOrderNumber(),
            status: "pending",
            userId,
            customerEmail,
            isDue: false,
            ...orderData,
          })
          .returning();

        if (lineItems.length > 0) {
          await tx.insert(orderItems).values(
            lineItems.map((item) => ({
              orderId: order.id,
              productId: item.productId,
              productName: item.productName,
              productImage: item.productImage,
              price: item.price.toFixed(2),
              quantity: item.quantity,
              lineTotal: item.lineTotal.toFixed(2),
            })),
          );

          for (const item of lineItems) {
            // Only decrement when enough stock is left; otherwise abort the
            // whole order (the transaction rolls back).
            const updated = await tx
              .update(products)
              .set({ stock: sql`${products.stock} - ${item.quantity}` })
              .where(and(eq(products.id, item.productId), sql`${products.stock} >= ${item.quantity}`))
              .returning({ id: products.id });

            if (updated.length === 0) {
              throw new Error(`stock_insufficient:${item.productId}`);
            }
          }
        }

        return order;
      });
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code === "23505") continue; // unique_violation - retry with a new number
      throw error;
    }
  }
  throw new Error("অর্ডার নম্বর তৈরি করা যায়নি, আবার চেষ্টা করুন।");
}

export async function POST(request: NextRequest) {
  try {
    // Every order must belong to a logged-in account. The session is read from
    // the cookie server-side so it can't be spoofed by the client, and the
    // order is linked to that user below.
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { error: "অর্ডার করতে লগইন করতে হবে।" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const {
      customerName,
      phone,
      altPhone,
      address,
      city,
      area,
      note,
      paymentMethod,
      transactionId,
      items,
    } = body ?? {};

    if (!customerName || !phone || !address || !city) {
      return NextResponse.json(
        { error: "নাম, ফোন নম্বর, ঠিকানা এবং শহর অবশ্যই দিতে হবে।" },
        { status: 400 },
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "কার্ট খালি রয়েছে।" }, { status: 400 });
    }

    const method = PAYMENT_METHODS.includes(paymentMethod)
      ? paymentMethod
      : "cash_on_delivery";

    const trxId = method === "cash_on_delivery" ? null : String(transactionId || "").trim();

    if (method !== "cash_on_delivery" && !trxId) {
      return NextResponse.json(
        { error: "বিকাশ/নগদ পেমেন্টের জন্য ট্রানজেকশন আইডি (TrxID) দিতে হবে।" },
        { status: 400 },
      );
    }

    // Guard against malformed payloads: keep only well-formed numeric ids so
    // a broken/malicious client can't crash the query with null/undefined entries.
    const productIds: number[] = items
      .map((i) =>
        i && typeof i === "object" ? Number((i as { productId?: unknown }).productId) : NaN,
      )
      .filter((n) => Number.isInteger(n) && n > 0);

    if (productIds.length === 0) {
      return NextResponse.json({ error: "বৈধ কোনো পণ্য পাওয়া যায়নি।" }, { status: 400 });
    }

    const dbProducts = await db
      .select()
      .from(products)
      .where(inArray(products.id, productIds));

    if (dbProducts.length === 0) {
      return NextResponse.json({ error: "পণ্য খুঁজে পাওয়া যায়নি।" }, { status: 400 });
    }

    let subtotal = 0;
    const lineItems: {
      productId: number;
      productName: string;
      productImage: string;
      price: number;
      quantity: number;
      lineTotal: number;
    }[] = [];

    for (const raw of items as unknown[]) {
      // Skip junk entries (null, strings, etc.) instead of crashing.
      if (!raw || typeof raw !== "object") continue;
      const item = raw as { productId?: unknown; quantity?: unknown };
      const product = dbProducts.find((p) => p.id === Number(item.productId));
      if (!product) continue;
      // Only whole quantities make sense - drop malformed line items.
      const rawQuantity = Number(item.quantity);
      if (!Number.isInteger(rawQuantity) || rawQuantity < 1) continue;
      const quantity = Math.min(rawQuantity, product.stock ?? 99);
      if (quantity < 1) continue; // out of stock
      const price = Number(product.price);
      const lineTotal = price * quantity;
      subtotal += lineTotal;
      lineItems.push({
        productId: product.id,
        productName: product.name,
        productImage: product.imageUrl,
        price,
        quantity,
        lineTotal,
      });
    }

    if (lineItems.length === 0) {
      return NextResponse.json({ error: "বৈধ কোনো পণ্য পাওয়া যায়নি।" }, { status: 400 });
    }

    const deliveryFee = calculateDeliveryFee(city);
    const total = subtotal + deliveryFee;

    // The customer's email comes from their logged-in account automatically -
    // it is never collected in a form.
    const order = await placeOrder(
      user.id,
      user.email ?? null,
      {
        customerName,
        phone,
        altPhone: altPhone || null,
        address,
        city,
        area: area || null,
        note: note || null,
        paymentMethod: method,
        transactionId: trxId,
        subtotal: subtotal.toFixed(2),
        deliveryFee: deliveryFee.toFixed(2),
        total: total.toFixed(2),
      },
      lineItems,
    );

    // Fire the admin notification - failures inside are swallowed, never block the response.
    void sendNewOrderAdminNotification({
      orderNumber: order.orderNumber,
      customerName,
      phone,
      address,
      city,
      paymentMethod: method,
      total: order.total,
      items: lineItems.map((i) => ({
        productName: i.productName,
        quantity: i.quantity,
        lineTotal: i.lineTotal.toFixed(2),
      })),
    });

    return NextResponse.json({ orderNumber: order.orderNumber });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.startsWith("stock_insufficient")) {
      return NextResponse.json(
        { error: "পণ্যের স্টক অপর্যাপ্ত — কিছু পণ্য বিক্রি হয়ে গেছে, কার্ট আপডেট করুন।" },
        { status: 409 },
      );
    }
    console.error(error);
    return NextResponse.json(
      { error: "অর্ডার সম্পন্ন করা যায়নি, আবার চেষ্টা করুন।" },
      { status: 500 },
    );
  }
}
