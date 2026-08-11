import Link from "next/link";
import { getAllOrdersAdmin } from "@/lib/queries";
import {
  formatTaka,
  formatBanglaDate,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_ORDER,
  PAYMENT_METHOD_LABELS,
} from "@/lib/format";
import { DueBadge, StatusBadge } from "@/components/admin/StatusBadge";
import { OrderQuickActions } from "@/components/admin/OrderQuickActions";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeStatus = status && status !== "all" ? status : "all";
  const orders = await getAllOrdersAdmin(status);

  const tabs = [
    { key: "all", label: "সব" },
    { key: "due", label: "ডিউ ⚠" },
    ...ORDER_STATUS_ORDER.map((key) => ({ key, label: ORDER_STATUS_LABELS[key] })),
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-ink-900">অর্ডার সমূহ</h1>
        <p className="text-sm text-ink-500">সব অর্ডার পরিচালনা করুন</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={tab.key === "all" ? "/admin/orders" : `/admin/orders?status=${tab.key}`}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
              activeStatus === tab.key
                ? "border-brand-500 bg-brand-500 text-white"
                : "border-cream-300 bg-white text-ink-700 hover:border-brand-400"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-cream-300 bg-white p-10 text-center text-sm text-ink-500">
          এই স্ট্যাটাসে কোনো অর্ডার নেই।
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-cream-300 bg-white">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead>
              <tr className="border-b border-cream-200 text-xs uppercase text-ink-500">
                <th className="px-4 py-3">অর্ডার নম্বর</th>
                <th className="px-4 py-3">গ্রাহক</th>
                <th className="px-4 py-3">ইমেইল</th>
                <th className="px-4 py-3">ফোন</th>
                <th className="px-4 py-3">পেমেন্ট</th>
                <th className="px-4 py-3">মোট</th>
                <th className="px-4 py-3">স্ট্যাটাস</th>
                <th className="px-4 py-3">তারিখ</th>
                <th className="px-4 py-3">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-cream-100 transition last:border-0 hover:bg-cream-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-semibold text-navy-800 transition hover:text-brand-600"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-900">{order.customerName}</td>
                  <td className="px-4 py-3 text-ink-700">{order.customerEmail ?? "—"}</td>
                  <td className="px-4 py-3 text-ink-700">{order.phone}</td>
                  <td className="px-4 py-3 text-ink-700">
                    {PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}
                  </td>
                  <td className="px-4 py-3 font-semibold text-navy-900">
                    {formatTaka(order.total)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <StatusBadge status={order.status} />
                      {order.due.isDue && <DueBadge reason={order.due.reason} />}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-500">
                    {formatBanglaDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <OrderQuickActions order={order} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
