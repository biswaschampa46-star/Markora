import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orderItems, orders, products } from "@/db/schema";
import { eq, inArray, sql } from "drizzle-orm";
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

async function insertOrderWithUniqueNumber(
  userId: string | null,
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
) {
  // Order numbers are date + random digits - retry a few times on the rare
  // unique-constraint collision instead of failing the whole order.
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const [order] = await db
        .insert(orders)
        .values({
          orderNumber: generateOrderNumber(),
          status: "pending",
          userId,
          isDue: false,
          ...orderData,
        })
        .returning();
      return order;
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
    // Link the order to the logged-in customer when there is one (read from the
    // session cookie server-side so it can't be spoofed by the client).
    const user = await getUser();

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

    const productIds: number[] = items.map((i: { productId: number }) => i.productId);
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

    for (const item of items as { productId: number; quantity: number }[]) {
      const product = dbProducts.find((p) => p.id === item.productId);
      if (!product) continue;
      const quantity = Math.max(1, Math.min(Number(item.quantity) || 1, product.stock || 99));
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

    const order = await insertOrderWithUniqueNumber(user?.id ?? null, {
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
    });

    await db.insert(orderItems).values(
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
      await db
        .update(products)
        .set({ stock: sql`greatest(${products.stock} - ${item.quantity}, 0)` })
        .where(eq(products.id, item.productId));
    }

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
    console.error(error);
    return NextResponse.json(
      { error: "অর্ডার সম্পন্ন করা যায়নি, আবার চেষ্টা করুন।" },
      { status: 500 },
    );
  }
}
