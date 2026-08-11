import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlarmClockOff,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { getOrderWithItems } from "@/lib/queries";
import {
  confirmOrderWithDelivery,
  deliverOrder,
  toggleOrderDue,
  updateOrderStatus,
} from "@/app/admin/(dashboard)/actions";
import {
  formatTaka,
  formatBanglaDate,
  formatExpectedDelivery,
  getExpectedDelivery,
  toDatetimeLocalInput,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_ORDER,
  PAYMENT_METHOD_LABELS,
} from "@/lib/format";
import { DUE_REASON_LABELS } from "@/lib/order-due";
import { OrderTimeline } from "@/components/site/OrderTimeline";
import { DueBadge, StatusBadge } from "@/components/admin/StatusBadge";
import { Select } from "@/components/ui/Select";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orderId = Number(id);

  if (!Number.isInteger(orderId)) {
    notFound();
  }

  const result = await getOrderWithItems(orderId);

  if (!result) {
    notFound();
  }

  const { order, items } = result;
  const due = order.due;
  const expectedDelivery = getExpectedDelivery(order);
  const isTerminal = order.status === "delivered" || order.status === "cancelled";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 transition hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" />
          অর্ডার তালিকায় ফিরুন
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-bold text-ink-900">অর্ডার {order.orderNumber}</h1>
          <StatusBadge status={order.status} />
          {due.isDue && <DueBadge reason={due.reason} />}
        </div>
        <p className="mt-1 text-sm text-ink-500">
          {formatBanglaDate(order.createdAt)}
          {order.userId ? " · অ্যাকাউন্টে লিংকড" : " · অতিথি অর্ডার"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          {/* Real-data progress like the storefront, not fake info */}
          <div className="rounded-xl border border-cream-300 bg-white p-5">
            <h2 className="mb-4 text-sm font-bold text-ink-900">অর্ডার অগ্রগতি</h2>
            <OrderTimeline order={order} />

            {due.isDue && (
              <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">
                <AlarmClockOff className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  এই অর্ডারটি ডিউ — {due.reason ? DUE_REASON_LABELS[due.reason] : "মনোযোগ প্রয়োজন"}
                </span>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-cream-300 bg-white p-5">
            <h2 className="text-sm font-bold text-ink-900">গ্রাহকের তথ্য</h2>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <p className="flex items-center gap-2 text-ink-700">
                <User className="h-4 w-4 text-brand-500" />
                {order.customerName}
              </p>
              <p className="flex items-center gap-2 text-ink-700">
                <Phone className="h-4 w-4 text-brand-500" />
                {order.phone}
                {order.altPhone ? `, ${order.altPhone}` : ""}
              </p>
              <p className="flex items-center gap-2 text-ink-700">
                <Mail className="h-4 w-4 text-brand-500" />
                {order.customerEmail ?? "—"}
              </p>
              <p className="flex items-start gap-2 text-ink-700">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                {order.address}, {order.area ? `${order.area}, ` : ""}
                {order.city}
              </p>
              {order.note && (
                <p className="rounded-lg bg-cream-100 px-3 py-2 text-xs text-ink-600">
                  নোট: {order.note}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-cream-300 bg-white p-5">
            <h2 className="text-sm font-bold text-ink-900">অর্ডারকৃত পণ্য</h2>
            {items.length === 0 ? (
              <p className="mt-3 text-sm text-ink-500">কোনো পণ্য পাওয়া যায়নি।</p>
            ) : (
              <div className="mt-3 flex flex-col divide-y divide-cream-200">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2.5 text-sm">
                    <div>
                      <p className="font-medium text-ink-900">{item.productName}</p>
                      <p className="text-xs text-ink-500">
                        {item.quantity} x {formatTaka(item.price)}
                      </p>
                    </div>
                    <p className="font-semibold text-ink-900">{formatTaka(item.lineTotal)}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3 flex flex-col gap-1 border-t border-cream-200 pt-3 text-sm">
              <div className="flex justify-between text-ink-700">
                <span>সাবটোটাল</span>
                <span>{formatTaka(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-ink-700">
                <span>ডেলিভারি চার্জ</span>
                <span>{formatTaka(order.deliveryFee)}</span>
              </div>
              <div className="flex justify-between border-t border-cream-200 pt-2 text-base font-bold text-navy-900">
                <span>সর্বমোট</span>
                <span>{formatTaka(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-cream-300 bg-white p-5">
            <h2 className="text-sm font-bold text-ink-900">অর্ডার তথ্য</h2>
            <div className="mt-3 flex flex-col gap-2 text-sm text-ink-700">
              <div className="flex justify-between">
                <span className="text-ink-500">পেমেন্ট</span>
                <span className="font-medium">
                  {PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}
                </span>
              </div>
              {order.transactionId && (
                <div className="flex justify-between">
                  <span className="text-ink-500">TrxID</span>
                  <span className="font-medium">{order.transactionId}</span>
                </div>
              )}
              {order.paymentMethod !== "cash_on_delivery" && (
                <div className="flex justify-between">
                  <span className="text-ink-500">পেমেন্ট অবস্থা</span>
                  <span
                    className={`font-semibold ${
                      order.status === "pending" ? "text-amber-600" : "text-teal-600"
                    }`}
                  >
                    {order.status === "pending" ? "যাচাই বাকি" : "যাচাই হয়েছে"}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-ink-500">
                  {order.deliveredAt ? "ডেলিভারি সম্পন্ন" : "ডেলিভারি সময়"}
                </span>
                <span className={`font-medium ${order.deliveredAt ? "text-teal-700" : ""}`}>
                  {order.deliveredAt
                    ? formatBanglaDate(order.deliveredAt)
                    : expectedDelivery
                      ? `${formatExpectedDelivery(expectedDelivery)} (${formatBanglaDate(expectedDelivery)})`
                      : "নির্ধারিত হয়নি"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500">স্ট্যাটাস</span>
                <StatusBadge status={order.status} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-cream-300 bg-white p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-ink-900">
              <CalendarClock className="h-4 w-4 text-brand-500" />
              ডেলিভারি সময় ও নিশ্চিতকরণ
            </h2>
            <p className="mt-1 text-xs text-ink-500">
              ডেলিভারি কত দিনের মধ্যে পৌঁছাবে তা নির্ধারণ করুন। নিশ্চিত করলে অর্ডারটি
              &ldquo;নিশ্চিত হয়েছে&rdquo; হয়ে যাবে এবং গ্রাহককে ডেলিভারি তারিখ দেখানো হবে।
            </p>
            <form
              action={(formData) => {
                void confirmOrderWithDelivery(order.id, formData);
              }}
              className="mt-3 flex flex-col gap-3"
            >
              <label className="flex flex-col gap-1 text-xs font-medium text-ink-700">
                ডেলিভারি দিন (আজ থেকে)
                <input
                  type="number"
                  name="deliveryDays"
                  min={1}
                  max={60}
                  required
                  className="input"
                  placeholder="যেমন: ৩"
                />
              </label>
              <button
                type="submit"
                disabled={isTerminal}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                {order.status === "pending" ? "নিশ্চিত করুন ও সময় সেট করুন" : "ডেলিভারি সময় আপডেট করুন"}
              </button>
            </form>
            {expectedDelivery && (
              <p className="mt-3 rounded-lg bg-cream-100 px-3 py-2 text-xs font-medium text-ink-700">
                নির্ধারিত ডেলিভারি: {formatExpectedDelivery(expectedDelivery)}{" "}
                ({formatBanglaDate(expectedDelivery)})
              </p>
            )}
          </div>

          <div className="rounded-xl border border-cream-300 bg-white p-5">
            <h2 className="text-sm font-bold text-ink-900">দ্রুত অ্যাকশন</h2>
            <div className="mt-3 flex flex-col gap-2">
              <form
                action={(formData) => {
                  void deliverOrder(order.id, formData);
                }}
                className="flex flex-col gap-2"
              >
                <label className="flex flex-col gap-1 text-xs font-medium text-ink-700">
                  ডেলিভারির তারিখ ও সময়
                  <input
                    type="datetime-local"
                    name="deliveredAt"
                    defaultValue={toDatetimeLocalInput(new Date())}
                    className="input"
                  />
                </label>
                <button
                  type="submit"
                  disabled={isTerminal}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  ডেলিভারি সম্পন্ন করুন
                </button>
              </form>

              <form action={() => void toggleOrderDue(order.id)}>
                <button
                  type="submit"
                  disabled={isTerminal}
                  className={`flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    due.isDue
                      ? "border-teal-300 bg-teal-50 text-teal-700 hover:bg-teal-100"
                      : "border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
                  }`}
                >
                  <AlarmClockOff className="h-4 w-4" />
                  {due.isDue ? "ডিউ সরান" : "মার্ক ডিউ"}
                </button>
              </form>
            </div>
          </div>

          <div className="rounded-xl border border-cream-300 bg-white p-5">
            <h2 className="text-sm font-bold text-ink-900">স্ট্যাটাস পরিবর্তন</h2>
            <form
              action={(formData) => {
                void updateOrderStatus(order.id, formData);
              }}
              className="mt-3 flex flex-col gap-3"
            >
              <Select
                name="status"
                options={ORDER_STATUS_ORDER.map((s) => ({
                  value: s,
                  label: ORDER_STATUS_LABELS[s],
                }))}
                defaultValue={order.status}
              />
              <button
                type="submit"
                className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
              >
                স্ট্যাটাস আপডেট করুন
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
