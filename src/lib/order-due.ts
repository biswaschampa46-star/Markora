export type DueOrderInfo = {
  status: string;
  paymentMethod: string;
  expectedDeliveryAt: Date | string | null;
  isDue: boolean;
};

export type OrderDue = {
  isDue: boolean;
  reason: "payment" | "delivery" | "manual" | null;
};

// An order is "due" when the admin flagged it manually, the payment is still
// waiting to be verified (bKash/Nagad), or it passed its admin-set delivery date.
export function getOrderDue(order: DueOrderInfo): OrderDue {
  if (order.status === "delivered" || order.status === "cancelled") {
    return { isDue: false, reason: null };
  }

  if (order.isDue) {
    return { isDue: true, reason: "manual" };
  }

  if (order.status === "pending" && order.paymentMethod !== "cash_on_delivery") {
    return { isDue: true, reason: "payment" };
  }

  if (order.expectedDeliveryAt && new Date(order.expectedDeliveryAt).getTime() < Date.now()) {
    return { isDue: true, reason: "delivery" };
  }

  return { isDue: false, reason: null };
}

export const DUE_REASON_LABELS: Record<NonNullable<OrderDue["reason"]>, string> = {
  payment: "পেমেন্ট যাচাই বাকি",
  delivery: "নির্ধারিত ডেলিভারির সময় পেরিয়ে গেছে",
  manual: "ম্যানুয়ালি ডিউ চিহ্নিত",
};
