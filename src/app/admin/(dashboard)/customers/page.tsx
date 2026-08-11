import Link from "next/link";
import { Users } from "lucide-react";
import { getCustomersAdmin } from "@/lib/queries";
import { formatTaka, formatBanglaDate, toBanglaDigits } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customers = await getCustomersAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-ink-900">গ্রাহক সমূহ</h1>
        <p className="text-sm text-ink-500">
          প্রতিটি অ্যাকাউন্টের গ্রাহকের সম্পূর্ণ তথ্য — ইমেইল স্বয়ংক্রিয়ভাবে তাদের অ্যাকাউন্ট থেকে
          আসে।
        </p>
      </div>

      {customers.length === 0 ? (
        <div className="rounded-xl border border-cream-300 bg-white p-10 text-center text-sm text-ink-500">
          এখনো কোনো রেজিস্টার্ড গ্রাহক নেই।
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-cream-300 bg-white">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-cream-200 text-xs uppercase text-ink-500">
                <th className="px-4 py-3">গ্রাহক</th>
                <th className="px-4 py-3">ইমেইল</th>
                <th className="px-4 py-3">ফোন</th>
                <th className="px-4 py-3">অর্ডার</th>
                <th className="px-4 py-3">মোট খরচ</th>
                <th className="px-4 py-3">সর্বশেষ অর্ডার</th>
                <th className="px-4 py-3">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr
                  key={customer.userId}
                  className="border-b border-cream-100 transition last:border-0 hover:bg-cream-50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
                        {customer.customerName.trim().charAt(0) || "?"}
                      </span>
                      <span className="font-medium text-ink-900">{customer.customerName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-700">{customer.customerEmail ?? "—"}</td>
                  <td className="px-4 py-3 text-ink-700">{customer.phone}</td>
                  <td className="px-4 py-3 font-semibold text-navy-900">
                    {toBanglaDigits(customer.orderCount)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-navy-900">
                    {formatTaka(customer.totalSpent)}
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-500">
                    {formatBanglaDate(customer.lastOrderAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/customers/${customer.userId}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-navy-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-navy-800"
                    >
                      <Users className="h-3.5 w-3.5" />
                      বিস্তারিত
                    </Link>
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
