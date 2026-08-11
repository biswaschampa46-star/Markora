"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlistCount } from "@/lib/wishlist";
import { toBanglaDigits } from "@/lib/format";

export function WishlistBadge() {
  const count = useWishlistCount();
  const iconRef = useRef<HTMLSpanElement>(null);
  const prevCount = useRef(-1); // -1 → first (hydrated) read, no bump

  useEffect(() => {
    if (prevCount.current >= 0 && count > prevCount.current) {
      const el = iconRef.current;
      if (el) {
        el.classList.remove("bump");
        void el.offsetWidth;
        el.classList.add("bump");
      }
    }
    prevCount.current = count;
  }, [count]);

  return (
    <Link
      href="/wishlist"
      aria-label={`পছন্দের তালিকা${count > 0 ? ` (${count} টি পণ্য)` : ""}`}
      data-ripple
      className="ripple-host press flex flex-col items-center gap-0.5 rounded-lg px-2.5 py-1.5 text-white transition hover:bg-white/10"
    >
      <span ref={iconRef} className="relative">
        <Heart className="h-6 w-6" strokeWidth={1.8} />
        {count > 0 && (
          <span className="cart-count-badge absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold leading-none text-white">
            {toBanglaDigits(count)}
          </span>
        )}
      </span>
      <span className="hidden text-xs font-medium sm:block">পছন্দ</span>
    </Link>
  );
}
