import Link from "next/link";
import { getAllOrdersAdmin, getOrderItemsByOrderIds } from "@/lib/queries";
import { ORDER_STATUS_LABELS, ORDER_STATUS_ORDER } from "@/lib/format";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { MarkOrdersViewed } from "@/components/admin/MarkOrdersViewed";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeStatus = status && status !== "all" ? status : "all";
  const orders = await getAllOrdersAdmin(status);
  const items = await getOrderItemsByOrderIds(orders.map((o) => o.id));

  // Group items by order id so the expandable rows can show what was ordered
  // without running a query per order.
  const itemsByOrder = items.reduce<Record<number, (typeof items)[number][]>>((acc, item) => {
    (acc[item.orderId] ??= []).push(item);
    return acc;
  }, {});

  const tabs = [
    { key: "all", label: "সব" },
    { key: "due", label: "ডিউ ⚠" },
    ...ORDER_STATUS_ORDER.map((key) => ({ key, label: ORDER_STATUS_LABELS[key] })),
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Marks all orders as viewed the moment this page opens (clears the badge). */}
      <MarkOrdersViewed />
      <div>
        <h1 className="text-xl font-bold text-ink-900">অর্ডার সমূহ</h1>
        <p className="text-sm text-ink-500">
          সব অর্ডার পরিচালনা করুন — যেকোনো অর্ডারে ক্লিক করে গ্রাহকের সম্পূর্ণ তথ্য দেখুন
        </p>
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
        <OrdersTable orders={orders} itemsByOrder={itemsByOrder} />
      )}
    </div>
  );
}
