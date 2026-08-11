"use client";

import { useCallback, useEffect, useState } from "react";

type NotificationCounts = {
  unreadCount: number;
  pendingCount: number;
};

const POLL_INTERVAL = 30_000;

// Badge rendered next to the "অর্ডার সমূহ" sidebar item. Shows two indicators:
//   - orange pill = new/unread orders (not yet viewed by the admin)
//   - amber dot   = pending orders awaiting confirmation (অপেক্ষমান)
// Counts start from the server-rendered `initial` value (the shell remounts
// this component with key={pathname}, so navigating always re-syncs it), then
// stay fresh via a 30s poll, window focus, and the "admin:orders-updated"
// event dispatched after the orders page marks orders as viewed.
export function OrderNavBadge({
  initial,
  active,
}: {
  initial: NotificationCounts;
  active: boolean;
}) {
  const [counts, setCounts] = useState(initial);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notifications", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as NotificationCounts;
      setCounts((prev) =>
        data.unreadCount === prev.unreadCount && data.pendingCount === prev.pendingCount
          ? prev
          : data,
      );
    } catch {
      // Network hiccup - keep the last known count.
    }
  }, []);

  // Subscribe to live updates. setState only ever runs inside these callbacks
  // (interval tick, focus, order-state event) - never synchronously in the
  // effect body.
  useEffect(() => {
    const id = setInterval(() => void refresh(), POLL_INTERVAL);
    const onFocus = () => void refresh();
    const onOrdersUpdated = () => void refresh();
    window.addEventListener("focus", onFocus);
    window.addEventListener("admin:orders-updated", onOrdersUpdated);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("admin:orders-updated", onOrdersUpdated);
    };
  }, [refresh]);

  const { unreadCount, pendingCount } = counts;

  if (unreadCount === 0 && pendingCount === 0) return null;

  const formatCount = (n: number) => (n > 99 ? "99+" : String(n));

  return (
    <span className="ml-auto flex shrink-0 items-center gap-1.5">
      {unreadCount > 0 && (
        <span
          title="নতুন অর্ডার"
          className={`inline-flex min-w-[18px] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
            active ? "bg-white text-brand-600" : "bg-brand-500 text-white"
          }`}
        >
          {formatCount(unreadCount)}
        </span>
      )}
      {pendingCount > 0 && (
        <span
          title="অপেক্ষমান অর্ডার"
          className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-bold leading-none ${
            active
              ? "border-white/40 bg-white/15 text-white"
              : "border-amber-400/40 bg-amber-400/10 text-amber-300"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-amber-300" : "bg-amber-400"}`} />
          {formatCount(pendingCount)}
        </span>
      )}
    </span>
  );
}
