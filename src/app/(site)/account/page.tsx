import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlarmClockOff,
  BadgeCheck,
  MapPin,
  PackageOpen,
  Phone,
  ShoppingBag,
  Truck,
  Wallet,
} from "lucide-react";
import { getUser } from "@/lib/supabase/server";
import { getOrdersByUser } from "@/lib/queries";
import { getUserDisplayName, getUserInitial } from "@/lib/user-display";
import {
  formatBanglaDate,
  formatExpectedDelivery,
  formatTaka,
  getExpectedDelivery,
  toBanglaDigits,
  PAYMENT_METHOD_LABELS,
} from "@/lib/format";
import { DUE_REASON_LABELS } from "@/lib/order-due";
import { OrderTimeline } from "@/components/site/OrderTimeline";
import { DueBadge } from "@/components/admin/StatusBadge";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login?next=/account");
  }

  const orders = await getOrdersByUser(user.id);
  const name = getUserDisplayName(user);
  const initial = getUserInitial(user);

  const activeCount = orders.filter(
    ({ order }) => order.status !== "delivered" && order.status !== "cancelled",
  ).length;
  const deliveredCount = orders.filter(({ order }) => order.status === "delivered").length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Profile header */}
      <div className="rise-item rounded-xl border border-cream-300 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xl font-bold text-white shadow-lg shadow-brand-500/25">
            {initial}
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-ink-900">{name}</h1>
            <p className="truncate text-sm text-ink-500">{user.email}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-cream-200 pt-4">
          <MiniStat icon={ShoppingBag} label="মোট অর্ডার" value={orders.length} />
          <MiniStat icon={Truck} label="চলমান" value={activeCount} />
          <MiniStat icon={BadgeCheck} label="ডেলিভারি সম্পন্ন" value={deliveredCount} />
        </div>
      </div>

      {/* Orders */}
      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-bold text-ink-900">আমার অর্ডার সমূহ</h2>
        <span className="text-sm text-ink-500">{orders.length} টি অর্ডার</span>
      </div>

      {orders.length === 0 ? (
        <div className="mt-4 rounded-xl border border-cream-300 bg-white p-10 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cream-100 text-ink-300">
            <PackageOpen className="h-7 w-7" strokeWidth={1.6} />
          </span>
          <p className="mt-3 text-sm text-ink-700">এখনো কোনো অর্ডার করেননি।</p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
          >
            কেনাকাটা শুরু করুন
          </Link>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-5">
          {orders.map(({ order, items }, idx) => {
            const due = order.due;
            const expected = getExpectedDelivery(order);
            const isDone = order.status === "delivered";
            const isCancelled = order.status === "cancelled";

            return (
              <article
                key={order.id}
                className="rise-item rounded-xl border border-cream-300 bg-white p-5 shadow-sm"
                style={{ "--d": `${idx * 80}ms` } as React.CSSProperties}
              >
                {/* Order header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cream-200 pb-4">
                  <div>
                    <p className="text-sm font-bold text-navy-900">{order.orderNumber}</p>
                    <p className="mt-0.5 text-xs text-ink-500">{formatBanglaDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full bg-cream-100 px-2.5 py-1 text-xs font-semibold text-ink-700">
                      {PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}
                    </span>
                    {due.isDue && <DueBadge reason={due.reason} />}
                  </div>
                </div>

                {/* Live status timeline */}
                <div className="py-5">
                  <OrderTimeline order={order} />
                </div>

                {due.isDue && (
                  <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">
                    <AlarmClockOff className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                      এই অর্ডারটি ডিউ —{" "}
                      {due.reason ? DUE_REASON_LABELS[due.reason] : "অনুগ্রহ করে আমাদের সাথে যোগাযোগ করুন"}
                    </span>
                  </div>
                )}

                {/* Delivery estimate */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-cream-200 bg-cream-50 px-3.5 py-3">
                    <p className="flex items-center gap-1.5 text-xs font-medium text-ink-500">
                      <Truck className="h-3.5 w-3.5" />
                      পণ্য পাবেন
                    </p>
                    <p
                      className={`mt-1 text-sm font-bold ${
                        isDone ? "text-teal-700" : isCancelled ? "text-red-500" : "text-navy-900"
                      }`}
                    >
                      {isDone
                        ? order.deliveredAt
                          ? `ডেলিভারি সম্পন্ন — ${formatBanglaDate(order.deliveredAt)}`
                          : "ডেলিভারি সম্পন্ন হয়েছে"
                        : isCancelled
                          ? "অর্ডার বাতিল হয়েছে"
                          : expected
                            ? `${formatExpectedDelivery(expected)} (${formatBanglaDate(expected)})`
                            : "নিশ্চিত হওয়ার পর জানানো হবে"}
                    </p>
                  </div>

                  <div className="rounded-lg border border-cream-200 bg-cream-50 px-3.5 py-3">
                    <p className="flex items-center gap-1.5 text-xs font-medium text-ink-500">
                      <Wallet className="h-3.5 w-3.5" />
                      পেমেন্ট
                    </p>
                    <p className="mt-1 text-sm font-bold text-navy-900">
                      {order.paymentMethod === "cash_on_delivery"
                        ? "ডেলিভারির সময় নগদ"
                        : order.status === "pending"
                          ? "যাচাই চলছে"
                          : "গৃহীত হয়েছে"}
                    </p>
                    {order.transactionId && (
                      <p className="mt-0.5 truncate text-xs text-ink-500">TrxID: {order.transactionId}</p>
                    )}
                  </div>

                  <div className="rounded-lg border border-cream-200 bg-cream-50 px-3.5 py-3">
                    <p className="flex items-center gap-1.5 text-xs font-medium text-ink-500">
                      <MapPin className="h-3.5 w-3.5" />
                      ডেলিভারি ঠিকানা
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm font-medium text-ink-700">
                      {order.address}, {order.area ? `${order.area}, ` : ""}
                      {order.city}
                    </p>
                  </div>
                </div>

                {/* Items + totals */}
                <div className="mt-4 border-t border-cream-200 pt-4">
                  <div className="flex flex-col divide-y divide-cream-100">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-2 text-sm">
                        <p className="min-w-0 flex-1 truncate pr-3 font-medium text-ink-900">
                          {item.productName}
                          <span className="ml-1 text-xs font-normal text-ink-500">
                            x {item.quantity}
                          </span>
                        </p>
                        <p className="font-semibold text-ink-900">{formatTaka(item.lineTotal)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-ink-500">
                      ডেলিভারি চার্জ {formatTaka(order.deliveryFee)} সহ
                    </span>
                    <span className="text-base font-bold text-navy-900">
                      সর্বমোট {formatTaka(order.total)}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <p className="mt-8 flex items-center justify-center gap-1.5 text-center text-xs text-ink-500">
        <Phone className="h-3.5 w-3.5" />
        অর্ডার নিয়ে কোনো প্রশ্ন থাকলে আমাদের সাথে যোগাযোগ করুন —{" "}
        <Link href="/contact" className="u-line font-medium text-teal-700 hover:text-teal-600">
          যোগাযোগ পাতা
        </Link>
      </p>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ShoppingBag;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-600">
        <Icon className="h-5 w-5" strokeWidth={1.8} />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-ink-500">{label}</p>
        <p className="text-base font-bold text-ink-900">{toBanglaDigits(value)}</p>
      </div>
    </div>
  );
}
