"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, User, UserRound } from "lucide-react";
import { signOutUser } from "@/lib/supabase/client";
import { getUserDisplayName, getUserInitial, type PublicUser } from "@/lib/user-display";

export function AccountMenu({ user }: { user: PublicUser }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function handleSignOut() {
    setSigningOut(true);
    await signOutUser();
    setSigningOut(false);
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  if (!user) {
    return (
      <Link
        href="/login"
        aria-label="লগইন করুন"
        data-ripple
        className="ripple-host press flex flex-col items-center gap-0.5 rounded-lg px-2.5 py-1.5 text-white transition hover:bg-white/10"
      >
        <User className="h-6 w-6" strokeWidth={1.8} />
        <span className="hidden text-xs font-medium sm:block">লগইন</span>
      </Link>
    );
  }

  const name = getUserDisplayName(user);
  const initial = getUserInitial(user);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="অ্যাকাউন্ট মেনু"
        data-ripple
        className="ripple-host press flex flex-col items-center gap-0.5 rounded-lg px-2.5 py-1.5 text-white transition hover:bg-white/10"
      >
        <span className="relative">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
            {initial}
          </span>
          <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-navy-900 bg-teal-500" />
        </span>
        <span className="hidden max-w-16 truncate text-xs font-medium sm:block">{name}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="menu-pop absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-cream-200 bg-white shadow-2xl shadow-navy-950/20"
        >
          <div className="border-b border-cream-100 bg-cream-50 px-4 py-3">
            <p className="truncate text-sm font-semibold text-ink-900">{name}</p>
            {user.email && <p className="mt-0.5 truncate text-xs text-ink-500">{user.email}</p>}
          </div>
          <div className="p-1.5">
            <Link
              href="/account"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 transition hover:bg-cream-100"
            >
              <UserRound className="h-4 w-4" strokeWidth={1.8} />
              আমার অ্যাকাউন্ট
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
            >
              {signingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" strokeWidth={1.8} />
              )}
              লগ আউট
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
