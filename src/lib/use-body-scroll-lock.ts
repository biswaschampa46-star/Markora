"use client";

import { useEffect } from "react";

let lockCount = 0;

/**
 * Locks body scroll while `active` is true. Multiple components (cart drawer,
 * mobile menu) can hold the lock concurrently — scroll is only restored when
 * every holder releases it.
 */
export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    lockCount += 1;
    document.body.style.overflow = "hidden";
    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) {
        document.body.style.overflow = "";
      }
    };
  }, [active]);
}
