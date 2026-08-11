"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ImageOff, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import { AnimatedNumber } from "./AnimatedNumber";
import { formatTaka } from "@/lib/format";

export function CartDrawer() {
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
    totalPrice,
    totalItems,
    isHydrated,
  } = useCart();
  const { push } = useToast();

  const panelRef = useRef<HTMLElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  useBodyScrollLock(isDrawerOpen);

  useEffect(() => {
    if (!isDrawerOpen) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    if (panel) panel.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      restoreFocusRef.current?.focus();
      restoreFocusRef.current = null;
    };
  }, [isDrawerOpen, closeDrawer]);

  function handleRemove(productId: number) {
    removeItem(productId);
    push("info", "পণ্যটি কার্ট থেকে সরানো হয়েছে");
  }

  return (
    <div
      className={`fixed inset-0 z-[80] ${isDrawerOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!isDrawerOpen}
    >
      {/* Backdrop */}
      <div
        className={`drawer-overlay absolute inset-0 bg-navy-950/50 backdrop-blur-sm ${
          isDrawerOpen ? "is-open" : ""
        }`}
        onClick={closeDrawer}
      />

      {/* Panel */}
      <aside
        ref={panelRef}
        tabIndex={-1}
        className={`drawer-panel absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-cream-50 shadow-2xl focus:outline-none ${
          isDrawerOpen ? "is-open" : ""
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="শপিং কার্ট"
      >
        <div className="flex items-center justify-between border-b border-cream-300 bg-navy-900 px-5 py-4">
          <p className="flex items-center gap-2 text-base font-bold text-white">
            <ShoppingBag className="h-5 w-5 text-brand-400" strokeWidth={1.9} />
            আপনার কার্ট
            {isHydrated && totalItems > 0 && (
              <span className="rounded-full bg-brand-500 px-2 py-0.5 text-xs font-bold text-white">
                {totalItems} টি
              </span>
            )}
          </p>
          <button
            type="button"
            aria-label="কার্ট বন্ধ করুন"
            onClick={closeDrawer}
            className="press rounded-lg p-1.5 text-white transition hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!isHydrated ? null : items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                <ShoppingBag className="h-7 w-7" strokeWidth={1.5} />
              </span>
              <p className="text-sm font-semibold text-ink-900">আপনার কার্ট খালি</p>
              <p className="max-w-[220px] text-xs text-ink-500">
                পছন্দের পণ্য কার্টে যোগ করে কেনাকাটা শুরু করুন।
              </p>
              <button
                type="button"
                onClick={closeDrawer}
                className="mt-2 rounded-lg bg-brand-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-600"
              >
                কেনাকাটা চালিয়ে যান
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {isDrawerOpen &&
                items.map((item, i) => (
                  <div
                    key={item.productId}
                    className="drawer-item flex gap-3 rounded-xl border border-cream-300 bg-white p-3"
                    style={{ "--i": i } as React.CSSProperties}
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-cream-100">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-ink-300">
                          <ImageOff className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/product/${item.slug}`}
                        onClick={closeDrawer}
                        className="line-clamp-2 text-xs font-medium text-ink-900 transition hover:text-brand-600"
                      >
                        {item.name}
                      </Link>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex items-center rounded-lg border border-cream-300">
                          <button
                            type="button"
                            aria-label="পরিমাণ কমান"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="press flex h-6 w-6 items-center justify-center text-ink-700 hover:bg-cream-100"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="flex h-6 w-7 items-center justify-center text-[11px] font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label="পরিমাণ বাড়ান"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="press flex h-6 w-6 items-center justify-center text-ink-700 hover:bg-cream-100"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          type="button"
                          aria-label="মুছে ফেলুন"
                          onClick={() => handleRemove(item.productId)}
                          className="press rounded-md p-1 text-ink-300 transition hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="shrink-0 text-xs font-bold text-ink-900">
                      {formatTaka(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="border-t border-cream-300 bg-white px-5 py-4">
          <div className="flex items-center justify-between text-sm text-ink-700">
            <span>সাবটোটাল</span>
            <AnimatedNumber
              value={totalPrice}
              format={formatTaka}
              className="text-base font-bold text-navy-900"
            />
          </div>
          <p className="mt-0.5 text-[11px] text-ink-500">ডেলিভারি চার্জ চেকআউটে যোগ হবে</p>
          <Link
            href="/checkout"
            onClick={closeDrawer}
            className="ripple-host press mt-3 flex w-full items-center justify-center rounded-lg bg-brand-500 py-3 text-sm font-bold text-white transition hover:bg-brand-600"
          >
            চেকআউটে যান
          </Link>
          <Link
            href="/cart"
            onClick={closeDrawer}
            className="mt-2 block w-full rounded-lg border border-cream-300 py-2.5 text-center text-xs font-medium text-ink-700 transition hover:bg-cream-100"
          >
            সম্পূর্ণ কার্ট দেখুন
          </Link>
        </div>
      </aside>
    </div>
  );
}
