"use client";

import { useEffect, useRef } from "react";
import { formatTaka } from "@/lib/format";

// Resolved client-side so server components can pass a plain string instead
// of a function reference (functions can't cross the server->client boundary).
type FormatMode = "taka" | "number";

const FORMATTERS: Record<FormatMode, (n: number) => string> = {
  taka: formatTaka,
  number: (n) => String(Math.round(n)),
};

/**
 * Counts from the previous value to `value` with an ease-out curve.
 * `format` is applied to every frame (defaults to plain rounding) so
 * currency/bangla-digit formatting animates naturally.
 */
export function AnimatedNumber({
  value,
  format = "number",
  duration = 650,
  className,
}: {
  value: number;
  format?: FormatMode;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const fromRef = useRef(0);
  const formatRef = useRef(FORMATTERS[format]);

  // Keep the latest formatter without re-running the count-up effect.
  useEffect(() => {
    formatRef.current = FORMATTERS[format];
  }, [format]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fmt = formatRef.current;
    const from = fromRef.current;
    if (from === value) {
      el.textContent = fmt(value);
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = fmt(value);
      fromRef.current = value;
      return;
    }

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const current = from + (value - from) * eased;
      el.textContent = fmt(current);
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        fromRef.current = value;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <span ref={ref} className={className}>{FORMATTERS[format](0)}</span>;
}
