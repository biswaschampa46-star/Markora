"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";

function resetScroll() {
  const html = document.documentElement;
  const prev = html.style.scrollBehavior;
  html.style.scrollBehavior = "auto";
  window.scrollTo(0, 0);
  html.style.scrollBehavior = prev;
}

/**
 * Wraps page content. On every route change the subtree is re-keyed so the
 * CSS `.page-enter` animation replays (fade + rise + de-blur). Scroll is
 * snapped to the top for push/replace navigations, but left alone on
 * back/forward so the browser's native scroll restoration wins.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const nav = (
      window as unknown as {
        navigation?: {
          addEventListener: (
            type: "navigate",
            cb: (e: { navigationType: string }) => void,
          ) => void;
          removeEventListener: (
            type: "navigate",
            cb: (e: { navigationType: string }) => void,
          ) => void;
        };
      }
    ).navigation;

    if (nav && typeof nav.addEventListener === "function") {
      const onNavigate = (e: { navigationType: string }) => {
        if (e.navigationType === "traverse") return; // back/forward
        resetScroll();
      };
      nav.addEventListener("navigate", onNavigate);
      return () => nav.removeEventListener("navigate", onNavigate);
    }

    resetScroll();
  }, [pathname]);

  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
}
