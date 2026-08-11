"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ImageOff, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import { formatTaka } from "@/lib/format";
import { EmptyState } from "@/components/site/EmptyState";
import { AnimatedNumber } from "@/components/site/AnimatedNumber";

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice, isHydrated } = useCart();
  const { push } = useToast();
  const [exiting, setExiting] = useState<Set<number>>(new Set());

  if (!isHydrated) {
    return <div className="mx-auto max-w-5xl px-4 py-10" />;
  }

  function handleRemove(productId: number) {
    if (exiting.has(productId)) return;
    setExiting((prev) => new Set(prev).add(productId));
    window.setTimeout(() => {
      removeItem(productId);
      push("info", "পণ্যটি কার্ট থেকে সরানো হয়েছে");
      setExiting((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }, 260);
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="mb-6 text-xl font-bold text-ink-900">আপনার কার্ট</h1>
        <EmptyState
          title="আপনার কার্ট খালি"
          description="পছন্দের পণ্য কার্টে যোগ করে কেনাকাটা শুরু করুন।"
        />
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="ripple-host press inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
          >
            কেনাকাটা করুন
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 flex items-center gap-2 text-xl font-bold text-ink-900">
        <ShoppingBag className="h-5 w-5 text-brand-500" />
        আপনার কার্ট ({items.length} টি পণ্য)
      </h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-3 lg:col-span-2">
          {items.map((item, i) => (
            <div
              key={item.productId}
              style={{ animationDelay: `${i * 60}ms` }}
              className={`rise-item flex items-center gap-3 rounded-xl border border-cream-300 bg-white p-3 transition-colors hover:border-brand-400/50 ${
                exiting.has(item.productId) ? "cart-item-exit" : ""
              }`}
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-cream-100">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-ink-300">
                    <ImageOff className="h-6 w-6" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/product/${item.slug}`}
                  className="line-clamp-2 text-sm font-medium text-ink-900 transition-colors hover:text-brand-600"
                >
                  {item.name}
                </Link>
                <p className="mt-1 text-sm font-bold text-navy-900">{formatTaka(item.price)}</p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex items-center rounded-lg border border-cream-300">
                    <button
                      type="button"
                      aria-label="পরিমাণ কমান"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="press flex h-7 w-7 items-center justify-center text-ink-700 transition-colors hover:bg-cream-100"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span
                      key={item.quantity}
                      className="flex h-7 w-8 items-center justify-center text-xs font-semibold tabular-nums"
                    >
                      <span className="success-pop">{item.quantity}</span>
                    </span>
                    <button
                      type="button"
                      aria-label="পরিমাণ বাড়ান"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="press flex h-7 w-7 items-center justify-center text-ink-700 transition-colors hover:bg-cream-100"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(item.productId)}
                    className="press flex items-center gap-1 text-xs font-medium text-red-500 transition-colors hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    মুছে ফেলুন
                  </button>
                </div>
              </div>
              <p className="shrink-0 text-sm font-bold text-ink-900 tabular-nums">
                {formatTaka(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-xl border border-cream-300 bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-ink-900">অর্ডার সারসংক্ষেপ</h2>
          <div className="mt-4 flex items-center justify-between text-sm text-ink-700">
            <span>সাবটোটাল</span>
            <AnimatedNumber value={totalPrice} format={formatTaka} className="font-semibold" />
          </div>
          <p className="mt-1 text-xs text-ink-500">ডেলিভারি চার্জ চেকআউটে যোগ হবে</p>
          <Link
            href="/checkout"
            className="ripple-host press mt-4 block w-full rounded-lg bg-brand-500 py-3 text-center text-sm font-bold text-white transition-colors hover:bg-brand-600"
          >
            চেকআউটে যান
          </Link>
          <Link
            href="/"
            className="mt-2 block w-full rounded-lg border border-cream-300 py-2.5 text-center text-sm font-medium text-ink-700 transition-colors hover:bg-cream-100"
          >
            কেনাকাটা চালিয়ে যান
          </Link>
        </div>
      </div>
    </div>
  );
}
