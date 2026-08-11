"use client";

import { Fragment, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Calculator,
  ChevronDown,
  ExternalLink,
  MapPin,
  Package,
  StickyNote,
  User,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { formatBanglaDate, formatTaka, toBanglaDigits, PAYMENT_METHOD_LABELS } from "@/lib/format";
import { DueBadge, StatusBadge } from "@/components/admin/StatusBadge";
import { OrderQuickActions } from "@/components/admin/OrderQuickActions";

type DueInfo = { isDue: boolean; reason: "payment" | "delivery" | "manual" | null };

export type OrdersTableOrder = {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string | null;
  phone: string;
  altPhone: string | null;
  address: string;
  city: string;
  area: string | null;
  note: string | null;
  paymentMethod: string;
  transactionId: string | null;
  subtotal: string;
  deliveryFee: string;
  total: string;
  status: string;
  createdAt: Date | string;
  deliveredAt: Date | string | null;
  expectedDeliveryAt: Date | string | null;
  due: DueInfo;
};

export type OrdersTableItem = {
  id: number;
  orderId: number;
  productName: string;
  quantity: number;
  lineTotal: string;
};

// Admin orders list with expandable rows: click the chevron on any order to
// reveal every detail the customer submitted (name, phones, email, full
// address, note, payment + TrxID, ordered items and the money breakdown)
// right in place, without leaving the page.
export function OrdersTable({
  orders,
  itemsByOrder,
}: {
  orders: OrdersTableOrder[];
  itemsByOrder: Record<number, OrdersTableItem[]>;
}) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <div className="overflow-x-auto rounded-xl border border-cream-300 bg-white">
      <table className="w-full min-w-[1320px] text-left text-sm">
        <thead>
          <tr className="border-b border-cream-200 text-xs uppercase text-ink-500">
            <th className="px-4 py-3">অর্ডার নম্বর</th>
            <th className="px-4 py-3">গ্রাহক</th>
            <th className="px-4 py-3">ইমেইল</th>
            <th className="px-4 py-3">ফোন</th>
            <th className="px-4 py-3">অবস্থান</th>
            <th className="px-4 py-3">নোট</th>
            <th className="px-4 py-3">পেমেন্ট</th>
            <th className="px-4 py-3">মোট</th>
            <th className="px-4 py-3">স্ট্যাটাস</th>
            <th className="px-4 py-3">তারিখ</th>
            <th className="px-4 py-3">অ্যাকশন</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const expanded = expandedId === order.id;
            return (
              <Fragment key={order.id}>
                <tr
                  className={`border-b border-cream-100 transition last:border-0 hover:bg-cream-50 ${
                    expanded ? "bg-cream-50" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setExpandedId(expanded ? null : order.id)}
                        aria-expanded={expanded}
                        aria-controls={`order-details-${order.id}`}
                        aria-label={expanded ? "বিস্তারিত বন্ধ করুন" : "বিস্তারিত দেখুন"}
                        title="সম্পূর্ণ বিবরণ দেখুন"
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition ${
                          expanded
                            ? "border-brand-500 bg-brand-500 text-white"
                            : "border-cream-300 text-ink-500 hover:border-brand-400 hover:text-brand-600"
                        }`}
                      >
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-200 ${
                            expanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-semibold text-navy-800 transition hover:text-brand-600"
                      >
                        {order.orderNumber}
                      </Link>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-900">{order.customerName}</td>
                  <td className="px-4 py-3 text-ink-700">{order.customerEmail ?? "—"}</td>
                  <td className="px-4 py-3 text-ink-700">{order.phone}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500" />
                      <span
                        className="line-clamp-2 max-w-[200px] text-xs leading-snug text-ink-700"
                        title={`${order.address}, ${order.area ? `${order.area}, ` : ""}${order.city}`}
                      >
                        {order.address}
                        {order.area ? `, ${order.area}` : ""}, {order.city}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {order.note ? (
                      <span
                        className="line-clamp-2 block max-w-[180px] text-xs leading-snug text-ink-600"
                        title={order.note}
                      >
                        <StickyNote className="mr-1 inline h-3 w-3 text-amber-500" />
                        {order.note}
                      </span>
                    ) : (
                      <span className="text-xs text-ink-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    {PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}
                  </td>
                  <td className="px-4 py-3 font-semibold text-navy-900">{formatTaka(order.total)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <StatusBadge status={order.status} />
                      {order.due.isDue && <DueBadge reason={order.due.reason} />}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-500">{formatBanglaDate(order.createdAt)}</td>
                  <td className="px-4 py-3">
                    <OrderQuickActions order={order} />
                  </td>
                </tr>

                {expanded && (
                  <tr className="border-b border-cream-100 bg-cream-50/80 last:border-0">
                    <td id={`order-details-${order.id}`} colSpan={11} className="px-4 py-4">
                      <ExpandedOrderPanel order={order} items={itemsByOrder[order.id] ?? []} />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// The "A-Z" details panel - everything the customer typed in checkout, plus
// the order breakdown, in one glance.
function ExpandedOrderPanel({
  order,
  items,
}: {
  order: OrdersTableOrder;
  items: OrdersTableItem[];
}) {
  return (
    <div className="rise-item overflow-hidden rounded-xl border border-cream-200 bg-white shadow-sm">
      <div className="grid gap-6 border-b border-cream-200 p-5 sm:grid-cols-2 lg:grid-cols-3">
        <DetailBlock icon={User} title="গ্রাহক">
          <DetailLine label="নাম" value={order.customerName} />
          <DetailLine label="ফোন" value={order.phone} />
          <DetailLine label="বিকল্প ফোন" value={order.altPhone || "—"} />
          <DetailLine label="ইমেইল" value={order.customerEmail || "—"} />
        </DetailBlock>

        <DetailBlock icon={MapPin} title="ডেলিভারি ঠিকানা">
          <DetailLine label="ঠিকানা" value={order.address} />
          <DetailLine label="এলাকা" value={order.area || "—"} />
          <DetailLine label="শহর / জেলা" value={order.city} />
        </DetailBlock>

        <DetailBlock icon={StickyNote} title="অর্ডার নোট">
          {order.note ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-700">{order.note}</p>
          ) : (
            <p className="text-sm text-ink-400">কোনো নোট নেই</p>
          )}
        </DetailBlock>

        <DetailBlock icon={Wallet} title="পেমেন্ট">
          <DetailLine
            label="পদ্ধতি"
            value={PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}
          />
          <DetailLine label="TrxID" value={order.transactionId || "—"} />
          <div className="flex items-center justify-between gap-3">
            <span className="shrink-0 text-xs font-medium text-ink-500">স্ট্যাটাস</span>
            <div className="flex items-center gap-1.5">
              <StatusBadge status={order.status} />
              {order.due.isDue && <DueBadge reason={order.due.reason} />}
            </div>
          </div>
        </DetailBlock>

        <DetailBlock icon={Package} title={`পণ্য (${toBanglaDigits(items.length)})`}>
          {items.length === 0 ? (
            <p className="text-sm text-ink-400">কোনো পণ্য নেই</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-baseline justify-between gap-3 text-sm"
                >
                  <span className="min-w-0 flex-1 truncate text-ink-700">
                    {item.productName}
                    <span className="ml-1 text-xs text-ink-500">
                      x {toBanglaDigits(item.quantity)}
                    </span>
                  </span>
                  <span className="shrink-0 font-semibold text-ink-900">
                    {formatTaka(item.lineTotal)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </DetailBlock>

        <DetailBlock icon={Calculator} title="টাকার হিসাব">
          <DetailLine label="সাবটোটাল" value={formatTaka(order.subtotal)} />
          <DetailLine label="ডেলিভারি চার্জ" value={formatTaka(order.deliveryFee)} />
          <div className="flex items-center justify-between border-t border-cream-200 pt-2 text-sm font-bold text-navy-900">
            <span>সর্বমোট</span>
            <span>{formatTaka(order.total)}</span>
          </div>
        </DetailBlock>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 bg-cream-50 px-5 py-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500">
          <span>অর্ডারের তারিখ: {formatBanglaDate(order.createdAt)}</span>
          {order.expectedDeliveryAt && (
            <span>নির্ধারিত ডেলিভারি: {formatBanglaDate(order.expectedDeliveryAt)}</span>
          )}
          {order.deliveredAt && (
            <span>ডেলিভারি সম্পন্ন: {formatBanglaDate(order.deliveredAt)}</span>
          )}
        </div>
        <Link
          href={`/admin/orders/${order.id}`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-navy-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-navy-800"
        >
          সম্পূর্ণ বিস্তারিত দেখুন
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

function DetailBlock({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-500">
        <Icon className="h-4 w-4 text-brand-500" strokeWidth={1.8} />
        {title}
      </h4>
      <div className="mt-2.5 flex flex-col gap-1.5">{children}</div>
    </div>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span className="shrink-0 text-xs font-medium text-ink-500">{label}</span>
      <span className="min-w-0 break-words text-right font-medium text-ink-900">{value}</span>
    </div>
  );
}
