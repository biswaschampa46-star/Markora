"use client";

import { useEffect, useRef, useState } from "react";
import { Heart } from "lucide-react";
import { useToast } from "@/lib/toast-context";
import { readWishlist, toggleWishlist } from "@/lib/wishlist";

export function WishlistButton({
  productId,
  onToggle,
}: {
  productId: number;
  onToggle?: (productId: number, wished: boolean) => void;
}) {
  const [wished, setWished] = useState(false);
  const [pop, setPop] = useState(false);
  const popTimer = useRef(0);
  const { push } = useToast();

  useEffect(() => {
    // Reading persisted wishlist once on mount is intentional.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWished(readWishlist().includes(productId));
  }, [productId]);

  useEffect(() => () => window.clearTimeout(popTimer.current), []);

  function handleToggle() {
    const next = toggleWishlist(productId);
    setWished(next);

    setPop(false);
    window.clearTimeout(popTimer.current);
    // Restart the heart pop animation on the next frame.
    requestAnimationFrame(() => setPop(true));
    popTimer.current = window.setTimeout(() => setPop(false), 500);

    onToggle?.(productId, next);

    push(
      next ? "success" : "info",
      next ? "পছন্দের তালিকায় যোগ হয়েছে" : "পছন্দের তালিকা থেকে সরানো হয়েছে",
    );
  }

  return (
    <button
      type="button"
      aria-label={wished ? "পছন্দ থেকে সরান" : "পছন্দে যোগ করুন"}
      aria-pressed={wished}
      onClick={handleToggle}
      className={`ripple-host press flex h-9 w-9 items-center justify-center rounded-full border shadow-sm backdrop-blur-sm transition-colors ${
        wished
          ? "border-red-200 bg-white text-red-500"
          : "border-cream-300 bg-white/90 text-ink-500 hover:text-red-500"
      }`}
    >
      <span className={`heart-btn ${pop ? "heart-pop" : ""}`}>
        <Heart
          className={`h-4.5 w-4.5 ${wished ? "fill-current" : ""}`}
          strokeWidth={2}
        />
      </span>
    </button>
  );
}
