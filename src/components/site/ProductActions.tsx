"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Minus, Plus, ShoppingCart, Zap } from "lucide-react";
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
};

type Phase = "idle" | "adding" | "added";

export function ProductActions({ product }: Props) {
  const { addItem } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [phase, setPhase] = useState<Phase>("idle");
  const timers = useRef<number[]>([]);
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const outOfStock = product.stock <= 0;

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  function changeQty(delta: number) {
    setQuantity((q) => Math.max(1, Math.min(q + delta, product.stock || 99)));
  }

  function handleAddToCart() {
    if (outOfStock || phase !== "idle") return;
    addItem(product, quantity);
    flyToCart(addBtnRef.current, product.imageUrl);
    setPhase("adding");
    timers.current.push(window.setTimeout(() => setPhase("added"), 320));
    timers.current.push(window.setTimeout(() => setPhase("idle"), 1500));
  }

  function handleBuyNow() {
    if (outOfStock) return;
    addItem(product, quantity);
    router.push("/checkout");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-ink-700">পরিমাণ</span>
        <div className="flex items-center rounded-lg border border-cream-300">
          <button
            type="button"
            onClick={() => changeQty(-1)}
            className="press flex h-9 w-9 items-center justify-center text-ink-700 transition-colors hover:bg-cream-100 disabled:opacity-40"
            disabled={outOfStock}
          >
            <Minus className="h-4 w-4" />
          </button>
          <span
            key={quantity}
            className="flex h-9 w-10 items-center justify-center text-sm font-semibold tabular-nums"
          >
            <span className="success-pop">{quantity}</span>
          </span>
          <button
            type="button"
            onClick={() => changeQty(1)}
            className="press flex h-9 w-9 items-center justify-center text-ink-700 transition-colors hover:bg-cream-100 disabled:opacity-40"
            disabled={outOfStock}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {!outOfStock && (
          <span className="text-xs text-ink-500">স্টকে আছে ({product.stock} টি)</span>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          ref={addBtnRef}
          type="button"
          onClick={handleAddToCart}
          disabled={outOfStock}
          data-ripple
          className={`ripple-host press flex flex-1 items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:border-cream-300 disabled:text-ink-300 ${
            phase === "added"
              ? "border-2 border-teal-600 bg-teal-50 text-teal-700"
              : "border-2 border-brand-500 text-brand-600 hover:bg-brand-50"
          }`}
        >
          {phase === "adding" ? (
            <>
              <Loader2 className="spin-soft h-4 w-4" strokeWidth={2.2} />
              যোগ হচ্ছে...
            </>
          ) : phase === "added" ? (
            <>
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
              <span className="success-pop">যোগ হয়েছে</span>
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" strokeWidth={2.2} />
              কার্টে যোগ করুন
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={outOfStock}
          data-ripple
          className="ripple-host press flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-cream-200 disabled:text-ink-300"
        >
          <Zap className="h-4 w-4" strokeWidth={2.2} />
          এখনই কিনুন
        </button>
      </div>
    </div>
  );
}
