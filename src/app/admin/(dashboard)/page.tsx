import Link from "next/link";
import { AlarmClockOff, Mail, Package, ShoppingCart, Wallet } from "lucide-react";
import { getDashboardStats, getAllOrdersAdmin } from "@/lib/queries";
import { formatTaka, formatBanglaDate } from "@/lib/format";
import { DueBadge, StatusBadge } from "@/components/admin/StatusBadge";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [stats, recentOrders] = await Promise.all([
    getDashboardStats(),
    getAllOrdersAdmin().then((rows) => rows.slice(0, 6)),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-ink-900">ড্যাশবোর্ড</h1>
        <p className="text-sm text-ink-500">Markora প্যানেলের সার্বিক অবস্থা দেখুন</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon={Package} label="মোট পণ্য" value={stats.productCount.toString()} />
        <StatCard icon={ShoppingCart} label="মোট অর্ডার" value={stats.orderCount.toString()} />
        <StatCard icon={Wallet} label="মোট আয়" value={formatTaka(stats.revenue)} />
        <StatCard icon={Mail} label="অপঠিত বার্তা" value={stats.unreadMessages.toString()} />
        <StatCard
          icon={AlarmClockOff}
          label="ডিউ অর্ডার"
          value={stats.dueCount.toString()}
          accent={stats.dueCount > 0 ? "red" : "default"}
        />
      </div>

      {stats.dueCount > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-medium text-red-700">
          <AlarmClockOff className="h-4 w-4 shrink-0" />
          {stats.dueCount} টি অর্ডার ডিউ — পেমেন্ট যাচাই বা ডেলিভারি মনোযোগ দরকার
          <Link href="/admin/orders?status=due" className="ml-1 underline">
            দেখুন
          </Link>
        </div>
      )}

      {stats.pendingCount > 0 && (
        <div className="rounded-xl border border-brand-200 bg-brand-50 px-5 py-3 text-sm font-medium text-brand-700">
          {stats.pendingCount} টি অর্ডার অপেক্ষমান রয়েছে — এখনই দেখুন
          <Link href="/admin/orders?status=pending" className="ml-2 underline">
            অর্ডার তালিকা
          </Link>
        </div>
      )}

      <div className="rounded-xl border border-cream-300 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-ink-900">সাম্প্রতিক অর্ডার সমূহ</h2>
          <Link href="/admin/orders" className="text-sm font-medium text-brand-600 hover:text-brand-700">
            সব দেখুন
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="mt-4 text-sm text-ink-500">এখনো কোনো অর্ডার আসেনি।</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-cream-200 text-xs uppercase text-ink-500">
                  <th className="pb-2 pr-4">অর্ডার নম্বর</th>
                  <th className="pb-2 pr-4">গ্রাহক</th>
                  <th className="pb-2 pr-4">মূল্য</th>
                  <th className="pb-2 pr-4">স্ট্যাটাস</th>
                  <th className="pb-2">তারিখ</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-cream-100 last:border-0">
                    <td className="py-2.5 pr-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium text-navy-800 hover:text-brand-600"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-2.5 pr-4">{order.customerName}</td>
                    <td className="py-2.5 pr-4 font-semibold">{formatTaka(order.total)}</td>
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={order.status} />
                        {order.due.isDue && <DueBadge reason={order.due.reason} />}
                      </div>
                    </td>
                    <td className="py-2.5 text-xs text-ink-500">{formatBanglaDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent = "default",
}: {
  icon: typeof Package;
  label: string;
  value: string;
  accent?: "default" | "red";
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-cream-300 bg-white p-4">
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
          accent === "red" ? "bg-red-50 text-red-600" : "bg-teal-50 text-teal-600"
        }`}
      >
        <Icon className="h-5 w-5" strokeWidth={1.7} />
      </span>
      <div>
        <p className="text-xs text-ink-500">{label}</p>
        <p className="text-lg font-bold text-ink-900">{value}</p>
      </div>
    </div>
  );
}
