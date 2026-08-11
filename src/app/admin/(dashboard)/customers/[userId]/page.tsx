import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarClock,
  Mail,
  MapPin,
  Phone,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import { getOrdersByUser } from "@/lib/queries";
import { getAuthUserById } from "@/lib/supabase/admin";
import {
  formatTaka,
  formatBanglaDate,
  PAYMENT_METHOD_LABELS,
  toBanglaDigits,
} from "@/lib/format";
import { DueBadge, StatusBadge } from "@/components/admin/StatusBadge";

export const dynamic = "force-dynamic";

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  const orders = await getOrdersByUser(userId);

  if (orders.length === 0) {
    notFound();
  }

  // The account's live email (from Supabase Auth, when the service role key is
  // configured) - falls back to the email captured on the order rows.
  const authUser = await getAuthUserById(userId);
  const accountEmail = authUser?.email ?? null;

  const latest = orders[0]; // getOrdersByUser returns newest first
  const name = latest.order.customerName;
  const phones = Array.from(
    new Set(
      orders
        .map(({ order }) => [order.phone, order.altPhone])
        .flat()
        .filter((p): p is string => Boolean(p)),
    ),
  ).join(", ");
  const email = accountEmail ?? latest.order.customerEmail ?? null;

  const totalSpent = orders.reduce((sum, { order }) => sum + Number(order.total), 0);
  const firstOrderAt = orders[orders.length - 1].order.createdAt;
  const lastOrderAt = latest.order.createdAt;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 transition hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" />
          গ্রাহক তালিকায় ফিরুন
        </Link>
        <h1 className="mt-2 text-xl font-bold text-ink-900">গ্রাহকের বিস্তারিত</h1>
      </div>

      {/* Profile header */}
      <div className="rounded-xl border border-cream-300 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xl font-bold text-white shadow-lg shadow-brand-500/25">
            {name?.trim().charAt(0) ?? "?"}
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold text-ink-900">{name}</h2>
            <p className="flex items-center gap-1.5 truncate text-sm text-ink-500">
              <Mail className="h-4 w-4 shrink-0" />
              {email ?? "ইমেইল পাওয়া যায়নি"}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-cream-200 pt-5 sm:grid-cols-4">
          <StatCard
            icon={ShoppingBag}
            label="মোট অর্ডার"
            value={toBanglaDigits(orders.length)}
          />
          <StatCard icon={Wallet} label="মোট খরচ" value={formatTaka(totalSpent)} />
          <StatCard
            icon={CalendarClock}
            label="প্রথম অর্ডার"
            value={formatBanglaDate(firstOrderAt)}
          />
          <StatCard
            icon={BadgeCheck}
            label="সর্বশেষ অর্ডার"
            value={formatBanglaDate(lastOrderAt)}
          />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 border-t border-cream-200 pt-5 sm:grid-cols-2">
          <div className="rounded-lg border border-cream-200 bg-cream-50 px-3.5 py-3">
            <p className="flex items-center gap-1.5 text-xs font-medium text-ink-500">
              <Phone className="h-3.5 w-3.5" />
              ফোন নম্বর
            </p>
            <p className="mt-1 text-sm font-semibold text-ink-900">{phones || "—"}</p>
          </div>
          <div className="rounded-lg border border-cream-200 bg-cream-50 px-3.5 py-3">
            <p className="flex items-center gap-1.5 text-xs font-medium text-ink-500">
              <Mail className="h-3.5 w-3.5" />
              অ্যাকাউন্ট ইমেইল
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-ink-900">{email ?? "—"}</p>
          </div>
        </div>
      </div>

      {/* Order history */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-ink-900">অর্ডার ইতিহাস</h2>
        <span className="text-sm text-ink-500">{toBanglaDigits(orders.length)} টি অর্ডার</span>
      </div>

      <div className="flex flex-col gap-4">
        {orders.map(({ order, items }) => (
          <div key={order.id} className="rounded-xl border border-cream-300 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cream-200 pb-3">
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="font-semibold text-navy-800 transition hover:text-brand-600"
                >
                  {order.orderNumber}
                </Link>
                <StatusBadge status={order.status} />
                {order.due.isDue && <DueBadge reason={order.due.reason} />}
              </div>
              <span className="text-xs text-ink-500">{formatBanglaDate(order.createdAt)}</span>
            </div>

            <div className="mt-3 flex flex-col gap-2 text-sm">
              <div className="flex flex-col divide-y divide-cream-100">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2">
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
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-cream-200 pt-3">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500">
                  <span className="flex items-center gap-1">
                    <Wallet className="h-3.5 w-3.5" />
                    {PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}
                    {order.transactionId ? ` · TrxID: ${order.transactionId}` : ""}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {order.address}
                    {order.area ? `, ${order.area}` : ""}, {order.city}
                  </span>
                </div>
                <p className="text-sm font-bold text-navy-900">{formatTaka(order.total)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ShoppingBag;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-600">
        <Icon className="h-5 w-5" strokeWidth={1.8} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs text-ink-500">{label}</p>
        <p className="truncate text-sm font-bold text-ink-900">{value}</p>
      </div>
    </div>
  );
}
