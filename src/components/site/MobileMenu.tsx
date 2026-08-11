"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Heart, Loader2, LogOut, Menu, UserRound, X } from "lucide-react";
import { getCategoryIcon } from "@/lib/icon-map";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import { useWishlistCount } from "@/lib/wishlist";
import { toBanglaDigits } from "@/lib/format";
import { signOutUser } from "@/lib/supabase/client";
import { getUserDisplayName, getUserInitial, type PublicUser } from "@/lib/user-display";
import { SearchBar } from "./SearchBar";
import { SiteLogo } from "./SiteLogo";

type Category = { slug: string; nameBn: string; icon: string };

export function MobileMenu({
  categories,
  user,
}: {
  categories: Category[];
  user: PublicUser;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const wishlistCount = useWishlistCount();
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  useBodyScrollLock(open);

  async function handleSignOut() {
    setSigningOut(true);
    await signOutUser();
    setSigningOut(false);
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    if (panel) panel.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      restoreFocusRef.current?.focus();
      restoreFocusRef.current = null;
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        aria-label="মেনু খুলুন"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="press flex items-center justify-center rounded-lg p-2 text-white transition hover:bg-white/10"
      >
        <Menu className="h-6 w-6" />
      </button>

      <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
        <div
          className={`drawer-overlay absolute inset-0 bg-navy-950/50 backdrop-blur-sm ${
            open ? "is-open" : ""
          }`}
          onClick={() => setOpen(false)}
        />

        <div
          ref={panelRef}
          tabIndex={-1}
          className={`mmenu-panel absolute left-0 top-0 flex h-full w-[82%] max-w-sm flex-col overflow-y-auto bg-cream-50 shadow-2xl focus:outline-none ${
            open ? "is-open" : ""
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="মেনু"
        >
          <div className="flex items-center justify-between bg-navy-900 px-4 py-4">
            <SiteLogo className="h-8" />
            <button
              aria-label="বন্ধ করুন"
              onClick={() => setOpen(false)}
              className="press rounded-lg p-1.5 text-white transition hover:bg-white/10"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="p-4">
            <SearchBar />
          </div>
          <nav className="flex flex-col gap-1 px-2 pb-6">
            <div className="mmenu-item mb-1 px-3 pb-1 pt-2" style={{ "--i": 0 } as React.CSSProperties}>
              {user ? (
                <div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500 text-base font-bold text-white">
                    {getUserInitial(user)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink-900">{getUserDisplayName(user)}</p>
                    {user.email && <p className="truncate text-xs text-ink-500">{user.email}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={signingOut}
                    aria-label="লগ আউট"
                    className="press rounded-lg p-2 text-red-500 transition hover:bg-red-50 disabled:opacity-60"
                  >
                    {signingOut ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="h-4 w-4" strokeWidth={1.8} />
                    )}
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-ink-900 transition hover:bg-cream-200"
                >
                  <span className="flex items-center gap-3">
                    <UserRound className="h-5 w-5 text-navy-600 transition-transform duration-300 group-hover:scale-110" strokeWidth={1.8} />
                    লগইন / সাইন আপ
                  </span>
                  <ChevronRight className="h-4 w-4 text-ink-300 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
              )}
            </div>

            <p
              className="mmenu-item px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-ink-500"
              style={{ "--i": 1 } as React.CSSProperties}
            >
              ক্যাটাগরি সমূহ
            </p>
            {categories.map((category, i) => {
              const Icon = getCategoryIcon(category.icon);
              return (
                <Link
                  key={category.slug}
                  href={`/category/${category.slug}`}
                  onClick={() => setOpen(false)}
                  className="mmenu-item group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-ink-900 transition hover:bg-cream-200"
                  style={{ "--i": i + 2 } as React.CSSProperties}
                >
                  <span className="flex items-center gap-3">
                    <Icon
                      className="h-5 w-5 text-teal-600 transition-transform duration-300 group-hover:scale-110"
                      strokeWidth={1.8}
                    />
                    {category.nameBn}
                  </span>
                  <ChevronRight className="h-4 w-4 text-ink-300 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
              );
            })}

            <div className="mt-2 border-t border-cream-200 pt-2">
              <Link
                href="/wishlist"
                onClick={() => setOpen(false)}
                className="mmenu-item group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-ink-900 transition hover:bg-cream-200"
                style={{ "--i": categories.length + 2 } as React.CSSProperties}
              >
                <span className="flex items-center gap-3">
                  <Heart className="h-5 w-5 text-red-500 transition-transform duration-300 group-hover:scale-110" strokeWidth={1.8} />
                  পছন্দের তালিকা
                  {wishlistCount > 0 && (
                    <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                      {toBanglaDigits(wishlistCount)}
                    </span>
                  )}
                </span>
                <ChevronRight className="h-4 w-4 text-ink-300 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
