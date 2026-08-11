import { Fragment } from "react";
import { BadgeCheck, Check, CheckCircle2, Truck, Wallet, XCircle } from "lucide-react";

type TimelineOrder = {
  status: string;
  paymentMethod: string;
  transactionId: string | null;
};

type Step = {
  key: string;
  label: string;
  icon: typeof Wallet;
  done: boolean;
};

export function OrderTimeline({ order }: { order: TimelineOrder }) {
  const { status } = order;
  const cancelled = status === "cancelled";

  const paymentDone =
    order.paymentMethod === "cash_on_delivery" ||
    status !== "pending" ||
    !!order.transactionId;
  const confirmedDone = ["confirmed", "processing", "shipped", "delivered"].includes(status);
  const shippedDone = ["shipped", "delivered"].includes(status);
  const deliveredDone = status === "delivered";

  const steps: Step[] = [
    { key: "payment", label: "পেমেন্ট", icon: Wallet, done: paymentDone },
    { key: "confirmed", label: "নিশ্চিত", icon: BadgeCheck, done: confirmedDone },
    { key: "shipped", label: "ডেলিভারির পথে", icon: Truck, done: shippedDone },
    { key: "delivered", label: "সম্পন্ন", icon: CheckCircle2, done: deliveredDone },
  ];

  const activeIndex = steps.findIndex((s) => !s.done);
  const doneCount = steps.filter((s) => s.done).length;
  const progress = cancelled ? 0 : (doneCount / steps.length) * 100;

  return (
    <div>
      {cancelled && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm font-semibold text-red-700">
          <XCircle className="h-4 w-4 shrink-0" />
          অর্ডারটি বাতিল করা হয়েছে
        </div>
      )}

      <div className="flex items-start">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const isActive = !cancelled && i === activeIndex;
          const isDone = !cancelled && step.done;
          const lineDone = !cancelled && i > 0 && steps[i - 1].done;
          return (
            <Fragment key={step.key}>
              {i > 0 && (
                <div
                  className={`h-0.5 flex-1 rounded-full transition-colors duration-500 ${
                    lineDone ? "bg-teal-500" : cancelled ? "bg-red-200" : "bg-cream-300"
                  }`}
                  style={{ marginTop: "1.25rem" }}
                />
              )}
              <div className="flex flex-col items-center gap-1.5">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                    isDone
                      ? "scale-105 border-teal-500 bg-teal-500 text-white shadow-md shadow-teal-500/25"
                      : isActive
                        ? "border-brand-500 bg-brand-50 text-brand-600 ring-4 ring-brand-500/15"
                        : cancelled
                          ? "border-red-200 bg-red-50 text-red-400"
                          : "border-cream-300 bg-white text-ink-300"
                  }`}
                >
                  {isDone ? (
                    <Check className="h-5 w-5" strokeWidth={3} />
                  ) : (
                    <Icon
                      className={`h-5 w-5 ${isActive ? "animate-pulse" : ""}`}
                      strokeWidth={1.8}
                    />
                  )}
                </span>
                <span
                  className={`max-w-16 text-center text-[11px] font-medium leading-tight ${
                    isDone
                      ? "text-teal-700"
                      : isActive
                        ? "text-brand-600"
                        : cancelled
                          ? "text-red-400"
                          : "text-ink-500"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            </Fragment>
          );
        })}
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-cream-200">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            cancelled ? "bg-red-300" : "bg-gradient-to-r from-brand-500 to-teal-500"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
