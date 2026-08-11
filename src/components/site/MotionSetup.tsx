"use client";

import { useEffect } from "react";

/**
 * Mounted once at the layout level. Delegates:
 *  - ripple feedback for every `[data-ripple]` element,
 *  - subtle 3D tilt for every `[data-tilt]` card (mouse only).
 * Works across SPA navigations because events are captured at document level.
 */
export function MotionSetup() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const onPointerDown = (e: PointerEvent) => {
      if (reduced.matches) return;
      const host = (e.target as HTMLElement).closest<HTMLElement>("[data-ripple]");
      if (!host) return;
      const rect = host.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.1;
      const span = document.createElement("span");
      span.className = "ripple";
      span.style.width = span.style.height = `${size}px`;
      span.style.left = `${e.clientX - rect.left - size / 2}px`;
      span.style.top = `${e.clientY - rect.top - size / 2}px`;
      host.appendChild(span);
      window.setTimeout(() => span.remove(), 650);
    };

    let raf = 0;
    const onPointerMove = (e: PointerEvent) => {
      if (reduced.matches || e.pointerType !== "mouse") return;
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-tilt]");
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `perspective(900px) rotateX(${(-py * 5).toFixed(2)}deg) rotateY(${(
          px * 5
        ).toFixed(2)}deg) translateY(-4px)`;
      });
    };

    const onPointerOut = (e: PointerEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-tilt]");
      if (el) el.style.transform = "";
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("pointermove", onPointerMove, true);
    document.addEventListener("pointerout", onPointerOut, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("pointermove", onPointerMove, true);
      document.removeEventListener("pointerout", onPointerOut, true);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
