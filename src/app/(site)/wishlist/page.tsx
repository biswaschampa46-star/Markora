"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Heart, RefreshCw, Trash2 } from "lucide-react";
import { ProductCard, type ProductCardData } from "@/components/site/ProductCard";
import { EmptyState } from "@/components/site/EmptyState";
import { clearWishlist, readWishlist } from "@/lib/wishlist";
import { useToast } from "@/lib/toast-context";
import { toBanglaDigits } from "@/lib/format";

type HydratedProduct = {
  id: number;
  name: string;
  slug: string;
  price: string;
  oldPrice: string | null;
  imageUrl: string;
  stock: number;
};

export default function WishlistPage() {
  const [ids, setIds] = useState<number[] | null>(null); // null → not hydrated yet
  const [products, setProducts] = useState<HydratedProduct[] | null>(null); // null → loading
  const [error, setError] = useState(false);
  const [requestKey, setRequestKey] = useState(0);
  const [exiting, setExiting] = useState<Set<number>>(new Set());
  const removeTimers = useRef(new Map<number, number>());
  const { push } = useToast();

  // Read the persisted ids once after hydration.
  useEffect(() => {
    // Reading persisted wishlist once on mount is intentional.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIds(readWishlist());
  }, []);

  // Clear pending removal timers on unmount.
  useEffect(
    () => () => {
      removeTimers.current.forEach((t) => window.clearTimeout(t));
      removeTimers.current.clear();
    },
    [],
  );

  // Hydrate ids into full products whenever the list changes.
  useEffect(() => {
    if (ids === null || ids.length === 0) return;
    let cancelled = false;
    fetch(`/api/wishlist?ids=${ids.join(",")}`)
      .then((res) => res.json())
      .then((data: { products?: HydratedProduct[] }) => {
        if (!cancelled) {
          setProducts(data.products ?? []);
          setError(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          push("error", "পছন্দের পণ্য লোড করা যায়নি।");
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids, requestKey]);

  const handleToggle = useCallback((productId: number, wished: boolean) => {
    if (wished) {
      // Re-added — cancel any pending removal for this id.
      const pending = removeTimers.current.get(productId);
      if (pending) {
        window.clearTimeout(pending);
        removeTimers.current.delete(productId);
      }
      setExiting((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
      setIds((prev) =>
        prev ? [...prev.filter((id) => id !== productId), productId] : [productId],
      );
      return;
    }

    // Removed — play the exit animation, then drop the id.
    if (removeTimers.current.has(productId)) return;
    setExiting((prev) => new Set(prev).add(productId));
    const timer = window.setTimeout(() => {
      removeTimers.current.delete(productId);
      setIds((prev) => (prev ? prev.filter((id) => id !== productId) : prev));
      setExiting((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }, 280);
    removeTimers.current.set(productId, timer);
  }, []);

  function handleClearAll() {
    clearWishlist();
    removeTimers.current.forEach((t) => window.clearTimeout(t));
    removeTimers.current.clear();
    setExiting(new Set());
    setIds([]);
    push("info", "পছন্দের তালিকা খালি করা হয়েছে");
  }

  const count = ids?.length ?? 0;
  const loading = ids === null || (ids.length > 0 && products === null);
  const isEmpty = ids !== null && ids.length === 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div className="rise-item flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-xl font-bold text-ink-900 sm:text-2xl">
          <Heart className="h-5 w-5 fill-current text-red-500" strokeWidth={2} />
          পছন্দের তালিকা
          {!loading && count > 0 && (
            <span className="rounded-full bg-brand-500 px-2.5 py-0.5 text-xs font-bold text-white">
              {toBanglaDigits(count)} টি
            </span>
          )}
        </h1>
        {!loading && count > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="press flex items-center gap-1.5 rounded-lg border border-cream-300 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 transition-colors hover:border-red-300 hover:text-red-500"
          >
            <Trash2 className="h-3.5 w-3.5" />
            সব সরান
          </button>
        )}
      </div>

      {isEmpty ? (
        <div className="mt-6">
          <EmptyState
            title="পছন্দের তালিকা খালি"
            description="পণ্যের কার্ডে থাকা হৃদয় আইকনে ক্লিক করে পছন্দের পণ্য সংরক্ষণ করুন।"
          />
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="ripple-host press inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
            >
              কেনাকাটা শুরু করুন
            </Link>
          </div>
        </div>
      ) : error && products === null ? (
        <div className="rise-item mt-6 flex flex-col items-center gap-3 rounded-xl border border-dashed border-cream-300 bg-white px-6 py-14 text-center">
          <p className="text-base font-semibold text-ink-900">পণ্য লোড করা যায়নি</p>
          <p className="max-w-sm text-sm text-ink-500">
            ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।
          </p>
          <button
            type="button"
            onClick={() => setRequestKey((k) => k + 1)}
            className="ripple-host press mt-2 inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-brand-600"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            আবার চেষ্টা করুন
          </button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rise-item overflow-hidden rounded-xl border border-cream-300 bg-white"
                  style={{ "--d": `${i * 60}ms` } as React.CSSProperties}
                >
                  <div className="shimmer aspect-square bg-cream-200" />
                  <div className="space-y-2 p-3">
                    <div className="shimmer h-3.5 w-3/4 rounded bg-cream-200" />
                    <div className="shimmer h-4 w-1/2 rounded bg-cream-200" />
                  </div>
                </div>
              ))
            : (products ?? []).map((product, i) => (
                <div
                  key={product.id}
                  className={`rise-item h-full ${exiting.has(product.id) ? "cart-item-exit" : ""}`}
                  style={{ "--d": `${Math.min(i * 60, 360)}ms` } as React.CSSProperties}
                >
                  <ProductCard product={product as ProductCardData} onWishlistToggle={handleToggle} />
                </div>
              ))}
        </div>
      )}
    </div>
  );
}
