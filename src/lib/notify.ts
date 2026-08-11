import { formatTaka, PAYMENT_METHOD_LABELS } from "@/lib/format";

type NotifyItem = { productName: string; quantity: number; lineTotal: string };

type NewOrderInfo = {
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  paymentMethod: string;
  total: string;
  items: NotifyItem[];
};

/**
 * Notifies the store admin about a new order using the Resend REST API.
 * Env-guarded: when RESEND_API_KEY or ADMIN_NOTIFY_EMAIL is missing the call
 * is skipped so the store keeps working without email configured.
 */
export async function sendNewOrderAdminNotification(order: NewOrderInfo): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ADMIN_NOTIFY_EMAIL;

  if (!apiKey || !to) {
    console.info("[notify] Email not configured - skipping new order notification.");
    return;
  }

  const from = process.env.NOTIFY_EMAIL_FROM || "Markora <onboarding@resend.dev>";
  const itemLines = order.items
    .map((item) => `- ${item.productName} x ${item.quantity} = ${formatTaka(item.lineTotal)}`)
    .join("\n");

  const text = [
    "নতুন অর্ডার এসেছে!",
    "",
    `অর্ডার নম্বর: ${order.orderNumber}`,
    `গ্রাহক: ${order.customerName}`,
    `ফোন: ${order.phone}`,
    `ঠিকানা: ${order.address}, ${order.city}`,
    `পেমেন্ট: ${PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}`,
    `সর্বমোট: ${formatTaka(order.total)}`,
    "",
    "পণ্যসমূহ:",
    itemLines,
  ].join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `নতুন অর্ডার: ${order.orderNumber}`,
        text,
      }),
    });

    if (!res.ok) {
      console.error(`[notify] Resend error ${res.status}:`, await res.text());
    }
  } catch (error) {
    console.error("[notify] Failed to send notification:", error);
  }
}
