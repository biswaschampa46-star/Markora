"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

type Variant = "up" | "down" | "left" | "right" | "blur" | "scale";

/**
 * Scroll-reveal wrapper. Content is visible by default (no-JS safe, no flash).
 * On mount, elements that are below the viewport get `.reveal-hidden` and are
 * revealed (fade/slide/blur in) once scrolled into view. `delay` staggers
 * siblings.
 */
export function Reveal({
  children,
  variant = "up",
  delay = 0,
  className = "",
  style,
}: {
  children: ReactNode;
  variant?: Variant;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Only animate elements that start below the fold — above-fold content
    // stays visible instantly with zero flicker.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) return;

    el.classList.add("reveal-hidden");

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.remove("reveal-hidden");
            el.classList.add("is-visible");
            io.disconnect();
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-reveal={variant}
      className={className}
      style={{ "--reveal-delay": `${delay}ms`, ...style } as CSSProperties}
    >
      {children}
    </div>
  );
}
