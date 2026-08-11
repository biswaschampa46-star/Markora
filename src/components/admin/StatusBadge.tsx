import { AlertTriangle } from "lucide-react";
import { ORDER_STATUS_LABELS } from "@/lib/format";
import { DUE_REASON_LABELS } from "@/lib/order-due";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-blue-50 text-blue-700",
  processing: "bg-indigo-50 text-indigo-700",
  shipped: "bg-teal-50 text-teal-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
        STATUS_STYLES[status] ?? "bg-cream-100 text-ink-700"
      }`}
    >
      {ORDER_STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function DueBadge({ reason = null }: { reason?: string | null }) {
  return (
    <span
      title={reason ? DUE_REASON_LABELS[reason as keyof typeof DUE_REASON_LABELS] ?? reason : "ডিউ"}
      className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700"
    >
      <AlertTriangle className="h-3 w-3" />
      ডিউ
    </span>
  );
}
