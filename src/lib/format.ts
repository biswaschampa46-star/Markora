const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export function toBanglaDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => bnDigits[Number(d)]);
}

export function formatTaka(amount: string | number): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  const rounded = Number.isFinite(value) ? value : 0;
  const formatted = rounded.toLocaleString("en-US", {
    minimumFractionDigits: rounded % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `৳${toBanglaDigits(formatted)}`;
}

export function formatBanglaDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const months = [
    "জানুয়ারি",
    "ফেব্রুয়ারি",
    "মার্চ",
    "এপ্রিল",
    "মে",
    "জুন",
    "জুলাই",
    "আগস্ট",
    "সেপ্টেম্বর",
    "অক্টোবর",
    "নভেম্বর",
    "ডিসেম্বর",
  ];
  const day = toBanglaDigits(d.getDate());
  const month = months[d.getMonth()];
  const year = toBanglaDigits(d.getFullYear());
  const hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${day} ${month} ${year}, ${toBanglaDigits(hour12)}:${toBanglaDigits(minutes)} ${period}`;
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "অপেক্ষমান",
  confirmed: "নিশ্চিত হয়েছে",
  processing: "প্রক্রিয়াধীন",
  shipped: "পাঠানো হয়েছে",
  delivered: "ডেলিভারি সম্পন্ন",
  cancelled: "বাতিল হয়েছে",
};

export const ORDER_STATUS_ORDER = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash_on_delivery: "ক্যাশ অন ডেলিভারি",
  bkash: "বিকাশ",
  nagad: "নগদ",
};

// Delivery date is set manually by the admin when confirming the order.
export function getExpectedDelivery(order: {
  expectedDeliveryAt: Date | string | null;
}): Date | null {
  if (!order.expectedDeliveryAt) return null;
  return new Date(order.expectedDeliveryAt);
}

// Value for <input type="datetime-local"> in local time: "YYYY-MM-DDTHH:mm".
export function toDatetimeLocalInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatExpectedDelivery(expected: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = new Date(expected.getFullYear(), expected.getMonth(), expected.getDate());
  const diffDays = Math.round((day.getTime() - today.getTime()) / 86400000);
  if (diffDays === 0) return "আজ";
  if (diffDays === 1) return "আগামীকাল";
  if (diffDays > 1) return `${toBanglaDigits(diffDays)} দিন পর`;
  return "সময় পেরিয়ে গেছে";
}
