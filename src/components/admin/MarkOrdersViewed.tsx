"use client";

import { useEffect } from "react";
import { markOrdersViewed } from "@/app/admin/(dashboard)/actions";

// Marks the admin's new orders as viewed the moment the orders list (no
// orderId) or a single order detail page (orderId set) opens, so the sidebar
// badge clears. Dispatches an "admin:orders-updated" event so the badge
// refreshes immediately instead of waiting for the next poll.
export function MarkOrdersViewed({ orderId }: { orderId?: number }) {
  useEffect(() => {
    let cancelled = false;
    void markOrdersViewed(orderId)
      .then(() => {
        if (!cancelled) window.dispatchEvent(new Event("admin:orders-updated"));
      })
      .catch(() => {
        // Swallow failures - the badge corrects itself on the next poll.
      });
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  return null;
}
