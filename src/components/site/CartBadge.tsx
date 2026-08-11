"use client";

import { useEffect, useRef } from "react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { toBanglaDigits } from "@/lib/format";

export function CartBadge() {
  const { totalItems, isHydrated, openDrawer } = useCart();
  const iconRef = useRef<HTMLSpanElement>(null);
  const prevTotal = useRef(0);

  useEffect(() => {
    if (!isHydrated) return;
    if (totalItems > prevTotal.current) {
      const el = iconRef.current;
      if (el) {
        el.classList.remove("bump");
        void el.offsetWidth;
        el.classList.add("bump");
      }
    }
    prevTotal.current = totalItems;
  }, [totalItems, isHydrated]);

  return (
    <button
      type="button"
      onClick={openDrawer}
      aria-label={`কার্ট খুলুন${isHydrated && totalItems > 0 ? ` (${totalItems} টি পণ্য)` : ""}`}
      data-ripple
      className="ripple-host press flex flex-col items-center gap-0.5 rounded-lg px-2.5 py-1.5 text-white transition hover:bg-white/10"
    >
      <span ref={iconRef} data-cart-target className="relative">
        <ShoppingCart className="h-6 w-6" strokeWidth={1.8} />
        {isHydrated && totalItems > 0 && (
          <span className="cart-count-badge absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-[11px] font-bold leading-none text-white">
            {toBanglaDigits(totalItems)}
          </span>
        )}
      </span>
      <span className="hidden text-xs font-medium sm:block">কার্ট</span>
    </button>
  );
}
