"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
  const [show, setShow] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setShow(y > 420);
      setProgress(max > 0 ? Math.min(1, y / max) : 0);
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        update();
      });
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const circumference = 2 * Math.PI * 18;

  return (
    <button
      type="button"
      aria-label="উপরে যান"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`backtop group fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-navy-900 text-white shadow-lg shadow-navy-950/30 transition-colors hover:bg-navy-800 sm:bottom-6 sm:right-6 ${
        show ? "is-show" : ""
      }`}
    >
      <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 44 44" aria-hidden="true">
        <circle
          cx="22"
          cy="22"
          r="18"
          fill="none"
          stroke="rgb(255 255 255 / 0.15)"
          strokeWidth="2.5"
        />
        <circle
          cx="22"
          cy="22"
          r="18"
          fill="none"
          stroke="var(--color-brand-500)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          style={{ transition: "stroke-dashoffset 0.2s linear" }}
        />
      </svg>
      <ArrowUp
        className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5"
        strokeWidth={2.2}
      />
    </button>
  );
}
