"use client";

import { useEffect, useState } from "react";

export const WISHLIST_STORAGE_KEY = "markora-wishlist-v1";
export const WISHLIST_EVENT = "markora:wishlist-change";

export function readWishlist(): number[] {
  try {
    const raw = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n === "number") : [];
  } catch {
    return [];
  }
}

/**
 * Toggles a product id in the wishlist, persists it and notifies every
 * listener (badges, the wishlist page). Returns the new wished state.
 */
export function toggleWishlist(productId: number): boolean {
  const list = readWishlist();
  const next = !list.includes(productId);
  const updated = next
    ? [...list.filter((id) => id !== productId), productId]
    : list.filter((id) => id !== productId);
  try {
    window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // storage full / private mode — ignore
  }
  window.dispatchEvent(new Event(WISHLIST_EVENT));
  return next;
}

export function clearWishlist() {
  try {
    window.localStorage.removeItem(WISHLIST_STORAGE_KEY);
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event(WISHLIST_EVENT));
}

/** Reactive wishlist count that stays in sync across tabs and components. */
export function useWishlistCount(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const update = () => setCount(readWishlist().length);
    const onStorage = (e: StorageEvent) => {
      if (e.key === WISHLIST_STORAGE_KEY) update();
    };
    update();
    window.addEventListener(WISHLIST_EVENT, update);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(WISHLIST_EVENT, update);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return count;
}
