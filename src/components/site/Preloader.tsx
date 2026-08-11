"use client";

import { useEffect, useState } from "react";
import { SiteLogo } from "./SiteLogo";

/**
 * Full-screen brand intro shown once on the first page load.
 * Pure CSS animation; unmounts itself after the curtain lifts.
 */
export function Preloader() {
  const [phase, setPhase] = useState<"show" | "hide" | "gone">("show");

  useEffect(() => {
    const showOnThisVisit = () => {
      try {
        if (window.sessionStorage.getItem("markora-preloader-shown")) return false;
        window.sessionStorage.setItem("markora-preloader-shown", "1");
        return true;
      } catch {
        return true;
      }
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !showOnThisVisit()) {
      const t = window.setTimeout(() => setPhase("gone"), 0);
      return () => window.clearTimeout(t);
    }
    const t1 = window.setTimeout(() => setPhase("hide"), 1250);
    const t2 = window.setTimeout(() => setPhase("gone"), 1900);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div className={`preloader ${phase === "hide" ? "is-done" : ""}`} aria-hidden="true">
      <div className="flex flex-col items-center gap-6">
        <div className="pl-letter">
          <SiteLogo className="h-16" priority />
        </div>
        <div className="pl-bar">
          <i />
        </div>
        <p className="pl-tag text-xs tracking-wide text-cream-200/70">
          বাংলাদেশের বিশ্বস্ত অনলাইন শপ
        </p>
      </div>
    </div>
  );
}
