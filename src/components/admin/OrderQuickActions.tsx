"use client";

import { useState } from "react";
import { CheckCircle2, Truck } from "lucide-react";
import { confirmOrderWithDelivery, deliverOrder } from "@/app/admin/(dashboard)/actions";
import { formatBanglaDate, toDatetimeLocalInput } from "@/lib/format";

type QuickActionOrder = {
  id: number;
  status: string;
  deliveredAt: Date | string | null;
};

export function OrderQuickActions({ order }: { order: QuickActionOrder }) {
  const [open, setOpen] = useState<"confirm" | "deliver" | null>(null);
  const { status, deliveredAt } = order;

  if (status === "cancelled") {
    return <span className="text-xs text-ink-400">—</span>;
  }

  if (status === "delivered") {
    return (
      <div className="flex flex-col items-start gap-0.5">
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          সম্পন্ন
        </span>
        {deliveredAt && (
          <span className="text-[11px] leading-tight text-ink-500">
            {formatBanglaDate(deliveredAt)}
          </span>
        )}
      </div>
    );
  }

  const isPending = status === "pending";
  const confirmAction = (formData: FormData) => {
    void confirmOrderWithDelivery(order.id, formData);
  };
  const deliverAction = (formData: FormData) => {
    void deliverOrder(order.id, formData);
  };

  return (
    <div className="flex min-w-[170px] flex-col items-start gap-1.5">
      {isPending && (
        <button
          type="button"
          onClick={() => setOpen(open === "confirm" ? null : "confirm")}
          className="inline-flex items-center gap-1 rounded-md bg-brand-500 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-brand-600"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          নিশ্চিত করুন
        </button>
      )}
      <button
        type="button"
        onClick={() => setOpen(open === "deliver" ? null : "deliver")}
        className="inline-flex items-center gap-1 rounded-md bg-teal-600 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-teal-700"
      >
        <Truck className="h-3.5 w-3.5" />
        ডেলিভারি করুন
      </button>

      {open === "confirm" && isPending && (
        <form
          action={confirmAction}
          className="flex w-52 flex-col gap-1.5 rounded-lg border border-brand-200 bg-brand-50 p-2"
        >
          <label className="flex flex-col gap-0.5 text-[11px] font-medium text-ink-700">
            ডেলিভারি দিন (আজ থেকে)
            <input
              type="number"
              name="deliveryDays"
              min={1}
              max={60}
              required
              defaultValue={3}
              className="input !px-2 !py-1 !text-xs"
            />
          </label>
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-1 rounded-md bg-brand-500 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-600"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            নিশ্চিত করুন ও সময় সেট করুন
          </button>
        </form>
      )}

      {open === "deliver" && (
        <form
          action={deliverAction}
          className="flex w-52 flex-col gap-1.5 rounded-lg border border-teal-200 bg-teal-50 p-2"
        >
          <label className="flex flex-col gap-0.5 text-[11px] font-medium text-ink-700">
            ডেলিভারির তারিখ ও সময়
            <input
              type="datetime-local"
              name="deliveredAt"
              defaultValue={toDatetimeLocalInput(new Date())}
              className="input !px-2 !py-1 !text-xs"
            />
          </label>
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-1 rounded-md bg-teal-600 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-teal-700"
          >
            <Truck className="h-3.5 w-3.5" />
            ডেলিভারি সম্পন্ন করুন
          </button>
        </form>
      )}

      {open && (
        <button
          type="button"
          onClick={() => setOpen(null)}
          className="text-[11px] font-medium text-ink-500 transition hover:text-ink-700"
        >
          বাতিল করুন
        </button>
      )}
    </div>
  );
}
