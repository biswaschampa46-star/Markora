"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const el = parallaxRef.current;
        if (!el) return;
        const y = window.scrollY;
        if (y < window.innerHeight) {
          el.style.transform = `translateY(${(y * 0.08).toFixed(1)}px)`;
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-teal-700">
      {/* Ambient blobs */}
      <div className="blob left-[-120px] top-[-80px] h-72 w-72 bg-brand-500/30" />
      <div
        className="blob bottom-[-100px] right-[-80px] h-80 w-80 bg-teal-500/25"
        style={{ animationDelay: "-6s" }}
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 py-10 sm:py-14 lg:grid-cols-2 lg:px-8 lg:py-20">
        <div>
          <span className="hero-fade inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-brand-400" style={{ "--d": "80ms" } as React.CSSProperties}>
            বাংলাদেশের বিশ্বস্ত অনলাইন শপ
          </span>
          <h1
            className="hero-fade mt-4 text-[clamp(1.8rem,4.5vw,3rem)] font-extrabold leading-tight text-white"
            style={{ "--d": "200ms" } as React.CSSProperties}
          >
            <span className="gradient-shift">Markora</span> তে পাবেন প্রয়োজনীয় সব পণ্য, এক
            জায়গায়
          </h1>
          <p
            className="hero-fade mt-4 max-w-md text-sm leading-relaxed text-cream-200/90 sm:text-base"
            style={{ "--d": "340ms" } as React.CSSProperties}
          >
            ইলেকট্রনিক্স থেকে শুরু করে ফ্যাশন, হোম অ্যান্ড লিভিং পর্যন্ত—নিরাপদ পেমেন্ট এবং ক্যাশ অন
            ডেলিভারি সুবিধায় অর্ডার করুন ঘরে বসেই।
          </p>
          <div
            className="hero-fade mt-6 flex flex-wrap gap-3"
            style={{ "--d": "480ms" } as React.CSSProperties}
          >
            <Link
              href="#categories"
              className="ripple-host press flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-500/25"
            >
              কেনাকাটা শুরু করুন
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                strokeWidth={2.2}
              />
            </Link>
            <Link
              href="/about"
              className="ripple-host press flex items-center gap-2 rounded-lg border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              আমাদের সম্পর্কে জানুন
            </Link>
          </div>
        </div>

        <div
          className="hero-fade relative mx-auto aspect-[4/3] w-full max-w-lg"
          style={{ "--d": "320ms" } as React.CSSProperties}
        >
          <div ref={parallaxRef} className="h-full w-full will-change-transform">
            <div className="float-slow h-full w-full">
            <div className="relative h-full w-full overflow-hidden rounded-2xl shadow-2xl shadow-navy-950/40 ring-1 ring-white/10">
              <Image
                src="/images/hero-banner.svg"
                alt="Markora অনলাইন শপিং"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
