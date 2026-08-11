"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { flyToCart } from "@/lib/fly-to-cart";

type Props = {
  product: {
    productId: number;
    slug: string;
    name: string;
    price: number;
    imageUrl: string;
    stock: number;
  };
  quantity?: number;
  compact?: boolean;
};

type Phase = "idle" | "adding" | "added";

export function AddToCartButton({ product, quantity = 1, compact = false }: Props) {
  const { addItem } = useCart();
  const [phase, setPhase] = useState<Phase>("idle");
  const timers = useRef<number[]>([]);
  const btnRef = useRef<HTMLButtonElement>(null);
  const outOfStock = product.stock <= 0;

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  function handleClick() {
    if (outOfStock || phase !== "idle") return;
    addItem(product, quantity);
    flyToCart(btnRef.current, product.imageUrl);
    setPhase("adding");
    timers.current.push(window.setTimeout(() => setPhase("added"), 320));
    timers.current.push(window.setTimeout(() => setPhase("idle"), 1500));
  }

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={handleClick}
      disabled={outOfStock}
      data-ripple
      className={`ripple-host press flex w-full items-center justify-center gap-1.5 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:bg-cream-200 disabled:text-ink-300 ${
        compact ? "px-3 py-1.5 text-xs" : "px-4 py-2.5 text-sm"
      } ${
        phase === "added"
          ? "bg-teal-600 text-white"
          : phase === "adding"
            ? "bg-brand-600 text-white"
            : "bg-brand-500 text-white hover:bg-brand-600"
      }`}
    >
      {outOfStock ? (
        "স্টক নেই"
      ) : phase === "adding" ? (
        <>
          <Loader2 className="spin-soft h-4 w-4" strokeWidth={2.2} />
          যোগ হচ্ছে...
        </>
      ) : (
        <>
          {phase === "added" ? (
            <span className="success-pop flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                <path
                  d="M4.5 12.5l5 5 10-11"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="check-draw"
                />
              </svg>
              যোগ হয়েছে
            </span>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" strokeWidth={2} />
              কার্টে যোগ করুন
            </>
          )}
        </>
      )}
    </button>
  );
}
